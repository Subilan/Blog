<template>
  <div class="flex flex-col gap-8">
    <div class="flex flex-col gap-2">
      <h1 class="text-4xl font-bold cursor-pointer" @click="$router.push('/')">solitude scroll</h1>
      <div class="flex items-center gap-2 *:text-neutral-500 *:hover:text-neutral-900 *:hover:underline">
        <router-link to="/pages/blogroll">友链</router-link>
        <router-link to="/pages/pgp">PGP</router-link>
        <router-link to="/pages/about">关于</router-link>
        <!-- <a target="_blank" href="https://photos.subilan.win">相册</a> -->
      </div>
    </div>
    <div class="flex items-center gap-3 [&_svg]:h-6 [&_svg]:w-6">
      <a href="https://github.com/Subilan" target="_blank">
        <GitHub />
      </a>
      <a href="mailto:christophersubilan@gmail.com">
        <icon :path="mdiEmailOutline" />
      </a>
      <a href="https://space.bilibili.com/35413001" target="_blank">
        <Bilibili class="hover:fill-blue-400" />
      </a>
    </div>
  </div>
  <hr class="my-10 text-neutral-200" />
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

definePageMeta({
  title: '首页'
});
</script>