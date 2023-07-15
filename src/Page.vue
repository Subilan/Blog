<template>
  <div class="page">
    <router-view/>
  </div>
  <home v-if="route.path === '/'"/>
</template>

<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import {useRoute} from "vue-router";
import {getPages} from "@/utils";
import Home from "@/components/Home.vue";

const route = useRoute();
const pages = getPages();
const pagedata = pages[route.meta.uuid as string];
const sortedFilenames = getPages().map(x => x.filename);

</script>

<style scoped lang="less">
@import "./typo.less";

.page {
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  max-width: 740px;
  margin: 0 auto;
  line-height: 1.7;
}
</style>

<style lang="less">
@import "./typo.less";

.content {
  .typo;
}
</style>