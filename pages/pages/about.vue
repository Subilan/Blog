<template>
  <article>
    <h1>关于</h1>
    <p>这里并不是技术博客，而是更类似自由发挥的一样空间。欢迎在 <a class="external-link" target="_blank"
                                                                 href="https://github.com/Subilan/Blog/issues">GitHub
      仓库的 Issue</a> 里评论或者一起探讨话题，这里并不会用到任何第三方的评论程序。</p>
    <div class="details">
      <details>
        <summary><span>博客：关于博客的过往</span></summary>
        <p>最开始<em>正式</em>接触博客（个人网站）这种信息媒介是 2016 年，当时使用的是
          WordPress，搭配上面的预制主题。并没有琢磨出博客的意义所在。后来先后更换了 Hugo、Hexo、Typecho（用得最久），经历了私有主机商的删库跑路之后，于
          2019 年开始使用 VuePress 搭建静态博客，并开始 DIY 博客。</p>
      </details>
      <details>
        <summary><span>博客：关于博客程序</span></summary>
        <p><em>2019 年，博客使用的是 VuePress，后按照 VuePress 的主题风格使用 Vue 3 构建了一个版本。目前使用的是 Nuxt 3 构建的（代号）JustPress。</em></p>
        <p>从 2024 年 9 月开始，这个博客开始使用 Nuxt 3 构建的 JustPress。目前 JustPress 只是一个代号，其功能上与博客本身的内容有着高度的耦合，且依赖于本地数据库，因此不适合其它用户使用。当然，如果你有着 DIY 的兴趣，也可以从源码出发进行修改自行使用，它是以 MIT 协议开源的。</p>
      </details>
      <details>
        <summary><span>个人：关于个人兴趣</span></summary>
        <ul>
          <li>Minecraft 热爱者，对其周边的开发生态保持关注。</li>
          <li>非专业的摄影（对我来说，准确地叫<em>拍照</em>）爱好者，喜欢按照自己的理念进行取景。</li>
          <li>学习日语中，不过<em>并不是</em>因为二次元，是因为一样非常本真的对语言的兴趣。</li>
          <li>尝试各种编程语言，以及将各种有趣的设计原型变成现实。</li>
          <li>有时着迷于城市轨道交通与道路规划。</li>
          <li>字体收集爱好者，喜欢了解具有创新意义或概念的字体。</li>
          <li><em>单人</em>旅行爱好者，陌生的城市和自然对我有着特别的吸引力。</li>
        </ul>
      </details>
      <details>
        <summary><span>个人：关于社交平台</span></summary>
        <p>Twitter / X 上主要发的是一些个人记录的无关紧要内容，作为个人的小型「想法资料库」使用。</p>
        <p>哔哩哔哩上，早期根据个人灵感和兴趣进行了一些音乐方面的剪辑，总体上主要发布一些灵感所构成的视频原型，或者旅行的视频剪辑（非 Vlog）。</p>
      </details>
      <img src="@/assets/images/about-banner.jpg" alt="about-banner" class="about-banner"/>
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