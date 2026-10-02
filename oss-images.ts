import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import sharp from 'sharp';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import { visit } from 'unist-util-visit';
import Table from 'cli-table3';
import { OSS_ORIGIN, OSS_SCHEME, OSS_URI } from './oss-assets';

const POSTS_DIR = 'data/posts';
const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif']);
const VALUE_OPTIONS = new Set(['max-edge', 'quality', 'concurrency', 'max-bytes', 'min-gain']);
const DEFAULTS = { maxEdge: 2048, quality: 80, concurrency: 4, maxBytes: 1024 * 1024, minGain: 10 };

const USAGE = `用法：
  yarn oss upload <本地目录> [选项]   压缩并上传目录里的图片，目录名去掉 -img 后缀作为 OSS 目录
  yarn oss stats [选项]               按目录列出 ${OSS_URI} 下的数量、体积与文档引用情况
  yarn oss check [选项]               校验 ${POSTS_DIR} 里所有 oss:// 引用是否都能取到

upload 选项：
  --rewrite          把 ${POSTS_DIR} 里指向该目录的相对路径改写成 oss:// 引用
  --delete-source    校验通过后删除本地原图
  --dry-run          只压缩并报告，不访问 OSS

stats 选项：
  --unreferenced     额外列出没有任何文章引用的对象
  --max-bytes <n>    超过该体积计为「可能没压过」，默认 ${DEFAULTS.maxBytes}

通用选项：
  --max-edge <n>     JPEG 长边上限，默认 ${DEFAULTS.maxEdge}
  --quality <n>      编码质量，默认 ${DEFAULTS.quality}
  --concurrency <n>  并发，默认 ${DEFAULTS.concurrency}
  --min-gain <百分比> 体积至少要缩小这么多才覆盖，默认 ${DEFAULTS.minGain}，避免反复重压掉质

压缩规则：JPEG 转 mozjpeg，长边超过上限时等比缩小，丢弃 EXIF；PNG 保持 PNG 与 alpha
通道，用调色板量化到指定质量；webp/gif/avif 原样上传；体积缩小不到 --min-gain 的保留原图。
覆盖已有对象时 ossutil 必须带 --force，否则它会静默跳过，脚本已经加上了。`;

type Options = {
	maxEdge: number;
	quality: number;
	concurrency: number;
	maxBytes: number;
	minGain: number;
	rewrite: boolean;
	deleteSource: boolean;
	dryRun: boolean;
};

type Row = { rel: string; key: string; before: number; after: number; label: string };
type ObjectInfo = { key: string; size: number };
type Reference = { key: string; posts: string[] };

const kb = (n: number) => `${(n / 1024).toFixed(0)}K`;
const mb = (n: number) => `${(n / 1048576).toFixed(1)}M`;

const TABLE_CHARS = {
	top: '',
	'top-mid': '',
	'top-left': '',
	'top-right': '',
	bottom: '',
	'bottom-mid': '',
	'bottom-left': '',
	'bottom-right': '',
	left: '',
	'left-mid': '',
	mid: '',
	'mid-mid': '',
	right: '',
	'right-mid': '',
	middle: ' '
};

function parseArgs(argv: string[]) {
	const positional: string[] = [];
	const flags = new Set<string>();
	const values = new Map<string, string>();
	for (let i = 0; i < argv.length; i++) {
		const token = argv[i];
		if (!token.startsWith('--')) {
			positional.push(token);
			continue;
		}
		const [key, inline] = token.slice(2).split('=');
		if (inline !== undefined) {
			values.set(key, inline);
			continue;
		}
		const next = argv[i + 1];
		if (VALUE_OPTIONS.has(key) && next !== undefined && !next.startsWith('--')) {
			values.set(key, next);
			i++;
			continue;
		}
		flags.add(key);
	}
	return { positional, flags, values };
}

function resolveOptions(parsed: ReturnType<typeof parseArgs>): Options {
	const number = (key: string, fallback: number) => {
		const raw = parsed.values.get(key);
		if (raw === undefined) return fallback;
		const value = Number(raw);
		if (!Number.isFinite(value) || value <= 0) throw new Error(`--${key} 需要正数，收到 ${raw}`);
		return value;
	};
	return {
		maxEdge: number('max-edge', DEFAULTS.maxEdge),
		quality: number('quality', DEFAULTS.quality),
		concurrency: number('concurrency', DEFAULTS.concurrency),
		maxBytes: number('max-bytes', DEFAULTS.maxBytes),
		minGain: number('min-gain', DEFAULTS.minGain),
		rewrite: parsed.flags.has('rewrite'),
		deleteSource: parsed.flags.has('delete-source'),
		dryRun: parsed.flags.has('dry-run')
	};
}

