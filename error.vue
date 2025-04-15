<template>
    <div class="error-container">
        <div class="inner card">
            <p class="title"><strong>维护界面: {{ error.statusCode }}</strong> — {{ error.message.split('Require stack')[0] }}</p>
            <p v-if="error.statusCode === 404">
                此页面不存在，请检查 URL 拼写是否正确。
            </p>
            <p v-if="error.statusCode === 500">
                服务端此时无法正确处理请求，这可能是因为程序的内部错误。
            </p>
            <p>
                如果这里显示的错误影响了浏览体验，欢迎随时反馈到邮箱 <a
                    href="mailto:christophersubilan@gmail.com">christophersubilan@gmail.com</a>。
            </p>
            <div class="actions right mobile-center">
                <button class="button" @click="handleError"><icon :path="mdiArrowLeft"/>回到主页</button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { mdiArrowLeft } from '@mdi/js';

    const props = defineProps(['error'])

    const handleError = () => clearError({ redirect: '/' })
</script>

<style lang="scss" scoped>
@use '@/assets/var';

.error-container {
    height: 100vh;
    width: 100vw;
    display: flex;
    align-items: center;
    justify-content: center;

    .inner {
        padding: 16px;
        width: 520px;

        @media (max-width: 768px) {
            width: 100%;
            margin: 0 32px;
        }

        a {
            color: var.$primaryColor;
        }

        h2 {
            font-size: 48px;
        }

        .title {
            color: var.$primaryTextColor;
        }

        .button {
            padding: 4px 8px;
            display: flex;
            align-items: center;
            gap: 4px;
            font-size: 14px;

            svg {
                height: 15px;
                width: 15px;
            }
        }
    }
}

.actions {
    display: flex;
    
    &.mobile-center {
        @media (max-width: 768px) {
            justify-content: center !important;
        }
    }

    &.right {
        justify-content: end;
    }
}
</style>