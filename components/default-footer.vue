<template>
  <footer>
    <div class="flex items-center gap-3 px-10 mt-20 mb-5">
      <p class="text-neutral-400">&copy; 2019-2026 <span class="text-neutral-900">SolitudeScroll</span>, under CC-BY-SA 4.0</p>
      <div class="flex-1 h-px bg-neutral-200" />
      <a href="https://www.apple.com/mac/" target="_blank">
        <img src="https://lmnt.me/files/images/badges/made-on-macintosh.gif" />
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