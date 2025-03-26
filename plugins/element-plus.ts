/**
 * Element Plus 插件
 * 负责Element Plus组件库的初始化
 * 包括ID注入、Z-Index注入、Element Plus组件库的配置等
 */
import ElementPlus from 'element-plus'
import { ID_INJECTION_KEY, ZINDEX_INJECTION_KEY } from 'element-plus'
import localeZh from 'element-plus/es/locale/lang/zh-cn'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp
    .provide(ID_INJECTION_KEY, {
      prefix: Math.floor(Math.random() * 1000),
      current: 0,
    })
    .provide(ZINDEX_INJECTION_KEY, { current: 0 })
    .use(ElementPlus, {
      size: 'small',
      zIndex: 3000,
      locale: localeZh,
    })
})
