import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@element-plus/nuxt', '@pinia/nuxt'],
  app: {
    pageTransition: { name: 'page', mode: 'out-in' },
  },
})

export default {
  compatibilityDate: '2025-03-14',
  vite: {
    plugins: [
      AutoImport({
        resolvers: [
          ElementPlusResolver(),
          IconsResolver({
            prefix: 'Icon',
          }),
        ],
      }),
      Components({
        dts: true,
        resolvers: [
          ElementPlusResolver({
            importStyle: false,
          }),
        ],
      }),
    ],
  },
  experimental: {
    renderJsonPayloads: true,
  },
  runtimeConfig: {
    public: {
      API_BASE_DEV: 'http://localhost:8000',
      API_BASE_PROD: 'https://yjt.asia',
    },
  },
  css: [
    '~/node_modules/element-plus/dist/index.css',
    '~/node_modules/element-plus/theme-chalk/display.css',
    '~/assets/theme/index.css',
  ],
}
