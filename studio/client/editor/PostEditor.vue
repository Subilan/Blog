<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { EditorContent, useEditor } from '@tiptap/vue-3';
import { ArrowLeftIcon, EyeIcon, PenLineIcon, SaveIcon, SquarePenIcon, XIcon } from '@lucide/vue';
import { toast } from 'vue-sonner';
import { api, type FrontMatter, type StagedImage } from '@/studio/client/api';
import FormDialog, { type FormFieldSpec, type FieldValue } from '@/studio/client/components/FormDialog.vue';
import { Badge } from '@/studio/client/components/ui/badge';
import { Button } from '@/studio/client/components/ui/button';
import { Checkbox } from '@/studio/client/components/ui/checkbox';
import { Field as FormField, FieldLabel } from '@/studio/client/components/ui/field';
import { Separator } from '@/studio/client/components/ui/separator';
import { Spinner } from '@/studio/client/components/ui/spinner';
import { ToggleGroup, ToggleGroupItem } from '@/studio/client/components/ui/toggle-group';
import { CODE_LANGUAGES, extensions } from '@/studio/client/editor/schema';
import FrontmatterForm from '@/studio/client/editor/FrontmatterForm.vue';
import Toolbar from '@/studio/client/editor/Toolbar.vue';

const props = defineProps<{ stem: string }>();
const emit = defineEmits<{ close: [] }>();

const frontmatter = ref<FrontMatter>({ date: '' });
const ossDir = ref('');
const title = ref('');
const words = ref(0);
const staged = ref<StagedImage[]>([]);
const dirty = ref(false);
const saving = ref(false);
const mode = ref<'edit' | 'source' | 'preview'>('edit');
const autoBuild = ref(localStorage.getItem('studio:autoBuild') !== '0');
const revision = ref(0);
const markdown = ref('');
const html = ref('');
const fileInput = ref<HTMLInputElement | null>(null);

const editor = useEditor({
	extensions,
	content: { type: 'doc', content: [{ type: 'paragraph' }] },
	autofocus: false,
	editorProps: {
		attributes: { class: 'studio-content focus:outline-none', spellcheck: 'false' }
	},
	onUpdate: () => {
		dirty.value = true;
		scheduleDerive();
	},
	onTransaction: () => {
		revision.value++;
	},
	onCreate: ({ editor: instance }) => {
		// 本地工具，留一个调试入口，方便在控制台里看文档与选区
		(window as any).__studioEditor = instance;
	}
});

watch(autoBuild, value => localStorage.setItem('studio:autoBuild', value ? '1' : '0'));

const dialog = ref<{
	open: boolean;
	title: string;
	description?: string;
	fields: FormFieldSpec[];
	initial: Record<string, FieldValue>;
	onSubmit: (values: Record<string, FieldValue>) => void;
}>({ open: false, title: '', fields: [], initial: {}, onSubmit: () => {} });

function openDialog(config: typeof dialog.value) {
	dialog.value = { ...config, open: true };
}

const statusLabel = computed(() => (saving.value ? '保存中' : dirty.value ? '未保存' : '已同步'));

// ---------------------------------------------------------------------------
// 载入与派生
// ---------------------------------------------------------------------------

let deriveTimer: ReturnType<typeof setTimeout> | undefined;
function scheduleDerive() {
	if (deriveTimer) clearTimeout(deriveTimer);
	deriveTimer = setTimeout(derive, 500);
}

async function derive() {
	if (!editor.value) return;
	try {
		const result = await api.markdown({ frontmatter: frontmatter.value, doc: editor.value.getJSON() });
		markdown.value = result.markdown;
		html.value = result.html;
		words.value = result.words;
		if (result.title) title.value = result.title;
	} catch (problem) {
		toast.error(problem instanceof Error ? problem.message : String(problem));
	}
}

async function load() {
	try {
		const detail = await api.getPost(props.stem);
		frontmatter.value = detail.frontmatter ?? { date: '' };
		ossDir.value = detail.ossDir;
		title.value = detail.title;
		words.value = detail.words;
		staged.value = detail.staged;
		markdown.value = detail.markdown;
		editor.value?.commands.setContent(detail.doc, false);
		dirty.value = false;
		await derive();
	} catch (problem) {
		toast.error(problem instanceof Error ? problem.message : String(problem));
	}
}

onMounted(() => {
	void load();
	window.addEventListener('keydown', onKeydown);
	window.addEventListener('studio:edit-image', onEditImage as EventListener);
	window.addEventListener('studio:edit-math', onEditMath as EventListener);
	window.addEventListener('beforeunload', onBeforeUnload);
});

