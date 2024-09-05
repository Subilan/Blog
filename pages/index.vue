<template>
  <div class="articles">
    <router-link class="article" v-for="x in getPostDigests()" :to="`/posts/${x.slug}`">
      <span class="view-right-now-message">打开 <icon :path="mdiArrowTopRight"/></span>
      <h2>{{ x.title }}</h2>
      <div class="meta">
        <span>{{ x.date }}</span>
        <span>约 {{ x.wordCount }} 字</span>
        <span v-if="x.cate">{{ x.cate }}</span>
      </div>
      <p v-if="x.desc">{{ x.desc }}</p>
      <icon size="120" class="bg-icon" v-if="x.cate" :path="getIconForCategory(x.cate)"/>
    </router-link>
  </div>
</template>
<script setup lang="ts">
import getPostDigests from "~/utils/getPostDigests";
import {mdiArrowTopRight, mdiArrowUpLeft, mdiCodeTags, mdiFormatQuoteOpen, mdiPencil} from "@mdi/js";
import {definePageMeta} from "#imports";

function getIconForCategory(category) {
  switch (category) {
    case '思想':
      return mdiFormatQuoteOpen;
    case '代码':
      return mdiCodeTags;
    case '记录':
      return mdiPencil;
    case '路径':
      return mdiArrowUpLeft;
  }
}

definePageMeta({
  title: '首页'
})
</script>

<style lang="scss" scoped>
.articles {
  display: flex;
  flex-direction: column;
  gap: 28px;

  .article {
    color: unset;
    text-decoration: none;
    overflow: hidden;
    position: relative;
    border: 1px solid rgba(0, 0, 0, .1);
    border-radius: 10px;
    padding: 20px;
    cursor: pointer;
    transition: all .2s ease;

    .view-right-now-message {
      opacity: 0;
      color: #004d40;
      transition: all .2s ease;
      position: absolute;
      right: 20px;
      top: 20px;
      transform: translate(-4px, 4px);
      font-size: 14px;
      display: flex;
      align-items: center;
      gap: 2px;

      @media (max-width: 768px) {
        display: none;
      }

      svg {
        height: 14px;
        width: 14px;
      }
    }

    &:hover {
      box-shadow: 0 6px 0 rgba(0, 0, 0, .1);
      transform: translateY(-2px);
      border-color: rgba(#004d40, .8)
    }

    &:hover {
      .view-right-now-message {
        opacity: 1;
        transform: translate(0);
      }
    }

    h2 {
      margin-top: 0;
      margin-bottom: 4px;
      color: #004d40;
      font-size: 28px;
    }

    .meta {
      display: flex;
      align-items: center;
      color: #aaa;
      font-size: 14px;

      span:not(:last-child)::after {
        content: '·';
        margin: 0 5px;
      }
    }

    p {
      line-height: 1.8;
      margin-top: 16px;
      margin-bottom: 0;
    }
  }
}


.bg-icon {
  color: #009688;
  opacity: 0;
  position: absolute;
  right: -20px;
  top: 50%;
  transform: translateY(-50%);
  transition: all .2s ease;
}

.article:hover {
  .bg-icon {
    right: 20px;
    opacity: .1;
  }
}
</style>