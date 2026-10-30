<template>
	<section class="mt-16">
		<div class="flex items-center gap-3 mb-6">
			<h2 class="text-xl font-bold">评论</h2>
			<div class="flex-1 h-px bg-neutral-200 dark:bg-neutral-700" />
		</div>
		<div ref="container" />
	</section>
</template>

<script setup lang="ts">
const REPO = 'Subilan/blog';
const REPO_ID = 'R_kgDODBQ3cQ';
const CATEGORY = 'Announcements';
const CATEGORY_ID = 'DIC_kwDODBQ3cc4DJ-XJ';

const container = ref<HTMLElement>();
let observer: MutationObserver | undefined;

function isDark() {
	return document.documentElement.classList.contains('dark');
}

function syncTheme() {
	const iframe = document.querySelector<HTMLIFrameElement>('iframe.giscus-frame');
	iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme: isDark() ? 'dark' : 'light' } } }, 'https://giscus.app');
}

onMounted(() => {
	const script = document.createElement('script');
	script.src = 'https://giscus.app/client.js';
	script.async = true;
	script.crossOrigin = 'anonymous';

	const attributes = {
		'data-repo': REPO,
		'data-repo-id': REPO_ID,
		'data-category': CATEGORY,
		'data-category-id': CATEGORY_ID,
		'data-mapping': 'pathname',
		'data-strict': '1',
		'data-reactions-enabled': '1',
		'data-emit-metadata': '0',
		'data-input-position': 'top',
		'data-theme': isDark() ? 'dark' : 'light',
		'data-lang': 'zh-CN',
		'data-loading': 'lazy'
	};

	for (const [key, value] of Object.entries(attributes)) {
		script.setAttribute(key, value);
	}

	container.value?.appendChild(script);

	observer = new MutationObserver(syncTheme);
	observer.observe(document.documentElement, { attributeFilter: ['class'] });
});

onUnmounted(() => {
	observer?.disconnect();
});
</script>
