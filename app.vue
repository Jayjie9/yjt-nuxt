<script setup>
// 引入主题相关的组合式函数
const { theme, initTheme } = useTheme()

// SEO优化
useHead({
  title: '医捷通',
  meta: [
    {
      name: '网站入口',
      content: 'My custom description'
    }
  ]
})

// 初始化主题
onMounted(() => {
  initTheme()
})
</script>
<template>
  <NuxtLayout>
    <NuxtPage></NuxtPage>
  </NuxtLayout>
</template>

<style>
/* 引入预加载主题样式 */
@import '@/assets/theme/preload.css';

html {
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>