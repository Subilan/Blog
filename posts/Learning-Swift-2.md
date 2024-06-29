---
date: 2024/06/29
cate: 代码
---
# Swift 学习笔记（二）——基础操作符、字符串、集合

## 基础操作符

基础运算符，当今流行的不同语言早已达成共识，所以它们之间的多数部分都是重复的，无论是单目、双目还是三目，因此也没有深入探讨的必要。在这里列出一些 Swift 不同于其他语言的设计内容。

### 赋值运算符

与常见的 C 语言中的用法不同，Swift 中的赋值运算符并不返回任何值，所以

```swift
if a = b {
    // ...
}
```

是无效的语句。

### 空合并运算符

空合并运算符（nil-coalescing operator）通常表示为 `??`，在 Swift 中是对 Optional 值的一种操作。在 Swift 中

```swift
(a ?? b) == (a != nil ? a! : b)
```

是成立的。通常而言，空合并运算符所做的事情很简单，即判断一个变量是不是 `null`，如果是，就返回一个默认值（所以 `?? null` 是没有意义的）。但是在 Swift 中情况略有不同，它所做的是先判断 Optional 值是否是空，如果是，将其展开（unwrap，也就是 `a!`），不是就返回 `b` 值。

在这一过程中涉及到是否要对 Optional 进行 unwrap 的判断，如果确实 Optional 可以被 unwrap，那么 `b` 所对应的表达式将不会被计算，当这一位置存在函数调用时需要额外注意这一点。符合这样性质的操作可以称为短路操作或者短路运算（short-circuit evaluation）。

### 范围运算符

范围运算符并不罕见，但也并不普遍。在有一些语言，例如 Python 中，范围运算符的作用被 `range` 函数代替了；在 JavaScript 中，则完全没有范围运算符的身影，需要用到类似于 `[...Array(n).keys()]` 这样的操作来生成 iterable。而在 Vue 的模板语法中，`v-for` 可以接受 `x in 5` 这样的范围写法，最终生成的是 $0,1,2,3,4$。

- 闭区间运算符 `...` 允许生成一个包含 $[a,b]$ 中所有数字的列表，例如 $2 ... 5$ 所生成的是 $[2,3,4,5]$ 这样四个数字，这要求 `b` 必须是大于或者等于 `a` 的。
- 半开半闭区间运算符 `..<` 的左侧是闭右侧是开，`2 ..< 5` 生成的是 $[2,3,4]$。半开半闭区间适合在数组场景下使用，可用 `0 ..< arr.count` 来快速生成下标列表。

这两个运算符的操作元也可以只有一个，它所生成的是单边区间，也就是类似于 $(-\infty, n)$、$[a, +\infty)$ 这样的区间。

```swift
let range = ...5
range.contains(7)   // false
range.contains(4)   // true
range.contains(-1)  // true
```

单边区间也可以直接遍历，但是需要保证起点是确定的，所以 `for i in ..<2` 这样的写法是错误的。然而单边区间也可以直接用于数组的下标，这时这样写就有意义了，因为下标总是从 0 开始。

```swift
for x in collection[..<2] {
    print(x)
}
```

以上代码输出的是数组的前两项。由此也可以知道半开半闭区间运算符可以保证我们在数组下标的指定上是符合直觉的，而不需要去特意地 -1 或者 +1。

## 字符串

### 多行字符串

Swift 中的多行字符串的设计我个人是很喜欢的，因为在其他语言范围中，很难找到将这样的字符串的定义方式写得如此明确的文档。

多行字符串以 `"""` 开始或结束，类似于 Python。多行字符串的结尾 `"""` 所标记的是这一字符串内容的缩进零点，这在上一篇笔记中已经有提到。当内容的缩进小于缩进零点的时候，会导致语法错误；缩进大于缩进零点时，所表示的内容的缩进便是相对于缩进零点的。

![](./Learning-Swift-2/image.png)

