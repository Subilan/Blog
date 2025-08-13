<template>
    <div class="icon-btn topleft noprint" @click="goBack">
        <icon :path="mdiArrowLeft" />
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