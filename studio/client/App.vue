<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { MoonIcon, SunIcon } from '@lucide/vue';
import { Button } from '@/studio/client/components/ui/button';
import { Separator } from '@/studio/client/components/ui/separator';
import { Toaster } from '@/studio/client/components/ui/sonner';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/studio/client/components/ui/tooltip';
import MediaLibrary from '@/studio/client/views/MediaLibrary.vue';
import PostEditor from '@/studio/client/editor/PostEditor.vue';
import PostList from '@/studio/client/views/PostList.vue';
import { loadConfig } from '@/studio/client/config';
import { cn } from '@/studio/client/lib/utils';

const route = ref(window.location.hash.replace(/^#/, '') || '/posts');
window.addEventListener('hashchange', () => {
	route.value = window.location.hash.replace(/^#/, '') || '/posts';
});

const stem = computed(() => {
	const raw = route.value.replace(/^\/posts\//, '');
	try {
		return decodeURIComponent(raw);
	} catch {
		return raw;
	}
});

const tab = computed(() => {
	if (route.value.startsWith('/posts/')) return 'editor';
	if (route.value.startsWith('/media')) return 'media';
	return 'posts';
});

const dark = ref(false);
const NAV = [
	{ href: '#/posts', label: '文章', key: 'posts' },
	{ href: '#/media', label: '图片资源', key: 'media' }
];

onMounted(() => {
	void loadConfig();
	const stored = localStorage.getItem('studio:dark');
	dark.value = stored ? stored === '1' : window.matchMedia('(prefers-color-scheme: dark)').matches;
	document.documentElement.classList.toggle('dark', dark.value);
});

function toggleDark() {
	dark.value = !dark.value;
	document.documentElement.classList.toggle('dark', dark.value);
	localStorage.setItem('studio:dark', dark.value ? '1' : '0');
}

function openPost(next: string) {
	window.location.hash = `#/posts/${encodeURIComponent(next)}`;
}

function closePost() {
	window.location.hash = '#/posts';
}
</script>

<template>
  <TooltipProvider>
    <div class="min-h-screen">
      <header class="flex h-12 items-center gap-3 border-b px-4">
        <nav class="flex items-center gap-1">
          <Button
            v-for="item in NAV"
            :key="item.key"
            as-child
            :variant="tab === item.key || (item.key === 'posts' && tab === 'editor') ? 'secondary' : 'ghost'"
            size="sm"
          >
            <a :href="item.href">{{ item.label }}</a>
          </Button>
        </nav>
        <Separator orientation="vertical" class="h-5!" />
        <span class="text-muted-foreground text-xs">本地后台，直接读写 data/posts 与 OSS</span>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="icon-sm" class="ml-auto" @click="toggleDark">
              <MoonIcon v-if="!dark" />
              <SunIcon v-else />
              <span class="sr-only">切换深浅色</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>切换深浅色</TooltipContent>
        </Tooltip>
      </header>

      <main :class="cn(tab === 'editor' ? 'h-[calc(100vh-3rem)]' : '')">
        <PostList v-if="tab === 'posts'" @open="openPost" />
        <PostEditor v-else-if="tab === 'editor' && stem" :key="stem" :stem="stem" @close="closePost" />
        <MediaLibrary v-else-if="tab === 'media'" />
      </main>
    </div>
    <Toaster position="bottom-right" />
  </TooltipProvider>
</template>
