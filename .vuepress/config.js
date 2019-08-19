module.exports = {
    title: "Subilan's Blog",
    description: "再次重演鸽子奇迹",
    themeConfig: {
        title: "Subilan's Blog",
        nav: [
            { text: "Blog", link: "/" },
            { text: "Friends", link: "/Friends.html" },
            { text: "About", link: "/About.html" },
            { text: "Contact", link: "/Contact.html" },
        ],
        lastUpdated: "最后更新于",
        hiddenPages: [
            "/",
            "/About.html",
            "/Friends.html",
            "/Contact.html",
        ],
        search: true,
        searchMaxSuggestions: 10
    },
    dest: "./public",
    plugins: {
        "@vuepress/last-updated": {
            transformer: (timestamp) => {
                const moment = require("moment");
                moment.locale("zh-CN");
                return moment(timestamp).fromNow();
            }
        },
        "@vuepress/medium-zoom": {
            selector: ".theme-default-content :not(a) > img",
        },
        mathjax: {
            target: "svg",
        },
    },
    head: [
        ["link", { rel: "icon", href: "https://fnmdp.oss-cn-beijing.aliyuncs.com/assets/avatar.png"}]
    ]
}