/**
 * 全局路由守卫
 * 负责路由访问控制
 */

import { useUserStore } from '~/stores/user'

export default defineNuxtRouteMiddleware((to, from) => {
  const userStore = useUserStore()
  const { isLoggedIn } = useAuth()

  // 白名单路由
  const passURl = [
    '/',
    '/login',
    '/about',
    '/index',
    '/hospital',
    '/hospital/(.*)',
    '/disease',
    '/disease/(.*)',
    '/patient',
    '/user',
  ]

  // 如果是404路由，直接显示404页面
  if (to.name === '404') {
    return
  }

  // 如果用户已登录，允许访问所有路由
  if (isLoggedIn.value || userStore.LoggedIn) {
    return
  }

  // 如果访问的不是白名单路由，重定向到登录页
  if (
    !passURl.some((path) => {
      if (path.includes('(.*)')) {
        // 对于包含通配符的路由，使用正则匹配
        const regex = new RegExp(`^${path.replace('(.*)', '.*')}$`)
        return regex.test(to.path)
      }
      return path === to.path
    })
  ) {
    if (import.meta.client) {
      // 检查本地存储的登录信息
      const userName = localStorage.getItem('user-name')
      const userToken = localStorage.getItem('user-token')

      // 如果本地存储中没有用户信息，重定向到登录页
      if (!userName || !userToken) {
        return navigateTo('/login')
      }
    }
  }
})
