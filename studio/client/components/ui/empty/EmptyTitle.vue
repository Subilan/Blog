<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import { cn } from '@/studio/client/lib/utils'

const props = defineProps<{
  class?: HTMLAttributes['class']
}>()
</script>

<template>
  <div
    data-slot="empty-title"
    :class="cn('text-sm font-medium tracking-tight cn-font-heading', props.class)"
  >
    <slot />
  </div>
</template>
