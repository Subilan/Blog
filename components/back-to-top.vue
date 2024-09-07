<template>
  <transition name="flowup">
    <div @click="scrollToTop" class="back-to-top hoverable rounded" v-if="showBackToTop">
      <span class="words">返回顶部</span>
      <icon :path="mdiArrowUp"/>
    </div>
  </transition>
</template>

<script setup>
import {mdiArrowUp} from "@mdi/js";

const showBackToTop = ref(false);

function scrollToTop() {
  window.scrollTo({top: 0})
}

onMounted(() => {
  window.addEventListener('scroll', () => {
    showBackToTop.value = window.scrollY >= window.innerHeight * 0.8;
  })
})
</script>

<style lang="scss" scoped>
.words {
  @media (max-width: 768px) {
    display: none;
  }
}


.back-to-top {
  padding: 12px 16px;
  cursor: pointer;
  background: white;
  position: fixed;
  bottom: 48px;
  right: 64px;
  display: flex;
  align-items: center;
  gap: 8px;
  line-height: 1;

  @media (max-width: 768px) {
    width: 25px;
    height: 25px;
    padding: 15px;
    border-radius: 100%;
    justify-content: center;
    right: 48px;

    svg:not(html) {
      height: 25px;
    }
  }

  svg {
    height: 20px;
  }
}
</style>