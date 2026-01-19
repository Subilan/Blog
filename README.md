# SolitudeScroll

此博客的域名是 <https://subilan.win>，注册于 2016 年。博客基于 Nuxt 3 框架编写，采用本地 Markdown 编写→构建脚本编译为 JSON→组件调用→`nuxt generate` 构建静态页面的模式实现，无数据库、无服务端、纯静态。

本站当前的页面设计参考了 Hugo 主题 [tomfran/typo](https://github.com/tomfran/typo)。先前的页面设计主要参考的是 VuePress 的默认主题。

## 历代版本

-   WordPress (_2016-2017_)
-   Typecho (_2017-2019_)
-   VuePress 1 + GitHub Pages (_2019.08_-_2023.07_)
-   Vue 3 + GitHub Actions + Vercel (_2023.07.15_-_2024.09.04_)
-   **Nuxt 3 + Vercel** (_2024.09_-)

博客的数据起始于 2019 年。2019 年之前的数据已经因为服务商原因而损坏。我比较喜欢在自己的网站上面做一些开发实验和页面设计实验，自 2019 年的版本起，这个博客系统经历了多次迭代。截至 2026 年 1 月，博客经过了 3 次迭代。

- 2019, v1, 使用 VuePress 来创建静态页面
- 2023, v2, 不再使用 VuePress，使用 Vue 3 从头编写
- 2024, v3, 使用 Vue 3 重构
- 2025, v4, 使用 Nuxt 3 编写

## 友链申请

博客开放友链申请，如需添加，可考虑直接向本项目提交 PR、发布 Issue 或者联系我。详细要求请参考[博客的友链页面](https://subilan.win/pages/blogroll)。

## 目录结构

|                  目录或文件                  |                                        内容                                        |
| :------------------------------------------: | :--------------------------------------------------------------------------------: |
| `src`, `public`, `assets`, `components`, ... |                                 前端相关的开发文件                                 |
|                    `data`                    | 数据文件，包括编写的 Markdown 文件（`data/posts`），友链数据（`blogrolls.json`）等 |
|                  `build.ts`, `ogNode.jsx`                  |                                      编译脚本和 OG Image 元素                                     |

## 技术信息

技术栈
-   Nuxt 3
-   TypeScript
-   [Tailwind CSS](https://tailwindcss.com)
-   [unified](https://unifiedjs.com)

运行环境

-   Node.js 22 LTS
-   Vercel（部署）
-   阿里云 OSS（图床）

## 协议

代码以 MIT 协议开放。

站点上的原创内容（含图片、文本）以 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh)（署名-相同方式）协议发布。
