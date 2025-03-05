<template>
  <navbar />
  <main class="layout-default">
    <div class="left">
      <section class="profile card">
        <div class="avatar">
          <nuxt-img format="webp" src="/avatar.jpg" alt="avatar" />
          <span class="name">Subilan</span>
          <span class="bio">城市化的自我</span>
        </div>
        <div class="social">
          <a href="https://x.com/subilan1234" target="_blank">
            <X />
          </a>
          <a href="https://github.com/Subilan" target="_blank">
            <GitHub />
          </a>
          <a href="mailto:christophersubilan@gmail.com">
            <icon :path="mdiEmailOutline" />
          </a>
          <a href="https://space.bilibili.com/35413001" target="_blank">
            <Bilibili class="bilibili" />
          </a>
        </div>
        <div class="navigations">
          <router-link :to="x.to" v-for="x in pages">
            <icon :path="x.icon" class="inactive-icon" />
            <icon :path="x.iconActive" class="active-icon" />
            {{ x.name }}
          </router-link>
        </div>
      </section>
      <section class="stats card">
        <p class="primary">统计信息</p>
        <ul>
          <li>最近更新 {{ getAgo(getPostDigests()[0].date) }}</li>
          <li>文章总数 {{ blogStatsData.totalPosts }} 篇</li>
          <li>总字数 ~{{ (blogStatsData.totalWords / 10000).toFixed(1) }}W</li>
          <li>友链 {{ blogStatsData.totalBlogrolls }} 个</li>
        </ul>
      </section>
    </div>
    <div class="right">
      <slot />
    </div>
    <default-footer class="default-layout-specific" />
  </main>
  <back-to-top />
</template>

<script setup lang="ts">
  import X from '~/assets/svg/x.svg';
  import GitHub from '~/assets/svg/github.svg';
  import Bilibili from '~/assets/svg/bilibili.svg'
  import { mdiEmailOutline } from "@mdi/js";
  import { pages } from "~/data/config.js";
  import getTotalWordCount from "~/utils/getTotalWordCount.js";
  import getTotalPostCount from "~/utils/getTotalPostCount.js";
  import blogrolls from '~/data/blogrolls.json';
  import BackToTop from "~/components/back-to-top.vue";
  import getSiteName from "~/utils/getSiteName.js";
  import getPostDigests from '~/utils/getPostDigests.js';

  type PageviewRes = { pageviews: { x: string, y: number }[], sessions: { x: string, y: number }[] }

  const sitename = getSiteName();

  const blogStatsData = {
    totalPosts: getTotalPostCount(),
    totalWords: getTotalWordCount(),
    totalBlogrolls: blogrolls.length,
  }

  const totalSessions = ref(0);
  const totalViews = ref(0);
  const totalSessionLoading = ref(true);

  // onMounted(async () => {
  //   const pageviewRes = await $fetch<PageviewRes>('/api/get-page-views');
  //   totalSessionLoading.value = false;
  //   totalSessions.value = pageviewRes.sessions.reduce((a, b) => a + b.y, 0);
  //   totalViews.value = pageviewRes.pageviews.reduce((a, b) => a + b.y, 0);
  // })
</script>

<style lang="scss" scoped>
@use '@/assets/var';

.layout-default {
  max-width: 1200px;
  margin: var.$navbarHeight + var.$navbarBottomOffset auto 0;
  padding-bottom: var.$footerHeight + var.$footerMarginTop;
  display: flex;
  align-items: flex-start;
  gap: 28px;
  position: relative;

  @media (max-width: 1300px) {
    max-width: 800px;
  }

  @media (max-width: 1000px) {
    max-width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
    flex-direction: column;
    align-items: stretch;
  }
}

.left {
  width: 25%;
  display: flex;
  align-items: stretch;
  flex-direction: column;
  gap: 28px;

  @media (max-width: 1300px) {
    display: none;
  }
}

.right {
  width: 75%;

  @media (max-width: 1300px) {
    width: 100%;
  }
}

.left section {
  padding: 16px;
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;

  p {
    margin: 0;
    font-size: 16px;
  }

  ul {
    padding-left: 20px;
    margin: 0;
    line-height: 1.5;
    list-style-type: circle;
  }
}

.profile {
  display: flex;
  align-items: center;
  flex-direction: column;
  padding: 32px 16px 16px;


  .footer {
    margin-top: 16px;
    font-size: 12px;
    color: #aaa;
    text-align: center;
    line-height: 1.5;
  }

  .avatar {
    display: flex;
    flex-direction: column;
    align-items: center;

    img {
      height: 100px;
      width: 100px;
      object-fit: cover;
      border-radius: 100%;
    }

    .name {
      margin-top: 16px;
      font-weight: 500;
      font-size: 24px;
    }

    .bio {
      margin-top: 8px;
      font-size: 14px;
    }
  }

  .social {
    margin-top: 16px;
    margin-bottom: 32px;
    display: flex;
    align-items: center;
    width: 60%;

    a {
      flex: 1;
      display: flex;
      justify-content: center;
      color: #000;

      &:hover {
        svg {
          opacity: 1;
        }

        svg.bilibili {
          fill: #479fd1;
        }
      }
    }

    svg {
      height: 20px;
      fill: #000;
      opacity: .5;
    }
  }

  .navigations {
    display: flex;
    flex-direction: column;
    width: 100%;
    align-items: stretch;

    a {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 16px;
      color: black;
      text-decoration: none;
      transition: all .2s ease;
      padding: 10px 0;
      border-radius: 20px;

      &:not(.router-link-exact-active):hover {
        background: #e0f2f1;

        svg {
          color: #009688;
        }
      }

      svg {
        transition: all .2s ease;
      }
    }

    &:hover .router-link-exact-active {
      background: transparent;
    }

    .router-link-exact-active {
      border-radius: 20px;
      background: #e0f2f1;

      .active-icon {
        display: block;
        color: #009688;
      }

      .inactive-icon {
        display: none;
      }
    }

    :not(.router-link-exact-active) {
      .active-icon {
        display: none;
      }

      .inactive-icon {
        display: block;
      }
    }
  }
}

.dark .navigations a:not(.router-link-exact-active):hover {
  background: rgba($color: var.$darkPrimary, $alpha: .1);
}
</style>