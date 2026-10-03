import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkDirective from 'remark-directive';
import remarkMath from 'remark-math';
import { visit } from 'unist-util-visit';
import { OSS_ORIGIN, OSS_SCHEME, OSS_URI } from './oss-assets';

// 相对本模块所在目录解析，这样 CLI（仓库根）和后台（studio/）两边都能用
export const POSTS_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), 'data/posts');
export const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
export const DEFAULTS = { maxEdge: 2048, quality: 80, concurrency: 4, maxBytes: 1024 * 1024, minGain: 10 };

export type EncodeOptions = {
	maxEdge: number;
	quality: number;
	minGain: number;
	concurrency: number;
	maxBytes: number;
};

export type Row = { rel: string; key: string; before: number; after: number; label: string };
export type ObjectInfo = { key: string; size: number };
export type Reference = { key: string; posts: string[] };

export const kb = (n: number) => `${(n / 1024).toFixed(0)}K`;
export const mb = (n: number) => `${(n / 1048576).toFixed(1)}M`;

export function decodeSegment(segment: string) {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
}

export function objectUrl(key: string) {
	return OSS_ORIGIN + key.split('/').map(segment => encodeURIComponent(decodeSegment(segment))).join('/');
}

export function requireOssutil(withBucket: boolean) {
	try {
		execFileSync('ossutil', ['--version'], { stdio: 'ignore' });
	} catch {
		throw new Error('找不到 ossutil，先确认它已安装且在 PATH 里');
	}
	if (withBucket) execFileSync('ossutil', ['ls', OSS_URI, '-d', '--limited-num', '1'], { stdio: 'ignore' });
}

export function listObjects(): ObjectInfo[] {
	const output = execFileSync('ossutil', ['ls', OSS_URI, '--limited-num', '100000'], { encoding: 'utf8', maxBuffer: 128 * 1024 * 1024 });
	const objects: ObjectInfo[] = [];
	for (const line of output.split('\n')) {
		const marker = line.indexOf(OSS_URI);
		if (marker < 0) continue;
		const key = line.slice(marker + OSS_URI.length);
		if (!key || key.endsWith('/')) continue;
		const size = line.slice(0, marker).match(/\s(\d+)\s+(?:Standard|IA|Archive|ColdArchive)\s+/);
		if (!size) continue;
		objects.push({ key, size: Number(size[1]) });
	}
	return objects;
}

/**
 * 从若干篇文章里收集 oss:// 引用。
 *
 * 解析链要和站点一致（GFM、directive、math），否则脚注定义里的图片会被
 * 解析成缩进代码块，从而是「未引用」，可能被误删。
 */
