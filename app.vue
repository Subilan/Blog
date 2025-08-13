<template>
  <!-- <nuxt-loading-indicator color="#000" :throttle="0"/> -->
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<script setup>
  import { useFavicon, usePreferredDark } from "@vueuse/core";
  import getPostContent from "~/utils/getPostContent.js";
  import getSiteName from "~/utils/getSiteName.js";

  const route = useRoute();

  const sitename = getSiteName();

  const titleWithPrefix = computed(() => {
    if (route.params.postname) {
      return `${sitename} - ${getPostContent(route.params.postname).title}`
    }
    return `${sitename} - ${route.meta.title}`;
  });

  const titleWithSuffix = computed(() => {
    if (route.params.postname) {
      return `${getPostContent(route.params.postname).title} - ${sitename}`
    }
    return `${route.meta.title} - ${sitename}`;
  });

  onMounted(() => {
    const isDark = usePreferredDark();
    useFavicon('/avatar.jpg', {
      rel: 'icon'
    })
  });

  const { themeFont, themeColor, themePalette } = useTheme();

  const htmlClasses = computed(() => [
    `font-${themeFont.value.replace(/\s/g, '-')}`,
    `color-${themeColor.value}`
  ]);
  const currentFontSheets = computed(() => useFontSheets(themeFont.value).value);

  watch(htmlClasses, v => console.log(v))

  useHead({
    meta: [
      {
        property: 'og:title',
        content: titleWithPrefix
      }
    ],
    link: currentFontSheets,
    title: titleWithSuffix,
    htmlAttrs: {
      class: htmlClasses
    }
  })
</script>

<style lang="scss">
@use '@/assets/global';
</style>