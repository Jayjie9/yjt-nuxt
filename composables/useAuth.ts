/**
 * 认证状态管理
 * 负责管理用户认证状态
 *
 * 与 stores/user.ts 的关系:
 * 1. useAuth 提供底层的用户认证状态管理,负责与 localStorage 交互
 * 2. useUserStore 是更高层的状态管理,调用 useAuth 的方法来实现:
 *    - setUserInfo action 中调用 saveUserInfo 保存用户信息
 *    - logout action 中调用 clearUserInfo 清除用户信息
 *    - restoreUserInfo action 中使用 userToken/userName 恢复状态
 * 3. 两者配合实现完整的用户认证状态管理:
 *    - useAuth 负责本地存储
 *    - useUserStore 负责全局状态
 */
export const useAuth = () => {
  // 使用useState来管理token和用户名
  const userToken = useState<string>('user-token', () => {
    // 在初始化时尝试从localStorage读取
    if (import.meta.client) {
      return localStorage.getItem('user-token') || ''
    }
    return ''
  })

  const userName = useState<string>('user-name', () => {
    // 在初始化时尝试从localStorage读取
    if (import.meta.client) {
      return localStorage.getItem('user-name') || ''
    }
    return ''
  })

  // 登录后保存信息到localStorage
  const saveUserInfo = (token: string, name: string) => {
    userToken.value = token
    userName.value = name

    // 只在客户端保存到localStorage
    if (import.meta.client) {
      localStorage.setItem('user-token', token)
      localStorage.setItem('user-name', name)
    }
  }

  // 登出时清除信息
  const clearUserInfo = () => {
    userToken.value = ''
    userName.value = ''
    useJWT().clearTokens()

    // 只在客户端清除localStorage
    if (import.meta.client) {
      localStorage.removeItem('user-token')
      localStorage.removeItem('user-name')
    }
  }

  // 判断用户是否已登录
  const isLoggedIn = computed(() => !!userToken.value)

  // 检查并刷新本地存储数据
  const refreshFromLocalStorage = () => {
    if (import.meta.client) {
      const storedToken = localStorage.getItem('user-token')
      const storedName = localStorage.getItem('user-name')

      if (storedToken) {
        userToken.value = storedToken
      }

      if (storedName) {
        userName.value = storedName
      }
    }
  }

  // 在组件挂载时自动恢复状态
  if (import.meta.client) {
    refreshFromLocalStorage()
  }

  return {
    userToken,
    userName,
    saveUserInfo,
    clearUserInfo,
    isLoggedIn,
    refreshFromLocalStorage,
  }
}
