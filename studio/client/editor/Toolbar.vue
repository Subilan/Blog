<script setup lang="ts">
import { computed } from 'vue';
import type { Editor } from '@tiptap/core';
import {
	AsteriskIcon,
	BoldIcon,
	CodeIcon,
	CodeXmlIcon,
	InfoIcon,
	ItalicIcon,
	ImageIcon,
	LinkIcon,
	ListIcon,
	ListOrderedIcon,
	MinusIcon,
	MoreHorizontalIcon,
	OctagonAlertIcon,
	QuoteIcon,
	Redo2Icon,
	SigmaIcon,
	SquareCodeIcon,
	StrikethroughIcon,
	TableIcon,
	TriangleAlertIcon,
	Undo2Icon
} from '@lucide/vue';
import { Button } from '@/studio/client/components/ui/button';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/studio/client/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/studio/client/components/ui/select';
import { Separator } from '@/studio/client/components/ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/studio/client/components/ui/tooltip';
import { CALLOUT_LABELS, CALLOUT_NAMES } from '@/studio/client/editor/schema';

const props = defineProps<{ editor: Editor | null; revision: number }>();
const emit = defineEmits<{ action: [name: string, payload?: string] }>();

// revision 只是为了在选区变化时重新求值（editor.isActive 不会自己触发重渲染）
const active = (name: string, attributes?: Record<string, unknown>) => {
	void props.revision;
	return props.editor?.isActive(name, attributes) ?? false;
};

const blockType = computed(() => {
	void props.revision;
	const editor = props.editor;
	if (!editor) return 'paragraph';
	for (const level of [1, 2, 3, 4]) if (editor.isActive('heading', { level })) return String(level);
	return 'paragraph';
});

const HEADING_OPTIONS = [
	{ value: 'paragraph', label: '正文' },
	{ value: '1', label: '标题 1' },
	{ value: '2', label: '标题 2' },
	{ value: '3', label: '标题 3' },
	{ value: '4', label: '标题 4' }
];

const CALLOUT_ICONS = { tip: InfoIcon, warning: TriangleAlertIcon, danger: OctagonAlertIcon, note: AsteriskIcon };

function command(name: string, payload?: unknown) {
	const editor = props.editor;
	if (!editor) return;
	(editor.chain().focus() as any)[name](payload).run();
}

function setBlock(value: string) {
	const editor = props.editor;
	if (!editor) return;
	if (value === 'paragraph') editor.chain().focus().setParagraph().run();
	else editor.chain().focus().toggleHeading({ level: Number(value) as 1 | 2 | 3 | 4 }).run();
}
</script>

<template>
  <div class="flex flex-wrap items-center gap-1 border-b px-2 py-1.5">
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          :class="active('bold') && 'bg-secondary'"
          @mousedown.prevent
          @click="command('toggleBold')"
        >
          <BoldIcon />
          <span class="sr-only">加粗</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>加粗 Cmd+B</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          :class="active('italic') && 'bg-secondary'"
          @mousedown.prevent
          @click="command('toggleItalic')"
        >
          <ItalicIcon />
          <span class="sr-only">斜体</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>斜体 Cmd+I</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          :class="active('strike') && 'bg-secondary'"
          @mousedown.prevent
          @click="command('toggleStrike')"
        >
          <StrikethroughIcon />
          <span class="sr-only">删除线</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>删除线</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          :class="active('code') && 'bg-secondary'"
          @mousedown.prevent
          @click="command('toggleCode')"
        >
          <CodeIcon />
          <span class="sr-only">行内代码</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>行内代码</TooltipContent>
    </Tooltip>

    <Separator orientation="vertical" class="mx-1 h-5!" />

    <Select :model-value="blockType" @update:model-value="setBlock($event as string)">
      <SelectTrigger size="sm" class="w-24" @mousedown.prevent>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectItem v-for="option in HEADING_OPTIONS" :key="option.value" :value="option.value">
            {{ option.label }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <Separator orientation="vertical" class="mx-1 h-5!" />

    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          :class="active('bulletList') && 'bg-secondary'"
          @mousedown.prevent
          @click="command('toggleBulletList')"
        >
          <ListIcon />
          <span class="sr-only">无序列表</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>无序列表</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          :class="active('orderedList') && 'bg-secondary'"
          @mousedown.prevent
          @click="command('toggleOrderedList')"
        >
          <ListOrderedIcon />
          <span class="sr-only">有序列表</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>有序列表</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          :class="active('blockquote') && 'bg-secondary'"
          @mousedown.prevent
          @click="command('toggleBlockquote')"
        >
          <QuoteIcon />
          <span class="sr-only">引用</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>引用</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" :class="active('codeBlock') && 'bg-secondary'" @mousedown.prevent @click="emit('action', 'code-block')">
          <SquareCodeIcon />
          <span class="sr-only">代码块</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>代码块</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @mousedown.prevent @click="command('setHorizontalRule')">
          <MinusIcon />
          <span class="sr-only">分割线</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>分割线</TooltipContent>
    </Tooltip>

    <Separator orientation="vertical" class="mx-1 h-5!" />

    <Tooltip>
      <TooltipTrigger as-child>
        <Button
          variant="ghost"
          size="icon-sm"
          :class="active('link') && 'bg-secondary'"
          @mousedown.prevent
          @click="emit('action', 'link')"
        >
          <LinkIcon />
          <span class="sr-only">链接</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>链接</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @mousedown.prevent @click="emit('action', 'image')">
          <ImageIcon />
          <span class="sr-only">图片</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>插入图片</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @mousedown.prevent @click="emit('action', 'table')">
          <TableIcon />
          <span class="sr-only">表格</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>插入 3×3 表格</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @mousedown.prevent @click="emit('action', 'math-inline')">
          <SigmaIcon />
          <span class="sr-only">行内公式</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>行内公式</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @mousedown.prevent @click="emit('action', 'math-block')">
          <SigmaIcon class="scale-y-125" />
          <span class="sr-only">公式块</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>公式块</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @mousedown.prevent @click="emit('action', 'footnote')">
          <AsteriskIcon />
          <span class="sr-only">脚注</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>插入脚注</TooltipContent>
    </Tooltip>

    <Separator orientation="vertical" class="mx-1 h-5!" />

    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="sm" @mousedown.prevent>
          <MoreHorizontalIcon data-icon="inline-start" />
          高亮块
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem v-for="name in CALLOUT_NAMES" :key="name" @select="emit('action', 'callout', name)">
          <component :is="CALLOUT_ICONS[name as keyof typeof CALLOUT_ICONS]" />
          {{ CALLOUT_LABELS[name] }}（{{ name }}）
        </DropdownMenuItem>
        <DropdownMenuItem @select="emit('action', 'callout-custom')">
          <CodeXmlIcon />
          其它 :::名称
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @mousedown.prevent @click="emit('action', 'raw')">
          <CodeXmlIcon />
          <span class="sr-only">原始 HTML 块</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>原始 HTML 块</TooltipContent>
    </Tooltip>

    <Separator orientation="vertical" class="mx-1 h-5!" />

    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @mousedown.prevent @click="command('undo')">
          <Undo2Icon />
          <span class="sr-only">撤销</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>撤销</TooltipContent>
    </Tooltip>
    <Tooltip>
      <TooltipTrigger as-child>
        <Button variant="ghost" size="icon-sm" @mousedown.prevent @click="command('redo')">
          <Redo2Icon />
          <span class="sr-only">重做</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>重做</TooltipContent>
    </Tooltip>

    <span class="ml-auto flex items-center gap-2">
      <slot name="extra" />
    </span>
  </div>
</template>
