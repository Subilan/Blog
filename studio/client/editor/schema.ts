/**
 * 编辑器的 ProseMirror schema。
 *
 * 节点名与属性名必须与 studio/editor/mdast-pm.ts 的约定完全一致，
 * 否则 setContent 会报 unknown node type。
 */

import { Node, type Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import { VueNodeViewRenderer } from '@tiptap/vue-3';
import { createLowlight, common } from 'lowlight';
import ImageView from './node-views/ImageView.vue';
import MathView from './node-views/MathView.vue';

const lowlight = createLowlight(common);

const hiddenAttribute = { default: false, renderHTML: () => ({}), parseHTML: () => false };

/**
 * 容器节点里按回车会一直往内嵌，这里用 Mod+Enter 跳出到容器后面，
 * 和代码块的 Mod-Enter 行为一致。
 */
function escapeContainer(editor: Editor, name: string) {
	const { $from } = editor.state.selection;
	for (let depth = $from.depth; depth > 0; depth--) {
		if ($from.node(depth).type.name !== name) continue;
		const after = $from.after(depth);
		return editor
			.chain()
			.insertContentAt(after, { type: 'paragraph' })
			.setTextSelection(after + 1)
			.run();
	}
	return false;
}

/** 列表的松紧在 markdown 里体现为空行，ProseMirror 没有这个概念，塞进 attrs 带着走 */
const SpreadBulletList = BulletList.extend({
	addAttributes(this: any) {
		return { ...this.parent?.(), spread: hiddenAttribute };
	}
});

const SpreadOrderedList = OrderedList.extend({
	addAttributes(this: any) {
		return { ...this.parent?.(), spread: hiddenAttribute };
	}
});

const StudioCodeBlock = CodeBlockLowlight.extend({
	addAttributes(this: any) {
		return { ...this.parent?.(), meta: { default: '', renderHTML: () => ({}), parseHTML: () => false } };
	}
});

export const Callout = Node.create({
	name: 'callout',
	group: 'block',
	content: 'block+',
	defining: true,
	addAttributes() {
		return { name: { default: 'note' } };
	},
	parseHTML() {
		return [
			{
				tag: 'div.vuepress-callout',
				getAttrs: (element: any) => ({
					name:
						['tip', 'warning', 'danger', 'note'].find(kind => element.classList.contains(kind)) ??
						element.getAttribute('data-callout') ??
						'note'
				})
			}
		];
	},
	renderHTML({ node }) {
		return ['div', { class: `vuepress-callout ${node.attrs.name}`, 'data-callout': node.attrs.name }, 0];
	},
	addKeyboardShortcuts() {
		return { 'Mod-Enter': () => escapeContainer(this.editor, 'callout') };
	}
});

export const RawBlock = Node.create({
	name: 'rawBlock',
	group: 'block',
	content: 'text*',
	marks: '',
	code: true,
	defining: true,
	parseHTML() {
		return [{ tag: 'pre.raw-block', preserveWhitespace: 'full' }];
	},
	renderHTML() {
		return ['pre', { class: 'raw-block' }, 0];
	}
});

export const MathBlock = Node.create({
	name: 'mathBlock',
	group: 'block',
	atom: true,
	addAttributes() {
		return { latex: { default: '' } };
	},
	parseHTML() {
		return [
			{
				tag: 'div[data-math-block]',
				getAttrs: (element: any) => ({ latex: element.getAttribute('data-latex') ?? '' })
			}
		];
	},
	renderHTML({ node }) {
		return ['div', { 'data-math-block': '', 'data-latex': node.attrs.latex }];
	},
	addNodeView() {
		return VueNodeViewRenderer(MathView);
	}
});

export const MathInline = Node.create({
	name: 'mathInline',
	group: 'inline',
	inline: true,
	atom: true,
	addAttributes() {
		return { latex: { default: '' } };
	},
	parseHTML() {
		return [
			{
				tag: 'span[data-math-inline]',
				getAttrs: (element: any) => ({ latex: element.getAttribute('data-latex') ?? '' })
			}
		];
	},
	renderHTML({ node }) {
		return ['span', { 'data-math-inline': '', 'data-latex': node.attrs.latex }];
	},
	addNodeView() {
		return VueNodeViewRenderer(MathView);
	}
});

export const FootnoteItem = Node.create({
	name: 'footnoteItem',
	group: 'block',
	content: 'block+',
	defining: true,
	addAttributes() {
		return { label: { default: '' }, identifier: { default: '' } };
	},
	parseHTML() {
		return [{ tag: 'div[data-footnote-item]' }];
	},
	renderHTML({ node }) {
		return [
			'div',
			{ class: 'footnote-item', 'data-footnote-item': '' },
			['div', { class: 'footnote-label', contenteditable: 'false' }, `[^${node.attrs.label}]`],
			['div', { class: 'footnote-body' }, 0]
		];
	},
	addKeyboardShortcuts() {
		return { 'Mod-Enter': () => escapeContainer(this.editor, 'footnoteItem') };
	}
});

export const FootnoteReference = Node.create({
	name: 'footnoteReference',
	group: 'inline',
	inline: true,
	atom: true,
	addAttributes() {
		return { label: { default: '' }, identifier: { default: '' } };
	},
	parseHTML() {
		return [
			{
				tag: 'sup[data-footnote-ref]',
				getAttrs: (element: any) => ({ label: element.getAttribute('data-footnote-ref') ?? '' })
			}
		];
	},
	renderHTML({ node }) {
		return ['sup', { class: 'footnote-ref', 'data-footnote-ref': node.attrs.label }, `[^${node.attrs.label}]`];
	}
});

export const RawInline = Node.create({
	name: 'rawInline',
	group: 'inline',
	inline: true,
	atom: true,
	addAttributes() {
		return { value: { default: '' } };
	},
	parseHTML() {
		return [
			{
				tag: 'span[data-raw-inline]',
				getAttrs: (element: any) => ({ value: element.getAttribute('data-value') ?? element.textContent ?? '' })
			}
		];
	},
	renderHTML({ node }) {
		return ['span', { class: 'raw-inline', 'data-raw-inline': '', 'data-value': node.attrs.value }, node.attrs.value];
	}
});

export const StudioImage = Image.extend({
	inline: true,
	group: 'inline',
	addAttributes(this: any) {
		return { ...this.parent?.(), src: { default: '' }, alt: { default: '' }, title: { default: null } };
	},
	addNodeView() {
		return VueNodeViewRenderer(ImageView);
	}
}).configure({ inline: true, allowBase64: false });

export const StudioTable = Table.extend({
	addAttributes(this: any) {
		return { ...this.parent?.(), align: { default: [], renderHTML: () => ({}), parseHTML: () => false } };
	}
}).configure({ resizable: false, lastColumnResizable: false });

export const extensions = [
	StarterKit.configure({
		codeBlock: false,
		heading: { levels: [1, 2, 3, 4] },
		bulletList: false,
		orderedList: false,
		dropcursor: { color: '#38bdf8', width: 2 }
	}),
	SpreadBulletList,
	SpreadOrderedList,
	StudioCodeBlock.configure({ lowlight, defaultLanguage: null }),
	Link.configure({ openOnClick: false, autolink: false }),
	StudioImage,
	StudioTable,
	TableRow,
	TableHeader,
	TableCell,
	Callout,
	RawBlock,
	MathBlock,
	MathInline,
	FootnoteItem,
	FootnoteReference,
	RawInline,
	Placeholder.configure({ placeholder: '开始写点什么…' })
];

export const CALLOUT_NAMES = ['tip', 'warning', 'danger', 'note'];
export const CALLOUT_LABELS: Record<string, string> = {
	tip: '提示',
	warning: '注意',
	danger: '危险',
	note: '说明'
};
export const CODE_LANGUAGES = [
	'ts',
	'typescript',
	'js',
	'javascript',
	'json',
	'vue',
	'html',
	'css',
	'bash',
	'sh',
	'shell',
	'python',
	'java',
	'go',
	'swift',
	'php',
	'sql',
	'log',
	'markdown',
	'plain'
];
