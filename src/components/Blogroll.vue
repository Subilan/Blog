<template>
  <div class="links-container">
    <div
        @click="openTab(link.href)"
        class="link"
        :style="{
          backgroundImage: link.background.startsWith('http') ? `url(${link.background})` : '',
          backgroundColor: link.background.startsWith('rgb') || link.background.startsWith('#') ? `${link.background}` : ''
        }"
        :class="{
          'background-image': link.background.startsWith('http'),
          'background-color': link.background.startsWith('rgb') || link.background.startsWith('#'),
          'light': link.light
        }"
        v-for="(link) in links"
    >
      <img class="avatar" :src="link.avatar" :alt="link.name"/>
      <div

          class="link-content"
      >
        <span class="name">{{ link.name }}</span>
        <span class="description">{{ link.description }}</span>
      </div>
    </div>
  </div>
</template>

<script>
import {openTab} from "@/utils";

export default {
  methods: {openTab},
  data() {
    return {
      links: [
        {
          name: "WindSpirit IT",
          href: "https://www.leviatan.cn/",
          avatar: "https://img.leviatan.cn/images/2023/10/22/cat2e4e9bd20b277dfe.md.png",
          description: "跟随互联网发展的每一步",
          background: "#262626",
          light: true,
        },
        {
          name: "Dream City",
          href: "https://www.littleqiu.net",
          avatar: "https://www.littleqiu.net/wp-content/uploads/2018/01/Avatar.png",
          description: "愿你有一天，能与你最重要的人重逢",
          background:
              "https://www.littleqiu.net/wp-content/uploads/2018/01/ChulillaSpain_ZH-CN10170248808_1920x1080.jpg",
          light: true,
        },
        {
          name: "Bottle 小站",
          href: "https://bottle.moe/",
          avatar: "https://cdn.jsdelivr.net/gh/BottleSome/blog@latest/avatar_square.png",
          description: "些瓶dalao的博客~",
          background: "rgb(102 203 254)",
        },
        {
          name: "crazyman_army's Blog",
          href: "https://crazymanarmy.github.io/",
          avatar: "https://imgur.com/lsmKGQE.png",
          description: "玩ctf的小菜鸡,又喜欢捣鼓捣鼓一些realworld的东西",
          background: "#fff",
        },
        {
          name: "Ojhdt's Blog",
          href: "https://blog.ojhdt.com",
          avatar: "https://www.gravatar.com/avatar/af6911b4de2f5a357fa796a66e202272?s=128",
          description: "隐约雷鸣，阴霾天空",
          background: "#009688",
          light: true,
        },
        {
          name: "9527's Blog",
          href: "https://9527dhx.top/",
          avatar: "https://i.loli.net/2019/05/26/5cea282e596b167848.png",
          description: "跌倒了，站起来，换个姿势，再跌倒。",
          background: "#80deea",
          light: true,
        },
        {
          name: "喵呜Moe!!!",
          href: "https://moe.jimmy0w0.me/",
          avatar: "https://fnmdp.oss-cn-beijing.aliyuncs.com/assets/jimmy.jpg",
          description: "日常的生活",
          background: "#fff",
        },
        {
          name: "Socular 的博客",
          href: "https://awsl.rip",
          avatar: "https://www.gravatar.com/avatar/202e3e3a8e8fcefd140c1aab9b54c0d6",
          description: "少一点吹捧，多一点实干 :)",
          background: "#2196F3",
          light: true,
        },
        {
          name: "Carm's Pages",
          href: "https://pages.carm.cc",
          avatar: "https://en.gravatar.com/userimage/186254338/92ff64167a1c45e8b995200e992bcfdb.png",
          description: "分享所见，总结所学。",
          background: "#8b658b",
          light: true,
        },
        {
          name: "Nocturne",
          href: "https://wynio.online",
          avatar: "https://wynio.online/css/logo.png",
          description: "Ivory Tower",
          background: "#009999",
          light: true,
        },
				{
					name: "布丁の小窝",
					href: "https://www.furryowo.top/",
					avatar: "https://dn-qiniu-avatar.qbox.me/avatar/7da7e82f04de94c795db0301c3397bb6",
					description: "一个有梦想的咸鱼",
					background: "#2396FA",
					light: true
      ],
    };
  },
};
</script>

<style lang="less">
@import "../var.less";

.links-container {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  @media screen and (max-width: 700px) {
    flex-direction: column;
  }

  .link {
    text-decoration: none !important;

    @media screen and (max-width: 700px) {
      width: calc(100% - 3rem);
    }

    @media screen and (min-width: 700px) {
      transition: all 0.2s ease;
      &:hover {
        box-shadow: 0 0 0 4px rgba(#000, .1);
      }
    }

    cursor: pointer;
    display: flex;
    gap: 16px;
    align-items: center;
    padding: .6rem .8rem;
    border-radius: 5px;
    background-position: center;
    background-size: cover;
    box-shadow: 0 2px 3px rgba(0, 0, 0, .2);
    flex: 1 0 auto;
    color: #212121;

    &.light {
      text-shadow: 0 1px 2px rgba(0, 0, 0, .2);
      color: white;
    }

    .avatar {
      border-radius: 100%;
      width: 64px;
      height: 64px;
      border: none;
      box-shadow: 0 1px 4px rgba(0, 0, 0, .2);
    }

    .link-content {
      .name {
        font-size: 1.2rem;
        font-weight: 500;
      }

      .description {
        font-size: .8rem;
        font-weight: normal;
      }

      .name,
      .description {
        display: block;
        line-height: 1.7;
      }
    }
  }
}
</style>
