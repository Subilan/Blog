/**
 * 校验编辑器写回链路不会改变文章的实际渲染结果。
 *
 * 对每篇文章依次走：源码 → mdast → ProseMirror JSON → mdast → Markdown，
 * 然后比较前后两次经 build.ts 同一条 rehype 管道产生的 HTML、以及
 * frontmatter 的值。任何 HTML 不一致都说明编辑器会静默改变线上内容。
 *
 * 用法：yarn studio:check [文章文件...]
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { collectReferencesFrom } from '../oss-lib';
import { composePost, readPost, renderMarkdown, serializeFrontmatter } from './markdown';
import { mdastToPmDoc, pmDocToMdast } from './editor/mdast-pm';

const POSTS_DIR = 'data/posts';

// frontmatter 的键顺序会被规范化，这里只比较取值
function canonical(value: unknown) {
	if (!value || typeof value !== 'object') return JSON.stringify(value);
	const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b));
	return JSON.stringify(Object.fromEntries(entries));
}

/**
 * 把文档归一化后再比较，忽略两类不代表信息丢失的差异：
 * 标记数组的顺序（ProseMirror 按 schema 顺序重新排过），以及列表松紧
 * （保存时由条目结构重新推导）。真正要盯的是「属性/节点被静默丢掉」。
 */
function canonicalDoc(node: any): any {
	if (Array.isArray(node)) return node.map(canonicalDoc);
	if (!node || typeof node !== 'object') return node;
	const out: Record<string, any> = {};
	for (const [key, value] of Object.entries(node)) {
		if (key === 'attrs') {
			const attrs: Record<string, any> = {};
			for (const [attrKey, attrValue] of Object.entries(value as Record<string, any>).sort(([a], [b]) => a.localeCompare(b))) {
				if (attrKey === 'spread') continue;
				attrs[attrKey] = canonicalDoc(attrValue);
			}
			out.attrs = attrs;
			continue;
		}
		if (key === 'marks' && Array.isArray(value)) {
			out.marks = [...value]
				.map(canonicalDoc)
				.sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
			continue;
		}
		out[key] = canonicalDoc(value);
	}
	return out;
}

function firstDifference(a: string, b: string) {
	const linesA = a.split('\n');
	const linesB = b.split('\n');
	const shown: string[] = [];
	let total = 0;
	for (let i = 0; i < Math.max(linesA.length, linesB.length); i++) {
		if (linesA[i] === linesB[i]) continue;
		total++;
		if (shown.length < 3) {
			shown.push(`第 ${i + 1} 行\n    原：${(linesA[i] ?? '(无)').slice(0, 300)}\n    新：${(linesB[i] ?? '(无)').slice(0, 300)}`);
		}
	}
	if (!total) return '(长度相同但内容不同)';
	return `${total} 处不同\n  ${shown.join('\n  ')}`;
}

const requested = process.argv.slice(2).filter(arg => !arg.startsWith('-'));
const all = (await fs.readdir(POSTS_DIR)).filter(name => name.endsWith('.md')).sort();
const files = requested.length ? requested.map(name => path.basename(name)) : all;

let htmlMismatch = 0;
let frontmatterMismatch = 0;
let unstable = 0;
let docNotFixedPoint = 0;

for (const file of files) {
	const source = await fs.readFile(path.join(POSTS_DIR, file), 'utf8');
	const { tree, frontmatter, title } = await readPost(source);

	const doc = mdastToPmDoc(tree);
	const roundTripped = composePost(pmDocToMdast(doc), frontmatter);

	// 编辑器返回的文档必须与后端给出的一模一样：schema 里少声明一个属性，
	// ProseMirror 就会在 setContent 时静默丢掉它，这里专门盯住这一点。
	const docAgain = mdastToPmDoc(pmDocToMdast(doc));

	const reparsed = await readPost(roundTripped);
	const twice = composePost(pmDocToMdast(mdastToPmDoc(reparsed.tree)), reparsed.frontmatter);

	const [before, after, again] = await Promise.all([
		renderMarkdown(source),
		renderMarkdown(roundTripped),
		renderMarkdown(twice)
	]);

	const problems: string[] = [];
	if (JSON.stringify(canonicalDoc(docAgain)) !== JSON.stringify(canonicalDoc(doc))) {
		docNotFixedPoint++;
		problems.push('文档不是不动点（mdast→PM→mdast→PM 丢了节点或属性，通常是 schema 少声明了属性）');
	}
	if (before.html !== after.html) {
		htmlMismatch++;
		problems.push(`HTML 不一致\n  ${firstDifference(before.html, after.html)}`);
	}
	if (after.html !== again.html) {
		unstable++;
		problems.push(`二次写回不稳定\n  ${firstDifference(after.html, again.html)}`);
	}

	const frontmatterAgain = reparsed.frontmatter;
	if (canonical(frontmatter) !== canonical(frontmatterAgain)) {
		frontmatterMismatch++;
		problems.push(`frontmatter 不一致\n  原：${JSON.stringify(frontmatter)}\n  新：${JSON.stringify(frontmatterAgain)}`);
	}

	if (problems.length) {
		console.log(`\n✗ ${file}（${title}）`);
		for (const problem of problems) console.log(`  ${problem}`);
	} else {
		console.log(`✓ ${file}`);
	}

	void before.title;
	void serializeFrontmatter;
}

