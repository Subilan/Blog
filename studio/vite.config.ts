import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import tailwindcss from '@tailwindcss/vite';

const studioRoot = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(studioRoot, '..');
const port = Number(process.env.STUDIO_PORT || 3040);

export default defineConfig({
	root: studioRoot,
	plugins: [vue(), tailwindcss()],
	resolve: {
		// 与仓库 tsconfig（Nuxt 生成）里的 @/* → 仓库根保持一致，
		// shadcn-vue 生成的组件就是靠这个前缀互相引用的
		alias: { '@': repoRoot }
	},
	server: {
		hmr: { port: port + 1 },
		fs: { allow: [repoRoot] }
	},
	ssr: { external: true }
});
