# SolitudeScroll

## 关于本站

此博客的域名是 <https://subilan.win>，也可以通过 <https://subilan.vercel.app> 访问。博客使用 Nuxt 3 编写，采用本地 Markdown 编写+`build.js` 编译为本地 JSON 数据后再被组件调用的模式。

本站所使用的主题参考了 [VuePress](https://vuepress.vuejs.org/) 的默认主题，并经过了三次迭代（最近一次是 2025 年 2 月）。

-   曾经使用过的博客程序
    -   WordPress (_2016-2017_)
    -   Typecho, Hugo, Hexo (_2017-2019_)
    -   VuePress 1 + GitHub Pages (_2019.08_-_2023.07_)
    -   Vue 3 + GitHub Actions + Vercel (_2023.07.15_-_2024.09.04_)
    -   （当前）**Nuxt 3 + Vercel** (_2024.09_-)

更多请查看[博客的关于页面](https://subilan.win/pages/about)。

## 友链申请

博客开放友链申请，如需添加，可考虑直接向本项目提交 PR 或者发布 Issue。详细要求请参考[博客的友链页面](https://subilan.win/pages/blogroll)。

## 目录结构

|                  目录或文件                  |                                        介绍                                        |
| :------------------------------------------: | :--------------------------------------------------------------------------------: |
| `src`, `public`, `assets`, `components`, ... |                                 前端相关的开发文件                                 |
|                    `data`                    | 数据文件，包括编写的 Markdown 文件（`data/posts`），友链数据（`blogrolls.json`）等 |
|                  `build.js`                  |                                      编译脚本                                      |

## 主要依赖库

-   Nuxt 3 / Vue 3
-   [markdown-it](https://github.com/markdown-it/markdown-it)
-   [Shiki 式](https://shiki.style/)
-   [dayjs](https://day.js.org)
-   [Material Design Icons](https://materialdesignicons.com/)

## 运行环境

-   Node.js 22 LTS
-   Vercel（部署）
-   阿里云 OSS（图床）

## 协议

MIT

站点上的原创内容（含图片、文本）以 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh)（署名-相同方式）协议发布。
