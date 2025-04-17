/**
 * $fetch HTTP客户端工具
 * 基于Nuxt 3的$fetch API封装
 * 提供请求拦截、响应处理和统一的API调用方式
 */

import { useRuntimeConfig } from 'nuxt/app'

interface RequestOptions {
  headers?: Record<string, string>
  customBaseURL?: string
  timeout?: number
  retry?: number
  credentials?: RequestCredentials
  [key: string]: any
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete'

/**
 * 创建请求拦截器
 */
function createFetchOptions(options: RequestOptions = {}) {
  // 添加基本请求头
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  return {
    ...options,
    headers,
    credentials: options.credentials || 'include', // 允许跨域请求携带cookie
    retry: options.retry ?? 3,
    timeout: options.timeout ?? 10000,
  }
}

/**
 * 处理响应
 */
function handleResponse(response: any) {
  // 如果响应是标准格式，直接返回数据
  if (response && typeof response === 'object') {
    return response
  }
  return response
}

/**
 * 创建请求方法
 */
function createFetchRequest(method: HttpMethod) {
  return async function <T = any>(
    url: string,
    data?: any,
    options: RequestOptions = {}
  ) {
    const {
      public: { API_BASE_DEV, API_BASE_PROD },
    } = useRuntimeConfig()

    const baseURL =
      process.env.NODE_ENV === 'production' ? API_BASE_PROD : API_BASE_DEV

    const requestUrl = new URL(url, options.customBaseURL || baseURL).toString()

    console.log('发送请求:', {
      url: requestUrl,
      method,
      data,
      options,
    })

    const fetchOptions = createFetchOptions(options)

    try {
      // 根据HTTP方法处理请求体
      if (method === 'get' || method === 'delete') {
        // 将data转换为URL参数
        const params = new URLSearchParams(data)
        const finalUrl = params.toString()
          ? `${requestUrl}?${params.toString()}`
          : requestUrl
        console.log('finalUrl:', finalUrl)

        // GET和DELETE请求通常不包含请求体，参数通过URL传递
        const response = await $fetch<T>(finalUrl, {
          ...fetchOptions,
          method,
        })
        console.log('请求响应:', response)
        return { data: handleResponse(response) }
      } else {
        // POST和PUT请求包含请求体
        const response = await $fetch<T>(requestUrl, {
          ...fetchOptions,
          method,
          body: data,
        })
        console.log('请求响应:', response)
        return { data: handleResponse(response) }
      }
    } catch (error: any) {
      console.error('请求失败:', {
        url: requestUrl,
        method,
        error,
      })

      // 处理常见HTTP错误
      if (error.response) {
        const status = error.response.status
        if (status === 404) {
          throw new Error('请求的资源不存在')
        } else if (status === 500) {
          throw new Error('服务器内部错误')
        } else if (status === 401) {
          throw new Error('未授权，请登录')
        } else if (status === 403) {
          throw new Error('禁止访问，权限不足')
        }
      }
      throw error
    }
  }
}

// 提供基于$fetch的HTTP方法
export const fetchGet = createFetchRequest('get')
export const fetchPost = createFetchRequest('post')
export const fetchPut = createFetchRequest('put')
export const fetchDelete = createFetchRequest('delete')

/**
 * 使用示例:
 *
 * import { fetchGet, fetchPost } from '~/composables/useFetchApi'
 *
 * // GET请求
 * const { data } = await fetchGet('/api/users')
 *
 * // POST请求
 * const { data } = await fetchPost('/api/users', { name: '张三', age: 25 })
 */
