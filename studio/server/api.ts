/**
 * 本地后台的 HTTP API：所有操作都直接读写仓库里的文件与 OSS，
 * 没有数据库，也没有认证，只应该在本机跑。
 */

import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import crypto from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import type { IncomingMessage, ServerResponse } from 'node:http';
import sharp from 'sharp';
import { composePost, countWordsCJK, readPost, renderMarkdown } from '../markdown';
import { mdastToPmDoc, pmDocToMdast } from '../editor/mdast-pm';
import { OSS_ORIGIN, OSS_SCHEME, OSS_URI } from '../../oss-assets';
import {
	DEFAULTS,
	collectReferences,
	copyObject,
	decodeSegment,
	deleteObject,
	encodeImage,
	head,
	listObjects,
	objectUrl,
	requireOssutil,
	uploadStage,
	verifyUploads,
	type EncodeOptions,
	type Row
} from '../../oss-lib';

const run = promisify(execFile);

// 路径都相对仓库根解析：后台可能从 studio/ 目录启动（yarn workspace），
// 用 cwd 拼相对路径会读不到 data/posts
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const POSTS_DIR = path.join(REPO_ROOT, 'data/posts');
const STAGING_DIR = path.join(REPO_ROOT, '.studio/staging');
const ENCODE_OPTIONS: EncodeOptions = {
	maxEdge: DEFAULTS.maxEdge,
	quality: DEFAULTS.quality,
	concurrency: DEFAULTS.concurrency,
	maxBytes: DEFAULTS.maxBytes,
	minGain: DEFAULTS.minGain
};

// ---------------------------------------------------------------------------
// 基础工具
// ---------------------------------------------------------------------------

class HttpError extends Error {
	constructor(
		message: string,
		readonly status = 400
	) {
		super(message);
	}
}

function assertStem(stem: string) {
	if (!stem || stem.includes('/') || stem.includes('\\') || stem.startsWith('.') || stem.includes('\0')) {
		throw new HttpError(`非法文件名 ${stem}`);
	}
	return stem;
}

function postPath(stem: string) {
	return path.join(POSTS_DIR, `${assertStem(decodeURIComponent(stem))}.md`);
}

async function readBody(req: IncomingMessage) {
	const chunks: Buffer[] = [];
	for await (const chunk of req) chunks.push(chunk as Buffer);
	return Buffer.concat(chunks);
}

async function readJson<T = any>(req: IncomingMessage): Promise<T> {
	const body = await readBody(req);
	if (!body.length) return {} as T;
	try {
		return JSON.parse(body.toString('utf8')) as T;
	} catch (error) {
		throw new HttpError(`请求体不是合法 JSON：${(error as Error).message}`);
	}
}

function sendJson(res: ServerResponse, status: number, payload: unknown) {
	const body = JSON.stringify(payload);
	res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'content-length': Buffer.byteLength(body) });
	res.end(body);
}

function slugifyStem(input: string) {
	return (
		input
			.trim()
			.replace(/\s+/g, '-')
			.replace(/[^A-Za-z0-9\-_.\u4e00-\u9fff]/g, '')
			.replace(/-+/g, '-')
			.replace(/^-|-$/g, '') || ''
	);
}

/**
 * 文件名的安全形式：只用 ASCII 字母数字和 - _ . ，中文与空格都会丢，
 * 主名被清空时退化成 img-<hash>。这样 markdown 里不会再出现 %20 和
 * 百分号编码的中文。
 */
function safeAssetName(input: string) {
	const base = path.basename(decodeURIComponent(input)).replace(/[/\\?%*:|"<>]/g, '-');
	const extension = path.extname(base).toLowerCase().replace(/[^a-z0-9.]/g, '');
	const stem = base.slice(0, base.length - path.extname(base).length);
	const cleaned = stem
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9._-]/g, '-')
		.replace(/-+/g, '-')
		.replace(/^[-._]+|[-._]+$/g, '');
	const safeStem = cleaned || `img-${crypto.createHash('sha1').update(base).digest('hex').slice(0, 8)}`;
	return `${safeStem}${extension || '.jpg'}`;
}

function stagingDir(stem: string) {
	return path.join(STAGING_DIR, assertStem(decodeURIComponent(stem)));
}

async function listStaged(stem: string) {
	const dir = stagingDir(stem);
	let names: string[] = [];
	try {
		names = await fs.readdir(dir);
	} catch {
		return [];
	}
	const stat = await Promise.all(
		names.map(async name => {
			const info = await fs.stat(path.join(dir, name));
			return { name, size: info.size, mtime: info.mtimeMs, url: stagedUrl(stem, name) };
		})
	);
	return stat.sort((a, b) => a.name.localeCompare(b.name));
}

