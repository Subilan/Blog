<template>
  <article class="prose-lg">
    <h1>友链</h1>
    <p>友链（blogroll）是一种将互联网上的一个个孤岛似的个人网站联系起来的一种高效方式。这使得各个网站可以彼此串通，使访问者有更多的机会光顾每一个相连接的网站。</p>
    <p>下面收录了本站自 2019 年创建以来交换过的有效博客网站链接，单击卡片即可跳转到他们的网站。</p>
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
    <p>如希望交换友链，欢迎联系我，方式在首页顶部；或者直接在 GitHub 上<a class="ext" target="_blank"
        href="https://github.com/Subilan/Blog">本博客仓库</a>发
      PR，修改项目文件中的 data/blogroll.json。</p>
    <p>在考虑交换之前，请确保你的网站开启了 HTTPS，有独立的域名或者 *.js.org、*.github.io 等高可信度组织提供的免费域名，同时有几篇原创的任意内容。<a
        @click="showReason = !showReason">{{ showReason ? '收起要求' : '为什么有这些要求？' }}</a></p>
    <ul v-if="showReason">
      <li>网站开启 HTTPS 是现代互联网安全的基本需求，且个人 HTTPS 因为 Let's Encrypt 等的存在，几乎没有成本。</li>
      <li>要求有独立域名/高可信度组织免费域名，是因为希望你的网站属于你自己。社交平台账号等的链接不具有独立性，无法实现友链的目的（将网站连接在一起）。</li>
      <li>要求有几篇原创的任意内容，是希望交换的网站的内容能代表作者本人。爬虫、广告、搬运等类型的网站设立的目的不是个人记录，不考虑交换此类网站的友链。</li>
    </ul>
    <p>如有意添加本站友链，请参考下面的信息。</p>
    <ul>
      <li v-for="x in Object.keys(thisInfo)">
        {{ x }}：{{ thisInfo[x] }}
      </li>
    </ul>
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