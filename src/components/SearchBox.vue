<template>
  <div @click="searchDialog = !searchDialog" class="search-box">
    <span class="mdi mdi-magnify"/>
    <span>搜索</span>
  </div>
  <div class="cover" :style="{display: searchDialogDisplay}" :class="{'active': searchDialogActive}">
    <div class="search-dialog">
      <div class="search-textfield">
        <span class="mdi mdi-magnify"/>
        <input placeholder="搜索文章标题、内容" class="search-input" type="text" v-model="searchContent"/>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";

const searchDialog = ref(false)
const searchDialogActive = ref(false)
const searchDialogDisplay = ref("none")
const searchContent = ref("")

watch(searchDialog, v => {
  if (v) {
    searchDialogDisplay.value = 'block';
    setTimeout(() => {
      searchDialogActive.value = true;
    }, 1)
  } else {
    searchDialogActive.value = false;
    setTimeout(() => {
      searchDialogDisplay.value = 'none';
    }, 200)
  }
})

function keydownHandler(e: KeyboardEvent) {
  if (e.key === "Escape") {
    searchDialog.value = false;
  }
}

watch(searchDialogActive, v => {
  if (v) {
    window.addEventListener("keydown", keydownHandler);
  } else {
    window.removeEventListener("keydown", keydownHandler)
  }
})


</script>

<style lang="less">
@import "@/var.less";

.search-box {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: .9rem;
  line-height: 1;
  cursor: pointer;
  outline: 1px solid rgba(0, 0, 0, .2);
  padding: .2rem .4rem;
  border-radius: 5px;

  .mdi::before {
    line-height: 1;
    font-size: 1rem;
  }

  .mdi {
    height: 14px;
    width: 14px;
  }
}

.cover {
  transition: all .2s cubic-bezier(.81, .02, .22, 1);
  backdrop-filter: blur(0);
  opacity: 0;
  background: rgba(0, 0, 0, .6);
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 900;

  &.active {
    backdrop-filter: blur(2px);
    opacity: 1;
  }
}

.search-dialog {
  background: white;
  box-shadow: 0 2px 5px rgba(0, 0, 0, .2);
  width: 500px;
  border-radius: 5px;
  padding: 1rem;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.search-textfield {
  display: flex;
  align-items: center;
  gap: .4rem;

  &, .search-input {
    font-size: 1.5rem;
  }

  .mdi::before {
    font-size: 1.8rem;
  }

  .mdi {
    height: 29px;
    width: 29px;
  }

  .search-input {
    flex: 1;
    outline: none;
    border: none;
    border-bottom: 2px solid #009688;
    .fontset-monospace;
  }
}
</style>