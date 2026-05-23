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

const fontCookie = useCookie('subilan-blog-font-style');
const fontStyle = useState('font-style', () => fontCookie.value || 'sans');

const isSerif = computed(() => fontStyle.value === 'serif');

const fontCssLinks = [
  { rel: 'stylesheet', href: '/fonts/source-serif/source-serif.css' },
  { rel: 'stylesheet', href: '/fonts/noto-serif-sc/noto-serif-sc.css' }
];

onMounted(() => {
  document.documentElement.classList.toggle('serif', isSerif.value);
  if (isSerif.value) {
    fontCssLinks.forEach(l => {
      const link = document.createElement('link');
      link.rel = l.rel;
      link.href = l.href;
      link.setAttribute('data-font-style', 'true');
      document.head.appendChild(link);
    });
  }
});

watch(isSerif, (val) => {
  if (import.meta.client) {
    document.documentElement.classList.toggle('serif', val);
    if (val) {
      fontCssLinks.forEach(l => {
        const link = document.createElement('link');
        link.rel = l.rel;
        link.href = l.href;
        link.setAttribute('data-font-style', 'true');
        document.head.appendChild(link);
      });
    } else {
      document.head.querySelectorAll('link[data-font-style]').forEach(l => l.remove());
    }
  }
});

watch(fontStyle, (val) => {
  fontCookie.value = val;
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
    },
    {
      innerHTML: `(function(){var c=document.cookie.match(/(?:^|;\\s*)subilan-blog-font-style=([^;]+)/);if(c&&c[1]==='serif'){var l1=document.createElement('link');l1.rel='stylesheet';l1.href='/fonts/source-serif/source-serif.css';var l2=document.createElement('link');l2.rel='stylesheet';l2.href='/fonts/noto-serif-sc/noto-serif-sc.css';document.head.appendChild(l1);document.head.appendChild(l2);document.documentElement.classList.add('serif')}})()`,
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
