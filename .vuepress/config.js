module.exports = {
    title: "Subilan's Blog",
    description: "再次重演鸽子奇迹",
    serviceWorker: true,
    theme: "simple-blog",
    themeConfig: {
        author: "Subilan's Blog",
        navbar: {
            "Friends": "/friends/",
            "About": "/about/",
        },
        copyrightText: "如无特殊说明，所有内容使用 MIT 许可协议",
        year: "2019",

    },
    plugins: ["@vuepress/blog"]
}