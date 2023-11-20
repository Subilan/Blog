# 关于

这里是关于页面，你可以在这里了解到关于我和关于这个博客的相关内容。

## 我

关于我，大概有这么一些事情

- 目标全栈 —— 学点前端，学点后端，再学点底层硬件和代码，人生结束了~🎉
- 排版强迫 —— 对排版具有一定的敏感性和强迫症。
- 切图大师 —— 会使用 Illustrator 和 Photoshop 进行*简单的*图片处理和图形设计。
- 质感设计 —— 十分欣赏谷歌的 Material Design 设计体系。
- 虚假果粉 —— 我的评价是：除了贵都挺好的。
- 不会听歌 —— 其实就算是喜欢听的歌，听多了我也会不爱听。流派大部分为 Alternative，但有渐渐转向 Indie Rock 的趋势~
  - 认识的第一位歌手：Lady Gaga
  - 比较欣赏的歌手：St. Vincent
  - 喜欢的乐队：Arctic Monkeys, The Black Keys, Broken Bells, Glass Animals, Saint Motel
  - 平时听的其它歌手/乐队：Penelope Scott, Arcade Fire, The Score, Skott, Soler（粤语）, Stealing Sheep, 陈靖霏
  - 我扮演一个路人粉的角色：Taylor Swift, Lana Del Ray, 朴树, 草东没有派对, 美秀集团
- 是方块人 —— Minecraft 10 年玩家。
- 伪二次元 —— 可能会看那么几部番。
- 超敏星座 —— 在[十六星座](https://www.16personalities.com/ch/%E4%BA%BA%E6%A0%BC%E6%B5%8B%E8%AF%95)中，我是
  INFP-T（2019、2021、2023 年测试结果）。
- あいうえ —— 日语初级兴趣爱好者。
- 酒精过敏 —— 喝酒脸红没感觉，大概就是不能喝酒吧[^1]。

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
