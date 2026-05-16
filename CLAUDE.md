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
yarn vite-node build.ts

# Check type correctness
yarn typecheck
```

## Architecture

This is a Nuxt 3 static blog deployed to Vercel. There is no database — all content lives as local Markdown files compiled to JSON at build time.

### Build pipeline
1. Markdown posts in `data/posts/` are compiled to `public/data/<slug>.json` via `build.ts`
2. `build.ts` uses **unified** (remark → rehype) to process Markdown into HTML. It also generates PNG OG images for each post using Satori + Sharp.
3. `build.js` is a **legacy** version that uses `markdown-it` + `shiki` instead. It produces `data/posts.json` (one big JSON bundle) rather than per-post JSON files. It is currently unused but kept for reference.

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

### Config
- `nuxt.config.ts` — Tailwind CSS 4 via Vite plugin, local fonts, static nitro preset with crawlLinks, sitemap sourced from `/api/get-post-urls`, OG image with chromium renderer.
- `data/config.js` — defines navigation pages (home, about, blogroll, PGP) with MDI icons.
- `data/blogrolls.json` — friend link data.

### Tailwind 4 migration note
This project has already moved to Tailwind CSS 4 (`@tailwindcss/vite` plugin, `@import 'tailwindcss'` in CSS). No `tailwind.config.js` exists. The `@tailwindcss/typography` is loaded as a plugin in CSS (`@plugin "@tailwindcss/typography"`). Use new Tailwind 4 syntax (`@theme`, `@apply`, CSS-based config) — no `theme.extend` etc.
