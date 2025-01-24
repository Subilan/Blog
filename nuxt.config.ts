import svgLoader from 'vite-svg-loader';

export default defineNuxtConfig({
  compatibilityDate: '2024-04-03',
  devtools: { enabled: true },

  devServer: {
    port: 4040
  },

  vite: {
    plugins: [
        svgLoader()
    ]
  },

  site: {
    url: 'https://subilan.win',
    name: 'SolitudeScroll'
  },

  modules: ['@nuxtjs/sitemap'],

  sitemap: {
    sources: [
      '/api/get-post-urls'
    ]
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      routes: ['/sitemap.xml']
    }
  }
})