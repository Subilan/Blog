/**
 * 加 shadcn-vue 组件的入口：yarn studio:add <组件名…>
 *
 * 直接调 shadcn-vue CLI 有三个坑，这里一起处理掉：
 *  1. CLI 会把 https_proxy 交给 undici 的 ProxyAgent，在当前环境里必失败，先摘掉；
 *     （另外它要一个项目根：package.json、components.json、tsconfig.json 都在 studio 下）
 *  2. CLI 会把「组件名」当成 npm 包写进 dependencies（例如 add badge 会装一个
 *     同名但毫不相干的 badge 包），提交后在这里剔掉；
 *  3. CLI 加完依赖会自己跑一次安装，而 yarn 1 的 workspace 提升在那一刻会把只有
 *     studio 用到的包（比如 @lucide/vue）从 node_modules 里删掉，所以补一次安装。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';

const studioDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(studioDir, '..');
const manifestPath = path.join(studioDir, 'package.json');
const components = process.argv.slice(2);

if (!components.length) {
	console.error('用法：yarn studio:add <组件名…>，例如 yarn studio:add sheet');
	process.exit(1);
}

const readManifest = () => JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const before = readManifest();

const env = { ...process.env };
delete env.https_proxy;
delete env.HTTPS_PROXY;

// 用清单里锁定的那份 CLI（@lucide/vue 那类 hoisting 之后在仓库根），不走 npx 现拉
const cli = path.join(repoRoot, 'node_modules', '.bin', 'shadcn-vue');
execFileSync(cli, ['add', ...components, '--cwd', studioDir, '--yes'], {
	stdio: 'inherit',
	env,
	cwd: studioDir
});

const after = readManifest();
const requested = new Set(components.map(name => name.replace(/^@[^/]+\//, '').toLowerCase()));
const junk = [];
for (const field of ['dependencies', 'devDependencies']) {
	for (const [name, version] of Object.entries(after[field] ?? {})) {
		if (before[field]?.[name] !== undefined) continue;
		if (!requested.has(name.toLowerCase())) continue;
		junk.push(`${name}@${version}`);
		delete after[field][name];
	}
}

if (junk.length) {
	fs.writeFileSync(manifestPath, `${JSON.stringify(after, null, '\t')}\n`);
	console.log(`已移除被误当依赖写入的 ${junk.join('、')}`);
}

execFileSync('yarn', ['install'], { stdio: 'inherit', cwd: repoRoot });
