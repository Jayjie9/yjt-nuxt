export const loginBySms = (data: any) => {
    return useFetchPost('/api/user/login', data)
}

// export const sendCaptcha = () => {
//     return useFetchGet('/api/sms/send')
// }

export const sendCaptcha = (phone: string) => {
    const encodedPhone = encodeURIComponent(phone)
    return useFetchGet(`/api/sms/send/${encodedPhone}`)
}