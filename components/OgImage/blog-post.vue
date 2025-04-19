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

    function estimateReadingTime(charCount: number, speed = 300, roundUp = true) {
        const minutes = charCount / speed;

        if (roundUp) {
            return Math.ceil(minutes);
        } else {
            return Number(minutes.toFixed(2));
        }
    }
</script>

<template>
    <div style="font-family: Literata, 'Noto Serif SC';"
        class="h-full w-full flex items-start justify-start bg-gray-50">
        <div class="flex items-start justify-start h-full">
            <div class="flex flex-col justify-between w-full h-full">
                <div class="flex flex-col items-start px-20 pt-10">
                    <img src="/avatar.jpg" height="150px" width="150px" />
                    <h1 class="text-[80px] font-black text-left">
                        {{ postTitle }}
                    </h1>
                    <div class="flex flex-row items-center text-[40px]">
                        <span v-if="date">发布于 {{ date }}</span>
                        <span v-if="date && wordCount" class="px-4">·</span>
                        <span v-if="wordCount">约 {{ estimateReadingTime(wordCount) }} 分钟读完</span>
                    </div>
                </div>
                <p class="text-2xl pb-10 px-20 mb-0">
                    <strong>Solitude Scroll</strong> / subilan.win
                </p>
            </div>
        </div>
    </div>
</template>