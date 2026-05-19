<template>
  <footer>
    <div class="flex flex-col lg:flex-row lg:border-none border-t pt-5 border-neutral-200 dark:border-neutral-700 lg:items-center gap-3 lg:mx-10 mx-5 mt-20 mb-5">
      <p class="text-neutral-400 dark:text-neutral-500">&copy; 2019-2026 <span class="text-neutral-900 dark:text-neutral-100">SolitudeScroll</span>, under CC-BY-SA
        4.0</p>
      <div class="flex-1 h-px bg-neutral-200 dark:bg-neutral-700 hidden lg:block" />
      <a href="https://www.apple.com/mac/" target="_blank">
        <img style="image-rendering: pixelated;" src="https://lmnt.me/files/images/badges/made-on-macintosh.gif" />
      </a>
    </div>
  </footer>
</template>
<script setup>
const running = ref('');

onMounted(() => {
  setInterval(() => {
    running.value = getFormattedTimeFromBeginning();
  }, 1000)
})
</script>