export function collectReferencesFrom(sources: { file: string; content: string }[]) {
	const references = new Map<string, Set<string>>();
	const add = (key: string, post: string) => {
		if (!key) return;
		if (!references.has(key)) references.set(key, new Set());
		references.get(key)!.add(post);
	};
	const scanText = (text: string, post: string) => {
		for (const match of text.matchAll(/oss:\/\/([^)"'\s<>]+)/g)) add(match[1], post);
		for (const match of text.matchAll(/https?:\/\/fnmdp\.oss-cn-beijing\.aliyuncs\.com\/public\/blog\/([^)"'\s<>]+)/g)) add(decodeSegment(match[1]), post);
	};
	for (const { file, content } of sources) {
		const tree = unified().use(remarkParse).use(remarkMath).use(remarkDirective).use(remarkGfm).parse(content);
		visit(tree, 'image', (node: any) => {
			if (typeof node.url === 'string' && node.url.startsWith(OSS_SCHEME)) add(node.url.slice(OSS_SCHEME.length), file);
		});
		visit(tree, 'html', (node: any) => scanText(node.value, file));
		for (const match of content.matchAll(/<img\b[^>]*?\bsrc="oss:\/\/([^"]*)"/g)) add(match[1], file);
	}
	return [...references].map(([key, posts]) => ({ key, posts: [...posts].sort() })).sort((a, b) => a.key.localeCompare(b.key));
}

export async function collectReferences() {
	const files = (await fs.readdir(POSTS_DIR)).filter(name => name.endsWith('.md')).sort();
	const sources = await Promise.all(
		files.map(async file => ({ file, content: await fs.readFile(path.join(POSTS_DIR, file), 'utf8') }))
	);
	return collectReferencesFrom(sources);
}

export async function pool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
	let cursor = 0;
	await Promise.all(
		Array.from({ length: Math.min(limit, items.length) }, async () => {
			while (cursor < items.length) await worker(items[cursor++]);
		})
	);
}

export async function collectImages(dir: string) {
	const found: string[] = [];
	const walk = async (current: string, prefix: string) => {
		for (const entry of await fs.readdir(current, { withFileTypes: true })) {
			if (entry.name.startsWith('.')) continue;
			const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
			if (entry.isDirectory()) await walk(path.join(current, entry.name), rel);
			else if (IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) found.push(rel);
		}
	};
	await walk(dir, '');
	return found.sort();
}

export async function head(key: string) {
	for (let attempt = 0; attempt < 2; attempt++) {
		try {
			const response = await fetch(objectUrl(key), { method: 'HEAD' });
			return { status: response.status, size: Number(response.headers.get('content-length')) };
		} catch {
			// 网络抖动重试一次
		}
	}
	return { status: 0, size: 0 };
}

async function keepsTransparency(original: Buffer, candidate: Buffer) {
	const source = await sharp(original).stats();
	if (source.channels.length < 4 || source.channels[3].min === 255) return true;
	const output = await sharp(candidate).stats();
	const alpha = output.channels[output.channels.length - 1];
	return output.channels.length >= 4 && alpha.min < 255;
}

export async function encodeImage(buffer: Buffer, meta: sharp.Metadata, options: EncodeOptions) {
	if (meta.format === 'jpeg') {
		const data = await sharp(buffer)
			.rotate()
			.resize(options.maxEdge, options.maxEdge, { fit: 'inside', withoutEnlargement: true })
			.jpeg({ quality: options.quality, mozjpeg: true })
			.toBuffer();
		return { data, label: `jpeg q${options.quality}` };
	}
	if (meta.format === 'png') {
		const palette = await sharp(buffer).rotate().png({ quality: options.quality, effort: 8, compressionLevel: 9 }).toBuffer();
		if (meta.hasAlpha && !(await keepsTransparency(buffer, palette))) {
			const lossless = await sharp(buffer).rotate().png({ effort: 10, compressionLevel: 9 }).toBuffer();
			return { data: lossless, label: 'png 无损重压（调色板会丢透明）' };
		}
		return { data: palette, label: `png 调色板 q${options.quality}` };
	}
	return null;
}

export async function compressDirectory(sourceDir: string, keyDir: string, options: EncodeOptions, stage: string) {
	const files = await collectImages(sourceDir);
	if (!files.length) throw new Error(`${sourceDir} 下没有图片`);
	const rows: Row[] = [];
	const warnings = new Set<string>();

	await pool(files, options.concurrency, async rel => {
		const buffer = await fs.readFile(path.join(sourceDir, rel));
		const meta = await sharp(buffer).metadata();
		const encoded = await encodeImage(buffer, meta, options);
		const gain = encoded ? 1 - encoded.data.length / buffer.length : 0;
		const keep = !encoded || gain * 100 < options.minGain;
		const output = keep ? buffer : encoded!.data;
		const destination = path.join(stage, keyDir, rel);
		await fs.mkdir(path.dirname(destination), { recursive: true });
		await fs.writeFile(destination, output);
		if (rel.includes(' ')) warnings.add(`${rel}：文件名含空格，markdown 里要写成 %20`);
		if (meta.format && !['jpeg', 'png', 'webp', 'gif', 'avif'].includes(meta.format)) warnings.add(`${rel}：格式 ${meta.format} 未处理，原样上传`);
		rows.push({
			rel,
			key: `${keyDir}/${rel}`,
			before: buffer.length,
			after: output.length,
			label: keep ? `保持原图（只能省 ${(gain * 100).toFixed(0)}%）` : encoded!.label
		});
	});

	rows.sort((a, b) => b.before - a.before);
	return { rows, warnings: [...warnings].sort() };
}

export async function uploadStage(stage: string) {
	const workDir = await fs.mkdtemp(path.join(os.tmpdir(), 'oss-run-'));
	try {
		execFileSync('ossutil', ['cp', '-r', '-f', `${stage}/`, OSS_URI, '--force'], { cwd: workDir, stdio: 'inherit' });
	} finally {
		await fs.rm(workDir, { recursive: true, force: true });
	}
}

export async function verifyUploads(rows: Row[], concurrency = 8) {
	const failures: string[] = [];
	await pool(rows, concurrency, async row => {
		const { status, size } = await head(row.key);
		if (status !== 200) failures.push(`${row.key}: HTTP ${status}`);
		else if (size !== row.after) failures.push(`${row.key}: OSS ${size} != 本地 ${row.after}`);
	});
	return failures;
}

export function deleteObject(key: string) {
	execFileSync('ossutil', ['rm', OSS_URI + key, '--force'], { stdio: 'ignore' });
}

export function copyObject(fromKey: string, toKey: string) {
	execFileSync('ossutil', ['cp', OSS_URI + fromKey, OSS_URI + toKey, '--force'], { stdio: 'ignore' });
}
