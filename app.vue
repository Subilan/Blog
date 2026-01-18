<template>
  <nuxt-layout>
    <nuxt-page />
  </nuxt-layout>
</template>

<script setup lang="ts">
import { useFavicon, usePreferredDark } from "@vueuse/core";
import getPostDigest from "~/utils/getPostDigests";
import getSiteName from "~/utils/getSiteName.js";

const route = useRoute();
const postname = computed(() => route.params.postname as string);

const sitename = getSiteName();

const titleWithPrefix = computed(() => {
  if (route.params.postname) {
    return `${sitename} - ${getPostDigest(postname.value)?.title}`
  }
  return `${sitename} - ${route.meta.title}`;
});

const titleWithSuffix = computed(() => {
  if (route.params.postname) {
    return `${getPostDigest(postname.value)?.title} - ${sitename}`
  }
  return `${route.meta.title} - ${sitename}`;
});

onMounted(() => {
  const isDark = usePreferredDark();
  useFavicon('/avatar.jpg', {
    rel: 'icon'
  })
});

useHead({
  meta: [
    {
      property: 'og:title',
      content: titleWithPrefix
    }
  ],
  link: [
    {
      rel: 'preconnect',
      href: 'https://rsms.me/'
    },
    {
      rel: 'stylesheet',
      href: 'https://rsms.me/inter/inter.css'
    }
  ],
  title: titleWithSuffix,
})
</script>