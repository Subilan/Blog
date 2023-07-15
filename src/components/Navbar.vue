<template>
  <nav class="navbar">
    <div @click="sidebar = !sidebar" class="mdi mdi-menu menu-btn"/>
    <div class="page-title" @click="router.push(`/`)">
      Subilan's Blog
    </div>
    <search-box v-if="isPCWidth()"/>
    <div class="nav-spacer" style="flex: 1"/>
    <search-box v-if="!isPCWidth()"/>
    <div class="page-list" v-if="isPCWidth()">
      <div class="page" :class="{active: route.path === `/`}" @click="$router.push('/')">首页</div>
      <div class="page" :class="{active: route.path === `/${x.filename}`}" v-for="x in pages"
           @click="router.push(`/${x.filename}`)">{{ x.title }}
      </div>
    </div>
  </nav>
  <div class="sidebar-cover" @click.self="sidebar = false" :class="{active: sidebar}"></div>
  <Transition name="slide">
    <div class="sidebar" v-if="sidebar">
      <div class="sidebar-title">
        切换页面
      </div>
      <div class="sidebar-items" @click="sidebar = false">
        <div class="sidebar-item" :class="{active: route.path === `/`}" @click="$router.push('/')"><span
            class="mdi mdi-home"/>首页
        </div>
        <div class="sidebar-item" :class="{active: route.path === `/${x.filename}`}" v-for="x in pages"
             @click="router.push(`/${x.filename}`)"><span class="mdi" :class="getPageIcon(x.title)"/>{{ x.title }}
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import SearchBox from './SearchBox.vue';
import {useRoute, useRouter} from "vue-router";
import {disableScroll, enableScroll, getPages, isPCWidth} from "@/utils";
import {ref, watch} from "vue";

const pages = getPages();

const router = useRouter();
const route = useRoute();

const sidebar = ref(false);

function getPageIcon(title: string) {
  const match: Record<string, string> = {
    "联系": "mdi-account-plus",
    "公钥": "mdi-key-chain-variant",
    "关于": "mdi-information-outline",
    "友链": "mdi-home-group"
  };
  return match[title];
}

watch(() => sidebar.value, v => {
  if (v) {
    disableScroll();
  } else {
    enableScroll();
  }
})
</script>

<style lang="less" scoped>

.sidebar-cover {
  position: absolute;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100vw;
  z-index: 1001;
  background: rgba(0, 0, 0, .6);
  opacity: 0;
  pointer-events: none;

  &.active {
    pointer-events: all;
    opacity: 1;
  }
}

.slide-enter-active,
.slide-leave-active,
.sidebar-cover {
  transition: all .2s cubic-bezier(.75,-0.01,.22,.99);
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(-60%);
  opacity: 0;
}

.slide-enter-to,
.slide-leave-from {
  transform: translateX(0);
  opacity: 1;
}

.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 60%;
  z-index: 2000;
  background: white;
  padding: .8rem 1.2rem;
  box-shadow: 2px 0 5px rgba(0, 0, 0, .2);

  .sidebar-title {
    font-size: 1.6rem;
    line-height: 1.7;
    border-bottom: 1px solid #eaecef;
    font-weight: bold;
    margin-bottom: .8rem;
  }

  .sidebar-items {
    display: flex;
    flex-direction: column;


    .sidebar-item {
      font-size: 1.2rem;
      padding: .6rem .9rem;
      border-radius: 5px;
      display: flex;
      align-items: center;
      gap: .8rem;
      cursor: pointer;

      .mdi {
        height: 23px;
        width: 23px;
      }

      .mdi::before {
        font-size: 1.4rem;
      }

      &.active {
        background: #e0f2f1;
        color: #009688;
        font-weight: bold;
      }
    }
  }
}

.menu-btn {
  cursor: pointer;

  &::before {
    font-size: 1.3rem;
  }

  @media (min-width: 700px) {
    display: none;
  }
}

.navbar {
  position: fixed;
  top: 0;
  left: 0;
  padding: 1rem 1.5rem;
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, .1);
  height: 1.5rem;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  z-index: 1000;

  width: calc(100% - 3rem);
}

.page-title {
  font-size: 1.3rem;
  font-weight: 600;
  cursor: pointer;
  line-height: 1;
}

.page-list {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem
}

.page {
  cursor: pointer;
  position: relative;
  font-size: .9rem;

  &:hover,
  &.active {
    &::after {
      content: " ";
      height: 2px;
      background: #009688;
      display: block;
      width: 100%;
      position: absolute;
      top: calc(100% + .1rem);
    }
  }
}
</style>