<template>
  <!-- <nuxt-loading-indicator color="#000" :throttle="0"/> -->
  <nuxt-layout>
    <nuxt-page/>
  </nuxt-layout>
</template>

<script setup>
import {useFavicon, usePreferredDark} from "@vueuse/core";
import getPostContent from "~/utils/getPostContent.js";
import getSiteName from "~/utils/getSiteName.js";

const route = useRoute();

const sitename = getSiteName();

const titleWithPrefix = computed(() => `${sitename} - ${route.meta.title}`);
const titleWithSuffix = computed(() => {
  if (route.params.postname) {
    return `${getPostContent(route.params.postname).title} - ${sitename}`
  }
  return `${route.meta.title} - ${sitename}`;
});
const darkMode = usePreferredDark();

useHead({
  meta: [
    {
      property: 'og:title',
      content: titleWithPrefix
    }
  ],
  link: [
    {
      rel: 'stylesheet',
      href: '/fonts/literata/literata.css'
    },
    {
      rel: 'stylesheet',
      href: '/fonts/noto-serif-sc/noto-serif-sc.css'
    }
  ],
  title: titleWithSuffix,
  htmlAttrs: {
    // class: darkMode.value ? 'dark' : ''
  }
})

onMounted(() => {
  const isDark = usePreferredDark();
  useFavicon('/avatar.jpg', {
    rel: 'icon'
  })
})
</script>

<style lang="scss">
@use '@/assets/global';
</style>