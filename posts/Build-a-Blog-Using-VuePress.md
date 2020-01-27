---
desc: 这篇文章的发布也是在我预料之中哒！！
date: 2019/8/19
---
# 使用 VuePress 搭建博客

> **前排提醒:** 你也许需要一定的前端基础（非传统前端）才能读懂此篇文章的内容。

我认为 Vue 的生态是有够好的了——有 Router，有 Vuex，还有更多，都是非常有用处的。其中就包含 VuePress，原本是尤雨溪先生用来提高写文档效率而写的一个小作品，现在被发展后可以用作电子书/教程编写和博客的编写。本篇文章介绍的是后者，实际上两者是相通的。

## 流程

VuePress 与其它静态博客软件的发布流程基本一样——写完文章后 `build` 成为静态文件。所以如果是 Hexo 或者 Hugo 用户看到这篇文章中的流程也许会感觉很熟悉，不过这里还是提到一下。

也正因为是静态文件，所以可以使用 GitHub 托管——当然也可以使用你自己的主机，仅需将网站根目录设置为 `build` 产生的静态文件的目录即可。这会在下文中提到。

## 安装

首先选择一个你想要用来作为博客源代码放置之处的文件夹，**下文中如果没有特殊声明，所有的文件、目录均指创建在此文件夹里**。

通过 npm 和 yarn 均可安装。本文主要使用 npm。

```sh
npm install -D vuepress
# 或者 yarn add -D vuepress
```

需要注意的一点是，这种方式是以本地依赖（dependencies）的形式安装 VuePress，它会在当前目录生成一个 `node_modules` 文件夹并自动安装 JavaScript、Vue 等所需要的依赖。

在本文后面出现的指令均无法以 `vuepress` 开头，因为 VuePress 没有被全局安装。

安装完成之后，就可以开始搭建了。

## 搭建

个人还是建议将你的博客的源代码托管到 GitHub 上，哪怕私有也好。当然，你也可以选择部署到自己的 Git 服务器上。这样做就有这些好处

1. 一个算是比较简单的双重备份吧，当你的数据消失后，可以通过 Git Log 找到；
2. 一些插件需要通过 Git 的提交日志获得你提交某篇文章的具体时刻，然后才能够显示日期或者 XX ago。

那么首先我们创建一个专门放置「文章」的目录（区分于「独立页面」，这样做可以避免混淆），名称可以自取，例如 `archives`、`articles`、`posts`、`docs` 等均可表达这个意思，也是传统博客程序中常用的。

```sh
mkdir posts
cd posts
```

然后就可以在这个文件夹里进行写作了，写作仅需在此文件夹里建立不同的 Markdown 文件，VuePress 会自动识别到你的文章。

VuePress 的写作使用 Markdown 文件进行，路由会自动将你的 Markdown 文件名称在实际 production 中转换成文件名 + `.html` 的形式。

例如 `docs/Hello-World.md` 将会被转化为 `docs/Hello-World.html`，而在根目录的 `Hello.md` 将会被转化为 `Hello.html`，这也是为什么需要专门创建一个文件夹用来放置文章的原因，根目录里只需要放置独立页面即可，这样从路由层面看来会更加友好。

到目前为止，你的博客目录应该为这个样子

```tree
.
├─package-lock.json
├─package.json
├─node_modules
└─posts
```

## 写作与发布

如果你的环境已经搭建完毕，那么你可以选择在纯 Markdown 下进行写作，然后直接 `push` 到你的仓库中去。

而如果你想要实时预览自己的文章在博客上的样子，或者调试一些应用层面的东西，你就需要启动开发服务器。

与 Vue 的开发服务器相同，VuePress 的服务器也是支持热重载的。

```sh
# 如果之前 npm install 为全局安装
# npm install -D -g vuepress
vuepress dev .
# 如果之前 npm install 是以本地依赖安装
# npm install -D vuepress
npx vuepress dev .
```

这样，在默认情况下会在 <https://localhost:8080> 开放你的开发服务器，访问即可看到你的网站。

最后，写完了就可以进行构建了——将你的网站样式和内容编译成静态网页。

```sh
vuepress build .
# or
npx vuepress build .
```

默认情况下这个静态网页会被保存到 `.vuepress/dist` 内，在后文会介绍修改方法。

## 配置、主题、插件

VuePress 之所以适合开发者，是因为它可以通过配置、主题和插件三方面高程度个性化——当然，是在你会 Vue 而且会看 VuePress 的 API 的前提下。

VuePress 的配置文件存储在 `.vuepress` 里，一般情况下是没有这个文件夹的，我们可以自己创建。

进入后，创建 `config.js`，这就是 VuePress 的配置文件。

`config.js` 在写入一个语句之后即可当作一般的 JSON 文件来使用——它比 JSON 要宽松得多。

```js
module.export = {
    title: "Subilan's Blog",
    // ...
}
```

具体配置项目可以参考 VuePress 官方文档的[配置](https://vuepress.vuejs.org/zh/guide/basic-config.html#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)

要切换主题，首先使用 npm 安装你想要的主题，比如

```sh
npm install vuepress-theme-example --save-dev
# yarn add vuepress-theme-example --dev
```

然后在 `config.js` 里添加一行

```js
module.export = {
    // ...
    theme: "example",
}
```

即可。

在这里需要注意的一点是，VuePress 的所有主题、Plugin，根据官方的建议，均是以 `vuepress-theme-` 和 `vuepress-plugin-` 开头。也正因此，安装以他们开头的主题或插件，在填写的时候则可以省略 `vuepress-theme-` 这样的开头。当然，这只是一般情况，具体请以你所看到的主题或插件为准。

关于 VuePress 原版主题的相关配置可以看官方文档的[默认主题](https://vuepress.vuejs.org/zh/default-theme-config/)。

## 参考

这是阅读完文章后，我个人推荐去参考的一些文档，以及一些可能需要的插件。

- [config.js 里完整的配置项有多少、哪些，有何作用？](https://vuepress.vuejs.org/zh/config/#%E5%9F%BA%E6%9C%AC%E9%85%8D%E7%BD%AE)
- [Google 搜索 VuePress 的主题](https://www.google.com/search?q=vuepress-theme+site%3Agithub.com)
- [meteorlxy/awesome-vuepress](https://github.com/meteorlxy/awesome-vuepress) - 丰富的 VuePress 周边生态推荐
- [vuejs/vuepress/packages/@vuepress](https://github.com/vuejs/vuepress/tree/master/packages/@vuepress) - VuePress 官方开发的插件
- [vuepress-plugin-mathjax](https://github.com/vuepress/vuepress-plugin-mathjax) - 在你的博客里写 $\LaTeX$ 公式。
- [vuepress-plugin-last-updated](https://github.com/vuejs/vuepress/tree/master/packages/@vuepress/plugin-last-updated) - 根据 Git Log 显示文章最后修改时间
- [vuepress-plugin-pwa](https://github.com/vuejs/vuepress/tree/master/packages/@vuepress/plugin-pwa) - 将你的博客变成具有 PWA 性质的 Web App
- [Subilan/Blog](https://github.com/Subilan/Blog) - 本博客的 GitHub 仓库
