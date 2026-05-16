<template>
  <transition name="flowup">
    <div @click="scrollToTop"
      class="border border-neutral-100 dark:border-neutral-600 shadow-sm hover:bg-neutral-50 active:bg-neutral-100 dark:hover:bg-neutral-700 dark:active:bg-neutral-600 fixed right-[50%] translate-x-[50%] lg:right-20 lg:translate-x-0 lg:bottom-20 bottom-15 bg-white dark:bg-neutral-800 flex items-center gap-2 rounded-full p-3 lg:py-3 lg:px-4.5 lg:rounded-lg cursor-pointer transition-all"
      v-if="showBackToTop">
      <span class="hidden lg:inline">返回顶部</span>
      <icon class="h-[20px] w-[20px]" :path="mdiArrowUp" />
    </div>
  </transition>
</template>

<script setup>
import { mdiArrowUp } from "@mdi/js";

const showBackToTop = ref(false);

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(() => {
  window.addEventListener('scroll', () => {
    showBackToTop.value = window.scrollY >= window.innerHeight * 0.8;
  })
})
</script>

<style lang="css">
.flowup-enter-active,
.flowup-leave-active {
  transition: all .2s ease;
}

.flowup-enter-from,
.flowup-leave-to {
  opacity: 0;
  transform: translateY(15px);
}
</style>
