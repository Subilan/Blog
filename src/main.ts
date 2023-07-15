import {createApp} from 'vue'
import App from './App.vue'
import './main.less'
import router from "@/router";
import Blogroll from "@/components/Blogroll.vue";
import ExampleLink from "@/components/ExampleLink.vue";
import nProgress from "nprogress";
import TwoYearsAgo from "@/snip-components/two-years-ago.vue";


function getTitle(path: string, meta: PageMeta) {
    if (meta.title) {
        return `${meta.title} | Subilan's Blog`
    }
    return "Subilan's Blog"
}

interface PageMeta {
    filename: string,
    title: string,
    uuid: string,
    isStandalone: boolean
}

router.beforeEach((to, from, next) => {
    window.document.title = getTitle(to.path, to.meta as unknown as PageMeta);
    nProgress.start();
    next();
})

router.afterEach(() => {
    window.scrollTo({
        top: 0
    });
    nProgress.done();
})

createApp(App)
    .component("blogroll", Blogroll)
    .component("example-link", ExampleLink)
    .component("two-years-ago", TwoYearsAgo)
    .use(router)
    .mount('#app');
