import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import crypto from 'node:crypto';
import yaml from 'yaml';
import satori from 'satori';
import sharp from 'sharp';
import getOgNode from './ogNode';
import type { ReactNode } from 'react';
import { applyPipeline, countWordsCJK, type FrontMatter } from './markdown-pipeline';

export type { FrontMatter };

export type Post = {
	id: string;
	content: string;
	frontmatter: FrontMatter;
	title: string;
	analytics: Analytics;
};

export type ResultDigest = {
	id: string;
	title: string;
	date: string;
	analytics: Analytics;
};

export type Analytics = {
	cjkCharCount: number;
	size: number;
};

const POSTS_SOURCE_DIR = 'data/posts';
const DIGEST_PATH = 'data/postdigests.json';
const MANIFEST_PATH = '.build-manifest.json';
const PUBLIC_DATA_DIR = 'public/data';
const PUBLIC_OG_DIR = 'public/og_images';
const PUBLIC_POSTS_DIR = 'public/posts';
const CONCURRENCY = Math.max(1, Number(process.env.BUILD_CONCURRENCY) || 4);

const PIPELINE_INPUTS = ['build.ts', 'markdown-pipeline.ts', 'relative-md.ts', 'oss-assets.ts', 'ogNode.jsx'];

await Promise.all(
	[PUBLIC_DATA_DIR, PUBLIC_OG_DIR, PUBLIC_POSTS_DIR].map(dir => fs.mkdir(dir, { recursive: true }))
);

const pipelineVersion = contentHash(
	(
		await Promise.all(PIPELINE_INPUTS.map(file => fs.readFile(file, 'utf8')))
	).concat([dependencyFingerprint(await fs.readFile('package.json', 'utf8'))]).join('\0')
);

const OG_FONTS = [
	{ name: 'Inter', weight: 400, path: 'node_modules/@fontsource/inter/files/inter-latin-400-normal.woff' },
	{ name: 'Inter', weight: 400, path: 'node_modules/@fontsource/inter/files/inter-latin-ext-400-normal.woff' },
	{ name: 'Inter', weight: 700, path: 'node_modules/@fontsource/inter/files/inter-latin-700-normal.woff' },
	{ name: 'Inter', weight: 700, path: 'node_modules/@fontsource/inter/files/inter-latin-ext-700-normal.woff' },
	{ name: 'NotoSansSC', weight: 400, path: 'fonts/NotoSansSC-Regular.otf' },
	{ name: 'NotoSansSC', weight: 700, path: 'fonts/NotoSansSC-Bold.otf' }
] as const;

const ogFonts = await Promise.all(
	OG_FONTS.map(async font => ({
		name: font.name,
		weight: font.weight,
		style: 'normal' as const,
		data: await fs.readFile(font.path)
	}))
);

type BuildManifest = {
	pipeline: string;
	posts: Record<string, { hash: string }>;
};

function emptyManifest(): BuildManifest {
	return { pipeline: '', posts: {} };
}

function loadManifest(): BuildManifest {
	let parsed: unknown;
	try {
		parsed = JSON.parse(fsSync.readFileSync(MANIFEST_PATH, 'utf8'));
	} catch {
		return emptyManifest();
	}

	if (!parsed || typeof parsed !== 'object') return emptyManifest();

	// 旧格式为扁平的 { id: { hash } }，读入后 pipeline 为空会触发一次全量重建
	if ('posts' in parsed) return parsed as BuildManifest;

	return { pipeline: '', posts: parsed as BuildManifest['posts'] };
}

function contentHash(content: string | Buffer): string {
	return crypto.createHash('sha256').update(content).digest('hex');
}

// 只关心依赖版本，脚本/字段改动不应该让所有文章重渲染
function dependencyFingerprint(packageJson: string): string {
	try {
		const { dependencies, devDependencies } = JSON.parse(packageJson);
		return JSON.stringify({ dependencies, devDependencies });
	} catch {
		return packageJson;
	}
}

function extractFrontmatter(content: string): FrontMatter | null {
	const [, frontmatter] = content.replace(/^\uFEFF/, '').match(/^---\r?\n([\s\S]*?)\r?\n---/) || [];
	if (frontmatter === undefined) return null;
	return yaml.parse(frontmatter) as FrontMatter;
}

async function readJson<T>(path: string, fallback: T): Promise<T> {
	try {
		return JSON.parse(await fs.readFile(path, 'utf8')) as T;
	} catch {
		return fallback;
	}
}

async function writeIfChanged(path: string, content: string) {
	try {
		if ((await fs.readFile(path, 'utf8')) === content) return false;
	} catch {}
	await fs.writeFile(path, content);
	return true;
}

async function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
	let cursor = 0;
	await Promise.all(
		Array.from({ length: Math.min(limit, items.length) }, async () => {
			while (cursor < items.length) {
				const item = items[cursor++];
				await worker(item!);
			}
		})
	);
}