在多行字符串中还允许一种虚拟的换行，当一行以 `\` 结束时，这一行的换行会被忽略，从而达到仅开发层面的可读性提升的的效果。

多行字符串中可以直接输入 `"` 而不需要转义，当要字符串内容包含 `"""` 时（虽然我根本想不到什么情况下需要连续的三个引号），转义其中的一个或者两个即可。

### 拓展字符串分隔符

这是一个比较特殊的用法，通常控制字符的转义围绕 `\`，将其转义即可，例如 `\\n` 可直接输出 `\n` 而非换行。Swift 提供一个前/后缀的写法，当字符串以 `#"` 开始、`"#` 结束的时候，其字面量内容的 `\n` 等字符不需要转义可直接输出，如果需要使用其含义，写作 `\#n`。`#` 可以替换成任意多的 `#`。在多行文本中，这也可以简化字面量中的 `"""` 转义。

### Strings Are Value Types

:::tip
这一部分的内容来自：<https://docs.swift.org/swift-book/documentation/the-swift-programming-language/stringsandcharacters#Strings-Are-Value-Types>
:::

Swift 文档中上的这一部分内容指出，在正常情况下 String 类型的值都是值传递的，这就保证了通过调用函数（方法）获取到的字符串类型在之后只能被明确指定地（explicitly）修改。即使是这样，Swift 的编译器也总是会保证拷贝操作只会在万不得已的情况下进行，从而优化性能。

### 作为 Iterable

String 类型的值作为 Iterable 时，实际上就是字符数组。所以
```
for x in "XSWL" {
    print(x)
}
```
会单个单个地输出 X、S、W 和 L。在这一循环中，`x` 就变成了 `Character` 类型，即字符。

### 多行文本的拼接

多行文本的拼接忠实于原文，例如
```swift
"""
a
b
""" + """
c
""" == """
a
bc
"""
```
b 和 c 连在一起是因为第一个字符串末尾没有换行。如果要达到 `a\nb\nc` 的效果，第一个字符串应该表达为 `"a\nb\n"`，也就是

```swift
"""
a
b

"""
```

### Unicode

Swift 中的 String 和 Character 完全兼容 Unicode，因此形如 `\u{xxxx}` 这样的写法是可以放在字符或者字符串中的。此外，Character 类型不仅仅是「字符」（虽然在一定程度上的确可以这样理解），它也可是一系列拓展的字位（字素）的组合（extended grapheme cluster）。下面的例子都来自 Swift 文档。

```swift
let eAcute: Character = "\u{E9}"                         // é
let combinedEAcute: Character = "\u{65}\u{301}"          // e + ́
// eAcute is é, combinedEAcute is é
```

上面两个字符都可以表示带有尖音符的 e，也就是 é。区别是第一个字符常量是由 `\u{E9}` 直接表示的 é，这是因为 U+00E9 表示的就是 LATIN SMALL LETTER E WITH ACUTE 这一单个字符，而第二个字符常量是由 `\u{65}` 即 e 字符和 `\u{301}` 尖音符附加符号「 ́ 」组合起来表示的。这两种表示都是合法的。

:::tip
注意这里的尖音符附加符号是一种组合附加符号（combining diacritical marks），与独立存在的类似于尖音符的符号有所区别。
:::

此外，对于类似于韩语这类单字由不同字位拼接而来的语言，其单字依然在 Character 的表示范围内。例如한可以看作是ᄒ、ᅡ、ᆫ三个字符组合而成，于是以下两种表述在观感上是一致的。

```swift
let a: Character = "\u{D55C}"                  // 한
let b: Character = "\u{1112}\u{1161}\u{11AB}"   // ᄒ, ᅡ, ᆫ
```

更多的例子：

- 带圈字符，用到了 `\u{20DD}`
```swift
let enclosedEAcute: Character = "\u{E9}\u{20DD}"
```
![](./Learning-Swift-2/image-1.png)
*这个带圈字符似乎在浏览器中无法正常显示*
- 国旗，用到了 regional indicator symbol（区域指示符）
```swift
let regionalIndicatorForUS: Character = "\u{1F1FA}\u{1F1F8}"
```
![](./Learning-Swift-2/image-2.png)

以上这些都可以用 Character 来表达，因为它们都是字素的组合。而对于 `ab` 这样的组合则明显不行。

![](./Learning-Swift-2/image-3.png)
*ab 组合会被直接视为 String*

