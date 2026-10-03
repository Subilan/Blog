/**
 * mdast 与 ProseMirror/Tiptap 文档 JSON 之间的无损往返。
 *
 * 这两个函数刻意不依赖 Tiptap 运行时，只产出/消费纯 JSON，节点名与
 * studio/editor/schema.ts 里注册的扩展一一对应，因此可以在 Node 里单测。
 * 认不出的 mdast 节点一律退化成 raw 节点原样带回，保证不会丢内容。
 */

import { stringifyTree } from '../markdown';

export type PmMark = { type: string; attrs?: Record<string, any> };
export type PmNode = {
	type: string;
	attrs?: Record<string, any>;
	content?: PmNode[];
	marks?: PmMark[];
	text?: string;
};

// 外层在内层之前。ProseMirror 的 marks 是一组无序标记，原始嵌套顺序无法保留，
// 这里固定一种规范嵌套：强调包着链接（`*文字[链接](url)*`），而不是反过来。
// 覆盖范围完全相同时（`*[链接](url)*` 这类无法在扁平标记模型里区分的写法）
// 才用到的兜底顺序，越靠前越外面。
const MARK_TIE_PRIORITY = ['link', 'strike', 'bold', 'italic', 'code'];
const rawCache = new Map<string, string>();

function rawFromMdast(node: any): string {
	if (typeof node.value === 'string') return node.value;
	const key = JSON.stringify(node, (k, v) => (k === 'position' ? undefined : v));
	const cached = rawCache.get(key);
	if (cached !== undefined) return cached;
	let value = '';
	try {
		value = stringifyTree({ type: 'root', children: [node] }).trim();
	} catch {
		value = '';
	}
	rawCache.set(key, value);
	return value;
}

function text(value: string, marks: PmMark[]): PmNode | null {
	if (!value) return null;
	return marks.length ? { type: 'text', text: value, marks } : { type: 'text', text: value };
}

/**
 * 还原 directive 的字面写法。站点管道会把 textDirective 直接降级成 `:name`
 * 文本，所以这里按原样保留源码形式，渲染结果与站点一致。
 */
function directiveSource(node: any): string {
	const prefix = node.type === 'textDirective' ? ':' : node.type === 'leafDirective' ? '::' : ':::';
	const attributes = node.attributes && Object.keys(node.attributes).length
		? '{' + Object.entries(node.attributes).map(([key, value]) => (value === null || value === '' ? key : `${key}="${value}"`)).join(' ') + '}'
		: '';
	const label = (node.children ?? []).map(inlineSource).join('').replace(/\s+/g, ' ');
	return label ? `${prefix}${node.name ?? ''}[${label}]${attributes}` : `${prefix}${node.name ?? ''}${attributes}`;
}

function linkSource(node: any): string {
	const label = (node.children ?? []).map(inlineSource).join('');
	const title = node.title ? ` "${node.title}"` : '';
	return `[${label}](${node.url ?? ''}${title})`;
}

function inlineSource(node: any): string {
	if (typeof node.value === 'string') return node.value;
	const value = rawFromMdast(node);
	return value.replace(/\s+/g, ' ').trim();
}

function tableToPm(node: any): PmNode {
	const align: (string | null)[] = node.align ?? [];
	const rows: PmNode[] = (node.children ?? []).map((row: any, rowIndex: number) => ({
		type: 'tableRow',
		content: (row.children ?? []).map((cell: any) => ({
			type: rowIndex === 0 ? 'tableHeader' : 'tableCell',
			content: [{ type: 'paragraph', content: mdastInlines(cell.children ?? []) }]
		}))
	}));
	return { type: 'table', attrs: { align }, content: rows };
}

function mdastBlock(node: any): PmNode | null {
	switch (node.type) {
		case 'paragraph':
			return { type: 'paragraph', content: mdastInlines(node.children ?? []) };
		case 'heading':
			return { type: 'heading', attrs: { level: node.depth ?? 1 }, content: mdastInlines(node.children ?? []) };
		case 'thematicBreak':
			return { type: 'horizontalRule' };
		case 'blockquote':
			return { type: 'blockquote', content: mdastBlocks(node.children ?? []) };
		case 'list':
			return {
				type: node.ordered ? 'orderedList' : 'bulletList',
				attrs: node.ordered ? { start: node.start ?? 1, spread: !!node.spread } : { spread: !!node.spread },
				content: (node.children ?? []).map(mdastListItem)
			};
		case 'code':
			return {
				type: 'codeBlock',
				attrs: { language: node.lang ?? '', meta: node.meta ?? '' },
				content: node.value ? [{ type: 'text', text: node.value }] : []
			};
		case 'html':
			return { type: 'rawBlock', content: node.value ? [{ type: 'text', text: node.value }] : [] };
		case 'math':
			return { type: 'mathBlock', attrs: { latex: node.value ?? '' } };
		case 'containerDirective':
			return { type: 'callout', attrs: { name: node.name ?? 'note' }, content: mdastBlocks(node.children ?? []) };
		case 'textDirective':
		case 'leafDirective':
		case 'definition':
			return { type: 'rawBlock', content: [{ type: 'text', text: directiveSource(node) }] };
		case 'footnoteDefinition':
			return {
				type: 'footnoteItem',
				attrs: { label: node.label ?? node.identifier ?? '', identifier: node.identifier ?? '' },
				content: mdastBlocks(node.children ?? [])
			};
		case 'table':
			return tableToPm(node);
		case 'yaml':
		case 'toml':
			return null;
		default: {
			const value = rawFromMdast(node);
			return value ? { type: 'rawBlock', content: [{ type: 'text', text: value }] } : null;
		}
	}
}

