import svgLoader from 'vite-svg-loader';

export default defineNuxtConfig({
	compatibilityDate: '2024-04-03',
	devtools: { enabled: true },

	runtimeConfig: {
    umamiEndpoint: 'https://analytics.subilan.win',
		umamiUsername: '',
		umamiPassword: ''
	},

	devServer: {
		port: 3030
	},

	vite: {
		plugins: [svgLoader()]
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
		}
	},

  app: {
    head: {
      htmlAttrs: {
        lang: 'zh'
      }
    }
  }
});
