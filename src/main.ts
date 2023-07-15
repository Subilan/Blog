import { createApp } from 'vue'
import App from './App.vue'
import './main.less'
import router from "@/router";
import Blogroll from "@/components/Blogroll.vue";
import ExampleLink from "@/components/ExampleLink.vue";
import nProgress from "nprogress";


router.beforeEach((to, from, next) => {
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
    .use(router)
    .mount('#app');
