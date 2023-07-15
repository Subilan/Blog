import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";

const routes: RouteRecordRaw[] = [{
    name: "page",
    path: "/",
    component: () => import("@/Page.vue"),
    children: [{
        name: "about",
        path: "/About",
        component: () => import("@/pages/About.vue"),
        meta: {filename: "About", uuid: "76de1484-e3ae-55cc-86aa-e30a285baf31", isStandalone: true}
    }, {
        name: "contact",
        path: "/Contact",
        component: () => import("@/pages/Contact.vue"),
        meta: {filename: "Contact", uuid: "e612ac32-c268-59bc-b1ba-e0b342dda95b", isStandalone: true}
    }, {
        name: "friends",
        path: "/Friends",
        component: () => import("@/pages/Friends.vue"),
        meta: {filename: "Friends", uuid: "1c25dfca-c2bb-50a7-a0fc-0e9a60a76b06", isStandalone: true}
    }, {
        name: "pgp",
        path: "/PGP",
        component: () => import("@/pages/PGP.vue"),
        meta: {filename: "PGP", uuid: "7b231c22-cce7-5469-93a2-de8695c76080", isStandalone: true}
    }]
}, {
    name: "posts",
    path: "/posts",
    component: () => import("@/Post.vue"),
    children: [{
        name: "post-2020-recall",
        path: "2020-Recall",
        component: () => import("@/views/2020-Recall.vue"),
        meta: {filename: "2020-Recall", uuid: "701a4eea-1104-59a9-a910-fbe6d5444db5", isStandalone: false}
    }, {
        name: "post-2021-recall",
        path: "2021-Recall",
        component: () => import("@/views/2021-Recall.vue"),
        meta: {filename: "2021-Recall", uuid: "9d7373fe-4e27-5354-8db6-cec2298e09b7", isStandalone: false}
    }, {
        name: "post-2022-recall",
        path: "2022-Recall",
        component: () => import("@/views/2022-Recall.vue"),
        meta: {filename: "2022-Recall", uuid: "7e4eb0ee-a4df-50f0-abb8-88a6786fbf76", isStandalone: false}
    }, {
        name: "post-action-ethnic",
        path: "Action-Ethnic",
        component: () => import("@/views/Action-Ethnic.vue"),
        meta: {filename: "Action-Ethnic", uuid: "85b77676-092f-5f66-a1fb-50f6d88ac79f", isStandalone: false}
    }, {
        name: "post-array-date-and-category",
        path: "Array-Date-and-Category",
        component: () => import("@/views/Array-Date-and-Category.vue"),
        meta: {filename: "Array-Date-and-Category", uuid: "5a309181-328c-5230-be8f-7cfa3d0958ba", isStandalone: false}
    }, {
        name: "post-barren-fungus",
        path: "Barren-Fungus",
        component: () => import("@/views/Barren-Fungus.vue"),
        meta: {filename: "Barren-Fungus", uuid: "40acf917-ebe5-5914-919e-6dfbd715aec4", isStandalone: false}
    }, {
        name: "post-build-a-blog-using-vuepress",
        path: "Build-a-Blog-Using-VuePress",
        component: () => import("@/views/Build-a-Blog-Using-VuePress.vue"),
        meta: {
            filename: "Build-a-Blog-Using-VuePress",
            uuid: "34117c7c-f531-5cbe-9c45-f0ae727848dc",
            isStandalone: false
        }
    }, {
        name: "post-bukkit-object-pool-picking-and-updating",
        path: "Bukkit-Object-Pool-Picking-And-Updating",
        component: () => import("@/views/Bukkit-Object-Pool-Picking-And-Updating.vue"),
        meta: {
            filename: "Bukkit-Object-Pool-Picking-And-Updating",
            uuid: "9da2cd0d-10e0-59d5-a89d-0b4b6b77aede",
            isStandalone: false
        }
    }, {
        name: "post-bukkit-webserver-in-minecraft",
        path: "Bukkit-Webserver-In-Minecraft",
        component: () => import("@/views/Bukkit-Webserver-In-Minecraft.vue"),
        meta: {
            filename: "Bukkit-Webserver-In-Minecraft",
            uuid: "b36277c4-2c3c-5219-bcea-193a6ac51107",
            isStandalone: false
        }
    }, {
        name: "post-forge-development-diary",
        path: "Forge-development-diary",
        component: () => import("@/views/Forge-development-diary.vue"),
        meta: {filename: "Forge-development-diary", uuid: "fbe2f969-9990-5cbc-8b84-0afaa3812b6c", isStandalone: false}
    }, {
        name: "post-hello-world",
        path: "Hello-World",
        component: () => import("@/views/Hello-World.vue"),
        meta: {filename: "Hello-World", uuid: "4f6abb11-b6ec-50ce-88f7-5c51e9cd0634", isStandalone: false}
    }, {
        name: "post-menu-handling",
        path: "Menu-Handling",
        component: () => import("@/views/Menu-Handling.vue"),
        meta: {filename: "Menu-Handling", uuid: "38a821d6-d947-5eb6-a77f-3c81195ee032", isStandalone: false}
    }, {
        name: "post-minecraft-sponge-server-tutorial",
        path: "Minecraft-Sponge-Server-Tutorial",
        component: () => import("@/views/Minecraft-Sponge-Server-Tutorial.vue"),
        meta: {
            filename: "Minecraft-Sponge-Server-Tutorial",
            uuid: "688d53bf-9266-573c-a485-9873a014c4a1",
            isStandalone: false
        }
    }, {
        name: "post-my-add",
        path: "My-ADD",
        component: () => import("@/views/My-ADD.vue"),
        meta: {filename: "My-ADD", uuid: "3740f622-01dd-521a-b416-ea6f850d5c4a", isStandalone: false}
    }, {
        name: "post-only-the-river-flows",
        path: "Only-the-river-flows",
        component: () => import("@/views/Only-the-river-flows.vue"),
        meta: {filename: "Only-the-river-flows", uuid: "a3195ace-bc15-5a64-93d9-0f3a10efc69a", isStandalone: false}
    }, {
        name: "post-self",
        path: "Self",
        component: () => import("@/views/Self.vue"),
        meta: {filename: "Self", uuid: "c84f49a7-c508-5782-9f5c-3a99580c2d2c", isStandalone: false}
    }, {
        name: "post-semi-completed-articles",
        path: "Semi-completed-Articles",
        component: () => import("@/views/Semi-completed-Articles.vue"),
        meta: {filename: "Semi-completed-Articles", uuid: "547720c7-d598-5100-9019-6dc220006cba", isStandalone: false}
    }, {
        name: "post-shennongjia",
        path: "Shennongjia",
        component: () => import("@/views/Shennongjia.vue"),
        meta: {filename: "Shennongjia", uuid: "c3d76b2a-69fa-5976-8cf0-cdafa24418ef", isStandalone: false}
    }, {
        name: "post-simple-authenticating-system",
        path: "Simple-Authenticating-System",
        component: () => import("@/views/Simple-Authenticating-System.vue"),
        meta: {
            filename: "Simple-Authenticating-System",
            uuid: "bb90f77a-8deb-5f42-9117-6adf3def7986",
            isStandalone: false
        }
    }, {
        name: "post-simple-vote-logic-1",
        path: "Simple-Vote-Logic-1",
        component: () => import("@/views/Simple-Vote-Logic-1.vue"),
        meta: {filename: "Simple-Vote-Logic-1", uuid: "f384abf2-dff2-586a-acaa-402302fae253", isStandalone: false}
    }, {
        name: "post-simple-vue-tricks-2",
        path: "Simple-Vue-Tricks-2",
        component: () => import("@/views/Simple-Vue-Tricks-2.vue"),
        meta: {filename: "Simple-Vue-Tricks-2", uuid: "3c0a2012-f1be-5190-9a47-2d5112f04b6f", isStandalone: false}
    }, {
        name: "post-simple-vue-tricks",
        path: "Simple-Vue-Tricks",
        component: () => import("@/views/Simple-Vue-Tricks.vue"),
        meta: {filename: "Simple-Vue-Tricks", uuid: "4df5b80d-d849-5b2b-9943-bbe5c11da8cc", isStandalone: false}
    }, {
        name: "post-smalltalk",
        path: "Smalltalk",
        component: () => import("@/views/Smalltalk.vue"),
        meta: {filename: "Smalltalk", uuid: "d91574d9-1c38-5966-a62c-0371bf6ba588", isStandalone: false}
    }, {
        name: "post-something-about-something",
        path: "Something-About-Something",
        component: () => import("@/views/Something-About-Something.vue"),
        meta: {filename: "Something-About-Something", uuid: "ab4c7cbc-d3ab-506b-9dc4-92065ee6fb16", isStandalone: false}
    }, {
        name: "post-terrible-computer-accident-caused-by-hdr",
        path: "Terrible-Computer-Accident-Caused-by-HDR",
        component: () => import("@/views/Terrible-Computer-Accident-Caused-by-HDR.vue"),
        meta: {
            filename: "Terrible-Computer-Accident-Caused-by-HDR",
            uuid: "02cc3402-a831-5ddf-98e4-48166dba7f1d",
            isStandalone: false
        }
    }, {
        name: "post-the-clown-is-myself",
        path: "The-Clown-Is-Myself",
        component: () => import("@/views/The-Clown-Is-Myself.vue"),
        meta: {filename: "The-Clown-Is-Myself", uuid: "50086278-4c4b-5ebf-a11c-f2942796bc6f", isStandalone: false}
    }, {
        name: "post-the-depression",
        path: "The-Depression",
        component: () => import("@/views/The-Depression.vue"),
        meta: {filename: "The-Depression", uuid: "5de74c21-a639-5096-b916-a250f9d58575", isStandalone: false}
    }, {
        name: "post-the-institutionalization",
        path: "The-Institutionalization",
        component: () => import("@/views/The-Institutionalization.vue"),
        meta: {filename: "The-Institutionalization", uuid: "4666349a-3abc-559b-894b-5f3db5160f17", isStandalone: false}
    }, {
        name: "post-the-overinterpretation",
        path: "The-Overinterpretation",
        component: () => import("@/views/The-Overinterpretation.vue"),
        meta: {filename: "The-Overinterpretation", uuid: "a43eb907-7ba4-5687-8de9-fac15763cc73", isStandalone: false}
    }, {
        name: "post-thoughts-about-minecraft-server",
        path: "Thoughts-About-Minecraft-Server",
        component: () => import("@/views/Thoughts-About-Minecraft-Server.vue"),
        meta: {
            filename: "Thoughts-About-Minecraft-Server",
            uuid: "bbe5d4e1-633d-5712-8e83-bb73a94d98cc",
            isStandalone: false
        }
    }, {
        name: "post-typical-crud",
        path: "Typical-CRUD",
        component: () => import("@/views/Typical-CRUD.vue"),
        meta: {filename: "Typical-CRUD", uuid: "1bbf2764-3db1-51b0-9479-dfddf2039270", isStandalone: false}
    }, {
        name: "post-unknown-mysql-issue",
        path: "Unknown-MySQL-Issue",
        component: () => import("@/views/Unknown-MySQL-Issue.vue"),
        meta: {filename: "Unknown-MySQL-Issue", uuid: "cb8c8065-b828-55e2-8a67-e1129951d346", isStandalone: false}
    }]
}];
const router = createRouter({history: createWebHistory(), routes});
export default router