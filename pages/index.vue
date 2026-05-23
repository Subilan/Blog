<template>
  <div class="flex flex-col gap-8">
    <div class="flex items-start justify-between">
      <div class="flex flex-col gap-2">
        <h1 class="text-4xl font-bold cursor-pointer" @click="$router.push('/')">solitude scroll</h1>
        <div class="flex items-center gap-2 *:text-neutral-500 *:hover:text-neutral-900 *:hover:underline dark:*:text-neutral-400 dark:*:hover:text-neutral-100">
          <router-link to="/pages/blogroll">友链</router-link>
          <router-link to="/pages/pgp">PGP</router-link>
          <router-link to="/pages/about">关于</router-link>
          <a target="_blank" href="https://photos.subilan.win">相册</a>
        </div>
      </div>
      <div class="flex items-center gap-1">
        <div
          class="cursor-pointer p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors font-bold text-lg w-10 h-10 flex items-center justify-center select-none"
          @click="toggleFontStyle()"
          :title="fontStyleLabel"
        >
          A
        </div>
        <div
          class="cursor-pointer p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-white/5 text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100 transition-colors"
          @click="toggleDarkmode"
          :title="modeLabel"
        >
          <icon :path="modeIcon" class="w-6 h-6" />
        </div>
      </div>
    </div>
    <div class="flex items-center gap-3 [&_svg]:h-6 [&_svg]:w-6 [&_svg]:fill-current *:text-neutral-400 *:hover:text-neutral-900 dark:*:text-neutral-500 dark:*:hover:text-neutral-200">
      <a href="https://github.com/Subilan" target="_blank">
        <GitHub />
      </a>
      <a href="mailto:christophersubilan@gmail.com">
        <icon :path="mdiEmailOutline" />
      </a>
      <a href="https://space.bilibili.com/35413001" target="_blank">
        <Bilibili class="hover:!fill-blue-400" />
      </a>
    </div>
  </div>
  <hr class="my-10 border-neutral-200 dark:border-neutral-800" />
  <div class="flex flex-col gap-5">
    <div class="grid grid-cols-[100px_auto] items-center gap-3 hover:[&_>_span]:block" v-for="x in postdigests">
      <div class="text-sm font-mono">
        {{ x.date }}
      </div>
      <router-link class="text-lg underline" :to="`/posts/${x.id}`">
        {{ x.title }}
      </router-link>
      <!-- <span class="hidden text-neutral-400">{{ x.analytics.cjkCharCount }} 字 · {{ (x.analytics.size / 1024).toFixed(0) }} KB</span> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import postdigests from '@/data/postdigests.json';
import { definePageMeta } from "#imports";
import { mdiEmailOutline } from "@mdi/js";
import GitHub from '~/assets/svg/github.svg';
import Bilibili from '~/assets/svg/bilibili.svg'
import toggleDarkmode from '~/utils/toggleDarkmode';
import toggleFontStyle from '~/utils/toggleFontStyle';
import { mdiWeatherSunny, mdiWeatherNight, mdiThemeLightDark } from '@mdi/js';

definePageMeta({
  title: '首页'
});

const forceMode = useState('force-mode');
const fontStyle = useState('font-style', () => 'sans');

const fontStyleLabel = computed(() => {
  return fontStyle.value === 'serif' ? '衬线体' : '无衬线体';
});

const modeIcon = computed(() => {
  const mode = forceMode.value || 'auto';
  if (mode === 'auto') return mdiThemeLightDark;
  if (mode === 'dark') return mdiWeatherNight;
  return mdiWeatherSunny;
});

const modeLabel = computed(() => {
  const mode = forceMode.value || 'auto';
  if (mode === 'auto') return '自动 · 跟随系统';
  if (mode === 'dark') return '夜间模式';
  return '日间模式';
});
</script>
