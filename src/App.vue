<template>
  <navbar/>
  <div class="container">
    <router-view/>
  </div>
  <Footer/>
  <SpeedInsights/>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Footer from "@/components/Footer.vue";
import { SpeedInsights } from "@vercel/speed-insights/vue"
</script>

<style lang="less">
.container {
  margin: calc(1.5rem + 2 * 1rem) auto 0 auto;

  max-width: 740px;
  display: block;
}
</style>