function mdastListItem(node: any): PmNode {
	// 条目的松紧在保存时由「有没有第二个段落」推出来，不需要单独带属性
	return { type: 'listItem', content: mdastBlocks(node.children ?? []) };
}

function mdastBlocks(children: any[]): PmNode[] {
	const out: PmNode[] = [];
	for (const child of children) {
		const node = mdastBlock(child);
		if (node) out.push(node);
	}
	return out;
}

function mdastInline(node: any, marks: PmMark[], out: PmNode[]) {
	switch (node.type) {
		case 'text': {
			const item = text(node.value ?? '', marks);
			if (item) out.push(item);
			return;
		}
		case 'emphasis':
			for (const child of node.children ?? []) mdastInline(child, [...marks, { type: 'italic' }], out);
			return;
		case 'strong':
			for (const child of node.children ?? []) mdastInline(child, [...marks, { type: 'bold' }], out);
			return;
		case 'delete':
			for (const child of node.children ?? []) mdastInline(child, [...marks, { type: 'strike' }], out);
			return;
		case 'inlineCode': {
			const item = text(node.value ?? '', [...marks, { type: 'code' }]);
			if (item) out.push(item);
			return;
		}
		case 'link': {
			const before = out.length;
			const linkMarks = [...marks, { type: 'link', attrs: { href: node.url ?? '', title: node.title ?? null } }];
			for (const child of node.children ?? []) mdastInline(child, linkMarks, out);
			// 空的链接（`[](url)`）在 ProseMirror 里没有对应的空文本节点，原样保留
			if (out.length === before) out.push({ type: 'rawInline', attrs: { value: linkSource(node) }, marks });
			return;
		}
		case 'image':
			out.push({ type: 'image', attrs: { src: node.url ?? '', alt: node.alt ?? '', title: node.title ?? null }, marks });
			return;
		case 'break':
			out.push({ type: 'hardBreak', marks });
			return;
		case 'inlineMath':
			out.push({ type: 'mathInline', attrs: { latex: node.value ?? '' }, marks });
			return;
		case 'footnoteReference':
			out.push({
				type: 'footnoteReference',
				attrs: { label: node.label ?? node.identifier ?? '', identifier: node.identifier ?? '' },
				marks
			});
			return;
		case 'textDirective':
			out.push({ type: 'rawInline', attrs: { value: directiveSource(node) }, marks });
			return;
		default: {
			out.push({ type: 'rawInline', attrs: { value: rawFromMdast(node) }, marks });
		}
	}
}

function mdastInlines(children: any[]): PmNode[] {
	const out: PmNode[] = [];
	for (const child of children) mdastInline(child, [], out);
	return out;
}

export function mdastToPmDoc(tree: any): PmNode {
	return { type: 'doc', content: mdastBlocks(tree.children ?? []) };
}

// ---------------------------------------------------------------------------
// ProseMirror → mdast
// ---------------------------------------------------------------------------

function pmText(node: PmNode): string {
	return (node.content ?? [])
		.map(child => (child.type === 'text' ? child.text ?? '' : child.type === 'hardBreak' ? '\n' : ''))
		.join('');
}

type InlineItem = { marks: PmMark[]; text?: string; leaf: () => any };

const WRAPPING_MARKS = new Set(['bold', 'italic', 'strike', 'link']);

function markKey(mark: PmMark) {
	return `${mark.type}\u0000${JSON.stringify(mark.attrs ?? {})}`;
}

function sortMarks(marks: PmMark[] | undefined): PmMark[] {
	return [...(marks ?? [])].sort(
		(a, b) => MARK_TIE_PRIORITY.indexOf(a.type) - MARK_TIE_PRIORITY.indexOf(b.type)
	);
}

