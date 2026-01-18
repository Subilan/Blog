<template>
  <transition name="opacity">
    <div class="search-layer" v-if="model" @click.self="model = false">
      <transition name="zoom" appear>
        <div class="search-modal" v-if="model">
          <input ref="searchInput" tabindex="100" placeholder="输入标题或正文关键词" v-model="search" type="text"/>
          <div class="search-results" v-if="results.length > 0">
            <div @keydown.enter="navigateTo(`/posts/${x.slug}`); model = false" class="search-result card clickable" v-for="(x, i) in results" :tabindex="100+i" @click="navigateTo(`/posts/${x.slug}`); model = false">
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
import { useTemplateRef } from "vue";
import isMacOS from "~/utils/isMacOS.js";

const search = ref('');
const model = defineModel();

const results = ref([]);

const searchInput = useTemplateRef("searchInput");

watch(() => search.value, v => {
  results.value = getSearchContent(v);
});

watch(() => searchInput.value, v => {
  if (v !== null) v.focus();
});

function handleKeydown(e) {
  if (e.code === 'Escape') {
    model.value = false;
  }

  if (e.code === 'KeyK') {
    if ((isMacOS() && e.metaKey) || (!isMacOS() && e.ctrlKey)) {
      e.preventDefault();
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