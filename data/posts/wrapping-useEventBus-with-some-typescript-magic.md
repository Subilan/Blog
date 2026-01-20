---
date: 2025/08/11
desc: Type Gymnastics!
cate: 代码
---

# 一种基于类型体操的 useEventBus 的封装

## 目录

> useEventBus 是 Vue Use 库提供的一个（类似于 React Hook 但又不完全等价的）工具函数

**Why 类型体操？从自动补全说起。**

我个人对于类型体操的态度其实有些偏抵触——因为 TypeScript 终归是和运行时无关的，它只是静态的检查。这建立在对时间成本的考虑上。虽是这样说，在遇到一些具体的使用场景，想要解决自己对一些自动补全方面的*强迫症*时，TypeScript 强大的类型系统以及类型体操依然显得十分诱人！

在这方面，我一直觉得 TypeScript 是一个十分神奇的存在。纯 JS 的环境下，一些复杂场景的补全（在 VSCode 里面）几乎没有，而在 TS 下则完全相反。TS 仿佛是一种用来描述 IDE 自动补全方式的形式化语言，依靠它的类型系统，一些基于属性、关键字的补全都成了基础，在这一基础之上有了许多非常花哨的补全玩法。这对于有着代码补全强迫症的我来说是非常有吸引力的。

当然，这里所说的自动补全其实是类型系统作用的一个比较肤浅的体现。自动补全之所以可以自动，是因为相关的类型定义都已经编写清晰，项目的类型系统可以环环相扣，自动工作。所以有着该有的自动补全，实质上是项目具有良好类型定义的一大体现。

## `useEventBus` 与它的一种使用模式

