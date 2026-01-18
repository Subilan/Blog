import fs from 'node:fs/promises';
import rehypeStringify from 'rehype-stringify';
import rehypeSlug from 'rehype-slug';
import rehypeHighlight from 'rehype-highlight';
import rehypeInferTitleMeta from 'rehype-infer-title-meta';
import rehypeExternalLinks from 'rehype-external-links';
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
import { unified } from 'unified';
import yaml from 'yaml';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import { h } from 'hastscript';

const postFilenames = await fs.readdir(`data/posts`);
// const document = await fs.readFile('example.md', 'utf8');

async function applyPipeline(content: string) {
	return unified()
		.use(remarkParse)
		.use(remarkFrontmatter)
		.use(remarkExtractFrontmatter, { yaml: yaml.parse, name: 'fm' })
		.use(remarkDirective)
		.use(vuepressLikeCallout)
		.use(remarkGfm)
		.use(remarkToc, { heading: '目录' })
		.use(remarkCjkFriendly)
		.use(remarkCjkFriendlyGfmStrikethrough)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeRaw)
		.use(rehypeInferTitleMeta)
		.use(rehypeHighlight)
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
				if (node.name !== 'tip' && node.name !== 'warning' && node.name !== 'danger')
					return;

				const data = node.data || (node.data = {});

				data.hName = 'div';
				data.hProperties = h('div', {
					class: 'vuepress-callout ' + node.name
				}).properties;
			}
		});
	};
}

const posts: Result[] = [];
const postDigests: ResultDigest[] = [];

export type Result = {
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

for (let postFilename of postFilenames) {
	const document = await fs.readFile(`data/posts/${postFilename}`, 'utf8');
	const result = await applyPipeline(document);
	const content = result.toString();
	const data: Result = {
		id: postFilename.replace('.md', '').toLowerCase(),
		content,
		frontmatter: result.data.fm as FrontMatter,
		title: result.data.meta?.title || '',
		analytics: {
			cjkCharCount: countWordsCJK(content),
			size: Buffer.byteLength(content, 'utf8')
		}
	};

	if (data.frontmatter.hidden) continue;

	await fs.writeFile(`public/data/${data.id}.json`, JSON.stringify(data));

	postDigests.push({
		id: data.id,
		title: data.title,
		date: data.frontmatter.date
	});
}

postDigests.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

await fs.writeFile(`data/postdigests.json`, JSON.stringify(postDigests));
