import { spawn } from 'node:child_process';
import { relative, resolve } from 'node:path';
import { watch, type FSWatcher } from 'chokidar';
import { defineNuxtModule, useLogger } from '@nuxt/kit';
import type { ViteDevServer } from 'vite';

const POSTS_DIR = 'data/posts';
const DEBOUNCE_MS = 150;
const WATCHED_EVENTS = new Set(['add', 'change', 'unlink']);

/**
 * dev 下监视 data/posts 里的 Markdown，改动后跑一次增量 `yarn data`，
 * 重新生成 public/data/*.json、OG 图片与 data/postdigests.json，
 * 完成后发一次整页刷新，让浏览器拿到新内容。
 */
export default defineNuxtModule({
	meta: {
		name: 'post-rebuild'
	},
	setup(_options, nuxt) {
		if (!nuxt.options.dev) return;

		const rootDir = nuxt.options.rootDir;
		const logger = useLogger('post-rebuild');
		let watcher: FSWatcher | undefined;
		let viteServer: ViteDevServer | undefined;
		let timer: NodeJS.Timeout | undefined;
		let running = false;
		let queued = false;

		function rebuild() {
			if (running) {
				queued = true;
				return;
			}

			running = true;
			const startedAt = Date.now();
			const child = spawn(resolve(rootDir, 'node_modules/.bin/vite-node'), ['build.ts'], {
				cwd: rootDir,
				stdio: 'inherit'
			});

			let settled = false;
			const finish = (code: number | null) => {
				if (settled) return;
				settled = true;
				running = false;
				if (code === 0) {
					logger.success(`重新渲染完成 (${Date.now() - startedAt}ms)`);
					// public/data 的写入不一定会带上 post 页面，这里统一整页刷新
					viteServer?.ws.send({ type: 'full-reload' });
				} else {
					logger.error(`build.ts 退出，退出码 ${code}`);
				}
				if (queued) {
					queued = false;
					rebuild();
				}
			};

			child.on('error', error => {
				logger.error(error);
				finish(null);
			});
			child.on('close', finish);
		}

		function schedule() {
			if (timer) clearTimeout(timer);
			timer = setTimeout(() => {
				timer = undefined;
				rebuild();
			}, DEBOUNCE_MS);
		}

		nuxt.hook('vite:serverCreated', (server, env) => {
			if (!env.isClient || watcher) return;

			viteServer = server;
			watcher = watch(resolve(rootDir, POSTS_DIR), { ignoreInitial: true });
			watcher.on('all', (event, path) => {
				if (!WATCHED_EVENTS.has(event) || !path.endsWith('.md')) return;
				logger.info(`${event} ${relative(rootDir, path)}`);
				schedule();
			});
			nuxt.hook('close', () => void watcher?.close());
		});
	}
});
