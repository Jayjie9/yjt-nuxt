import { useRuntimeConfig } from 'nuxt/app'

interface RequestOptions {
  headers?: Record<string, string>
  customBaseURL?: string
  timeout?: number
  retry?: number
  credentials?: RequestCredentials
  body?: any
  [key: string]: any
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete'

/**
 * 创建请求拦截器
 */
function createFetchOptions(
  method: HttpMethod,
  data: any,
  options: RequestOptions = {}
) {
  const headers = { ...options.headers }

  // 如果是POST/PUT且data是FormData，不强制设置Content-Type，让浏览器自动带boundary
  if (data instanceof FormData) {
    // 不设置Content-Type
  } else if (method === 'post' || method === 'put') {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json'
  }

  return {
    ...options,
    headers,
    credentials: options.credentials || 'include',
    retry: options.retry ?? 3,
    timeout: options.timeout ?? 10000,
  }
}

/**
 * 处理响应
 */
function handleResponse(response: any) {
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

    const fetchOptions = createFetchOptions(method, data, options)

    try {
      if (method === 'get' || method === 'delete') {
        // 将data转成URL参数
        const params = new URLSearchParams(data)
        const finalUrl = params.toString()
          ? `${requestUrl}?${params.toString()}`
          : requestUrl

        const response = await $fetch<T>(finalUrl, {
          ...fetchOptions,
          method,
        })
        console.log('请求响应:', response)
        return { data: handleResponse(response) }
      } else {
        // POST/PUT，发送body
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
