import { useJWT } from '~/composables/useJWT'
import { useUserStore } from '~/stores/user'

/**
 * 认证守卫中间件
 * 负责API请求的JWT认证
 */

// 需要JWT认证的API路径前缀
const JWT_AUTH_PATHS = ['/api/user', '/api/order']

export default defineNuxtRouteMiddleware(async (to, from) => {
  // 检查是否是API请求
  if (!to.path.startsWith('/api/')) {
    return
  }

  // 检查是否需要JWT认证
  const needsJWT = JWT_AUTH_PATHS.some((path) => to.path.startsWith(path))
  if (!needsJWT) {
    return
  }

  const jwt = useJWT()
  const userStore = useUserStore()

  // 如果JWT令牌已过期，尝试刷新令牌
  if (jwt.isTokenExpired() && !jwt.isRefreshing.value) {
    const refreshed = await jwt.refreshAccessToken()
    if (!refreshed) {
      // 刷新失败
      userStore.logout()
      if (import.meta.client) {
        ElMessage.warning('当前登录态已失效，请重新登录')
      }
      return
    }
  }

  // 添加JWT认证头
  if (jwt.accessToken.value) {
    to.meta.headers = {
      ...(to.meta.headers || {}),
      Authorization: `Bearer ${jwt.accessToken.value}`,
    }
  }
})
