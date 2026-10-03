<template>
  <node-view-wrapper v-if="display" as="div" class="studio-math studio-math-block" @click="edit">
    <div v-html="rendered" />
  </node-view-wrapper>
  <node-view-wrapper v-else as="span" class="studio-math studio-math-inline" @click="edit">
    <span v-html="rendered" />
  </node-view-wrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { NodeViewWrapper, nodeViewProps } from '@tiptap/vue-3';
import katex from 'katex';

const props = defineProps(nodeViewProps);
const display = computed(() => props.node.type.name === 'mathBlock');

const rendered = computed(() =>
	katex.renderToString(props.node.attrs.latex || '', {
		displayMode: display.value,
		throwOnError: false,
		strict: false,
		output: 'html'
	})
);

function edit() {
	window.dispatchEvent(
		new CustomEvent('studio:edit-math', {
			detail: { pos: props.getPos(), latex: props.node.attrs.latex || '', display: display.value }
		})
	);
}
</script>

<style scoped>
.studio-math {
	cursor: pointer;
}

.studio-math-inline {
	display: inline-block;
	vertical-align: baseline;
}

.studio-math-block {
	margin-block: 1.25em;
	overflow-x: auto;
}

.studio-math:hover {
	outline: 1px dashed color-mix(in oklab, var(--primary) 60%, transparent);
}
</style>
