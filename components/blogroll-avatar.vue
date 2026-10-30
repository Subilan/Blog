<template>
  <div class="relative size-[50px] shrink-0 overflow-hidden rounded-full">
    <div
      class="absolute inset-0 rounded-full bg-neutral-500/40 transition-opacity duration-300"
      :class="loaded ? 'opacity-0' : 'opacity-100 animate-pulse'"
    />
    <img
      v-if="!failed"
      ref="el"
      :src="src"
      :alt="alt"
      loading="lazy"
      decoding="async"
      referrerpolicy="no-referrer"
      class="relative size-full object-cover transition-opacity duration-300"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      @load="loaded = true"
      @error="failed = true"
    />
    <span v-else class="relative flex size-full items-center justify-center text-lg font-semibold uppercase">
      {{ initial }}
    </span>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ src: string; alt: string }>();

const el = ref<HTMLImageElement>();
const loaded = ref(false);
const failed = ref(false);

const initial = computed(() => props.alt.trim().slice(0, 1) || '?');

// 图片在挂载前就已完成时不会再补发 load，需要主动同步一次状态
onMounted(() => {
  const img = el.value;

  if (!img?.complete) return;

  if (img.naturalWidth > 0) {
    loaded.value = true;
  } else {
    failed.value = true;
  }
});
</script>
