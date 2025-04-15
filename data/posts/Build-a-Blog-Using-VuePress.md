---
desc: 这篇文章的发布也是在我预料之中哒！
date: 2019/08/19
cate: 路径
---
# 使用 VuePress 搭建博客

> **前排提醒:** 你也许需要一定的前端基础才能读懂此篇文章的内容。

## 流程

VuePress 与其它静态博客软件的发布流程基本一样。写完文章后 `build` 成为静态文件，然后托管给 Web 服务器供用户访问。Hexo 或者 Hugo 用户可能对这样的流程也许会感觉很熟悉。

也正因为是静态文件，所以可以使用 GitHub 这样的平台来免费托管，而无需投入更多的成本。当然也可以使用你自己的主机。

## 安装 VuePress

首先选择一个你想要用来作为博客源代码放置之处的文件夹，**下文中如果没有特殊声明，所有的文件、目录均指创建在此文件夹里**。

通过 npm 和 yarn 均可安装 VuePress。本文主要使用 npm。

```sh
npm install -D vuepress
# 或者 yarn add -D vuepress
```

需要注意的一点是，这种方式是以本地依赖（dependencies）的形式安装 VuePress，它会在当前目录生成一个 `node_modules` 文件夹并自动安装运行时所需要的依赖。也正因此，在本文后面出现的指令无法以 `vuepress` 开头，因为 VuePress 没有被全局安装。

这一步完成之后，就可以开始搭建了。

## 搭建

个人建议将你的博客的源代码托管到 GitHub 上，或者部署在自己的 Git 服务器上。这样做就有这些好处：

1. 自带版本管理，算是一种备份。如果你的一些本地数据被误删，可能可以通过 Git Log 找到
2. VuePress 需要通过 Git 的提交日志获得你提交某篇文章的具体时刻来显示 times ago 相关信息

我们创建一个专门放置“文章”的目录（区分于“独立页面”），名称自取。一些可用的名称包括：`articles`、`posts`、`docs`···

```sh
mkdir posts
cd posts
```

然后就可以在这个文件夹里进行写作了。仅需在此文件夹里建立不同的 Markdown 文件即可开始。VuePress 会自动识别到你的文章。

VuePress 的写作使用 Markdown 文件进行，路由模块会将你的 Markdown 文件在实际 production 中对应到文件名 + `.html` 的路径位置。

例如 `docs/Hello-World.md` 将会被对应到 `/docs/Hello-World.html`，在根目录的 `Hello.md` 会被对应到 `/Hello.html`。这就是为什么需要专门创建一个文件夹用来放置“文章”。根目录里只需要放置独立页面即可，这样从 SEO 层面看来会更加友好。

到目前为止，你的博客目录大概是这个样子

```
.
├─package-lock.json
├─package.json
├─node_modules
└─posts
```

## 写作与发布

环境搭建完毕以后，每一篇文章都可以用 Markdown 来完成，然后直接 `push` 到你的仓库中去。如果你想要在本地实时预览自己的文章在博客上的样子，或者调试一些的东西，你就需要启动开发服务器。

与 Vue 的开发服务器相同，VuePress 的服务器也是支持热重载的。

```sh
# 如果之前 npm install 为全局安装
# npm install -D -g vuepress
vuepress dev .
# 如果之前 npm install 是以本地依赖安装
# npm install -D vuepress
npx vuepress dev .
```

默认情况下会在 <https://localhost:8080> 开放你的开发服务器，访问即可看到你的网站（本地）。

当你觉得一切就绪，就可以进行构建了——将你的网站样式和内容编译成静态网页。

```sh
vuepress build .
# or
npx vuepress build .
```

默认情况下，编译的结果（其中包含 `index.html`）会被保存到 `.vuepress/dist` 内。

## 配置、主题、插件

VuePress 之所以适合开发者来进行独立写作，是因为它可以通过配置、主题和插件三方面高程度个性化。当然，是在你会 Vue 而且会看 VuePress 的文档的前提下。

VuePress 的配置文件存储在 `.vuepress` 里，但一开始是没有这个文件夹的，我们可以自己创建。

进入 `.vuepress` 后，我们创建 `config.js`，这就是 VuePress 的配置文件。

`config.js` 的主要内容就是一个 object，因此在写入一个语句之后即可当作一般的 JSON 文件来使用，*甚至还比 JSON 语法松弛很多。*

```js
module.export = {
    title: "Subilan's Blog",
    // ...
}
```

具体配置项目可以参考 VuePress 官方文档的[配置](https://vuepress.vuejs.org/zh/guide/basic-config.html#%E9%85%8D%E7%BD%AE%E6%96%87%E4%BB%B6)

要切换主题，可使用 npm 安装你想要的主题，比如

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

在这里需要注意的一点是，VuePress 的所有主题、Plugin，根据官方的建议，均是以 `vuepress-theme-` 和 `vuepress-plugin-` 开头。也正因此，安装以他们开头的主题或插件，在填写的时候则可以省略 `vuepress-theme-` 这样的开头。这只是一般情况，具体请以你所看到的主题或插件为准。

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
