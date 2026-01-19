<template>
  <article class="prose-lg">
    <h1>关于</h1>
    <p>来自湖北，兴趣使然的代码编写者，13 年 Minecraft 玩家，一直想出去走走的宅男。</p>
    <p>比较感兴趣的事物包括但不仅限于</p>
    <ul>
      <li>拍照片，尤其是风景照片</li>
      <li>软件开发技术，如 Web 前后端开发</li>
      <li>城市轨道交通导视设计</li>
      <li>欣赏字体</li>
      <li>一人旅行</li>
      <li>Minecraft 和 LOL</li>
    </ul>
    <p><em>排名<del>分不出</del>不分先后</em></p>
    <h2>What is Solitude Scroll</h2>
    <p>Solitude Scroll（孤<ruby>诣<rt>yì</rt></ruby>卷轴）是我在 2025 年为这个网站起的一个名字，希望它能够逐渐成为我今后在工作时的心态和处事态度。</p>
    <p>中文名中的「孤诣」来自成语「苦心孤诣」，指尽心钻研、思索，力求达到别人难以达到的境界，「孤诣」特指一种「独自达到的境界」。虽然「境界」一词常常言过其实，且这个成语大部分时候扮演敬辞，但将其用来勉励自己也并无不妥。「孤诣」或许就是独处的一种最高境界，一种真正能利用孤独带来的强大能量的境界，也是我所向往的一种境界。</p>
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