以上这些用法造成 String 的大小必须通过遍历整个 String 里的 Character 才能确定，Character 的大小并不固定。因此在统计较大（注意这里的较大有多大）字符串的 count 的时候会产生一定的性能问题。

### 切片

这里考虑几个 Collection 上的方法或者属性，String 是 Collection 协议的一员，于是有

- `str.startIndex` 是第一个字符的下标
- `str.endIndex` 是最后一个字符下标之后的那个下标，所以直接访问 `str[str.endIndex]` 是错误的，这是一个坑
- `str.index(after: Int, before: Int, offset: Int)` 获得 `before` 之前、`after` 之后、偏移了 `offset` 后的那个下标

注意上面所说的下标**并不是数字**，即 `str[0]` 这样的访问是非法的，必须使用 `str[str.startIndex]` 才可以。下标有它专门的类型。

`str.indices` 是一个 Iterable，它返回的是下标的集合（也不是数字）。

```swift
let str = "ITERABLE"
for i in str.indices {
    print("\(str[i]) ", terminator: "")
}
```

运行结果：

![](./Learning-Swift-2/image-4.png)

### 插入、移除

`insert(_:at:)` 方法可用于在指定的位置处插入一个字符，并将其之前、之后的字符串适当移位，使得插入的字符恰好在指定的下标处，例如 `str.insert("a", at: str.endIndex)` 就是在末尾加上 a，这样的调用类似于 `append` 方法。

在这里便可以理解为什么 `str.endIndex` 的位置并不在数组末尾的下标，而在其后一位了：`insert` 方法在最后一位下标作为参数时的作用效果，是将先前的最后一位替换成要插入的字符，再将先前的最后一位往后移位，如果确实需要在最后一位加上字符，就必须用到 `str.endIndex` 这样一个数组中并不存在的虚拟位置。看下面的例子

```swift
var str = "hello"
str.insert("?", at: str.index(str.startIndex, offsetBy: 4))
print(str) // hell?o
```

这里 `str.index(str.startIndex, offsetBy: 4)` 所代表的正是 `o` 所在的位置，`str[str.index(str.startIndex, offsetBy: 4)] == "o"` 成立。但其最终输出的是 `hell?o`，`?` 代替 `o` 排在了第五位，`o` 后移。所以需要 `str.endIndex` 这一位置。对于 `str.startIndex` 显然并不需要。这样的情形出现的根本原因是对字符的插入可看作在指定位置插入字符后，将原先的后半部分字符串**后移**的操作，这里**后移**便是关键。

`remove(at:)` 方法同理，由于只能移除已经存在的元素，所以 `str.endIndex` 在这里无法使用。`removeSubrange(_:)` 方法所接受的是一个区间，这个区间可以用前面的区间操作符来生成，它的效果也就是移除区间内的内容。例如

```swift
let hw = "hello world"
hw.removeSubrange(hw.index(hw.endIndex, offsetBy: -6)..<hw.endIndex)
print(hw) // "hello"
```

在这里，`hw.endIndex` 与 `..<` 搭配得很好，或许这也是为什么只有 `..<` 符号而没有 `>..` 符号吧。

### 子串

在 Swift 中，字符串的子串由方法生成，是一种独立的类型 `Substring` 而非 `String`，这一点不同于大多数的语言。这样做主要是为了性能上的优化，`Substring` 可以复用 `String` 的内存空间。这在直觉上是符合常理的，因为有子串一定有母串。

也正是因为复用了母串的内存空间，Substring 并不适合用来长期存储，否则将导致负优化（例如，只需要字符串的一小部分，将其分解为子串取得，如果一直不将 Substring 转换成 String，那么子串和母串一起总会占用比我们唯一需要的子串大的内存空间，即母串的内存空间），将其转换为 String 也是很简单的，直接调用 `String(_:)` 方法即可。

![](./Learning-Swift-2/image-5.png)

String 和 Substring 共享 StringProtocol 下的方法，它包含一些前面所述的常用的字符串操作。

### 等值判断

