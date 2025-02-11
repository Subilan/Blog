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

<style lang="scss" scoped>
@use '@/assets/var';

.copy-btn {
  display: inline-flex;
  align-items: center;
  font-size: 70%;
  padding: 6px 10px;
  border-radius: 50px;
  line-height: 1;
  margin: 0 8px;
  vertical-align: middle;
  cursor: pointer;
  gap: 4px;

  &.copyComplete {
    background: var.$primaryColor;
    color: white;
    border-color: transparent !important;
  }

  svg {
    height: 12px;
    width: 12px;
  }
}
</style>