import MarkdownIt from 'markdown-it';
import fs from 'fs/promises';
import fm from 'front-matter';
import pluginSub from 'markdown-it-sub';
import pluginSup from 'markdown-it-sup';
import pluginMathjax3 from 'markdown-it-mathjax3';
import pluginShiki from '@shikijs/markdown-it';
import pluginFootnote from 'markdown-it-footnote';
import pluginExternalLinks from 'markdown-it-external-links';
import { DOMSelector } from '@asamuzakjp/dom-selector';
import { JSDOM } from 'jsdom';

import {
    transformerMetaHighlight,
    transformerMetaWordHighlight,
    transformerNotationDiff,
    transformerNotationErrorLevel,
    transformerNotationFocus,
    transformerNotationHighlight,
} from '@shikijs/transformers'

const md = MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
    langPrefix: 'language-'
})
    .use(pluginExternalLinks, {
        externalTarget: '_blank',
        externalRel: 'noopener noreferrer'
    })
    .use(pluginSup)
    .use(pluginSub)
    .use(pluginFootnote)
    .use(pluginMathjax3)
    .use(await pluginShiki({
        themes: {
            light: 'github-light',
            dark: 'github-dark',
        },
        transformers: [
            transformerNotationDiff(),
            transformerNotationErrorLevel(),
            transformerNotationFocus(),
            transformerNotationHighlight(),
            transformerMetaHighlight(),
            transformerMetaWordHighlight()
        ]
    }));


const slugify = s => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-').substring(0, 50));
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

    // console.log('Reverting markdown-it-anchor result.');

    // // Remove slugification result by markdown-it-anchor
    // for (const headerWrapper of document.querySelectorAll('.header-wrapper')) {
    //     const tg = headerWrapper.querySelector('h2, h3');
    //     if (tg === null) continue;
    //     console.log(`Removed slug ${tg.getAttribute('id')}.`);
    //     headerWrapper.parentNode.replaceChild(tg.cloneNode(true), headerWrapper);
    // }

    console.log('Adding language labels');

    for (const code of document.querySelectorAll('code[class^="language-"]')) {
        const languageMatch = code.getAttribute('class').match(/language-([A-Za-z#\+]+)/);

        if (languageMatch === null) continue;

        const languageName = languageMatch[1];
        const preContainer = document.createElement('div');
        preContainer.classList.add('pre-container');

        const label = document.createElement('div');
        label.classList.add('language-label');
        label.innerHTML = languageName;

        const pre = code.parentNode;

        preContainer.appendChild(label);
        preContainer.appendChild(pre.cloneNode(true))

        pre.parentNode.replaceChild(preContainer, pre);
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

async function render(content) {
    console.log(`Rendering using markdown-it.`);
    console.log(`Rendering notice blocks.`);

    const match1 = Array.from(content.matchAll(/:::\s?tip([\S\s]*?):::/g));
    const match2 = Array.from(content.matchAll(/:::\s?warning([\S\s]*?):::/g));
    const match3 = Array.from(content.matchAll(/:::\s?danger([\S\s]*?):::/g));
    const match4 = Array.from(content.matchAll(/:::\s?thought([\S\s]*?):::/g));
    const targetMatch = ['tip', 'warning', 'danger', 'thought'];
    const targetMatchText = [
        {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>information-outline</title><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" /></svg>',
            name: 'Info'
        },
        {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>lead-pencil</title><path d="M16.84,2.73C16.45,2.73 16.07,2.88 15.77,3.17L13.65,5.29L18.95,10.6L21.07,8.5C21.67,7.89 21.67,6.94 21.07,6.36L17.9,3.17C17.6,2.88 17.22,2.73 16.84,2.73M12.94,6L4.84,14.11L7.4,14.39L7.58,16.68L9.86,16.85L10.15,19.41L18.25,11.3M4.25,15.04L2.5,21.73L9.2,19.94L8.96,17.78L6.65,17.61L6.47,15.29" /></svg>',
            name: 'Note'
        },
        {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>alert-outline</title><path d="M12,2L1,21H23M12,6L19.53,19H4.47M11,10V14H13V10M11,16V18H13V16" /></svg>',
            name: 'Warning'
        },
        {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>thought-bubble-outline</title><path d="M3.5,19A1.5,1.5 0 0,1 5,20.5A1.5,1.5 0 0,1 3.5,22A1.5,1.5 0 0,1 2,20.5A1.5,1.5 0 0,1 3.5,19M8.5,16A2.5,2.5 0 0,1 11,18.5A2.5,2.5 0 0,1 8.5,21A2.5,2.5 0 0,1 6,18.5A2.5,2.5 0 0,1 8.5,16M14.5,15C13.31,15 12.23,14.5 11.5,13.65C10.77,14.5 9.69,15 8.5,15C6.54,15 4.91,13.59 4.57,11.74C3.07,11.16 2,9.7 2,8A4,4 0 0,1 6,4L6.77,4.07C7.5,3.41 8.45,3 9.5,3C10.69,3 11.77,3.5 12.5,4.35C13.23,3.5 14.31,3 15.5,3C17.46,3 19.09,4.41 19.43,6.26C20.93,6.84 22,8.3 22,10A4,4 0 0,1 18,14L17.23,13.93C16.5,14.59 15.55,15 14.5,15M6,6A2,2 0 0,0 4,8A2,2 0 0,0 6,10C6.33,10 6.64,9.92 6.92,9.78C6.66,10.12 6.5,10.54 6.5,11A2,2 0 0,0 8.5,13C9.1,13 9.64,12.73 10,12.31V12.31L11.47,10.63L13,12.34V12.34C13.38,12.74 13.91,13 14.5,13C15.5,13 16.33,12.26 16.5,11.3C16.84,11.73 17.39,12 18,12A2,2 0 0,0 20,10A2,2 0 0,0 18,8C17.67,8 17.36,8.08 17.08,8.22C17.34,7.88 17.5,7.46 17.5,7A2,2 0 0,0 15.5,5C14.91,5 14.38,5.26 14,5.66L12.47,7.37L11,5.69V5.69C10.64,5.27 10.1,5 9.5,5C8.5,5 7.67,5.74 7.5,6.7C7.16,6.27 6.61,6 6,6M8.5,17.5A1,1 0 0,0 7.5,18.5A1,1 0 0,0 8.5,19.5A1,1 0 0,0 9.5,18.5A1,1 0 0,0 8.5,17.5Z" /></svg>',
            name: 'Thoughts'
        }  
    ];

    [match1, match2, match3, match4].forEach((x, i) => {
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
    const currentDir = import.meta.dirname;
    const dataDir = `${currentDir}/data`;

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

            const rendered = await render(contentWithoutTitle);

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
                descShort: frontMatterResult.attributes['desc-short'],
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
                        descShort: res.descShort,
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

    console.log(`OK: built ${postContents.length} posts and ${pageContents.length} pages in ${((end.getTime() - start.getTime()) / 1000).toFixed(2)}s.`)

    const postStat = await fs.stat(`${dataDir}/posts.json`);
    // const pageStat = await fs.stat(`${dataDir}/pages.json`);
    const postdigestsStat = await fs.stat(`${dataDir}/postdigests.json`);
    const postsearchStat = await fs.stat(`${dataDir}/postsearch.json`);

    console.log(`Size: posts.json=${postStat.size / 1000000} MB, postdigests.json=${postdigestsStat.size / 1000000} MB, postsearch.json=${postsearchStat.size / 1000000} MB`)
})();