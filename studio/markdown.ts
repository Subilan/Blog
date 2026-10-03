import { unified } from 'unified';
import remarkStringify from 'remark-stringify';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkDirective from 'remark-directive';
import yaml from 'yaml';
import { applyPipeline, countWordsCJK, parseMarkdown, type FrontMatter } from '../markdown-pipeline';

export type { FrontMatter };
export { countWordsCJK };

export const FRONTMATTER_KEYS = ['date', 'cate', 'desc', 'desc-short', 'hidden', 'ignoreOutdate'] as const;

const stringifier = unified()
	.use(remarkStringify, {
		bullet: '-',
		rule: '-',
		emphasis: '*',
		strong: '*',
		fence: '`',
		listItemIndent: 'one'
	})
	.use(remarkGfm)
	.use(remarkMath, { singleDollarTextMath: false })
	.use(remarkDirective);

/**
 * mdast-util-to-markdown 为了消除 `**加粗。**后面` 这类边界歧义，会把紧邻的
 * 字符写成 `&#x8FD9;` 这样的字符引用。渲染结果一样，但源码不可读，而我们
 * 的解析链带 remark-cjk-friendly，能正确还原原写法，所以这里统一解回字符。
 */
export function decodeCharacterReferences(value: string) {
	return value.replace(/&#x([0-9a-fA-F]+);|&#([0-9]+);/g, (whole, hex, dec) =>
		String.fromCodePoint(Number.parseInt(hex ?? dec, hex ? 16 : 10))
	);
}

export function stringifyTree(tree: any): string {
	return decodeCharacterReferences(stringifier.stringify(tree));
}

export function serializeFrontmatter(frontmatter: FrontMatter | null | undefined): string {
	const ordered: Record<string, unknown> = {};
	for (const key of FRONTMATTER_KEYS) {
		const value = (frontmatter as any)?.[key];
		if (value === undefined || value === null || value === '') continue;
		ordered[key] = value;
	}
	for (const [key, value] of Object.entries(frontmatter ?? {})) {
		if (!(key in ordered) && value !== undefined && value !== null) ordered[key] = value;
	}
	if (!Object.keys(ordered).length) return '';
	return yaml.stringify(ordered, { lineWidth: 0 });
}

export function composePost(tree: any, frontmatter: FrontMatter | null | undefined): string {
	const body = stringifyTree(tree).replace(/\s+$/, '');
	const head = serializeFrontmatter(frontmatter);
	return `---\n${head}---\n\n${body}\n`;
}

export async function readPost(source: string) {
	const { tree, frontmatter } = await parseMarkdown(source);
	// frontmatter 在编辑器里是独立表单，正文树里不再保留 yaml 节点
	if (Array.isArray(tree.children)) {
		tree.children = tree.children.filter((node: any) => node.type !== 'yaml' && node.type !== 'toml');
	}
	return { tree, frontmatter, title: extractTitle(tree), words: countWordsCJK(source) };
}

export function extractTitle(tree: any): string {
	const headings = (tree?.children ?? []).filter((node: any) => node.type === 'heading');
	const heading = headings.find((node: any) => node.depth === 1) ?? headings[0];
	return heading ? plainText(heading) : '';
}

function plainText(node: any): string {
	if (typeof node.value === 'string') return node.value;
	return (node.children ?? []).map(plainText).join('');
}

export async function renderMarkdown(source: string) {
	const result = await applyPipeline(source);
	return { html: String(result), title: (result.data as any)?.meta?.title ?? '' };
}
