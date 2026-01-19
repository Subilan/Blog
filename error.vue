<template>
    <div class="flex w-full h-dvh items-center justify-center">
        <div class="p-5 rounded-lg flex flex-col gap-10 items-center">
            <div class="flex flex-col gap-2 items-center">
                <h1 class="text-5xl">{{ error.statusCode }}</h1>
                <p class="text-lg text-neutral-500">{{ error.message }}</p>
            </div>
            <div class="actions right mobile-center">
                <button
                    class="flex p-2 cursor-pointer hover:bg-neutral-100 active:bg-neutral-200 items-center gap-2 border rounded-lg border-neutral-200"
                    @click="handleError">
                    <icon :path="mdiArrowLeft" />回到主页
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { mdiArrowLeft } from '@mdi/js';

const props = defineProps(['error'])

const handleError = () => clearError({ redirect: '/' })
</script>