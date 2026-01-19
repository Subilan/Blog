import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeInferTitleMeta from 'rehype-infer-title-meta';
import rehypeExternalLinks from 'rehype-external-links';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
// @ts-ignore
import rehypeWrapAll from 'rehype-wrap-all';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkExtractFrontmatter from 'remark-extract-frontmatter';
import remarkParse from 'remark-parse';
import remarkDirective from 'remark-directive';
import remarkCjkFriendly from 'remark-cjk-friendly';
import remarkCjkFriendlyGfmStrikethrough from 'remark-cjk-friendly-gfm-strikethrough';
import remarkRehype from 'remark-rehype';
import remarkToc from 'remark-toc';
import remarkMath from 'remark-math';
import { unified } from 'unified';
import yaml from 'yaml';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import { h } from 'hastscript';
import stringWidth from 'string-width';
import satori from 'satori';
import sharp from 'sharp';
import getOgNode from './ogNode';
import type { ReactNode } from 'react';

async function mkdirIfNotExist(path: string) {
	let shouldCreate =
		(await (async () => {
			try {
				await fs.access(path, fs.constants.F_OK);
				return false;
			} catch {
				return true;
			}
		})()) || !(await fs.stat(path)).isDirectory();

	shouldCreate && (await fs.mkdir(path, { recursive: true }));
}

['public/data', 'public/og_images', 'public/posts'].forEach(mkdirIfNotExist);

const postDirItems = await fs.readdir(`data/posts`);
const postFilenames = postDirItems.filter(name => name.endsWith('.md'));
const subfolders = postDirItems.filter(name => fsSync.statSync(`data/posts/${name}`).isDirectory());
// const document = await fs.readFile('example.md', 'utf8');

async function applyPipeline(content: string) {
	return unified()
		.use(remarkParse)
		.use(remarkMath, { singleDollarTextMath: false })
		.use(remarkFrontmatter)
		.use(remarkExtractFrontmatter, { yaml: yaml.parse, name: 'fm' })
		.use(remarkDirective)
		.use(vuepressLikeCallout)
		.use(remarkGfm, { stringLength: stringWidth })
		.use(remarkToc, { heading: '目录' })
		.use(remarkCjkFriendly)
		.use(remarkCjkFriendlyGfmStrikethrough)
		.use(remarkRehype, { allowDangerousHtml: true, footnoteLabel: '注释' })
		.use(rehypeRaw)
		.use(rehypeInferTitleMeta)
		.use(rehypeHighlight)
		.use(rehypeKatex)
		.use(rehypeExternalLinks, {
			rel: ['nofollow'],
			target: '_blank',
			properties: { class: 'ext' }
		})
		.use(rehypeWrapAll, { selector: 'pre', wrapper: 'div.pre-wrapper' })
		.use(rehypeSlug)
		.use(rehypeStringify)
		.process(content);
}

function vuepressLikeCallout() {
	return (tree: Root) => {
		visit(tree, (node, index, parent) => {
			// https://github.com/remarkjs/remark-directive/issues/12
			if (parent && index && node.type === 'textDirective') {
				parent.children[index] = { type: 'text', value: `:${node.name}` };
				return;
			}

			if (node.type === 'containerDirective') {
				if (!['tip', 'warning', 'danger', 'note'].includes(node.name)) return;

				const data = node.data || (node.data = {});

				data.hName = 'div';
				data.hProperties = h('div', {
					class: 'vuepress-callout ' + node.name
				}).properties;
			}
		});
	};
}

const posts: Post[] = [];
const postDigests: ResultDigest[] = [];

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

export type FrontMatter = {
	date: string;
	cate?: string;
	desc?: string;
	'desc-short'?: string;
	hidden?: boolean;
	ignoreOutdate?: boolean;
};

function countWordsCJK(text: string) {
	return (text.match(/[\u00ff-\uffff]|\S+/g) || []).length;
}

async function generateOgImageSvgFromPost(post: Post) {
	return satori(getOgNode(post) as ReactNode, {
		width: 1200,
		height: 600,
		fonts: [
			{
				name: 'InterDisplay',
				data: await fs.readFile('./public/fonts/InterDisplay-Regular.ttf'),
				weight: 400,
				style: 'normal'
			},
			{
				name: 'InterDisplay',
				data: await fs.readFile('./public/fonts/InterDisplay-Bold.ttf'),
				weight: 700,
				style: 'normal'
			},
			{
				name: 'Inter',
				data: await fs.readFile('./public/fonts/Inter-Regular.ttf'),
				weight: 400,
				style: 'normal'
			},
			{
				name: 'Inter',
				data: await fs.readFile('./public/fonts/Inter-Bold.ttf'),
				weight: 700,
				style: 'normal'
			},
			{
				name: 'NotoSansSC',
				data: await fs.readFile('./public/fonts/NotoSansSC-Regular.otf'),
				weight: 400,
				style: 'normal'
			},
			{
				name: 'NotoSansSC',
				data: await fs.readFile('./public/fonts/NotoSansSC-Bold.otf'),
				weight: 700,
				style: 'normal'
			}
		]
	});
}

for (let postFilename of postFilenames) {
	const document = await fs.readFile(`data/posts/${postFilename}`, 'utf8');
	const result = await applyPipeline(document);
	const content = result.toString();
	const data: Post = {
		id: postFilename.replace('.md', '').toLowerCase(),
		content,
		frontmatter: result.data.fm as FrontMatter,
		title: result.data.meta?.title || '',
		analytics: {
			cjkCharCount: countWordsCJK(document),
			size: Buffer.byteLength(content, 'utf8')
		}
	};

	if (data.frontmatter.hidden) continue;

	await fs.writeFile(`public/data/${data.id}.json`, JSON.stringify(data));
	const ogImageSvg = await generateOgImageSvgFromPost(data);
	const ogImagePng = await sharp(Buffer.from(ogImageSvg)).png().toBuffer();
	await fs.writeFile(`public/og_images/${data.id}.png`, ogImagePng);

	postDigests.push({
		id: data.id,
		title: data.title,
		date: data.frontmatter.date,
		analytics: data.analytics
	});
}

for (let subfolder of subfolders) {
	await fs.cp(`data/posts/${subfolder}`, `public/posts/${subfolder}`, { recursive: true });
}

postDigests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

await fs.writeFile(`data/postdigests.json`, JSON.stringify(postDigests));