onBeforeUnmount(() => {
	window.removeEventListener('keydown', onKeydown);
	window.removeEventListener('studio:edit-image', onEditImage as EventListener);
	window.removeEventListener('studio:edit-math', onEditMath as EventListener);
	window.removeEventListener('beforeunload', onBeforeUnload);
});

function onBeforeUnload(event: BeforeUnloadEvent) {
	if (!dirty.value) return;
	event.preventDefault();
	event.returnValue = '';
}

function onKeydown(event: KeyboardEvent) {
	if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
		event.preventDefault();
		void save();
	}
}

// ---------------------------------------------------------------------------
// 工具栏动作
// ---------------------------------------------------------------------------

function onAction(name: string, payload?: string) {
	const current = editor.value;
	if (!current) return;
	switch (name) {
		case 'link':
			return openLinkDialog();
		case 'code-block':
			return openCodeDialog();
		case 'table':
			current.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
			return;
		case 'math-inline':
			return openDialog({
				title: '行内公式',
				fields: [{ key: 'latex', label: 'LaTeX', placeholder: 'a \\le b' }],
				onSubmit: values =>
					current.chain().focus().insertContent({ type: 'mathInline', attrs: { latex: values.latex } }).run()
			});
		case 'math-block':
			return openDialog({
				title: '公式块',
				fields: [{ key: 'latex', label: 'LaTeX', type: 'textarea', rows: 3 }],
				onSubmit: values =>
					current.chain().focus().insertContent({ type: 'mathBlock', attrs: { latex: values.latex } }).run()
			});
		case 'raw':
			return openDialog({
				title: '原始 HTML 块',
				description: '原样写进 Markdown，构建时按站点规则渲染',
				fields: [
					{ key: 'value', label: '内容', type: 'textarea', rows: 6, placeholder: '<details>\n<summary>折叠</summary>\n…\n</details>' }
				],
				onSubmit: values =>
					current
						.chain()
						.focus()
						.insertContent({ type: 'rawBlock', content: values.value ? [{ type: 'text', text: values.value }] : [] })
						.run()
			});
		case 'callout':
			return wrapCallout(payload || 'note');
		case 'callout-custom':
			return openDialog({
				title: '自定义高亮块',
				description: '站点管道只认识 tip / warning / danger / note，其它名称会渲染成普通 div',
				fields: [{ key: 'name', label: '名称', placeholder: 'thought' }],
				onSubmit: values => wrapCallout(String(values.name || 'note'))
			});
		case 'footnote':
			return openFootnoteDialog();
		case 'image':
			fileInput.value?.click();
			return;
	}
}

function wrapCallout(name: string) {
	const current = editor.value;
	if (!current) return;
	const done = current.chain().focus().wrapIn('callout', { name }).run();
	if (!done) {
		current
			.chain()
			.focus()
			.insertContent({ type: 'callout', attrs: { name }, content: [{ type: 'paragraph' }] })
			.run();
	}
}

function openLinkDialog() {
	const current = editor.value;
	if (!current) return;
	if (current.isActive('link')) {
		current.chain().focus().unsetLink().run();
		return;
	}
	const { from, to } = current.state.selection;
	const selected = current.state.doc.textBetween(from, to, ' ');
	openDialog({
		title: '插入链接',
		fields: [
			...(selected ? [] : [{ key: 'text', label: '文字' }]),
			{ key: 'href', label: '地址' },
			{ key: 'title', label: '标题', help: '可空' }
		],
		onSubmit: values => {
			const attrs = { href: values.href, title: values.title || null };
			if (selected) {
				current.chain().focus().extendMarkRange('link').setLink(attrs).run();
			} else {
				current
					.chain()
					.focus()
					.insertContentAt(
						{ from, to: from },
						{ type: 'text', text: values.text || values.href, marks: [{ type: 'link', attrs }] }
					)
					.run();
			}
		}
	});
}

function openCodeDialog() {
	const current = editor.value;
	if (!current) return;
	openDialog({
		title: '代码块语言',
		fields: [
			{
				key: 'language',
				label: '语言',
				type: 'select',
				options: [
					{ value: 'none', label: '（无）' },
					...CODE_LANGUAGES.map(language => ({ value: language, label: language }))
				]
			}
		],
		initial: { language: (current.getAttributes('codeBlock').language as string) || 'none' },
		onSubmit: values => {
			const language = values.language === 'none' ? '' : String(values.language);
			if (current.isActive('codeBlock')) current.chain().focus().updateAttributes('codeBlock', { language }).run();
			else current.chain().focus().toggleCodeBlock({ language }).run();
		}
	});
}

