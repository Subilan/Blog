<template>
  <navbar/>
  <div class="layout-post">
    <slot/>
  </div>
  <creative-commons-license/>
  <default-footer/>
  <back-to-top/>
</template>

<script setup>
import Navbar from "~/components/navbar.vue";
import CreativeCommonsLicense from "~/components/creative-commons-license.vue";
import DefaultFooter from "~/components/default-footer.vue";
import BackToTop from "~/components/back-to-top.vue";
</script>

<style lang="scss">
@use '@/assets/global.scss';
@use '@/assets/github-light.scss';

.flowup-enter-active,
.flowup-leave-active {
  transition: all .2s ease;
}

.flowup-enter-from,
.flowup-leave-to {
  transform: translateY(20px);
  opacity: 0;
}

.layout-post {
  margin-top: global.$navbarHeight + global.$navbarBottomOffset;

  @media (max-width: 1000px) {
    padding: 0 20px;
  }
}
</style>