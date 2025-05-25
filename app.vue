<script setup>
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
</script>
<template>
  <NuxtLayout>
    <NuxtPage></NuxtPage>
  </NuxtLayout>
</template>

<style>
@import '@/assets/theme/common.css';

html {
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>