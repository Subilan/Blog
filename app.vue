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
    },
    {
      rel: 'stylesheet',
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.27/dist/katex.min.css',
      integrity: 'sha384-Pu5+C18nP5dwykLJOhd2U4Xen7rjScHN/qusop27hdd2drI+lL5KvX7YntvT8yew',
      crossorigin: 'anonymous'
    }
  ],
  title: titleWithSuffix,
})
</script>