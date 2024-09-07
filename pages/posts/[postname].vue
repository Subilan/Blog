<template>
  <div class="container">
    <article>
      <h1>{{ post.title }}</h1>
      <div class="extra">
        <span><icon :path="mdiClockOutline"/> {{ post.date }}</span>
        <span><icon :path="mdiFormatTextVariant"/> 约 {{ post.wordCount }} 字</span>
        <span v-if="post.cate"><icon :path="mdiShapeOutline"/> {{ post.cate }}</span>
      </div>
      <div class="content" v-html="post.content"/>
    </article>
  </div>
</template>

<script setup>
import getPostContent from "@/utils/getPostContent.js";
import mediumZoom from "medium-zoom";
import {mdiClockOutline, mdiFormatTextVariant, mdiShapeOutline} from "@mdi/js";
import {usePreferredDark} from "@vueuse/core";

const slug = useRoute().params.postname;
const post = getPostContent(slug.toLowerCase());
const dark = usePreferredDark();

onMounted(() => {
  mediumZoom('article .content img', {
    background: dark.value ? 'rgba(255, 255, 255, .2)' : 'rgba(0, 0, 0, .6)'
  })
})

definePageMeta({
  layout: 'post'
})
</script>

<style lang="scss">
@use "@/assets/languagenames";

.container {
  max-width: 800px;
  margin: 0 auto;
}

.content {
  padding: 16px 0;
}

.extra {
  display: flex;
  align-items: center;
  font-size: 14px;

  span:not(:last-child)::after {
    content: '·';
    margin: 0 4px;
  }

  span {
    display: flex;
    align-items: center;
    gap: 5px;
    line-height: 1;

    svg {
      width: 16px;
      color: #009688;
    }
  }
}
</style>