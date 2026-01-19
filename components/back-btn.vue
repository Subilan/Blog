<template>
    <div class="fixed bg-white hidden lg:block top-10 left-10 hover:bg-neutral-50 active:bg-neutral-100 transition-all rounded-full p-2 shadow-sm cursor-pointer border border-neutral-100" @click="goBack">
        <icon class="h-[20px] w-[20px]" :path="mdiArrowLeft" />
    </div>
</template>

<script setup lang="ts">
import { mdiArrowLeft } from '@mdi/js';

const route = useRoute();
const router = useRouter();

function goBack() {
    if (route.name) {
        if (/(posts|pages)/.test(route.name.toString())) {
            router.push('/')
            return;
        }
    }

    router.go(-1);
}
</script>