function openFootnoteDialog() {
	const current = editor.value;
	if (!current) return;
	const used = new Set<string>();
	current.state.doc.descendants((node: any) => {
		if (node.type.name === 'footnoteReference') used.add(String(node.attrs.label));
		return true;
	});
	let next = 1;
	while (used.has(String(next))) next++;
	openDialog({
		title: '插入脚注',
		fields: [
			{ key: 'label', label: '编号', placeholder: String(next) },
			{ key: 'text', label: '内容', type: 'textarea', rows: 3, help: '可稍后在脚注块里改' }
		],
		initial: { label: String(next) },
		onSubmit: values => {
			const label = String(values.label || next);
			current.chain().focus().insertContent({ type: 'footnoteReference', attrs: { label, identifier: label } }).run();
			current
				.chain()
				.insertContentAt(current.state.doc.content.size, {
					type: 'footnoteItem',
					attrs: { label, identifier: label },
					content: [{ type: 'paragraph', content: values.text ? [{ type: 'text', text: values.text }] : [] }]
				})
				.run();
		}
	});
}

function onEditMath(event: CustomEvent) {
	const current = editor.value;
	if (!current) return;
	const { pos, latex, display } = event.detail;
	openDialog({
		title: display ? '公式块' : '行内公式',
		fields: [{ key: 'latex', label: 'LaTeX', type: display ? 'textarea' : 'text', rows: 4 }],
		initial: { latex },
		onSubmit: values => {
			const node = current.state.doc.nodeAt(pos);
			if (!node) return;
			current.view.dispatch(current.state.tr.setNodeMarkup(pos, undefined, { ...node.attrs, latex: values.latex }));
		}
	});
}

function onEditImage(event: CustomEvent) {
	const current = editor.value;
	if (!current) return;
	const { pos, src, alt, title: imageTitle } = event.detail;
	openDialog({
		title: '图片',
		description: 'oss:// 开头的引用由构建管道展开成 CDN 地址',
		fields: [
			{ key: 'src', label: '地址' },
			{ key: 'alt', label: '替代文字' },
			{ key: 'title', label: '标题', help: '可空' }
		],
		initial: { src, alt, title: imageTitle ?? '' },
		onSubmit: values => {
			const node = current.state.doc.nodeAt(pos);
			if (!node) return;
			current.view.dispatch(
				current.state.tr.setNodeMarkup(pos, undefined, {
					...node.attrs,
					src: values.src,
					alt: values.alt ?? '',
					title: values.title || null
				})
			);
		}
	});
}

// ---------------------------------------------------------------------------
// 图片
// ---------------------------------------------------------------------------

async function onPickFiles(event: Event) {
	const input = event.target as HTMLInputElement;
	if (input.files?.length) await uploadFiles([...input.files]);
	input.value = '';
}

async function onDrop(event: DragEvent) {
	const files = [...(event.dataTransfer?.files ?? [])];
	if (files.length) await uploadFiles(files);
}

async function onPaste(event: ClipboardEvent) {
	const files = [...(event.clipboardData?.files ?? [])];
	if (!files.length) return;
	event.preventDefault();
	await uploadFiles(files);
}

async function uploadFiles(files: File[]) {
	const current = editor.value;
	if (!current) return;
	const images = files.filter(file => file.type.startsWith('image/'));
	if (!images.length) return;
	try {
		for (const file of images) {
			const info = await api.uploadStaged(props.stem, file);
			current
				.chain()
				.focus()
				.insertContent({ type: 'image', attrs: { src: info.url, alt: info.original, title: null } })
				.run();
		}
		staged.value = await api.listStaged(props.stem);
		dirty.value = true;
		toast.success(`${images.length} 张图片已落本地`, { description: '保存时会压缩并上传到 OSS' });
	} catch (problem) {
		toast.error(problem instanceof Error ? problem.message : String(problem));
	} finally {
		scheduleDerive();
	}
}

async function removeStaged(name: string) {
	await api.deleteStaged(props.stem, name);
	staged.value = await api.listStaged(props.stem);
	toast.success(`已删除暂存图片 ${name}`, { description: '正文里的引用需要手动清掉' });
}

// ---------------------------------------------------------------------------
// 保存
// ---------------------------------------------------------------------------

async function save() {
	const current = editor.value;
	if (!current || saving.value) return;
	saving.value = true;
	const toastId = staged.value.length ? toast.loading('正在压缩并上传图片…') : toast.loading('保存中…');
	try {
		const result = await api.savePost(props.stem, {
			frontmatter: frontmatter.value,
			doc: current.getJSON(),
			ossDir: ossDir.value
		});
		ossDir.value = result.ossDir;
		dirty.value = false;
		staged.value = await api.listStaged(props.stem);
		if (result.uploaded.length) {
			toast.success(`已保存，上传 ${result.uploaded.length} 张图片`, {
				id: toastId,
				description: result.uploaded.map(row => `${row.key}：${row.label}`).join('\n')
			});
		} else {
			toast.success('已保存', { id: toastId });
		}
		await derive();
		if (autoBuild.value) {
			const building = toast.loading('正在重建站点…');
			try {
				await api.build();
				toast.success('站点已重建', { id: building });
			} catch (problem) {
				toast.error('站点重建失败', {
					id: building,
					description: problem instanceof Error ? problem.message : String(problem)
				});
			}
		}
	} catch (problem) {
		toast.error('保存失败', {
			id: toastId,
			description: problem instanceof Error ? problem.message : String(problem)
		});
	} finally {
		saving.value = false;
	}
}
</script>

