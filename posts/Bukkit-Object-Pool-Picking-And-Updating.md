---
desc: 555555原来 Bukkit 是个巨坑！
date: 2020/07/31
cate: 代码
---

# Bukkit 实现对象池随机抽取和定时更新

:::tip 前置说明

标题中的「对象池」并不是什么新的、高深的名词，而是代表一个「包含了一系列物体」的池。例如卡池、任务池。只有在池存在的情况下，才会有「抽取」这样的操作。为了叙述方便，本文将对象设定为「任务」，围绕一个任务插件来展开讨论。
:::

最近入手了一个新的 Bukkit 项目，[MissionTap](//github.com/sotapmc/MissionTap)。由于我还是一个 Bukkit 萌新，所以要时刻写文章来反馈给自己进度，~~以及水一些内容~~。在这篇文章里，大概从两个方面进行叙述：

- 从池中抽取对象，并独立存储在*另一个位置*。
- 设计一种模式以便对对象定时刷新。

要理解为什么要这样做，我们需要先了解一些背景。

这个插件的用途，是根据池的内容，定时随机抽取一部分作为任务发放给玩家，其中这些任务的个数均为定值。任务可以分为每日任务、每周任务两种，每日任务需要每日刷新，每周任务需要每周刷新。当然，上述只是针对该项目的需求，实际上在阅读完文章后可以根据其抽象逻辑实现自己的要求。

## 建立对象池

对象池该如何建立呢？最基本地，我们可以想到 Bukkit 经常使用到的 Yaml。因为毕竟 Bukkit 中与外部（文件）进行数据交互基本上都是基于 Yaml，如有不同意见请[指正](//github.com/Subilan/subilan.github.io/issues)。这个问题很好解决，我们只需要为我们的插件引入一个新的文件即可，就用这个文件来作为我们的「池」。

```java
package win.subilan.ExamplePlugin;

// import 部分省略

public final class ExamplePlugin extends JavaPlugin {
    
    // 前面的 onEnable 之类的后面再说
    
    public FileConfiguration load(String filename) {
        // 获取当前插件所用的数据目录，也就是 config.yml 默认所在的位置
        File folder = getDataFolder();
        // new 一个 File 出来，很简单
        File file = new File(folder, filename);
        // 离奇！如果这个文件夹不存在的话，还是帮忙创建一下
        if (!folder.exists()) {
            folder.mkdir();
        }
        // 如果文件不存在的话，就创建一个新的文件，这是正常的
        if (!file.exists()) {
            try {
                file.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        // 然后返回这个文件
        return YamlConfiguration.loadConfiguration(file);
    }
}
```

上面这个函数就是一个基本的 Yaml 文件加载函数，而且有双重用途。由于我们写了一个「如果文件不存在就创建」的逻辑，所以一般情况下我们不需要担心这个问题。在 `onEnable` 中，我们只需要这样写就可以获取到这个文件

```java
public void onEnable() {
    this.pool = load("pool.yml");
}
```

其中 `pool` 为 `FileConfiguration`。如果这个文件是刚刚被自动建立，那么此时的 `pool` 就是一个 `null`。这样，我们就建立起了我们的「池」，用户可以自己往池里面写东西。如果围绕这个插件来讲，我们需要创建两个池，一个用来存储每日任务，一个用来存储每周任务：

```java
this.dailyPool = load("daily-pool.yml");
this.weeklyPool = load("weekly-pool.yml");
```

:::tip
💡 如无额外说明，下文中所有的文件名、变量名都与上文保持一致
:::

至于内容究竟写什么，不是我们今天文章所探讨的范围。但是，我需要引用真正的插件中的格式，以便后文演示「从中随机抽取任务」。

```yml
object1:
    name: Mission 01
    lore:
        - Hello, this is Mission 01
        - Woooooooooooo~~ yeah!
    contents:
        trading: 900
        breeding:
            SHEEP: 99
            COW: 100
        collecting:
            DIAMOND: 10
```

这就是一个对象的基本格式。不过仅针对于上面的那个插件，实际情况下，我们可以自己规定格式。这对后文的处理没有任何影响，仅作例子使用。我们可以将这个格式视为一个单独的对象，当用户需要往池中添加对象时，就按照该格式进行编写即可。最终，我们将得到这样一个文件：

```yml
object1:
    # 格式...
object2:
    # 格式...
wdnmd:
    # 格式
# MORE!
```

为什么会有 `wdnmd` 这样的奇妙键名？在这里是为了说明每个对象中位于最高层的键（下文称顶级键）实际上除了标记以外任何用途。除非你愿意在这上面添加工序，一般情况下并无太大必要。

由此，我们便得到了一个池子。每个池子都是这样构成的。

## 抽取对象

要抽取对象，首先我们要从池子中获取对象。由于我们的抽取是全面的，因此应当一次性获取全部对象。

```java
FileConfiguration pool = load("daily-pool.yml");
```

但这还不够！我们需要将其放入一个 Java 类型中，以便我们进行操作。在这里我们需要首先梳理一下随机抽取的思路。

经过观察，我们发现 Bukkit 的 `FileConfiguration` 有两个关键方法：`getKeys(boolean)` 和 `getValues(boolean)`。至于这个 `boolean` 到底是干什么的，我们现在不需要知道。通过 Javadoc 可以得知它们的返回值一个是 `Map<String,Object>`，另一个是 `Set<String>`，因此我们认为**这绝对又是一场噩梦**。

为了能够让后续的流程不乱套，我们先将这两个值获取出来。

```java
Map<String,Object> objects = pool.getValues(false);
Set<String> keys = pool.getKeys(false);
```

由于 Java 中的 `Set` 类型在我们这个上下文中啥也不能干，我们需要将它转成 `List`。

```java
List<String> keyList = new ArrayList<>(keys);
```

你可能现在要想，既然我们已经有了 Map，为什么还要单独把键集获取出来？可以说的是，这里是顶级键唯一发挥作用的时刻。前文我们在建立池的时候，每一个对象前面都会有一个看似多余的顶级键，其实它的标记作用确定了这个对象在该文件中的「位置」。在这里，我们的 `keys` 里就是这些顶级键所构成的集合；我们的 `objects` 则是这些键下的具体内容。Map 的确同时具有键和值，在这里需要避免将 Map 的键与值和顶级键弄混。

既然顶级键标记了每个对象的位置，那么我们便可以通过随机取到这些键来随机取到它们对应的值。因为 Map 并不好操作，我们可以直接从 List `keyList` 入手。大致逻辑如下

```java
Random rand = new Random();
String randomKey = keyList.get(rand.nextInt(keyList.size()));
```

如果懂 `Random` 可以跳过这段话。在这里，`Random` 是（伪）随机数生成器，它在使用之前需要被实例化。它的实例有一个方法 `nextInt`，用于获取一个随机的整型。该方法的 Javadoc 叙述如下：

> Returns a pseudorandom, **uniformly distributed int value between 0 (inclusive) and the specified value (exclusive)**, drawn from this random number generator's sequence. The general contract of nextInt is that one int value in the specified range is pseudorandomly generated and returned. All bound possible int values are produced with (approximately) equal probability.

不需要把它完全读完，粗体部分就足够。`nextInt` 获取到的随机数是范围性的，其范围为 $0\leq{n}\lt{b}$，其中 $b$ 为其参数 `bound`。恰好，List 的顺序是从 `0` 开始的。

当我们有这样一个 List 时 $L = \{1,2,3,4,5,6\}$，它的大小 `L.size()` 为 6，Random 恰好为我们解决了 OutOfBound 的问题。由于随机数生成的范围只能是 $0\leq{n}\lt{b}$ 即 $0\leq{n}\lt{6}$，可能取的值只有 $P = \{0,1,2,3,4,5\}$

而该数组可取的最高位就是第 5 位（值为 $6$）。

接上文。我们从 keyList 中随机取到了一个键，接下来我们就可以用这个键来获取它对应的值——取键即取值。

```java
Object object = pool.get(randomKey);
```

很明显，上面我们获取到的 `Map<String,Object> objects` 被抛弃了。的确，它在我们这里并没有用途，因为我们的最终目的是获取「池」中的对象，而不是对象中的值。仍然介绍这个值是为了启发你，也许你会用它去干别的事（例如预处理数据）。

### 抽取多个对象

我们来汇总一下我们先前的代码：

```java {4-5}
FileConfiguration pool = load("daily-pool.yml");
List<String> keyList = new ArrayList<>(pool.getKeys(false));
Random rand = new Random();
String randomKey = keyList.get(rand.nextInt(keyList.size()));
Object object = pool.get(randomKey);
```

抽取多个对象，也就是从 `keyList` 中抽取多个键，只需要用到循环就可解决。我们从第四行开始改写：

```java
// 预先声明变量，避免重复
String randomKey;
Map<String,Object> results = new HashMap<>();
// 这里的数字就是你想要抽取对象的个数
while (results.size() < 4) {
    randomKey = keyList.get(rand.nextInt(keyList.size()));
    if (results.containsKey(randomKey)) continue;
    results.put(randomKey, pool.get(randomKey));
}
```

我们还是用到了 Map。在这里用 Map 有两个理由：

1. 使用 `containsKey` 方法来检测这个键是不是之前已经被随机到*
2. 后文中将抽取到的对象储存起来，高效的办法只有使用 Map

<small>* 由于该随机数的范围一般较小，所以被重复随机的概率不是没有。我们不愿意将重复的元素添加到 Map 中，因此要对其重复性进行检测。</small>

## 写入对象

若要写入对象，需要灵活运用 `FileConfiguration` 的方法。纵观前面我们进行的行为，实则是这样的

![](https://i.loli.net/2020/07/31/UPyv5s8I2EN4rkq.png)

也就是说我们只是把一个池内的对象抽到了另一个池（用户不可改变）里，文件内容、数据结构都是一样的。那么这就很好办了。

```java
public void onEnable() {
    this.resultPool = load("result-pool.yml")
}
```

首先我们创建一个用于存储挑选出来内容的 Yaml，即后文中的「存储池」。然后，我们开始写入。

```java
// 先清空先前生成的内容，因为每次生成都是覆盖性操作
resultPool.set("daily", null);
resultPool.createSection("daily", results)
```

没错，这就完事了。假设 object1 和 objectN 被选中，最终我们获取到的文件结构就是

```yml
# result-pool.yml
daily:
    object1:
        name: Mission 01
        lore:
            - Hello, this is Mission 01
            - Woooooooooooo~~ yeah!
        contents:
            trading: 900
            breeding:
                SHEEP: 99
                COW: 100
            collecting:
                DIAMOND: 10
    objectN:
        # 略
```

幸亏 Bukkit 提供了一个快捷的 `createSection` 方法。它的第一个参数是键名，也就是这里的 `daily`，第二个参数所要求的类型是 Map，恰好符合我们前面的 `results` 值类型，这也是为什么我们不去用其它类型。

至此，我们获得了随机从一个池抽取对象，然后写入到另一个用于存储的静态池的能力，实现逻辑阐述完毕。

## 定时更新的基本思路

我们的插件要求是对存储池定时更新。也就是我们需要定时对存储池的内容进行覆盖操作，保证在更新后的内容*大致*与先前不一样。

:::warning
在这里，我们无法保证两次获取到的 `results` Map 的内容完全不一样，也没有必要保证它们完全不一样——如果认为这样不合理，只能从根本模式上做出改变。
:::

这也是为什么前文中出现了 `resultPool.set("daily", null)` 这样一句。每次所生成的 Map 是**基于随机目的**的。因此如果不加以清空，将会变成积累操作，到最后一切都一样了。那么究竟该如何进行定时更新？如何判断现在该不该进行更新呢？

最简单的方法，就是在每一次将对象写入存储池时，同步地往池中写入下一次更新的时间。因为我们只有在每次写入的时候，才能知道下一次是什么时候，只有在这时将它记录下来，将来才能够使用。我们首先需要在 `config.yml` 中提供以下两项：

```yml
daily_refresh_time: 10
weekly_refresh_time: 6
```

这两项将成为我们实现该功能的核心依赖，它们规定了究竟应当在何时进行刷新。对于每日刷新的情况，只需要规定在一天的第几个小时（$0\leq{n}\leq{23}$）；对每周刷新的情况，只需要规定在一周的第几天（$1\leq{n}\leq{7}$，$1$ 代表星期日）。

接下来，让我们往上面的代码中添加内容。

## 定时更新的实现

```java
FileConfiguration pool = load("daily-pool.yml");
List<String> keyList = new ArrayList<>(pool.getKeys(false));
Random rand = new Random();
String randomKey;
Map<String,Object> results = new HashMap<>();
while (results.size() < 4) {
    randomKey = keyList.get(rand.nextInt(keyList.size()));
    if (results.containsKey(randomKey)) continue;
    results.put(randomKey, pool.get(randomKey));
}
resultPool.set("daily", null);
resultPool.createSection("daily", results)
```

在这个逻辑中，我们在 `while` 循环后面添加上携带下次更新时间的代码。

```java
resultPool.set("daily-next-refresh", getDailyNextRefreshDate());
// 注：第二个参数在下文中有变化
```

Weekly 也是同样。

这两个函数的实现大同小异，首先我们展示 Daily 的实现。为了叙述方便，我们的配置文件内容沿用上文中的

```yml
daily_refresh_time: 10
weekly_refresh_time: 6
```

即在每天的上午 10 时刷新每日池，在每个星期五刷新每周池。

### 每日池刷新

首先我们需要明确的一点是，**随机抽取并写入存储池的时间不是确定的**。你可能会认为，既然用户规定了刷新的时间，那么掌控刷新操作的函数一定是在那个时间被执行，那么只需要将下次刷新时间基于那次的时间进行推算（加 24 小时、加 7 天）即可，但这是不对的。至于为什么会发生这种情况，可以理解如下代码：

```java
public void onEnable() {
    this.pool = load("pool.yml");
    this.resultPool = load("result-pool.yml");
    // 如果存储池是空的
    if (resultPool == null) {
        // 忽略时间，直接生成随机对象并写入存储池
        generateRandomObjectsFromPool();
    } else {
        // 有条件地进行存储池刷新
        updateResultPool();
    }
}
```

我们无法推测用户是什么时候开启的服务器，因此需要在 `onEnable` 中加入一系列的验证。例如，当用户是第一次安装这个插件，存储池是空的，这个时候作为初始化操作，无论何时都应当生成随机对象并写入存储池。在这里，我们发现时间已经不是确定的了。同时，如果服务器长期处于关闭状态，又再一次开启，可能已经错过了上次的刷新时间，这时我们就需要进行补充刷新（如果你认为这个逻辑是多余的，可以去掉）。

那么我们就需要一个通用的函数，通过任意时间推算出下次的刷新时间。请看函数

```java
public static Date getDailyNextRefreshTime(FileConfiguration config) {
    Calendar cal = Calendar.getInstance();
    cal.setTime(new Date());
    Integer now = cal.get(Calendar.HOUR_OF_DAY);
    Integer refreshHour = config.getInt("daily_refresh_time");
    if (now >= refreshHour) {
        cal.add(Calendar.DATE, 1);
    }
    cal.set(Calendar.HOUR_OF_DAY, refreshHour);
    cal.set(Calendar.MINUTE, 0);
    cal.set(Calendar.SECOND, 0);
    return cal.getTime();
}
```

在这里我们需要用到两个工具：`Calendar` 和 `Date`。至于它们两个的区别，属于 Java 的基础内容，在这里不再供述，但仍会解释其大致作用。首先我们需要初始化一个 Calendar 对象

```java
Calendar cal = Calendar.getInstance();
```

:::tip
为什么不是 `new Calendar()`？因为 Calendar 是一个 abstract class，它不能被实例化。该 `getInstance()` 方法返回的实际上是一个叫做 `GregorianCalendar` 的实例。上述语句等同于 `Calendar cal = new GregorianCalendar();`
:::

然后将这个对象设置为**现在**的时间。

```java
cal.setTime(new Date());
```

接下来是推理环节。借助 Calendar 我们可以获取到当前的小时数。例如若现在是 `22:35`，小时数则为 `22`。在配置文件中，我们也规定了在每天的第几个小时刷新（标准刷新时间）。如果现在的小时数晚于或恰好为标准刷新时间（不太可能，因为有延迟和程序处理的时间），也就是说现在的刷新操作发生在标准刷新时间以后或恰好在标准刷新时间之时，那么下一次刷新必定在明天，所以我们将 Calendar 实例加上 1 天。

```java
// 获取当前小时数
Integer now = cal.get(Calendar.HOUR_OF_DAY);
// 获取标准刷新时间
Integer refreshHour = config.getInt("daily_refresh_time");
// 如果当前小时晚于或恰好等于标准刷新时间
if (now >= refreshHour) {
    cal.add(Calendar.DATE, 1);
}
```

而如果刷新操作处于标准刷新时间之前，是怎样一种情况？也许是首次安装插件以后，第一次启动时的强制初始化早于标准刷新时间；也许是很久没有开启服务器，打开服务器后由于时间远远晚于上次更新时写入的下次刷新时间而进行强制初始化。无论如何，这些初始化行为都无法影响到这一天的下一次刷新。因此，当发生这种情况时，一天内有两次刷新，因此不需要将 Calendar 实例加上 1 天，所以会在 `if` 的外面。

```java
// 必定：将下一次刷新时间的小时设置为配置文件中的值
cal.set(Calendar.HOUR_OF_DAY, refreshHour);
// 避免影响，将其余单位均设为 0（GregorianCalendar 最小单位是秒）
cal.set(Calendar.MINUTE, 0);
cal.set(Calendar.SECOND, 0);
// 返回一个 Date 类型
return cal.getTime();
```

以上便获取到了每日池的下次刷新时间。

### 每周池刷新

每周池的前一部分逻辑是一样的。

```java
public static Date getWeeklyNextRefreshTime(FileConfiguration config) {
    Calendar cal = Calendar.getInstance();
    cal.setTime(new Date());
    Integer today = cal.get(Calendar.DAY_OF_WEEK);
    Integer refreshDay = config.getInt("weekly_refresh_time");
    Integer nextWeekdayOffset = today < refreshDay ? refreshDay - today : refreshDay + 7 - today;
    cal.add(Calendar.DAY_OF_MONTH, nextWeekdayOffset);
    return cal.getTime();
}
```

甚至比 Daily 的逻辑要短。核心在于要获取一个 `nextWeekdayOffset` 偏移量，然后将这个偏移量作为天数，在今天的日期基础上做加法。

首先要获取今天是一周的第几天（星期日是第一天），然后获取配置文件的数据。

```java
Integer today = cal.get(Calendar.DAY_OF_WEEK);
Integer refreshDay = config.getInt("weekly_refresh_time");
```

如果现在早于标准刷新时间，那么下一次的刷新时间相对于今天的偏移量就是它们的差值。例如今天是星期一，标准刷新时间是星期五，那么偏移量就是 `4`。这就是三目表达式前部分的内容 `today < refreshDay ? refreshDay - today : ...`。如果今天恰好是标准刷新时间，或者今天晚于标准刷新时间，那么下一个刷新时间就在下个星期。

一般来讲，由于星期是七进制，如果我们要获取下一个星期（下一个七）的日期，我们通常会采取「加七」操作。在这里也是一样，我们将 `refreshDay` 加上七就可以获取到相对于 `refreshDay` 的每月首周体系的次周日期数值，这个词语看不懂没关系，因为是我随便写的。用 `refreshDay + 7` 得到的数值，再减去原 `today` 的值，就得到了今天相对于下一个星期的标准刷新时间的偏移量，再用日期加上该偏移量即可。这就是三目表达式的后部分内容 `... : refreshDay + 7 - today`。

```java
cal.add(Calendar.DAY_OF_MONTH, nextWeekdayOffset);
return cal.getTime()
```

在实际使用中，我们仅需获取时间戳进行存储：

```java
resultPool.set("daily-next-refresh", getDailyNextRefreshDate().getTime());
resultPool.set("weekly-next-refresh", getWeeklyNextRefreshDate().getTime());
```

读取时，判断当前的时间戳是否已经超过了先前写入的下次刷新时间的时间戳，如果是，则强制进行刷新。

```java
Long dailyNextRefresh = resultPool.getLong("daily-next-refresh");
Long weeklyNextRefresh = resultPool.getLong("weekly-next-refresh");
Long now = new Date().getTime();

if (now >= dailyNextRefresh) {
    // 强制刷新每日池
}

if (now >= weeklyNextRefresh) {
    // 强制刷新每周池
}
```

在这里便会出现上文中提到过的一周两次刷新、一天两次刷新的情况，其中一次刷新便是这里的强制刷新。

对于服务器长期处于开启状态的刷新，需要借助 `BukkitRunnable` 每秒进行检测，所执行的逻辑与上面的代码完全一致，具体方法请自行探索，如果有机会也许会有文章。