Swift 中字符串的等值判断很有意思，似乎更具有「高级」语言的特色。它并不会单单比对其内存地址或是其它，而是会比较两个字符串的**经典等值性**（canonical equivalence）。字符串由字符即拓展字素组构成，而拓展字素组相等当且仅当它们在语言上（linguistically）和显示（appearance）上相等，即使构成它们的 Unicode 张量不同。

典型的例子就是前面所说过的 `\u{E9}` 和 `\u{65}\u{301}`，一般认为它们是表示相同含义的字素组，所以 `"\u{E9}" == "\u{65}\u{301}"` 为真，因为都显示的是「é」。但是需要注意的是上面所说的充要条件中，还有对语言的限制。语言之间存在形似的字素的现象很常见，在一部分字体中它们在外观上甚至完全相同，例如西里尔文中的 A、拉丁文中的 A 和希腊字母中的 A（这里有一个小知识是前两者都是由希腊字母 A 发展而来）。但显然它们的语言学含义并不一样。

![](./Learning-Swift-2/image-6.png) *Wikipedia 上西里尔文中的 A 的词条，有特别提示指出它们是不一样的*

Swift 中对这一点也有考虑。因此，U+0041 所代表的 LATIN CAPITAL LETTER A 与 U+0410 所代表的 CYRILLIC CAPITAL LETTER A 虽然长得一样，但是并不相等，`"\u{41}" == "\u{0410}"` 为假。

官方的文档上特意提到了一点便是

> String and character comparisons in Swift aren’t **locale-sensitive**.

在这里我很好奇 locale-sensitive 所指的是一种什么样的判断性质。通过搜索发现已经有人在 StackOverflow 上提出了这样的问题，也有较为详细的解释，可参考 <https://stackoverflow.com/questions/25713975/what-does-it-mean-that-string-and-character-comparisons-in-swift-are-not-locale>。简而言之，与 locale-sensitive ordering 相对的应该是 lexicographical ordering，即字典序，Swift 对字符串的比较采取的是后者。

String 的 `hasPrefix(_:)` 和 `hasSuffix(_:)` 方法采用的是同样的比较方式。

## 集合

Swift 中有三种集合类型（collection types），即数组（array）、集合（set）和字典（dictionary）。
- 数组是有序的同类元素组合
- 集合是无序的独异元素组合
- 字典是无序的键值对组合

:::tip
下文中为了区分集合类型（collection type）和集合（set），将使用 collection 来代表前者，「集合」或者 set 来代表后者。
:::

Collection 是否可变，也取决于定义它的时候所采用的关键字是 `var` 还是 `let`。这一点与 JavaScript 中相当不同，因为在 JS 中即使是用 `const` 定义的 Object，只要没有被 freeze，它的值仍然可以被改变。多多使用不可变集合可以让编译器更好地优化代码的性能。

### 数组

数组的类型，在第一篇笔记中提到，记为 `[T]`。这是一个缩写，完整的写法类似于 Java，即 `Array<T>`。对于数组还有一点需要注意的是，对于空数组，创建时必须明确指定类型。如果数组在初始化的时候已经指定了类型，那么可以直接将其赋值为空数组而保持其原有的类型。

除了用 `[value, ...]` 这样的写法以外，还可以用 array initializer 来快速创建数组，它的用法有 `Array(repeating:cout:)`，例如 `Array(repeating: 1, cout: 3)` 会创建 `[1, 1, 1]`。

- `isEmpty` 属性是一个布尔值，判断是否为空
- `append(_:)` 方法在数组的末尾加上元素
  - 除此之外可以直接对数组使用 `+=`，跟上一个同类型的数组值即可
- `insert(_:at:)`、`remove(at:)` 方法类似于字符串，`at` 位置填写数字
  - 存在 `removeLast()` 方法可快速移除最后一个元素，类似于常见的 `pop`。我想这个方法的存在是为了避免 `count - 1` 这样的写法。

与 String 不同，数组的下标就是数字。数组的下标位置还可以填写区间，例如 `array[4...6]` 代表数组的第 5、6、7 项。对区间访问的数组部分赋值，相当于将这部分替换成新的值。例如

```swift
var list = [1,2,3,4,5]
list[2...4] = [6,7]
print(list) // [1, 2, 6, 7]
```