[useEventBus](https://vueuse.org/core/useEventBus/) 是 Vue Use 中的一项功能，它提供一个总线供跨组件通信。一个总线可以看做是一个独立的信道，不同的组件可以在总线上面发送信息，并选择性地接收信息。这是一种不太被推荐，但通用性非常强的组件信息交流方式。与一般的 `emit`+`v-on` 的方式类似，其底层本质上都是 pubsub。

这里我们要讨论的是 useEventBus 的两个基础用法：emit 和 on。

```ts
const bus = useEventBus<string>('news');

bus.emit('Some news');

bus.on(ev => console.log(ev))
```

**如果用的是 JavaScript，故事到这里已经结束了！** 可我用的是 TypeScript，并且希望编辑器的自动补全能够智能一点！有多智能呢？这要从项目的一些事件类型管理说起。

仔细看 `useEventBus` 的用法，可以看到它的类型定义里有两个泛型参数，
```ts
declare function useEventBus<T = unknown, P = any>(key: EventBusIdentifier<T>): UseEventBusReturn<T, P>;
// ...
type EventBusListener<T = unknown, P = any> = (event: T, payload?: P) => void;
```

其中`T`表示的是事件参数 event 的类型，`P`表示的是载荷的类型 payload。

起初使用 useEventBus 时，我就在思考该如何正确表达不同 event 的载荷类型。文档上面提到了内置的一个类型 `EventBusKey<T>`。一开始我并没有理解这个类型的含义，直接按照示例就开写了。后来发现，我所考虑的载荷，在这种类型之下似乎位置不太对劲。

```ts
const someKey = Symbol('some-key') as EventBusKey<ComplexPayload>

const bus = useEventBus(someKey);

bus.emit('some-event', {
    ...complexPayload
})

bus.on((e, payload) => {
    console.log(e, payload);
})
```

按照我的理解，这里的 `on` 的第一个参数 `e`是监听到的事件类型，`payload` 是这个事件的载荷，因此 `payload` 应该是 `ComplexPayload`。然而实际上 `e` 是 `ComplexPayload`，而且这正是 `EventBusKey` 类型定义所表达的意思。

在这里先抛开这里 payload 为什么没有被赋予任何类型（而是 any）的疑问，先考虑一下 useEventBus 的具体调用方式：
- `useEventBus` 的第一个且唯一的参数是一个 `EventBusIdentifier<T>`，也就是 `EventBusKey<T> | string | number`。其中 `EventBusKey<T>` 的作用就是上面所说的那样，然后是 string 和 number 这两种基本类型。

这个参数的名字是 `key`，所以有理由理解为一个总线的标识符。在这里我把它想象成**频道**（channel）。一个频道代表着一个总线表示的抽象信道，不同的组件可以在这个频道上面传送不同类型的数据。蒽，很合理！既然是频道的标识符，最好还是用 string 来表示——这样更加灵活、直观，以及还有一些*非常重要的作用*，将体现在后面的类型体操里。有了这里频道的约定以后，emit 和 on 顺势成为了在频道上面发送信息和接收信息的方式。不过在这里 emit 总是在广播信息，on 可以接收到同一个频道上面任意事件及其载荷。为了让这一整个过程更为直观，做以下约定：
- 一个频道代表着一种功能实现所需要进行信息交流的专门场所，也就是说频道是有分类的。具体怎样分，按照具体项目需求而定。
- 发送端可以发送任意类型的事件，并附带载荷。
- 事件被视为是载荷类型及具体含义的标识符，用字符串表示。
- 载荷被视为依附于事件而存在，可以是任意类型。
- 接收端可以在频道上面选择一个或多个事件进行监听，并获取相应类型的载荷。

以上约定并不改变 useEventBus 本身的功能，只是以一种统一的方式进行使用。下面开始着重探讨如何实现这一套模式。

## 需要解决的类型问题

这里所说的“实现”，在实际调用上只需遵照一定的原则进行即可，例如为了让 `bus.on` 只接收单一事件信息，而非广播事件，需要在每一个 `on` 里面都加上一个 `if (e !== 'my-event') return` 的判断；重点在于类型上该如何实现。先明确类型上面有哪些需求：
1. 针对不同的事件类型，定义不同的载荷类型。
2. 载荷类型具有默认值 `string`（也可改为其它）
3. 事件类型，包括频道类别都是可列的，提供一个统一的导出 object 来提供项目中所有可能的事件类型和频道类别
4. 事件按照频道进行分类

这样列出来似乎还不是很形象，所以可以先想象下面的映射结构：

```ts
const events = {
    'SOME_CHANNEL': {
        event1: 'EVENT1',
        event2: 'EVENT2',
        event3: 'EVENT3'
    },
    'ANOTHER_CHANNEL': {
        event1: 'EVENT1'
    }
}
```

上面的这一个 object 表示整个项目中存在的所有频道及频道上面存在的事件。可以看到，不同的频道下面可以有相同名称的事件，这样降低了一些命名上的限制——而且本应如此：不同频道的事件本应不互通。这也表明，事件的载荷类型将由频道名和事件名共同决定。利用上述结构，编写 on 和 emit：

```ts
const bus = useEventBus(events.SOME_CHANNEL); // ???

bus.emit(events.SOME_CHANNEL.event1, {
    my: 'payload'
});

bus.on((e, payload) => {
    if (e !== events.SOME_CHANNEL.event1) return;

    console.log(payload.my === 'payload');
})
```

额滴神，一开始就碰到了几个难以直视的问题。
- 传入 `useEventBus` 的参数似乎不太对劲：它应该如同前面讨论的那样，是一个 string 而非 Object！
- 这里的 `on` 语法不出所料，每一个都携带了 `return`，非常的不优雅（<ruby>ノット<rt>not</rt> エレガント<rt>eleganto</rt></ruby>）！
- 编辑器的自动补全就像是坏掉了一样！（其实是因为还没有写类型）

于是梳理出待解决的一些类型问题（以自动补全为目标）如下：
- events 中各项的自动补全。这表示需要将它的键看做是字面量而非 string。events 不再是 `Record<string, Record<string, string>>` 这样的简单类型。
- 对 `bus.emit` 和 `bus.on` 的封装，使之可以实现
  - 对 `emit` 中传入载荷的类型限制，如果类型不正确就报错。
  - 对 `on` 中收到的载荷的类型限制，一定是相应类型的数据并带有补全。
  - 将 `if ... return` 统一处理

## 类型的实现

首先来解决最简单的一个问题：如何让 `SOME_CHANNEL` 可以传入 `useEventBus` 里。很简单，为它们添加一个统一的字段就可以了：

```ts
const events = {
    'SOME_CHANNEL': {
        channel: 'SOME_CHANNEL',
// -- snip --
```

这样虽然也很不优雅，但是不失为一种解决方式，既没有增加多少工作量，又没有降低可读性：`const bus = useEventBus(events.SOME_CHANNEL.channel)`。嗯？你说这里的确增加的工作量，并且好像在可读性上面——`CHANNEL.channel` 是人能写出来的？（好吧其实是我自己说的😁）下面是关于这些问题的解释
- 为了解决可读性的问题，在这里约定频道的名称只需要说明其用途和关联模块即可，无需携带 CHANNEL 字样。可以将后面跟的 `.channel` 看做是一种抽象的监听目标。例如我要监听一个 Draggable 组件的 Drag 事件，将它们归类于 DRAGGABLE 频道里，那么获取 bus 的语句可以写成：`useEventBus(events.DRAGGABLE.channel)`，也是很自然了。
- 至于每一个项目都要添加一个 channel 字段并且重复一遍频道名称——没有什么是封装不能解决的。

这里的封装并不仅仅是为了解决 channel 字段（以及其它字段）重复的问题，而是实现类型的一个必然的手段，否则单靠 Object 字面量本身是不能做多少类型体操来达到想要的效果的。

首先构造一个函数，用来表达 events 中的每一个频道及其下面的各个事件。我们在上面的 Object 中可以看到，无论是频道还是事件，其包含的信息主要集中在键上面，值都是对键的重复。因此，要构造一个频道，我们要传入的东西其实很简单：频道的名称及其下的事件名称。可以用下面的函数签名来表示：

```ts
function e(channel: string, ...events: string[]): Record<string, Record<string, string>>
```

这个函数名称是非常泛化的。为了让它能够表达我们想要表达的东西，需要用到一些泛型：

```ts
function e<K extends string, const Keys extends readonly string[]>(channel: K, ...events: Keys): ???
```

这样稍微好了一点！我们将传入的第一个参数 `channel` 的字面值类型 `K` 提取了出来；并且使用了 TypeScript 5.0 引入的新语法 [`const` Type Parameters](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#const-type-parameters) 来获取参数中的 string 数组字面值，就如同对它使用 `as const` 那样[^1]。可是这时要返回什么呢？难道是 `Record<K, Record<Keys[number], Keys[number]>>`？先看看函数体该怎样写。

[^1]: 该语法可以看成是 `as const` 的一个语法糖，因为它只在 `as const` 有作用的地方才有作用。在 `as const` 没有作用的地方，例如不以字面量的形式传入参数，而是以变量/引用的形式传入时，const Type Parameters 的写法也无法起作用。

输入是 channel 和一系列的 event，输出是一个以 channel 为键，以以 events 中各项为键的 object 为值的 object：
```ts
const output = {
    [channel]: {
        [event[0]]: event[0],
        [event[1]]: event[1],
        // ...
    }
}
```

注意到这里最外层也带了一个花括号，这是因为当花括号被去掉时，这一部分是不能合法存在的——这是否就代表着我们需要对多个只带一个键（channel）的 Object 进行“合并”操作？并不需要，因为在 JavaScript 中存在 entry 的概念，即键值对。我们可以用一个长度为 2 的数组来表示键值对，第一个元素为键，第二个元素为值，再利用 `Object.fromEntries` 一次性构造最终的结果。因此，上面的结构可以用下面的 entry 表示代替。

```ts
const entry = [channel, /* events */]
```

其中 events 可以再用一次 `Object.fromEntries` 来构造：它是一个键与值具有相同字面量的 object：

```ts
const entry = [channel, Object.fromEntries(events.map(e => [e, e]))]
```

别忘了，最终的结果中还需要带上一个固定的 `channel` 字段，其值就是 channel 的值。下面为了方便，进行了特别的缩进。

```ts
const entry = [channel, Object.fromEntries(
    [
        ...events.map(e => [e,e]),
        ['channel', channel]
    ]
)]
```

以上 entry 的具体作用如下：

```ts
const channel = 'somechannel';
const events = ['event1', 'event2', 'event3']

// 对应下面的结构去掉最外层花括号

const entryRepr = {
    'somechannel': {
        channel: 'somechannel',
        event1: 'event1',
        event2: 'event2',
        event3: 'event3'
    }
}
```

注意原先的签名
```ts
function e(channel: string, ...events: string[]): Record<string, Record<string, string>>
```
在这里已经不再适用。取而代之我们返回的是 `Record<string, string>` 的 entry 形式。

接下来到了最重要的环节，如何编写返回值类型。这里已知 `K` 和 `Keys`，为了能够精确表示出具体的类型，可以这样写：
```ts
return [channel, Object.fromEntries(
    [
        ...events.map(e => [e,e]),
        ['channel', channel]
    ]
)] as [
    K,
    {
        [prop in Keys]: prop
    } & {
        channel: K
    }
]
```

*为了可读性进行了换行，实际可以写得更紧凑*

这里为了让 `Keys` 中的各项在结果中对应，需要用到 `[prop in Keys]: prop` 这种写法，可以理解为是一种恒等映射的 [Key Remapping](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html#key-remapping-via-as)。将 `{[prop in Keys]: prop}` 与 `{channel: K}` 进行了合并，使得结果中的 `channel` 可以具有正确的字面量值类型。

接下来需要编写一个函数将这一系列的键值对合并到同一个 Object 中来表示最终的 events 值。这一函数泛化的签名是

```ts
function gather(...input: [string, Record<string, string>]): Record<string, Record<string, string>>
```

输入数据的类型，在上面已经定义，为了尽可能简化 `gather` 函数的类型，我们只需要为其加上泛型参数，然后让 TS 自行推断即可：
```ts
function gather<K, Ev>(...input: [K, Ev][]): Record<K, Ev>
```

以上写法并不完全正确，有两点需要考虑：
1. 返回值类型不是 `Record` 可不可以？可以，但是仍然需要明确指出 `K` 的类型，在这里为了方便直接使用 `Record`，也没有什么不妥。
2. `K` 的类型是无限制的，这违背了 `Record` 的定义，正确的做法应该是让 `K` 成为 `string` 这样可用作 key 的类型。这里并不需要其它的键类型。

`gather` 的完全体如下：

```ts
function gather<K extends string, Ev>(...input: [K, Ev][]) {
	return Object.fromEntries(input) as Record<K, Ev>;
}
```

最后，让我们来看看我们上面所定义的一系列函数的最终用法：

```ts
export default gather(
    e('CHANNEL1', 'event1', 'event2'),
    e('CHANNEL2', 'event1', 'event2', 'event3', 'event4'),
    e('CHANNEL3', 'event1')
);
```

相比于最开始直接定义 Object 的写法，简洁了不止一点！而且还自带类型定义。

![](https://fnmdp.oss-cn-beijing.aliyuncs.com/public/blog/Encapsulation-of-useEventBus-And-Some-Type-Gyms/%E8%87%AA%E5%8A%A8%E8%A1%A5%E5%85%A8.png)
*自动补全*


## 封装 `useEventBus`

到这里，我们的任务其实还没有完全完成——我们还需要对载荷的类型进行限制。`useEventBus` 的第二个泛型参数 `P = any` 正是载荷的类型，但在当前的模式下如果将其确定，将导致整个频道底下只有一种载荷类型。而在前面讨论的模式中，我们希望不同的事件有不同的载荷类型，这需要自行实现——我们本来就需要对 `useEventBus` 进行封装，所以赶紧开始吧。

回顾前面所说的，最终的载荷类型需要由频道名和事件名共同确定。如何确定呢？在这里自然想到 [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html)。我们可以定义一个 type 来专门存储频道名+事件名到载荷类型的映射。我们还提到，载荷类型有默认值 string。综合起来，可以这样写

```ts
type EventPayloadTypes = {
    CHANNEL1_EVENT1: {
        prop111: PropType111,
        prop112: PropType112
    };

    CHANNEL1_EVENT2: {
        prop121: PropType121,
        prop122: PropType122
    };

    CHANNEL2_EVENT1: {
        prop211: PropType211
    };
};
```

这里频道名+事件名的表示为频道名+下划线+事件名，实际还可以采用其它表示，总之是需要二者组合成为确定因素。于是我们可以通过下标来拿到我们所需要的类型：`EventPayloadTypes['CHANNEL1_EVENT1']`，就好比我们在其它代码里用散列/switch-case 来提供查找功能一样。

接下来可以编写一个工具类型，来让我们快速拿到想要的载荷类型：
```ts
export type PayloadFor<K extends string = string> = K extends keyof EventPayloadTypes ? EventPayloadTypes[K] : string;
```

这里判断如果 `K` 在 `EventPayloadTypes` 里，就返回相应的载荷类型，否则就返回一个默认值 string。

那么以上方法该如何使用呢？我们知道，在之前的实现里面，频道类型和事件类型是分离开的。多亏了 [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html)，我们可以在我们手里有的一系列字符串字面量上面进行自由组合，所以只需要拿到频道的字面量类型 `C` 和事件的字面量类型 `E`，就可以组合出我们所需要的那一个键 `${C}_${E}`（或者其它组合方式）。有了这里的考虑，我们对 emit 函数的封装就顺理成章了：

```ts
<S extends string = string>(event: S, args?: PayloadFor<`${K}_${S}`>) => {
    bus.emit(event, args);
}
```

这里我们主动获取了 event 的字面量类型，并且将 `S` 与 `K` 拼装了起来，就拿到了载荷的类型。这里的 `K` 来自于包装函数的形参（见下文）。on 函数也是同样：

```ts
<S extends string = string>(event: S, listener: (r: PayloadFor<`${K}_${S}`>) => void) => {
    bus.on((e, payload) => {
        if (e !== event) return;

        listener(payload);
    });
}
```

我们为 on 函数封装了一层逻辑，来让 on 只监听一个特定的事件而非频道上的所有信息。on 函数的回调里面可以拿到具有类型注解的值。

以上两个函数的写法可能有点奇怪，请原谅我是直接复制粘贴的。完整封装函数以一个 composable 的形式呈现，如下：

```ts
export default function <K extends string = string>(channel: K) {
	const bus = useEventBus<string>(channel);
	return {
		send: <S extends string = string>(event: S, args?: PayloadFor<`${K}_${S}`>) => {
			bus.emit(event, args);
		},
		on: <S extends string = string>(event: S, listener: (r: PayloadFor<`${K}_${S}`>) => void) => {
			bus.on((e, payload) => {
				if (e !== event) return;

				listener(payload);
			});
		}
	};
}
```

具体使用时，无论是 `send` 还是 `on`，都会受到类型系统的约束；载荷类型将根据传入的 `event` 字面量类型自动推断出来——仿佛 TypeScript 工作在运行时一样。

![](https://fnmdp.oss-cn-beijing.aliyuncs.com/public/blog/Encapsulation-of-useEventBus-And-Some-Type-Gyms/%E6%8C%89%E7%85%A7%E5%AD%97%E9%9D%A2%E9%87%8F%E6%8E%A8%E6%96%AD%E5%87%BA%E7%9A%84%E6%AD%A3%E7%A1%AE%E8%BD%BD%E8%8D%B7%E7%B1%BB%E5%9E%8B.png)
*按照传入字面量类型推断出的正确载荷类型*

值得一提的是，这里的 `event` 能被看成是字面量类型而不是 string，原因在于前面的 `e` 函数中，我们返回值里面明确指定了 `{[prop in Keys]: prop}` 而不是 `Record<Keys[number], Keys[number]>` 或者 `Record<Keys[number], string>`，前者的键值没有对应关系，后者的值是泛化的。

## 拓展：柯里化与泛型参数的分离

在还没有完全理解 `useEventBus` 的类型参数的时候，我以为 `EventBusKey<T>` 中的 `T` 就是载荷类型，然而并不是。在这种误解下进行尝试，就有了一些泛型参数的分离需求，并且发现柯里化在这时是一种较为稳妥、通用的解决方案。虽然最终搞清楚以后根本用不上，但还是记录一下。

### 误解下的封装设计

在我的误解中，`EventBusKey<T>` 中的 `T` 指定了载荷类型，因此我们的目标类型并不是 `Record<string, Record<string, string>>` 的特化，而是 `Record<string, Record<string, EventBus<T>>` 的特化。这种特化里面不仅仅包含了对字符串字面量的获取，还有对 `T` 的获取。

为了方便获取 `T`，尝试仿照 Vue 里面 `defineEmits` 函数的设计，将需要用到的类型定义放在调用函数时显式传入的泛型参数中。例如，`defineEmits` 的 TS 用法是这样的：

```ts
const emit = defineEmits<{
  (e: 'change', id: number): void
  (e: 'update', value: string): void
}>()
```

以上用法没有传入任何实参，却在传入的泛型参数中把所有的事项都说清楚了：定义了两个可 emit 事件：change 和 update（用字符串字面量给出），并规定了它们的载荷名称和类型。仿照这种思想，将上面的 `T` 放在函数的泛型参数里：

```ts
function e<K extends string, Keys extends string[], T>(channel: K, ...events: Keys): [
    K,
    {[prop in Keys]: T[prop]} & {channel: K} 
    // 这里的 T[prop] 是一种将 events 的各个字面量类型对应到相应的载荷类型的方式；还可以是其他方式，此处仅用于演示。
]
```

可以看到这里的形参是没有变化的，只是多了一个类型的参数。然而在实际使用时便出现了问题：channel 和 events 的类型必须是推断出来的，而非手动传入，否则这种写法就失去了意义。但是 T 却不能被推断出来，必须要手动传入。TypeScript 至今都是不支持部分传入泛型参数的（all or nothing）[^2]，因此该函数无法拿到我们真正想要返回的类型。

[^2]: https://stackoverflow.com/questions/63678306/typescript-partial-type-inference

### 用柯里化来分离泛型参数

为了解决这个问题，一个较为稳妥的做法就是柯里化：将上面我们发现的必须被推断的泛型参数和必须手动填入的泛型参数分离开，写成这个样子：

```ts
function e<K extends string, Keys extends string[]>(channel: K, ...events: Keys) {
    return function <T>() {
        // ...
    }
}
```

以上函数使用 `e('channel', 'event1', 'event2')<PayloadTypes>();` 这样的语法进行调用，可以达到我们想要的效果。

柯里化本身是一种实现多参数函数的方式，TS 的这种无法选填类型参数的特性导致了函数在泛型参数方面有着某种“单一的表现”，因而柯里化自然就成了一种解决方式——这里并不涉及任何与函数形参相关的柯里化，而只限于泛型参数。当然，由于形参与泛型参数之间可能是有关联的，因此函数在形参层面也会跟随泛型参数层面的柯里化而柯里化。

虽然说柯里化会导致函数调用的直观性大大减弱（当然，也可以强行理解成像是在用类型参数去调用函数之类的解读），但不可否认其方法的通用性。由于以上的需求建立在误解之上，所以具体的逻辑就不再展开了。如果将来再遇到类似的场景，对于一些较为底层/内部的实现，完全可以用柯里化来解决问题。除了柯里化之外，还有一些解决方法集中在 TS repo 中有关这一问题的 [Issue#10571](https://github.com/microsoft/TypeScript/issues/10571) 中。