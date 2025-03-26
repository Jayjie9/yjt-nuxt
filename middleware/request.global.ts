/**
 * 全局路由守卫
 * 负责路由访问控制
 */

import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore()
  const { isLoggedIn } = useAuth()

  // 白名单路由
  const passURl = ['/', '/login', '/about', '/index']

  // 如果用户已登录，允许访问所有路由
  if (isLoggedIn.value || userStore.LoggedIn) {
    return
  }

  // 如果访问的不是白名单路由，重定向到登录页
  if (!passURl.includes(to.path)) {
    return navigateTo('/login')
  }
})
