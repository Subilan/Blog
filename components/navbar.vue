<template>
  <nav class="nav">
    <div class="mobile-menu-btn" @click="pageSwitcherModel = !pageSwitcherModel">
      <icon :path="mdiMenu"/>
    </div>
    <img src="@/assets/avatar.jpg" alt="avatar"/>
    <span class="site-title">
      <router-link to="/">Subilan's Blog</router-link>
    </span>
    <div class="search-btn hoverable" @click="searchModal = true">
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
    <client-only>
      <div class="pc-dark-toggle-btn" @click="toggleDarkmode">
        <icon :path="mdiWeatherSunny" v-if="!darkMode || forceMode === 'light'"/>
        <icon :path="mdiWeatherNight" v-if="(darkMode && forceMode !== 'light') || forceMode === 'dark'"/>
      </div>
    </client-only>
  </nav>
  <search v-model="searchModal"/>
  <page-switcher v-model="pageSwitcherModel"/>
</template>

<script setup lang="ts">
import {mdiMagnify, mdiMenu, mdiMoonWaningCrescent, mdiThemeLightDark, mdiWeatherNight, mdiWeatherSunny} from "@mdi/js";
import {pages} from "~/data/config";
import isMacOS from "~/utils/isMacOS";
import {usePreferredDark} from "@vueuse/core";
import toggleDarkmode from "~/utils/toggleDarkmode";

const searchModal = ref(false);
const pageSwitcherModel = ref(false);

const forceMode = useState('force-mode');
const darkMode = usePreferredDark();
</script>

<style lang="scss">
@use "@/assets/global";
@use "@/assets/dark";

.mobile-menu-btn {
  margin-right: 16px;
  cursor: pointer;

  @media (min-width: 768px) {
    display: none;
  }
}

.dark .pc-dark-toggle-btn:hover {
  border-color: rgba(dark.$darkPrimary, .1);
}

.pc-dark-toggle-btn {
  margin-left: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  cursor: pointer;
  background: transparent;
  border-radius: 100%;
  height: 18px;
  width: 18px;
  transition: all .2s ease;
  border: 1px solid transparent;

  &:hover {
    background: rgba(#1de9b6, .1);
    border-color: rgba(0, 0, 0, .1);
  }

  svg {
    height: 18px;
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
  display: flex;
  align-items: center;

  @media (min-width: 768px) {
    display: none;
  }
}

.search-btn {
  display: flex;
  align-items: center;
  font-size: 14px;
  padding: 4px 6px;
  line-height: 1;
  border-radius: 5px;
  gap: 4px;
  margin-left: 16px;
  cursor: pointer;

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
    color: #004d40;
  }
}
</style>