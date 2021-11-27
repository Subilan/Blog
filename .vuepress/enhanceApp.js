import mdiVue from "mdi-vue/v2";
import * as mdijs from "@mdi/js";

export default ({
    Vue,
    options,
    router,
    siteData
}) => {
    Vue.use(mdiVue, {
        icons: mdijs,
    });
}