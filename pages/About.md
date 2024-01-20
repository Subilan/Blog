# 关于

这里是关于页面，你可以在这里了解到关于我和关于这个博客的相关内容。

## 我

关于我，大概有这么一些事情

- 赛博朋克 —— Cyberpunk 2077 100+ 小时忠实玩家！此数字还将不断攀升。
- 信息爆炸 —— 感觉一辈子都要在互联网里度过了。
- 维基百科 —— 时不时会去 Wikipedia 上看看或写写，来增长一下稍后就会忘记的知识。
- 排版强迫 —— 对页面、文章等的排版、布局、字体搭配等具有强迫症。
- 切图大师 —— 会使用 Illustrator 和 Photoshop 进行*简单的*图片处理和图形设计。
- 字体收藏 —— 没错，就是喜欢收藏字体。正版或者盗版。
- 质感设计 —— 十分欣赏谷歌的 Material Design 设计体系。
- 不是果粉 —— 虽然有苹果全家桶，但是不承认自己是果粉。Shut up and just use your f**king product.
- 不会听歌 —— 喜欢听的歌，听多了也不爱听，所以经常处于歌荒中。基本不听华语，也不听各种 Pop（非刻意，单纯不喜欢）。流派大部分为 Alternative。音乐启蒙人：Lady Gaga。下面列出了目前或以前比较感兴趣的一些歌手或者乐队，来看看和你有没有共鸣吧。
  - Lady Gaga, St. Vincent, Arctic Monkeys, The Black Keys, Broken Bells, Glass Animals, Saint Motel, Penelope Scott, Arcade Fire, The Score, Skott, Soler（粤语）, Stealing Sheep, 陈靖霏, 朴树, 草东没有派对, 美秀集团（台语）, Taylor Swift, Lana Del Ray
- 是方块人 —— Minecraft 10 年玩家。
- 非二次元 —— 很难不以唯物主义视角审视二次元。
- 超敏星座 —— 在荣格构建的[十六星座](https://www.16personalities.com/ch/%E4%BA%BA%E6%A0%BC%E6%B5%8B%E8%AF%95)中，我是 INFP-T（2019、2021、2023 年测试结果）。
- あいうえ —— 日语初级兴趣爱好者，能看懂部分片假名（笑）。
- 酒精过敏 —— 喝酒脸红没感觉，大概就是不能喝酒吧[^1]。

## 活动

除去主业和游戏以外，我经常会有一些「课外活动」，来维持、增进和发挥自己的创造力。它们包括
- 此博客
- [Seati 模组服务器](https://seati.cc)
- Flag: *Tisea 社区*
- Minecraft Java 插件或模组开发等

## 此博客

本博客始创于 2019 年 8 月 16 日，使用 [VuePress](https://vuepress.vuejs.org) 搭建，免费运行在 GitHub Pages 上，运行成本只有域名的成本。起初是手动 build+push 部署，后来使用 GitHub Actions 自动部署。

2023 年 7 月 15 日停止使用 VuePress，并仿照原有的构建模式，使用 Vue 3 对博客进行了重写。目前博客自动部署在 Vercel 上。

我大概从 2016 年的 12 月份开始写博客，其实一开始的动机就是*跟风*。当初并不会这些东西，或者说完全没有概念，但是在摸索之下还是把博客搭起来了。一开始的时候没有什么构思，所以并没有写出什么有价值的内容，大多数是一些流水账，比如看过的电影的感受（但现在内容已完全丢失），或者是对博客本身维护的记录等等。

这几年里先后换用了 WordPress、Typecho、Hugo、Hexo 等博客程序，经历了反复删库。由于内容并没有太多价值，所以一直不是很放在心上。直到有一天，廉价服务商的不可靠导致数据的永久丢失，然而那时却已经产出了一些我比较珍惜的内容。以此为契机，又为了追求简洁，我萌生了利用纯静态博客程序的想法。

博客的主题参考了 VuePress 默认主题。本博客域名 [subilan.win](https://subilan.win) 长期不变，你也可以通过 [subilan.vercel.app](https://subilan.vercel.app) 来访问。

为了便于查看，加入了字数统计和阅读时间的估算，具体算法如下。

```javascript
function countWords(text) {
    return (text.match(/[\u00ff-\uffff]|\S+/g) || []).length;
}
```

以 $250$ 字/分为基准值，各个分类所对应的单位时间阅读字数比例如下：

|  分类   | 对应比例（$\frac{字/分}{字/分}$） |
|:-----:|:-----------------------:|
|  其它   |           $1$           |
|  记录   |         $0.85$          |
| 代码/路径 |          $0.7$          |
|   诗   |         $0.75$          |
|  思想   |          $0.6$          |

[^1]: 依据：[维基百科](https://zh.wikipedia.org/wiki/%E9%85%92%E7%B2%BE%E5%8F%8D%E5%BA%94)
