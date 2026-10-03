<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
	ChevronsUpDownIcon,
	CopyIcon,
	FolderOpenIcon,
	ImagePlusIcon,
	MoreHorizontalIcon,
	RefreshCwIcon,
	ShieldCheckIcon,
	Trash2Icon,
	WandSparklesIcon
} from '@lucide/vue';
import { toast } from 'vue-sonner';
import { api, type MediaIndex, type MediaItem } from '@/studio/client/api';
import FormDialog, { type FormFieldSpec, type FieldValue } from '@/studio/client/components/FormDialog.vue';
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle
} from '@/studio/client/components/ui/alert';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/studio/client/components/ui/alert-dialog';
import { Badge } from '@/studio/client/components/ui/badge';
import { Button } from '@/studio/client/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/studio/client/components/ui/card';
import {
	Combobox,
	ComboboxAnchor,
	ComboboxEmpty,
	ComboboxGroup,
	ComboboxInput,
	ComboboxItem,
	ComboboxList,
	ComboboxTrigger
} from '@/studio/client/components/ui/combobox';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/studio/client/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/studio/client/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/studio/client/components/ui/empty';
import { Field, FieldGroup, FieldLabel } from '@/studio/client/components/ui/field';
import { Skeleton } from '@/studio/client/components/ui/skeleton';
import { Spinner } from '@/studio/client/components/ui/spinner';
import { baseOf, dirOf, formatBytes } from '@/studio/client/utils';

const data = ref<MediaIndex>({ items: [], references: [], missing: [] });
const targetDir = ref('');
const busy = ref(false);
const fileInput = ref<HTMLInputElement | null>(null);
const pendingDelete = ref<MediaItem | null>(null);
const normalizePlan = ref<{ from: string; to: string; posts: string[] }[] | null>(null);
const normalizeDir = ref('');
const applying = ref(false);

const dialog = ref<{
	open: boolean;
	title: string;
	description?: string;
	fields: FormFieldSpec[];
	initial: Record<string, FieldValue>;
	onSubmit: (values: Record<string, FieldValue>) => void;
}>({ open: false, title: '', fields: [], initial: {}, onSubmit: () => {} });

const totalSize = computed(() => data.value.items.reduce((sum, item) => sum + item.size, 0));
const unreferenced = computed(() => data.value.items.filter(item => !item.posts.length));
const dirNames = computed(() => [...new Set(data.value.items.map(item => dirOf(item.key)))].sort());

const groups = computed(() => {
	const map = new Map<string, { dir: string; items: MediaItem[]; size: number; referenced: number }>();
	for (const item of data.value.items) {
		const dir = dirOf(item.key);
		if (!map.has(dir)) map.set(dir, { dir, items: [], size: 0, referenced: 0 });
		const group = map.get(dir)!;
		group.items.push(item);
		group.size += item.size;
		if (item.posts.length) group.referenced++;
	}
	return [...map.values()].sort((a, b) => b.size - a.size);
});

async function refresh() {
	busy.value = true;
	try {
		data.value = await api.media();
		if (!targetDir.value) targetDir.value = groups.value[0]?.dir ?? '';
	} catch (problem) {
		toast.error(problem instanceof Error ? problem.message : String(problem));
	} finally {
		busy.value = false;
	}
}

onMounted(refresh);

async function run(task: () => Promise<{ title: string; description?: string } | void>) {
	busy.value = true;
	try {
		const result = await task();
		if (result) toast.success(result.title, { description: result.description });
		await refresh();
	} catch (problem) {
		toast.error(problem instanceof Error ? problem.message : String(problem));
	} finally {
		busy.value = false;
	}
}

async function onPick(event: Event) {
	const input = event.target as HTMLInputElement;
	const files = [...(input.files ?? [])];
	input.value = '';
	if (!files.length) return;
	if (!targetDir.value.trim()) {
		toast.error('先选一个上传目录');
		return;
	}
	await run(async () => {
		const lines: { title: string; description: string }[] = [];
		for (const file of files) {
			const result = await api.uploadMedia(targetDir.value.trim(), file);
			lines.push({ title: result.key, description: `${formatBytes(result.before)} → ${formatBytes(result.after)}（${result.label}）` });
		}
		return { title: `${lines.length} 个对象已上传`, description: lines.map(line => `${line.title}：${line.description}`).join('\n') };
	});
}

function rename(item: MediaItem) {
	const dir = dirOf(item.key);
	const current = baseOf(item.key);
	dialog.value = {
		open: true,
		title: '重命名对象',
		description: '会同步改写所有文章里的引用',
		fields: [
			{ key: 'to', label: '新文件名', help: '只用安全形式，扩展名别乱改' },
			{ key: 'rewrite', label: '同时改写文章引用', type: 'checkbox' }
		],
		initial: { to: current, rewrite: true },
		onSubmit: values =>
			void run(async () => {
				const result = await api.renameMedia(dir, [{ from: current, to: String(values.to) }], values.rewrite !== false);
				return { title: `${current} → ${values.to}`, description: result.changedPosts.join('、') || undefined };
			})
	};
}

