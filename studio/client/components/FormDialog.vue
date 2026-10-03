<script setup lang="ts">
/**
 * 后台里所有小表单共用的对话框：链接、公式、代码语言、高亮块、新建/重命名…
 * 字段用 FieldGroup + Field 排布，输入控件按 type 走 Input / Textarea / Select / Checkbox。
 */
import { computed, ref, watch } from 'vue';
import { Button } from '@/studio/client/components/ui/button';
import { Checkbox } from '@/studio/client/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/studio/client/components/ui/dialog';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/studio/client/components/ui/field';
import { Input } from '@/studio/client/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/studio/client/components/ui/select';
import { Textarea } from '@/studio/client/components/ui/textarea';

export type FieldValue = string | boolean;
export type FieldOption = { value: string; label: string };
export type FormFieldSpec = {
	key: string;
	label: string;
	type?: 'text' | 'textarea' | 'select' | 'checkbox';
	options?: (FieldOption | string)[];
	placeholder?: string;
	rows?: number;
	help?: string;
	disabled?: boolean;
};

const props = withDefaults(
	defineProps<{
		open: boolean;
		title: string;
		description?: string;
		fields: FormFieldSpec[];
		initial?: Record<string, FieldValue>;
		confirmText?: string;
		confirmVariant?: 'default' | 'destructive';
	}>(),
	{ confirmText: '确定', confirmVariant: 'default' }
);

const emit = defineEmits<{
	'update:open': [value: boolean];
	submit: [values: Record<string, FieldValue>];
}>();

const values = ref<Record<string, FieldValue>>({});
const error = ref('');

function reset() {
	const next: Record<string, FieldValue> = {};
	for (const field of props.fields) {
		next[field.key] = props.initial?.[field.key] ?? (field.type === 'checkbox' ? false : '');
	}
	values.value = next;
	error.value = '';
}

watch(() => [props.open, props.fields, props.initial] as const, reset, { immediate: true });

const options = (field: FormFieldSpec): FieldOption[] =>
	(field.options ?? []).map(option => (typeof option === 'string' ? { value: option, label: option } : option));

const hasError = computed(() => !!error.value);

function fieldId(key: string) {
	return `field-${key}`;
}

function submit() {
	error.value = '';
	try {
		emit('submit', { ...values.value });
		// 提交后由调用方负责后续（异步失败用 toast 报），这里直接关掉
		emit('update:open', false);
	} catch (problem) {
		error.value = problem instanceof Error ? problem.message : String(problem);
	}
}

defineExpose({ setError: (message: string) => (error.value = message) });
</script>

<template>
  <Dialog :open="open" @update:open="emit('update:open', $event)">
    <DialogContent class="sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>{{ title }}</DialogTitle>
        <DialogDescription v-if="description">{{ description }}</DialogDescription>
      </DialogHeader>

      <form class="contents" @submit.prevent="submit">
        <FieldGroup class="gap-4">
          <Field
            v-for="field in fields"
            :key="field.key"
            :orientation="field.type === 'checkbox' ? 'horizontal' : 'vertical'"
            :data-invalid="hasError || undefined"
          >
            <template v-if="field.type === 'checkbox'">
              <Checkbox
                :id="fieldId(field.key)"
                :data-field="field.key"
                :model-value="!!values[field.key]"
                @update:model-value="values[field.key] = $event === true"
              />
              <FieldLabel :for="fieldId(field.key)">{{ field.label }}</FieldLabel>
            </template>

            <template v-else>
              <FieldLabel :for="fieldId(field.key)">{{ field.label }}</FieldLabel>
              <Textarea
                v-if="field.type === 'textarea'"
                :id="fieldId(field.key)"
                :data-field="field.key"
                v-model="values[field.key]"
                :rows="field.rows ?? 4"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
                aria-invalid="hasError || undefined"
                class="font-mono text-xs"
              />
              <Select
                v-else-if="field.type === 'select'"
                :model-value="values[field.key]"
                @update:model-value="values[field.key] = $event"
              >
                <SelectTrigger :id="fieldId(field.key)" :data-field="field.key" class="w-full">
                  <SelectValue :placeholder="field.placeholder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem v-for="option in options(field)" :key="option.value" :value="option.value">
                      {{ option.label }}
                    </SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              <Input
                v-else
                :id="fieldId(field.key)"
                :data-field="field.key"
                v-model="values[field.key]"
                :placeholder="field.placeholder"
                :disabled="field.disabled"
                aria-invalid="hasError || undefined"
              />
            </template>

            <FieldDescription v-if="field.help">{{ field.help }}</FieldDescription>
          </Field>
          <FieldError v-if="error">{{ error }}</FieldError>
        </FieldGroup>

        <DialogFooter>
          <Button type="button" variant="outline" @click="emit('update:open', false)">取消</Button>
          <Button type="submit" :variant="confirmVariant">{{ confirmText }}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
</template>
