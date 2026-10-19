// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  modules: [
    '@nuxt/eslint',
    '@nuxt/ui',
    '@pinia/nuxt'
  ],

  devtools: {
    enabled: true
  },

  css: ['~/assets/css/main.css'],

  typescript: {
    strict: true,
    tsConfig: {
      compilerOptions: {
        types: ['node']
      }
    }
  },

  runtimeConfig: {
    public: {
      accountsApiV1Url: process.env.ACCOUNTS_API_V1_URL || 'https://accounts.nwantasapi.com/api/v1',
      accountsApiBaseUrl: process.env.ACCOUNTS_API_BASE_URL || 'https://accounts.nwantasapi.com/api',
      coreApiV1Url: process.env.CORE_API_V1_URL || 'https://core.nwantasapi.com/api/v1',
      coreApiV2Url: process.env.CORE_API_V2_URL || 'https://core.nwantasapi.com/api/v2',
      chatApiBaseUrl: process.env.CHAT_API_BASE_URL || 'https://chat.nwantasapi.com',
      chatWsBaseUrl: process.env.CHAT_WS_BASE_URL || 'wss://chat.nwantaspi.com/ws',
      assessmentsApiV1Url: process.env.ASSESSMENTS_API_V1_URL || 'https://assessment.nwantasapi.com/api/v1',
      notificationsApiBaseUrl: process.env.NOTIFICATIONS_API_BASE_URL || 'https://notification.nwantasapi.com',
      appDomain: process.env.APP_DOMAIN || 'localhost:3000',
      env: process.env.NODE_ENV || 'development'
    }
  },

  routeRules: {
    '/': { prerender: true }
  },

  compatibilityDate: '2026-06-30',

  eslint: {
    config: {
      stylistic: {
        commaDangle: 'never',
        braceStyle: '1tbs'
      }
    }
  }
})
