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
  Service,
  SwitchButton
} from '@element-plus/icons-vue'

import { useUserStore } from '~/stores/user'


// 用户登录状态
const userStore = useUserStore()
const isLoggedIn = computed(() => userStore.LoggedIn)
const displayName = computed(() => userStore.getUserName)

// 生成头像背景色
const generateAvatarColor = (name: string) => {
  const colors = [
    'linear-gradient(135deg, #1890ff 0%, #096dd9 100%)',
    'linear-gradient(135deg, #52c41a 0%, #389e0d 100%)',
    'linear-gradient(135deg, #722ed1 0%, #531dab 100%)',
    'linear-gradient(135deg, #13c2c2 0%, #008f8f 100%)',
    'linear-gradient(135deg, #eb2f96 0%, #c41d7f 100%)'
  ]
  const index = name.charCodeAt(0) % colors.length
  return colors[index]
}

// 添加注册路由方法
const goToRegister = () => {
  navigateTo('/register')
}

// 添加客服对话框的状态控制
const showServiceDialog = ref(false)
const serviceMessage = ref('')
const chatMessages = ref([
  {
    type: 'service',
    content: '您好！我是 AI 客服小医，很高兴为您服务。请问有什么可以帮您？',
    time: new Date().toLocaleTimeString()
  }
])

// 打开客服对话框
const openServiceChat = () => {
  showServiceDialog.value = true
}

// 发送消息
const sendMessage = () => {
  if (!serviceMessage.value.trim()) return

  // 添加用户消息
  chatMessages.value.push({
    type: 'user',
    content: serviceMessage.value,
    time: new Date().toLocaleTimeString()
  })

  // 模拟AI回复
  setTimeout(() => {
    chatMessages.value.push({
      type: 'service',
      content: '感谢您的咨询。我们会认真记录您的问题，并尽快为您解答。如果您需要更专业的帮助，建议您在线预约相关科室的医生进行咨询。',
      time: new Date().toLocaleTimeString()
    })
  }, 1000)

  serviceMessage.value = ''
}

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

// 病情分析
async function goToAnalysisIllness() {
  navigateTo('/hospital/list')
}

// 预约挂号
async function goToAppointment() {
  navigateTo('/')
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
    navigateTo('/user')
    return
  }
  if (command === '挂号订单') {
    navigateTo('/order')
    return
  }
  if (command === '就诊人管理') {
    navigateTo('/patient')
    return
  }
  if (import.meta.client) ElMessage(`点击了${command}选项`)
}

// 在组件挂载时恢复用户状态
onMounted(() => {
  userStore.restoreUserInfo()
})
</script>


