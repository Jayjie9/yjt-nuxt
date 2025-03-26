/**
 * JWT令牌管理器
 * 负责JWT令牌的解析、存储、刷新等操作
 */

import { jwtDecode } from 'jwt-decode'
import { useFetchPost } from './useFetchHttp'

/**
 * JWT Token的载荷(payload)接口定义
 * @property exp - 过期时间(expiration time),Unix时间戳(秒)
 * @property iat - 签发时间(issued at),Unix时间戳(秒)
 * @property sub - 主题(subject),通常是用户ID或唯一标识符
 * @property [key: string] - 其他可能存在的自定义字段,使用索引签名允许添加任意字符串键的值
 */
interface TokenPayload {
  exp: number
  iat: number
  sub: string
  [key: string]: any
}

interface RefreshTokenResponse {
  code: number
  message: string
  data: {
    accessToken: string
  }
}

export const useJWT = () => {
  // Token状态
  const accessToken = useState<string>('jwt-access-token', () => '')
  const tokenExpiry = useState<number>('jwt-expiry', () => 0)
  const tokenPayload = useState<TokenPayload | null>('jwt-payload', () => null)
  const isRefreshing = useState<boolean>('jwt-refreshing', () => false)

  // 解析JWT Token
  const parseToken = (token: string): TokenPayload | null => {
    if (!token) return null

    try {
      const payload = jwtDecode<TokenPayload>(token)
      // 验证必要的字段
      if (!payload.exp || !payload.iat || !payload.sub) {
        console.error('Token缺少必要字段')
        return null
      }
      return payload
    } catch (error) {
      console.error('Token解析失败:', error)
      return null
    }
  }

  // 保存Token
  const saveTokens = (newAccessToken: string): boolean => {
    if (!newAccessToken) return false

    // 解析Access Token
    const accessPayload = parseToken(newAccessToken)

    if (!accessPayload) return false

    // 保存Access Token
    accessToken.value = newAccessToken
    tokenPayload.value = accessPayload
    tokenExpiry.value = accessPayload.exp * 1000 // 转换为毫秒

    return true
  }

  // 清除所有Token
  const clearTokens = async () => {
    accessToken.value = ''
    tokenExpiry.value = 0
    tokenPayload.value = null
    isRefreshing.value = false

    // 调用后端接口清除 refreshToken cookie
    try {
      await useFetchPost('/api/token/clear-refresh-token')
      // 同时删除本地cookie
      if (import.meta.client) {
        document.cookie =
          'refreshToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;'
      }
    } catch (error) {
      console.error('清除refreshToken失败:', error)
    }
  }

  // 检查Access Token是否即将过期
  const isTokenExpiring = (): boolean => {
    if (!tokenExpiry.value) return true

    // 给过期时间留有5分钟余量
    const safetyBuffer = 5 * 60 * 1000
    return Date.now() > tokenExpiry.value - safetyBuffer
  }

  // 检查Access Token是否已过期
  const isTokenExpired = (): boolean => {
    if (!tokenExpiry.value) {
      console.log('accessToken已过期')
      return true
    }
    return Date.now() >= tokenExpiry.value
  }

  // 刷新Access Token
  const refreshAccessToken = async (): Promise<boolean> => {
    if (isRefreshing.value) return false

    try {
      isRefreshing.value = true

      // 调用刷新令牌接口
      const { data } = await useFetchGet<RefreshTokenResponse>(
        '/api/token/refresh-token'
      )

      if (data.value?.code === 200 && data.value.data.accessToken) {
        // 请求成功,更新accessToken
        const newAccessToken = data.value.data.accessToken
        const accessPayload = parseToken(newAccessToken)

        if (accessPayload) {
          accessToken.value = newAccessToken
          tokenPayload.value = accessPayload
          tokenExpiry.value = accessPayload.exp * 1000
          return true
        }
      } else {
      }

      return false
    } catch (error) {
      console.error('刷新令牌失败:', error)
      return false
    } finally {
      isRefreshing.value = false
    }
  }

  // 获取当前用户ID
  const getUserId = (): string | null => {
    return tokenPayload.value?.sub || null
  }

  // 获取Token剩余有效期（分钟）
  const getTokenRemainingTime = (): number => {
    if (!tokenExpiry.value) return 0
    const remaining = tokenExpiry.value - Date.now()
    return Math.max(0, Math.floor(remaining / 60000))
  }

  return {
    accessToken,
    tokenPayload,
    tokenExpiry,
    isRefreshing,
    parseToken,
    saveTokens,
    clearTokens,
    isTokenExpiring,
    isTokenExpired,
    refreshAccessToken,
    getUserId,
    getTokenRemainingTime,
  }
}
