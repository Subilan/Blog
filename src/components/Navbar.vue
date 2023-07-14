<template>
  <nav class="navbar">
    <div class="page-title" @click="router.push(`/`)">
      Subilan's Blog
    </div>
    <search-box/>
    <div class="nav-spacer" style="flex: 1"/>
    <div class="page-list">
      <div class="page" v-for="x in Object.keys(pages)" @click="">{{ x }}</div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import SearchBox from './SearchBox.vue';
import {useRouter} from "vue-router";

const pages = {
  "主页": "/",
  "友链": "/links.html",
  "关于": "/about.html",
  "联系": "/contact.html",
  "公钥": "/peg.html"
}

const router = useRouter();
</script>

<style lang="less">
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 20;
  padding: .7rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  height: 1.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;

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