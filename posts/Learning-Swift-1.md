---
date: 2023/11/19
cate: 代码
---

# Swift 学习笔记（一）——A Swift Tour

*A Swift Tour* 是 Swift 官方文档中的一篇用来浅略介绍 Swift 一些主要特性的文章。这样的一种 touring 往往能够让具有一定基础的学习者更快地了解到这个语言（或者框架）相对于其它语言有了什么样的区别和特性，同时也可以作为一种「前参考」，即通过阅读这样一篇文章，可以知道大体有怎样的工具，进而在有相关需求的时候知道参考这些工具的具体概念和定义。

这篇文章不是对原文的中文翻译（官方中文翻译：<https://gitbook.swiftgg.team/swift/>），其中掺杂了一些我个人的解读和想法。

:::tip
1. 下面的「闲言」和「阅读笔记——About Swift」两节不算正文内容~
2. 本文中的内容仅仅是基于阅读 *A Swift Tour* 后的认知所编写，不保证在将来会发生一些改变。如果本文中存在一些纰漏，将在将来的笔记里进行修正。
:::

## 闲言

> It’s a safe, fast, and interactive programming language that combines the best in modern language thinking with wisdom from the wider Apple engineering culture and the diverse contributions from its open-source community.

Swift 被 Apple 认为是具有 Apple 哲学的语言。我想，Apple 哲学的一些体现，抛开那些隐藏在生产线背后的不确定是利益、真正的责任感，还是二者杂糅的一些产物来说，大概最接近我的，是在一些明面上的事物，如实体设计——Apple 的一些产品的外观设计（总体），软件设计——macOS 系统本身的设计上。它追求一些细致和直观，但同时在可扩展性上又显得有些「极力追求独特」，当然有时也会做出迫不得已的让步（如 Apple Silicon 上的 Rosetta，Numbers Pages Keynotes 对 Microsoft 格式的支持）。