<template>
  <div class="header-container">
    <div class="wrapper">
      <!-- logo -->
      <div class="left-wrapper v-link selected" @click="goHome">
        <img src="~assets/images/logo.png" alt="logo">
        <span class="text">医捷通</span>
      </div>

      <!-- 导航菜单 -->
      <div class="nav-wrapper">
        <div class="nav-item v-link" @click="goHome">
          <el-icon>
            <House />
          </el-icon>
          <span>首页</span>
        </div>
        <div class="nav-item v-link" @click="goToAnalysisIllness">
          <el-icon>
            <Location />
          </el-icon>
          <span>病症分析</span>
        </div>
        <div class="nav-item v-link" @click="goToAppointment">
          <el-icon>
            <Calendar />
          </el-icon>
          <span>预约挂号</span>
        </div>
        <div class="nav-item v-link" @click="goToHelp">
          <el-icon>
            <QuestionFilled />
          </el-icon>
          <span>帮助中心</span>
        </div>
      </div>

      <!-- 右侧用户菜单 -->
      <div class="right-wrapper">
        <!-- 精简操作按钮，保留最重要的功能 -->
        <div class="action-items">
          <div class="v-link notification">
            <el-icon>
              <Bell />
            </el-icon>
            <span>消息</span>
            <span class="badge">2</span>
          </div>

          <div class="v-link" @click="openServiceChat">
            <el-icon>
              <Service />
            </el-icon>
            <span>客服</span>
          </div>
        </div>

        <!-- 登录/用户信息 -->
        <template v-if="!isLoggedIn">
          <div class="auth-section">
            <el-button class="register-btn" text @click="goToRegister">
              注册账号
            </el-button>
            <el-button class="login-btn" type="primary" @click="goToLogin">
              <el-icon>
                <User />
              </el-icon>
              登录
            </el-button>
          </div>
        </template>

        <template v-else>
          <el-dropdown @command="handleLoginCommand" class="user-dropdown" trigger="click">
            <div class="user-info">
              <div class="avatar-wrapper">
                <div class="avatar" :style="{ background: generateAvatarColor(displayName) }">
                  {{ displayName.charAt(0).toUpperCase() }}
                </div>
                <div class="online-status"></div>
              </div>
              <div class="user-details">
                <span class="username">{{ displayName }}</span>
                <span class="user-role">普通用户</span>
              </div>
              <el-icon class="el-icon--right">
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu class="user-dropdown-menu">
                <div class="dropdown-header">
                  <div class="user-info-brief">
                    <span class="greeting">你好，{{ displayName }}</span>
                    <span class="user-id">ID: {{ '未知' }}</span>
                  </div>
                </div>
                <el-dropdown-item command="个人中心">
                  <el-icon>
                    <User />
                  </el-icon>个人中心
                </el-dropdown-item>
                <el-dropdown-item command="就诊人管理">
                  <el-icon>
                    <Document />
                  </el-icon>就诊人管理
                </el-dropdown-item>
                <el-dropdown-item command="挂号订单">
                  <el-icon>
                    <Document />
                  </el-icon>挂号订单
                </el-dropdown-item>
                <el-dropdown-item command="logout" divided>
                  <el-icon>
                    <SwitchButton />
                  </el-icon>退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </div>
    </div>
  </div>

  <!-- 客服对话框 -->
</template>

<style scoped>
.header-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 70px;
  background: rgba(255, 255, 255, 0.8);
  /* 为导航栏添加毛玻璃效果，提升视觉层次感 */
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 1px 15px rgba(0, 0, 0, 0.05);
  z-index: 1000;
}

.wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  gap: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* Logo 样式 */
.left-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.left-wrapper img {
  width: 40px;
  height: 40px;
  transition: transform 0.3s;
}

.left-wrapper:hover img {
  transform: scale(1.05);
}

.left-wrapper .text {
  margin-left: 12px;
  font-size: 20px;
  font-weight: 600;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 导航菜单 */
.nav-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  color: var(--el-text-color-regular);
  transition: all 0.3s;
}

.nav-item:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

/* 右侧操作区 */
.right-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.action-items {
  display: flex;
  gap: 15px;
}

.v-link {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border-radius: 6px;
  color: var(--el-text-color-regular);
  transition: all 0.3s;
  cursor: pointer;
}

.v-link:hover {
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  cursor: pointer;
}

/* 通知徽标 */
.notification {
  position: relative;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--el-color-danger);
  color: white;
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 登录注册区域样式 */
.auth-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.register-btn {
  font-size: 14px;
}

.login-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 20px;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s;
}

/* 用户信息样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s;
}

.user-info:hover {
  background: var(--el-color-primary-light-9);
}

.avatar-wrapper {
  position: relative;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.3s;
}

.online-status {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--el-color-success);
  border: 2px solid white;
}

.user-details {
  display: flex;
  flex-direction: column;
  line-height: 1.2;
}

.username {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.user-role {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 下拉菜单样式优化 */
.user-dropdown-menu {
  min-width: 220px;
  padding: 0;
}

.dropdown-header {
  padding: 16px;
  background: var(--el-color-primary-light-9);
  border-radius: 4px 4px 0 0;
}

.user-info-brief {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.greeting {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.user-id {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
}

:deep(.el-dropdown-menu__item i) {
  margin-right: 0;
}

@media screen and (max-width: 768px) {
  .user-details {
    display: none;
  }

  .auth-section {
    gap: 4px;
  }

  .register-btn {
    display: none;
  }

  .login-btn {
    padding: 8px 16px;
  }
}
</style>
