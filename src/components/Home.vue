<template>
  <div class="home">
    <div class="cards">
      <div @click="router.push(`/posts/${x.filename}`)" class="card"
           v-for="x in cardPages.filter(x => x.frontmatters.hidden !== true)">
        <div class="header">
          <div class="title">{{ x.title }}</div>
          <div class="meta">
            <span>{{ x.frontmatters.date }}</span>
            <span>{{ x.frontmatters.cate }}</span>
            <span>约 {{ x.wordcount }} 字</span>
            <span v-if="x.frontmatters.english">英文</span>
          </div>
        </div>
        <div class="desc">{{ x.frontmatters.desc }}</div>
        <div class="card-icon">
          <span class="mdi" :class="getCardIcon(x.frontmatters.cate)"/>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {getCardIcon, getPosts} from "@/utils";
import {useRouter} from "vue-router";

const cardPages = getPosts();
const router = useRouter();
</script>

<style lang="less" scoped>

.cards {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 1.5rem 2rem;

  @media (max-width: 700px) {
    padding: 1.5rem;
  }
}

.header {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .meta {
    font-size: .9rem;
    color: #bbb;

    > span::after {
      content: "·";
      margin: 0 4px;
    }

    > span:last-child::after {
      content: none;
    }
  }
}

.card {
  overflow: hidden;
  padding: 1.5rem 2rem;
  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, .1);
  display: flex;
  flex-direction: column;
  gap: 16px;
  position: relative;

  @media (max-width: 700px) {
    padding: 1rem 1.5rem;
  }

  .title, .desc {
    z-index: 20;
  }

  .title {
    font-weight: bold;
    font-size: 2rem;
    line-height: 1.2;
    color: #009688;
    position: relative;
  }

  .desc {
    font-size: 1rem;
    position: relative;
    line-height: 1.7;
  }

  cursor: pointer;
  transition: all .2s ease;

  @media (min-width: 700px) {
    &:hover {
      border-color: transparent;
      background: #009688;
      transform: scale(1.06);

      .title {
        color: white;
      }

      .desc, .meta {
        color: rgba(255,255,255,.7);
      }
    }
  }
}

.card-icon {
  position: absolute;
  right: .6rem;
  bottom: .6rem;
  z-index: 1;

  .mdi::before {
    font-size: 6rem;
    opacity: .5;
    color: rgba(255,255,255,.7);
  }

  .mdi::before {
    transform: translate(60px, 60px);
    opacity: 0;
    transition: all .2s ease;
  }
}

@media (min-width: 700px) {
  .card:hover .card-icon .mdi::before {
    opacity: .4;
    transform: translate(0, 0);
  }
}
</style>