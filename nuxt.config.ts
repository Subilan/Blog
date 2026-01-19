import svgLoader from 'vite-svg-loader';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';

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

	modules: ['@nuxtjs/sitemap', '@nuxt/image', '@nuxt/fonts', 'nuxt-og-image'],

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
	},

	ogImage: {
		zeroRuntime: true,
		defaults: {
			// satori is not working at all at my needs.
			// chromium is the only choice here.
			renderer: 'chromium'
		},
		fonts: [
			{ path: '/fonts/InterDisplay-Regular.ttf', name: 'Inter', weight: 400 },
			{ path: '/fonts/InterDisplay-Bold.ttf', name: 'Inter', weight: 700 },
			{ path: '/fonts/NotoSansSC-Regular.otf', name: 'NotoSansSC', weight: 400 },
			{ path: '/fonts/NotoSansSC-Bold.otf', name: 'NotoSans', weight: 700 }
		]
	},

	fonts: {
		provider: 'local',
		processCSSVariables: false,
		families: [
			{
				name: 'Inter',
				weight: 400,
				src: '/fonts/InterDisplay-Regular.ttf',
				global: true
			},
			{
				name: 'Inter',
				weight: 700,
				src: '/fonts/InterDisplay-Bold.ttf',
				global: true
			},
			{
				name: 'NotoSansSC',
				weight: 400,
				src: '/fonts/NotoSansSC-Regular.otf',
				global: true
			},
			{
				name: 'NotoSansSC',
				weight: 700,
				src: '/fonts/NotoSansSC-Bold.otf',
				global: true
			}
		]
	}
});
