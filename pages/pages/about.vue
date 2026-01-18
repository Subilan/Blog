<template>
  <article class="prose-lg">
    <h1>关于</h1>
    <p>来自湖北，兴趣使然的代码编写者，13 年 Minecraft 玩家，一直想出去走走的宅男。</p>
    <p>比较感兴趣的事物包括但不仅限于</p>
    <ul>
      <li>拍照片，尤其是风景照片</li>
      <li>前后端开发</li>
      <li>城市轨道交通导视设计</li>
      <li>欣赏字体</li>
      <li>一人旅行</li>
      <li>Minecraft 和 LOL</li>
    </ul>
    <p><em>排名<del>分不出</del>不分先后</em></p>
    <p>
      <img src="@/assets/images/about-banner.jpg" alt="about-banner" class="about-banner" />
      <em>2024 年 8 月，深圳南山四月咖啡</em>
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