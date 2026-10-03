<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { FileTextIcon, MoreHorizontalIcon, PencilIcon, PlusIcon, SearchIcon, Trash2Icon } from '@lucide/vue';
import { toast } from 'vue-sonner';
import { api, type PostSummary } from '@/studio/client/api';
import FormDialog, { type FormFieldSpec, type FieldValue } from '@/studio/client/components/FormDialog.vue';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/studio/client/components/ui/alert-dialog';
import { Badge } from '@/studio/client/components/ui/badge';
import { Button } from '@/studio/client/components/ui/button';
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/studio/client/components/ui/card';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger
} from '@/studio/client/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/studio/client/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/studio/client/components/ui/input-group';
import { Skeleton } from '@/studio/client/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/studio/client/components/ui/table';
import { formatTime, today } from '@/studio/client/utils';

const emit = defineEmits<{ open: [stem: string] }>();

const posts = ref<PostSummary[]>([]);
const loading = ref(true);
const filter = ref('');

const dialog = ref<{ open: boolean; title: string; fields: FormFieldSpec[]; initial: Record<string, FieldValue>; onSubmit: (values: Record<string, FieldValue>) => void }>(
	{ open: false, title: '', fields: [], initial: {}, onSubmit: () => {} }
);
const pendingDelete = ref<PostSummary | null>(null);

const filtered = computed(() => {
	const needle = filter.value.trim().toLowerCase();
	if (!needle) return posts.value;
	return posts.value.filter(post => `${post.title} ${post.stem} ${post.cate}`.toLowerCase().includes(needle));
});

async function refresh() {
	loading.value = true;
	try {
		posts.value = await api.listPosts();
	} catch (problem) {
		toast.error(problem instanceof Error ? problem.message : String(problem));
	} finally {
		loading.value = false;
	}
}

onMounted(refresh);

function openDialog(config: typeof dialog.value) {
	dialog.value = { ...config, open: true };
}

function create() {
	openDialog({
		open: true,
		title: '新建文章',
		fields: [
			{ key: 'file', label: '文件名', placeholder: 'My-New-Post', help: '不含 .md，会直接作为 URL' },
			{ key: 'title', label: '标题', placeholder: '我的新文章', help: '写进正文的一级标题' },
			{ key: 'date', label: '日期', placeholder: '2026/01/01' },
			{ key: 'cate', label: '分类', placeholder: '可空' },
			{ key: 'desc', label: '摘要', placeholder: '可空' }
		],
		initial: { date: today() },
		onSubmit: async values => {
			try {
				const created = await api.createPost(values as any);
				await refresh();
				emit('open', created.stem);
			} catch (problem) {
				toast.error(problem instanceof Error ? problem.message : String(problem));
			}
		}
	});
}

function rename(post: PostSummary) {
	openDialog({
		open: true,
		title: `重命名 ${post.stem}`,
		description: '文件名决定文章 URL，通常也要同步改 OSS 图片目录',
		fields: [{ key: 'to', label: '新文件名' }],
		initial: { to: post.stem },
		onSubmit: async values => {
			try {
				await api.renamePost(post.stem, String(values.to));
				await refresh();
				toast.success(`已重命名为 ${values.to}`);
			} catch (problem) {
				toast.error(problem instanceof Error ? problem.message : String(problem));
			}
		}
	});
}

async function remove() {
	const post = pendingDelete.value;
	if (!post) return;
	try {
		await api.deletePost(post.stem);
		pendingDelete.value = null;
		await refresh();
		toast.success(`已删除 ${post.stem}.md`);
	} catch (problem) {
		toast.error(problem instanceof Error ? problem.message : String(problem));
	}
}
</script>

<template>
  <div class="mx-auto max-w-6xl p-6">
    <Card>
      <CardHeader class="border-b">
        <CardTitle>文章</CardTitle>
        <CardDescription>共 {{ posts.length }} 篇，直接改 data/posts 下的 Markdown</CardDescription>
        <CardAction class="flex items-center gap-2">
          <InputGroup class="w-64">
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
            <InputGroupInput v-model="filter" placeholder="搜索标题 / 文件名" />
          </InputGroup>
          <Button @click="create">
            <PlusIcon data-icon="inline-start" />
            新建
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>标题</TableHead>
              <TableHead class="w-28">日期</TableHead>
              <TableHead class="w-20">分类</TableHead>
              <TableHead class="w-20 text-right">字数</TableHead>
              <TableHead class="w-36 text-right">修改时间</TableHead>
              <TableHead class="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            <template v-if="loading">
              <TableRow v-for="index in 5" :key="`skeleton-${index}`">
                <TableCell :colspan="6"><Skeleton class="h-6 w-full" /></TableCell>
              </TableRow>
            </template>
            <TableRow v-else-if="!filtered.length">
              <TableCell :colspan="6">
                <Empty>
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><FileTextIcon /></EmptyMedia>
                    <EmptyTitle>{{ filter ? '没有匹配的文章' : '还没有文章' }}</EmptyTitle>
                    <EmptyDescription v-if="filter">换个关键词试试。</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              </TableCell>
            </TableRow>
            <TableRow v-for="post in filtered" v-else :key="post.stem">
              <TableCell>
                <div class="flex items-center gap-2">
                  <Button variant="link" size="sm" class="h-auto px-0" @click="emit('open', post.stem)">
                    {{ post.title || '(无标题)' }}
                  </Button>
                  <Badge v-if="post.hidden" variant="secondary">隐藏</Badge>
                </div>
                <div class="text-muted-foreground font-mono text-xs">{{ post.stem }}</div>
              </TableCell>
              <TableCell class="text-muted-foreground">{{ post.date }}</TableCell>
              <TableCell class="text-muted-foreground">{{ post.cate }}</TableCell>
              <TableCell class="text-muted-foreground text-right">{{ post.words }}</TableCell>
              <TableCell class="text-muted-foreground text-right">{{ formatTime(post.mtime) }}</TableCell>
              <TableCell class="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontalIcon />
                      <span class="sr-only">更多操作</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem @select="emit('open', post.stem)">
                      <PencilIcon />
                      编辑
                    </DropdownMenuItem>
                    <DropdownMenuItem @select="rename(post)">
                      <FileTextIcon />
                      重命名
                    </DropdownMenuItem>
                    <DropdownMenuItem variant="destructive" @select="pendingDelete = post">
                      <Trash2Icon />
                      删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>

    <FormDialog
      v-model:open="dialog.open"
      :title="dialog.title"
      :fields="dialog.fields"
      :initial="dialog.initial"
      @submit="dialog.onSubmit"
    />

    <AlertDialog :open="!!pendingDelete" @update:open="pendingDelete = null">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>删除 {{ pendingDelete?.stem }}.md？</AlertDialogTitle>
          <AlertDialogDescription>
            这一步不可撤销，OSS 上的图片不会一起删。想连图一起清理的话，去图片资源里删对应目录。
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction variant="destructive" @click="remove">删除</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>
