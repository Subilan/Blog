---
date: 2025/02/18
desc: 稍微有点麻烦
hidden: true
---

# 给博客文章添加了 TOC

**TOC** 即目录（Table of Contents），本身并不存在于 HTML 的任何标准中，却可以帮助读者快速地了解这篇文章的大致结构，因而也得到了广泛的应用。博客之前一直没有正经的 TOC 支持，经过几番努力，终于在今日加上了。总体体验还不错（虽然有些小问题，~~我希望没人能发现~~）。本文将详细描述给博客加上 TOC 的具体方案和过程。

## TOC 与锚点

在网页中生成的 TOC 往往是有交互功能的。哪怕是在 Word 文档中，自动生成的目录也是带有交互功能的域代码。这种交互就是单击对应的目录项目，跳转到文章中对应的位置的功能。在 HTML 中，这一点要通过锚点链接（anchor link）来实现。

在特定的语境中，**锚点**（anchor）指的是标记了页面中某个位置的一串 HTML 代码。要创建一个锚点，通常的做法是在元素上面附带 `id` 属性，此属性就是该锚点的标识符。该标识符的作用之一，是充当在 [RFC 3986](https://tools.ietf.org/html/rfc3986) 中规定的 URI fragment（即常用的 `document.hash` 去掉 `#`），使得通过 URL 来标识一个页面中的子内容成为可能。这样的一个 URL 在实际应用上通常被称为 permalink（permanent link，永久链接）。

:::tip
早期的锚点是通过 `a` 元素来实现的，具体写法是 `<a name="..."></a>`。把它放在需要锚定的位置，例如一个标题之前，就可以发挥相应的效果。很久以前就已经不这样写了。

Fun Fact:

-   `a` 元素的名字就是 anchor。这是它本来的含义。而在现代语境下，`a` 元素已经和超链接的概念强绑定了，主要依靠的是它的 `href`（hyper reference）属性。
-   接住上面的来说。由于 `a` 元素在印象中就是超链接的意思，许多人认为它的 `href` 属性是必需的（required），所以会习惯性将空链接的 `href` 填为 `#`。然而 `#` 本身的含义，只是一个空的 URI fragment，并非“哪里都不是”。这个 `href` 参数也是可带可不带。**只有当 `a` 元素带有 `href` 时，才是严格意义上的超链接。**

:::

对于包含了 fragment 的 URL，浏览器的一个默认的行为就是将其对应的锚点元素移动到视口以内，这就是 TOC 运作的基础。

所以简单而言，在 HTML 中可用的 TOC 的一个表示，就是具有层级关系的一系列同页超链接（same-document hyperlinks），其中层级用于向用户反映这些链接之间关系，超链接则允许用户进行上文所提及的交互功能。自然，我们的 TOC 主要由 `ul`、`li` 和 `a` 三种元素构成。

## 做个调包侠

上面分析了那么多，其实都是后话。最开始我就打算直接调包使用。这是因为本博客所使用的 Markdown 解析库 `markdown-it` 的各种周边拓展都比较齐全，随便一搜就能找到，且大部分都是可用的。

我先删掉了停更四年之久的 [markdown-it-toc-done-right](https://github.com/nagaozen/markdown-it-toc-done-right) 插件，然后转头去寻找更新的替代品，于是找到了这两个

-   [markdown-it-table-of-contents](https://github.com/cmaas/markdown-it-table-of-contents)
-   [markdown-it-anchor](https://github.com/valeriangalliat/markdown-it-anchor#readme)

它们必须搭配使用，因为 TOC 和 permalink 是相互联系的。于是我直接在 `build.cjs` 中添加了这两个包的引用，然后按照指示进行一些配置，就得到了一个带跳转功能的 TOC。然而我最终并没有采用，因为 `markdown-it-table-of-contents` 有着下面的限制：

-   **位置不灵活**：如果你只是希望文章的开头/结尾/某个位置能够有一个 TOC 存在，那么它的确能满足你的需求。但是我想要的是侧边的效果，所以还需要额外的 CSS 修改。
-   **没有高亮**：高亮并不是 TOC 的硬性需求，但是我还是希望有。这是没有采用它的根本原因。
-   **不支持一些特殊的标题**：这还是我的特殊需求 😋。在例如 [Swift 学习笔记（一）——A Swift Tour](/posts/learning-swift-1)、[北疆之旅（一）](/posts/a-journey-to-xinjiang-1) 这样的文章中，常常有在标题元素里再加各种元素，如 `img`、`code` 的用法，虽然不标准，但可以让它们的显示效果更加丰富。这样的标题并不能被正确识别。

另外 `markdown-it-anchor` 也有一个限制：它不支持 Markdown 中自定义的 HTML 块的识别，所以 `<h2>...</h2>` 而非 `## ...` 表示的二级标题会被忽略，相应的 permalink 也不会形成。这一点作者也在 README 中[明确提到了](https://github.com/valeriangalliat/markdown-it-anchor?tab=readme-ov-file#parsing-headings-from-html-blocks)。

于是我开始想着自己去实现一个简单的 TOC，只考虑两级标题：`h2`、`h3`。

## 自己实现一个 TOC

### 解析标题

构建 TOC 的一个很显然的方式，是提取出文档中所有的标题类元素（`h1` 等），然后将它们按照层级分类。`markdown-it-table-of-contents` 支持六级的配置，而我想做的简化版本只会考虑 `h2`、`h3` 这两级。至于 `h1`，因为考虑 SEO 的缘故，将它特许给了页面的大标题。

这个过程涉及到对文章页面编译出的 HTML 代码的解析和修改。考虑到性能，我决定将这个过程放在博客的编译环节。

:::tip
看过本博客源码的都知道（~~_谁看？_~~），它是运作在本地 JSON 文件构成的文件数据库上的，一切数据都由 JavaScript 自带的 import json 功能从本地文件中获取。

虽然这样做很明显有性能问题（指文件读写方面），但是非常简单、稳定，也没遇到什么瓶颈，所以暂时没有考虑进行优化。
:::

将逻辑放在编译环节的好处在于，这些运算只需要在编译阶段在编译机器上运行即可，而不需要由客户端来执行。那么具体应该怎样做呢？答案显然是正则表达式。由于我们想要的是提取标题标签之间的所有内容，所以初步构建的正则表达式是

```
<h2.*?>(.*?)<\/h2>
```

然而 `.` 并不包括换行符，所以经过测试替换成了 `[\s\S]`，识别效果如下图。

![](http://fnmdp.oss-cn-beijing.aliyuncs.com/public/blog/Adding-TOC-to-This-Blog/h2-regex-test.png)
_在 regex101.com 上面测试正则表达式_

由于我们要处理的是 `h2` 和 `h3`，因此将正则表达式修改为

```
/<h(2|3).*?>([\s\S]*?)<\/h[23]>/
```

第一个组用来捕获该标签的层级，第二个组用于捕获它们之间的内容。然后就可以用下面的 JS 代码处理整个文本。

```javascript
let m;

const headingRegex = /<h(2|3).*?>([\s\S]*?)<\/h[2-3]>/gm;

while ((m = headingRegex.exec(content)) !== null) {
	// m[1] === '2' 或者 '3'
	// m[2] === 内容
}
```

由于最后我们获取的是带有层级的数据，但只有两层，所以最终的结构类似于下面的 TypeScript 定义：

```typescript
interface Heading {
	text: string;
	children: string[];
}
```

或者玩一下较为低级的类型体操，这样就可以实现多层的嵌套。

```typescript
// 这里用 unknown 占位
type Enumerate<N extends number, T extends unknown[] = []> = T['length'] extends N ? T : Enumerate<N, [...T, unknown]>;

// 求后继
type Successor<N extends number> = [...Enumerate<N>, unknown]['length'] extends infer L ? (L extends number ? L : never) : never;

interface h<H extends number> {
	level: H;
	text: string;
	children: H extends 6 ? [] : h<Successor<H>>;
}
```

由于正则表达式通常情况下是从前往后处理的，所以对于下面这个可能的序列

```
h2 h2 h3 h3 h3 h2 h3 h2 h2 h2 h3
```

我们会将从前一个 `h2` 开始，到后一个 `h2` 之间的所有 `h3` 都归纳为前一个 `h2` 的子项，最终形成的结构是：

```
h2:[] h2:[h3,h3,h3] h2:[h3] h2:[] h2:[] h2:[h3]
```

按照上面的分析，通过在 `while` 循环中 push 并用一个 `ptr` 来指示当前操作的 `h2` 的位置，就可以得到我们想要的数组了。

```javascript
let ptr = -1;
let res = [];

while ((m = headingRegex.exec(content)) !== null) {
	const level = m[1];
	const text = m[2];

	if (level === '2') {
		res.push({
			text,
			children: []
		});
		ptr++;
	}

	if (level === '3') {
		res[ptr].children.push(text);
	}
}
```

这样我们就完成了对整个文章标题的解析，并形成了两层的结构。其实到这里，我们就已经可以呈现出 TOC 的大致框架了，只不过没有任何的交互。

```vue
<template>
	<ul>
		<li v-for="x in headings">
			<a v-html="x.text" />
			<ul v-if="x.children.length > 0">
				<li v-for="y in x.children">
					<a v-html="y.text" />
				</li>
			</ul>
		</li>
	</ul>
</template>
```

这里用到了 `v-html`，实现了插件无法所满足的显示复杂内容的功能。接下来，我们需要为这些 `a` 标签添加 `href` 属性，使得它们可以交互。这就涉及到前文所提到的锚点。有了标识符，就有了锚点，该如何选择呢？

### 构造锚点标识符

锚点标识符本质上就是一个字符串，用于唯一标识一个锚点，在这里是标题。

锚点标识符一般是由锚点的内容所决定的（因为这是确保其“唯一”最简单的依据）。人们在阅读文章时，专注的是其内容，因而对于一个标题的 permalink，我们希望其可读性高一些。对这一点继续加以考虑，就形成了普遍使用的一种锚点标识符模式，称之为 slugification（slug 也有蛞蝓🐌的意思）。Slug 的好处很明显：人类可读（human-readable），SEO 自然也良好。

但这些都是基于英文的理想化考虑。受制于 URL 自身的标准，对于非 ASCII 字符，这些需求就显得苍白无力了。而且我们并不能将中文原封不动地塞进 slug 里面。

为此，人们想出了利用拉丁转写、去除注音符号等方法，来实现非 ASCII 字符的 slugification。`markdown-it-anchor` 的作者推荐了 [sindresorhus/slugify](https://github.com/sindresorhus/slugify)，这是一个用来将不同语言的内容转化为 slug 的库，其本质操作就是前面所提到的两点：转写和去除。下面是它的使用例子：

```
import slugify from '@sindresorhus/slugify';

slugify('I ♥ Dogs');
//=> 'i-love-dogs'

slugify('  Déjà Vu!  ');
//=> 'deja-vu'

slugify('fooBar 123 $#%');
//=> 'foo-bar-123'

slugify('я люблю единорогов');
//=> 'ya-lyublyu-edinorogov'
```

可以看到
- `♥` 这种特殊符号，被代表其含义的英文单词 `love` 所替换。
- 带有注音、着重等修饰符的字母，其修饰符被去掉，例如 `Déjà Vu`（法语）被替换成 `deja-vu`
- 无明确含义的特殊符号，如 `$#%` 被直接去掉。这个库也提供了自定义的替换方案，所以你可以定制地将 `$` 替换成 `dollar-sign`、`#` 替换成 `hashtag`、`%` 替换成 `percentage` 等有意义的字符串。
- 西里尔文被替换成了对应的拉丁转写

遗憾的是这个库并不支持中文，相关的讨论在 [sindresorhus/transliterate 的第一个 Issue](https://github.com/sindresorhus/transliterate/issues/1) 里，在这里他们提出了用拼音、拼音加上数字注音、加上笔画数等来防止混淆，甚至用 GPT 来为中文标题生成一个英文的 slug（这样就不需要考虑中文的处理了），等等，但至今仍然没有得出结论，也没有实现（这是 2018 年的 Issue）。

![](http://fnmdp.oss-cn-beijing.aliyuncs.com/public/blog/Adding-TOC-to-This-Blog/chinese-is-currently-not-supported.png)
*残念 desu*