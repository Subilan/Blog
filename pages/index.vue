<template>
  <!-- <div class="articles">
    <router-link class="article card clickable"  v-for="x in getPostDigests()" :to="`/posts/${x.slug}`">
      <span class="view-right-now-message">打开
        <icon :path="mdiArrowTopRight" />
      </span>
      <h2>{{ x.title }}</h2>
      <div class="meta">
        <span>{{ getAgo(x.date) }}</span>
        <span>约{{ nzh.encode(wipeZeroAuto(x.wordCount)) }}字</span>
        <span v-if="x.cate">
          <icon size="16" :path="getIconForCategory(x.cate)" /> {{ x.cate }}
        </span>
      </div>
      <p v-if="x.desc">{{ x.desc }}</p>
    </router-link>
  </div> -->
  <div class="introduction">
    <div class="navigation">
      <router-link class="link" to="/pages/blogroll">友链</router-link>
      <router-link class="link" to="/pages/pgp">PGP</router-link>
      <router-link class="link" to="/pages/about">关于</router-link>
      <a class="link" target="_blank" href="https://photos.subilan.win">相册</a>
    </div>
    <div class="avatar">
      <img draggable="false" src="/avatar.jpg" />
    </div>
    <div class="introduction-content">
      <h2>Welcome to the <em>Solitude Scroll</em></h2>
      <p>欢迎来到<strong>孤独卷轴</strong>。这里并不是技术博客，而是更类似自由发挥的一样空间，记录了自己过往实际或不切实际的经验和观点，并在有生之年应该会持续更新。</p>
    </div>
    <div class="social-media">
      <a href="https://x.com/subilan1234" target="_blank" aria-label="Go to my X personal profile.">
        <XSocial class="x" />
      </a>
      <a href="https://github.com/Subilan" target="_blank" aria-label="Go to my GitHub personal profile.">
        <GitHub class="github" />
      </a>
      <a href="mailto:christophersubilan@gmail.com" aria-label="Email me now">
        <icon :path="mdiEmailOutline" />
      </a>
      <a href="https://space.bilibili.com/35413001" target="_blank" aria-label="Go to my Bilibili space">
        <Bilibili class="bilibili" />
      </a>
    </div>
  </div>
  <template v-if="themeStyle === 'classic'">
    <div class="articles-classic">
      <div class="article-classic" v-for="x in getPostDigests()">
        <div class="date">
          {{ getAgo(x.date) }}
        </div>
        <div class="art">
          <h2>
            <router-link :to="`/posts/${x.slug}`">
              {{ x.title }}
            </router-link>
          </h2>
          <p v-if="x.desc || x.descShort">{{ x.descShort || x.desc }}</p>
        </div>
      </div>
    </div>
  </template>

  <template v-else-if="themeStyle === 'typecho'">
    <div class="articles-typecho">
      <div class="article-typecho" v-for="x in getPostDigests()">
        <h3>{{ x.title }}</h3>
        <div class="meta">
          <span><span class="sub">发布于</span> {{ getAgo(x.date) }}</span>
          <span v-if="x.cate"><span class="sub">分类</span> {{ x.cate }}</span>
          <span><span class="sub">约</span> {{ x.wordCount }} <span class="sub">字</span></span>
        </div>
        <p>{{ x.descShort || x.desc }}</p>
        <router-link class="link" :to="`/posts/${x.slug}`">阅读全文 &raquo;</router-link>
      </div>
    </div>
  </template>
</template>

<script setup lang="ts">
  import XSocial from '~/assets/svg/x.svg';
  import GitHub from '~/assets/svg/github.svg';
  import Bilibili from '~/assets/svg/bilibili.svg'
  import getPostDigests from "@/utils/getPostDigests";
  import { mdiArrowUpLeft, mdiCodeTags, mdiEmailOutline, mdiFormatQuoteOpen, mdiPencilOutline, mdiWeatherSunny } from "@mdi/js";
  import { definePageMeta } from "#imports";
  import Nzh from "nzh";

  const nzh = new Nzh({
    ch: "〇一两三四五六七八九",
    ch_u: "个十百千万亿兆京",
    ch_f: "负",
    ch_d: "点",
    m_u: "元角分厘",
    m_t: "人民币",
    m_z: "正"
  });

  function getIconForCategory(category: string) {
    switch (category) {
      case '杂谈':
        return mdiFormatQuoteOpen;
      case '代码':
        return mdiCodeTags;
      case '记录':
        return mdiPencilOutline;
      case '路径':
        return mdiArrowUpLeft;
    }
  }

  definePageMeta({
    title: '首页'
  });

  const { themeFont, themeColor, themeStyle } = useTheme();
