<template>
  <div class="container">
    <article>
      <h1>{{ post.title }}</h1>
      <div class="extra">
        <span><icon :path="mdiClockOutline"/> {{ post.date }}</span>
        <span><icon :path="mdiFormatTextVariant"/> 约 {{ post.wordCount }} 字</span>
        <span><icon :path="mdiShapeOutline"/> {{ post.cate }}</span>
      </div>
      <div class="content" v-html="post.content"/>
    </article>
  </div>
</template>

<script setup>
import getPostContent from "~/utils/getPostContent.js";
import mediumZoom from "medium-zoom";
import {mdiClockOutline, mdiFormatTextVariant, mdiShapeOutline} from "@mdi/js";

const slug = useRoute().params.postname;
const post = getPostContent(slug.toLowerCase());

onMounted(() => {
  mediumZoom('article .content img')
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

p:last-child {
  margin-bottom: 0;
}

p:first-child {
  margin-top: 0;
}

.notice {
  padding: 16px;
  margin: 16px 0;

  &.tip {
    background: #e0f2f1;
    border-left: 5px solid #009688;

    strong {
      color: #004d40;
    }
  }

  &.warning {
    background: #fff8e1;
    border-left: 5px solid #ffc107;

    strong {
      color: #7d2c00;
    }
  }

  &.danger {
    background: #ffebee;
    border-left: 5px solid #f44336;
  }
}
</style>