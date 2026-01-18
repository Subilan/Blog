<template>
  <transition name="flowup">
    <div @click="scrollToTop"
      class="border border-neutral-100 shadow-sm hover:bg-neutral-50 active:bg-neutral-100 fixed right-20 bottom-20 bg-white flex items-center gap-2 py-3 px-4.5 rounded-lg cursor-pointer transition-all"
      v-if="showBackToTop">
      <span>返回顶部</span>
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