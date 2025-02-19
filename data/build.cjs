const markdownit = require("markdown-it");
const fs = require('fs/promises')
const fm = require('front-matter');

const slugify = s => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-').substring(0, 50));
const assistiveText = title => `永久链接`;
const HEADING_SYMBOL = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>永久链接</title><path d="M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z" /></svg>';
const BETWEEN_SELECTOR_TEMPLATE = '#1 ~ :not( #2 ~ * ):not( #2 )';
const AFTER_SELECTOR_TEMPLATE = '#1 ~ *';

function getHeadings(content) {
    let m;
    let cursor = -1;
    const result = [];

    const headingRegex = /<h(2|3).*?>([\s\S]*?)<\/h[2-3]>/gm;

    while ((m = headingRegex.exec(content)) !== null) {
        if (m.index === headingRegex.lastIndex) {
            headingRegex.lastIndex++;
        }

        const level = m[1];
        const content = m[2].trim();

        if (level === '2') {
            result.push({
                heading: {
                    t: content,
                    s: slugify(content)
                },
                children: []
            });
            cursor++;
        }

        if (level === '3') {
            result[cursor].children.push({
                t: content,
                s: slugify(content)
            });
        }
    }

    return result;
}

function processHTML(html, headings) {
    console.log('Post processing rendered HTML.')

    const { JSDOM } = require('jsdom');
    const { DOMSelector } = require('@asamuzakjp/dom-selector');

    console.log(`Loading DOM`)

    const { window } = new JSDOM(`<!DOCTYPE html><main>${html}</main>`, {
        // https://github.com/asamuzaK/domSelector?tab=readme-ov-file#monkey-patch-jsdom
        beforeParse: window => {
            const domSelector = new DOMSelector(window);

            const matches = domSelector.matches.bind(domSelector);
            window.Element.prototype.matches = function (...args) {
                if (!args.length) {
                    throw new window.TypeError('1 argument required, but only 0 present.');
                }
                const [selector] = args;
                return matches(selector, this);
            };

            const closest = domSelector.closest.bind(domSelector);
            window.Element.prototype.closest = function (...args) {
                if (!args.length) {
                    throw new window.TypeError('1 argument required, but only 0 present.');
                }
                const [selector] = args;
                return closest(selector, this);
            };

            const querySelector = domSelector.querySelector.bind(domSelector);
            window.Document.prototype.querySelector = function (...args) {
                if (!args.length) {
                    throw new window.TypeError('1 argument required, but only 0 present.');
                }
                const [selector] = args;
                return querySelector(selector, this);
            };
            window.DocumentFragment.prototype.querySelector = function (...args) {
                if (!args.length) {
                    throw new window.TypeError('1 argument required, but only 0 present.');
                }
                const [selector] = args;
                return querySelector(selector, this);
            };
            window.Element.prototype.querySelector = function (...args) {
                if (!args.length) {
                    throw new window.TypeError('1 argument required, but only 0 present.');
                }
                const [selector] = args;
                return querySelector(selector, this);
            };

            const querySelectorAll = domSelector.querySelectorAll.bind(domSelector);
            window.Document.prototype.querySelectorAll = function (...args) {
                if (!args.length) {
                    throw new window.TypeError('1 argument required, but only 0 present.');
                }
                const [selector] = args;
                return querySelectorAll(selector, this);
            };
            window.DocumentFragment.prototype.querySelectorAll = function (...args) {
                if (!args.length) {
                    throw new window.TypeError('1 argument required, but only 0 present.');
                }
                const [selector] = args;
                return querySelectorAll(selector, this);
            };
            window.Element.prototype.querySelectorAll = function (...args) {
                if (!args.length) {
                    throw new window.TypeError('1 argument required, but only 0 present.');
                }
                const [selector] = args;
                return querySelectorAll(selector, this);
            };
        }
    });

    const { document } = window;

    console.log('Reverting markdown-it-anchor result.');

    // Remove slugification result by markdown-it-anchor
    for (const headerWrapper of document.querySelectorAll('.header-wrapper')) {
        const tg = headerWrapper.querySelector('h2, h3');
        if (tg === null) continue;
        console.log(`Removed slug ${tg.getAttribute('id')}.`);
        headerWrapper.parentNode.replaceChild(tg.cloneNode(true), headerWrapper);
    }

    console.log('Building permalinks.');

    // Manually build permalink
    for (const h of document.querySelectorAll('h2, h3')) {
        const slug = slugify(h.innerHTML);
        h.setAttribute('id', slug)
        const wrapper = document.createElement('div');
        wrapper.classList.add('header-wrapper');
        wrapper.innerHTML = `<${h.tagName.toLowerCase()} id="${slug}" tabindex="-1">${h.innerHTML}</${h.tagName.toLowerCase()}><a class="header-anchor" href="#${slug}"><span aria-hidden="true">${HEADING_SYMBOL}</span></a>`;
        console.log(`Built slug ${slug}.`);
        h.parentNode.replaceChild(wrapper, h);
    }

    console.log('Adding section information to visible elements.')

    const headingsFlat = headings.map(x => [
        { h: 2, t: x.heading.t, s: x.heading.s }, ...x.children.map(y => {
            return { h: 3, t: y.t, s: y.s };
        })
    ]).flat();

    for (let i = 0; i < headingsFlat.length - 1; i++) {
        const thisOne = headingsFlat[i];
        const nextOne = headingsFlat[i + 1];
        const selector = BETWEEN_SELECTOR_TEMPLATE.replace('#1', `.header-wrapper:has(h${thisOne.h}[id="${thisOne.s}"])`).replace(/#2/g, `.header-wrapper:has(h${nextOne.h}[id="${nextOne.s}"])`);

        console.log(`Selecting between h${thisOne.h} ${thisOne.s} and h${nextOne.h} ${thisOne.s}.`);

        for (const el of document.querySelectorAll(selector)) {
            el.setAttribute('data-section', thisOne.s);
        }
    }

    if (headingsFlat.length > 0) {
        const lastOne = headingsFlat[headingsFlat.length - 1];
        const lastSelector = AFTER_SELECTOR_TEMPLATE.replace('#1', `.header-wrapper:has(h${lastOne.h}[id="${lastOne.s}"])`);

        console.log(`Selecting rest, after h${lastOne.h} ${lastOne.s}.`);

        for (const el of document.querySelectorAll(lastSelector)) {
            el.setAttribute('data-section', lastOne.s);
        }
    }

    console.log('HTML post processing completed.')

    return document.querySelector('main').innerHTML;
}

function getTitle(text) {
    const regexResult = /#\s(.*)/.exec(text);
    return regexResult[1];
}

function countWordsCJK(text) {
    return (text.match(/[\u00ff-\uffff]|\S+/g) || []).length;
}

function stripHtml(html) {
    return html.replace(/<[^>]*>?/gm, '');
}

function render(content) {
    console.log(`Rendering using markdown-it.`);

    const pluginAnchor = require('markdown-it-anchor');
    const md = markdownit({
        html: true,
        linkify: true,
        breaks: true,
        langPrefix: 'language-'
    })
        .use(require('markdown-it-external-links'), {
            externalTarget: '_blank',
            externalRel: 'noopener noreferrer'
        })
        .use(require('markdown-it-highlight-lines'))
        .use(require('markdown-it-prism'), {
            defaultLanguage: 'plaintext'
        })
        .use(require('markdown-it-sup'))
        .use(require('markdown-it-sup'))
        .use(require('markdown-it-footnote'))
        .use(require('markdown-it-mathjax3'), {});

    console.log(`Rendering notice blocks.`);

    const match1 = Array.from(content.matchAll(/:::\s?tip([\S\s]*?):::/g));
    const match2 = Array.from(content.matchAll(/:::\s?warning([\S\s]*?):::/g));
    const match3 = Array.from(content.matchAll(/:::\s?danger([\S\s]*?):::/g));
    const targetMatch = ['tip', 'warning', 'danger'];
    const targetMatchText = [
        {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>information-outline</title><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" /></svg>',
            name: '信息'
        },
        {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>alert-outline</title><path d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" /></svg>',
            name: '注意'
        },
        {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>alert-octagon-outline</title><path d="M8.27,3L3,8.27V15.73L8.27,21H15.73C17.5,19.24 21,15.73 21,15.73V8.27L15.73,3M9.1,5H14.9L19,9.1V14.9L14.9,19H9.1L5,14.9V9.1M11,15H13V17H11V15M11,7H13V13H11V7" /></svg>',
            name: '特别注意'
        }
    ];

    [match1, match2, match3].forEach((x, i) => {
        x.forEach(y => {
            content = content.replace(y[0], `<div class="notice card ${targetMatch[i]}"><div class="notice-title">${targetMatchText[i].icon}${targetMatchText[i].name}</div>${md.render(y[1])}</div>`);
        });
    });

    console.log(`Render completed.`)

    return md.render(content);
}

(async () => {
    const start = new Date();

    // get script dir
    const dataDir = __dirname;

    const pageContents = [];
    const postContents = [];
    const postDigests = [];
    const postSearch = [];

    for (let type of ['posts']) {
        const filenames = await fs.readdir(`${dataDir}/${type}`);
        for (let filename of filenames) {
            console.log(`Start building ${filename}.`);

            const targetPath = `${dataDir}/${type}/${filename}`;
            const fileStat = await fs.stat(targetPath);
            if (!fileStat.isFile()) continue;
            const fileContent = await fs.readFile(targetPath);

            const nameFull = filename;
            const name = nameFull.replace('.md', '');

            const content = fileContent.toString('utf-8');

            const frontMatterResult = fm(content);
            // Note: getTitle could only work without frontmatters.
            const title = getTitle(frontMatterResult.body);

            const contentWithoutTitle = frontMatterResult.body.replace('# ' + title, '').trim();

            const rendered = render(contentWithoutTitle);

            console.log('Retrieving heading list.')

            const headings = getHeadings(rendered);

            const res = {
                nameFull,
                name,
                slug: name.toLowerCase(),
                headings,
                content: processHTML(rendered, headings),
                date: frontMatterResult.attributes.date,
                desc: frontMatterResult.attributes.desc,
                cate: frontMatterResult.attributes.cate,
                ignoreOutdate: frontMatterResult.attributes.ignoreOutdate || false,
                hidden: frontMatterResult.attributes.hidden || false,
                title,
                wordCount: countWordsCJK(content)
            };

            switch (type) {
                // case 'pages': {
                //     pageContents.push(res);
                //     break;
                // }

                case 'posts': {
                    console.log(`Push content ${res.title}.`)

                    postContents.push(res);

                    console.log(`Push digest ${res.title}.`)

                    postDigests.push({
                        title: res.title,
                        slug: res.slug,
                        desc: res.desc,
                        date: res.date,
                        cate: res.cate,
                        hidden: res.hidden,
                        wordCount: res.wordCount
                    });

                    console.log(`Push search ${res.title}.`)

                    postSearch.push({
                        title: res.title,
                        slug: res.slug,
                        name: res.name,
                        hidden: res.hidden,
                        cate: res.cate,
                        date: res.date,
                        content: stripHtml(res.content),
                        wordCount: res.wordCount,
                        filesize: fileStat.size
                    })

                    break;
                }
            }
        }
    }

    console.log(`Writing files`)

    await fs.writeFile(`${dataDir}/posts.json`, JSON.stringify(postContents));
    // await fs.writeFile(`${dataDir}/test001.json`, JSON.stringify(postContents.filter(x => x.title.includes('北疆'))));
    // await fs.writeFile(`${dataDir}/pages.json`, JSON.stringify(pageContents));
    await fs.writeFile(`${dataDir}/postdigests.json`, JSON.stringify(postDigests));
    await fs.writeFile(`${dataDir}/postsearch.json`, JSON.stringify(postSearch));

    const end = new Date();

    console.log(`OK: built ${postContents.length} posts and ${pageContents.length} pages in ${end.getTime() - start.getTime()}ms.`)

    const postStat = await fs.stat(`${dataDir}/posts.json`);
    // const pageStat = await fs.stat(`${dataDir}/pages.json`);
    const postdigestsStat = await fs.stat(`${dataDir}/postdigests.json`);
    const postsearchStat = await fs.stat(`${dataDir}/postsearch.json`);

    console.log(`Size: posts.json=${postStat.size / 1000000} MB, postdigests.json=${postdigestsStat.size / 1000000} MB, postsearch.json=${postsearchStat.size / 1000000} MB`)
})();