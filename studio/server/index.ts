/**
 * 后台的启动入口：一个进程里同时跑 Vite（服务前端、带 HMR）和 /api 路由。
 *
 *   yarn studio
 *
 * 前端代码在 studio/client 下，API 代码在 studio/server 下，两者都与博客
 * 本身的 pages/components 没有关系，只在构建时共用 assets/main.css 与
 * markdown 管道。
 */

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';

const here = path.dirname(fileURLToPath(import.meta.url));
const studioRoot = path.resolve(here, '..');
const repoRoot = path.resolve(studioRoot, '..');
const port = Number(process.env.STUDIO_PORT || 3040);

const vite = await createViteServer({
	// 配置在 studio/vite.config.ts（别名、Tailwind、插件），这里只补中间件模式
	configFile: path.join(studioRoot, 'vite.config.ts'),
	appType: 'spa',
	server: { middlewareMode: true }
});

const server = http.createServer(async (req, res) => {
	if (req.url?.startsWith('/api/')) {
		try {
			// 通过 ssrLoadModule 取模块，改服务端代码不用重启
			const api = await vite.ssrLoadModule('/server/api.ts');
			await api.handle(req, res);
		} catch (error) {
			const message = error instanceof Error ? (error.stack ?? error.message) : String(error);
			console.error(`[api] ${message}`);
			if (!res.headersSent) {
				res.writeHead(500, { 'content-type': 'application/json; charset=utf-8' });
			}
			res.end(JSON.stringify({ error: message }));
		}
		return;
	}
	vite.middlewares(req, res, () => {
		res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
		res.end('not found');
	});
});

server.listen(port, () => {
	console.log(`后台已启动：http://localhost:${port}`);
	console.log(`文章目录：${path.join(repoRoot, 'data/posts')}`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
	process.on(signal, async () => {
		await vite.close();
		server.close();
		process.exit(0);
	});
}
