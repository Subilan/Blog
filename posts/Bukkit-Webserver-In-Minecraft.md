---
date: 2021/10/23
desc: 也许是与服务器直接通讯的较好方式。
---

# Bukkit 实现 MC 服务器里的 HTTP 服务器

最近在写 [seatide](https://github.com/seatidemc) 相关项目的时候，遇到了一个需要直接与服务器进行交互的需求。具体来说，就是通过指令来获取服务器的各种信息，因为指令能干的东西很多，这样做很方便。起初我以为这个需求的实现很简单，因为有一个叫 [RCON](https://wiki.vg/RCON) 的东西存在（*虽然说在使用之前就有听说这个东西问题很多*）。

我很快就用第三方库在 API 上做了一个简单的实现，使用起来是正常的，但是却存在一个致命问题——它的发包（回复）逻辑不是很正常。具体的发包细节可以在上面的 *RCON* 链接指向的 Wiki 中看到，我遇到的问题简单来说就是

- 它返回的包有大小限制，如果超出，会被直接截断，并返回最后一个包
  - 这与我所想要的效果——完整的结果相违背。
- 因为某种原因，没有超过大小限制的时候也会出现截断的问题 *(?)*
- 多个对 RCON 的请求的返回使用的却是同一个 output stream，导致其返回的信息可能重叠
- RCON 太老了

经过调查发现这是其自身的弊病，并不能通过简单的调整来解决。于是我就想，能不能抛弃 RCON，而像 RESTful API 那样使用 HTTP 请求直接获取 Minecraft 内的各项信息。

我以前没有用 Java 写过任何有关 web 方面的内容，所以对这方面根本不算了解。经过搜索，发现大多数实现都是依赖一些较大型的库。而的确有一些小型的库似乎能够满足我的需求，但却又因为种种原因没有办法正常使用，对于 `sun` 包底下自带的服务器，就更不用说了。

于是我就更偏向于一些纯手写代码的方法——然而受制于个人能力，并不能写出一个具有*自己可以信任的性能和稳定性*的实现。幸运的是，我找到了[这篇文章](http://tutorials.jenkov.com/java-multithreaded-servers/thread-pooled-server.html)，其介绍了一个简单的 Java 多线程+池 HTTP 服务器的实现。以下是从文章中直接摘录的完整代码内容。

```java
package servers;

import java.io.InputStream;
import java.io.OutputStream;
import java.io.IOException;
import java.net.Socket;


public class WorkerRunnable implements Runnable{

    protected Socket clientSocket = null;
    protected String serverText   = null;

    public WorkerRunnable(Socket clientSocket, String serverText) {
        this.clientSocket = clientSocket;
        this.serverText   = serverText;
    }

    public void run() {
        try {
            InputStream input  = clientSocket.getInputStream();
            OutputStream output = clientSocket.getOutputStream();
            long time = System.currentTimeMillis();
            output.write(("HTTP/1.1 200 OK\n\nWorkerRunnable: " + this.serverText + " - " + time + "").getBytes());
            output.close();
            input.close();
            System.out.println("Request processed: " + time);
        } catch (IOException e) {
            // report exception somewhere.
            e.printStackTrace();
        }
    }
}
```

```java
package servers;

import java.net.ServerSocket;
import java.net.Socket;
import java.io.IOException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class ThreadPooledServer implements Runnable {

    protected int          serverPort    = 8080; // 指定端口
    protected ServerSocket serverSocket  = null;
    protected boolean      isStopped     = false;
    protected Thread       runningThread = null;
    protected ExecutorService threadPool = Executors.newFixedThreadPool(10); // 指定进程池大小

    public ThreadPooledServer(int port){
        this.serverPort = port;
    }

    public void run(){
        synchronized(this) {
            this.runningThread = Thread.currentThread();
        }
        openServerSocket();
        while(!isStopped()){
            Socket clientSocket = null;
            try {
                clientSocket = this.serverSocket.accept();
            } catch (IOException e) {
                if (isStopped()) {
                    System.out.println("Server Stopped.") ;
                    break;
                }
                throw new RuntimeException("Error accepting client connection", e);
            }
            this.threadPool.execute(
                new WorkerRunnable(clientSocket, "Thread Pooled Server"));
        }
        this.threadPool.shutdown();
        System.out.println("Server Stopped.") ;
    }


    private synchronized boolean isStopped() {
        return this.isStopped;
    }

    public synchronized void stop(){
        this.isStopped = true;
        try {
            this.serverSocket.close();
        } catch (IOException e) {
            throw new RuntimeException("Error closing server", e);
        }
    }

    private void openServerSocket() {
        try {
            this.serverSocket = new ServerSocket(this.serverPort);
        } catch (IOException e) {
            throw new RuntimeException("Cannot open port 8080", e);
        }
    }
}
```

要运行它，新开一个线程即可。

```java
var server = new ThreadPooledServer(26656);
new Thread(server).start();

// 关闭可以调用实例方法
server.stop();
```

看上去不错。它是异步的，有助于与 Minecraft 服务器本身解除一些可见的性能上的联系，而且可以利用 thread pool 限制最大连接个数。也许它并没有那么稳定，但似乎已经够用了。

于是我就对其进行了魔改。我们可以看到对 HTTP 请求的主要处理一种在 `WorkerRunnable` 内。

```java
try {
    InputStream input  = clientSocket.getInputStream();
    OutputStream output = clientSocket.getOutputStream();
    long time = System.currentTimeMillis();
    output.write(("HTTP/1.1 200 OK\n\nWorkerRunnable: " + this.serverText + " - " + time + "").getBytes());
    output.close();
    input.close();
    System.out.println("Request processed: " + time);
    } catch (IOException e) {
    // report exception somewhere.
    e.printStackTrace();
}
```

其中 `input` 为输入流，为发送来的内容；`output` 为输出流，为要返回的内容。首先，我们对其进行一个简单的简化。

```java
var in = new BufferedReader(new InputStreamReader(input));
var out = new BufferedWriter(new OutputStreamWriter(output));
var body = new StringBuilder();
var header = new StringBuilder();
```

然后开始获取我们所需要的信息——`header` 和 `body`。

```java
String headerRaw;
try {
    // 先读 header 部分内容到 header
    // 注：x.isEmpty() 是 Java 11 的方法，相当于 x.length() == 0
    while (!(headerRaw = in.readLine()).isEmpty()) {
        header.append(headerRaw);
    }
} catch (NullPointerException e) {
    // 当遇到一个空行（代表着 header 的结束）的时候，就会触发这个 NPE，此时不处理即可。
}
while (in.ready()) {
    // 接下来读的就全部是 body 部分了
    body.append((char) in.read());
}
```

于是我们就将发来的请求读成了字符串。完整的请求内容大概是这样的。

```
POST /
User-Agent: ...
Content-Type: ...
Content-Length: ...
（这里是一个空行，从此处隔开）
{"type": "get", "params": {"name": "ram"}}
```

:::tip
前端发来的请求内容的格式是事先约定好的，在本文中使用以下格式举例：
```javascript
{
    type: "get",
    params: {
        name: "ram",
        target: "xxx",
        anyParam: "abc"
    }
}
```
:::

现在 `header` 和 `body` 变量里分别存有空行前和空行后的完整字符串内容。要获取发来的信息，将 `body` 转换为 `JSONObject` 即可。

```java
var object = new JSONObject(body.toString());
object.getString("type").equals("get") // -> true
```

下面就可以根据从 `object` 中获得的信息进行相应的处理了。例如约定获取服务器 RAM 使用情况的请求内容如下：

```javascript
{
    type: "get",
    params: {
        name: "ram"
    }
}
```

处理的逻辑可以这样写

```java
var type = object.getString("type");
var params = object.getJSONObject("params");
var name = params.getString("name");

// 使用 switch 代表着当前的键（比如 "type"）可以由多个值（比如 "get", "delete"）来确定含义
switch (type) {
    case "get": {
        switch (name) {
            case "ram": {
                var json = new JSONObject();
                var runtime = Runtime.getRuntime();
                json.put("used", (runtime.maxMemory() - runtime.freeMemory()) / 1024L / 1024L);
                json.put("max", runtime.maxMemory() / 1024L / 1024L);
                // 返回 json 数据
            }
            // ...
        }
    }
    // ...
}
```

这样我们就构建了后端的处理模式。下面要解决的就是返回请求的问题。之前读取请求使用的是 `BufferedReader`，此时我们就要用上 `BufferedWriter`。

```java
var codeInfo = "200 OK";
var result = json.toString();
// header 内容
out.write("HTTP/1.1 " + codeInfo + "\r\n");
out.write("Content-Type: application/json;charset=UTF-8\r\n");
out.write("Date: " + (new Date()).toString() + "\r\n");
// 空行分隔
out.write("\r\n");
// body 内容
out.write(result);
```

其中 `body` 部分就是发送者想要的结果了，直接将我们上面封装的 JSON 对象转为字符串即可。在 `out` 写完以后，需要手动使用 `out.flush()` 方法强制将当前写入的内容返回。所以整体的代码看上去应该是这样的：

```java{33}
var in = new BufferedReader(new InputStreamReader(input));
var out = new BufferedWriter(new OutputStreamWriter(output));
var body = new StringBuilder();
var header = new StringBuilder();

/******************************/
/* 省略：读取 body 和 header */
/******************************/

// 处理请求并整合信息
var object = new JSONObject(body.toString());
var type = object.getString("type");
var params = object.getJSONObject("params");
var name = params.getString("name");
var json = new JSONObject();
switch (type) {
    case "get": {
        switch (name) {
            case "ram": {
                // 在这里封装返回信息
                json.put(/* ... */)
            }
        }
    }
}
var codeInfo = "200 OK"; // 可变
var result = json.toString(); // 可变
out.write("HTTP/1.1 " + codeInfo + "\r\n");
out.write("Content-Type: application/json;charset=UTF-8\r\n");
out.write("Date: " + (new Date()).toString() + "\r\n");
out.write("\r\n");
out.write(result);
out.flush(); // 强制返回信息

// 关闭 BufferedReader/Writer 和 Stream
out.close();
in.close();
input.close();
output.close();
```

经过实现可以得到下面的返回结果。

![](https://i.loli.net/2021/10/23/AnGtp19lXQJHRC7.png)

就这样一个 HTTP 服务器在 StackOverflow 式的搜索下实现了，并且能够与外界产生直接的交流。由于可以指定端口，并不需要太担心服务器商相关限制。如果你有兴趣查看完整的实现代码，可以移步 [Remote 插件的仓库](https://github.com/seatidemc/Remote)。