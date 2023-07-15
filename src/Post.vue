<template>
  <div class="post">
    <router-view/>
  </div>
</template>

<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import {useRoute} from "vue-router";
import pages from "@/pages";
import {getSortedPosts} from "@/utils";

const route = useRoute();
const pagedata = pages[route.meta.uuid as string];
const sortedFilenames = getSortedPosts().map(x => x.filename);

function getNext() {
  const index = sortedFilenames.indexOf(pagedata.filename);
  if (index === 0) return index;
  return index - 1;
}

function getPrev() {
  const index = sortedFilenames.indexOf(pagedata.filename);
  if (index === sortedFilenames.length - 1) return index;
  return index + 1;
}
</script>

<style scoped lang="less">
.post {
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  max-width: 740px;
  margin: 0 auto;
  line-height: 1.7;
}
</style>

<style lang="less">
@import "./typo.less";

.content {
  .typo;
}

.post-title {
  margin-bottom: 0;
}

.metabar {
  display: flex;
  align-items: center;
  color: #bbb;

  >*::after {
    content: "·";
    margin: 0 8px;
  }

  >*:last-child::after {
    content: "";
  }
}
</style>