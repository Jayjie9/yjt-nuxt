// 用户手机号验证码登录

export default defineEventHandler(async (event: any) => {
    const method = getMethod(event).toUpperCase()
    const body = await readBody(event)

    return {body}
})