<template>
  <footer>
    <div class="inner">
      <span>&copy; 2019-{{ new Date().getFullYear() }} Subilan's Blog<br/><small>Built with Nuxt 3 and 🤔</small></span>
      <div class="spacer"/>
      <div class="icons">
        <WrittenByHuman/>
      </div>
    </div>
  </footer>
</template>
<script setup>
import WrittenByHuman from "assets/svg/written-by-human.svg";
</script>

<style lang="scss">
@use "@/assets/global.scss";

footer {
  margin-top: 32px;
  padding: 24px 32px;
  border-top: 1px solid rgba(0, 0, 0, .1);
  width: 100%;
  height: global.$footerHeight;
  box-sizing: border-box;
  bottom: 0;

  @media (max-width: 768px) {
    height: unset;
    padding: 24px 0;
  }

  .icons {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .inner {
    display: flex;
    align-items: center;
    gap: 16px;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 10px;
    }
  }

  &:not(.default-layout-specific) .inner {
    max-width: 800px;
    margin: 0 auto;

    @media (max-width: 1000px) {
      margin: 0 20px;
    }
  }

  &.default-layout-specific {
    @media (min-width: 1000px) {
      position: absolute;
    }
  }

  span {
    font-size: 20px;
    font-weight: 500;

    small {
      font-size: 14px;
      font-weight: normal;
    }
  }

  svg {
    height: 30px;
  }
}
</style>