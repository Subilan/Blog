<template>
  <navbar/>
  <div class="post">
    <router-view/>
  </div>
</template>

<script setup lang="ts">
import Navbar from "@/components/Navbar.vue";
import {useRoute} from "vue-router";
import pages from "@/pages";
import {getSortedPages} from "@/utils";

const route = useRoute();
const pagedata = pages[route.meta.uuid as string];
const sortedFilenames = getSortedPages().map(x => x.filename);

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
@import "./var.less";

ul, ol {
  padding-left: 1.2rem;
}

h1 a, h2 a, h3 a {
  color: #2c3e50;
  font-weight: 600;
}

a {
  color: #009688;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }

  .external-link-icon {
    color: #aaa;

    &::before {
      font-size: .9rem;
    }
  }
}

code {
  color: #476582;
  padding: 0.25rem 0.5rem;
  vertical-align: middle;
  margin: 0;
  font-size: .85em;
  background-color: rgba(27, 31, 35, .05);
  border-radius: 3px;
  .fontset-monospace;
}

pre {
  background-color: #282c34;
  border-radius: 6px;
  position: relative;
  padding: 1.25rem 1.5rem;
  margin: .85rem 0;
  overflow: auto;

  code {
    padding: 0;
    background: transparent;
    border-radius: 0;
    color: #fff;
  }
}

h1, h2 {
  position: relative;
  border-bottom: 1px solid #eaecef;
  cursor: pointer;

  &:hover {
    .header-anchor {
      opacity: 1;
    }
  }
}

.header-anchor {
  content: "#";
  position: absolute;
  color: #009688;
  right: calc(100% + .2rem);
  opacity: 0;

  &:hover {
    opacity: 1;
  }
}

blockquote {
  font-size: 1rem;
  color: #999;
  border-left: 0.2rem solid #dfe2e5;
  margin: 1rem 0;
  padding: 0.25rem 0 0.25rem 1rem;

  > p {
    margin: 0;
  }
}

h1 {
  font-size: 2.2rem;
}

h2 {
  font-size: 1.65rem;
}

h3 {
  font-size: 1.35rem;
}

hr {
  border: none;
  display: block;
  width: 100%;
  background: #eaecef;
  height: 1px;
}


</style>