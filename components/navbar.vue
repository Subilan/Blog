<template>
  <nav class="nav">
    <div class="mobile-menu-btn" @click="pageSwitcherModel = !pageSwitcherModel">
      <icon :path="mdiMenu"/>
    </div>
    <img src="~/assets/avatar.jpg" alt="avatar"/>
    <span class="site-title">
      <router-link to="/">Subilan's Blog</router-link>
    </span>
    <div class="search-btn" @click="searchModal = true">
      <icon :path="mdiMagnify"/>
      搜索
      <client-only><span class="hotkey">{{ isMacOS() ? '⌘' : 'Ctrl' }}+K</span></client-only>
    </div>
    <div class="spacer"/>
    <div class="nav-links">
      <div class="nav-link" v-for="x in pages">
        <router-link :to="x.to" class="nav-link-inner">{{ x.name }}</router-link>
      </div>
    </div>
    <div class="mobile-search-btn" @click="searchModal = true">
      <icon :path="mdiMagnify"/>
    </div>
  </nav>
  <search v-model="searchModal"/>
  <page-switcher v-model="pageSwitcherModel"/>
</template>

<script setup lang="ts">
import {mdiMagnify, mdiMenu} from "@mdi/js";
import {pages} from "~/data/config";
import isMacOS from "~/utils/isMacOS";

const searchModal = ref(false);
const pageSwitcherModel = ref(false);
</script>

<style lang="scss">
@use "@/assets/global";

.mobile-menu-btn {
  margin-right: 16px;
  cursor: pointer;

  @media (min-width: 768px) {
    display: none;
  }
}

.nav {
  display: flex;
  align-items: center;
  background: white;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  box-shadow: 0 0 5px rgba(0, 0, 0, .1);
  padding: 12px 16px;
  position: fixed;
  top: 0;
  width: 100%;
  box-sizing: border-box;
  z-index: 100;
  height: global.$navbarHeight;

  @media print {
    display: none;
  }

  > img {
    width: 30px;
    height: 30px;
    object-fit: cover;
    margin-right: 12px;
  }

  .site-title {
    font-size: 20px;
    font-weight: 600;

    a {
      text-decoration: none;
      color: black;
    }
  }

  .nav-links {
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 768px) {
      display: none;
    }
  }

  .nav-link-inner {
    text-decoration: none;
    color: black;
    padding-bottom: 1px;
    font-size: 14px;
    transition: all .2s ease;
    border-bottom: 2px solid transparent;

    &:hover {
      border-bottom: 2px solid #b2dfdb;
    }
  }

  .nav-link-inner.router-link-exact-active {
    border-bottom: 2px solid #009688;
  }
}

.mobile-search-btn {
  cursor: pointer;

  @media (min-width: 768px) {
    display: none;
  }
}

.search-btn {
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 4px 6px;
  border: 1px solid rgba(0, 0, 0, .1);
  transition: all .2s ease;
  line-height: 1;
  cursor: pointer;
  border-radius: 5px;
  gap: 4px;
  margin-left: 16px;

  @media (max-width: 768px) {
    display: none;
  }

  svg {
    height: 16px;
    width: 16px;
  }

  .hotkey {
    font-size: 10px;
    color: #aaa;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 0 rgba(0, 0, 0, .1);
    border: 1px solid rgba(#004d40, .8);
  }
}
</style>