我不清楚 Swift 是否可以算作是「有美感」，但它作为一门编程语言，本身就迈出了对于 Apple 来说可能很大的一步——开放（参考 [Introducing Swift on Windows](https://www.swift.org/blog/swift-on-windows/)）。

而通过我对 Swift 这一浅浅的了解，大概可以（目前）推断出它确实解决了一些编写过程中的痛点。这也是我第一次在语言设计本身上见到类似于 hook 的东西（`willSet` 和 `didSet`），以及一些似乎没有在其它语言中见到的，符合直觉的 `extension`、`mutating func`。还有一些语法上的新颖，如当 enum type 是确定的时候，可以直接省略 enum name 用 `.case_name`。

## 阅读笔记——About Swift

*About Swift* 是对 Swift 的一个简单总述，但好像确实说出了很多花来。

> ... combines the **best** in modern language thinking with wisdom from the wider Apple engineering culture ...
> ... guiding principle that the obvious way to write your code should also perform the **best** ...

其中最吸引我的就是上面的第二句话，一种认为好好写明确的代码就应该能得到好性能的 principle（不知道是不是这样）。除此之外还有一些

- Its combination of safety and speed make Swift an excellent choice for everything **from “Hello, world!” to an entire operating system.**
- It’s an **industrial-quality** programming language that’s as expressive and enjoyable as a **scripting language**.
- The compiler is optimized for performance and the language is optimized for development, **without compromising on either.**

你最好是 \^_\^

## 基本的数据类型、变量和字符串

一个语言最基础的部分，无非

- 如何去声明、定义变量和常量
- 它们的数据类型如何被确定
- 关于字符串
- 一些 collection-like 类型

### 1. 变量和常量的定义、数据类型的指定

在 Swift 中，定义变量使用 `var`，定义常量使用 `let`。Swift 里这样的一种模式让人不禁联想到 JavaScript 中变量既可以用 `var` 又可以用 `let` 来声明、变量可以重定义以及 `var` 和 `let` 实际上控制的是变量的作用域的这些混乱且没有逻辑的表现显得无比诡异。

```swift
let implicitDouble = 70.0
let explicitFloat: Float = 70
```

默认情况下，带小数点的数字会被推断为双精度浮点型。

### 2. 类型转换

Swift 中没有隐式类型转换，保证了类型安全。其它的现代语言大都也都具有这样避免隐式类型转换的倾向，例如 Python。

```plain
>>> "a" + 1
Traceback (most recent call last):
  File "<stdin>", line 1, in <module>
TypeError: can only concatenate str (not "int") to str
```

![](https://z1.ax1x.com/2023/11/19/piNba38.png)

强制类型转换可以通过创建实例来实现

```swift
let concatenation = "Something magical will happen here: " + String(123)
```

### 3. 字符串

Swift 自带 `String` 类型，可以直接创建字符串 `"String"`。字符串的模板化使用的是 `\(expression)` 的语法：

```swift
let scoreMessage = "Your score is \(score)."
let costMessage = "The cost is $\(cost)."
```

多行字符串使用的是三个**双**引号。

```swift
let heredoc = """
Not Indented
    Indented
"""
```

注意后一个三引号。这个三引号可以理解为定义了一个缩进零点，与这个三引号缩进相同的文本被视为是没有缩进（0 缩进），缩进高于这个三引号的文本的缩进会被正常显示，缩进低于这三个引号将导致语法错误。

> Indentation at the start of each quoted line is removed, as long as it matches the indentation of the closing quotation marks.

![](https://z1.ax1x.com/2023/11/19/piNqUaR.png)

上图中的 `quotation1` 和 `quotation2` 的值是等价的，可以注意到它们的缩进零点不同，由后一个三引号定义。

`quotation3` 中出现了 `Not Indented` 的缩进低于后一个三引号的状况，所以出现了 `Insufficient indentation of line in multi-line string literal` 的错误。

下列代码

```swift
let quotation1 = """
Not Indented
    Indented 
"""

let quotation2 = """
    Not Indented
        Indented
    """

print(quotation1)
print(quotation2)
```

结果为

```
Not Indented
    Indented 
Not Indented
    Indented
```

:::warning
放置在三引号里的双引号不需要转义。
:::

### 4. 数组、元组和词典

Swift 中的数组和词典均用方括号（brackets）来定义，其类型表示为 `[Type]` 和 `[KeyType: ValueType]`。

```swift
let numbers: [Int] = [0, 1, 2, 3]
let stringToNumberMap: [String: Int] = [
    "zero": 0,
    "one": 1,
    "two": 2,
    "three": 3
]
```

空数组用 `[]` 表示，空词典用 `[:]` 表示。空数组和空词典在赋给新定义的量时必须先指定其数据类型。对比上，TypeScript 若要正确推断类型，也有这样的要求但不严格，不指名的空数组会被直接推断为 `never[]` 类型；而 Java 则是在创建相关 Collection 类时需要用泛型来指代。

```swift
let numbers: [Int] = []
```

```typescript
let numbers: number[] = [] // 不指明 number[]，空数组被推断为 never[]
```

```java
var list = new ArrayList<Integer>();
```

Swift 中的元组（tuple）用途简单，即一次性多项传值和一次性多项返回。元组可以使用类似下标的数字来访问，例如

```swift
func getMinAndMax(_ numbers: [Int]) -> (min: Int, max: Int) {
    var min = numbers[0]
    var max = numbers[0]

    for n in numbers {
        if n > max {
            max = n
        } else if n < min {
            min = n
        }
    }

    return (min, max)
}

let result = getMinAndMax([0, 1, 2, 3])
print(result.0) // 或者 result.min
print(result.1) // 或者 result.max
```

## 循环、控制流

### 1. `if` 语句

通常而言 `if` 后面的条件需要用括号括起来，而且这样的条件会被隐式转换为布尔值，例如 `if 0` 就是 `if false`。然而，在 Swift 中，`if` 有这样的特性：
- 当条件只包含一个表达式时，括号就可以省略
- 条件不会进行隐式转换，所以 `if` 后面必须是布尔值的表达式

Swift 中的 if-else 同时也扮演着其他语言中的三目运算符的角色，这一点和 Python 相似。

```swift
print("Score: \(score) \(if score > 10 { '🎉' } else { '' })")
```

Python 中的相关语法则更像是一种倒装的语序。

```python
print(f"Score: {score:d} {'🎉' if score > 10 else '':s}")
```

### 2. Optional 量（Optionals）

Optional 可以简单理解为 TypeScript 中的 `type | null` 联合类型，即要么是相应的值，要么是 `null`（在 Swift 中是 `nil`）。Optional 和 `if` 搭配起来可以形成一种特殊语法 if-let。

```swift
if let value = optionalValue {
    // 当 optionalValue 可以被展开的时候（optionalValue 不是 nil）执行
} else {
    // 当 optionalValue 是 nil 的时候执行
}
```

上面的语法也可以简写为 `if let optionalValue {}`，此时花括号内可使用的变量是经过展开后的 `optionalValue`。

:::tip
文档里对于一个非 `nil` 的 Optional 值被正确作为原类型使用的情况，存在一种对 Optional 量「展开」（unwrap）的描述。我想这也是 Swift 相对其他语言的一种不同之处。在这里，可以将 optional 值 `T?` 理解为一种特殊的泛型 `Optional<T>`，它决定了具有该泛型的表达式在具体被取值时候的返回具有两种可能性，这种在取值时对原值或是 `nil` 的内部选择就是 unwrap 的过程。

> If the optional value is `nil`, the conditional is false and the code in braces is skipped. Otherwise, the optional value is **unwrapped** and assigned to the constant after let, which makes the unwrapped value available inside the block of code.
:::

Swift 中存在空合并运算符（null coalescing operator）双问号 `??`。这是对 optional 量的另一种处理方法：`optionalValue ?? defaultValue`。

在这里就不得不提 `null` 这样的一个值了。在其它某些语言中的 `null` 可以被直接赋给几乎任何类型的值，也可以作为一些类型值的默认值，这种缺省机制在有些时候被语言本身采用。这种 `null` 的广泛存在导致了一些代码中*几乎所有*变量的存在不具有保证，产生许多额外的判断。注意这里的问题集中在*所有*上面。

从这个角度来看，JavaScript 这种同时具有 `null` 和一个叫 `undefined` 的值的动态类型语言在这方面的代码简洁性和可维护性甚至会表现得更糟糕。在 TypeScript 中，由于值可以被作为一种不变的 literal type，在有些代码中会存在 `T | null`、`?: T` 和 `T | undefined` 甚至 `T | undefined | null` 等多种含义不定写法，但它们最终表达的大概依然只是可选值。当然不排除在一些模式下，`null` 和 `undefined` 会被明确区分且具有明确的含义。

### 3. `switch` 语句

文档中对 `switch` 语句的描述是

> Switches support any kind of data and a wide variety of comparison operations — they aren’t limited to integers and **tests for equality.**

而通常情况下 `switch` 仅能被用于相等性的检查。上面所说的特殊用法，来源于一种特殊的 `switch-where` 写法。下面的这段代码的结构来自官方的文档

```swift
let vegetable = "红辣椒"
switch vegetable {
    case "celery":
        print("加点葡萄干就能做出蚂蚁爬在树干上的效果了")
    case "cucumber", "watercress":
        print("可以做出好吃的沙拉捏")
    case let x where x.hasSuffix("椒"):
        print("这\(x)辣吗？")
    default:
        print("放汤里应该都好喝")
}

// 输出“这红辣椒辣吗？”
```

其中可以看出这么几点：

- case-let 语句可用于拦截变量，并将拦截到的变量用于后面紧跟着的 `where` 条件中。这里将 `case` 后的表达式广泛化了，一般的 `case x` 是一个特例 `case let a where a == x`。
- case 结尾不需要写 `break`，但也可以写。做出这样的改动的基础应该是将跨 case 执行语句视为一种错误，所以这种操作直接被抛弃了。
- 多项同时 case 用 `,` 分隔。

另外还有一点是这里的 `switch` 必须有 `default` 语句，否则会报错 `Switch must be exhaustive`（Switch 的情况必须全面）。如果需要跳过 `default` 情况，则应写作 `default: break`。

:::warning
想问问你们 Swift 人为什么在 Swift 里面 switch-case 的一般写法（Swift 文档和 Swift Playground 里的表现）中认为 `case` 前面应当没有缩进？😨😨
:::

### 4. `for` 和 `while` 语句

for-in 可以用来遍历数组和词典。其中词典使用 `for (key, value) in dictionary {}` 的写法，对于不需要的值则使用 `_` 代表缺省。下面是官方给出的一种从 `[String: [Int]]` 词典中提取出数组中全部数字的最大值的算法。

```swift
let interestingNumbers = [
    "Prime": [2, 3, 5, 7, 11, 13],
    "Fibonacci": [1, 1, 2, 3, 5, 8],
    "Square": [1, 4, 9, 16, 25],
]
var largest = 0
for (_, numbers) in interestingNumbers {
    for number in numbers {
        if number > largest {
            largest = number
        }
    }
}
print(largest)
// prints 25
```

对于 `while`，Swift 中仍然有 while 和 do-while 的区分，只不过后者改名叫做 repeat-while。和 `if` 一样，一个表达式的条件可以简写。

此处还存在一种特殊的表达式 `m..<n` 和 `m...n`，其中 `m` 和 `n` 为整数。这类似于 Python 中的 `range(n)`。`m..<n` 产生的是 `m, m+1, ..., n-1` 一共 n-m 个数，`m...n` 产生的是 `m, m+1, ..., n` 一共 n-m+1 个数。这种表达式应该是用于替代通常的 `for (int i = 0; i < ...; i++)` 写法，从而全部换成 for-in 来解决。Swift 在这一点的设计上和 Python 有着异曲同工之妙。

```swift
let array = [0, 1, 2, 3, 4]

for i in 0..<array.count {
    print(array[i])
}
```

依然和 Python 相似，`i` 在不需要的时候可以替换成 `_`。

### 5. 闭包和函数

Swift 显式地支持闭包，其文档中强调了函数可以被视为是一种可调用的闭包。在这种情况下，函数也会被视作是一种头等函数（它可以在不同的函数之间交换，可以被传递、被返回等）。

> Functions are a first-class type. This means that a function can return another function as its value. A function can take another function as one of its arguments.

通常支持闭包的语言都存在头等函数的概念，这一点可以参照 Wikipedia 上的一些说法

- _**Closure** is a technique for implementing lexically scoped name binding in a language <u>with first-class functions.</u>_
- _The use of closures is associated with languages <u>where functions are first-class objects</u>, in which functions can be returned as results from higher-order functions, or passed as arguments to other function calls; if functions with free variables are first-class, then returning one creates a closure._
- _Closures typically appear in languages with <u>first-class functions</u>—in other words, such languages enable functions to be passed as arguments, returned from function calls, bound to variable names, etc., just like simpler types such as strings and integers._

在这里可以简单区分一下函数和闭包。对于闭包，它所捕捉到的自由变量（captured, free variables），当闭包处于其它作用域时也可以正常使用。例如 JavaScript 中：

```javascript
function removeFromArray(array, number) {
    return array.filter(x => x === number)
}
```

这里存在的闭包是 lambda 表达式 `x => x === number` 所创建的匿名函数（anonymous function），它被传递给 `array` 自带的 `filter` 方法并被反复调用。值得注意的是这里的 `number` 作为实参存在于函数 `removeFromArray` 的作用域，其被闭包所捕捉后则可以传递到外部去继续使用。

一个更明确的例子是使用函数来构造函数。

```javascript
function d(f, dx) {
    return x => (f(x) + dx - f(x)) / dx;
}
```

这里 `d(f, dx)` 所返回的是一个由 `f` 和 `dx` 参与构成的闭包。

```javascript
// 构造新的闭包

var func = d(f1, dx1);

// 在某个 f1 和 dx1 都不存在的作用域内

func(2); // <-- 返回的结果和在 f1 和 dx1 存在的作用域内 (f1(2) + dx1 - f1(2)) / dx1 的结果一致
```

闭包在不同的语言之中，可能直接由函数定义来生成，也可能用 lambda 表达式来生成，其与函数实质上不一定是并列的关系。

在 Swift 里面，闭包是由花括号括起来的一段代码，其参数由花括号开头的参数列表指定。这一参数列表和函数声明中的相似。参数列表和闭包体之间用 `in` 分开。

```swift
{ (number: Int) -> Int in 
// do something with number
return // some int
}
```

在一些情况下参数列表可以省略，例如当回调被用于作为回调函数时，其参数和返回值的类型实际上已经确定，此时就可以省略掉类型的注明。

```swift
{ number in
// do something with number
return // some int
}
```

若其返回值可以在一个表达式里得到，则可以直接简写为
```swift
{ number in expression }
```

这一点类似于 JavaScript 中的箭头函数 `x => expression` 和 `x => { /* do something */ return }`。

当参数列表数量和类型都确定时，上述表示还可以进一步简化为用数字代表指定位置的参数所执行的表达式的结果。例如

```swift
let x3numbers = numbers.map({$0 * 3})
```

`$0` 表示第一个参数。

在 Swift 中，函数的声明使用 `func`。

```swift
func add(a: Int, b: Int) -> Int {
    return a + b
}

func makeIncrementer(step: Int) -> ((Int) -> Int) {
    func add(number: Int) {
        return step + number
    }
    return add
}
```

函数的每一个参数具有一个标签（label），这点和 Python 很相似，但在 Swift 中当标签存在时，其在传值时必须带上。参数的标签默认与名称相同，也可以通过在参数前加上 `_` 来删除标签达到顺序化的效果，或者加上其它词语来更改标签。

```swift
func makeIncrementer(s step: Int) -> ((Int) -> Int) {
    func add(n number: Int) {
        return step + number
    }
    return add
}

let incrementer1 = makeIncrementer(s: 4)
print(add(n: 2)) // 6
```

## 类和对象

### 1. 类的简单性质

- 类的属性可以使用 `let`、`var` 声明，方法可以使用 `func` 声明。
- 类可以有构造函数也可以没有。构造函数不写 `func`，而直接写作 `init(...) {}`。
- 在类中，使用 `self` 来代指当前实例本身，使用 `super` 来代指继承的对象，`super.init` 是继承的对象的构造函数。
- 类的继承不使用 `extend` 而是 `class ClassB: ClassA` 这样的表达。

### 2. 方法重载

Swift 支持类似于 Java 中 `@Override` 的方法重载，用法是直接声明 `override func`。无效重载将导致编译错误。

### 3. 属性的 getter 和 setter

除了对属性的一般定义，即类似于 `let a = 1` 这样的定义以外，还可以进行拓展的 get/set 定义。

```swift
class EquilateralTriangle {
    var sideLength: Double = 0.0

    init(sideLength: Double) {
        self.sideLength = sideLength
    }

    var perimeter: Double {
        get {
            return 3.0 * sideLength
        }

        set {
            sideLength = newValue / 3.0
        }
    }
}
```

这样一来，`perimeter` 的值将与 `sideLength` 产生直接的关联，且当 `perimeter` 改变时也会带动 `sideLength` 发生改变。Setter 函数的参数为新的值，当不写该参数时，新的值默认名称为 `newValue`。

### 4. 属性的 `willSet` 和 `didSet`

`willSet` 中的代码将会在属性的值被设定之前被执行，`didSet` 则是在设定之后。这一「设定」的操作不包括在 `init` 函数里进行的操作。这两个 hook 可以被用于执行一些同步的操作，但不宜出现使用很长或者重复的多值比较来确定一个值的情况。

```swift
var a: Int {
    willSet {
        print(newValue)
    }
}
```

### 5. 类的 Optional 类型和 optional 访问

类的类型后也可以加上 `?` 来表示该类不一定能被正常实例化。

```swift
let optionalInstance: Class? = Class()
print(optionalInstance?.someProperty)
```

第二行中的 optional 访问，使得当 `optionalInstance` 确实为 `nil` 时，该表达式的值也为 `nil` 而不会抛出错误。

### 6. 枚举

枚举可以有类型，也可以没有。若枚举具有类型，则必须是 `Int`、浮点和 `String` 之一，其余类型不能使用。

```swift
enum Months: Int {
    case January = 1
    case Febrary, March, April // ...
}
```

枚举的项用 `case` 来指定，对于有类型的枚举，每一项都具有一个原始值（`rawValue`）。当枚举类型是 `Int` 时，原始值会从第一个项开始，从 0 一直递增。当手动指定了某一项的值时，该项的原始值即为指定的值，而下一项的值为指定的值的下一个值。

然而，当枚举类型是浮点时，默认情况下仍然是从 0.0 一直递增，但是当存在人工指定的值时，递增的规则不再适用，所有的项目均需要被人工指定值。

当枚举的类型是字符串时，其原始值为该项的名称，如 `Months.January` 的 `rawValue` 就是 `"January"`。

枚举内部也可以有方法，且当枚举类型确定时，不需要带上枚举的名称，直接写作 `.` 后跟上枚举项的名字即可。

```swift

enum Months: Int {
    case January = 1
    case Febrary, March, April // ...

    func toChinese() -> String {
        switch self {
            case .January:
                return "一月"
            // ...
            default:
                return String(self.rawValue)
        }
    }
}

```

通常情况下对枚举的使用是作为常量，如 `Months.January`。但枚举也可以被实例化，其自带一个返回值为 optional 的构造函数，接受一个 `rawValue` 参数。例如下列语句：

```swift
if let wtf = Months(rawValue: 13) {
    // Oh no...
} else {
    print("So what are you thinking?")
}
```

`else` 中的语句被执行。以及

```swift
if let january = Months(rawValue: 1) {
    print(january.toChinese())
} else {
    print("Uh...")
}

// 输出 一月
```

枚举项亦可以有自己的参数，这在枚举的实例化中表现出一定的作用来。例如下面的 `ServerResponse` 枚举。

```swift
enum ServerResponse {
    case success(String, String)
    case failure(String)
}

switch result {
    case let .success(a, b):
        // use a and b here.
    case let .failure(msg):
        print("Failed. Message: \(msg)")
}
```

在这里 `ServerResponse` 仍然可以省略，且 `case let` 实际上向后面的代码传递的是「存在」于当前枚举项中的参数。

### 7. 结构体

结构体类似于类，可以拥有构造函数、属性、方法等。一个区别是，结构体的实例可以被形容为是「静态」的（相对于类的实例），其传递的是一种拷贝，而类的实例在传递时表现为引用。同时，结构体还有这样的特性

- 结构体之间不存在继承
- 结构体没有反构造函数（deinitializer）
- 当结构体被赋给常量时，其变量属性亦不可变

根据上述特性，结构体可以理解为是一种主要用于携带静态数据，并可能带有不牵涉外部数据的一些方法的对象。例如，注册信息可以用结构体这样表示：

```swift
enum Level: Int {
    case starter = 1
    case two, three, four, five, six
    case ultimate

    func getDescription() -> String {
        switch self {
            case .starter:
                return "Newbie"
            // ...
            default:
                return "Level \(self.rawValue)"
        }
    }
}

struct RegistrationInformation {
    var username: String
    var password: String
    var email: String
    var level: Level

    init(username: String, password: String, email: String, initialLevel: Int) {
        self.username = username
        self.password = password
        self.email = email
        self.level = Level(rawValue: initialLevel)
    }

    func getLevelDescription() -> String {
        return self.level.getDescription()
    }
}

var information = RegistrationInformation(username: username, password: password, email: email, initialLevel: 1)
print(information.getLevelDescription())
```

此外，默认情况下一个结构体的方法不能直接修改其本身的变量属性。如果需要这样的方法，需要在 `func` 前显式地写上 `mutating`。

## 异步和协程

:::tip
作为 Tour 的内容，此部分所写的较为粗略。
:::

和其它支持现代化对异步操作处理的语言一样，Swift 支持 async-await 模式。对这两个关键字的使用，也有如下常见的限制：

- `await` 只能在被标记为 `async` 的函数中使用（有一项例外）
- `await` 只能对被标记为 `async` 的函数使用

若要定义一个异步函数，使用 `func K(...) async -> T` 的语法。使用它时，在对它的调用之前加上 `await` 即可。此外，Swift 还支持一种 `let async` 的写法。这种写法可以使一些异步操作并行执行后取值，使用这些值时再在量前加上 `await`。

> Use `async let` to call an asynchronous function, letting it run in parallel with other asynchronous code. When you use the value it returns, write await.

```swift
func connectUser(to server: String) async {
    async let userID = fetchUserID(from: server)
    async let username = fetchUsername(from: server)
    let greeting = await "Hello \(username), user ID \(userID)"
    print(greeting)
}

Task {
    await connectUser(to: "default")
}
```

Swift 还提出了一种新的处理并发的模式，即 Actor 结构。将在后面的笔记中继续研究。

## 协议和拓展

### 1. 协议

相比于 Java 中的 Abstract Class 和 Interface，Protocol 的模式能够更好（且更整齐）地反映「接受协议」、「接受约束」、「保持一致」的这种代码需求。同时，在 Protocol 中所声明的方法若需对目标的结构自身的属性进行修改，其前也要求显式地加上 `mutating`。

```swift
protocol Example {
    var variableProperty: String
    mutating func modify()
}
```

协议可以被 Class、Enum、Struct 甚至类型（见下面的「拓展」）接受。Struct 内的 mutating function 前的 `mutating` 不能省略，而 Class 则不需要写 `mutating`，这是因为类本身就可以修改自身的变量属性。

### 2. 拓展

拓展（Extension）所针对的是 Swift 中的类型，这一概念使得类型也可以变得有无限可能。在拓展的过程中，也可以让类型去接收协议。一个很好理解的例子是为所有的 `Int` 加上绝对值的方法。

```swift
extension Int {
    func absv() -> Int {
        return abs(self)
    }
}

print((-2).absv())
```

拓展中引入的方法也可以修改值本身（用 `self` 表示），这样的方法前面同样要加上 `mutating`。此外在这里需要注意的一点是 `.` 的优先级要高于 `-`，`-2.absv()` 的结果是 `-2`。

## 异常处理

### 1. Error 协议

Swift 语言内置了一种 Error 协议（实际上这个协议是空的）。根据前文，多种结构可以接受 Error 协议；接受了 Error 协议以后就可以被用来表示一个异常。例如下面的 Enum 就可以用来表示异常。

```swift
enum HttpError: Error {
    case NotFound
    case InternalError
    case Forbidden
}
```

而实际上既然类型也可以通过 Extension 接受协议，甚至可以做出这样的效果来：

```swift
    func getError() -> String {
        switch self {
        case 1:
            return "ErrorNameRepresentedByNumberOne"
            // ...
        default:
            return "Error\(self)"
        }
    }
}

func throwSomeError() throws {
    throw 2
}

do {
    try throwSomeError()
} catch let number as Int {
    print("I am the number \(number) and represent the error \(number.getError())")
}

// 输出 I am the number 2 and represent the error Error2
```

### 2. do-catch 语句

与其他语言 try-catch 不同，Swift 中的 try 关键字在 do 中被使用，且只会作用于部分语句（表达式），而非 try-catch 中的所有语句。例如

```swift
do {
    print("Trying to retrieve a response")
    let someResponse = try doSomething()
    print(someResponse)
} catch {
    print(error)
}
```

当 `doSomething` 抛出异常时，就会跳转至下面的 `catch` 中继续执行，且错误的默认名称是 `error`。除了什么也不带的 `catch` 以外，还有下面几种形式

- `catch EnumCase {}`，使得后面的 block 中的内容仅在捕捉到 `EnumCase` 的枚举类型错误时执行
- `catch let x as Type {}`，使得后面的 block 中的内容仅在捕捉到 `Type` 类型的量 `x` 时执行，且 `x` 可以在 block 中被使用。上面的一小节中的代码段就用到了它。
- `catch is Type`，使得后面的 block 中的内容仅在捕捉到 `Type` 类型的错误时执行；这一点在文档中并没有提到。需要注意的是它和 `catch EnumCase` 的区别，`is` 后跟的必须是类型，例如枚举类型，但不能跟具体的枚举项。

### 3. `try?` 语句

`try?` 可以在 do-catch 外使用，它将一个表达式的值变成一个 Optional，当语句执行成功时 unwrap，throw 时为 `nil`。

### 4. `defer` 关键字

其实我并不清楚为什么要在这里介绍 `defer`，也许是因为它在异常抛出时的表现有一些特殊性吧。`defer` 后跟的是一段 block，在函数中使用，代表这段 block 会在函数结束执行（正常结束、return 或者 throw）时执行。所以 Swift 中的函数也可以拥有自己的「初始化」和「反初始化」代码，为了可读性可以将它们写在一起，初始化代码写在 `defer` 外面，反初始化写在 `defer` 里面，并放在函数代码的最开头。

下面是文档中给出的一个例子：

```swift
var fridgeIsOpen = false
let fridgeContent = ["milk", "eggs", "leftovers"]


func fridgeContains(_ food: String) -> Bool {
    fridgeIsOpen = true
    defer {
        fridgeIsOpen = false
    }


    let result = fridgeContent.contains(food)
    return result
}
if fridgeContains("banana") {
    print("Found a banana")
}
print(fridgeIsOpen)
// Prints "false"
```

这是因为在现实意义上，操作 `frigeContains` 时必须要对 `fridgeIsOpen` 产生一种对称的修改，即从 `false` 到 `true` 再到 `false` 的改变。这一点在抽象意义上也可以被利用。我能够想象到的是在异步操作中根据对象的状态进行正确的处理，这种状态的变换如果具有一定的对称性，就可以通过上面的代码的类似逻辑来实现。

## 泛型

### 1. 函数泛型

和有些语言一样，函数中的泛型写在参数列表前，用 `<>` 包含。

```swift
func makeArray<Item>(repeating item: Item, numberOfTimes: Int) -> [Item] {
    var result: [Item] = []
    for _ in 0..<numberOfTimes {
         result.append(item)
    }
    return result
}
makeArray(repeating: "knock", numberOfTimes: 4)

// 结果是 ["knock", "knock", "knock", "knock"]
```

上面的代码所用到泛型的地方是 `var result` 的空数组定义，以及对返回值的标注。

### 2. 泛型作为参数

若要将泛型用于类型的参数，是将其写在类型后，用 `<>` 包含。例如 Swift 标准库中的 Optional 类型可以这样实现：

```swift
enum OptionalValue<Wrapped> {
    case none
    case some(Wrapped) // 注意这里 some 括号里标注的不是形参名而是形参类型
}
```

### 3. 泛型条件

Swift 不仅支持了泛型，同时也在语言设计上支持了对泛型使用条件的约束。借助 `where` 可以直接声明一些泛型的适用条件，这使得一些确实需要的限制可以在编译阶段被明确表达，而不需要在运行时进行额外的检查，甚至对语言的底层进行一些操作。

`where` 语句放在函数声明的最后，返回值类型的后面，格式是 `where 条件1, 条件2, ...`。例如：

```swift
func equal<A, B>(a: A, b: B) -> Bool where A == B {
    return a == b
}
```

上面的 `equal` 函数要求输入的 `A` 和 `B` 两种类型必须相等，它排除了一些类似于「跨类型进行相等性比较」的不必要操作。除了类型之间的 `==` 关系，还可以用 `:` 来指定对特定 protocol 的接受情况以及类的继承情况。文档中给出的例子为

```swift
func anyCommonElements<T: Sequence, U: Sequence>(_ lhs: T, _ rhs: U) -> Bool
    where T.Element: Equatable, T.Element == U.Element
```

其中 `where` 后给出的限制条件的意思是 `T.Element` 必须接受 `Equatable` 协议，且 `T.Element` 和 `U.Element` 类型相同。此外，`<T: Sequence, U: Sequence>` 的写法等价于 `<T, U> ... where T: Sequence, U: Sequence`。