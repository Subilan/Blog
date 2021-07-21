# About

我的故乡是湖北武汉，主业是 Web 前端，但偶尔会干一些杂活，例如设计、剪辑之类的。最常接触也最感兴趣的游戏是 Minecraft，与 [Sapherise](//sapherise.co) 一同运营着一个 Minecraft 服务器。对 Bukkit 开发略有了解，不定期会做一些插件发在 Github 上。不是二次元，但经常使用 B 站；不是人上人，但经常使用知乎；不是扩列党，但经常使用 QQ。主力系统是 Windows 和 iOS，Ubuntu 会偶尔使用，但从来不用其它发行版（没有需求）。

我大概从 2016 年 10 月份开始写博客，刚开始经验不足，并没有写出什么感觉来，对自己的文章很看淡。先后换用了 WordPress、Typecho、Hugo、Hexo 等博客程序，反复删库。直到最后一次由于服务商不可靠导致数据丢失，于是萌生了纯静态 Github Pages 站点的想法。于是在 2019 年 8 月 16 日使用 [VuePress](//vuepress.vuejs.org) 配以 Travis CI 在 GitHub 上部署了本站。

本博客主题是由 VuePress 默认主题修改而成。具体信息可以参考 [GitHub 页面](//github.com/Subilan/subilan.github.io)。本博客域名为 `subilan.win` 长期不变（目前续费至 2024 年），同时你也可以通过 `subilan.github.io` 来访问同样的内容，它也是本博客的备用域名。

## 关于字数统计

本博客的字数统计基于该函数，只计算中文字符。

```javascript
function countWords(str) {
	return (str.match(/[\u4E00-\u9FA5]/gu) || []).length;
}
```
