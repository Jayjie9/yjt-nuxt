/**
 * /composables/useAuth.ts
 *
 * 用户认证与本地存储管理封装
 * 管理 Token、用户名、头像 ID（不包含签名 URL）
 */

export const useAuth = () => {
  const userToken = useState<string>('user-token', () => '')
  const userName = useState<string>('user-name', () => '')
  const userAvatar = useState<string>('user-avatar', () => '')

  // 只在客户端初始化 localStorage 数据
  if (import.meta.client) {
    const storedToken = localStorage.getItem('user-token') || ''
    const storedName = localStorage.getItem('user-name') || ''
    const storedAvatar = localStorage.getItem('user-avatar') || ''

    userToken.value = storedToken
    userName.value = storedName
    userAvatar.value = storedAvatar
  }

  /** 保存用户信息到 localStorage */
  const saveUserInfo = (token: string, name: string, avatar: string) => {
    userToken.value = token
    userName.value = name
    userAvatar.value = avatar

    if (import.meta.client) {
      localStorage.setItem('user-token', token)
      localStorage.setItem('user-name', name)
      localStorage.setItem('user-avatar', avatar)
    }
  }
  // 判断用户是否已登录
  const isLoggedIn = computed(() => !!userToken.value)
  /** 清除用户信息（登出） */
  const clearUserInfo = () => {
    userToken.value = ''
    userName.value = ''
    userAvatar.value = ''

    if (import.meta.client) {
      localStorage.removeItem('user-token')
      localStorage.removeItem('user-name')
      localStorage.removeItem('user-avatar')
    }

    // 清除 OSS 签名 URL 缓存
    localStorage.removeItem('avatar-url')
    localStorage.removeItem('avatar-expire')
  }

  return {
    userToken,
    userName,
    userAvatar,
    isLoggedIn,
    saveUserInfo,
    clearUserInfo,
  }
}