<template>
  <div class="flex h-full flex-col">
    <header class="flex flex-wrap items-center gap-2 border-b px-3 py-2">
      <Button variant="ghost" size="sm" @click="emit('close')">
        <ArrowLeftIcon data-icon="inline-start" />
        列表
      </Button>
      <Separator orientation="vertical" class="h-5!" />
      <div class="flex items-baseline gap-2">
        <span class="font-mono text-sm">{{ stem }}</span>
        <span class="text-muted-foreground text-sm">{{ title }}</span>
      </div>
      <Badge :variant="dirty ? 'destructive' : 'secondary'">{{ statusLabel }}</Badge>

      <div class="ml-auto flex items-center gap-3">
        <FormField orientation="horizontal" class="w-auto gap-2">
          <Checkbox id="auto-build" :model-value="autoBuild" @update:model-value="autoBuild = $event === true" />
          <FieldLabel for="auto-build" class="text-muted-foreground text-xs font-normal">保存后重建站点</FieldLabel>
        </FormField>
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          :model-value="mode"
          @update:model-value="$event && (mode = $event as typeof mode)"
        >
          <ToggleGroupItem value="edit">
            <SquarePenIcon data-icon="inline-start" />
            编辑
          </ToggleGroupItem>
          <ToggleGroupItem value="source">
            <PenLineIcon data-icon="inline-start" />
            源码
          </ToggleGroupItem>
          <ToggleGroupItem value="preview">
            <EyeIcon data-icon="inline-start" />
            预览
          </ToggleGroupItem>
        </ToggleGroup>
        <Button :disabled="saving" @click="save">
          <Spinner v-if="saving" data-icon="inline-start" />
          <SaveIcon v-else data-icon="inline-start" />
          保存
        </Button>
      </div>
    </header>

    <FrontmatterForm
      :frontmatter="frontmatter"
      :oss-dir="ossDir"
      @update:frontmatter="frontmatter = $event"
      @update:oss-dir="ossDir = $event"
    />

    <Toolbar v-if="editor" :editor="editor" :revision="revision" @action="onAction" />

    <div class="flex min-h-0 flex-1">
      <div
        v-show="mode === 'edit'"
        class="min-h-0 flex-1 overflow-y-auto px-6 py-4"
        @drop.prevent="onDrop"
        @dragover.prevent
        @paste="onPaste"
      >
        <EditorContent :editor="editor" class="prose-lg" />
      </div>

      <pre
        v-if="mode === 'source'"
        class="min-h-0 flex-1 overflow-y-auto border-l p-4 text-xs leading-relaxed whitespace-pre-wrap"
      >{{ markdown }}</pre>
      <div v-else-if="mode === 'preview'" class="prose-lg min-h-0 flex-1 overflow-y-auto border-l p-4" v-html="html" />
    </div>

    <footer class="flex flex-wrap items-center gap-2 border-t px-3 py-2">
      <span class="text-muted-foreground text-xs">{{ words }} 字</span>
      <span v-if="staged.length" class="text-muted-foreground text-xs">{{ staged.length }} 张图片待上传</span>
      <Badge v-for="item in staged" :key="item.name" variant="secondary" class="gap-1.5 pr-1 pl-1">
        <img :src="item.url" alt="" class="size-4 rounded object-cover" />
        <span class="font-mono">{{ item.name }}</span>
        <button
          type="button"
          class="text-muted-foreground hover:text-destructive"
          :aria-label="`删除暂存图片 ${item.name}`"
          @click="removeStaged(item.name)"
        >
          <XIcon class="size-3" />
        </button>
      </Badge>

      <span class="ml-auto flex items-center gap-2">
        <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onPickFiles" />
        <Button variant="outline" size="sm" @click="fileInput?.click()">
          <SquarePenIcon data-icon="inline-start" />
          选择图片
        </Button>
      </span>
    </footer>

    <FormDialog
      v-model:open="dialog.open"
      :title="dialog.title"
      :description="dialog.description"
      :fields="dialog.fields"
      :initial="dialog.initial"
      @submit="dialog.onSubmit"
    />
  </div>
</template>
