import { createPinia } from 'pinia'
import { useUserStore } from '~/stores/user'

export default defineNuxtPlugin((nuxtApp) => {
  const pinia = createPinia()
  nuxtApp.vueApp.use(pinia)

  // 应用启动时从localStorage恢复用户状态
  if (import.meta.client) {
    setTimeout(() => {
      const userStore = useUserStore()
      userStore.restoreUserInfo()
    }, 0)
  }
})
