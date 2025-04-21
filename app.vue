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
html {
  overflow-y: scroll;
  overflow-x: hidden;
}
</style>