function stagedUrl(stem: string, name: string) {
	return `/api/staged/${encodeURIComponent(decodeURIComponent(stem))}/${encodeURIComponent(name)}`;
}

function stagedRefPattern() {
	return /\/api\/staged\/([^/\s)"'<>]+)\/([^/\s)"'<>]+)/g;
}

function inferOssDir(markdown: string) {
	const match = markdown.match(/oss:\/\/([^/\s)"'<>]+)\//);
	return match ? decodeSegment(match[1]) : '';
}

// ---------------------------------------------------------------------------
// 文章
// ---------------------------------------------------------------------------

async function listPosts() {
	const files = (await fs.readdir(POSTS_DIR)).filter(name => name.endsWith('.md')).sort();
	const posts = await Promise.all(
		files.map(async file => {
			const stem = file.replace(/\.md$/, '');
			const full = path.join(POSTS_DIR, file);
			const [source, stat] = await Promise.all([fs.readFile(full, 'utf8'), fs.stat(full)]);
			const { frontmatter, title, words } = await readPost(source);
			return {
				stem,
				file,
				title,
				words,
				mtime: stat.mtimeMs,
				hidden: !!frontmatter?.hidden,
				date: frontmatter?.date ?? '',
				cate: frontmatter?.cate ?? '',
				desc: frontmatter?.desc ?? '',
				'desc-short': frontmatter?.['desc-short'] ?? ''
			};
		})
	);
	return posts;
}

// ---------------------------------------------------------------------------
// 图片上传
// ---------------------------------------------------------------------------

async function encodeIntoStage(entries: { source: string; key: string }[], stage: string) {
	const rows: Row[] = [];
	for (const entry of entries) {
		const buffer = await fs.readFile(entry.source);
		const meta = await sharp(buffer).metadata();
		const encoded = await encodeImage(buffer, meta, ENCODE_OPTIONS);
		const gain = encoded ? 1 - encoded.data.length / buffer.length : 0;
		const keep = !encoded || gain * 100 < ENCODE_OPTIONS.minGain;
		const output = keep ? buffer : encoded!.data;
		const destination = path.join(stage, entry.key);
		await fs.mkdir(path.dirname(destination), { recursive: true });
		await fs.writeFile(destination, output);
		rows.push({
			rel: entry.key,
			key: entry.key,
			before: buffer.length,
			after: output.length,
			label: keep ? `保持原图（只能省 ${(gain * 100).toFixed(0)}%）` : encoded!.label
		});
	}
	return rows;
}

/** 压缩 → 上传 → 逐个 HEAD 校验，失败时返回错误而不是把 oss:// 写进文章 */
async function publish(entries: { source: string; key: string }[]) {
	requireOssutil(true);
	const stage = await fs.mkdtemp(path.join(os.tmpdir(), 'studio-oss-'));
	try {
		const rows = await encodeIntoStage(entries, stage);
		await uploadStage(stage);
		const failures = await verifyUploads(rows, Math.max(ENCODE_OPTIONS.concurrency, 8));
		if (failures.length) throw new HttpError(`上传校验失败：\n${failures.join('\n')}`, 502);
		return rows;
	} finally {
		await fs.rm(stage, { recursive: true, force: true });
	}
}

async function putPost(stem: string, body: any) {
	const target = postPath(stem);
	const markdownBeforeWrite = composePost(pmDocToMdast(body.doc), body.frontmatter);

	const pending: { name: string; source: string; ref: string }[] = [];
	const selfStem = decodeURIComponent(stem);
	for (const match of markdownBeforeWrite.matchAll(stagedRefPattern())) {
		const [ref, rawStem, rawName] = match;
		const owner = decodeSegment(rawStem);
		const name = decodeSegment(rawName);
		if (owner !== selfStem) continue;
		pending.push({ name, source: path.join(stagingDir(selfStem), name), ref });
	}
	if (pending.length) {
		for (const item of pending) {
			await fs.access(item.source).catch(() => {
				throw new HttpError(`暂存图片不存在：${item.name}，请重新拖入后再保存`);
			});
		}
	}

	const ossDir = String(body.ossDir || '').trim() || inferOssDir(markdownBeforeWrite) || selfStem.toLowerCase();
	const uploaded = pending.length
		? await publish(pending.map(item => ({ source: item.source, key: `${ossDir}/${item.name}` })))
		: [];

	let markdown = markdownBeforeWrite;
	for (const item of pending) {
		markdown = markdown.split(item.ref).join(`${OSS_SCHEME}${ossDir}/${item.name}`);
	}

	await fs.mkdir(POSTS_DIR, { recursive: true });
	await fs.writeFile(target, markdown);
	for (const item of pending) await fs.rm(item.source, { force: true });
	if (pending.length) await fs.rm(stagingDir(selfStem), { recursive: true, force: true });

	return { stem: selfStem, markdown, ossDir, uploaded: uploaded.map(row => ({ key: row.key, url: objectUrl(row.key), before: row.before, after: row.after, label: row.label })) };
}

async function createPost(body: any) {
	const stem = slugifyStem(body.file || body.title || '');
	if (!stem) throw new HttpError('需要提供文件名');
	const target = postPath(stem);
	const exists = await fs.access(target).then(() => true, () => false);
	if (exists) throw new HttpError(`${stem}.md 已存在`, 409);
	const date = body.date || new Date().toISOString().slice(0, 10).replace(/-/g, '/');
	const frontmatter: any = { date };
	if (body.cate) frontmatter.cate = body.cate;
	if (body.desc) frontmatter.desc = body.desc;
	const tree = {
		type: 'root',
		children: [{ type: 'heading', depth: 1, children: [{ type: 'text', value: body.title || stem }] }]
	};
	await fs.mkdir(POSTS_DIR, { recursive: true });
	await fs.writeFile(target, composePost(tree, frontmatter));
	return { stem };
}

async function renamePost(stem: string, to: string) {
	const from = postPath(stem);
	const next = slugifyStem(to);
	if (!next) throw new HttpError('目标文件名不合法');
	const destination = postPath(next);
	if (await fs.access(destination).then(() => true, () => false)) throw new HttpError(`${next}.md 已存在`, 409);
	await fs.rename(from, destination);
	await fs.rename(stagingDir(decodeURIComponent(stem)), stagingDir(next)).catch(() => {});
	return { stem: next };
}

// ---------------------------------------------------------------------------
// 媒体库
// ---------------------------------------------------------------------------

async function mediaIndex() {
	const [objects, references] = await Promise.all([
		Promise.resolve().then(() => listObjects()),
		collectReferences()
	]);
	const byDecoded = new Map(references.map(reference => [reference.key.split('/').map(decodeSegment).join('/'), reference.posts]));
	const items = objects.map(object => ({
		key: object.key,
		decoded: object.key.split('/').map(decodeSegment).join('/'),
		size: object.size,
		url: objectUrl(object.key),
		posts: byDecoded.get(object.key.split('/').map(decodeSegment).join('/')) ?? []
	}));
	const seen = new Set(items.map(item => item.decoded));
	const missing = references
		.filter(reference => !seen.has(reference.key.split('/').map(decodeSegment).join('/')))
		.map(reference => ({ key: reference.key, posts: reference.posts }));
	return { items, references, missing };
}

/** 计算某个目录里文件名不安全的对象，给出改名方案（不落盘） */
async function planNormalize(dir: string) {
	const objects = listObjects().filter(object => object.key.split('/').slice(0, -1).join('/') === dir);
	const references = await collectReferences();
	const byDecoded = new Map(references.map(reference => [reference.key.split('/').map(decodeSegment).join('/'), reference.posts]));
	const taken = new Set(objects.map(object => object.key.split('/').pop()!));
	const moves: { from: string; to: string; posts: string[] }[] = [];
	for (const object of objects) {
		const name = object.key.split('/').pop()!;
		const safe = safeAssetName(name);
		if (safe === name) continue;
		let candidate = safe;
		let counter = 2;
		while (taken.has(candidate)) candidate = `${safe.replace(/(\.[^.]+)$/, '')}-${counter++}$1`;
		taken.delete(name);
		taken.add(candidate);
		const decoded = object.key.split('/').map(decodeSegment).join('/');
		moves.push({ from: name, to: candidate, posts: byDecoded.get(decoded) ?? [] });
	}
	return moves;
}

async function applyMoves(dir: string, moves: { from: string; to: string }[], rewrite: boolean) {
	const applied: string[] = [];
	for (const move of moves) {
		const fromKey = `${dir}/${move.from}`;
		const toKey = `${dir}/${move.to}`;
		const { status } = await head(toKey);
		if (status === 200) throw new HttpError(`目标对象已存在：${toKey}`);
		copyObject(fromKey, toKey);
		const { status: verifyStatus, size } = await head(toKey);
		if (verifyStatus !== 200) throw new HttpError(`复制后校验失败：${toKey}`);
		deleteObject(fromKey);
		applied.push(`${fromKey} → ${toKey}（${size} 字节）`);
	}

	const changedPosts = rewrite ? await rewriteReferences(dir, moves) : [];
	return { applied, changedPosts };
}

async function rewriteReferences(dir: string, moves: { from: string; to: string }[]) {
	const lookup = new Map(moves.map(move => [`${dir}/${move.from}`, `${dir}/${move.to}`]));
	const changed: string[] = [];
	for (const file of (await fs.readdir(POSTS_DIR)).filter(name => name.endsWith('.md'))) {
		const full = path.join(POSTS_DIR, file);
		const source = await fs.readFile(full, 'utf8');
		let count = 0;
		const next = source.replace(/(oss:\/\/)([^)\s"'<>]+)/g, (whole, scheme: string, raw: string) => {
			const decoded = raw.split('/').map(decodeSegment).join('/');
			const target = lookup.get(decoded);
			if (!target) return whole;
			count++;
			return scheme + target.split('/').map(encodeURIComponent).join('/');
		});
		if (!count) continue;
		await fs.writeFile(full, next);
		changed.push(`${file}（${count} 处）`);
	}
	return changed;
}

// ---------------------------------------------------------------------------
// 路由
// ---------------------------------------------------------------------------

export async function handle(req: IncomingMessage, res: ServerResponse) {
	const url = new URL(req.url ?? '/', 'http://localhost');
	const route = decodeURIComponent(url.pathname.replace(/^\/api/, ''));
	const method = req.method ?? 'GET';

	try {
		// 文章
		if (route === '/posts' && method === 'GET') return sendJson(res, 200, { posts: await listPosts() });
		if (route === '/posts' && method === 'POST') return sendJson(res, 200, await createPost(await readJson(req)));

		const postMatch = route.match(/^\/posts\/([^/]+)$/);
		if (postMatch) {
			const stem = postMatch[1];
			if (method === 'GET') {
				const source = await fs.readFile(postPath(stem), 'utf8').catch(() => {
					throw new HttpError(`找不到 ${stem}.md`, 404);
				});
				const { tree, frontmatter, title, words } = await readPost(source);
				const markdown = composePost(tree, frontmatter);
				return sendJson(res, 200, {
					stem: decodeURIComponent(stem),
					title,
					words,
					frontmatter,
					doc: mdastToPmDoc(tree),
					markdown,
					ossDir: inferOssDir(source) || decodeURIComponent(stem).toLowerCase(),
					staged: await listStaged(stem),
					references: (await collectReferences()).find(reference => reference.key.startsWith(`${inferOssDir(source)}/`)) ? [] : []
				});
			}
			if (method === 'PUT') return sendJson(res, 200, await putPost(stem, await readJson(req)));
			if (method === 'DELETE') {
				await fs.rm(postPath(stem), { force: true });
				await fs.rm(stagingDir(stem), { recursive: true, force: true });
				return sendJson(res, 200, { ok: true });
			}
		}

		const renameMatch = route.match(/^\/posts\/([^/]+)\/rename$/);
		if (renameMatch && method === 'POST') {
			const body = await readJson<{ to: string }>(req);
			return sendJson(res, 200, await renamePost(renameMatch[1], body.to));
		}

		const stagedMatch = route.match(/^\/posts\/([^/]+)\/staged$/);
		if (stagedMatch) {
			const stem = stagedMatch[1];
			if (method === 'GET') return sendJson(res, 200, { staged: await listStaged(stem) });
			if (method === 'POST') {
				const original = url.searchParams.get('name') || 'image.png';
				const name = safeAssetName(original);
				const dir = stagingDir(stem);
				await fs.mkdir(dir, { recursive: true });
				await fs.writeFile(path.join(dir, name), await readBody(req));
				const { size } = await fs.stat(path.join(dir, name));
				return sendJson(res, 200, { name, size, url: stagedUrl(stem, name), original, renamed: name !== path.basename(original) });
			}
			if (method === 'DELETE') {
				const name = url.searchParams.get('name');
				if (!name) throw new HttpError('缺少 name');
				await fs.rm(path.join(stagingDir(stem), safeAssetName(name)), { force: true });
				return sendJson(res, 200, { ok: true });
			}
		}

		const serveStaged = route.match(/^\/staged\/([^/]+)\/(.+)$/);
		if (serveStaged && method === 'GET') {
			const file = path.join(stagingDir(serveStaged[1]), path.basename(serveStaged[2]));
			const data = await fs.readFile(file).catch(() => {
				throw new HttpError('暂存图片不存在', 404);
			});
			res.writeHead(200, { 'content-type': mimeOf(file), 'content-length': data.length, 'cache-control': 'no-store' });
			res.end(data);
			return;
		}

		if (route === '/config' && method === 'GET') {
			return sendJson(res, 200, { ossOrigin: OSS_ORIGIN, ossScheme: OSS_SCHEME, ossUri: OSS_URI });
		}

		// 渲染与构建
		if (route === '/render' && method === 'POST') {
			const body = await readJson<{ markdown: string }>(req);
			return sendJson(res, 200, await renderMarkdown(body.markdown ?? ''));
		}
		// 不落盘地把编辑器文档转成 Markdown 并渲染，给源码视图和预览用
		if (route === '/markdown' && method === 'POST') {
			const body = await readJson<{ frontmatter?: any; doc: any }>(req);
			const markdown = composePost(pmDocToMdast(body.doc), body.frontmatter);
			return sendJson(res, 200, { markdown, words: countWordsCJK(markdown), ...(await renderMarkdown(markdown)) });
		}
		if (route === '/build' && method === 'POST') {
			const result = await run(path.join(REPO_ROOT, 'node_modules/.bin/vite-node'), ['build.ts'], { cwd: REPO_ROOT });
			return sendJson(res, 200, { ok: true, output: `${result.stdout}${result.stderr}`.trim() });
		}

		// 媒体库
		if (route === '/media' && method === 'GET') return sendJson(res, 200, await mediaIndex());
		if (route === '/media/upload' && method === 'POST') {
			const dir = (url.searchParams.get('dir') || '').replace(/^\/+|\/+$/g, '');
			if (!dir) throw new HttpError('缺少 dir');
			const name = safeAssetName(url.searchParams.get('name') || 'image.png');
			const raw = await readBody(req);
			if (!raw.length) throw new HttpError('空文件');
			const temp = path.join(await fs.mkdtemp(path.join(os.tmpdir(), 'studio-up-')), name);
			await fs.writeFile(temp, raw);
			const rows = await publish([{ source: temp, key: `${dir}/${name}` }]);
			await fs.rm(path.dirname(temp), { recursive: true, force: true });
			const row = rows[0];
			return sendJson(res, 200, { key: row.key, url: objectUrl(row.key), before: row.before, after: row.after, label: row.label });
		}
		if (route === '/media/delete' && method === 'POST') {
			const body = await readJson<{ keys: string[] }>(req);
			for (const key of body.keys ?? []) deleteObject(key);
			return sendJson(res, 200, { ok: true, deleted: body.keys ?? [] });
		}
		if (route === '/media/normalize' && method === 'POST') {
			const body = await readJson<{ dir: string }>(req);
			return sendJson(res, 200, { moves: await planNormalize(body.dir) });
		}
		if (route === '/media/rename' && method === 'POST') {
			const body = await readJson<{ dir: string; moves: { from: string; to: string }[]; rewrite?: boolean }>(req);
			return sendJson(res, 200, await applyMoves(body.dir, body.moves ?? [], body.rewrite !== false));
		}
		if (route === '/media/check' && method === 'POST') {
			const references = await collectReferences();
			const missing: string[] = [];
			await Promise.all(
				references.map(async reference => {
					const { status } = await head(reference.key);
					if (status !== 200) missing.push(`${reference.key}（HTTP ${status}，来自 ${reference.posts.join('、')}）`);
				})
			);
			const stale = references.filter(reference => reference.key.split('/')[0].endsWith('-img')).map(reference => reference.key);
			return sendJson(res, 200, { total: references.length, missing, stale });
		}

		throw new HttpError(`没有这个接口：${method} ${route}`, 404);
	} catch (error) {
		const status = error instanceof HttpError ? error.status : 500;
		sendJson(res, status, { error: error instanceof Error ? error.message : String(error) });
	}
}

function mimeOf(file: string) {
	const extension = path.extname(file).toLowerCase();
	return (
		{
			'.png': 'image/png',
			'.jpg': 'image/jpeg',
			'.jpeg': 'image/jpeg',
			'.webp': 'image/webp',
			'.gif': 'image/gif',
			'.avif': 'image/avif',
			'.svg': 'image/svg+xml'
		}[extension] ?? 'application/octet-stream'
	);
}

export { OSS_URI };
