# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development

```bash
# Dev server (port 3030)
yarn dev

# Build and generate static site
yarn generate

# Preview generated build
yarn preview

# Compile Markdown posts to JSON (run separately before generate if needed)
yarn data

# Check type correctness
yarn typecheck

# Local admin UI for writing posts + managing OSS images (port 3040)
yarn studio

# Add a shadcn-vue component to the studio
yarn studio:add sheet

# Verify the editor cannot change how posts render
yarn studio:check
```

## Architecture

This is a Nuxt 3 static blog deployed to Vercel. There is no database — all content lives as local Markdown files compiled to JSON at build time.

### Build pipeline
1. Markdown posts in `data/posts/` are compiled to `public/data/<slug>.json` via `build.ts` (`yarn data`)
2. The remark → rehype pipeline itself lives in `markdown-pipeline.ts` (`applyPipeline`), which `build.ts` and the studio both use; `applyPipeline` generates the HTML, and `build.ts` additionally generates PNG OG images with Satori + Sharp and writes `data/postdigests.json` (listing page, sitemap).
3. Builds are incremental: `.build-manifest.json` caches a content hash per post plus a hash of the renderer inputs (`build.ts`, `markdown-pipeline.ts`, `ogNode.jsx`, `relative-md.ts`, `oss-assets.ts`, and the dependency versions in `package.json`). Any renderer change invalidates all posts, so OG images never go stale. `CI`/`VERCEL` environments skip reading the cache entirely and rebuild everything.
4. Post concurrency defaults to 4, override with `BUILD_CONCURRENCY`.
5. Files whose content did not change (`postdigests.json`, the manifest) are not rewritten, so `yarn dev` does not restart on every build.

### Routing
- `pages/index.vue` — post listing, reads `data/postdigests.json` directly
- `pages/posts/[postname].vue` — dynamic post page, imports the per-post JSON from `public/data/<slug>.json` at build time
- `pages/pages/about.vue`, `pages/pages/blogroll.vue`, `pages/pages/pgp.vue` — static content pages

### Key patterns
- Post JSON files are imported statically: `await import('~/public/data/<slug>.json')`. This ensures they're bundled at build time for static generation.
- The site is fully static (`nitro.preset: 'static'`), so `$fetch` is **not used** for post data — it would conflict with SSR and OG image generation.
- OG images are pre-generated PNGs in `public/og_images/`; each post page sets `ogImage` in `useSeoMeta` to an absolute URL built from `useSiteConfig().url`. Nothing renders OG images at runtime (the `nuxt-og-image` module was removed).
- Umami analytics is injected server-side via a Nitro plugin in `server/plugins/analytics.ts`.
- Markdown callouts use VuePress-like syntax (`:::tip`, `:::warning`, `:::danger`, `:::note`) converted via a remark directive plugin in `build.ts`.
- Post images live on Aliyun OSS, not in the repo. Markdown references them as `oss://<key>`, where `<key>` is relative to `public/blog/` in the `fnmdp` bucket (`![](oss://visiting-greater-bay-2025/1.jpg)`), and `rehypeOssAssets` in `oss-assets.ts` expands them to `https://fnmdp.oss-cn-beijing.aliyuncs.com/public/blog/<key>` at build time. The rehype stage means raw `<img>` tags in Markdown are rewritten too. `oss-assets.ts` owns the bucket and key prefix, so changing the CDN or bucket means editing one place.
- OSS directories are named in lowercase kebab-case, normally the slug of the post that owns the images. When several posts share one set of images the directory keeps a neutral name (`visiting-greater-bay-2025` is used by both parts of that series). Keys inside a directory keep whatever the source file was called, spaces included, which means Markdown writes them percent-encoded (`12Walking%20like%20a%20gentleman.jpg`). `yarn oss stats` and `yarn oss check` also count references that only exist inside HTML comments, so a commented-out image is enough to keep an object alive.
- `yarn oss` (`oss-images.ts`) is the CLI for getting new images in; the reusable half lives in `oss-lib.ts` (compression, upload, HEAD verification, object listing, reference scanning), which the studio also calls, so both paths always compress and verify the same way. `yarn oss upload <dir>` compresses every image in the directory, uploads it to `public/blog/<dir minus -img>/`, and verifies each object with a HEAD against the local byte size; `--rewrite` also rewrites relative refs in `data/posts/*.md` to `oss://`, `--dry-run` stops before touching OSS, `--delete-source` removes the local originals once verification passes. `yarn oss stats` lists the whole prefix per directory with object count, size, how many objects are referenced and by how many posts, how many exceed `--max-bytes`, and the unreferenced objects (add `--unreferenced` for the full list). `yarn oss check` HEAD-checks every `oss://` reference in the posts and reports unreachable keys and keys still carrying a `-img` segment. Compression is mozjpeg at `--quality 80` with the long edge clamped to `--max-edge 2048`, PNGs stay PNG with alpha preserved and are palette-quantized at the same quality, and a file is only replaced when the shrink beats `--min-gain` (default 10%), which keeps repeated runs from degrading already-compressed images. The `--force` flag is already handled: ossutil silently skips existing objects without it.
- Relative Markdown links to other `.md` files (`./other-post.md`) are rewritten to blog post URLs (`/posts/other-post`) by `remarkRelativeAssetsToPosts` in `relative-md.ts`. Relative asset paths are still supported as a fallback: they become `/posts/<path>` and are copied from `data/posts/` to `public/posts/`, though no post uses this any more.
- Image zoom uses `medium-zoom` on mounted.
- There is **no search feature**: the old search modal/index (`components/search.vue`, `components/navbar.vue`, `utils/getSearchContent.js`, `data/postsearch.json`) was removed as dead code; restoring search means reimplementing it (the build pipeline no longer emits a full-text index).

