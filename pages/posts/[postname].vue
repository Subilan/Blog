<template>
  <div class="container">
    <article>
      <h1>{{ post.title }}</h1>
      <div class="extra">
        <span>
          <icon :path="mdiClockOutline" /> {{ post.date }}
        </span>
        <span>
          <icon :path="mdiFormatTextVariant" /> 约 {{ post.wordCount }} 字
        </span>
        <span v-if="post.cate">
          <icon :path="mdiShapeOutline" /> {{ post.cate }}
        </span>
      </div>
      <!-- <div class="outdated-warning card" v-if="dayDelta >= 730 && !post.ignoreOutdate">
        <h3>
          <icon :path="mdiClockAlertOutline" /> 可能过时的信息
        </h3>
        <p>你正阅读的文章的发布日期距今已经有 <strong>{{ dayAgo }}</strong>了，其中的部分信息、个人观点或者措辞习惯等可能已经发生改变，因此仅供参考，请酌情阅读。</p>
      </div> -->
      <div class="outdated-warning-mono card" v-if="dayDelta >= 730 && !post.ignoreOutdate">
        <h3>
          <em>Heads Up!</em><br/><small>可能过时的信息</small>
        </h3>
        <p>你正阅读的文章的发布日期距今已经有 <strong>{{ dayAgo }}</strong>了，其中的部分信息、个人观点或者措辞习惯等可能已经发生改变，因此仅供参考，请酌情阅读。</p>
      </div>
      <div class="toc-container" v-if="post.headings.length > 0">
        <div class="toc">
          <div class="toc-container-header">目录</div>
          <ul>
            <li v-for="x in post.headings">
              <a :href="`#${x.heading.s}`" v-html="x.heading.t" />
              <ul v-if="x.children.length > 0">
                <li v-for="y in x.children">
                  <a :href="`#${y.s}`" v-html="y.t" />
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
      <div class="content" v-html="post.content" />
    </article>
  </div>
</template>

<script setup>
import getPostContent from "@/utils/getPostContent.js";
import mediumZoom from "medium-zoom";
import { mdiClockOutline, mdiFormatTextVariant, mdiShapeOutline } from "@mdi/js";

const slug = useRoute().params.postname;
const post = getPostContent(slug.toLowerCase());

const childrenMap = {};
post.headings.map(x => x.children.map(y => {
  return {
    parent: x.heading.s,
    current: y.s
  }
})).flat().forEach(x => {
  childrenMap[x.current] = x.parent;
})

const dayDelta = computed(() => (new Date().getTime() - new Date(post.date).getTime()) / (1000 * 3600 * 24));
const dayAgo = computed(() => getAgo(post.date, true));

function scrollLoop() {
  const tocElements = Array.from(document.querySelectorAll('.toc a'));
  const viewportElements = Array.from(document.querySelectorAll('[data-section]')).filter(el => isElementInViewport(el));

  let maxPortion = 0;
  let maxPortionSlug = '';
  let maxPortionParentSlug = '';

  if (viewportElements.length > 0) {
    const viewportSectionNames = viewportElements.map(y => y.getAttribute('data-section'));

    const uniqueNames = viewportSectionNames.filter((x, i) => viewportSectionNames.indexOf(x) === i).map(u => {
      return {
        s: u,
        n: viewportElements.filter(el => el.getAttribute('data-section') === u).reduce((a, b) => a + b.clientHeight, 0)
      }
    })

    const uniqueNamePortions = uniqueNames.map(u => {
      return {
        s: u.s,
        p: u.n / window.innerHeight
      }
    });
    for (let u of uniqueNamePortions) {
      if (u.p >= maxPortion) {
        maxPortionSlug = u.s; // 最终需要的
        maxPortion = u.p;
      }
    }

    maxPortionParentSlug = hasKey(childrenMap, maxPortionSlug) ? childrenMap[maxPortionSlug] : '';
  }

  tocElements.filter(x => x.getAttribute('href') !== '#' + maxPortionSlug && x.getAttribute('href') !== '#' + maxPortionParentSlug).forEach(el => el.classList.remove('active'));
  const targetTocElement = document.querySelector(`.toc a[href="#${maxPortionSlug}"]`);
  const targetTocElementParent = hasKey(childrenMap, maxPortionSlug) ? document.querySelector(`.toc a[href="#${maxPortionParentSlug}"]`) : null;

  if (targetTocElement !== null) targetTocElement.classList.add('active');
  if (targetTocElementParent !== null) targetTocElementParent.classList.add('active');
}

onMounted(() => {
  mediumZoom('article .content img', {
    background: 'rgba(0, 0, 0, .6)'
  });

  scrollLoop();

  document.addEventListener('scroll', e => scrollLoop())
})

definePageMeta({
  layout: 'post',
  middleware: [
    (to, from) => {
      const slug = to.params.postname;

      if (getPostContent(slug) === null) {
        return abortNavigation(createError({
          statusCode: 404,
          statusMessage: 'Page Not Found'
        }));
      }
    }
  ]
})

useSeoMeta({
  articleModifiedTime: post.date.replace(/\//g, '-')
})

defineOgImageComponent('blog-post', {
  postTitle: post.title,
  date: post.date,
  wordCount: post.wordCount
})
</script>

<style lang="scss">
@use "@/assets/languagenames";
@use "@/assets/var";

.container {
  max-width: 800px;
  margin: 0 auto;
}

.content {
  padding: 16px 0;
}

:root.style-classic .outdated-warning-mono {
  border-radius: 10px;
  border: 1px dashed var(--primary);
}

:root.style-typecho .outdated-warning-mono {
  background-color: var(--bg-dim);
  border-radius: 5px;
  h3 {
    color: var(--typecho-red);
  }
}

.outdated-warning-mono {
  padding: 16px;
  margin-top: 16px;
  
  h3 {
    font-size: 20px;
    margin: 0;
    border-bottom: none;
  }
}

// .dark .outdated-warning {
//   background: rgba(#fff8e1, .2);
//   border-color: rgba(#ffc107, .3);

//   h3,
//   strong {
//     color: #ffc107;
//   }

//   p {
//     color: white;
//   }
// }

// .outdated-warning {
//   margin-top: 16px;
//   background: #fff8e1;
//   padding: 16px;
//   border: 1px dashed #ffc107;
//   color: black;
//   border-radius: 10px;
//   text-align: center;

//   p {
//     margin: 8px 0;
//   }

//   h3,
//   strong {
//     color: #bf360c;
//   }

//   h3 {
//     font-size: 20px;
//     margin: 0;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     gap: 8px;
//     line-height: 1.5;
//   }
// }

.extra {
  display: flex;
  align-items: center;
  font-size: 14px;
  padding-bottom: 8px;

  span:not(:last-child)::after {
    content: '·';
    margin: 0 4px;
  }

  span {
    display: flex;
    align-items: center;
    gap: 5px;
    line-height: 1;

    svg {
      width: 16px;
      color: var(--base);
    }
  }
}
</style>