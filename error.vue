<template>
    <div class="error-container">
        <div class="inner card">
            <p class="title"><strong>维护界面: {{ error.statusCode }}</strong> — {{ error.message.split('Require stack')[0]
                }}</p>
            <p v-if="error.statusCode === 404">
                此页面不存在，请检查 URL 拼写是否正确。
            </p>
            <p v-if="error.statusCode === 500">
                服务端此时无法正确处理请求，这可能是因为程序的内部错误。
            </p>
            <div class="actions right mobile-center">
                <button class="button" @click="handleError">
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