### Config
- `nuxt.config.ts` — Tailwind CSS 4 via Vite plugin, Fontsource CSS in the `css` array, static nitro preset with crawlLinks, sitemap sourced from `/api/get-post-urls`.
- `data/config.js` — defines navigation pages (home, about, blogroll, PGP) with MDI icons.
- `data/blogrolls.json` — friend link data.

### Local admin (`studio/`)
`yarn studio` starts a second, semi-independent surface for writing posts (WordPress-like, but the "backend" is just this repo's files plus ossutil). It shares `assets/main.css`, `markdown-pipeline.ts` and `oss-lib.ts` with the site but nothing else: no Nuxt route, layout or component is involved, and `studio/**` is outside every Nuxt auto-scan directory, so `yarn generate` is untouched.

- **The studio owns its manifest.** `studio/package.json` declares everything the studio imports (Tiptap, shadcn-vue, reka-ui, katex, …) and the repo root lists `"workspaces": ["studio"]`, so one `yarn install` at the root installs both and hoists into the root `node_modules`. The blog's manifest therefore carries no studio dependency — that matters, because the shadcn-vue CLI runs `yarn add` for the deps a registry item declares and had already bumped the *blog's* `@vueuse/core` from `^11` to `^15` this way. The studio now asks for its own version and the blog stays on `^11` (yarn nests one copy). Deps both manifests declare on purpose (shared pipeline: `unified`, `remark-*`, `yaml`, `sharp`, `vue`, `tailwindcss`) resolve to a single hoisted copy.
- `studio/vite.config.ts` — the SPA's Vite config (Vue plugin, Tailwind 4 plugin, `@` → repo root, HMR port). Note `vite` is **pinned to the version Nuxt hoists** (currently `6.3.2`): a second Vite for the studio makes `@vitejs/plugin-vue`/`@tailwindcss/vite` types disagree and `yarn typecheck` fails. `studio/tsconfig.json` exists for the shadcn CLI and editors, and mirrors the same `@/*` → repo root mapping.
- `studio/server/index.ts` launches Vite in middleware mode next to `/api/*`, which is loaded through `vite.ssrLoadModule` so server edits do not need a restart. `studio/server/api.ts` is the whole HTTP API (post CRUD, image staging, OSS upload/rename/delete, Markdown rendering, site rebuild) — it resolves `data/posts`, `.studio/staging` and the `build.ts` spawn relative to the **repo root**, never `cwd`, because the workspace starts it with `cwd=studio/`.
- `studio/client/` — Vue 3 SPA: post list, editor, media library. `editor/schema.ts` is the Tiptap schema; `editor/mdast-pm.ts` is the pure mdast ↔ ProseMirror-JSON mapping used by the server.
- **UI is shadcn-vue** (the Vue port of shadcn/ui, reka-ui based, `reka-nova` preset). Components live in `studio/client/components/ui/**` as generated source rather than a dependency. Add one with `yarn studio:add <name>`; that wrapper exists because the CLI has three quirks here: it fails while `https_proxy` is set (it hands the value to an undici ProxyAgent), it writes the *component name* into `dependencies` as if it were a package (`add badge` installs an unrelated `badge`), and its post-add install makes yarn 1's workspace hoisting drop studio-only packages such as `@lucide/vue`. The wrapper deletes the junk dep and re-runs `yarn install`.
- `studio/client/styles.css` keeps the blog's font stack instead of the preset's Geist (the preset's `font` value in `components.json` is inert for `add`): the editor canvas has to render exactly like the site, so `--font-sans` stays Inter. The shadcn theme tokens and `@layer base` rules are appended after the `assets/main.css` import; don't add a second `@import 'tailwindcss'` or redeclare `@custom-variant dark`.
- Generated `components/ui/**` files keep the registry's own formatting and are intentionally not reformatted to the repo's tabs/single-quotes style, so `shadcn-vue add <name> --diff` stays usable for future updates.
- **Markdown stays the source of truth.** The API hands the client a ProseMirror document and takes one back, but both conversions happen server-side: `mdastToPmDoc` / `pmDocToMdast`. The client never sees the unified stack, so the browser bundle stays small.
- **Fidelity is a test, not a promise.** `yarn studio:check` walks every post through source → mdast → ProseMirror → mdast → Markdown and asserts the HTML from the real rehype pipeline is byte-identical before and after, that a second pass is stable, that frontmatter values survive, and that the document is a fixed point (catching a schema attribute that silently disappears). It also covers synthetic editor-only shapes (a mark whose range ends in whitespace, marks spanning across each other) that a parser can never produce, and that the OSS reference scanner sees images inside footnote definitions and callouts. Keep it at zero failures before touching `mdast-pm.ts` or `editor/schema.ts`.
- **What re-serializing changes**: Markdown is rewritten canonically on every save, so `_italic_` becomes `*italic*`, autolinks stay `<url>`, lists get consistent blank lines, and markers whose nesting is ambiguous in a flat mark model (e.g. `*[text](url)*` against `[*text*](url)`) collapse to one form. Rendering is unchanged — that is what the check enforces. Anything the mapping does not understand (raw HTML, unknown directives, empty links) is carried through verbatim as a `rawBlock`/`rawInline` node.
- **Images are staged locally, then published on save.** Dropping or pasting a file stores the original bytes under `.studio/staging/<post>/` and inserts an image node pointing at `/api/staged/...`. Saving compresses each staged file with the same `encodeImage` used by `yarn oss`, uploads it to `oss://<dir>/<safe-name>`, HEAD-verifies every object, and only then rewrites the references and writes the post. If verification fails the post is not modified. File names are normalized to `[a-z0-9._-]` (CJK-only names fall back to `img-<hash>`) so `%20` and percent-encoded CJK never enter the Markdown again; the OSS directory defaults to an existing `oss://` reference in the post, otherwise the lowercased file stem.
- The media library lists every object under the OSS prefix with its references, uploads through the same pipeline, renames objects (rewriting post references), normalizes unsafe file names, and can HEAD-check every `oss://` reference.
- Save triggers an incremental `yarn data` so the running site picks up the change; the site itself is rebuilt by the usual `yarn dev` / `yarn generate`.
- Two conventions in the editor UI are load-bearing, not cosmetic. Toolbar buttons use `@mousedown.prevent` so clicking them does not move focus out of ProseMirror (which would desync its stored selection from the DOM); keep that attribute on any new control that acts on the selection. And `window.__studioEditor` exposes the Tiptap instance in the browser console, which is the fastest way to inspect a document or a selection when something looks wrong.

### Fonts
- Web fonts are self-hosted from Fontsource, imported through the `css` array in `nuxt.config.ts`: `@fontsource-variable/inter/standard(+standard-italic)` (wght + opsz axes, so headings keep Inter's optical sizing), `@fontsource/source-serif-4/{latin,latin-ext}-{400,600}(-italic)`, `@fontsource/noto-serif-sc/chinese-simplified-{400,700}`.
- `--font-sans` starts with `'Inter Variable'`; `--font-serif` is only consumed by `.serif`, so the CJK serif files are never fetched unless the reader switches to serif mode. The toggle in `app.vue` is just a class plus a cookie, no runtime stylesheet injection.
- The OG images are rendered by Satori in `build.ts`, which reads ttf/otf/woff but **not** woff2. Latin text therefore comes from `@fontsource/inter`'s `.woff` files, while the full `fonts/NotoSansSC-{Regular,Bold}.otf` stay in the repo because Fontsource's CJK subsets are too narrow for arbitrary post titles.

### Tailwind 4 migration note
This project has already moved to Tailwind CSS 4 (`@tailwindcss/vite` plugin, `@import 'tailwindcss'` in CSS). No `tailwind.config.js` exists. The `@tailwindcss/typography` is loaded as a plugin in CSS (`@plugin "@tailwindcss/typography"`). Use new Tailwind 4 syntax (`@theme`, `@apply`, CSS-based config) — no `theme.extend` etc.
