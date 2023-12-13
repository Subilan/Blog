---
date: 2023/12/13
cate: 代码
desc: 好荒谬，就像经过精密数学计算以后算出来公交车上只有 1.5 个人那样荒谬💧
---

# 吐槽一下 Vercel 的大无语操作

:::tip
说是吐槽，发现不知不觉写成了流水账。看个乐呵就好 \^_\^'...
:::

![](https://s11.ax1x.com/2023/12/13/pifIWGV.png)
*拱出去，拱得远远的*

如你所见，这个网站自 2023 年 7 月被搬迁到了 Vercel 上面，采用 GitHub 托管源代码+Vercel 持续集成自动部署的模式来呈现。考虑到使用 Vercel 的一大原因，是 对 Vue 的路由相关考虑（**Wanna have ugly #Hashtag in URL or 404 on refresh???**），这是在搭建这样的低成本静态网站时经常会遇到的一类焦灼。

然后就在几天前，一位伙伴向我发来邮件请求添加友链。等我修改好 `Blogroll.vue` 以后，却发现 deploy 不上了，现象是 `vue-cli-service build` 了 45 分钟还没有部署好，超时被 kill。我真惊了，因为平时 deploy 基本上用不到 2 分钟（如果弥补了使用 puppeteer 的大坑，那么甚至不到 1 分钟），不清楚是啥情况。而且我尝试本地 build，一切正常。

于是我就发现了 Node 引起的这个离谱的 Bug，以及 Vercel 无脑帮助用户做版本决定的荒谬机制。

首先，我尝试 redeploy，发现每次的表现不一致。上面的那一种表现是卡死无反应，一直持续到超时，而另外还有两种表现：

![](https://s11.ax1x.com/2023/12/13/pifIoqJ.png)
*你没事吧？*

![](https://s11.ax1x.com/2023/12/13/pifI7Z9.png)
*你没事吧？？*

一种是随机位置出现 `Unexpected token [???random, mostly a blank] in JSON at position [???random]` 的报错，`???random` 中三个问号表示我的极度疑惑和严厉批评。另一种是先给一个莫名其妙的 `undefined:1`，然后输出一大段莫名其妙的 JSON。

我怀着侥幸心理，选择了这一大段莫名其妙的 JSON 在 Google 上搜索。也不知道是运气好还是咋地，还真搜到了有人在 Issue 上的反馈（后来我发现再随便选然后搜，也搜不到了😓）。

- https://github.com/orgs/community/discussions/69293

这个 Discussion 反馈的问题和我的基本上是一样的（也是使用 `vue-cli-service` 来构建的时候出现的，虽然这个故事和 Vue 关系应该不太大？），他是这么描述的：

> Hello. Long story short **2 weeks ago everything worked fine** with Github actions. Now we only commited a small style change (a new CSS rule for an ID) and the build for CI/CD failed. We are deploying to an Azure environment. npm install works just fine, no other modification were done and last build was successful.
>
> ............
>
> We tried everything from updating all packages to using the known working versions, checking the code etc. **On our local machines it's working well.** Any idea of how to solve this would be welcomed.

然后这个帖子指向了这个 Issue

- https://github.com/webpack-contrib/thread-loader/issues/191

其中说到的 Actual Behaviour 和我遇到的一模一样，基本上可以确定了：

> **Actual Behavior**
>
> Webpack build either **hangs indifinetely** or fails with the following 2 errors:
> - JSON **Parse failed unexpected token at random, each time, positions**
> - Error EPIPE

下面的评论中提到是 Node 18.18 中的 `libuv` 库升级导致的，可以通过提供一个环境变量来避免出现问题。这个解决方案还有些许人点赞。后来试了一下发现对我来说并不可以。

![](https://s11.ax1x.com/2023/12/13/pifoliq.png)

有一个人回滚到 18.17 就可以避免这个问题。于是我终于知道为什么我可以在本地 build 而到 Vercel 上就会爆炸了。因为我本地版本就是 18.17，而 Vercel 上就是 18.18......于是我开始想办法，如何修改 Vercel 的 Node 版本。在翻看配置项的时候，发现了一个调整版本的地方，却只有可怜的三个选项：`16.x`、`18.x` 和 `20.x`，其中 `16.x` 选中了会提示你 deprecated，`20.x` 选中了会提示你 beta...已经开始有点别扭了。而这个 `18.x`，没有明确的版本号，而实际上 `node -v` 输出的就是 18.18 最新版。

于是自然我把目标转向如何改为 18.17。官方提供了文档，是这么说的：

> You can define the specific node version in the engines section of the package.json to override the Project Settings. However, the value set in the Project Settings dictates the accepted values for the node property.
> For instance, when you set 20.x in the Project Settings you can specify a valid v20 range in package.json. But setting >16.0.0 with 16.x selected, will deploy with the latest v18.

也就是说，在 Vercel 上你不能使用奇数版本的 Node，因为选项中根本没有，而只能手动指定大版本范围内的小版本。这......虽然对我没啥影响吧，但就是有点不爽。而根据这段话所说的，实际上是可以在 `package.json` 中 `engines.node` 指定具体的版本的，下面的表格中也列出了这一点，证实了我的猜想。

![](https://s11.ax1x.com/2023/12/13/pifo2eH.png)

于是我兴高采烈地去 `package.json` 中把 `engines.node` 设置成 `18.17.0`，以为这样问题就能得到解决时， Vercel 在部署的时候提供了这么一句话：

```
Warning: Detected "engines": { "node": "18.17.0" } in your `package.json` with major.minor.patch, but only major Node.js Version can be selected. Learn More: http://vercel.link/node-version
```

它竟然直接大胆地说 **only major Node.js Version can be selected**，也就是说我只能控制是不是 18 这一个大版本...那文档中说的这些，不就跟没说一样了。更何况表格中已经列出来了，结果实际上又不是这样。这真是让人无语到了极点了。去 GitHub 上找类似的问题，也只找到了这一篇：

- https://github.com/vercel/vercel/discussions/8238

有位回答者刚开始是照搬文档中提到可以手动设置具体版本，结果发现并不是这样，于是就说只能设置 major 版本。同时引用了 [Vercel 文档](https://vercel.com/docs/runtimes#official-runtimes/node-js/node-js-version)中出现的这样一段话：

> Only major versions are available. **That's because Vercel will automatically roll out minor and patch updates if needed (for example in the case that a security issue needs to be fixed).**
> 
> Defining the node property inside engines of a package.json file will override the selection made in the Project Settings and print a Build Step warning if the version does not match.

很好，还给出了只能设置 major 版本的理由，因为 Vercel 会自动打补丁。很想说一句，谁让你打了？像现在这种情况，18.18 导致问题而 18.17 就不会导致问题，那么这句话里所说的「因为会自动打补丁所以不让你手动设置 minor 和 patch 版本」就很不可靠了。

下面这句话说了又感觉跟没说一样，有什么用呢...

## 总结

这一整趟下来呢，就是又疑惑又失望的感觉吧，就感觉很荒谬，不知道说什么的荒谬。那么，最后是怎么解决的呢？由于 Vercel 最终是将一个目录内的所有文件作为无后端应用的代码来跑，所以只要手动 build 到这个目录里面，然后跳过在 Vercel 上的 build 过程就好了。

所以现在我的 build 指令长这样：

![](https://s11.ax1x.com/2023/12/13/pifHPo9.png)
*我tm直接 build success！*

其实感觉问题不大，就是可能每次 commit 之前都要花个一两分钟来 build 一下。这样的操作估计得要持续到上面我想到的解决方法能实现的那一天了😅