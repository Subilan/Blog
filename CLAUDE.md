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
3. Builds are incremental: `.build-manifest.json` caches a content hash per post plus a hash of the renderer inputs (`build.ts`, `ogNode.jsx`, `relative-md.ts`, and the dependency versions in `package.json`). Any renderer change invalidates all posts, so OG images never go stale. `CI`/`VERCEL` environments skip reading the cache entirely and rebuild everything.
4. Post concurrency defaults to 4, override with `BUILD_CONCURRENCY`.
5. Files whose content did not change (`postdigests.json`, the manifest) are not rewritten, so `yarn dev` does not restart on every build.

### Routing
- `pages/index.vue` — post listing, reads `data/postdigests.json` directly
- `pages/posts/[postname].vue` — dynamic post page, imports the per-post JSON from `public/data/<slug>.json` at build time
- `pages/pages/about.vue`, `pages/pages/blogroll.vue`, `pages/pages/pgp.vue` — static content pages

### Key patterns
- Post JSON files are imported statically: `await import('~/public/data/<slug>.json')`. This ensures they're bundled at build time for static generation.
- The site is fully static (`nitro.preset: 'static'`), so `$fetch` is **not used** for post data — it would conflict with SSR and OG image generation.
- Umami analytics is injected server-side via a Nitro plugin in `server/plugins/analytics.ts`.
- Markdown callouts use VuePress-like syntax (`:::tip`, `:::warning`, `:::danger`, `:::note`) converted via a remark directive plugin in `build.ts`.
- Relative Markdown links to other `.md` files (`./other-post.md`) are rewritten to blog post URLs (`/posts/other-post`) by `remarkRelativeAssetsToPosts` in `relative-md.ts`.
- Image zoom uses `medium-zoom` on mounted.
- There is **no search feature**: the old search modal/index (`components/search.vue`, `components/navbar.vue`, `utils/getSearchContent.js`, `data/postsearch.json`) was removed as dead code; restoring search means reimplementing it (the build pipeline no longer emits a full-text index).

### Config
- `nuxt.config.ts` — Tailwind CSS 4 via Vite plugin, local fonts, static nitro preset with crawlLinks, sitemap sourced from `/api/get-post-urls`, OG image with chromium renderer.
- `data/config.js` — defines navigation pages (home, about, blogroll, PGP) with MDI icons.
- `data/blogrolls.json` — friend link data.

### Tailwind 4 migration note
This project has already moved to Tailwind CSS 4 (`@tailwindcss/vite` plugin, `@import 'tailwindcss'` in CSS). No `tailwind.config.js` exists. The `@tailwindcss/typography` is loaded as a plugin in CSS (`@plugin "@tailwindcss/typography"`). Use new Tailwind 4 syntax (`@theme`, `@apply`, CSS-based config) — no `theme.extend` etc.
