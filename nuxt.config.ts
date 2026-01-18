import svgLoader from 'vite-svg-loader';
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },

	css: ['./assets/main.css'],

	runtimeConfig: {
		umamiEndpoint: 'https://analytics.subilan.win',
		umamiUsername: '',
		umamiPassword: ''
	},

	devServer: {
		port: 3030
	},

	vite: {
		plugins: [svgLoader(), tailwindcss()]
	},

	site: {
		url: 'https://subilan.win',
		name: 'SolitudeScroll'
	},

	modules: ['@nuxtjs/sitemap', '@nuxt/image', 'nuxt-og-image'],

	sitemap: {
		sources: ['/api/get-post-urls']
	},

	nitro: {
		prerender: {
			crawlLinks: true,
			routes: ['/sitemap.xml']
		}
	},

	app: {
		head: {
			htmlAttrs: {
				lang: 'zh'
			}
		}
	},

	ogImage: {
		fonts: [
			{
				name: 'Noto Serif SC',
				weight: 700,
				path: '/fonts/noto-serif-sc/noto-serif-sc-v31-chinese-simplified_latin-700.ttf'
			},
			{
				name: 'Noto Serif SC',
				weight: 400,
				path: '/fonts/noto-serif-sc/noto-serif-sc-v31-chinese-simplified_latin-regular.ttf'
			},
			{
				name: 'Literata',
				weight: 400,
				path: '/fonts/literata/literata-v35-latin-regular.ttf'
			},
			{
				name: 'Literata',
				weight: 700,
				path: '/fonts/literata/literata-v35-latin-700.ttf'
			}
		]
	}
});
