<template>
  <article>
    <h1>关于</h1>
    <p><strong>Solitude Scroll</strong>
      意为“孤独卷轴”。人生是一场斑斓的苦旅，掌舵的永远是我们自己。这里并不是技术博客，而是更类似自由发挥的一样空间，记录了自己过往实际或不切实际的经验和观点，并在有生之年应该会持续更新。</p>
    <p>欢迎在 <a class="external-link" target="_blank" href="https://github.com/Subilan/Blog/issues">GitHub 仓库的 Issue</a>
      里发表对文章的评论。本站目前不会用到任何第三方的评论程序。</p>
    <div class="details">
      <content-block>
        <template #title>博客：关于博客的过往</template>
        <ul>
          <li>2016-2017: WordPress</li>
          <li>2017-2019: Hexo, Hugo 短期尝试，Typecho 使用后遭遇删库跑路</li>
          <li>2019-2023: VuePress 1 + GitHub Pages</li>
          <li>2023-2024: Vue 3 + GitHub Actions + Vercel</li>
          <li>当前: Nuxt 3 + Vercel</li>
        </ul>
        <p>最开始<em>正式</em>接触博客（个人网站）这种信息媒介是 2016 年，当时使用的是
          WordPress，搭配上面的预制主题。后来先后更换了 Hugo、Hexo、Typecho（用得最久），经历了私有主机商的删库跑路之后，于
          2019 年开始使用 VuePress 搭建静态博客。2023 年不再使用 VuePress，改用 Vue 3 自行构建并集成 CI。2024 年再次重构，使用 Nuxt 3 搭配 CI 构建。</p>
      </content-block>
      <content-block>
        <template #title>博客：关于当前博客程序</template>
        <p>当前博客程序是使用 Nuxt 3，基于本地数据编译模式构建的。文章以 Markdown 格式编写，经过脚本的处理后，变为 JSON 格式被程序调用。详细代码见 <a
            href="https://github.com/Subilan/Blog" class="external-link"
            target="_blank">https://github.com/Subilan/Blog</a>。
        </p>
        <p>博客使用的持续集成与托管平台是 <a href="https://vercel.com" class="external-link" target="_blank">Vercel</a>。</p>
      </content-block>
      <content-block>
        <template #title>个人：关于个人兴趣</template>
        <ul>
          <li>Minecraft 热爱者，对其周边的开发生态保持关注。</li>
          <li>非专业的<em>拍照</em>爱好者，喜欢按照自己的理念进行取景。</li>
          <li>学习日语中，<em>并不是</em>因为二次元，是因为一样非常本真的对语言的兴趣。</li>
          <li>尝试各种编程语言，以及将各种有趣的设计原型变成现实。</li>
          <li>有时着迷于城市轨道交通与道路规划。</li>
          <li>字体收集爱好者，喜欢了解具有创新意义或概念的字体。</li>
          <li>独自旅行爱好者，陌生的城市和自然对我有着特别的吸引力。</li>
        </ul>
      </content-block>
      <content-block>
        <template #title>个人：关于社交平台</template>
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
      <em>赏花的猫</em>
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