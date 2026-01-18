<template>
  <div class="copy-btn button less-shadow" :class="{copyComplete}" @click="copy">
    <icon :path="copyComplete ? mdiCheck : mdiClipboardTextOutline"/> {{ copyComplete ? '复制成功' : '点击复制'}}
  </div>
</template>

<script setup>
import {mdiCheck, mdiClipboardTextOutline} from "@mdi/js";

const props = defineProps({
  content: {
    type: String,
  }
})

const copyComplete = ref(false);

async function copy() {
  await navigator.clipboard.writeText(props.content);
  copyComplete.value = true;
  setTimeout(() => {
    copyComplete.value = false;
  }, 500);
}
</script>