<script setup lang="ts">

</script>

<template>
  <div class="app-container">
    <div id="main">
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