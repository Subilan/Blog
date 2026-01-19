<script setup lang="ts">
const props = defineProps({
    postTitle: {
        type: String,
        default: '测试标题'
    },
    date: {
        type: String
    },
    wordCount: {
        type: Number,
        default: 0
    }
})
</script>

<template>
    <div style="font-family: Inter, NotoSansSC; padding: 64px;">
        <div>
            <h1 style="font-size: 80px; line-height: 1.5; margin: 0;">
                {{ postTitle }}
            </h1>
            <div style="display: flex; align-items: center; font-size: 40px; color: #aaa; margin-top: 40px;">
                <span v-if="date">{{ formatDate(date, 'YYYY 年 M 月 D 日') }}</span>
                <span v-if="date && wordCount">·</span>
                <span v-if="wordCount">{{ wordCount }} 字</span>
            </div>
        </div>
        <p style="position: absolute; bottom: 64px; right: 64px; font-size: 35px;">
            <strong style="color: #000;">Solitude Scroll</strong> / subilan.win
        </p>
    </div>
</template>