/**
 * 决定同一段文字上多个标记的嵌套顺序。
 *
 * ProseMirror 的标记是扁平的，嵌套信息丢了，必须自己恢复：跨得越宽的标记
 * 越应该在外面。判断依据是覆盖范围包含关系（`**a *b* c**` 里 bold 覆盖
 * italic），而不是简单的范围大小，因为一整段里可能同时存在互不相交的
 * bold 与 italic，谁大谁小并不说明嵌套关系。包含关系不成立时退到兜底顺序。
 */
function orderMarks(items: InlineItem[]) {
	const coverage = new Map<string, Set<number>>();
	items.forEach((item, index) => {
		for (const mark of item.marks) {
			const key = markKey(mark);
			if (!coverage.has(key)) coverage.set(key, new Set());
			coverage.get(key)!.add(index);
		}
	});

	const contains = (outer: Set<number>, inner: Set<number>) => {
		for (const index of inner) if (!outer.has(index)) return false;
		return true;
	};

	for (const item of items) {
		item.marks.sort((a, b) => {
			if (a.type === 'code' || b.type === 'code') return a.type === 'code' ? 1 : -1;
			const setA = coverage.get(markKey(a))!;
			const setB = coverage.get(markKey(b))!;
			const aHasB = contains(setA, setB);
			const bHasA = contains(setB, setA);
			if (aHasB !== bHasA) return aHasB ? -1 : 1;
			return MARK_TIE_PRIORITY.indexOf(a.type) - MARK_TIE_PRIORITY.indexOf(b.type);
		});
	}
}

function wrapMark(mark: PmMark, children: any[]): any {
	switch (mark.type) {
		case 'bold':
			return { type: 'strong', children };
		case 'italic':
			return { type: 'emphasis', children };
		case 'strike':
			return { type: 'delete', children };
		case 'link':
			return { type: 'link', url: mark.attrs?.href ?? '', title: mark.attrs?.title ?? null, children };
		default:
			return children[0];
	}
}

function nestInlines(items: InlineItem[], depth: number): any[] {
	const out: any[] = [];
	let index = 0;
	while (index < items.length) {
		const item = items[index];
		if (item.marks.length <= depth) {
			out.push(item.leaf());
			index++;
			continue;
		}
		const mark = item.marks[depth];
		let end = index + 1;
		while (end < items.length && items[end].marks.length > depth && markKey(items[end].marks[depth]) === markKey(mark)) end++;
		if (mark.type === 'code') {
			out.push({ type: 'inlineCode', value: items.slice(index, end).map(entry => entry.text ?? '').join('') });
			index = end;
			continue;
		}
		out.push(wrapMark(mark, nestInlines(items.slice(index, end), depth + 1)));
		index = end;
	}
	return out;
}

function toInlineItem(node: PmNode): InlineItem | null {
	const marks = sortMarks(node.marks);
	switch (node.type) {
		case 'text': {
			if (!node.text) return null;
			const kept = marks.filter(mark => WRAPPING_MARKS.has(mark.type) || mark.type === 'code');
			return { marks: kept, text: node.text, leaf: () => ({ type: 'text', value: node.text }) };
		}
		case 'hardBreak':
			return { marks: marks.filter(mark => WRAPPING_MARKS.has(mark.type)), leaf: () => ({ type: 'break' }) };
		case 'image':
			return {
				marks: marks.filter(mark => WRAPPING_MARKS.has(mark.type)),
				leaf: () => ({
					type: 'image',
					url: node.attrs?.src ?? '',
					alt: node.attrs?.alt || null,
					title: node.attrs?.title || null
				})
			};
		case 'mathInline':
			return {
				marks: marks.filter(mark => WRAPPING_MARKS.has(mark.type)),
				leaf: () => ({ type: 'inlineMath', value: node.attrs?.latex ?? '' })
			};
		case 'footnoteReference':
			return {
				marks: marks.filter(mark => WRAPPING_MARKS.has(mark.type)),
				leaf: () => ({
					type: 'footnoteReference',
					identifier: node.attrs?.identifier || normalizeIdentifier(node.attrs?.label ?? ''),
					label: node.attrs?.label ?? ''
				})
			};
		case 'rawInline':
			return {
				marks: marks.filter(mark => WRAPPING_MARKS.has(mark.type)),
				leaf: () => ({ type: 'html', value: node.attrs?.value ?? '' })
			};
		default: {
			const value = pmText(node);
			return value ? { marks: [], text: value, leaf: () => ({ type: 'text', value }) } : null;
		}
	}
}

