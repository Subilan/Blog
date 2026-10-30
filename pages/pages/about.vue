<template>
  <article class="prose-lg">
    <h1>关于</h1>
    <p>兴趣使然的程序员。</p>
    <p>
      <img src="@/assets/images/about-banner.jpg" alt="about-banner" class="about-banner" />
      <em>拍摄于深圳市南山区四月咖啡，2024 年 8 月</em>
    </p>
  </article>
</template>

<style lang="scss">
.details {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.about-banner {
  object-fit: cover;
}
</style>
<script setup>
definePageMeta({
  title: '关于'
})
</script>