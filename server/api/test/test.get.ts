export default defineEventHandler(async (event: any) => {
  // 使用$fetch发送GET请求到示例API
  const response = await $fetch('http://127.0.0.1:8000/api/cmn/test/a', {
    method: 'GET',
    // 对于简单的GET请求，通常不需要特别指定Content-Type header
  })

  return response
})
