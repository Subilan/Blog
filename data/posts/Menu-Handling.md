---
date: 2023/07/10
desc: 一些强迫症方面的考虑和最终的成功实现
cate: 代码
---

# Menu 组件的基本处理和实现

**Menu 组件**实际上并不是一个正统的称呼，但是也算是一个比较广泛使用的习惯性称呼。还有一些其它的 *de facto* 叫法，比如 Dropdown、MenuList 等。通俗来讲就是当一个被绑定的触发器被触发后所弹出的窗口。窗口内容通常表现为有序的列表，在某些实现里还有可能有部分的分割以及标题，例如
- [Vuetify 的 Menu](https://vuetifyjs.com/en/components/menus/)
- [MUI 的 react-menu](https://mui.com/material-ui/react-menu/)
- [VueMaterial 的 Menu](https://www.creative-tim.com/vuematerial/components/menu)
- [Arco Design 的 Menu](https://arco.design/react/components/menu)
- [Ant Design 的 Menu](https://ant.design/components/menu)

值得注意的是 Arco Design 和 Ant Design 两个国内较为成熟的方案中，都同时用到了一个概念——Navigation Menu，表现为水平或者竖直方向的导航栏。它们的表现更像是某种 Sidebar 而不是后触发的弹窗，同时也它们附带了本文中传统意义的 Menu。这一组件不是本文所讨论的范围。

在本文所述的 Menu 中包含两种元素：

- **触发器**（Activator） — 即触发 Menu 的元素，通常是 Button，在必要情况下可以是任何 *link-related*[^1] 元素。
- **本体** — 即 Menu 本体，默认应当处于隐藏的、不可点击状态

[^1]: *link-related* 在这里具体是指任何可以当作是“链接”作用的元素，一些原生的例子包含 `a`、`button`，当然还可以根据用途重新自定义新的。

:::warning
本文中的代码仅仅作说明作用，不能保证正常运行。
:::

## 本体的定位

本体应当出现在触发器附近，这是毫无疑问的。为了不挤占正常文档流的空间，而仅仅作为一个弹窗或者浮窗的存在，其理所应当具有 `position: absolute` 属性。由此推知，为了正确定位，它必须与触发器之间存在位置上的相对联系，也正因此，一般实现起来都会用到如下结构：

```html {1}
<div class="menu-wrapper">
    <div class="menu-activator">
        <button onclick="toggleMenu()">Open Menu</button>
    </div>
    <div class="menu">
        <div class="menu-item">Item 1</div>
        <div class="menu-item">Item 2</div>
    </div>
</div>

<style>
.menu-wrapper {
    position: relative;
}

.menu {
    position: absolute;
    top: /* ... */
}
</style>
```

在一些特殊的例子中，并不会用到这种含有 wrapper 的结构，而是将两者相独立，这在代码可读性和可维护性上有所帮助。然而，在这种情况下若想要实现位置的相对性，则需要用到额外的 JavaScript 代码和计算逻辑，并不是一种高效的解决方案。

## 本体的出现与消失

出现与消失的实现使用正常的 active 逻辑即可，具体代码如下：

```javascript
function toggleMenu() {
    const menu = document.querySelector('.menu')
    if (menu.classList.contains('active')) {
        menu.classList.remove('active')
    } else {
        menu.classList.add('active');
    }
}
```

```css
.menu {
    position: absolute;
    /* ... */

    display: none;
}

.menu.active {
    display: block; /* depends on needs */
}
```

这样就实现了下面两点：
- 本体的 `position: absolute` 属性确保了 Menu 不会干扰正常文档元素排布
- 在单击触发器后，可以实现 Menu 的显示状态的切换

由于我们切换的是 `display` 属性，其优点是可以保证在 `display: none` 状态的元素不再干扰文档中的点击事件，亦可以对此状态下的本体增加 `pointer-events: none` 的属性。然而缺点则是无法添加任何动画效果，固然是一种不成熟的方案。然而如果想要添加动画效果，就可能会带来一些另外的问题。

## 本体的显示—消失动画与相关问题的解决

对于动画，我们首先想到的是与显示—消失直接相关的不透明度的调整。

```css
.menu {
    opacity: 0;
    transition: opacity .2s ease;
}

.menu.active {
    opacity: 1;
}
```

注意，在上面的代码中不能使用 `display` 来切换，否则会导致 transition 效果的丢失。然而没有了 `display`，即使是在 `opacity: 0` 的不可见情况下，其内容仍然存在于某个位置，比如触发器的正下方。这个时候当鼠标移动时，仍然会有相关事件的产生。

为了解决这个问题，我们会自然地想到 `pointer-events` 属性，于是将其修改成这样：

```css
.menu {
    opacity: 0;
    transition: opacity .2s ease;
    pointer-events: none;
}

.menu.active {
    opacity: 1;
    pointer-events: auto; /* 不建议使用 all */
}
```

`pointer-events` 属性固然好用，但是不加研究仍然可能触碰到雷区。一些对 `pointer-events: none` 的肤浅理解包括，它可以让鼠标“直接透过”被应用 `pointer-events: none` 的元素而不产生任何交互。这在某些情况下也许是对的，但并不是 `pointer-events: none` 所表达的本质。[MDN 上对 `pointer-events: none` 的解释](https://developer.mozilla.org/en-US/docs/Web/CSS/pointer-events#:~:text=The%20element%20is,capture/bubble%20phases.)是这样说的。

> `pointer-events: none` - The element is never the target of pointer events; however, pointer events may target its descendant elements if those descendants have pointer-events set to some other value. In these circumstances, pointer events will trigger event listeners on this parent element as appropriate on their way to/from the descendant during the event capture/bubble phases.

简单而言，就是该属性仅仅屏蔽了元素自身的事件，但是对于其子代元素（descendant）的事件冒泡/监听仍然会有相关的反应。此外还有一点便是，“直接透过”的效果只能发生在被屏蔽事件的元素处于某一父元素的包装下的情况，其透过后所指对象是父元素。

例如一个 box 里装了一个 button，对该 button 设置 `pointer-events: none`，那么鼠标在 button 上的 events 相当于传递给了 box，这就是“透过”。然而，如果在某种布局设定下， button 对 box 有溢出，溢出的部分位于 box 的外部，且该部分下遮挡了 button2，那么无论如何点击 button，button2 都无法接收到点击事件，因为 button2 与 button 虽然有布局上的遮挡但是没有直接的父—子关系，这一点就不能称为“透过”，而只能算作“完全遮挡”。

因此，为了避免这样的意外发生，我们最好还是避免使用 `pointer-events` 事件。当然，如果 Menu 满足上述的一些条件，使用起来也不会有太大的问题。

### 解决方案一：`z-index` 的切换

我们的目标是将 `opacity: 0` 状态下的 Menu 完全从鼠标事件中屏蔽掉，其中可以考虑的一个方案是调整其 Z 轴层级。当然 `z-index` 也不是没有坑，比如[所适用的对象的 `position` 值不能是 `static`](https://stackoverflow.com/questions/9191803/why-does-z-index-not-work)、[Stacking Context 创建条件(MDN)](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_positioned_layout/Understanding_z-index/Stacking_context)。不过，如果你有一套较为完整的 `z-index` 排列，就可以考虑这个方案。

- 对 `opacity: 0` 的状态设定最低 `z-index`，可以是 `0`、`-1` 等，要求低于其父级元素的 `z-index`
- 对 `opacity: 1` 的状态设定较高 `z-index`，要求高于其父级元素（以及应当被遮挡的一些元素）的 `z-index`

这种情况下就可以避免当 `opacity: 0` 时鼠标仍然可以选中被隐藏的主体的问题。但这样做仍然不是完美的，因为对于其遮挡物，由于 `z-index` 不存在渐变的中间态，在 `opacity` 过渡的过程中会出现一些层级错乱的现象，取决于具体的层级设置。这一点如果不是强迫症，或者遮挡的区域没有样式大可以忽略。

### 解决方案二：`display` + `setTimeout` 排除对动画效果的影响

考虑到 `display: none` 可以直接满足我们的需求，并不一定要将其放弃，而是可以与 `setTimeout` 结合来*避免同时应用*效果的时候破坏 `opacity` 的 transition。

```css
.menu {
    opacity: 0;
    transition: opacity .2s ease;
}

.menu.active {
    opacity: 1;
}
```

```javascript
function toggleMenu() {
    const menu = document.querySelector('.menu')
    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        setTimeout(() => {
            menu.style.display = 'none';
        }, 200)
    } else {
        menu.style.display = 'block';
        setTimeout(() => {
            menu.classList.add('active');
        }, 1)
    }
}
```

进入 active 状态之前将 `display` 改为正常值，然后设置一个 1 毫秒的 timeout 即可实现动画效果的正常呈现。退出 active 状态后，设置一个与 transition duration 相等时长的 timeout，等待 duration 结束后再将 `display` 改为 `none`。这样就可以避免 `display` 的切换影响动画的过渡。

注意，在这里不建议除了修改 `display` 以外的其它 style 操作。对于动画的前后状态的描述应该放在 `.menu` 和 `.menu.active` 里以避免过度使用 JS 操作 DOM。

## 点击外部以关闭

根据直觉以及一般使用的习惯而言，这样的 Menu 打开以后，可以通过单击其它部分关闭。我们在这里要首先作出一个对关闭行为的划分

- 类型 1：Menu 自身逻辑导致的关闭
- 类型 2：点击外部的关闭

这两种关闭都是关闭，但是在实现上有所区别。先说点击外部的关闭。一个常见的做法是监听 `document` 上的任意点击事件。这样虽然有点性能上的顾虑，但实际上这也是实现这一特性所必须的监听。

```javascript
document.addEventListener('click', e => {
    const el = e.target // as HTMLElement, in typescript
    const activator = el.closest('#activator');
    const menuBox = el.closest('#menu-box');
    if (wrapper === null && activator === null) {
        closeMenu(); // 此处不应为 toggleMenu 而应是绝对的 closeMenu 操作
    }
})
```

`activator` 和 `menuBox` 分别对应的是承载触发器和本体的包装父元素，它们都应该有相关的可供选择器选择的属性设置。通过上面的判断可以知道是否是点击了自身逻辑范围（即类型 2）内的元素。如果没有，那就可以认定是在“点击外部”，然后就可以直接关闭了。除此之外还可以选择性地添加一个判断 Menu 是否已经开启的逻辑。

对于第二种类型，可以自行在本体内的元素设置。将这两种类型隔开有助于有序地设定相关事件。

## 完整代码

```html
<script>
function toggleMenu() {
    const menu = document.querySelector('.menu')
    if (menu.classList.contains('active')) {
        menu.classList.remove('active');
        setTimeout(() => {
            menu.style.display = 'none';
        }, 200)
    } else {
        menu.style.display = 'block';
        setTimeout(() => {
            menu.classList.add('active');
        }, 1)
    }
}
</script>

<style>
.menu-wrapper {
    position: relative;
}

.menu {
    position: absolute;
    /* ... */
    opacity: 0;
    transition: opacity .2s ease;
}

.menu.active {
    opacity: 1;
}
</style>

<div class="menu-wrapper">
    <div class="menu-activator">
        <button onclick="toggleMenu()">Open Menu</button>
    </div>
    <div class="menu" style="display: none">
        <div class="menu-item">Item 1</div>
        <div class="menu-item">Item 2</div>
    </div>
</div>
```