# Subilan's Blog

- 博客的域名是 <https://subilan.win>，也可以通过 <https://subilan.vercel.app> 访问。
- 博客使用 Nuxt 3 编写，采用本地 Markdown 编写+`build.cjs` 编译本地 json 数据后再被组件调用的模式。网站部署和托管使用 Vercel，图床使用阿里云 OSS。
    - WordPress (*2016-2017*)
    - Typecho, Hugo, Hexo (*2017-2019*)
    - VuePress 1 + GitHub Pages (*2019.08*-*2023.07*)
    - Vue 3 + GitHub Actions + Vercel (*2023.07.15*-*2024.09.04*)
    - Nuxt 3 + Vercel (*2024.09*-)

## 关于

### 友链申请

无限期开放友链申请！可以通过直接向本项目提交 PR，发布 Issue、发送邮件等进行申请。欢迎来交朋友~详情请参考[博客的友链页面](https://subilan.win/Blogroll)

### 主题

本站所使用的主题参考了 [VuePress](https://vuepress.vuejs.org/) 的默认主题，并经过了两次迭代。

### 网站/项目

- 目录结构
    - `src`, `public` — 前端相关的开发文件
    - `data` — 数据文件，包括编写的 markdown 文件（`data/posts`）
    - `build.js` — 构建脚本
- 本仓库开放 Pull Request，可用于添加友链、纠正错误。
- 本站域名 https://subilan.win 长期续费

## 协议

代码以 MIT 协议发布； 站点原创内容（含图片、文本）以 [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/deed.zh)（署名-相同方式）协议发布。