</script>

<style lang="scss" scoped>
@use "@/assets/var";

$divgap: 30px;

:root.style-classic .introduction .navigation a {
  opacity: .4;

  @media (min-width: 768px) {
    &:hover {
      opacity: 1;
    }
  }
}

.introduction {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-bottom: 1px solid var(--dimdim);
  padding-bottom: $divgap;
  position: relative;

  .navigation {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    @media (max-width: 768px) {
      position: static;
      margin-bottom: 16px;
    }
  }

  img {
    height: 100px;

    @media (max-width: 768px) {
      height: 150px;
    }
  }

  .introduction-content {
    margin-bottom: 16px;

    h2 {
      font-size: 28px;
      margin: 8px 0;
      line-height: 1;

      @media (max-width: 768px) {
        line-height: 1.2;
      }

      em {
        @media (max-width: 768px) {
          display: block;
        }
      }
    }

    p {
      margin: 0;
    }
  }

  .social-media {
    display: flex;
    gap: 16px;

    a {
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--text);

      &:hover {
        svg.bilibili {
          fill: #479fd1;
        }
      }
    }

    svg {
      height: 24px;
      fill: var(--text);
    }

    svg.x,
    svg.github {
      height: 20px;
    }
  }
}

.articles-classic {
  padding-top: $divgap;
  display: flex;
  flex-direction: column;
  gap: 32px;

  .article-classic {
    display: flex;
    align-items: flex-start;
    gap: 32px;

    @media (max-width: 768px) {
      flex-direction: column;
      gap: 8px;
    }

    .date {
      width: 10%;
      text-align: right;

      @media (max-width: 768px) {
        width: 100%;
        text-align: left;
      }
    }

    .art {
      width: 90%;

      @media (max-width: 768px) {
        width: 100%;
      }

      h2 {
        margin-top: 0;
        margin-bottom: 8px;
        line-height: 1;
        font-weight: normal;

        @media (max-width: 768px) {
          line-height: 1.5;
        }

        a {
          color: var(--primary);
        }
      }

      p {
        color: #aaa;
        margin-top: 0;
        line-height: 1.5;
      }
    }
  }
}

.articles-typecho {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 32px;

  .article-typecho {
    border-radius: 5px;
    border: 1px solid var(--dimdim);
    padding: 14px;

    h3 {
      font-size: 22px;
      margin-top: 0;
    }

    .meta {
      font-size: 16px;
      display: flex;
      align-items: center;

      >span {
        &:not(:last-of-type)::after {
          content: '·';
          margin: 0 4px;
        }
      }


      .sub {
        opacity: .6;
      }
    }
  }
}

// .articles {
//   display: flex;
//   flex-direction: column;
//   gap: 28px;

//   .article {
//     color: unset;
//     text-decoration: none;
//     overflow: hidden;
//     position: relative;
//     padding: 20px;

//     .view-right-now-message {
//       opacity: 0;
//       color: var.$primaryTextColor;
//       transition: all .2s ease;
//       position: absolute;
//       right: 20px;
//       top: 20px;
//       transform: translate(-4px, 4px);
//       font-size: 14px;
//       display: flex;
//       align-items: center;
//       gap: 2px;

//       @media (max-width: 768px) {
//         display: none;
//       }

//       svg {
//         height: 14px;
//         width: 14px;
//       }
//     }

//     &:hover {
//       .view-right-now-message {
//         opacity: 1;
//         transform: translate(0);
//       }
//     }

//     h2 {
//       margin-top: 0;
//       margin-bottom: 4px;
//       color: var.$primaryTextColor;
//       font-size: 28px;
//     }

//     .meta {
//       display: flex;
//       align-items: center;
//       color: #aaa;
//       font-size: 14px;

//       span:not(:last-child)::after {
//         content: '·';
//         margin: 0 5px;
//       }

//       span {
//         display: inline-flex;
//         align-items: center;

//         svg {
//           margin-right: 4px;
//         }
//       }
//     }

//     p {
//       line-height: 1.8;
//       margin-top: 16px;
//       margin-bottom: 0;
//     }
//   }
// }


.bg-icon {
  color: var(--primary);
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