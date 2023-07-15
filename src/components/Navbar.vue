<template>
  <nav class="navbar">
    <div class="page-title" @click="router.push(`/`)">
      Subilan's Blog
    </div>
    <search-box/>
    <div class="nav-spacer" style="flex: 1"/>
    <div class="page-list">
      <div class="page" :class="{active: route.path === `/`}" @click="$router.push('/')">首页</div>
      <div class="page" :class="{active: route.path === `/${x.filename}`}" v-for="x in pages" @click="router.push(`/${x.filename}`)">{{ x.title }}</div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import SearchBox from './SearchBox.vue';
import {useRoute, useRouter} from "vue-router";
import {getPages} from "@/utils";

const pages = getPages();

const router = useRouter();
const route = useRoute();
</script>

<style lang="less" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  padding: .7rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  height: 1.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  z-index: 1000;

  width: calc(100% - 3rem);
}

.page-title {
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
}

.page-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem
}

.page {
  cursor: pointer;
  position: relative;
  font-size: .9rem;

  &:hover,
  &.active {
    &::after {
      content: " ";
      height: 2px;
      background: #009688;
      display: block;
      width: 100%;
      position: absolute;
      top: calc(100% + .1rem);
    }
  }
}
</style>