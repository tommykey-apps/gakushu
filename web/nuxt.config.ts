// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: ['@nuxt/ui', '@nuxt/content'],

  app: {
    pageTransition: {
      name: 'page',
      mode: 'out-in',
    },
  },

  routeRules: {
    '/api/**': {
      proxy: 'http://localhost:3001/**',
    },
  },

  css: ['~/assets/css/main.css'],
})