function normalizeIdentifier(label: string) {
	return label.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Markdown 的强调标记不能贴着空白：`**加粗 **` 不会被解析成加粗。
 * 编辑器里选择范围常常带上结尾空格，所以把包装节点首尾的空白挪到外面，
 * 视觉结果不变，序列化出来才是合法的强调。行内代码不参与（空白有意义）。
 */
const EDGE_WRAPPERS = new Set(['strong', 'emphasis', 'delete', 'link']);

function normalizeEdges(nodes: any[]): any[] {
	const out: any[] = [];
	for (const node of nodes) {
		if (!EDGE_WRAPPERS.has(node.type)) {
			out.push(node);
			continue;
		}
		node.children = normalizeEdges(node.children ?? []);

		const first = node.children[0];
		if (first?.type === 'text') {
			const leading = first.value.match(/^\s+/)?.[0];
			if (leading) {
				out.push({ type: 'text', value: leading });
				first.value = first.value.slice(leading.length);
				if (!first.value) node.children.shift();
			}
		}

		let trailing: any = null;
		const last = node.children[node.children.length - 1];
		if (last?.type === 'text') {
			const match = last.value.match(/\s+$/)?.[0];
			if (match) {
				trailing = { type: 'text', value: match };
				last.value = last.value.slice(0, last.value.length - match.length);
				if (!last.value) node.children.pop();
			}
		}

		// 去掉空白后只剩空壳的标记（例如把整段空格加粗）没有意义，退化成纯文本
		if (!node.children.length) {
			out.push(...(trailing ? [trailing] : []));
			continue;
		}
		out.push(node);
		if (trailing) out.push(trailing);
	}
	return out;
}

function pmInlines(children: PmNode[] | undefined): any[] {
	const items: InlineItem[] = [];
	for (const child of children ?? []) {
		const item = toInlineItem(child);
		if (item) items.push(item);
	}
	orderMarks(items);
	return normalizeEdges(nestInlines(items, 0));
}

/** 表格单元格在 mdast 里是行内内容，在 ProseMirror 里必须是块，用段落包一层 */
function cellInlines(cell: PmNode): any[] {
	const out: any[] = [];
	for (const child of cell.content ?? []) {
		if (child.type === 'paragraph') out.push(...pmInlines(child.content));
		else {
			const value = pmText(child);
			if (value) out.push({ type: 'text', value });
		}
	}
	return out;
}

function pmList(node: PmNode, ordered: boolean): any {
	// 松紧只由空行决定：item 里出现第二个段落才算松，嵌套列表不会让它变松
	const spread =
		!!node.attrs?.spread ||
		(node.content ?? []).some(item => (item.content ?? []).filter(child => child.type === 'paragraph').length > 1);
	return {
		type: 'list',
		ordered,
		start: ordered ? node.attrs?.start ?? 1 : null,
		spread,
		children: (node.content ?? []).map(item => ({
			type: 'listItem',
			spread: !!item.attrs?.spread,
			children: pmBlocks(item.content)
		}))
	};
}

function pmTable(node: PmNode): any {
	const rows: PmNode[] = node.content ?? [];
	const columns = rows.reduce((max, row) => Math.max(max, (row.content ?? []).length), 0);
	const align: (string | null)[] = Array.from({ length: columns }, (_, index) => node.attrs?.align?.[index] ?? null);
	return {
		type: 'table',
		align,
		children: rows.map(row => ({
			type: 'tableRow',
			children: (row.content ?? []).map(cell => ({ type: 'tableCell', children: cellInlines(cell) }))
		}))
	};
}

function pmBlock(node: PmNode): any {
	switch (node.type) {
		case 'paragraph':
			return { type: 'paragraph', children: pmInlines(node.content) };
		case 'heading':
			return { type: 'heading', depth: node.attrs?.level ?? 1, children: pmInlines(node.content) };
		case 'horizontalRule':
			return { type: 'thematicBreak' };
		case 'blockquote':
			return { type: 'blockquote', children: pmBlocks(node.content) };
		case 'bulletList':
			return pmList(node, false);
		case 'orderedList':
			return pmList(node, true);
		case 'codeBlock':
			return {
				type: 'code',
				lang: node.attrs?.language || null,
				meta: node.attrs?.meta || null,
				value: pmText(node)
			};
		case 'rawBlock':
			return { type: 'html', value: pmText(node) };
		case 'mathBlock':
			return { type: 'math', value: node.attrs?.latex ?? '' };
		case 'callout':
			return { type: 'containerDirective', name: node.attrs?.name ?? 'note', attributes: {}, children: pmBlocks(node.content) };
		case 'footnoteItem':
			return {
				type: 'footnoteDefinition',
				identifier: node.attrs?.identifier || normalizeIdentifier(node.attrs?.label ?? ''),
				label: node.attrs?.label ?? '',
				children: pmBlocks(node.content)
			};
		case 'table':
			return pmTable(node);
		default:
			return { type: 'paragraph', children: pmInlines(node.content) };
	}
}

function pmBlocks(children: PmNode[] | undefined): any[] {
	const out: any[] = [];
	for (const child of children ?? []) {
		const node = pmBlock(child);
		if (node) out.push(node);
	}
	return out;
}

export function pmDocToMdast(doc: PmNode): any {
	return { type: 'root', children: pmBlocks(doc.content) };
}
