---
date: 2022/06/08
desc: 再做类型体操我就是
cate: 代码
---

# 一些 Vue 的常用技巧

在长期使用 Vue 的过程中，我并不清楚是否是因为自己对这些东西的实现逻辑太过于奇妙，才催生了这些技巧的产生。也许这些问题在 React 中压根也不会出现吧...？在这里浅记录一下以便以后查看，~~顺便水一下。~~

不过，这些技巧很大部分都仅适用于在 TypeScript 加持的情况下。有的时候用 TS 甚至觉得整个过程变得更加复杂，网上的有些代码甚至是库都没办法好好直接使用。好在现在这种情况正在减少。总之 TS 对于大项目来说是绝对稳的！但是小项目就不一定值，甚至还有些舍近求远的意味；另外做*类型体操*真的很傻。

下面以小标题的形式分开单独介绍。

## 1. VueX 中对 Mutation、Action 的规范化调用

### 介绍

一直不是很能理解为什么 VueX 中的 Mutation、Action 的函数在定义以后却要用字符串这样一种形式来识别。我当然也想不出更好的模式啦。

例如：

```typescript
mutations: {
    mutation(state, pay) {
        state.abc = pay;
    }
}

store.commit('mutation', 123);
```

这就使这个过程完全丢失了 IDE 的支持。对于 VueX 中数据存放很多关系很复杂的情况来说，并不是很优雅，不过具体体现在维护而不是编写上。所以我更倾向于使用一种常量字符串的模式来定义函数名，并也在 `commit` 和 `dispatch` 函数参数中使用。对此，实际上官方给了一个[很完整的示例](https://vuex.vuejs.org/guide/mutations.html#using-constants-for-mutation-types)了。

然而在这个示例中，到后期也会发展为这样的局面

```typescript
export const MUTATION1 = 'MUTATION1';
export const MUTATION2 = 'MUTATION2';
// ...
export const MUTATIONn = 'MUTATIONn';
```

```typescript
import { MUTATION1, MUTATION2, ...} from './mutationTypes'
```

如果将它们整合到同一个 Object 中，效果会怎么样呢？

当然这一切也只是从个人喜好出发的。正如官网所说：

> Whether to use constants is largely a preference - it can be helpful in large projects with many developers, **but it's totally optional if you don't like them.**

### 实现

首先明确一点，常量字符串的内容就是 mutation 函数的名字。从这个角度出发，首先定义一个数组，里面包含了所有所需的 mutation。

```typescript
const mutationTypes = ['m1', 'm2', ..., 'mN'] as const;
```

特别注意末尾的 `as const`，用于将这个变量的类型限定得尽可能小。也就是说 mutationTypes 总体上来说就是一个 `string[]`，但实际上也可以看成一个由它所有的值所构成的一个联合类型数组。`as const` 将其类型明确规定为后者。

接下来将这个数组转换成一个联合类型，也就是 `'m1' | 'm2' | ... | 'mN'`。

```typescript
type MutationTypes = typeof mutationTypes[number];
// 如果上一步没有 as const，这里得到的结果就是 string。
```

然后考虑将这个数组拓展成一个键和值相同的键值对，也就是 `{m1: 'm1', ...}`。这个键值对就是我们最终所要的结果。定义这个键值对的类型：

```typescript
type Result = {
	[K in MutationTypes]: string
	// 这里也可以把值类型定为 MutationTypes，但是没有必要。
};
```

接下来构建这个键值对：

```typescript
let result: Partial<Result> = {};
types.forEach((k: MutationTypes) => {
	result[k] = k;
});
```

`Partial<Result>` 是为了让其初始值可以为空对象 `{}`。最后导出为 `Result` 类型即可。

```typescript
export default result as Result;
```

完整代码：

```typescript
const mutationTypes = ['m1', 'm2', ..., 'mN'] as const;
type MutationTypes = typeof mutationTypes[number]
type Result = {
    [K in MutationTypes]: string
}
let result: Partial<Result> = {};
types.forEach((k: MutationTypes) => {
    result[k] = k;
})
export default result as Result;
```

使用：

```typescript
import mt from './mutationTypes';

store.commit(mt.) // <-- 此时会出现 IDE 提示。
```

IDE 提示效果：

![](https://s2.loli.net/2022/06/08/GKyCOJh7NVSQjMc.png)

## 2. Refs 的调用

### 介绍

一般在使用 `this.$refs` 的时候会面临没有任何 TypeScript 提示的问题，当对其进行复杂操作，如访问子组件的方法或数据以及操作 DOM 时，TypeScript 完全无法理解你在干什么。对此，实际上可以将其作为一个自定义类型的计算属性或者函数返回值来解决。这在需要对子组件进行频繁访问的情境下很有意义。

### 实现

实现起来很简单，在这里只是提供一个思路。

```html
<template>
	<div ref="myElement">
		<component ref="myComponent" />
	</div>
</template>
```

```typescript
import Component from './Component.vue';

export default Vue.extend({
	components: {
		Component
	},
	computed: {
		myElement(): HTMLDivElement {
			return this.$refs.myElement as any;
		},
		myComponent(): InstanceType<typeof Component> {
			return this.$refs.myComponent as any;
		}
	}
});
```

这样的话直接访问 `this.myElement` 和 `this.myComponent` 就可以了，或者也可以将 computed 的内容换到 methods 里，使用 `this.myElement().xxx` 进行访问。但这里还会存在一些瑕疵，毕竟这一部分的类型操作不是由 TS 而是由你自行决定的。

### 问题：计算属性无法获得值

因为 refs 本身并不是响应式的，这里放到 computed 里属于是强行加上响应式。实际上只有在组件被渲染以后，`this.$refs` 才能获取到值，否则就是 `undefined`。这导致直接访问相应计算属性总会得到一个 `undefined` 的结果，可能造成崩溃。解决办法是识别组件 mount，在此之前不返回 refs 的值。

```typescript
myComponent(): InstanceType<typeof Component> | undefined {
    if (!isMounted) return;
    return this.$refs.myComponent as any;
}
```

:::tip
`InstanceType<typeof Component>` 是很好用的一个类型推断，它可以用来直接识别出实例化以后的类型。将该类型作为返回值类型，可以让 IDE 中直接提示子组件所具有的方法和值等，十分方便。如果直接使用 `typeof Component`，得到的是未实例化的原始 class 类型。
:::

然后在 mounted 钩子里加上 `this.isMounted = true` 即可。参考 [StackOverflow - Using Refs in a Computed Property](https://stackoverflow.com/questions/43531755/using-refs-in-a-computed-property)。

另外还有一种特殊情况是这个组件**并不会马上被使用**，这就需要根据组件自身 mount 的情况来定了。解决思路是在组件内部的 mounted 钩子中触发事件，例如 `this.$emit('mounted')`，然后父组件监听该事件改变自身相关变量，再加上类似于上面的 `if (!isMounted) return;` 结构。

如果嫌麻烦，可以使用函数的方法，使用体验基本没差。

### 问题：组件本身可能就是 `undefined`

通常情况下这是不会的，但是如果存在相关的可能，就不能不考虑。此时应当将返回值定为相应类型与 `undefined` 的联合类型。

## 3. 定义全局函数

### 介绍

不仅仅是全局函数，也可以是类实例或者简单的值。唯一的目的是调用方便。这参考了一些注入的全局变量，例如 `this.$route`、`this.$store`。开发早期如果不需要 VueX 而需要采用 event bus 的方案的话，也可以使用这种办法来定义全局量，从而可以在任何地方方便访问。

### 实现

要写入全局变量，只需要在 `main.ts` 中定义 Vue 的 prototype。

```typescript
import Vue from 'vue';
import Hello from 'hello';

Vue.prototype.$hello = new Hello();
Vue.prototype.$bus = new Vue(); // event bus 实际上就是一个空的 Vue 实例
```

但是这样还不够，TS 并不知道这是什么意思。要解决这一点，需要在项目编译路径（一般就是 `src` 里的任意一个位置）编写一个 `.d.ts`，内容如下：

```typescript
import Vue from 'vue';
import Hello from 'hello';

let h = new Hello();
let v = new Vue();

declare module 'vue/types/vue' {
    interface Vue {
        $hello: typeof h;
        $bus: typeof v;
    }
}
```

上面两者的类型写法等价于用 `InstanceType<typeof class>` 的写法。这样就可以在实际编写中随便用了。

## 4. 融合样式代码

### 介绍

写 Less 的时候用到的一些变量如果想要起到全局的作用，仅仅在 `main.ts` 里 import 并不够，还需要在每个 CSS 代码中加入。使用这个插件可以让所有样式代码互通有无。这个插件由官方文档推荐，既可以通过 Vue CLI 使用，也可以自行配置到 Webpack 中。

### 实现

对于 Vue CLI，安装相应的插件并配置即可。

```
vue add style-resources-loader
```

参考配置（`vue.config.js`）：

```js
const path = require('path');

module.exports = {
    pluginOptions: {
		'style-resources-loader': {
			preProcessor: 'less',
			patterns: [path.resolve(__dirname, './src/styles/*.less')] // 这里填要融合的样式文件。
		}
	},
}
```

对于 Webpack 请查看仓库：[yenshih/style-resources-loader](https://github.com/yenshih/style-resources-loader)。

## 总结

后期如果还有类似的想法或许会在这篇文章上更新，目前分享的也就这些了。如果你认为有些地方不太合理或者有更好的方法，亦或者有疑问，欢迎与我探讨。