function normalize(dir: string) {
	void run(async () => {
		const { moves } = await api.normalizeMedia(dir);
		if (!moves.length) return { title: `${dir} 下的文件名都已经是安全形式` };
		normalizeDir.value = dir;
		normalizePlan.value = moves;
	});
}

async function applyNormalize() {
	const dir = normalizeDir.value;
	const moves = normalizePlan.value ?? [];
	applying.value = true;
	try {
		const result = await api.renameMedia(dir, moves.map(({ from, to }) => ({ from, to })), true);
		normalizePlan.value = null;
		toast.success(`已规范 ${moves.length} 个文件名`, { description: result.changedPosts.join('、') || undefined });
		await refresh();
	} catch (problem) {
		toast.error(problem instanceof Error ? problem.message : String(problem));
	} finally {
		applying.value = false;
	}
}

async function remove(items: MediaItem[]) {
	if (!items.length) return;
	await run(async () => {
		await api.deleteMedia(items.map(item => item.key));
		return { title: `已删除 ${items.length} 个对象` };
	});
}

async function check() {
	await run(async () => {
		const result = await api.checkMedia();
		if (result.missing.length) {
			throw new Error(`${result.total} 个引用里有 ${result.missing.length} 个取不到：\n${result.missing.join('\n')}`);
		}
		return {
			title: `${result.total} 个引用全部可访问`,
			description: result.stale.length ? `其中 ${result.stale.length} 个目录名还带 -img 后缀` : undefined
		};
	});
}

async function copy(item: MediaItem) {
	await navigator.clipboard.writeText(`oss://${item.decoded}`);
	toast.success(`已复制 oss://${item.decoded}`);
}
</script>

