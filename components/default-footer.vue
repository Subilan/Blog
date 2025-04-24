<template>
  <footer>
    <div class="inner">
      <div class="left">
        <div class="copyright">&copy; 2019-{{ new Date().getFullYear() }} {{ getSiteName() }}</div>
        <div class="other">Built with Nuxt 3 and 🤔<br />
          Written
          size {{ (getTotalPostSize() / 1000).toFixed(1) }} KB · {{ running }} from start </div>
      </div>
      <div class="spacer" />
      <div class="icons">
        <div class="badges">
          <WrittenByHuman />
          <img src="https://lmnt.me/files/images/badges/made-on-macintosh.gif" />
        </div>
        <div class="cc-icons">
          <img alt="cc" src="https://mirrors.creativecommons.org/presskit/icons/cc.svg?ref=chooser-v1">
          <img alt="by" src="https://mirrors.creativecommons.org/presskit/icons/by.svg?ref=chooser-v1">
          <img alt="sa" src="https://mirrors.creativecommons.org/presskit/icons/sa.svg?ref=chooser-v1">
        </div>
      </div>
    </div>
  </footer>
</template>
<script setup>
  import WrittenByHuman from "assets/svg/written-by-human.svg";
  import getSiteName from "../utils/getSiteName.js";

  const running = ref('');

  onMounted(() => {
    setInterval(() => {
      running.value = getFormattedTimeFromBeginning();
    }, 1000)
  })
</script>

<style lang="scss">
@use "@/assets/var";

footer {
  margin-top: 32px;
  padding: 24px 32px;
  border-top: 1px solid rgba(0, 0, 0, .1);
  width: 100%;
  height: var.$footerHeight;
  box-sizing: border-box;
  bottom: 0;
  display: flex;
  align-items: center;
  border-top: 1px solid var(--dimdim);

  @media (max-width: 768px) {
    height: unset;
    padding: 24px 0;
  }

  .icons {
    display: flex;
    align-items: flex-end;
    flex-direction: column;
    gap: 16px;

    @media (max-width: 768px) {
      align-items: flex-start;
    }

    .badges {
      display: flex;
      align-items: center;
      gap: 8px;

      img {
        height: 31px;
      }

      img {
        image-rendering: pixelated;
      }
    }

    .cc-icons {
      display: flex;
      gap: 4px;

      img {
        height: 20px;
      }
    }
  }

  .inner {
    display: flex;
    align-items: center;
    gap: 16px;
    width: 100%;

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

  .left {
    display: flex;
    align-items: start;
    flex-direction: column;
    gap: 8px;

    .copyright {
      font-size: 20px;
      font-weight: 500;
    }

    .other {
      font-size: 14px;
      font-weight: normal;
    }
  }

  svg {
    height: 30px;
  }
}
</style>