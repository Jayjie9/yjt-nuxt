// File: /stores/user.ts
import { defineStore } from 'pinia'
import { useAuth } from '~/composables/useAuth'

export const useUserStore = defineStore('user', {
  state: () => ({
    name: '',
    token: '',
    avatar: '' as string, // 存储基础 avatar key
    avatarUrl: '' as string, // 存储签名URL（每小时更新）
    isLogged: false,
  }),

  getters: {
    LoggedIn: (state) => state.isLogged,
    getUserName: (state) => state.name,
    getAccessToken: (state) => state.token,
  },

  actions: {
    setUserInfo(name: string, token: string, avatar: string) {
      this.name = name
      this.token = token
      this.avatar = avatar
      this.isLogged = true

      const { saveUserInfo } = useAuth()
      saveUserInfo(token, name, avatar)

      console.log('用户登录成功:', { name, token, avatar })
    },

    setAvatarUrl(url: string) {
      this.avatarUrl = url
    },

    logout() {
      const { clearUserInfo } = useAuth()
      clearUserInfo()

      this.name = ''
      this.token = ''
      this.avatar = ''
      this.avatarUrl = ''
      this.isLogged = false

      localStorage.removeItem('avatar-url-cache')
    },

    restoreUserInfo() {
      const { userToken, userName, userAvatar } = useAuth()
      this.name = userName.value || ''
      this.token = userToken.value || ''
      this.avatar = userAvatar.value || ''
      this.isLogged = !!userToken.value

      console.log('恢复用户状态:', {
        name: this.name,
        token: this.token,
        avatar: this.avatar,
        isLogged: this.isLogged,
      })
    },

    async refreshAvatarUrl() {
      if (!this.avatar) return

      const cached = localStorage.getItem('avatar-url-cache')
      if (cached) {
        try {
          const { url, expiresAt } = JSON.parse(cached)
          if (Date.now() < expiresAt) {
            this.avatarUrl = url
            return
          }
        } catch (e) {
          console.warn('头像缓存解析失败:', e)
        }
      }

      try {
        const { useApi } = await import('~/composables/index')
        const api = useApi()
        const { data: response } = await api.oss.renewUrl(this.avatar)

        this.avatarUrl = response.data
        const expiresAt = Date.now() + 3600 * 1000 // 1小时有效

        localStorage.setItem(
          'avatar-url-cache',
          JSON.stringify({
            url: response.data,
            expiresAt,
          })
        )
      } catch (e) {
        console.error('刷新头像签名 URL 失败:', e)
      }
    },
  },
})
