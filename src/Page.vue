<template>
  <home v-if="route.path === '/'"/>
  <div class="page" v-else>
    <router-view/>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import {getPages} from "@/utils";
import Home from "@/components/Home.vue";

const route = useRoute();
const pages = getPages();
</script>

<style scoped lang="less">
@import "./typo.less";

.page {
  padding: 1rem 1.5rem 1.5rem 2rem;
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