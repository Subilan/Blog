<template>
  <navbar/>
  <div class="layout-default">
    <div class="left">
      <section class="profile">
        <div class="avatar">
          <img src="~/assets/avatar.jpg" alt="avatar"/>
          <span class="name">Subilan</span>
          <span class="bio">城市化的自我</span>
        </div>
        <div class="social">
          <a href="https://x.com/subilan1234" target="_blank">
            <X/>
          </a>
          <a href="https://github.com/Subilan" target="_blank">
            <GitHub/>
          </a>
          <a href="mailto:christophersubilan@gmail.com">
            <icon :path="mdiEmailOutline"/>
          </a>
          <a href="https://space.bilibili.com/35413001" target="_blank">
            <Bilibili class="bilibili"/>
          </a>
        </div>
        <div class="navigations">
          <router-link :to="x.to" v-for="x in pages">
            <icon :path="x.icon" class="inactive-icon"/>
            <icon :path="x.iconActive" class="active-icon"/>
            {{ x.name }}
          </router-link>
        </div>
        <div class="footer">
          &copy; 2019-{{ new Date().getFullYear() }} Subilan's Blog<br/>Built with Nuxt 3
        </div>
      </section>
      <section class="stats">
        <p>截至现在，这里...</p>
        <div class="stat" v-for="x in blogStats">
          <span class="prefix">{{ x[0] }}</span>
          <span class="value">{{ x[1] }}</span>
          <span class="suffix">{{ x[2] }}</span>
        </div>
      </section>
    </div>
    <div class="right">
      <slot/>
    </div>
    <default-footer class="default-layout-specific"/>
  </div>
  <back-to-top/>
</template>

<script setup>
import X from '~/assets/svg/x.svg';
import GitHub from '~/assets/svg/github.svg';
import Bilibili from '~/assets/svg/bilibili.svg'
import {mdiArrowTopRight, mdiArrowUpLeft, mdiCodeTags, mdiEmailOutline, mdiFormatQuoteOpen, mdiPencil} from "@mdi/js";
import {pages} from "~/data/config.js";
import getTotalWordCount from "~/utils/getTotalWordCount.js";
import getTotalPostCount from "~/utils/getTotalPostCount.js";
import getTotalPostSize from "~/utils/getTotalPostSize.js";
import blogrolls from '~/data/blogrolls.json';
import BackToTop from "~/components/back-to-top.vue";

const blogStats = [
  ['发布了', getTotalPostCount(), '篇文章'],
  ['容纳了', `${(getTotalWordCount() / 1000).toFixed(1)}K`, '字'],
  ['链接了', `${blogrolls.length}`, '位伙伴'],
  ['存在了', (new Date().getFullYear() - 2019), '年'],
  ['占用了', `${(getTotalPostSize() / 1000).toFixed(1)}`, 'KB']
]
</script>

<style lang="scss" scoped>
@use '@/assets/global';

.layout-default {
  max-width: 1200px;
  margin: global.$navbarHeight + global.$navbarBottomOffset auto 0;
  padding-bottom: global.$footerHeight + global.$footerMarginTop;
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
  border: 1px solid rgba(0, 0, 0, .1);
  border-radius: 10px;
  transition: all .2s ease;
  padding: 16px;
  background: white;

  &:hover {
    box-shadow: 0 6px 0 rgba(0, 0, 0, .1);
    border: 1px solid rgba(#004d40, .8);
    transform: translateY(-4px);
  }
}

.stats {
  display: flex;
  flex-direction: column;
  gap: 8px;

  p {
    margin: 0;
    font-size: 16px;
  }

  .stat {
    display: flex;
    align-items: baseline;
    gap: 8px;

    .prefix, .suffix {
      color: #9b9b9b;
    }

    .value {
      font-size: 25px;
      font-weight: bold;
      color: #004d40;
    }
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
</style>