// noinspection JSCheckFunctionSignatures,JSValidateTypes

const MarkdownIt = require("markdown-it");
const fm = require("front-matter")
const fs = require("fs");
const {v5} = require("uuid");
const anchor = require("markdown-it-anchor");
const jsdom = require("jsdom");
const util = require("util");
const path = require("path");

const config = {
    uuidNamespace: 'ae42b17e-ba44-4d10-914a-639148fc993f',
    categories: ["思想", "代码", "实现"]
};
const search = [];

console.log("🚧 Applying marked plugins...")

const md = new MarkdownIt({
    html: true,
    langPrefix: "language-"
})
    .use(require("markdown-it-external-links"), {
        externalTarget: "_blank",
        externalRel: "noopener noreferrer"
    })
    .use(require("markdown-it-highlight-lines"))
    .use(require("markdown-it-prism"), {
        defaultLanguage: "plaintext"
    })
    .use(require("markdown-it-sup"))
    .use(require("markdown-it-sup"))
    .use(require("markdown-it-footnote"))
    .use(require("markdown-it-mathjax3"), {})
    .use(require("markdown-it-toc-done-right"), {
        slugify: s => encodeURI(s)
    });

function buildRouterTs(postRoutes, pageRoutes) {
    let result = `import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";const routes: RouteRecordRaw[]=[{name:"page",path:"/",component:()=>import("@/Page.vue"),children:[`
        + pageRoutes.map(x => `{name: "${x.filename.toLowerCase()}", path: "/${x.filename}", component:()=>import("@/pages/${x.filename}.vue"),meta:{filename:"${x.filename}",title:"${x.title}",uuid:"${x.uuid}",isStandalone:true}}`).join(",")
        + `]},{name:"posts",path:"/posts",component:()=>import("@/Post.vue"),children:[`
        + postRoutes.map(r => `{name:"post-${r.filename.toLowerCase()}",path:"${r.filename}",component:()=>import("@/posts/${r.filename}.vue"),meta:{filename:"${r.filename}",title:"${r.title}",uuid:"${r.uuid}",isStandalone:false}}`).join(",")
    result += "]}];const router = createRouter({history: createWebHistory(),routes}); export default router";
    return result;
}

function addSearch(filecontent, title, filename, namespace) {
    if (filename === "PGP") return;
    search.push({
        title,
        filecontent: require("remove-markdown")(filecontent).replace(/:::\w+?/g, ""),
        filename,
        namespace
    })
}

const pup = require("puppeteer-core");
const {executablePath} = require("puppeteer");

async function buildPageComponent(fm, fileparsed, wordcount) {
    const browser = await pup.launch({
        headless: true,
        args: ['--no-sandbox'],
        executablePath: executablePath()
    });
    const page = await browser.newPage();
    await page.setRequestInterception(true);
    page.on("request", r => {
        if (r.resourceType() === "image") r.abort();
        else r.continue();
    })
    await page.goto("about:blank")
    await page.setContent(`<!DOCTYPE html><html><body class='dist'>${fileparsed}</body></html>`, {waitUntil: "domcontentloaded"});
    await page.waitForSelector(".dist");

    const result = await page.evaluate(async (fm, wordcount) => {
        const parser = new window.DOMParser();
        const body = document.body;

        async function buildElement(struct) {
            const newdoc = parser.parseFromString(struct, "text/html");
            return newdoc.body.firstChild;
        }

        function getReadingMinutes(wordcount, category) {
            let res = 0;
            const basis = wordcount / 250;
            switch (category) {
                case "思想":
                    res = basis / .6;
                    break;

                case "代码":
                case "路径":
                    res = basis / .7;
                    break;

                case "记录":
                    res = basis / .85;
                    break;

                case "诗":
                    res = basis / .75;
                    break;

                default:
                    res = basis;
            }
            return res.toFixed(0);
        }

        const externalLinkIcon = `<span class="external-link-icon mdi mdi-launch"></span>`;
        const mailLinkIcon = `<span class="external-link-icon mdi mdi-email-outline"></span>`;

        for (let a of body.querySelectorAll("a[href*='mailto']")) {
            a.append(await buildElement(mailLinkIcon));
        }

        for (let b of body.querySelectorAll(".external-link")) {
            b.append(await buildElement(externalLinkIcon));
        }

        for (let c of body.querySelectorAll("pre")) {
            let div = document.createElement("div");
            div.classList.add(...c.classList);
            c.parentElement.replaceChild(div, c)
            div.append(c);
        }

        const h = document.querySelector("h1");
        if (h && !fm.standalone) {
            const metabar = `<div class="metabar">` +
                `<div class="metabar-item">${fm.date}</div>` +
                `<div class="metabar-item">${fm.cate}</div>` +
                `<div class="metabar-item">约 ${getReadingMinutes(wordcount, fm.cate)} 分钟读完</div>` +
                `</div>`;
            h.after(await buildElement(metabar));
            h.classList.add("post-title");
        }

        for (let a of body.querySelectorAll("a")) {
            if (a.classList.contains("external-link")) continue;
            if (a.closest("[class^='footnote']") !== null) continue;
            if (a.getAttribute("href").startsWith("mailto")) continue;
            let routerLink = document.createElement("router-link");
            routerLink.innerText = a.innerText;
            routerLink.setAttribute("to", a.getAttribute("href"));
            a.parentElement.append(routerLink);
            a.parentElement.removeChild(a);
        }

        for (let h of body.querySelectorAll("h1, h2")) {
            const anchor = `<a class="header-anchor" id="${encodeURI(h.innerText)}" href="#${encodeURI(h.innerText)}">#</a>`
            h.append(await buildElement(anchor));
        }

        return {
            html: body.innerHTML,
            title: h.innerText
        };
    }, fm, wordcount)
    await browser.close();
    return {
        result: `<template><div class="content">${result.html}</div></template>`,
        title: result.title.replace("#", "")
    };
}

