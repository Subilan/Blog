<template>
  <div class="links-container">
    <div @click="openTab(link.href)" class="link" :style="{
      backgroundImage: link.background.startsWith('http') ? `url(${link.background})` : '',
      backgroundColor: link.background.startsWith('rgb') || link.background.startsWith('#') ? `${link.background}` : ''
    }" :class="{'light': link.light}" v-for="(link) in links">
      <img class="avatar" :src="link.avatar" :alt="link.name" />
      <div class="link-content">
        <span class="name">{{ link.name }}</span>
        <span class="description">{{ link.description }}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { openTab } from "@/utils";
import links from './blogrolls.json';
</script>

<style lang="less">
@import "../var.less";

.links-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media screen and (max-width: 700px) {
    flex-direction: column;
  }

  .link {
    text-decoration: none !important;

    @media screen and (max-width: 700px) {
      width: calc(100% - 3rem);
    }

    @media screen and (min-width: 700px) {
      transition: all 0.2s ease;
      
      &:hover {
        box-shadow: 0 0 0 4px rgba(#000, .1);
      }
    }

    cursor: pointer;
    display: flex;
    gap: 16px;
    align-items: center;
    padding: .6rem .8rem;
    border-radius: 5px;
    background-position: center;
    background-size: cover;
    box-shadow: 0 2px 3px rgba(0, 0, 0, .2);
    flex: 1 0 auto;
    color: #212121;

    &.light {
      text-shadow: 0 1px 2px rgba(0, 0, 0, .2);
      color: white;
    }

    .avatar {
      border-radius: 100%;
      width: 64px;
      height: 64px;
      border: none;
      box-shadow: 0 1px 4px rgba(0, 0, 0, .2);
    }

    .link-content {
      .name {
        font-size: 1.2rem;
        font-weight: 500;
      }

      .description {
        font-size: .8rem;
        font-weight: normal;
      }

      .name,
      .description {
        display: block;
        line-height: 1.7;
      }
    }
  }
}
</style>
