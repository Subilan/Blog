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

const cookie = useCookie('subilan-blog-dark-mode-indicator');
const forceMode = useState('force-mode', () => cookie.value || 'auto');
const preferredDark = usePreferredDark();

const isDark = computed(() => {
  if (forceMode.value === 'dark') return true;
  if (forceMode.value === 'light') return false;
  return preferredDark.value;
});

onMounted(() => {
  document.documentElement.classList.toggle('dark', isDark.value);
});

watch(isDark, (val) => {
  if (import.meta.client) {
    document.documentElement.classList.toggle('dark', val);
  }
});

watch(forceMode, (val) => {
  cookie.value = val;
});

onMounted(() => {
  useFavicon('/avatar.jpg', {
    rel: 'icon'
  });
});

useHead({
  script: [
    {
      innerHTML: `(function(){var c=document.cookie.match(/(?:^|;\\s*)subilan-blog-dark-mode-indicator=([^;]+)/);var m=c?c[1]:'auto';if(m==='dark'||(m==='auto'&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}})()`,
      type: 'text/javascript'
    }
  ],
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
