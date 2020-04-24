---
desc: 难道没有更好的办法了吗？
date: 2020/04/24
---

# 对于包含日期数组的处理

由于最近业余开发了一个时间轴的程序（但这个程序的主体不是时间轴），将不同的事件按照时间点记录下来，并仿照 <https://www.githubstatus.com/> 的样式从上到下排列下来。由于是第一次做这方面的东西，遇到了很多问题，也收获了一些经验，在这里分享一下。

## 时间线简介

我们首先约定，时间轴上存在个体的基本单位叫「事件」。例如今天 `2020/04/24 12:30:30` 发生了事件 A，那么我们就把它记录下来；当今天 `2020/04/24 13:59:59` 又发生了事件 B，我们也把它记录下来。直到最后在时间轴上显示出来。

为了叙述方便，我们首先看看**时间轴**到底长什么样：

![](https://i.loli.net/2020/04/24/2IKDEmjxehdRMJr.png)

*GitHub 昨天晚上又崩了啊啊啊啊啊啊啊啊*

这就是时间轴，发生在同一天的事件会被归类到这一天下，然后再根据时间点分别排列事件的内容。然后针对之前的每一天，就像这样排列着

![](https://i.loli.net/2020/04/24/iahYfX7Fz4HgDpI.png)

这样便可以准确地反映一个轴的概念——左侧是一个代表「轴」的竖线，上面穿插着日期，每一天都有记录。如果这一天发生了什么事情，就把具体的时间点（时、分、秒）记录下来，然后将这个事件的具体内容表示出来。

## 记录时间与写入数据库

接下来说说如何记录时间。其实很简单，在插入数据库的时候生成时间就好了。为了方便，我们生成的时间是可以被应用到 JavaScript 的 `Date` 对象的。格式大概如下：

:::tip
:snake: 以下语句来自 Python 语言。
:::

```python
import time

# ...

date = time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())
```

那么此时我们的数据库里应该记录了这个事件的内容和时间，但似乎还缺点什么。那就是自增键。对于任何一个可以无限扩大的数据集合，我们都要想办法把它们编号。因为除了 ID 以外没有更好更简单的方式来确定某一条数据的身份（仅限当前讨论范围内）。现在我们的表结构可以这样表示

```sql
CREATE TABLE `Events` (
    `id` int unsigned NOT NULL AUTO_INCREMENT,
    `title` varchar(50) NOT NULL,
    `contents` text NOT NULL,
    `date` varchar(20) NOT NULL,
    PRIMARY KEY (`id`)
) CHARSET=utf8mb4;
```

可以看到，我们将事件的内容分为了两个部分，`title` 和 `contents`；然后我们确定了一个自增键 `id` 用于给每条数据一个特殊的标识；最后就是记录这篇发布的日期。至此，我们就大概完成了数据的写入部分，实际操作起来按照一般逻辑即可。

## 获取数据和数组结构

获取数据时，我们会出现一些疑问。如果我们直接获取这些数据库里面的数据，很有可能得到下面的这个数组：

```javascript
[
    {
        id: 1,
        title: "example1",
        contents: "example1-content",
        date: "2020/05/01 21:38:29"
    },
    {
        id: 2,
        title: "example2",
        contents: "example2-content",
        date: "2020/05/01 22:59:30"
    }
]
```

如果这个时候直接拿到前端去渲染，一定会出现很多问题。因为这个数组里的每个对象都是独立的，但是它们的时间却又有可能处于同一天。我们的目的是将同一天的两个事件合并，然后再根据具体的时分秒在当天进行排序。如何合并？这就需要对数组采取一定的操作。

我们首先需要想象出一个结构，来很好地处理这样一个需求。我们的需求是，忽略事件，当日期重复时，对其进行合并。究竟如何合并呢？这个时候我们的第一步是**找到这些数据的共性**。比如，目前为止我们能找到的共性只有日期这一个。当我们添加更多内容时，就有可能产生更多的共性。接下来仅围绕 `date` 这一个共性来讨论。

既然有了共性，说明这些数据包含可以分享的部分，那么我们很容易得到如下结构

```javascript
[
    {
        date: "2020/05/01",
        events: [
            {
                id: 1,
                title: "example1",
                contents: "example1-content",
                time: "21:38:29"
            },
            {
                id: 2,
                title: "example2",
                contents: "example2-content",
                time: "22:59:30"
            }
        ]
    }
]
```

这些处于同一天的数据被分类在一个对象的属性里，它们的 `date` 属性被拆分为了两个部分，`date.split(" ")[0]` 作为日期被放在了「公共区」，`date.split(" ")[1]` 则作为具体的事件被存储到每个独立的事件里。

这个结构就可以被前端很好地处理，只需要进行两次遍历。例如在 Vue 中

```vue
<template>
    <div v-for="k in data">
        <div class="meta">
            <i class="date-icon"/>
            <span class="date">{{ k.date }}
        </div>
        <div class="events" v-for="a in k.events">
            <h1>{{ a.title }}</h1>
            <span class="time">{{ a.time }}</span>
            <span class="id" :id="a.id">{{ a.id }}</span>
            <div class="event-content">
                {{ a.contents }}
            </div>
        </div>
    </div>
</template>
```

*仅供思路参考，实际使用需要额外处理*

那么又引出了一个问题，该如何把上面的数组变成我们想象的那个样子呢？

## 数组的处理

:::tip
☕📔 以下语句来自 JavaScript 语言
:::

数组的处理环节是最让人头疼的。我们先把完整的代码放出来，再一行行解释。

```javascript
function createArray(data) {
    let arr = [];
    data.forEach((k, i) => {
        let ix = -1;
        let d = k.date.split(" ");
        let date = d[0];
        let time = d[1];
        let sameDay = arr.some((r, j) => {
            if (date === r.date.split(" ")[0]) {
                ix = j;
                return true;
            }
            return false;
        });
        if (!sameDay) {
            arr.push({
                date: date,
                events: [
                    {
                        id: k.id,
                        title: k.title,
                        contents: k.contents,
                        time: time,
                    },
                ],
            });
        } else {
            arr[ix].events.push({
                id: k.id,
                title: k.title,
                contents: k.contents,
                time: time,
            });
        }
    });
    return arr;
}
```
首先我们新声明一个数组 `let arr = []`，然后将数据中的日期分割 `k.date.split(" ")`。后面用到了很重要的一点，`Array.prototype.some` 函数。这个函数用于判断是否通过了回调函数中指定的测试，返回一个布尔值。在这里我们手动在回调函数里加上了一行，`ix = j`，用于记录日期相同的对象所在的位置。

`some` 函数返回的布尔值被记录在 `sameDay` 这个变量中，如果为 `true` 就代表在同一天。下方判断 `if (!sameDay)`，如果通过，就会在新声明的数组里初始化一个结构——

```javascript
arr.push({
    date: date,
    events: [
        {
            id: k.id,
            title: k.title,
            contents: k.contents,
            time: time,
        },
    ],
});
```

这个结构记录一个日期和一个 `events` 属性，如果有和这个日期重复的 `event`，就会被拆分后 `push` 到里面（依据 `ix` 来寻址）：

```javascript
 arr[ix].events.push({
    id: k.id,
    title: k.title,
    contents: k.contents,
    time: time,
});
```

实际运行效果如下：

![](https://i.loli.net/2020/04/24/GfcwK4nSRYat6rl.png)

这个函数实际上显得比较复杂，如果有更好的办法，欢迎[联系](/contact.html)我交流。