// ---------------------------------------------------------------------------
// 合成文档：这些形状只有编辑器会产生（解析出来的 markdown 不可能长这样），
// 所以没法用现成文章覆盖。断言点在于「节点还在、渲染结果稳定」。
// ---------------------------------------------------------------------------

const text = (value: string, ...marks: any[]) => ({ type: 'text', text: value, marks: marks.length ? marks : undefined });
const bold = { type: 'bold' };
const italic = { type: 'italic' };
const link = (href: string) => ({ type: 'link', attrs: { href, title: null } });
const para = (...content: any[]) => ({ type: 'paragraph', content });

const synthetic: { name: string; doc: any; expect: string[] }[] = [
	{
		name: '加粗范围带结尾空格',
		doc: { type: 'doc', content: [para(text('Hello ', bold), text('世界 '), { type: 'mathInline', attrs: { latex: 'a' } })] },
		expect: ['<strong>Hello</strong>', '<span class="katex">']
	},
	{
		name: '加粗范围整段都是空格',
		doc: { type: 'doc', content: [para(text('   ', bold), text('正文'))] },
		// 空白被 markdown 解析器规范化掉，关键是加粗空壳不能留下 `****`
		expect: ['<p>正文</p>', '正文']
	},
	{
		name: '强调跨过链接',
		doc: { type: 'doc', content: [para(text('前 ', italic), text('中间', italic, link('https://a.b')), text(' 后', italic))] },
		expect: ['<em>前 <a', '中间</a> 后</em>']
	},
	{
		name: '链接跨过强调',
		doc: { type: 'doc', content: [para(text('前 ', link('https://a.b')), text('中间', link('https://a.b'), italic), text(' 后', link('https://a.b')))] },
		expect: ['<a href="https://a.b"', '<em>中间</em>', ' 后</a>']
	},
	{
		name: '加粗跨过斜体',
		doc: { type: 'doc', content: [para(text('前 ', bold), text('中间', bold, italic), text(' 后', bold))] },
		expect: ['<strong>前 <em>中间</em> 后</strong>']
	},
	{
		name: '一段里同时有互不相交的加粗与斜体',
		doc: {
			type: 'doc',
			content: [
				para(text('a', bold), text('b', italic), text('c', bold), text('d', italic))
			]
		},
		expect: ['<strong>a</strong>', '<em>b</em>', '<strong>c</strong>', '<em>d</em>']
	}
];

let syntheticFailed = 0;
for (const item of synthetic) {
	const md = composePost(pmDocToMdast(item.doc), { date: '2026/01/01' });
	const again = composePost(pmDocToMdast(mdastToPmDoc((await readPost(md)).tree)), (await readPost(md)).frontmatter);
	const rendered = (await renderMarkdown(md)).html;
	const rerendered = (await renderMarkdown(again)).html;
	const problems: string[] = [];
	for (const needle of item.expect) if (!rendered.includes(needle)) problems.push(`渲染结果缺少 ${needle}`);
	if (rendered !== rerendered) problems.push('二次写回不稳定');
	if (problems.length) {
		syntheticFailed++;
		console.log(`\n✗ [合成] ${item.name}\n  ${problems.join('\n  ')}\n  产物：${JSON.stringify(md)}`);
	} else {
		console.log(`✓ [合成] ${item.name}`);
	}
}

// 引用扫描必须能看见脚注定义里的图片，否则媒体库会把在用的图报成「未引用」
const referenceSamples = collectReferencesFrom([
	{
		file: 'sample.md',
		content: '正文[^1]\n\n[^1]: 脚注里的图 ![](oss://demo/inside-footnote.jpg)\n\n:::tip\n![](oss://demo/inside-callout.jpg)\n:::\n\n<img src="oss://demo/raw-html.jpg">\n'
	}
]);
const expectedKeys = ['demo/inside-callout.jpg', 'demo/inside-footnote.jpg', 'demo/raw-html.jpg'];
const missingKeys = expectedKeys.filter(key => !referenceSamples.some(reference => reference.key === key));
if (missingKeys.length) {
	syntheticFailed++;
	console.log(`\n✗ [合成] 引用扫描漏掉了：${missingKeys.join('、')}`);
} else {
	console.log('✓ [合成] 引用扫描覆盖脚注 / 高亮块 / 原始 HTML');
}

console.log(
	`\n${files.length} 篇：渲染不一致 ${htmlMismatch}，二次写回不稳定 ${unstable}，frontmatter 不一致 ${frontmatterMismatch}，文档非不动点 ${docNotFixedPoint}；合成用例失败 ${syntheticFailed}`
);
if (htmlMismatch || unstable || frontmatterMismatch || docNotFixedPoint || syntheticFailed) process.exitCode = 1;