async function generateOgImageSvgFromPost(post: Post) {
	return satori(getOgNode(post) as ReactNode, {
		width: 1200,
		height: 600,
		fonts: ogFonts
	});
}

const isCI = !!process.env.CI || !!process.env.VERCEL;
const oldManifest = isCI ? emptyManifest() : loadManifest();
const newManifest: BuildManifest = { pipeline: pipelineVersion, posts: {} };

if (oldManifest.pipeline !== pipelineVersion) {
	console.log(`[pipeline] ${isCI ? 'CI build' : 'renderer inputs changed'}: rebuilding every post`);
}

const existingDigests = await readJson<ResultDigest[]>(DIGEST_PATH, []);
const existingDigestMap = new Map(existingDigests.map(digest => [digest.id, digest]));

const postDirItems = await fs.readdir(POSTS_SOURCE_DIR);
const postFilenames = postDirItems.filter(name => name.endsWith('.md')).sort();
const subfolders = postDirItems.filter(name => fsSync.statSync(`${POSTS_SOURCE_DIR}/${name}`).isDirectory());

const postDigests: ResultDigest[] = [];

async function buildPost(filename: string) {
	const document = await fs.readFile(`${POSTS_SOURCE_DIR}/${filename}`, 'utf8');
	const id = filename.replace(/\.md$/, '').toLowerCase();
	const hash = contentHash(document);

	const frontmatter = extractFrontmatter(document);
	if (frontmatter?.hidden) return;

	const dataPath = `${PUBLIC_DATA_DIR}/${id}.json`;
	const ogPath = `${PUBLIC_OG_DIR}/${id}.png`;

	const reusable =
		oldManifest.pipeline === pipelineVersion &&
		oldManifest.posts[id]?.hash === hash &&
		existingDigestMap.has(id) &&
		fsSync.existsSync(dataPath) &&
		fsSync.existsSync(ogPath);

	if (reusable) {
		console.log(`[skip] ${id}`);
		newManifest.posts[id] = { hash };
		postDigests.push(existingDigestMap.get(id)!);
		return;
	}

	console.log(`[build] ${id}`);
	const result = await applyPipeline(document);
	const content = result.toString();
	const data: Post = {
		id,
		content,
		frontmatter: result.data.fm as FrontMatter,
		title: result.data.meta?.title || '',
		analytics: {
			cjkCharCount: countWordsCJK(document),
			size: Buffer.byteLength(content, 'utf8')
		}
	};

	await fs.writeFile(dataPath, JSON.stringify(data));
	const ogImageSvg = await generateOgImageSvgFromPost(data);
	const ogImagePng = await sharp(Buffer.from(ogImageSvg)).png().toBuffer();
	await fs.writeFile(ogPath, ogImagePng);

	newManifest.posts[id] = { hash };
	postDigests.push({
		id: data.id,
		title: data.title,
		date: data.frontmatter.date,
		analytics: data.analytics
	});
}

await runPool(postFilenames, CONCURRENCY, async filename => {
	try {
		await buildPost(filename);
	} catch (error) {
		throw new Error(
			`failed to build ${filename}: ${error instanceof Error ? error.message : String(error)}`,
			{ cause: error }
		);
	}
});

for (let subfolder of subfolders) {
	await fs.cp(`${POSTS_SOURCE_DIR}/${subfolder}`, `${PUBLIC_POSTS_DIR}/${subfolder}`, { recursive: true });
}

const staleIds = new Set(Object.keys(oldManifest.posts));
for (const file of await fs.readdir(PUBLIC_DATA_DIR)) {
	if (file.endsWith('.json')) staleIds.add(file.replace(/\.json$/, ''));
}
for (const file of await fs.readdir(PUBLIC_OG_DIR)) {
	if (file.endsWith('.png')) staleIds.add(file.replace(/\.png$/, ''));
}

for (const id of staleIds) {
	if (newManifest.posts[id]) continue;
	console.log(`[clean] ${id}`);
	await fs.rm(`${PUBLIC_DATA_DIR}/${id}.json`, { force: true });
	await fs.rm(`${PUBLIC_OG_DIR}/${id}.png`, { force: true });
}

postDigests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.id.localeCompare(b.id));

await writeIfChanged(DIGEST_PATH, JSON.stringify(postDigests));
if (!isCI) {
	const sortedManifest: BuildManifest = {
		pipeline: newManifest.pipeline,
		posts: Object.fromEntries(Object.entries(newManifest.posts).sort(([a], [b]) => a.localeCompare(b)))
	};
	await writeIfChanged(MANIFEST_PATH, JSON.stringify(sortedManifest, null, 2));
}

console.log(`built ${postDigests.length} posts`);
