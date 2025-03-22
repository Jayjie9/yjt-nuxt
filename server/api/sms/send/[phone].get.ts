// 发送验证码API

export default defineEventHandler(async (event: any) => {
  // 获取路径参数中的手机号
  const phone = getRouterParam(event, 'phone')
  
  // 验证手机号格式
  if (!phone || !/^1[3456789]\d{9}$/.test(phone)) {
    return {
      code: 201,
      message: '手机号格式不正确',
      data: null
    }
  }

  // 生成随机验证码
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  
  // TODO: 实际项目中应该调用短信服务发送验证码
  // TODO: 将验证码保存到缓存或数据库中，以便后续验证

  // 模拟成功发送
  return {
    code: 200,
    message: '验证码发送成功',
    data: {
      phone,
      // 实际生产环境不应该返回验证码，这里仅用于测试
      code: process.env.NODE_ENV === 'development' ? code : undefined
    }
  }
}) 