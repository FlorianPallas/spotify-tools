import { NuxtConfig } from '@nuxt/types';

const config: NuxtConfig = {
  // Target (https://go.nuxtjs.dev/config-target)
  target: 'static',

  // Global page headers (https://go.nuxtjs.dev/config-head)
  head: {
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
  },

  env: {
    SPOTIFY_CLIENT_ID: '080a5d8437904ed4a343cd73f9f1ad62',
    SPOTIFY_REDIRECT_URI: 'http://localhost:3000/oauth',
  },

  // Global CSS (https://go.nuxtjs.dev/config-css)
  css: ['normalize.css', '~/assets/styles/main.scss'],

  // Plugins to run before rendering page (https://go.nuxtjs.dev/config-plugins)
  plugins: [],

  // Auto import components (https://go.nuxtjs.dev/config-components)
  components: true,

  // Modules for dev and build (recommended) (https://go.nuxtjs.dev/config-modules)
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    '@nuxt/typescript-build',
    '@nuxtjs/svg',
  ],

  // Modules (https://go.nuxtjs.dev/config-modules)
  modules: ['@nuxtjs/style-resources', '@nuxtjs/axios'],

  styleResources: {
    scss: ['~/assets/styles/vars.scss', '~/assets/styles/mixins.scss'],
  },

  // Build Configuration (https://go.nuxtjs.dev/config-build)
  build: {},

  generate: {
    fallback: true,
  },
};
export default config;