容易发现 `[6,7]` 并不符合 `2...4` 区间长度，但是仍然合法，只要 `2...4` 是合法的即可。上面将 `3,4,5` 替换成了 `6,7`，数组元素数量减少了一。

数组的 `insert` 方法与字符串的不同，它所能触及到的最远的下标是 $\min\{\mathrm{length}-1,0\}$，如果要向末尾追加内容，必须使用 `append`（空数组除外，可以向下标 0 位置 insert）。

对数组的遍历存在两种方式，第一种是直接 `for x in arr`，还有一种是使用 `array.enumerated()`，从而同时获得值与下标。在 Swift 中下标在前值在后，用法 `for (i, x) in arr.enumerated()`。

### 集合

在集合中存储的元素，为了确保其独异性，必须是可计算哈希值的（hashable）。这里所说的哈希值是一个 Int，存在 $a == b \iff h(a) == h(b)$ 其中 h 是哈希计算函数。Swift 的基础类型都是可计算哈希值的。在自己实现一些类型的时候，可以通过同意 Hashable 协议并实现 `hash(into:)` 方法来达到这样的效果。

创建集合需要用到 `Set<T>` initializer 或者用 `Set<T>` 的类型指定，赋值可用中括号（与数组相同），例如

```swift
var a = Set<Character>()
// 或者
var a: Set<Character> = []
// 或者更简单（利用类型推断
var a: Set = ["a"]
```

- 用于添加元素的方法是 `insert(_:)`，在这里不存在 at 参数，因为集合是无序的。
- 也存在 `isEmpty`、`remove(_:)`
- 存在 `contains(_:)`，判断集合是否包含某个元素
- 存在 `sort()` 函数，返回一个 sorted set。这个 `sort()` 函数是通过 `<` 符号来排序的。

Swift 可以对集合进行数学上的各种运算。

|数学运算|对应调用|操作名|
|:-:|:-:|:-:|
|$A \cup B$|`A.union(B)`|取交集|
|$A \cap B$|`A.intersection(B)`|取并集|
|$A - B$|`A.subtracting(B)`|取差集|
|$A \oplus B$|`A.symmetricDifference(B)`|取对称差|

以及各种判断。

|判断|对应调用|
|:-:|:-:|
|A 是否为 B 的子集|`A.isSubset(of: B)`|
|A 是否为 B 的母集|`A.isSuperset(of: B)`|
|A 是否为 B 的真（strict）子/母集|`A.isStrictSubset(of: B)` / `A.isStrictSuperset(of: B)` |
|A 与 B 是否为不交集|`A.isDisjoint(with: B)`|

### 字典

字典定义是键值对的无序组合，它定义的是一种映射（mapping），为了满足映射的基本性质，字典的键必须是唯一的，如果 $a \mapsto b$，那么 $a \not \mapsto c, c \neq b$。字典的完整类型写作 `Dictionary<K, V>` ，也可以简写为 `[K: T]`。其定义方式如下

```swift
var map: [Int: String] = [:] // 空键值对，用 [:] 表示
var map: [Int: String] = [1: "one", 2: "two"]
// 或者
var map = [1: "one", 2: "two"] // 类型推断
```

Swift 并没有像 JavaScript 那样用 `{}` 和 `[]` 来区分数组和映射（或者字典）。

对字典的下标访问，表示取得指定键的值，例如 `map["a"]` 表示取键为 `"a"` 的值。它返回的实际上是一个 optional，如果键对应的值不存在，返回的是 `nil`，而不是像数组或者集合那样产生错误。在这里使用 `if let` 便很方便了。

- `count`、`isEmpty`
- `updateValue(_:forKey:)` 是代替用下标访问并赋值的一种更新值的方法，它返回一个 `String?`，是更新值之前的值。如果更新之前没有值，返回的是 `nil`。
- `removeValue(forKey:)` 类似，会返回移除之前的值，如果要移除的键并不存在，返回 `nil`。

遍历字典的格式是 `for (k, v) in dict`，可以用 `dict.keys`、`dict.values` 来获取单独的键、值组。可以通过 casting 将键、值组转换为 Array，例如 `[Int](dict.keys)` 返回一个 `[Int]`。