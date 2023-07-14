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

function buildRouterTs() {
    let result = `import {createRouter, createWebHistory, RouteRecordRaw} from "vue-router";const routes: RouteRecordRaw[]=[{name:"home",path:"/",component:()=>import("@/Home.vue")},{name:"posts",path:"/posts",component:()=>import("@/Post.vue"),children:[`
    routes.forEach(r => {
        result += `{name: "post-${r.name}", path: "${r.path}", component: () => import("@/views/${r.name}.vue"), meta: {filename: "${r.name}", uuid: "${r.uuid}"}},`;
    })
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

        const metabar = `<div class="metabar">` +
            `<div class="metabar-item">${fm.date}</div>` +
            `<div class="metabar-item">${fm.desc}</div>` +
            `</div>`;

        const h = document.querySelector("h1");
        h.after(await buildElement(metabar));
        h.classList.add("post-title");


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

const readdir = util.promisify(fs.readdir)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const posts = {};
const routes = [];

(async () => {
    try {
        console.log("🚧 Reading files...")

        const template = (await readFile("src/Post.vue")).toString();
        const files = await readdir("posts")

        for (let f of files) {
            let filename = f.replace(".md", "");
            let filecontent = (await readFile(`posts/${filename}.md`)).toString();
            let filefrontmatter = fm(filecontent);
            console.log(`📕 Building ${filename}.md`)
            let fileparsed = md.render(filefrontmatter.body);
            let uuid = v5(filename, config.uuidNamespace);
            let result = await buildPageComponent(filefrontmatter.attributes, fileparsed)
            await writeFile(`src/views/${filename}.vue`, result.result);
            routes.push({
                name: `${filename}`,
                path: `${filename}`,
                uuid: `${uuid}`
            })
            posts[uuid] = {
                "title": result.title.replace("# ", ""),
                "filename": filename,
                "frontmatters": filefrontmatter.attributes
            }
        }

        console.log("🚧 Building & writing files...")

        await writeFile(`src/pages.ts`, `const data: Record<string, Post> = ${JSON.stringify(posts)}; export default data;`);
        await writeFile(`src/router.ts`, buildRouterTs())

        console.log("🙌 Successfully built necessary files to be build.")
    } catch (e) {
        console.error(e);
    }
})();