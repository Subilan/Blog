<script setup lang="ts">
import { computed } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import { Badge } from '@/studio/client/components/ui/badge';
import { resolveAssetUrl } from '@/studio/client/config';

const props = defineProps(nodeViewProps);
const displaySrc = computed(() => resolveAssetUrl(props.node.attrs.src));
const pending = computed(() => (props.node.attrs.src || '').startsWith('/api/staged/'));

function edit() {
	window.dispatchEvent(
		new CustomEvent('studio:edit-image', {
			detail: { pos: props.getPos(), ...props.node.attrs }
		})
	);
}
</script>

<template>
  <NodeViewWrapper as="span" class="relative inline-block">
    <img
      :src="displaySrc"
      :alt="node.attrs.alt || ''"
      :title="node.attrs.title || ''"
      class="cursor-pointer"
      :class="pending && 'outline-primary/60 outline-2 outline-dashed outline-offset-2'"
      @click="edit"
    />
    <Badge
      v-if="pending"
      as="button"
      type="button"
      contenteditable="false"
      class="absolute top-0 left-0 rounded-tl-none"
      @click="edit"
    >
      本地待上传
    </Badge>
  </NodeViewWrapper>
</template>