function requireOssutil(withBucket: boolean) {
	try {
		execFileSync('ossutil', ['--version'], { stdio: 'ignore' });
	} catch {
		throw new Error('找不到 ossutil，先确认它已安装且在 PATH 里');
	}
	if (withBucket) execFileSync('ossutil', ['ls', OSS_URI, '-d', '--limited-num', '1'], { stdio: 'ignore' });
}

function mkdtemp(prefix: string) {
	return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

function listObjects(): ObjectInfo[] {
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

async function collectReferences() {
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
	for (const file of (await fs.readdir(POSTS_DIR)).filter(name => name.endsWith('.md')).sort()) {
		const source = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
		const tree = unified().use(remarkParse).parse(source);
		visit(tree, 'image', (node: any) => {
			if (typeof node.url === 'string' && node.url.startsWith(OSS_SCHEME)) add(node.url.slice(OSS_SCHEME.length), file);
		});
		visit(tree, 'html', (node: any) => scanText(node.value, file));
		for (const match of source.matchAll(/<img\b[^>]*?\bsrc="oss:\/\/([^"]*)"/g)) add(match[1], file);
	}
	return [...references].map(([key, posts]) => ({ key, posts: [...posts].sort() })).sort((a, b) => a.key.localeCompare(b.key));
}

async function pool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
	let cursor = 0;
	await Promise.all(
		Array.from({ length: Math.min(limit, items.length) }, async () => {
			while (cursor < items.length) await worker(items[cursor++]);
		})
	);
}

async function collectImages(dir: string) {
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

function decodeSegment(segment: string) {
	try {
		return decodeURIComponent(segment);
	} catch {
		return segment;
	}
}

function objectUrl(key: string) {
	return OSS_ORIGIN + key.split('/').map(segment => encodeURIComponent(decodeSegment(segment))).join('/');
}

async function head(key: string) {
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

async function encodeImage(buffer: Buffer, meta: sharp.Metadata, options: Options) {
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

async function compressDirectory(sourceDir: string, keyDir: string, options: Options, stage: string) {
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

function reportRows(rows: Row[], keyDir: string) {
	console.log(`\n${OSS_URI}${keyDir}/`);
	for (const row of rows) console.log(`  ${row.rel}  ${kb(row.before)} -> ${kb(row.after)}  ${row.label}`);
	const before = rows.reduce((a, row) => a + row.before, 0);
	const after = rows.reduce((a, row) => a + row.after, 0);
	console.log(`\n${rows.length} 张，${mb(before)} -> ${mb(after)}（${((100 * after) / before).toFixed(1)}%）`);
}

async function uploadStage(stage: string) {
	const workDir = await mkdtemp('oss-run-');
	try {
		execFileSync('ossutil', ['cp', '-r', '-f', `${stage}/`, OSS_URI, '--force'], { cwd: workDir, stdio: 'inherit' });
	} finally {
		await fs.rm(workDir, { recursive: true, force: true });
	}
}

async function verifyUploads(rows: Row[], options: Options) {
	const failures: string[] = [];
	await pool(rows, Math.max(options.concurrency, 8), async row => {
		const { status, size } = await head(row.key);
		if (status !== 200) failures.push(`${row.key}: HTTP ${status}`);
		else if (size !== row.after) failures.push(`${row.key}: OSS ${size} != 本地 ${row.after}`);
	});
	return failures;
}

async function rewriteReferences(sourceDirName: string, keyDir: string) {
	const changed: string[] = [];
	for (const file of (await fs.readdir(POSTS_DIR)).filter(name => name.endsWith('.md')).sort()) {
		const full = path.join(POSTS_DIR, file);
		const source = await fs.readFile(full, 'utf8');
		const edits: [number, number, string][] = [];
		visit(unified().use(remarkParse).parse(source), 'image', (node: any) => {
			const url: string = node.url;
			if (!url || url.startsWith(OSS_SCHEME) || url.startsWith('/') || url.startsWith('#') || /^[a-z][a-z0-9+.-]*:/i.test(url)) return;
			const rel = url.replace(/^\.\//, '');
			if (!rel.startsWith(`${sourceDirName}/`)) return;
			const start = node.position.start.offset;
			const slice = source.slice(start, node.position.end.offset);
			const index = slice.indexOf(url);
			if (index < 0) return;
			edits.push([start + index, start + index + url.length, `${OSS_SCHEME}${keyDir}/${rel.slice(sourceDirName.length + 1)}`]);
		});
		if (!edits.length) continue;
		let output = source;
		for (const [from, to, text] of edits.sort((a, b) => b[0] - a[0])) output = output.slice(0, from) + text + output.slice(to);
		await fs.writeFile(full, output);
		changed.push(`${file}（${edits.length} 处）`);
	}
	return changed;
}

async function commandUpload(parsed: ReturnType<typeof parseArgs>) {
	const target = parsed.positional[0];
	if (!target) throw new Error('upload 需要指定本地目录，见 yarn oss --help');
	const sourceDir = path.resolve(target);
	const stat = await fs.stat(sourceDir).catch(() => null);
	if (!stat?.isDirectory()) throw new Error(`${target} 不是目录`);
	const options = resolveOptions(parsed);
	const dirName = path.basename(sourceDir);
	const keyDir = dirName.endsWith('-img') ? dirName.slice(0, -4) : dirName;

	requireOssutil(!options.dryRun);
	const stage = await mkdtemp('oss-images-');
	const { rows, warnings } = await compressDirectory(sourceDir, keyDir, options, stage);
	reportRows(rows, keyDir);
	for (const warning of warnings) console.log(`注意 ${warning}`);

	if (options.dryRun) {
		console.log(`\n--dry-run，没有上传。压缩结果留在 ${stage}`);
		return;
	}

	await uploadStage(stage);
	console.log('\n校验上传结果…');
	const failures = await verifyUploads(rows, options);
	if (failures.length) {
		console.error(`\n${failures.length} 个对象校验失败，暂存目录保留在 ${stage}：`);
		for (const failure of failures) console.error(`  ${failure}`);
		process.exitCode = 1;
		return;
	}
	await fs.rm(stage, { recursive: true, force: true });
	console.log(`${rows.length} 个对象全部校验通过`);

	if (options.rewrite) {
		const changed = await rewriteReferences(dirName, keyDir);
		console.log(changed.length ? `\n已改写 ${changed.join('、')}` : '\n没有 markdown 引用这个目录');
	} else {
		console.log('\nmarkdown 里这样引用：');
		for (const row of rows) console.log(`  ![](${OSS_SCHEME}${objectUrl(row.key).slice(OSS_ORIGIN.length)})`);
	}

	if (options.deleteSource) {
		await fs.rm(sourceDir, { recursive: true, force: true });
		console.log(`\n已删除 ${sourceDir}`);
	}
}

async function commandCheck() {
	const references = await collectReferences();
	const sizes = new Map<string, number>();
	const missing: string[] = [];
	await pool(references, 8, async reference => {
		const { status, size } = await head(reference.key);
		if (status !== 200) missing.push(`${reference.key}（HTTP ${status}，来自 ${reference.posts.join('、')}）`);
		else sizes.set(reference.key, size);
	});

	const posts = new Set(references.flatMap(reference => reference.posts));
	console.log(`${references.length} 个 oss:// 引用，共 ${mb([...sizes.values()].reduce((a, b) => a + b, 0))}，来自 ${posts.size} 篇文章`);

	const stale = references.filter(reference => reference.key.split('/')[0].endsWith('-img'));
	if (stale.length) {
		console.log(`\n${stale.length} 个引用的目录名还带 -img 后缀，和上传时的命名不一致：`);
		for (const reference of stale) console.log(`  ${reference.key}`);
	}

	if (missing.length) {
		console.error(`\n${missing.length} 个引用取不到：`);
		for (const item of missing) console.error(`  ${item}`);
		process.exitCode = 1;
		return;
	}
	console.log('\n所有引用都能访问');
}

async function commandStats(parsed: ReturnType<typeof parseArgs>) {
	const options = resolveOptions(parsed);
	requireOssutil(false);
	const objects = listObjects();
	const references = await collectReferences();
	const byKey = new Map(references.map(reference => [reference.key.split('/').map(decodeSegment).join('/'), reference.posts]));
	const referencedKeys = new Set(byKey.keys());
	let referencedObjects = 0;
	const grouped = new Map<string, { size: number; count: number; referenced: number; posts: Set<string>; unreferenced: number; oversized: number; largest: { key: string; size: number }; missing: number }>();

	for (const object of objects) {
		const segments = object.key.split('/');
		const dir = segments.length > 1 ? segments.slice(0, -1).join('/') : '.';
		if (!grouped.has(dir)) grouped.set(dir, { size: 0, count: 0, referenced: 0, posts: new Set(), unreferenced: 0, oversized: 0, largest: { key: '', size: 0 }, missing: 0 });
		const group = grouped.get(dir)!;
		group.count++;
		group.size += object.size;
		if (object.size > group.largest.size) group.largest = { key: object.key, size: object.size };
		if (object.size > options.maxBytes) group.oversized++;
		const posts = byKey.get(object.key.split('/').map(decodeSegment).join('/'));
		if (posts) {
			referencedObjects++;
			group.referenced++;
			for (const post of posts) group.posts.add(post);
		} else group.unreferenced++;
	}

	const objectKeys = new Set(objects.map(object => object.key));
	for (const key of referencedKeys) {
		if (objectKeys.has(key)) continue;
		const dir = key.split('/').slice(0, -1).join('/');
		if (!grouped.has(dir)) grouped.set(dir, { size: 0, count: 0, referenced: 0, posts: new Set(), unreferenced: 0, oversized: 0, largest: { key: '', size: 0 }, missing: 0 });
		const group = grouped.get(dir)!;
		group.missing++;
	}

	const ranked = [...grouped].sort((a, b) => b[1].size - a[1].size);
	console.log(`${OSS_URI}下 ${objects.length} 个对象，共 ${mb(objects.reduce((a, object) => a + object.size, 0))}；${references.length} 个文档引用落在其中 ${referencedObjects} 个对象上`);

	const table = new Table({
		head: ['目录', '对象', '体积', '引用', '文章', '未引用', `>${mb(options.maxBytes)}`],
		style: { head: [], border: [] },
		chars: TABLE_CHARS,
		colAligns: ['left', 'right', 'right', 'right', 'right', 'right', 'right'],
		wordWrap: false
	});
	for (const [dir, group] of ranked) {
		table.push([dir, group.count, mb(group.size), group.referenced, group.posts.size, group.unreferenced, group.oversized]);
	}
	console.log(table.toString());

	const unreferenced = objects.filter(object => !referencedKeys.has(object.key));
	if (unreferenced.length) {
		const total = unreferenced.reduce((a, object) => a + object.size, 0);
		console.log(`\n没有任何文章引用的对象 ${unreferenced.length} 个，共 ${mb(total)}：`);
		for (const object of unreferenced.sort((a, b) => b.size - a.size).slice(0, parsed.flags.has('unreferenced') ? undefined : 5)) {
			console.log(`  ${mb(object.size).padStart(7)}  ${object.key}`);
		}
		if (unreferenced.length > 5 && !parsed.flags.has('unreferenced')) console.log(`  …其余 ${unreferenced.length - 5} 个用 --unreferenced 展开`);
	}

	const largest = objects.reduce((a, object) => (object.size > a.size ? object : a), { key: '', size: 0 });
	if (largest.key) console.log(`\n最大的对象 ${mb(largest.size)} ${largest.key}`);

	const missingTotal = ranked.reduce((a, [, group]) => a + group.missing, 0);
	if (missingTotal) {
		console.log(`\n被引用但 OSS 上不存在的对象 ${missingTotal} 个，用 yarn oss check 看详情`);
	}
}

async function main() {
	const [command, ...rest] = process.argv.slice(2);
	if (!command || ['--help', '-h', 'help'].includes(command)) {
		console.log(USAGE);
		return;
	}
	const parsed = parseArgs(rest);
	if (command === 'upload') await commandUpload(parsed);
	else if (command === 'check') await commandCheck();
	else if (command === 'stats') await commandStats(parsed);
	else {
		console.error(`未知命令 ${command}\n\n${USAGE}`);
		process.exitCode = 1;
	}
}

main().catch(error => {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
});
