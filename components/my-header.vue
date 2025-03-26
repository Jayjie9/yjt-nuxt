<script setup lang="ts">
import { ElMessage } from "element-plus";
import {
  ArrowDown,
  QuestionFilled,
  User,
  Calendar,
  Document,
  House,
  Bell,
  Location,
  Service
} from '@element-plus/icons-vue'

import { useUserStore } from '~/stores/user'


// 用户登录状态
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.LoggedIn)
const displayName = computed(() => userStore.getUserName)

// 在组件挂载时恢复用户状态
onMounted(() => {
  userStore.restoreUserInfo()
})

// 处理回到首页
function goHome() {
  navigateTo('/')
}

// 帮助中心
async function goToHelp() {
  navigateTo('/help')
}

// 登录功能
async function goToLogin() {
  navigateTo('/login')
}

// 查找医院
function goToFindHospital() {
  navigateTo('/hospital/list')
}

// 预约挂号
function goToAppointment() {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return navigateTo('/login')
  }
  navigateTo('/appointment')
}

// 就诊人管理
function goToPatients() {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return navigateTo('/login')
  }
  navigateTo('/user/patients')
}

const handleLoginCommand = (command: string | number | object) => {
  if (command === 'logout') {
    userStore.logout()
    ElMessage.info('已退出登录')
    // 强制刷新页面以确保状态更新
    if (import.meta.client) {
      window.location.href = '/'
    }
    return
  }

  if (command === '个人中心') {
    navigateTo('/user/profile')
    return
  }

  if (command === '挂号订单') {
    navigateTo('/user/orders')
    return
  }

  if (command === '就诊人管理') {
    navigateTo('/user/patients')
    return
  }

  if (import.meta.client) ElMessage(`点击了${command}选项`)
}
</script>

<template>
  <div class="header-container">
    <div class="wrapper">
      <!-- logo -->
      <div class="left-wrapper v-link selected" @click="goHome">
        <img style="width: 50px; height: 50px" src="~assets/images/logo.png" alt="logo">
        <span class="text">医捷通</span>
      </div>

      <!-- 导航菜单 -->
      <div class="nav-wrapper">
        <div class="nav-item" @click="goHome">
          <el-icon>
            <House />
          </el-icon>
          <span>首页</span>
        </div>
        <div class="nav-item" @click="goToFindHospital">
          <el-icon>
            <Location />
          </el-icon>
          <span>找医院</span>
        </div>
        <div class="nav-item" @click="goToAppointment">
          <el-icon>
            <Calendar />
          </el-icon>
          <span>预约挂号</span>
        </div>
        <div class="nav-item" @click="goToHelp">
          <el-icon>
            <QuestionFilled />
          </el-icon>
          <span>帮助中心</span>
        </div>
      </div>

      <!-- 右侧用户菜单 -->
      <div class="right-wrapper">
        <div class="v-link clickable" @click="goToPatients">
          <el-icon>
            <Document />
          </el-icon>
          <span>就诊人管理</span>
        </div>

        <div class="v-link clickable notification">
          <el-icon>
            <Bell />
          </el-icon>
          <span>消息</span>
          <span class="badge">2</span>
        </div>

        <div class="v-link clickable" @click="goToHelp">
          <el-icon>
            <Service />
          </el-icon>
          <span>客服</span>
        </div>

        <!-- 登录/用户信息下拉菜单 -->
        <template v-if="!isLoggedIn">
          <div class="login-btn" @click="goToLogin">
            <el-icon>
              <User />
            </el-icon>
            <span>登录/注册</span>
          </div>
        </template>

        <template v-else>
          <el-dropdown @command="handleLoginCommand" class="user-dropdown">
            <div class="el-dropdown-link">
              <div class="avatar">{{ displayName.charAt(0) }}</div>
              <span>{{ displayName }}</span>
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="个人中心">
                  <el-icon>
                    <User />
                  </el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="挂号订单">
                  <el-icon>
                    <Document />
                  </el-icon>挂号订单
                </el-dropdown-item>
                <el-dropdown-item command="就诊人管理">
                  <el-icon>
                    <Document />
                  </el-icon>就诊人管理
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.header-container {
  position: sticky;
  top: 0;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.wrapper {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 20px;
  height: 70px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 左侧 Logo 区域 */
.left-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.left-wrapper img {
  transition: transform 0.3s ease;
}

.left-wrapper:hover img {
  transform: scale(1.05);
}

.left-wrapper .text {
  margin-left: 12px;
  font-size: 20px;
  font-weight: 600;
  color: #409EFF;
  letter-spacing: 0.5px;
}

/* 中间导航菜单 */
.nav-wrapper {
  display: flex;
  align-items: center;
  gap: 25px;
  margin-left: 40px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 16px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 4px;
  color: #606266;
  transition: all 0.3s;
}

.nav-item:hover {
  background-color: #f0f9ff;
  color: #409EFF;
}

.nav-item .el-icon {
  font-size: 18px;
}

/* 右侧菜单区域 */
.right-wrapper {
  display: flex;
  align-items: center;
  gap: 20px;
}

.v-link {
  position: relative;
  font-size: 14px;
  color: #606266;
  transition: color 0.3s;
  display: flex;
  align-items: center;
  gap: 5px;
}

.v-link .el-icon {
  font-size: 16px;
}

.v-link.clickable {
  cursor: pointer;
  padding: 6px 8px;
  border-radius: 4px;
}

.v-link.clickable:hover {
  color: #409EFF;
  background-color: #f0f9ff;
}

/* 通知图标样式 */
.notification {
  position: relative;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  background-color: #f56c6c;
  color: white;
  border-radius: 10px;
  font-size: 12px;
  padding: 0 5px;
  min-width: 16px;
  height: 16px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 登录按钮 */
.login-btn {
  display: flex;
  align-items: center;
  gap: 5px;
  cursor: pointer;
  padding: 8px 15px;
  border-radius: 20px;
  background-color: #409EFF;
  color: #ffffff;
  font-weight: 500;
  transition: all 0.3s;
}

.login-btn:hover {
  background-color: #66b1ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
}

/* 下拉菜单样式 */
.user-dropdown {
  cursor: pointer;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 8px;
  border-radius: 4px;
  transition: all 0.3s;
}

.el-dropdown-link:hover {
  background-color: #f5f7fa;
  color: #409EFF;
}

.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #409EFF;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin-right: 0;
}

/* 响应式设计 */
@media screen and (max-width: 1024px) {
  .nav-wrapper {
    display: none;
  }
}

@media screen and (max-width: 768px) {
  .wrapper {
    height: 60px;
    padding: 0 15px;
  }

  .left-wrapper .text {
    font-size: 18px;
  }

  .right-wrapper {
    gap: 10px;
  }

  .v-link span:not(.badge) {
    display: none;
  }

  .login-btn span {
    display: none;
  }

  .el-dropdown-link span {
    display: none;
  }
}

@media screen and (max-width: 576px) {
  .left-wrapper img {
    width: 40px !important;
    height: 40px !important;
  }

  .v-link.notification {
    display: none;
  }
}
</style>