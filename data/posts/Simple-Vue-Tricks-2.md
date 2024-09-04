---
cate: 代码
desc: 本期热点：状态管理
date: 2023/01/26
---

# 一些 Vue 的常用技巧（续篇）

## 5. 自制状态管理

通常情况下想到全局的状态管理，最原始的方式是 eventbus，然而只能实现事件的通讯传递；数据在传递过程中必须有一层操作。若想用正规且有保障的方式，可以用 [pinia](https://pinia.vuejs.org/) 或者 [VueX](https://vuex.vuejs.org/)，然而都有杀鸡用牛刀之势。

一个最简单的状态管理，其实就是一个 `object`。但是为了对其的修改可以引起视图的更新，需要让其变得 *reactive*。这可以通过 Vue 自带的函数 `reactive` 实现。

```typescript
import { reactive } from 'vue';

const states = {
    state1: "123",
    state2: "123",
    state3: "12",
}

declare module 'vue/types/vue' {
    interface Vue {
        $states: typeof states
    }
}

Vue.prototype.$states = reactive(states)
```

此时在组件里可以通过调用 `this.$states.state3 = '123'` 引起视图的更新。

## 6. `v-model` 的使用

:::tip
`v-model` 是常用的 Vue Directive 之一。在这里清晰地介绍其用法。
:::

在编写 checkbox、dialog 等组件的时候，经常需要在父组件内控制子组件的状态。例如

```html
<template>
    <Dialog v-model="dialogState"/>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    data() {
        return {
            dialogState: false
        }
    }
})
</script>
```

这一点在子组件内如何实现呢？官方提供了 `v-model` 这一方案，实际上是语法糖。

```html
<template>
    <div>
        <input v-model="data" />
        <input :value="data" @input="data = $event.target.value" />
    </div>
</template>
```

以上两行代码应当是等价的。具体的逻辑是

- 父组件向子组件传入 `data`（对应 props 中的 `value`）
- 子组件使用此 `data`
- 有需要时，子组件使用 `$emit` 触发 `input` 事件提出更新，父组件更新相应的值，导致 `data` 传入子组件 props 的值发生变化
- 子组件使用新的 `data` 值

这一整个逻辑都可以使用 `v-model='data'` 做到。例如对话框

```html
父组件：

<template>
    <div>
        <dlg v-model="dialog">
            <div class="btn" @click="dialog = false">关闭</div>
        </dlg>
    </div>
</template>

子组件：

<template>
    <div class="dialog">
        <slot/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    props: {
        dialog: Boolean
    },
    mounted() {
        window.addEventListener('keydown', e => {
            if (e.key === 'Escape') {
                this.$emit('input', false);
            }
        })
    }
})
</script>
```
