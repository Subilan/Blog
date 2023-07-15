<template>
  <navbar/>
  <div class="container">
    <router-view/>
  </div>
  <Footer/>
</template>

<script setup lang="ts">
import Navbar from '@/components/Navbar.vue'
import Footer from "@/components/Footer.vue";
import {onMounted} from "vue";
import mediumZoom from "medium-zoom";

onMounted(() => {
  mediumZoom(".content img")
})
</script>

<style lang="less">
.container {
  margin: calc(1.5rem + 2 * 0.7rem) auto 0 auto;

  max-width: 740px;
  display: block;
}
</style>