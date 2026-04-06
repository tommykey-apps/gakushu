// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/content'],

  ui: {
    colorMode: false,
  },

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },

  nitro: {
    prerender: {
      routes: ['/chapters/1', '/chapters/2', '/chapters/3', '/chapters/4', '/chapters/5'],
    },
  },

  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:3001/**',
    },
  },

  css: ['~/assets/css/main.css'],
})
