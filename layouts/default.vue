<script setup lang="ts">
import "~/assets/css/app.css";
// import "~/assets/css/chunk.css";
// import "~/assets/css/iconfont.css";
import "~/assets/css/main.css";
import MyHeader from "~/layouts/my-header.vue";
import MyFooter from "~/layouts/my-footer.vue";

</script>

<template>
  <div class="app-container">
    <div id="main">
      <header>
        <my-header/>
      </header>

      <main>
        <div class="main-container">
          <!-- 插槽:内容区域-->
          <slot></slot>
        </div>
      </main>

      <footer>
        <my-footer/>
      </footer>
    </div>
  </div>
</template>

<style scoped>
header, footer {
  border: 1px solid #2d2d2d;
}
</style>