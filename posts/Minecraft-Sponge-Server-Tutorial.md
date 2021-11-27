---
desc: 高版本 Mod 服又想加插件...？
date: 2020/01/02
cate: 路径
---

# Sponge 搭建 1.12.2 Mod + 插件服务器

虽然说目前 1.15.1 的 Mod 服务器实现方式已经有了（Fabric），但是仍然有本文发布的必要——因为目前能够做到**高版本**、**支持 Mod**、**支持插件**的只有这一种服务端，Fabric 仅支持 Mod。

在本篇文章中会介绍 Sponge 的安装方法，也就是如何部署一个这样的服务器。

## 原理

Sponge 分为三个大分支，在这里为了能够安装 Mod 我们选择 Sponge Forge 分支。

在实际服务器中，Sponge 的文件被作为 Mod 放置在 `mods` 的文件夹里，与其它插件、Mod 并列。

> Sponge 中插件也是放在 `mods` 里的。

也就是说，实际服务器是由一个简单的 Forge 服务器（原版服务端 + Forge）加上 Sponge 组合而成的，Sponge 所发挥的作用就是提供 API 给其它模组使之能够与 Sponge 对接，从而运作。

这与高版本 Fabric 中的一个 Optifine Loader 类似，由于 Optifine 无法在高版本中搭配 Fabric（甚至 Forge）使用，就有人开发出了 Loader 使之能够在运行时间段将 Optifine 转换为可在 Fabric 上运行的形式。

废话不多说，从原理中我们可以看出这整个部署的步骤和一般的 Forge 服务器类似，只不过多加了一个 Sponge 而已。

## 开始搭建

首先我们需要下载必要的文件，包括：

