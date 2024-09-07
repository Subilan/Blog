<template>
  <transition name="opacity">
    <div class="search-layer" v-if="model" @click.self="model = false">
      <transition name="zoom" appear>
        <div class="search-modal" v-if="model">
          <input tabindex="100" placeholder="输入标题或正文关键词" v-model="search" type="text"/>
          <div class="search-results" v-if="results.length > 0">
            <div @keydown.enter="navigateTo(`/posts/${x.slug}`); model = false" class="search-result" v-for="(x, i) in results" :tabindex="100+i" @click="navigateTo(`/posts/${x.slug}`); model = false">
              <h2>{{ x.title }}</h2>
              <div class="meta">
                <span>{{ x.date }}</span>
                <span>约 {{ x.wordCount }} 字</span>
                <span v-if="x.cate">{{ x.cate }}</span>
              </div>
              <p v-html="x.excerpt"></p>
              <div class="data">
                <span class="bg">{{ x.name }}.md</span>
                <span>{{ (x.filesize / 1000).toFixed(2) }} KB</span>
              </div>
            </div>
          </div>
          <p v-else class="search-note">键入以开始搜索</p>
        </div>
      </transition>
    </div>
  </transition>
</template>

<script setup>
import isMacOS from "~/utils/isMacOS.js";

const search = ref('');
const model = defineModel();

const results = ref([]);

watch(() => search.value, v => {
  results.value = getSearchContent(v);
});

function handleKeydown(e) {
  if (e.code === 'Escape') {
    model.value = false;
  }

  if (e.code === 'KeyK') {
    if ((isMacOS() && e.metaKey) || (!isMacOS() && e.ctrlKey)) {
      model.value = !model.value;
    }
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style lang="scss">
@use '@/assets/global.scss';

.search-note {
  color: #aaa;
  text-align: center;
  margin: 8px 0;
}

.opacity-enter-from,
.opacity-leave-to {
  opacity: 0;
}

.opacity-enter-active,
.opacity-leave-active,
.zoom-enter-active,
.zoom-leave-active {
  transition: all .2s ease;
}

.zoom-enter-active,
.zoom-leave-active {
  transition-delay: .2s;
}

.zoom-enter-from,
.zoom-leave-to {
  transform: scale(.9);
  opacity: 0;
}

.search-layer {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, .8);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100vw;
  height: 100vh;
  z-index: 200;
}

.search-modal {
  background: white;
  padding: 20px;
  width: 35%;
  border-radius: 10px;
  box-shadow: 0 4px 5px rgba(0, 0, 0, .2);
  box-sizing: border-box;

  @media (max-width: 768px) {
    width: 90%;
  }

  input {
    outline: none;
    border: none;
    border-bottom: 2px solid rgba(0, 0, 0, .2);
    width: 100%;
    font-size: 20px;
    transition: all .2s ease;
    line-height: 1.5;
    margin-bottom: 8px;
    box-sizing: border-box;

    &:focus {
      border-bottom-color: #009688 !important;
    }

    &:hover {
      border-bottom-color: rgba(#009688, .4);
    }
  }
}

.search-results {
  overflow-y: auto;
  max-height: 70vh;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
  scrollbar-width: none;
}

.search-result {
  padding: 16px;
  border: 1px solid transparent;
  transition: all .2s ease;
  border-radius: 10px;
  cursor: pointer;

  &:hover {
    background: #e0f2f1;
    border: 1px solid rgba(#004d40, .8);
    box-shadow: 0 6px 0 rgba(0, 0, 0, .1);
    transform: translateY(-2px);
  }

  strong {
    background: #fcf900;
  }

  h2 {
    margin-top: 0;
    margin-bottom: 8px;
  }

  .meta {
    display: flex;
    align-items: center;
    color: #aaa;
    font-size: 14px;

    span:not(:last-child)::after {
      content: '·';
      margin: 0 8px;
    }

    @media (max-width: 768px) {
      span:not(:last-child)::after {
        margin: 0 4px;
      }
    }
  }

  .data {
    display: flex;
    align-items: center;
    gap: 16px;
    font-size: 14px;
    font-family: global.$monospaceFont;

    @media (max-width: 768px) {
      font-size: 12px;
    }

    .bg {
      background: #e0f2f1;
      padding: 4px 8px;
      border-radius: 5px;
    }
  }
}
</style>