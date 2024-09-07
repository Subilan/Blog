<template>
  <article>
    <h1>友链</h1>
    <blockquote>
      友链（blogroll）是一种将互联网上的一个个孤岛似的个人网站联系起来的一种高效方式。这使得各个网站可以彼此串通，使访问者有更多的机会光顾每一个相连接的网站。
    </blockquote>
    <div class="blogrolls">
      <a class="blogroll" target="_blank" :href="x.href" v-for="x in blogrolls"
         :class="{light: x.light, border: x.background === '#fff' || x.background === '#ffffff'}"
         :style="x.background.startsWith('http') ? `background-image: url(${x.background})` : `background: ${x.background}`">
        <img :src="x.avatar" :alt="x.name"/>
        <div class="info">
          <div class="name">{{ x.name }}</div>
          <p>{{ x.description }}</p>
        </div>
      </a>
    </div>
    <div class="details">
      <content-block>
        <template #title>如何在这里添加友链</template>
        <p>友链是相互的，因此请考虑在你的网站上添加本站的友链，相关的信息可参考下面的「本站的友链信息」部分。</p>
        <p>如果你有在此添加友链的意向，欢迎联系我或者直接在 GitHub 上通过 pull request
          添加。联系时，请务必带上以下信息：</p>
        <ul>
          <li>你的头像文件所在地址</li>
          <li>网站名称与简介</li>
          <li>网站地址</li>
        </ul>
        <p>在联系之前，请注意本站对友链的目标网站有以下需求：</p>
        <ul>
          <li>全站开启 HTTPS</li>
          <li>域名为个人持有</li>
          <li>最新的一篇博文需在近一年内发布，且博文总数超过三篇</li>
        </ul>
        <p>如果你对友链的展示样式有个性化的需求，欢迎随附说明。在没有任何附加说明的情况下，你的友链按钮背景会被呈现为白色。</p>
      </content-block>
      <content-block>
        <template #title>通过 Pull Request 添加友链的具体流程</template>
        <ol>
          <li>打开 <a target="_blank" class="external-link" href="https://github.com/Subilan/Blog">https://github.com/Subilan/Blog</a>
          </li>
          <li>Fork 至你的个人账号，并对项目文件中的 <code>data/blogrolls.json</code> 进行修改，具体格式可参考文件内部已有内容
          </li>
          <li>发起 pull request。合并以后你的友链就会出现在这里。</li>
        </ol>
      </content-block>
      <content-block>
        <template #title>本站的友链信息</template>
        <p>如有意添加本站友链，请参考下面的信息。</p>
        <ul>
          <li v-for="x in Object.keys(thisInfo)">
            {{ x }}：{{ thisInfo[x] }}<copy-btn class="copy" :content="thisInfo[x]"/>
          </li>
        </ul>
      </content-block>
    </div>
  </article>
</template>

<script setup>
import blogrolls from '@/data/blogrolls.json'

const thisInfo = {
  '网站名称': 'Subilan\'s Blog',
  '网站介绍': 'Satellite yourself.',
  '网站代表色': '#009688',
  '网站地址': 'https://subilan.win',
  '头像': 'https://fnmdp.oss-cn-beijing.aliyuncs.com/assets/avatar.png'
}

definePageMeta({
  title: '友链'
})
</script>

<style lang="scss" scoped>
.details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
}

.copy {
  opacity: 0;
  pointer-events: none;
}

li:hover .copy {
  opacity: 1;
  pointer-events: all;
}

.blogrolls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;

  @media (max-width: 768px) {
    flex-wrap: nowrap;
    flex-direction: column;
    align-items: stretch;
  }

  .blogroll {
    text-decoration: none;
    color: black;
    flex: 1 0 auto;
    display: flex;
    align-items: center;
    border-radius: 10px;
    gap: 10px;
    padding: 16px;
    border: 1px solid transparent;
    transition: all .2s ease;
    cursor: pointer;
    background-position: center;
    background-size: cover;
    min-height: 55px;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 6px 0 rgba(0, 0, 0, .1);
      border: 1px solid rgba(#004d40, .8) !important;
    }

    .info {
      line-height: 1.2;
      display: flex;
      flex-direction: column;
      gap: 6px;

      .name {
        font-size: 19px;
        font-weight: 600;
      }

      p {
        margin: 0;
        font-size: 14px;
        font-weight: normal;
      }
    }

    img {
      width: 55px;
      border-radius: 100%;
    }

    &.light {
      color: white;
    }

    &.border {
      border: 1px solid rgba(0, 0, 0, .1);
    }
  }
}
</style>