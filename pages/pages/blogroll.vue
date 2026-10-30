<template>
  <article class="prose-lg">
    <h1>友链</h1>
    <blockquote>友链（blogroll）是一种将互联网上的一个个孤岛似的个人网站联系起来的一种高效方式。这使得各个网站可以彼此串通，使访问者有更多的机会光顾每一个相连接的网站。</blockquote>
    <p>下面收录了本站自 2019 年创建以来交换过的有效博客网站链接，单击卡片即可跳转到他们的网站。</p>
    <p>若有兴趣交换友链，可在<a class="ext" target="_blank"
        href="https://github.com/Subilan/Blog">本博客仓库</a>提交PR（按照数组元素格式修改项目文件中的data/blogroll.json）。</p>
    <div class="flex items-stretch flex-wrap not-prose gap-3 mb-5">
      <a class="p-4 rounded-lg shadow-sm hover:opacity-80 active:opacity-70 flex items-center bg-center bg-cover bg-no-repeat gap-3"
        target="_blank" :href="x.href" v-for="x in blogrolls.filter(x => !x.hidden)" :class="{ 'text-white': x.light }"
        :style="x.background.startsWith('http') ? `background-image: url(${x.background})` : `background: ${x.background}`">
        <nuxt-img placeholder="/blind.png" class="rounded-full h-[50px]" format="webp" :src="x.avatar" :alt="x.name" />
        <div class="flex flex-col">
          <div class="font-bold leading-snug">{{ x.name }}</div>
          <p class="text-sm">{{ x.description }}</p>
        </div>
      </a>
    </div>
  </article>
</template>

<script setup>
import blogrolls from '@/data/blogrolls.json'

const showReason = ref(false);

const thisInfo = {
  '网站名称': 'SolitudeScroll',
  '网站介绍': 'Satellite yourself.',
  '网站代表色': '#009688',
  '网站地址': 'https://subilan.win',
  '头像': 'https://fnmdp.oss-cn-beijing.aliyuncs.com/assets/avatar.png'
}

definePageMeta({
  title: '友链'
})
</script>