<template>
  <article>
    <h1>关于</h1>
    <p>展开下面的相应板块，查看相关“关于”信息。</p>
    <div class="details">
      <content-block>
        <template #title>关于本博客</template>
        <p>本博客最初创建于 2016 年。那年夏天，我看到 NextCraft 讨论群（已不存在）里的群友博客网站，心生羡慕。当时对 Web 技术仅为浅尝辄止程度的我希望可以创建一个专属于自己的网站。</p>
        <p>凭借着三流主机商提供的低廉套餐与 CPanel、phpMyAdmin 等可视化网页应用，我成功用 WordPress 搭建起了第一个博客——然后我便发现，自己其实并没有什么东西要写。</p>
        <p>本网站的域名 subilan.win 也是在当时购买的。它在当时仅 7 人民币每年的低廉价格彻底打动了我。如今 win 域名的注册难度已经提升，价格也上涨至数十人民币每年（涨幅并不大）。</p>
        <p>在把博客当成日记本并随便乱加内容的三年里，我先后更换了 Hexo、Typecho 等相较于 WordPress 更为轻量化的博客程序，并在对博客 DIY 的过程中逐渐接触到 Material Design 等设计语言。</p>
        <p>2018 年，博客经历了一次彻底的删库跑路事件，于是当时的一系列“日记”随即化为乌有，荡然无存。</p>
        <p>同一时期，我接触了 Vue.js 一类的新型前端技术，“静态”的概念深入我心，我决定不仅要追求轻量化，还要追求静态化。</p>
        <p>2019 年，我正式使用 VuePress 开始编写博客，此后博客的内容也逐渐有了个人记录意义，而非单纯的流水账。</p>
        <p>2023 年，博客放弃使用 VuePress，改用 Vue 3 自行编写代码，并参考 VuePress 的主题进行设计，使用持续集成平台 Travis CI 来自动构建，之后将 CI 平台更换为了 GitHub Actions。</p>
        <p>2024 年，博客再次重构，改用 Nuxt 3 自行编写代码以寻求 SSR 所带来的“SEO 优势”。</p>
        <p>2025 年，博客的主题外观迭代，省去多数色彩，更专注于内容。</p>
      </content-block>
      <content-block>
        <template #title>关于博客程序</template>
        <p>当前博客背后的程序为自行编写，是使用 Nuxt 3 搭配本地数据编译脚本构建的。文章以 Markdown 格式编写，经过脚本的处理后，变为 JSON 格式被程序调用。详细代码见 <a
            href="https://github.com/Subilan/Blog" class="external-link"
            target="_blank">https://github.com/Subilan/Blog</a>。
        </p>
        <p>当前所使用的博客主题设计参考了 Hugo 主题 <a class="external-link" href="https://github.com/tomfran/typo" target="_blank">tomfran/typo</a>。</p>
        <p>博客使用的托管平台是 <a href="https://vercel.com" class="external-link" target="_blank">Vercel</a>。</p>
      </content-block>
      <content-block>
        <template #title>关于个人兴趣</template>
        <ul>
          <li>Minecraft 热爱者，对其周边的开发生态保持关注。</li>
          <li>非专业的<em>拍照</em>爱好者，喜欢按照自己的理念进行取景。</li>
          <li>学习日语中，<em>并不是</em>因为二次元，是因为一样非常本真的对语言的兴趣。</li>
          <li>尝试各种编程语言，以及将各种有趣的设计原型变成现实。</li>
          <li>有时着迷于城市轨道交通与道路规划。</li>
          <li>爱好字体收集，喜欢了解并收集具有创新意义与外观的字体。</li>
          <li>爱好一人旅行，以寻找独特照片为主线自由地探索陌生城市或者自然。</li>
        </ul>
      </content-block>
      <content-block>
        <template #title>关于社交平台</template>
        <p>Twitter / X 上主要发的是一些个人记录的无关紧要内容，作为个人的想法资料库使用。</p>
        <p>哔哩哔哩上，早期根据个人灵感和兴趣进行了一些音乐方面的剪辑，总体上主要发布一些灵感所构成的视频原型，或者旅行的视频剪辑（非 Vlog）。</p>
      </content-block>
      <!--      <content-block>-->
      <!--        <template #title>个人：关于游戏平台</template>-->
      <!--        <p>虽然一般因为<del>自闭</del><em>自己待着</em>所以平时玩的都是单机游戏（其实也不经常玩），但是一些难度不大的联机游戏也是可以玩的。如果你有兴趣，欢迎加（凑）一个好友哦！</p>-->
      <!--        <ul>-->
      <!--          <li><span style="display: inline-flex; align-items: center">Steam 好友代码&nbsp;<strong>355150742</strong><copy-btn content="355150742"/></span></li>-->
      <!--          <li>英雄联盟国服 艾欧尼亚 <strong>累累的#26909</strong>（我只是个休闲游戏的黑铁）</li>-->
      <!--          <li>英雄联盟台服 <em>待我日后补上</em></li>-->
      <!--        </ul>-->
      <!--      </content-block>-->
      <img src="@/assets/images/about-banner.jpg" alt="about-banner" class="about-banner" />
      <em>赏花的猫 - 摄于 2024 年 8 月，深圳四月咖啡</em>
    </div>
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