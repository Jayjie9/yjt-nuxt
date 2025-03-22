<script setup lang="ts">
import {ElMessage} from "element-plus";
import {ArrowDown} from '@element-plus/icons-vue'
import "~/assets/css/index.css";
import "~/assets/css/iconfont.css";
import "~/assets/css/main.css";

let displayName = ref('藤椒鸡柳-')
let dialogUserFormVisible = ref(false)

async function a() {
  alert("点击了...")
}

async function b() {
  navigateTo('/login')
}

const handleLoginCommand = (command: string | number | object) => {
  if (import.meta.client) ElMessage(`click on item ${command}`)
}
</script>

<template>
  <ul>
    <li>
      <NuxtLink to="/">index 首页</NuxtLink>
    </li>
    <li>
      <NuxtLink to="/about">about页面</NuxtLink>
    </li>
    <li>
      <NuxtLink to="/user">用户页面</NuxtLink>
    </li>
    <li>
      <NuxtLink to="/login">登录页面</NuxtLink>
    </li>
  </ul>

  <div class="header-container">
    <div class="wrapper">
      <!-- logo -->
      <div class="left-wrapper v-link selected">
        <img style="width: 50px; height: 50px" src="~assets/images/logo.png" alt="logo">
        <span class="text">医捷通</span>
      </div>

      <!--  下拉菜单-->
      <div class="right-wrapper">
        <span class="v-link clickable" @click="a">帮助中心</span>
        <span class="v-link clickable" @click="b" id="loginDialog">登录/注册</span>

        <el-dropdown @command="handleLoginCommand">
          <div class="el-dropdown-link">
            {{ displayName }}
            <el-icon class="el-icon--right">
              <ArrowDown/>
            </el-icon>
          </div>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="实名认证">实名认证</el-dropdown-item>
              <el-dropdown-item command="挂号订单">挂号订单</el-dropdown-item>
              <el-dropdown-item command="就诊人管理">就诊人管理</el-dropdown-item>
              <el-dropdown-item command="divided" divided>退出登录</el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>