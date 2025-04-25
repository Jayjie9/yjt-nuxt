import { useCookie } from 'nuxt/app'

export const useTheme = () => {
  const themeCookie = useCookie('theme')
  const theme = ref(themeCookie.value || 'light')

  const toggleTheme = () => {
    theme.value = theme.value === 'light' ? 'dark' : 'light'
    themeCookie.value = theme.value
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', theme.value)
    }
  }

  // 初始化主题
  const initTheme = () => {
    if (import.meta.client) {
      document.documentElement.setAttribute('data-theme', theme.value)
    }
  }

  return {
    theme,
    toggleTheme,
    initTheme,
  }
}
