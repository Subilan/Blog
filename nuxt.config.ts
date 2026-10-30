import svgLoader from 'vite-svg-loader';
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },

	css: [
		'@fontsource-variable/inter/standard.css',
		'@fontsource-variable/inter/standard-italic.css',
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
		name: 'Haskell Works'
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
