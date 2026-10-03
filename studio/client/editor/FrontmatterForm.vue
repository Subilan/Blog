<script setup lang="ts">
import type { FrontMatter } from '@/studio/client/api';
import { Card, CardContent } from '@/studio/client/components/ui/card';
import { Checkbox } from '@/studio/client/components/ui/checkbox';
import { Field, FieldDescription, FieldGroup, FieldLabel } from '@/studio/client/components/ui/field';
import { Input } from '@/studio/client/components/ui/input';

const props = defineProps<{ frontmatter: FrontMatter; ossDir: string }>();
const emit = defineEmits<{ 'update:frontmatter': [value: FrontMatter]; 'update:ossDir': [value: string] }>();

const text = (event: Event) => (event.target as HTMLInputElement).value;

function set(key: keyof FrontMatter, value: unknown) {
	// date 是必填，空字符串也不能从 frontmatter 里删掉
	const cleaned = key === 'date' ? String(value ?? '') : value === '' || value === false ? undefined : value;
	emit('update:frontmatter', { ...props.frontmatter, [key]: cleaned });
}
</script>

<template>
  <Card class="rounded-none border-x-0 border-t-0 py-3 ring-0" size="sm">
    <CardContent>
      <FieldGroup class="grid gap-3 md:grid-cols-3">
        <Field>
          <FieldLabel for="fm-date">日期</FieldLabel>
          <Input id="fm-date" :model-value="frontmatter.date" placeholder="2026/01/01" @input="set('date', text($event))" />
        </Field>
        <Field>
          <FieldLabel for="fm-cate">分类</FieldLabel>
          <Input id="fm-cate" :model-value="frontmatter.cate" placeholder="记录 / 代码 / 杂谈…" @input="set('cate', text($event))" />
        </Field>
        <Field>
          <FieldLabel for="fm-oss">图片目录</FieldLabel>
          <Input
            id="fm-oss"
            :model-value="ossDir"
            placeholder="slug"
            class="font-mono"
            @input="$emit('update:ossDir', text($event))"
          />
          <FieldDescription>OSS 前缀，新图会传到这里</FieldDescription>
        </Field>
        <Field class="md:col-span-2">
          <FieldLabel for="fm-desc">摘要</FieldLabel>
          <Input id="fm-desc" :model-value="frontmatter.desc" @input="set('desc', text($event))" />
        </Field>
        <Field>
          <FieldLabel for="fm-desc-short">短摘要</FieldLabel>
          <Input
            id="fm-desc-short"
            :model-value="frontmatter['desc-short']"
            placeholder="列表页小字"
            @input="set('desc-short', text($event))"
          />
        </Field>
        <Field orientation="horizontal">
          <Checkbox id="fm-hidden" :model-value="!!frontmatter.hidden" @update:model-value="set('hidden', $event === true)" />
          <FieldLabel for="fm-hidden">隐藏（不生成页面）</FieldLabel>
        </Field>
        <Field orientation="horizontal">
          <Checkbox
            id="fm-outdate"
            :model-value="!!frontmatter.ignoreOutdate"
            @update:model-value="set('ignoreOutdate', $event === true)"
          />
          <FieldLabel for="fm-outdate">不显示「文章较旧」提示</FieldLabel>
        </Field>
      </FieldGroup>
    </CardContent>
  </Card>
</template>
