---
date: 2025/04/20
cate: 记录
desc: 面向结果编程
---

# 浅谈 vibe coding

第一次遇见 vibe coding 这个词是在 X 上我关注的一个 meme 账号 [Programmer Humor](https://x.com/PR0GRAMMERHUM0R)，在上面发布的一些帖子里面涉及到了跟 vibe coding 相关的内容，比如下面两张图：

![](https://fnmdp.oss-cn-beijing.aliyuncs.com/public/blog/Thoughts-on-Vibe-Coding/GocnbUrW4AEfUk9.jpg) *一种作秀？[原贴](https://x.com/PR0GRAMMERHUM0R/status/1911539919471726672)*

![](https://fnmdp.oss-cn-beijing.aliyuncs.com/public/blog/Thoughts-on-Vibe-Coding/GoZnK7-XUAEflYa.jpg) *VaaS [原贴](https://x.com/PR0GRAMMERHUM0R/status/1911328531834974492)*

现在回头来看，这些梗图还是很生动的，特别是 Vulnerability as a Service 的说法：*Vulnerability* 暴露了 vibe coding 最核心的缺点，而 *as a Service* 则表示一些人正在真实的 production 环境中应用 vibe coding 模式。在正式开始谈论 vibe coding 前，需要先搞清楚这个词到底是在讲啥。

## “氛围感编程”

这个词至今都没有一个统一的中文翻译，大抵也没有必要有中文翻译。从单词字面来看，vibe 代表的是“感觉、氛围”，coding 就是写代码的行为，所以 vibe coding 的本意可以译作“氛围感编程”或者“凭感觉的编程”。然而，单从字面来看，这种编程方式与 AI 的联系并不大，为什么一谈到它就一定要扯到 AI 上呢？这需要一些追根溯源。

Wikipedia 上对 vibe coding 的定义是这样的：

> **Vibe coding** (also **vibecoding**) is an AI-dependent programming technique where a person describes a problem in a few sentences as a prompt to a large language model (LLM) tuned for coding.

简而言之，vibe coding 就是使用特化的 AI 工具进行编程的一种行为。在这里，“特化的 AI 工具”可能在代码认识、代码生成方面相较于通用的大模型有优势，似乎是专门造出来给人们写代码的。例如 Claude 的一些模型的表现，就比 DeepSeek 要好[^1]。

[^1]: 这句话的结论并不是我测试出来的，这里参考的是[我在 V2EX 上发布的主题帖子](https://v2ex.com/t/1126802)中 [#20](https://v2ex.com/t/1126802?p=1#reply22) 的说法。

值得注意的是，vibe coding 并不是对 AI 辅助编程的另一种叫法，也就是说，并不是用了 AI 便叫做 vibe coding。要说 vibe coding 里面的 *vibe* 到底指的是什么，我们需要去研究一下原贴是怎么说的。

vibe coding 一词的根本来源，是 Open AI 的联合创始人 [Andrej Karpathy](https://en.wikipedia.org/wiki/Andrej_Karpathy)。确切地说，是他在今年 2 月 3 日发布的[这条推文](https://x.com/karpathy/status/1886192184808149383)，其中开头的部分如下

> There's a new kind of coding I call "vibe coding", where you fully give in to the vibes, embrace exponentials, and forget that the code even exists. It's possible because the LLMs (e.g. Cursor Composer w Sonnet) are getting too good.

仅从这段话的开头语句就可以窥见，vibe 所强调的正是一种“凭感觉”，是一种“忽略代码存在”的自由主义编程。Karpathy 认为这样做之所以可行，是因为我们现在的 LLM 表现的特别好。其实我本人在读完他写的这段话以后，觉得有些诧异——因为他的 vibe coding 似乎已经放飞自我了。

> I "Accept All" always, I don't read the diffs anymore. When I get error messages I just copy paste them in with no comment, usually that fixes it. The code grows beyond my usual comprehension, I'd have to really read through it for a while. Sometimes the LLMs can't fix a bug so I just work around it or ask for random changes until it goes away.

- 每次都选择“接受全部”，不阅读变更。
- 如果报错，就把报错原封不动地给 AI，不附加内容。他发现 AI 依旧可以修复错误。
- 当 LLM 没办法修复一个问题时，他便自己修复，或者**向 AI 寻求一些随意的修改，直到问题不存在**。

这些操作建立在对“LLMs are getting too good”的认知基础上，还算可以预见。综合看来，vibe coding 的具体含义逐渐明晰，这正是一种放飞自我、寻求“氛围/感觉”、忘却代码、依赖 LLM[^2] 的全新编程方式。而正是这种编程方式本身的特性，许多非程序员也能以极低的学习成本接触编程以及“零代码”地“写”出一个像样的产品出来。

[^2]: 这里的 LLM 应当是一些较为先进的模型。正如 Wikipedia 的定义中说的那样，它们应该是特化的编程专用模型。一些通用模型，如 DeepSeek-R1，在代码生成方面的能力并不如这些模型，面对一些可能复杂的工作，大概是达不到能让人*较为*放心地“give in to vibes”的标准的。毕竟，Karpathy 在做出这些操作时有认为“the LLMs are getting too good”。

:::danger
由于 vibe coding 这个词语本身的构造较为随意，在不同的人群中会衍生出不同的理解。下文中的 vibe coding 的含义将围绕这里所提过的 Wikipedia 定义以及 Karpathy 的原贴（为了更明确，下文有些地方会将 vibe coding 称为“严格的 vibe coding”）。
:::

## AI 代码工具

借助 AI coding 兴起的一部分围绕 AI 为核心的代码工具，它们与 vibe coding 有着密不可分的联系。

传统的代码工具，如 JetBrains 系列，其主要价值在于一些易于使用且在项目中会经常涉及的一些功能，如代码补全、重构、包管理、自动配置、版本控制图形化界面等等功能。即使是 Visual Studio Code，也是以其独特的庞大插件系统以及伴随而来的通用性著称。这些编辑器或集成环境，都有其扎实的软件工程基础。

相较于记事本，这些工具尝试以部分人的经验去简化一些在工程中常常遇到的操作，虽然不一定能满足所有人的需求，却可以满足相当一部分人。

AI 代码工具则不甚强调这些，它们主要围绕 AI 的使用，侧重点在如何让 AI 能够有效地调控、规划项目，给予用户合理的建议。其实如果说这样的工具能做出什么很大的项目来，我认为值得怀疑；但根据我个人的体验来看毋庸置疑的一点是，现在的 AI 的确能够读懂人类所写的一些代码并给出一些建议了。作为一项潮流，上面所说的那些传统的代码工具，也都在逐渐引入 AI 来拓展其功能，只不过范围并没有那样广泛，而是主要聚焦于更智能的代码补全与代码生成上。

所以在这里我认为需要明确一点：AI 辅助编程已经不是一种幻想，而是当今一个实打实存在的选项，程序员的效率将因此得到提高。

## 一种尝试

AI 这种工具具有超凡的灵活性，或许一定程度上是因为人类语言的特性。LLM 几乎可以生成任何你想要的内容。如果将上面的 AI 辅助编程思想继续扩大，让 LLM 帮我完成所有的工作——一种**纯 AI 编程**——是否可行呢？

这其实就有些贴合 vibe coding 的本意了——不加思索地将一切代码构建任务都交给 LLM 来完成，而人类只负责很小甚至没有的检验测试环节。从这里开始，人类将不再需要去考虑复杂的软件工程、程序架构甚至兼容性，而只需凭借自然语言和自己的想象力，向 LLM 描绘一幅绚丽的产品场景，就可以得到一份满意的答卷。

这其实挺令人激动的，以往需要耗费极大精力也不一定能做好的事情，如今可能变得不费吹灰之力。但事实是否真的如此，却变得十分难以考究——纯靠 AI 生成、少有人工介入的代码是不是真的可靠？会不会有漏洞、暗病甚至根本跑不起来？对此我不敢妄下定论。但凭借我早期浅薄的认知，我认为在程序员这样的群体之下，即使是这种程度的全 AI 编程，凭借着程序员个人的素养和经验，最终的代码仍然具备完全的可行性。

在专业的程序员的手里，纯 AI 编程出不了什么岔子。或者说，在知道自己在“干什么”的人为力量的介入下，纯 AI 编程也不至于失控，产出一些无效或有害代码出来。

但如果这样的前提被附加到 AI 上，对 AI 本身的智能性是有损伤的，人类并没有完全得到解放！一些人正在追求着完全的解放。

## 完全解放

> ...It's not too bad for throwaway weekend projects

在这里不得不再提起 Karpathy 在那条推文中提到的处理方式——一种最为正统（毕竟是本人提出）的 vibe coding：错误直接扔给 AI，不看变更直接用等等。这种方式的确对于一次性（throwaway）项目来说不成问题，毕竟需求简单、应用场景也比较狭窄；对于语言本身的学习，甚至任何形式的学习，也都不成问题[^3]。

[^3]: Three engineers interviewed by IEEE Spectrum agreed that vibe coding is a way for programmers to learn languages and technologies they are not yet familiar with. [ref](https://spectrum.ieee.org/vibe-coding)

如果此时我们停下来仔细想想，是否会察觉到一丝诡异：究竟为什么要去用这样“无脑”的方式来用 AI？为什么要把一些东西丢给 AI 以后，不附加任何有意义的 Prompt，期待 AI 能够回复一个完美的答案？哦...这样的质疑显得太没有道理了，因为“正如 Karpathy 和一众科学家所说的那样，现在的 AI 的确已经可以做到这些了！”...吗？

在行文的过程中，我总是会将 AI 辅助编程与 vibe coding 的概念弄混。这可能也是在一些 vibe coding 之争中常见的一种现象。因为 AI 辅助编程自始至终就没什么出大错的可能性，人力在这个时候是存在的、主要的。然而一旦转向 vibe coding，人力似乎就成了一种冗余，是一种不必要的自我消耗，vibe coding 的忠实拥趸们在不计代价地否定人的作用。

## 两种人类

### “我下班还要去玩”

这是一个现实的问题：当 AI 的确强大到可以在一定程度上取代人力，我们主动地使用 AI，尝试去大幅提高自己的效率，有没有问题？

**没有问题！**只要你知道自己在做什么。想象一下，一个具有一定工作经验的程序员，从他在没有 AI 存在的年代参加工作开始就一直凭借科班习得的方法按图索骥，在 AI 出现并且的确具备强大的能力以后，他选择使用 AI 去加速自己的工作，提早下班。如果说这样做的根本目的是糊弄客户，蒙骗老板，那其实和任何职业不端的行为没有什么两样，也并不需要再在 AI coding 的范畴内进行讨论了——这是个人的操守问题，也会伴随着相应的后果！但如果说这样做的根本目的是去加速自己的工作，并且只要工作能完成，就能提前下班，谁不愿意这样做呢？

在这种情境下，说来说去，其实完全没可能引到纯种 vibe coding 上，我们还是回到了上文中提到的 AI 辅助编程的大范围内。很显然，一个专业的工程是容纳不下不受控的 AI 编程的，是无法接受仿佛做白日梦一样的氛围编程的。

### “我几乎一行代码没写，用 Cursor 做了一个网站”

> Future be like tab tab tab[^4]

[^4]: https://x.com/karpathy/status/1827921103093932490

这里还存在一种对编程或者对编程可以达到的某种目的比较感兴趣，但毫无相关基础的人。它们便成为了 Cursor 这类软件的忠实用户，正所谓“有嘴就能做开发”。抛开个人体验用户、一次性工具/玩具项目用户不谈，这类软件的一部分具有构建产品需求的用户，可能幻想自己凭借在 AI 开发工具上消费，将自己的想法用*自己熟悉的语言*输入给 AI，便可以搭建出相当于一定水平（不低）程序员所能搭建出的**产品**来。诚然，这样做是有效果的，这是当前 AI 的强大能力所决定的，同时它们中的有些产品本身的技术含量可能很低，比如纯前端网页，这使得产品的实现（无论是人力还是 AI）并没有那么困难。

然而，正是因为 AI 不会主动抗拒人类的需求，以及一部分需求复杂度属实较低，产品需求用户的一部分便产生了一种与 AI 相关的全能论，这是一种刻骨铭心的、难以磨灭的赛博教条主义。

它之所以存在，是因为这种与常说的科技产品所谓体验官有几分相似的现代工业社会的模糊群像——对新事物保持好奇，却从来没有想过将其转变为自己个人能力的一亩三分地——始终以一个外行的视角（一种不被定义的角色）将自己嵌入时代的一些大讨论中，以此追寻存在感、价值感。他们所构造的自始至终不是真正的工程（因为这里假设这群用户是没有任何有效基础的），因为这些亚工程的内部工作机理从未有可见的系统化迹象，甚至不具有可预见的行为，即使有，也完全取决于背后的最终操盘者——人类心甘情愿将工作寄托的 LLM。而人类这一边在彻底脱离工程后，仍然不断地按自己的想法，书写着属于自己的工程文书。

## 一种切换

> The hottest new programming language is English.[^5]

[^5]: https://x.com/karpathy/status/1617979122625712128

:::warning
这里的“高级语言”是指现存的各种高级编程语言，如 C++。
:::

所以，一种严格的 vibe coding，或许真的可以看成是人类从高级语言编程转向自然语言编程这一重大步骤（但并不知道是伪步骤）的一个特别的案例：将自然语言翻译为高级语言。虽然目前来看有种操之过急的意味，但我不禁要提出：高级语言的下一步确为自然语言吗？这个问题其实不太恰当，高级语言的发展路径与自然语言的衔接性是存疑的，甚至这两者之间本身在结构上的共同点便没有多少（形式语言与自然语言），只是 AI 工具的出现使得“自然语言编程”成为了一种可能、趋势，至于其落地时的地位在哪里，不甚清楚，但可以明晰的一点是：自然语言编程的理念，与高级语言以及围绕其构建起来的软件工程体系是一定程度上互斥的。

既然高级语言与自然语言在结构上并无多少共同点，那么作为自然语言编程方式的先锋概念 vibe coding 是否值得长期信任？vibe coding 背后、位于 LLM 深处的可靠支柱是什么，应该如何对其进行评估？这一类的问题的答案，或许可以决定目前的纯 AI 编程究竟是一种前沿领域，还是单纯的投机取巧；伴生的编程工具，是一种前沿科技、IDE 的 Next Step，还是一小部分人用来蛊惑人心的时代红利（毕竟 AI 的成本与利润放在那里）。

Dijkstra 在他的 *On the foolishness of "natural language programming"*[^6] 中提到，形式化语言以其精细巧妙的规则，可以轻松剔除掉荒谬的错误，而这些错误在我们自然语言中不可避免。

[^6]: https://www.cs.utexas.edu/~EWD/ewd06xx/EWD667.PDF

> ...when we use our native tongues, are almost impossible to avoid

他甚至指出，所谓自然语言的“自然”，本质上是它可以让我们轻松地表达那些不容易察觉的荒谬论断。虽然 Dijkstra 发表这些文字是在上个世纪的 1978 年，但在如今的场景来看，这些想法丝毫不显得落后，尤其是他附加在最后的 Remark 部分，似乎真的能够在一定程度上概括当今 vibe coding 的一部分的忠实拥护者内心的乱象。Remark 段落引出了一个深刻的疑问：我们自己是否真的能够流畅、准确地运用我们的自然语言呢？

以及，如果再深刻一点，我们中是否存在相当多的一部分“新文盲”，连自己对 AI 的要求都表述不清呢？我们中是否还有正是因为自己是“新文盲”，就不再考虑为 AI 提供任何形式的 Prompt 而以**最 vibe** 的方式去使用 AI 呢？

> This phenomenon —known as "The New Illiteracy"— should discourage those believers in natural language programming that lack the technical insight needed to predict its failure.

直到这里，我认为在 vibe coding 的语境底下，vibe 还是一个中性的词语，它并不如我最初想的那样具有褒义或贬义。vibe 也是一个具有程度的词语，既可以最 vibe，也可以一点也不 vibe。

罔顾他人利益，只顾眼前利益的人不在少数，一些偏 vibe 的方式往往为投机取巧者提供了温床。至少在目前的生产工作中，这些操作并没有带来什么值得提起的实质上的危害。现实社会也并非象牙塔，它存在着许多的“残酷现实”，因此针对 vibe 的评价在道德标准上也仅限于上文这些引经据典、纸上谈兵式的、有所保留的、有阵营基础的、片面的主观分析，而不具有任何客观公认的评判标准。