- Minecraft 原版服务器端 👉[Link](https://launcher.mojang.com/v1/objects/886945bfb2b978778c3a0288fd7fab09d315b25f/server.jar)
- Forge 安装器 👉[Link](https://files.minecraftforge.net/maven/net/minecraftforge/forge/1.12.2-14.23.5.2838/forge-1.12.2-14.23.5.2838-installer.jar)
- Sponge 本体 👉[Link](https://repo.spongepowered.org/maven/org/spongepowered/spongeforge/1.12.2-2838-7.1.8/spongeforge-1.12.2-2838-7.1.8.jar)

::: warning
**⚠ Warning**

Sponge 对 Forge 的版本有要求，在选择 Sponge 时需要注意到其支持的 Forge 版本号。在上面所给的链接中，下载到的 Forge 和 Sponge 应分别为 `forge-1.12.2-14.23.5.2838-installer.jar` 和 `spongeforge-1.12.2-2838-7.1.8.jar`。

注意到其中，Forge 版本号为 1.12.2-14.23.5.**2838**，Sponge 版本号为 1.12.2-**2838**-7.1.8，这代表它们是对应的版本。如果这两个版本不一致，Forge 偏高（Sponge 偏低）会导致运行不稳定，Forge 偏低（Sponge 偏高）会导致部分插件无法正常运行。
:::

下载以后，首先创建一个文件夹，取名随意。在这里我们叫它 `sponge-server`。

```bash
$ mkdir sponge-server
$ cd sponge-server
```

然后，将 Minecraft 原版服务器端放入，并将其改名为 `minecraft_server.1.12.2.jar`。

::: tip
**提示**

这一步是为了避免 Forge 安装出错。Forge 安装时会尝试下载官方客户端，但是实际上根本无法下载（即使科学上网）。因此我们要用正常的途径提前下载完毕后，将其命名为 Forge 所 expect 的那样，这样它便会跳过它而开始下载 library 文件。
:::

双击或使用 `java -jar` 打开 Forge 的安装器，可以看到下面的画面：

![](https://i.loli.net/2020/01/02/FMRZAVxJBzQcE3v.jpg)

选择 `Install server`，然后选择你之前所创建的那个文件夹。这时会提示

> There are already files at the target directory.

然而实际上这是可以忽略的。我们直接点击确定。在这之后就是漫长的等待了——这个过程，至少对于我来说，科学上网是没有任何加速作用的。我等待了约 10 分钟。

在这期间发生错误（下载失败）也很正常，不需要担心，只需要重复上述步骤即可，Forge 会自动跳过已经下载的文件，继续上一次进度。

当下载完毕以后，你会发现 `sponge-server` 文件夹里多出了一个 `libraries` 文件夹，这便是我们所需要的文件。

在这个时候，一个 Forge 服务器就搭建好了。如果上述这一切均在你的电脑上进行，那么可以使用

```bash
scp -r sponge-server root@host:/
```

将你的文件夹复制到服务器上继续进行下一步操作。这种方法适用于无法命令行的面板服务器。

如果你直接在服务器上进行的，那么就继续往下看吧。

这个时候，位于 `sponge-server` 中，也会有一个 Forge 的 universal 文件。它便是服务器核心本体了，以后启动就要启动它。我们现在就启动它，来准备服务器的一些文件：

```bash
$ java -jar forge-1.12.2-14.23.5.2838-universal.jar
```

不出意外的话服务器会顺利启动，然后就是喜闻乐见的 `eula.txt` 环节，同意以后继续启动，便会生成服务器的基础文件（夹），比如 `logs`、`world`、`server.properties` 以及最重要的 `mods`。

启动成功后我们就关闭服务器

```bash
> stop
```

然后将我们先前下载的 Sponge 放入 `mods` 文件夹内，有打算的话可以直接把你准备安装的 Mod 放进去，重新启动，你就会发现：~~哇，启动速度慢了一大截呢~~成功了！

这个时候，如果你在你的客户端上也安装一样的 Mod 组合，就可以直接进入服务器了！

::: tip
**提示**

你必须有与服务器相同的 Mod 组合才能进入服务器，当然也有例外（见下文）。
:::

## 插件

Sponge 既支持 Mod 又支持插件，但是它们都放在 `mods` 文件夹里，这一点与 Bukkit 完全不同。它们的配置位于根目录的 `config` 文件夹中。

一般来说一个 Sponge 服务器的 Mod 与插件方面结构如下：

```tree
.
├── config
│   ├── plugin1
│   │   └── main.conf
│   ├── plugin2
│   │   └── config.conf
│   └── simpleplugin.conf
└── mods
    ├── plugin1.jar
    ├── plugin2.jar
    └── simpleplugin.jar
```

每一个插件或 Mod 都有与其对应的配置项，放置在 `config` 里。一般均放置在与之同名的文件夹内，少数简单的会直接放在 `config` 里不带其它文件夹。通过更改它们便可以改变设置，就像 Bukkit 中的 `config.yml` 一样。

区别于 Mod，插件**不需要在本地客户端内安装**。这就意味着你将要安装的只是那些可以玩的 Mod，而非这些只能用在服务器上的插件（例如领地、经济等）。对于 World Edit 这种既可能是插件又可能是 Mod 的尽量选择其插件版本，原因很明显了。

Sponge 的插件兼容性是通过 API 来判断的。目前 `1.12.2` 的版本为 API7，所以任何为 API7 接口的插件均可以用在 1.12.2 的 Sponge 服务器中。少数 API6 / API5 或更低插件也能够正常运行（例如 World Edit），但是不如 API7 稳定。但是有些则彻底不能运行。

这也告诉我们在更新 Sponge 的过程中要慎重，如果更新版本过高，一些不再维护的插件就会失效。

## 插件推荐

Sponge 界构建出了一种独立于 Bukkit 插件的体系，因此它们的主流插件也都不一样了。在这里给出 Sponge 界中常用的一些 Mod，注 R 的为推荐项目。

- 经济
    - TotalEconomy
    - EconomyLite (R) 👉[MCBBS](https://www.mcbbs.net/thread-726623-1-1.html)
- 商店
    - AmberShop 👉[MCBBS](https://www.mcbbs.net/forum.php?mod=viewthread&tid=877173&extra=page%3D1%26filter%3Dsortid%26sortid%3D7%26searchoption%5B70%5D%5Bvalue%5D%5B4%5D%3D4%26searchoption%5B70%5D%5Btype%5D%3Dcheckbox%26searchoption%5B64%5D%5Bvalue%5D%5B9%5D%3D9%26searchoption%5B64%5D%5Btype%5D%3Dcheckbox)
- 权限管理
    - **LuckPerms** (R) 👉[官网](https://luckperms.net/)
    - PermissionsEx
- 领地
    - RedProtect (R) 👉[MCBBS](https://www.mcbbs.net/thread-530491-1-1.html)
    - GriefPrevention
    - **没有 Residence！**
- 登录
    - FlexibleLogin (R) 👉[GitHub](https://github.com/games647/FlexibleLogin)
- 基础管理
    - **Nucleus** (R) 👉[MCBBS](https://www.mcbbs.net/thread-726958-1-1.html)
    - **没有 Essentials！**
- 皮肤
    - **CustomSkinLoader** (R) 👉[MCBBS](https://www.mcbbs.net/thread-269807-1-1.html)
- 杂项
    - JoinTitle - 登录标题 👉[MCBBS](https://www.mcbbs.net/forum.php?mod=viewthread&tid=886209&extra=page%3D1%26filter%3Dsortid%26sortid%3D7%26searchoption%5B70%5D%5Bvalue%5D%5B4%5D%3D4%26searchoption%5B70%5D%5Btype%5D%3Dcheckbox%26searchoption%5B64%5D%5Bvalue%5D%5B9%5D%3D9%26searchoption%5B64%5D%5Btype%5D%3Dcheckbox)
    - SpongeLoginFix - 修复登录的 Bug 👉[MCBBS](https://www.mcbbs.net/forum.php?mod=viewthread&tid=817978&extra=page%3D1%26filter%3Dsortid%26sortid%3D7%26searchoption%5B70%5D%5Bvalue%5D%5B4%5D%3D4%26searchoption%5B70%5D%5Btype%5D%3Dcheckbox%26searchoption%5B64%5D%5Bvalue%5D%5B9%5D%3D9%26searchoption%5B64%5D%5Btype%5D%3Dcheckbox)
    - GiftCode - 兑换码 👉[MCBBS](https://www.mcbbs.net/forum.php?mod=viewthread&tid=790641&extra=page%3D1%26filter%3Dsortid%26sortid%3D7%26searchoption%5B70%5D%5Bvalue%5D%5B4%5D%3D4%26searchoption%5B70%5D%5Btype%5D%3Dcheckbox%26searchoption%5B64%5D%5Bvalue%5D%5B9%5D%3D9%26searchoption%5B64%5D%5Btype%5D%3Dcheckbox)
    - SendItems - 发送物品 👉[MCBBS](https://www.mcbbs.net/forum.php?mod=viewthread&tid=660836&extra=page%3D1%26filter%3Dsortid%26sortid%3D7%26searchoption%5B70%5D%5Bvalue%5D%5B4%5D%3D4%26searchoption%5B70%5D%5Btype%5D%3Dcheckbox%26searchoption%5B64%5D%5Bvalue%5D%5B9%5D%3D9%26searchoption%5B64%5D%5Btype%5D%3Dcheckbox)

## 一些坑

Q **进入服务器后无法破坏东西？**

A 可能是出生点保护。将 `server.properties` 中的 `spawn-protection` 项目更改为 0。这个项目没有任何实际作用，如果真的需要相关功能，可以使用插件，但是这个功能会导致即使拥有最高权限也无法做出任何更改。

Q **OP 无效？**

A Sponge 中没有 OP 这种概念，取而代之的是较为复杂但是又很方便的权限组管理模式。具体可以上网查找相关资料，需要依靠权限管理插件来实现。比较推荐 [LuckPerms](https://luckperms.net)

Q **`/help` 无权限？**

A `help` 的权限在 `sponge.commands.help`，确保此权限给到。OP 应拥有 `sponge.commands` 权限。 

Q **`/gamerule`、`/gamemode` 等无权限？**

A 这些都是原版指令，在 `minecraft.commands` 里。OP 应拥有 `minecraft.commands` 权限。

Q **在一次性给予所有权限（`*` 权限）以后，发生很多奇怪的事情？**

A 重置权限组。不提倡一次性给予 `*` 权限，因为这有可能给到那些不一定需要的权限，例如 `nucleus.vanish.onlogin` 会导致每一次登录自动隐身，除了聊天以外没有任何办法发现此人（Tab 菜单也不可见）。

Q **Nucleus 如何设置玩家最大家的数量以及称号？**

A Nucleus 和 LuckPerms 搭配使用可以方便地设置这两者，用权限组进行区分。

```bash
> /lp group default meta set home-count 5
```
将 `default` 组的最大 `home` 数量设置为 5 个。

```bash
> /lp group default meta addprefix 1 [&a玩家&r]
```
给予 `default` 组聊天时一个 [<span style="color: green">玩家</span>] 称号。其中 `addprefix` 后面需要跟上一个表示权重的数字。