<template>
    <div class="icon-btn topleft noprint" @click="useRouter().go(-1)">
        <icon :path="mdiArrowLeft" />
    </div>
</template>

<script setup lang="ts">
import { mdiArrowLeft } from '@mdi/js';
</script>