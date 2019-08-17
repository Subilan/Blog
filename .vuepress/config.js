module.exports = {
    title: "Subilan's Blog",
    description: "再次重演鸽子奇迹",
    themeConfig: {
        nav: [
            { text: "Blog", link: "/" },
            { text: "Friends", link: "/friends" },
            { text: "About", link: "/about" },
            { text: "Contact", link: "/contact" },
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
    dest: "./public"
}