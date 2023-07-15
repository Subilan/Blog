// noinspection JSCheckFunctionSignatures,JSValidateTypes

const MarkdownIt = require("markdown-it");
const fm = require("front-matter")
const fs = require("fs");
const {v5} = require("uuid");
const anchor = require("markdown-it-anchor");
const jsdom = require("jsdom");
const util = require("util");
const {executablePath} = require("puppeteer-core");

const config = {
    uuidNamespace: 'ae42b17e-ba44-4d10-914a-639148fc993f',
    categories: ["思想", "代码", "实现"]
};

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
    .use(require("@iktakahiro/markdown-it-katex"), {
        throwOnError: false
    })
    .use(anchor, {
        permalink: anchor.permalink.ariaHidden({
            placement: "before",
            symbol: "#",
        }),
        slugify: s => encodeURI(s)
    })
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

async function buildPageComponent(fm, fileparsed) {
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
    const result = await page.evaluate(async (fm) => {
        const parser = new window.DOMParser();
        const body = document.body;

        async function buildElement(struct) {
            const newdoc = parser.parseFromString(struct, "text/html");
            return newdoc.body.firstChild;
        }

        const externalLinkIcon = `<span class="external-link-icon mdi mdi-launch"></span>`;

        for (let b of body.querySelectorAll(".external-link")) {
            b.append(await buildElement(externalLinkIcon));
        }

        const h = document.querySelector("h1");
        if (h && !fm.standalone) {
            const metabar = `<div class="metabar">` +
                `<div class="metabar-item">${fm.date}</div>` +
                `<div class="metabar-item">${fm.desc}</div>` +
                `</div>`;
            h.after(await buildElement(metabar));
            h.classList.add("post-title");
        }


        return {
            html: body.innerHTML,
            title: h.innerText
        };
    }, fm)
    await browser.close();
    return {
        result: `<template><div class="content">${result.html}</div></template>`,
        title: result.title
    };
}

const readdir = util.promisify(fs.readdir);
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

(async () => {
    try {
        console.log("🚧 Reading files...")

        const posts = await readdir("posts")
        const postResult = {};
        const postRoutes = [];

        for (let p of posts) {
            let filename = p.replace(".md", "");
            let filecontent = (await readFile(`posts/${filename}.md`)).toString();
            let filefrontmatter = fm(filecontent);
            console.log(`📕 Building ${filename}.md`)
            let fileparsed = md.render(filefrontmatter.body);
            let uuid = v5(filename, config.uuidNamespace);
            let result = await buildPageComponent(filefrontmatter.attributes, fileparsed)
            await writeFile(`src/posts/${filename}.vue`, result.result);
            postRoutes.push({
                name: filename,
                path: filename,
                uuid: uuid
            })
            postResult[uuid] = {
                "title": result.title.replace("# ", ""),
                "filename": filename,
                "frontmatters": filefrontmatter.attributes
            }
        }


        const pages = await readdir("pages")
        const pageResult = {};
        const pageRoutes = [];

        for (let p of pages) {
            let filename = p.replace(".md", "")
            let filecontent = (await readFile(`pages/${filename}.md`)).toString();
            console.log(`📄 Building ${filename}.md`);
            let fileparsed = md.render(filecontent);
            let uuid = v5(filename, config.uuidNamespace);
            let result = await buildPageComponent({
                standalone: true
            }, fileparsed);
            await writeFile(`src/pages/${filename}.vue`, result.result);
            pageRoutes.push({
                name: filename,
                path: filename,
                uuid: uuid
            })
            pageResult[uuid] = {
                "title": result.title.replace("# ", ""),
                "filename": filename
            }
        }

        console.log("🚧 Building & writing files...")
        await writeFile(`src/posts.ts`, `const data: Record<string, Post> = ${JSON.stringify(postResult)}; export default data;`);
        await writeFile(`src/pages.ts`, `const data: Record<string, Page> = ${JSON.stringify(pageResult)}; export default data;`)
        await writeFile(`src/router.ts`, buildRouterTs(postRoutes, pageRoutes))

        console.log("🙌 Successfully built necessary files to be build.")
    } catch (e) {
        console.error(e);
    }
})();