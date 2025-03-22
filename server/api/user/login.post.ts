// 用户手机号验证码登录

interface LoginBody {
  phone: string
  code: string
  openid?: string
}

export default defineEventHandler(async (event: any) => {
  const body = await readBody<LoginBody>(event)
  
  // 验证请求数据
  if (!body.phone || !body.code) {
    return {
      code: 201,
      message: '手机号和验证码不能为空',
      data: null
    }
  }
  
  // 验证手机号格式
  if (!/^1[3456789]\d{9}$/.test(body.phone)) {
    return {
      code: 201,
      message: '手机号格式不正确',
      data: null
    }
  }

  // TODO: 实际项目中应该验证验证码是否正确
  // TODO: 查询数据库或调用外部服务进行身份验证

  // 模拟成功登录
  return {
    code: 200,
    message: '登录成功',
    data: {
      name: '测试用户',
      token: 'mock-token-' + Date.now(),
      phone: body.phone
    }
  }
})