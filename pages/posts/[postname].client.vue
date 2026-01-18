<template>
  <div class="lg:max-w-187.5 mx-auto">
    <article>
      <div class="flex flex-col gap-3 mb-10">
        <h1 class="text-4xl font-bold leading-snug">{{ post.title }}</h1>
        <div class="text-xl text-neutral-500">{{ formatDate(post.frontmatter.date, 'YYYY 年 M 月 D 日') }}</div>
        <p class="text-neutral-500" v-if="dayDelta >= 730">提示：你正阅读的文章的发布日期距今已经有 <strong>{{ dayAgo
        }}</strong>了，其中的部分信息、个人观点或者措辞习惯等可能已经发生改变，因此仅供参考，请酌情阅读。</p>
      </div>
      <!-- <div class="toc-container" v-if="post.headings.length > 0">
        <div class="toc">
          <div class="toc-container-header">目录</div>
          <ul>
            <li v-for="x in post.headings">
              <a :href="`#${x.heading.s}`" v-html="x.heading.t" />
              <ul v-if="x.children.length > 0">
                <li v-for="y in x.children">
                  <a :href="`#${y.s}`" v-html="y.t" />
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div> -->
      <div :class="`
prose-lg [&_h1]:hidden
        `" v-html="post.content" />
    </article>
  </div>
</template>

<script setup lang="ts">
import mediumZoom from "medium-zoom";
import type { Result } from "~/build";

const post = await $fetch<Result>(`/data/${useRoute().params.postname}.json`)

const dayDelta = computed(() => (new Date().getTime() - new Date(post.frontmatter.date).getTime()) / (1000 * 3600 * 24));
const dayAgo = computed(() => getAgo(post.frontmatter.date, true));

onMounted(() => {
  mediumZoom('article .content img', {
    background: 'rgba(0, 0, 0, .6)'
  });
})

useSeoMeta({
  articleModifiedTime: post.frontmatter.date.replace(/\//g, '-')
})

// defineOgImageComponent('blog-post', {
//   postTitle: post.title,
//   date: post.frontmatter.date,
//   wordCount: post.analytics.cjkCharCount
// })
</script>