<template>
  <div class="mx-auto max-w-7xl p-6">
    <Card>
      <CardHeader class="border-b">
        <CardTitle>图片资源</CardTitle>
        <CardDescription>
          共 {{ data.items.length }} 个对象 · {{ formatBytes(totalSize) }} · 未引用 {{ unreferenced.length }} 个
        </CardDescription>
        <CardAction class="flex items-center gap-2">
          <Button variant="outline" :disabled="busy" @click="check">
            <ShieldCheckIcon data-icon="inline-start" />
            检查引用
          </Button>
          <Button variant="outline" :disabled="busy" @click="refresh">
            <RefreshCwIcon data-icon="inline-start" />
            刷新
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent class="flex flex-col gap-4">
        <FieldGroup class="gap-3">
          <Field orientation="responsive" class="gap-2">
            <FieldLabel for="upload-dir" class="text-muted-foreground text-xs">上传到目录</FieldLabel>
            <Combobox v-model="targetDir">
              <ComboboxAnchor as-child>
                <ComboboxTrigger as-child>
                  <Button variant="outline" class="w-64 justify-between font-mono">
                    {{ targetDir || '选择或输入目录' }}
                    <ChevronsUpDownIcon class="opacity-50" />
                  </Button>
                </ComboboxTrigger>
              </ComboboxAnchor>
              <ComboboxList>
                <ComboboxInput placeholder="筛选，或直接输入新目录名" />
                <ComboboxEmpty>没有匹配的目录，回车即用当前输入</ComboboxEmpty>
                <ComboboxGroup>
                  <ComboboxItem v-for="dir in dirNames" :key="dir" :value="dir">{{ dir }}</ComboboxItem>
                </ComboboxGroup>
              </ComboboxList>
            </Combobox>
            <input ref="fileInput" type="file" accept="image/*" multiple class="hidden" @change="onPick" />
            <Button :disabled="busy" @click="fileInput?.click()">
              <ImagePlusIcon data-icon="inline-start" />
              选择图片上传
            </Button>
            <span class="text-muted-foreground text-xs">上传前按同一套规则压缩：mozjpeg q80 / 长边 2048 / PNG 调色板</span>
          </Field>
        </FieldGroup>

        <Alert v-if="unreferenced.length">
          <WandSparklesIcon />
          <AlertTitle>没有任何文章引用的对象 {{ unreferenced.length }} 个</AlertTitle>
          <AlertDescription>
            共 {{ formatBytes(unreferenced.reduce((sum, item) => sum + item.size, 0)) }}，删除前建议先用
            <span class="font-mono">yarn oss stats</span> 复核一遍。
          </AlertDescription>
          <AlertAction>
            <AlertDialog>
              <AlertDialogTrigger as-child>
                <Button variant="destructive" size="sm" :disabled="busy">全部删除</Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>删除 {{ unreferenced.length }} 个未引用对象？</AlertDialogTitle>
                  <AlertDialogDescription>
                    对象会从 OSS 上真实删除，无法撤销。确认这些图确实没有任何文章在用。
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>取消</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" @click="remove(unreferenced)">删除</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </AlertAction>
        </Alert>

        <Alert v-if="data.missing.length" variant="destructive">
          <Trash2Icon />
          <AlertTitle>{{ data.missing.length }} 个引用在 OSS 上找不到</AlertTitle>
          <AlertDescription>
            <ul class="flex flex-col gap-1">
              <li v-for="item in data.missing" :key="item.key">
                <span class="font-mono">{{ item.key }}</span>
                <span class="text-muted-foreground"> ← {{ item.posts.join('、') }}</span>
              </li>
            </ul>
          </AlertDescription>
        </Alert>

        <template v-if="busy && !data.items.length">
          <Skeleton class="h-64 w-full" />
        </template>
        <Empty v-else-if="!data.items.length">
          <EmptyHeader>
            <EmptyMedia variant="icon"><FolderOpenIcon /></EmptyMedia>
            <EmptyTitle>OSS 上还没有对象</EmptyTitle>
            <EmptyDescription>先选一个目录，然后上传图片试试。</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </CardContent>
    </Card>

    <Card v-for="group in groups" :key="group.dir" class="mt-4">
      <CardHeader class="border-b">
        <CardTitle class="font-mono">{{ group.dir }}</CardTitle>
        <CardDescription>
          {{ group.items.length }} 个 · {{ formatBytes(group.size) }} · 引用 {{ group.referenced }} · 未引用
          {{ group.items.length - group.referenced }}
        </CardDescription>
        <CardAction class="flex items-center gap-2">
          <Button variant="outline" size="sm" :disabled="busy" @click="normalize(group.dir)">
            <WandSparklesIcon data-icon="inline-start" />
            规范文件名
          </Button>
          <Button variant="ghost" size="sm" :disabled="busy" @click="targetDir = group.dir">设为上传目录</Button>
        </CardAction>
      </CardHeader>
      <CardContent class="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <figure v-for="item in group.items" :key="item.key" class="flex flex-col gap-1">
          <a
            :href="item.url"
            target="_blank"
            rel="noreferrer"
            class="bg-muted aspect-4/3 block overflow-hidden rounded-md border"
          >
            <img :src="item.url" loading="lazy" :alt="item.key" class="size-full object-cover" />
          </a>
          <figcaption class="flex items-start gap-1 text-xs">
            <div class="min-w-0 flex-1">
              <div class="truncate font-mono" :title="item.key">{{ baseOf(item.key) }}</div>
              <div class="text-muted-foreground flex items-center gap-1">
                <span>{{ formatBytes(item.size) }}</span>
                <Badge v-if="item.posts.length" variant="secondary">{{ item.posts.length }} 篇引用</Badge>
                <Badge v-else variant="destructive">未引用</Badge>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger as-child>
                <Button variant="ghost" size="icon-sm">
                  <MoreHorizontalIcon />
                  <span class="sr-only">更多操作</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem @select="copy(item)">
                  <CopyIcon />
                  复制 oss:// 引用
                </DropdownMenuItem>
                <DropdownMenuItem @select="rename(item)">
                  <FolderOpenIcon />
                  改名
                </DropdownMenuItem>
                <DropdownMenuItem variant="destructive" @select="pendingDelete = item">
                  <Trash2Icon />
                  删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </figcaption>
        </figure>
      </CardContent>
    </Card>

    <FormDialog
      v-model:open="dialog.open"
      :title="dialog.title"
      :description="dialog.description"
      :fields="dialog.fields"
      :initial="dialog.initial"
      @submit="dialog.onSubmit"
    />

    <Dialog :open="!!normalizePlan" @update:open="normalizePlan = null">
      <DialogContent class="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>规范 {{ normalizeDir }} 下的文件名</DialogTitle>
          <DialogDescription>
            中文与空格会换成安全形式（只剩中文则退化成 img-&lt;hash&gt;），并同步改写文章里的引用。
          </DialogDescription>
        </DialogHeader>
        <div class="max-h-80 overflow-y-auto rounded-md border">
          <ul class="divide-y text-xs">
            <li v-for="move in normalizePlan" :key="move.from" class="flex flex-col gap-0.5 px-3 py-2">
              <span class="font-mono">{{ move.from }} → {{ move.to }}</span>
              <span class="text-muted-foreground">被 {{ move.posts.join('、') || '（未引用）' }} 引用</span>
            </li>
          </ul>
        </div>
        <DialogFooter>
          <Button variant="outline" @click="normalizePlan = null">取消</Button>
          <Button :disabled="applying" @click="applyNormalize">
            <Spinner v-if="applying" data-icon="inline-start" />
            确认改名
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <AlertDialog :open="!!pendingDelete" @update:open="pendingDelete = null">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除 {{ pendingDelete?.key }}？</AlertDialogTitle>
          <AlertDialogDescription>
            对象会从 OSS 上真实删除。引用它的
            {{ pendingDelete?.posts.length ?? 0 }} 篇文章会变成死链。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="remove(pendingDelete ? [pendingDelete] : [])">删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
