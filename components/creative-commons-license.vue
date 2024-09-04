<template>
  <div class="create-commons-license">
    <div class="title">
      本博客的原创内容采用 CC BY-SA 4.0 协议授权
      <div class="icons">
        <img alt="cc" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1">
        <img alt="by" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1">
        <img alt="sa" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1">
      </div>
    </div>
    <p><strong>欢迎评论、指正或者转载。</strong>转载需遵守 CC BY-SA 4.0（署名—相同方式共享）协议。可前往 GitHub 仓库发布
      Issue 进行评论（可带上 comment 的 tag 以区分）。</p>
    <div class="links">
      <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank">在 CreativeCommons 上查看协议
        <icon :path="mdiArrowTopRight"/>
      </a>
      <a href="https://github.com/Subilan/Blog/issues" target="_blank">打开 Issue 页面
        <icon :path="mdiArrowTopRight"/>
      </a>
    </div>
  </div>
</template>

<script setup>
import WrittenByHuman from '~/assets/svg/written-by-human.svg'
import {mdiArrowTopRight} from "@mdi/js";
</script>

<style lang="scss">
.create-commons-license {
  border: 1px solid rgba(0, 0, 0, .1);
  padding: 16px;
  border-radius: 10px;
  transition: all .2s ease;
  background: white;
  color: black;
  box-sizing: border-box;
  max-width: 800px;
  margin: 0 auto;

  @media (max-width: 840px) {
    margin: 0 20px;
  }

  &:hover {
    border: 1px solid rgba(#004d40, .8);
  }

  .links {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 16px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: stretch;
    }
  }

  a {
    border: 1px solid rgba(0, 0, 0, .1);
    border-radius: 10px;
    transition: all .2s ease;
    padding: 10px;
    background: white;
    color: black;
    text-decoration: none;
    display: flex;
    align-items: center;
    line-height: 1;

    @media (max-width: 768px) {
      justify-content: center;
    }

    svg {
      height: 16px;
    }

    &:hover {
      box-shadow: 0 6px 0 rgba(0, 0, 0, .1);
      border: 1px solid rgba(#004d40, .8);
      transform: translateY(-4px);
      color: #004d40;
    }
  }

  .title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 20px;
    font-weight: bold;

    @media (max-width: 768px) {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
    }

    .icons {
      display: flex;
      gap: 8px;

      img {
        height: 22px;
      }
    }
  }

  p {
    line-height: 1.8;
  }
}
</style>