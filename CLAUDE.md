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
```

## Architecture

This is a Nuxt 3 static blog deployed to Vercel. There is no database — all content lives as local Markdown files compiled to JSON at build time.

### Build pipeline
1. Markdown posts in `data/posts/` are compiled to `public/data/<slug>.json` via `build.ts` (`yarn data`)
2. `build.ts` uses **unified** (remark → rehype) to process Markdown into HTML. It also generates PNG OG images for each post using Satori + Sharp, and writes the derived index `data/postdigests.json` (listing page, sitemap).
3. Builds are incremental: `.build-manifest.json` caches a content hash per post plus a hash of the renderer inputs (`build.ts`, `ogNode.jsx`, `relative-md.ts`, `oss-assets.ts`, and the dependency versions in `package.json`). Any renderer change invalidates all posts, so OG images never go stale. `CI`/`VERCEL` environments skip reading the cache entirely and rebuild everything.
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
- `yarn oss` (`oss-images.ts`) is the tool for getting new images in. `yarn oss upload <dir>` compresses every image in the directory, uploads it to `public/blog/<dir minus -img>/`, and verifies each object with a HEAD against the local byte size; `--rewrite` also rewrites relative refs in `data/posts/*.md` to `oss://`, `--dry-run` stops before touching OSS, `--delete-source` removes the local originals once verification passes. `yarn oss stats` lists the whole prefix per directory with object count, size, how many objects are referenced and by how many posts, how many exceed `--max-bytes`, and the unreferenced objects (add `--unreferenced` for the full list). `yarn oss check` HEAD-checks every `oss://` reference in the posts and reports unreachable keys and keys still carrying a `-img` segment. Compression is mozjpeg at `--quality 80` with the long edge clamped to `--max-edge 2048`, PNGs stay PNG with alpha preserved and are palette-quantized at the same quality, and a file is only replaced when the shrink beats `--min-gain` (default 10%), which keeps repeated runs from degrading already-compressed images. The `--force` flag is already handled: ossutil silently skips existing objects without it.
- Relative Markdown links to other `.md` files (`./other-post.md`) are rewritten to blog post URLs (`/posts/other-post`) by `remarkRelativeAssetsToPosts` in `relative-md.ts`. Relative asset paths are still supported as a fallback: they become `/posts/<path>` and are copied from `data/posts/` to `public/posts/`, though no post uses this any more.
- Image zoom uses `medium-zoom` on mounted.
- There is **no search feature**: the old search modal/index (`components/search.vue`, `components/navbar.vue`, `utils/getSearchContent.js`, `data/postsearch.json`) was removed as dead code; restoring search means reimplementing it (the build pipeline no longer emits a full-text index).

### Config
- `nuxt.config.ts` — Tailwind CSS 4 via Vite plugin, Fontsource CSS in the `css` array, static nitro preset with crawlLinks, sitemap sourced from `/api/get-post-urls`.
- `data/config.js` — defines navigation pages (home, about, blogroll, PGP) with MDI icons.
- `data/blogrolls.json` — friend link data.

### Fonts
- Web fonts are self-hosted from Fontsource, imported through the `css` array in `nuxt.config.ts`: `@fontsource-variable/inter/standard(+standard-italic)` (wght + opsz axes, so headings keep Inter's optical sizing), `@fontsource/source-serif-4/{latin,latin-ext}-{400,600}(-italic)`, `@fontsource/noto-serif-sc/chinese-simplified-{400,700}`.
- `--font-sans` starts with `'Inter Variable'`; `--font-serif` is only consumed by `.serif`, so the CJK serif files are never fetched unless the reader switches to serif mode. The toggle in `app.vue` is just a class plus a cookie, no runtime stylesheet injection.
- The OG images are rendered by Satori in `build.ts`, which reads ttf/otf/woff but **not** woff2. Latin text therefore comes from `@fontsource/inter`'s `.woff` files, while the full `fonts/NotoSansSC-{Regular,Bold}.otf` stay in the repo because Fontsource's CJK subsets are too narrow for arbitrary post titles.

### Tailwind 4 migration note
This project has already moved to Tailwind CSS 4 (`@tailwindcss/vite` plugin, `@import 'tailwindcss'` in CSS). No `tailwind.config.js` exists. The `@tailwindcss/typography` is loaded as a plugin in CSS (`@plugin "@tailwindcss/typography"`). Use new Tailwind 4 syntax (`@theme`, `@apply`, CSS-based config) — no `theme.extend` etc.
