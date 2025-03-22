// 全局路由中间件，后缀带.global to: 要去到的路由
export default defineNuxtRouteMiddleware((to, from) => {
    let passURl = ["/", "/login", "/about", "/index"]
    if (!passURl.includes(to.path)) {
        return navigateTo("/login")
    }
})