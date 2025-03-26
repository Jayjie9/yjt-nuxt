/**
 * 用户状态管理
 * 负责管理用户登录状态、用户信息等
 */
import { defineStore } from 'pinia'
import { useAuth } from '~/composables/useAuth'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    token: '',
    isLogged: false,
  }),
  getters: {
    // 获取用户登录状态
    LoggedIn: (state) => state.isLogged,
    // 获取用户名
    getUserName: (state) => state.name,
    // 获取token
    getAccessToken: (state) => state.token,
  },
  actions: {
    // 设置用户信息
    setUserInfo(name: string, token: string) {
      this.name = name
      this.token = token
      this.isLogged = true

      // 保存到localStorage
      const { saveUserInfo } = useAuth()
      saveUserInfo(token, name)

      console.log('用户登录成功:', { name, isLogged: this.isLogged })
    },

    // 登出 清除用户信息
    logout() {
      // 先清除localStorage
      const { clearUserInfo } = useAuth()
      clearUserInfo()

      // 再清除store状态
      this.name = ''
      this.token = ''
      this.isLogged = false

      console.log('用户已退出登录')
    },

    // 从localStorage恢复用户信息
    restoreUserInfo() {
      const { userToken, userName } = useAuth()
      this.name = userName.value || ''
      this.token = userToken.value || ''
      this.isLogged = !!userToken.value

      console.log('恢复用户状态:', {
        name: this.name,
        hasToken: !!this.token,
        isLogged: this.isLogged,
      })
    },
  },
})
