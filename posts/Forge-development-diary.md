---
hidden: true
date: 2023/07/02
desc: 面向搜索编程
cate: 代码
---

# Forge 开发日志（一）

Forge 在此前总是给了我一种类似于 modding API 的错觉，而当我真正开始写 Forge 模组的时候，我才发现其实大部分时候都是在和 NMS 打交道，也就是 `net.minecraft.server`。这就自然而然带来了一个极为令人头疼的问题：没有文档。Forge 官方的文档，只能说是在自说自话，但也确实是介绍了一些 Forge 自身的申必概念，比如 *Capability*，这个词看来是完全没办法翻译成中文了。

回到正题来，在 Bukkit 上对 NMS 的访问并不是没有，但是经常被视作是应当避免的。这也是可以理解的，因为借助[反射]的方式在运行时修改内部逻辑，不仅问题会很多，代码也会很 dirty。即使这样，一些插件依然得以实现向游戏中添加一些带有新的材质的方块，但是很显然——都是采用了间接的方式，极容易出问题。拿 ItemAdder 来说，它添加的方块并不是独立的个体，而是由对某种方块的修改得来。我们可以猜到这是因为 API 的限制。这种间接创造新方块的方法直接将运行时稳定性托付给了这种方块自身。一旦该方块满足某些特性，被某些其它插件利用时，就会发生一系列不可见的冲突。这就是一种不可调和的 dirty modding。

那么如果想要从游戏本体的层面真正地添加东西进去，甚至添加模型、添加音乐，让游戏自身变得截然不同，就不得不用到 Forge 之类的 API 了。

在使用的过程中，首先面临的问题就是文档的缺乏，加上论坛的不发达。这让一些函数的使用非常的费解。不过，还是先聊聊收获吧。下面列出了最近几天我在使用 Forge 写一个与 MC 本体并无过大关联的模组的过程中，一些收获和见解。这些东西都难以在文档中看见，只能自己总结——也是没谁了。

## 1. Server 实例在哪里？

在 Bukkit 中，每当我们需要获得一些有关于 server 的参数或者做一些操作的时候，都需要用到 Server 实例。这一点，在 Bukkit 中是直接提供的。

```java
var server = Bukkit.getServer();
```

可是当我天真的想要找 `Forge#getServer()` 的时候，发现怎么找也找不到。后来才发现*通常*的做法就是间接获取。可以从某个*偶然*得到的对象，例如 `ServerPlayer`、`Entity` 等，中调用 `getServer` 方法。为了代码不至于过于迷惑，我突然想到了服务器开启的事件，以及该事件对应的 target（js 说法）。于是通过下面的方法成功获得了，Server 实例。

```java
public class Main {
    public static MinecraftServer server = null;
    public static boolean ready = false;
}

public class Events {
    @SubscribeEvent // 在 Forge 中，连监听事件你甚至都能玩出花来
    public static void serverStarted(ServerStartedEvent e) {
        Main.server = e.getServer();
        Main.ready = true;
        log.info("SeatiCore has got the server instance.");
    }
}
```

### 连监听事件你甚至都能玩出花来

此话怎讲？从[官方文档](https://docs.minecraftforge.net/en/1.20.x/events/intro/)中看来，这些没用的东西倒是可以整挺多，介绍挺详细的。

**eg1. Event Handler**

```java
public class MyForgeEventHandler {
    @SubscribeEvent
    public void pickupItem(EntityItemPickupEvent event) {
        System.out.println("Item picked up!");
    }
}
```

**eg2. Static Event Handler**

```java
public class MyStaticForgeEventHandler {
    @SubscribeEvent
    public static void arrowNocked(ArrowNockEvent event) {
        System.out.println("Arrow nocked!");
    }
}
```

**eg3. Automatically Registering**

```java
@Mod.EventBusSubscriber(Dist.CLIENT)
public class MyStaticClientOnlyEventHandler {
    @SubscribeEvent
    public static void drawLast(RenderWorldLastEvent event) {
        System.out.println("Drawing!");
    }
}
```

这其实还不是完全形态。对于 Forge 的这种魔幻侧重点和 API 设计，我不好多说什么。

## 2. 迷惑就完事了

虽然我本人对 Java 的理解和掌握程度仅限于能抄抄代码运行一下的样子，但是我还是想说有些操作还是太迷惑了。不全是 Forge 的锅。

猜猜看下面的代码是用来干什么的？

```java
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.fml.IExtensionPoint;
import net.minecraftforge.fml.ModLoadingContext;
import net.minecraftforge.fml.common.Mod;
import net.minecraftforge.network.NetworkConstants;

// Make sure the mod being absent on the other network side does not cause the client to display the server as incompatible
ModLoadingContext.get()
.registerExtensionPoint(
    IExtensionPoint.DisplayTest.class,
    () -> new IExtensionPoint.DisplayTest(
        () -> NetworkConstants.IGNORESERVERONLY,
        (a, b) -> true
    )
);
```

没错！它是用来避免*单侧模组*被错误处理哒！

> This tells the client that it should ignore the server version being absent, and the server that it should not tell the client this mod should be present. So this snippet works both for client- and server-only-sided mods.

起初我是在 FTB 系列的某个模组中看到了它，我还寻思模组水平要求的确蹭蹭上来了。看了文档以后才发现，唯一的方法就是复读。