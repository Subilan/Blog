<template>
  <div @click="searchDialog = !searchDialog" class="search-box">
    <span class="mdi mdi-magnify"/>
    <span v-if="isPCWidth()">搜索 (Ctrl+K)</span>
  </div>
  <div @click.self="searchDialog = false" class="cover" :style="{display: searchDialogDisplay}"
       :class="{'active': searchDialogActive}">
    <div class="search-dialog">
      <div class="search-textfield">
        <span class="mdi mdi-magnify"/>
        <input ref="searchInput" v-model="searchContent" placeholder="搜索文章标题、内容" class="search-input"
               type="text" @keydown="debounce(400)(() => {searching = true; getSearchResult()})"/>
      </div>
      <div class="search-result">
        <div v-if="searchResult.length > 0">
          <div
              @click="searchDialog = false; router.push(x.namespace === 'post' ? `/posts/${x.filename}` : `/${x.filename}`);"
              class="result" v-for="(x, i) in searchResult" tabindex="0">
            <div class="title">
              {{ x.title }}
            </div>
            <div class="content" v-html="x.nearestText"/>
            <div class="meta">
              <div class="badge">
                {{ x.namespace }}
              </div>

              {{ x.filename }}.md

            </div>
          </div>
        </div>
        <div class="search-text" v-else-if="searchContent.trim().length === 0">
          键入以搜索
        </div>
        <div class="search-text" v-else-if="searching">
          加载中...
        </div>
        <div class="search-text" v-else>
          没有与搜索条件匹配的项
        </div>
      </div>
    </div>
  </div>
  <Transition name="flowup">
    <div class="close-btn-wrapper" v-if="searchDialogActive && !isPCWidth()">
      <div class="close-btn" @click="searchDialog = false">
        关闭
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from "vue";
import {getSearch, isPCWidth, enableScroll, disableScroll} from "@/utils";
import {useRouter} from "vue-router";

const searchDialog = ref(false)
const searchDialogActive = ref(false)
const searchDialogDisplay = ref("none")
const searchInput = ref<HTMLInputElement | null>(null)
const searchContent = ref("")
const searchResult = ref<SearchResult[]>([]);
const search = getSearch();
const searching = ref(false);
const router = useRouter();

interface SearchResult {
  title: string,
  namespace: Search["namespace"],
  nearestText: string,
  filename: string
}

let debounceTimer = 0;
const debounce = (timeout: number) => (func: Function) => {
  clearTimeout(debounceTimer);
  debounceTimer = window.setTimeout(() => func(), timeout);
}

function getSearchResult() {
  if (searchContent.value.trim().length === 0) {
    searchResult.value = [];
    return;
  }
  const titleMatch = search.filter(x => x.title.toLowerCase().includes(searchContent.value.toLowerCase()));
  const contentMatch = search.filter(x => x.filecontent.toLowerCase().includes(searchContent.value.toLowerCase()));
  const union = [...new Set([...titleMatch, ...contentMatch])];
  searchResult.value = union.map(x => {
    return {
      title: x.title,
      filename: x.filename,
      namespace: x.namespace,
      nearestText: getNearestText(x.filecontent, searchContent.value)
    }
  });
  searching.value = false;
}

function getNearestText(filecontent: string, searchContent: string) {
  const index = filecontent.toLowerCase().indexOf(searchContent.toLowerCase());
  const start = index - 50;
  const end = index + searchContent.length + 50
  const part = filecontent.substring(
      start < 0 ? 0 : start,
      end > filecontent.length - 1 ? filecontent.length - 1 : end
  );
  return "..."
      + part.replace(
          new RegExp(`(${searchContent})`, "gi"),
          `<strong>$1</strong>`
      )
      + "...";
}

function keydownHandler(e: KeyboardEvent) {
  if (e.key === "Escape") {
    searchDialog.value = false;
  }
}

onMounted(() => {
  window.addEventListener("keydown", e => {
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      searchDialog.value = !searchDialog.value;
    }
  })
})

watch(searchDialog, v => {
  if (v) {
    searchDialogDisplay.value = 'block';
    setTimeout(() => {
      searchDialogActive.value = true;
      disableScroll();
    }, 1)
  } else {
    searchDialogActive.value = false;
    enableScroll()
    setTimeout(() => {
      searchDialogDisplay.value = 'none';
    }, 200)
  }
})

watch(searchDialogActive, v => {
  if (v) {
    window.addEventListener("keydown", keydownHandler);
    if (searchInput.value !== null) {
      searchInput.value.focus();
    }
  } else {
    window.removeEventListener("keydown", keydownHandler)
    searchContent.value = "";
    searchResult.value = [];
  }
})
</script>

<style lang="less" scoped>
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

  @media (max-width: 700px) {
    padding: .2rem;
    outline: none;
  }

  .mdi::before {
    line-height: 1;
    font-size: 1rem;

    @media (max-width: 700px) {
      font-size: 1.3rem;
    }
  }

  .mdi {
    height: 14px;
    width: 14px;
    @media (max-width: 700px) {
      height: 20px;
      width: 20px;
    }
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

    .search-dialog {
      opacity: 1;
      transform: translate(-50%, -50%) scale(1);
      @media (max-width: 700px) {
        transform: scale(1);
      }
    }
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
  transform: translate(-50%, -50%) scale(.9);
  opacity: 0;
  transition: all .35s cubic-bezier(.77, .01, .2, .98);

  @media (max-width: 700px) {
    width: calc(100vw - 2rem);
    height: 100vh;
    top: 0;
    left: 0;
    transform: scale(.9);
    border: none;
    border-radius: 0;
  }
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

.search-text {
  text-align: center;
  color: #bbb;
}

.meta {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.badge {
  display: inline-block;
  background: #e0f2f1;
  color: #009688;
  padding: .2rem .4rem;
  line-height: 1;
  border-radius: 5px;
}

.close-btn-wrapper {
  position: fixed;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  bottom: 0;
  left: 0;
  z-index: 4000;
}

.close-btn {
  display: block;
  background: #e0f2f1;
  color: #009688;
  font-size: 1.2rem;
  box-shadow: 0 1px 5px rgba(0, 0, 0, .2);
  border-radius: 100px;
  padding: .6rem;
  width: 25%;
  text-align: center;
  margin: 2rem auto;
}
</style>

<style lang="less">

.flowup-enter-to,
.flowup-leave-from {
  opacity: 1;
  transform: translateY(0);
}

.flowup-enter-from,
.flowup-leave-to {
  opacity: 0;
  transform: translateY(50px);
}

.flowup-enter-active,
.flowup-leave-active {
  transition: all .2s cubic-bezier(.75,-0.01,.22,.99);
}

.search-result {
  display: flex;
  flex-direction: column;
  margin: 1rem 0;
  gap: 1rem;
  overflow-y: auto;
  max-height: 700px;

  @media (max-width: 700px) {
    max-height: calc(100% - 4rem)
  }

  .result {
    display: flex;
    flex-direction: column;
    gap: .6rem;
    padding: 1rem;

    &:hover,
    &:focus {
      background: #e0f2f1;
      border-radius: 5px;
      cursor: pointer;
    }

    .title {
      font-size: 1.5rem;
      font-weight: bold;
    }

    .content {
      color: #aaa;
      font-size: 1rem;
      overflow-x: clip;

      strong {
        color: #000;
        background: #ffeb3b;
      }
    }
  }
}
</style>