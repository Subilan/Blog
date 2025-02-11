const markdownit = require("markdown-it");
const fs = require('fs/promises')
const fm = require('front-matter');

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
        .use(require('markdown-it-mathjax3'), {})
        .use(require('markdown-it-toc-done-right'), {
            slugify: s => encodeURI(s)
        });

    const match1 = Array.from(content.matchAll(/:::\s?tip([\S\s]*?):::/g));
    const match2 = Array.from(content.matchAll(/:::\s?warning([\S\s]*?):::/g));
    const match3 = Array.from(content.matchAll(/:::\s?danger([\S\s]*?):::/g));
    const targetMatch = ['tip', 'warning', 'danger'];
    const targetMatchText = [
        {
            icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><title>information-outline</title><path d="M11,9H13V7H11M12,20C7.59,20 4,16.41 4,12C4,7.59 7.59,4 12,4C16.41,4 20,7.59 20,12C20,16.41 16.41,20 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M11,17H13V11H11V17Z" /></svg>',
            name: '提示'
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

            const res = {
                nameFull,
                name,
                slug: name.toLowerCase(),
                content: render(contentWithoutTitle),
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
                    postContents.push(res);

                    postDigests.push({
                        title: res.title,
                        slug: res.slug,
                        desc: res.desc,
                        date: res.date,
                        cate: res.cate,
                        hidden: res.hidden,
                        wordCount: res.wordCount
                    });

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

    await fs.writeFile(`${dataDir}/posts.json`, JSON.stringify(postContents));
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