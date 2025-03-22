<script setup lang="ts">
// 命名路由
const route = useRoute()
console.log(route.params.id)
</script>

<template>
  <div>{{route.params.id}}</div>
</template>

<style scoped>

</style>