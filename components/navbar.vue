<template>
  <nav class="nav">
    <div class="mobile-menu-btn" @click="pageSwitcherModel = !pageSwitcherModel">
      <icon :path="mdiMenu"/>
    </div>
    <nuxt-img src="/avatar.jpg" format="webp" alt="avatar"/>
    <span class="site-title">
      <router-link to="/">{{ getSiteName() }}</router-link>
    </span>
    <div class="search-btn button" @click="searchModal = true">
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
      <div class="pc-dark-toggle-btn button" @click="toggleDarkmode">
        <icon :path="modeIcon"/>
      </div>
    </client-only>
  </nav>
  <search v-model="searchModal"/>
  <page-switcher v-model="pageSwitcherModel"/>
</template>

<script setup lang="ts">
import {mdiMagnify, mdiMenu, mdiWeatherNight, mdiWeatherSunny, mdiThemeLightDark} from "@mdi/js";
import {pages} from "~/data/config";
import isMacOS from "~/utils/isMacOS";
import toggleDarkmode from "~/utils/toggleDarkmode";
import getSiteName from "../utils/getSiteName";

const searchModal = ref(false);
const pageSwitcherModel = ref(false);

const forceMode = useState('force-mode');

const modeIcon = computed(() => {
  const mode = forceMode.value || 'auto';
  if (mode === 'auto') return mdiThemeLightDark;
  if (mode === 'dark') return mdiWeatherNight;
  return mdiWeatherSunny;
});
</script>
