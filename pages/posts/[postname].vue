<template>
  <div class="container">
    <article>
      <h1>{{ post.title }}</h1>
      <div class="extra">
        <span>
          <icon :path="mdiClockOutline" /> {{ post.date }}
        </span>
        <span>
          <icon :path="mdiFormatTextVariant" /> 约 {{ post.wordCount }} 字
        </span>
        <span v-if="post.cate">
          <icon :path="mdiShapeOutline" /> {{ post.cate }}
        </span>
      </div>
      <div class="outdated-warning card" v-if="dayDelta >= 730 && !post.ignoreOutdate">
        <h3>
          <icon :path="mdiClockAlertOutline" /> 可能过时的信息
        </h3>
        <p>你正阅读的文章的发布日期距今已经有 <strong>{{ dayAgo }}</strong>了，其中的部分信息、个人观点或者措辞习惯等可能已经发生改变，因此仅供参考，请酌情阅读。</p>
      </div>
      <div class="content" v-html="post.content" />
    </article>
  </div>
</template>

<script setup>
  import getPostContent from "@/utils/getPostContent.js";
  import mediumZoom from "medium-zoom";
  import { mdiClockAlertOutline, mdiClockOutline, mdiFormatTextVariant, mdiShapeOutline } from "@mdi/js";

  const slug = useRoute().params.postname;
  const post = getPostContent(slug.toLowerCase());

  const dayDelta = computed(() => (new Date().getTime() - new Date(post.date).getTime()) / (1000 * 3600 * 24));
  const dayAgo = computed(() => getAgo(post.date, true));

  onMounted(() => {
    mediumZoom('article .content img', {
      background: 'rgba(0, 0, 0, .6)'
    })
  })

  definePageMeta({
    layout: 'post',
    middleware: [
      (to, from) => {
        const slug = to.params.postname;

        if (getPostContent(slug) === null) {
          return abortNavigation(createError({
            statusCode: 404,
            statusMessage: 'Page Not Found'
          }));
        }
      }
    ]
  })

  useSeoMeta({
    articleModifiedTime: post.date.replace(/\//g, '-')
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

.dark .outdated-warning {
  background: rgba(#fff8e1, .2);
  border-color: rgba(#ffc107, .3);

  h3,
  strong {
    color: #ffc107;
  }

  p {
    color: white;
  }
}

.outdated-warning {
  margin-top: 16px;
  background: #fff8e1;
  padding: 16px;
  border: 1px dashed #ffc107;
  color: black;
  border-radius: 10px;
  text-align: center;

  p {
    margin: 8px 0;
  }

  h3,
  strong {
    color: #bf360c;
  }

  h3 {
    font-size: 20px;
    margin: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    line-height: 1.5;
  }
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