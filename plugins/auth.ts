import { defineNuxtPlugin } from 'nuxt/app'
import { useJWT } from '~/composables/useJWT'
import { useUserStore } from '~/stores/user'

/**
 * JWT令牌刷新插件
 * 负责定时检查和刷新JWT令牌
 */
export default defineNuxtPlugin((nuxtApp) => {
  const jwt = useJWT()

  // 设置定时检查token是否需要刷新
  if (import.meta.client) {
    const refreshCheckInterval = setInterval(async () => {
      // 检查accessToken是否即将过期
      if (jwt.isTokenExpiring() && !jwt.isRefreshing.value) {
        console.log('accessToken 即将过期, 开始刷新')

        const refreshed = await jwt.refreshAccessToken()
        if (!refreshed) {
          // 刷新失败，需要重新登录
          // TODO: 刷新失败，只在后续需要认证的接口中提示重新登录
          //ElMessage.error('登录状态已过期，请重新登录')
          const userStore = useUserStore()
          userStore.logout()
          window.location.href = '/login'
        }
      }
    }, 5 * 60 * 1000) // 每5分钟检查一次

    // 页面卸载时清除定时器
    nuxtApp.hook('app:beforeMount', () => {
      if (refreshCheckInterval) {
        clearInterval(refreshCheckInterval)
      }
    })
  }

  return {
    provide: {
      auth: {
        jwt,
      },
    },
  }
})
