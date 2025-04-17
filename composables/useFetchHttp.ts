/**
 * HTTP客户端工具
 * 负责处理HTTP请求
 * 包括请求拦截器、响应拦截器、请求方法创建等
 */

import { useFetch, useRuntimeConfig } from 'nuxt/app'
import type { UseFetchOptions } from 'nuxt/app'

interface RequestOptions extends UseFetchOptions<any> {
  customBaseURL?: string
}

type HttpMethod = 'get' | 'post' | 'put' | 'delete'
type HandleRequestOptions = { request: Request; options: RequestOptions }
type HandleResponseOptions = { response: any }

// 请求拦截器
async function handleRequest({ request, options }: HandleRequestOptions) {
  // 添加基本请求头
  options.headers = {
    ...options.headers,
    'Content-Type': 'application/json',
  }
}

// 响应拦截器
function handleResponse({ response }: HandleResponseOptions) {
  // 处理404错误
  if (response.status === 404) {
    throw new Error('请求的资源不存在')
  }

  // 处理500错误
  if (response.status === 500) {
    throw new Error('服务器内部错误')
  }

  // 处理其他错误
  if (response._data.error) {
    throw new Error(response._data.error.message || '响应错误')
  }
  return response._data
}

/**
 * 创建请求方法
 */
function createUseFetchRequest(method: HttpMethod) {
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

    try {
      const response = await useFetch<T>(requestUrl, {
        ...options,
        method: method as any,
        body: data,
        onRequest: handleRequest,
        onResponse: handleResponse,
        // 添加跨域支持
        credentials: 'include', // 允许跨域请求携带cookie
        // 添加超时设置
        timeout: 10000,
        // 添加重试配置
        retry: 3,
        retryDelay: 1000,
      })

      console.log('请求响应:', response)
      return response
    } catch (error) {
      console.error('请求失败:', {
        url: requestUrl,
        method,
        error,
      })
      throw error
    }
  }
}

// 提供 useFetch & HTTP 方法 - 统一管理请求 - 再到组件中使用
export const useFetchGet = createUseFetchRequest('get')
export const useFetchPost = createUseFetchRequest('post')
export const useFetchPut = createUseFetchRequest('put')
export const useFetchDelete = createUseFetchRequest('delete')
