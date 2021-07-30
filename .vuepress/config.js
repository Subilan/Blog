module.exports = {
    title: "Subilan's Blog",
    description: "Satellite yourself.",
    themeConfig: {
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
        "@vuepress/medium-zoom": {
            selector: ".theme-default-content :not(a) > img",
        },
        mathjax: {
            target: "chtml",
        },
    },
    head: [
        ["link", { rel: "icon", href: "https://fnmdp.oss-cn-beijing.aliyuncs.com/assets/avatar.png"}]
    ],
    markdown: {
        plugins: [
            "footnote",
            "sup",
            "sub"
        ]
    }
}