function parse(raw) {
    const match1 = Array.from(raw.matchAll(/:::\s?tip([\S\s]*?):::/g));
    const match2 = Array.from(raw.matchAll(/:::\s?warning([\S\s]*?):::/g));
    const match3 = Array.from(raw.matchAll(/:::\s?danger([\S\s]*?):::/g));
    const targetMatch = ['tip', 'warning', 'danger']

    [match1, match2, match3].forEach((x, i) => {
        x.forEach(y => {
            raw = raw.replace(y[0], `<div class="notice ${targetMatch[i]}">${md.render(y[1])}</div>`);
        })
    })

    return md.render(raw);
}

function countWords(text) {
    return (text.match(/[\u00ff-\uffff]|\S+/g) || []).length;
}

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

try {
    fs.mkdirSync("src/posts");
    fs.mkdirSync("src/pages");
} catch {
}

(async () => {
    console.log("🚧 Reading files...")

    const posts = await readdir("posts")
    const postResult = [];
    const postRoutes = [];

    for (let p of posts) {
        let filename = p.replace(".md", "");
        let filecontent = (await readFile(`posts/${filename}.md`)).toString();
        let wordcount = countWords(filecontent);
        let filefrontmatter = fm(filecontent);
        console.log(`📕 Building ${filename}.md`)
        let fileparsed = parse(filefrontmatter.body);
        let uuid = v5(filename, config.uuidNamespace);
        let result = await buildPageComponent(filefrontmatter.attributes, fileparsed, wordcount)
        await writeFile(`src/posts/${filename}.vue`, result.result);
        if (!filefrontmatter.attributes.hidden) {
            addSearch(filecontent, result.title, filename, "post")
        }
        postRoutes.push({
            title: result.title,
            filename: filename,
            uuid: uuid
        });
        postResult.push({
            "title": result.title,
            "filename": filename,
            "frontmatters": filefrontmatter.attributes,
            "wordcount": wordcount
        });
    }

    const pages = await readdir("pages")
    const pageResult = [];
    const pageRoutes = [];

    for (let p of pages) {
        let filename = p.replace(".md", "")
        let filecontent = (await readFile(`pages/${filename}.md`)).toString();
        console.log(`📄 Building ${filename}.md`);
        let fileparsed = parse(filecontent);
        let uuid = v5(filename, config.uuidNamespace);
        let result = await buildPageComponent({
            standalone: true
        }, fileparsed);
        await writeFile(`src/pages/${filename}.vue`, result.result);
        addSearch(filecontent, result.title, filename, "page")
        pageRoutes.push({
            title: result.title,
            filename: filename,
            uuid: uuid
        });
        pageResult.push({
            "title": result.title,
            "filename": filename
        });
    }

    console.log("🚧 Building & writing files...")
    // temporary implementation, need to be improved. 2023.07.15
    await writeFile(`src/posts.ts`, `const data: Post[] = ${JSON.stringify(postResult
        .filter(x => !!x.frontmatters.date)
        .sort((a, b) => 
            new Date(b.frontmatters.date.replace("/", "-")).getTime()
            - new Date(a.frontmatters.date.replace("/", "-")).getTime()
        )
    )}; export default data;`);
    await writeFile(`src/pages.ts`, `const data: Page[] = ${JSON.stringify(pageResult)}; export default data;`)
    await writeFile(`src/router.ts`, buildRouterTs(postRoutes, pageRoutes))
    await writeFile(`src/searchdata.json`, JSON.stringify(search));

    console.log("🙌 Successfully built necessary files to be build.")

})();
