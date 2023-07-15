// noinspection JSCheckFunctionSignatures,JSValidateTypes

const MarkdownIt = require("markdown-it");
const fm = require("front-matter")
const fs = require("fs");
const {v5} = require("uuid");
const anchor = require("markdown-it-anchor");
const jsdom = require("jsdom");
const util = require("util");

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
        + pageRoutes.map(x => `{name: "${x.name.toLowerCase()}", path: "/${x.path}", component:()=>import("@/pages/${x.name}.vue"),meta:{filename:"${x.name}",uuid:"${x.uuid}",isStandalone:true}}`).join(",")
        + `]},{name:"posts",path:"/posts",component:()=>import("@/Post.vue"),children:[`
        + postRoutes.map(r => `{name:"post-${r.name.toLowerCase()}",path:"${r.path}",component:()=>import("@/posts/${r.name}.vue"),meta:{filename:"${r.name}",uuid:"${r.uuid}",isStandalone:false}}`).join(",")
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

async function buildPageComponent(fm, fileparsed, wordcount) {
    const pup = require("puppeteer-core");
    const {executablePath} = require("puppeteer");
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
                `<div class="metabar-item">日期 — ${fm.date}</div>` +
                `<div class="metabar-item">分类 — ${fm.cate}</div>` +
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
    const reg1 = /:::tip((\s|.)*?):::/g;
    const reg2 = /:::warning((\s|.)*?):::/g;
    const reg3 = /:::danger((\s|.)*?):::/g;
    const res1 = reg1.exec(raw);
    const res2 = reg2.exec(raw);
    const res3 = reg3.exec(raw);

    if (res1) {
        const customBlockInner1 = res1[1];
        raw = raw.replace(reg1, `<div class="notice tip">${md.render(customBlockInner1)}</div>`);
    }

    if (res2) {
        const customBlockInner2 = res2[1];
        raw = raw.replace(reg2, `<div class="notice warning">${md.render(customBlockInner2)}</div>`);
    }

    if (res3) {
        const customBlockInner3 = res3[1];
        raw = raw.replace(reg3, `<div class="notice danger">${md.render(customBlockInner3)}</div>`);
    }

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
    const postResult = {};
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
            name: filename,
            path: filename,
            uuid: uuid
        })
        postResult[uuid] = {
            "title": result.title,
            "filename": filename,
            "frontmatters": filefrontmatter.attributes,
            "wordcount": wordcount
        }
    }

    const pages = await readdir("pages")
    const pageResult = {};
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
            name: filename,
            path: filename,
            uuid: uuid
        })
        pageResult[uuid] = {
            "title": result.title,
            "filename": filename
        }
    }

    console.log("🚧 Building & writing files...")
    await writeFile(`src/posts.ts`, `const data: Record<string, Post> = ${JSON.stringify(postResult)}; export default data;`);
    await writeFile(`src/pages.ts`, `const data: Record<string, Page> = ${JSON.stringify(pageResult)}; export default data;`)
    await writeFile(`src/router.ts`, buildRouterTs(postRoutes, pageRoutes))
    await writeFile(`src/searchdata.json`, JSON.stringify(search));

    console.log("🙌 Successfully built necessary files to be build.")

})();