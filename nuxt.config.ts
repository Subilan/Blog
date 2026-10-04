import svgLoader from 'vite-svg-loader';
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },

	css: [
		'@fontsource-variable/inter/standard.css',
		'@fontsource-variable/inter/standard-italic.css',
		'@fontsource/source-serif-4/latin-400.css',
		'@fontsource/source-serif-4/latin-ext-400.css',
		'@fontsource/source-serif-4/latin-400-italic.css',
		'@fontsource/source-serif-4/latin-ext-400-italic.css',
		'@fontsource/source-serif-4/latin-600.css',
		'@fontsource/source-serif-4/latin-ext-600.css',
		'@fontsource/source-serif-4/latin-600-italic.css',
		'@fontsource/source-serif-4/latin-ext-600-italic.css',
		'@fontsource/noto-serif-sc/chinese-simplified-400.css',
		'@fontsource/noto-serif-sc/chinese-simplified-700.css',
		'./assets/main.css'
	],

	runtimeConfig: {
		umamiEndpoint: 'https://analytics.subilan.win',
		umamiUsername: '',
		umamiPassword: ''
	},

	devServer: {
		port: 3030
	},

	vite: {
		plugins: [svgLoader(), tailwindcss()],
		server: {
			watch: {
				ignored: ['**/data/posts/**']
			}
		}
	},

	site: {
		url: 'https://subilan.win',
		name: 'SolitudeScroll'
	},

	modules: ['@nuxtjs/sitemap', '@nuxt/image'],

	sitemap: {
		sources: ['/api/get-post-urls']
	},

	nitro: {
		prerender: {
			crawlLinks: true,
			routes: ['/sitemap.xml']
		},
		preset: 'static'
	},

	app: {
		head: {
			htmlAttrs: {
				lang: 'zh'
			}
		}
	}
});
