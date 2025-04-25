<script setup lang="ts">
import { useUserStore } from '~/stores/user'
import { useTheme } from '~/composables/useTheme'

const { initTheme } = useTheme()
// 在布局级别恢复用户状态，确保所有页面都能访问到正确的用户状态
const userStore = useUserStore()

onMounted(() => {
  userStore.restoreUserInfo()
  if (import.meta.client) {
    initTheme()
  }
})
</script>

<template>
  <div class="app-container">
    <div id="main">
      <theme-toggle />
      <header>
        <my-header />
      </header>

      <main>
        <div class="main-container">
          <!-- 插槽:内容区域-->
          <slot></slot>
        </div>
      </main>

      <footer>
        <my-footer />
      </footer>
    </div>
  </div>
</template>

<style scoped></style>