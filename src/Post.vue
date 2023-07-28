<template>
  <div class="post">
    <router-view/>
  </div>
</template>

<script setup lang="ts">
import {useRoute} from "vue-router";
import pages from "@/pages";
import {getPosts} from "@/utils";
import {onMounted} from "vue";
import mediumZoom from "medium-zoom";

const route = useRoute();
const pagedata = pages[route.meta.uuid as string];
const sortedFilenames = getPosts().map(x => x.filename);

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

onMounted(() => {
  mediumZoom(".content img")
})
</script>

<style scoped lang="less">
.post {
  padding: 1.5rem 1.5rem 1.5rem 2rem;
  @media (max-width: 700px) {
    padding: 1rem 1.5rem;
  }
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
  margin: 0;
  border-bottom: none !important;

  &::after {
    content: " ";
    display: block;
    width: 100%;
    height: 1px;
    background: #eaecef;
    margin: .3rem 0;
  }
}

.metabar {
  display: flex;
  align-items: center;
  color: #bbb;
  overflow: visible;
  white-space: nowrap;

  > *::after {
    content: "·";
    margin: 0 8px;

    @media (max-width: 700px) {
      margin: 0 4px;
    }
  }

  > *:last-child::after {
    content: "";
  }
}
</style>