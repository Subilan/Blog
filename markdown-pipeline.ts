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
import { VFile } from 'vfile';
import yaml from 'yaml';
import { visit } from 'unist-util-visit';
import type { Root } from 'mdast';
import { h } from 'hastscript';
import stringWidth from 'string-width';
import { remarkRelativeAssetsToPosts } from './relative-md';
import { rehypeOssAssets } from './oss-assets';

export type FrontMatter = {
	date: string;
	cate?: string;
	desc?: string;
	'desc-short'?: string;
	hidden?: boolean;
	ignoreOutdate?: boolean;
};

export type ParsedMarkdown = {
	tree: Root;
	frontmatter: FrontMatter | null;
};

export function vuepressLikeCallout() {
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

export function countWordsCJK(text: string) {
	return (text.match(/[\u00ff-\uffff]|\S+/g) || []).length;
}

/**
 * 编辑器用的解析链：到 mdast 为止，不跑 rehype，也不跑 remark-toc
 * 和相对路径改写，这样拿到的树和源码一一对应，能原样写回。
 */
export async function parseMarkdown(content: string): Promise<ParsedMarkdown> {
	const processor = unified()
		.use(remarkParse)
		.use(remarkMath, { singleDollarTextMath: false })
		.use(remarkFrontmatter)
		.use(remarkExtractFrontmatter, { yaml: yaml.parse, name: 'fm' })
		.use(remarkDirective)
		.use(remarkGfm, { stringLength: stringWidth })
		.use(remarkCjkFriendly)
		.use(remarkCjkFriendlyGfmStrikethrough);

	const file = new VFile({ value: content });
	const tree = await processor.run(processor.parse(file), file);
	return { tree: tree as unknown as Root, frontmatter: (file.data as any)?.fm ?? null };
}

export function applyPipeline(content: string) {
	return unified()
		.use(remarkParse)
		.use(remarkRelativeAssetsToPosts, { prefix: '/posts' })
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
		.use(rehypeOssAssets)
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
