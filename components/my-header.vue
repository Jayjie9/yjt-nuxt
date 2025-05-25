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
  SwitchButton
} from '@element-plus/icons-vue'
import { useUserStore } from '~/stores/user'


/** 用户状态管理 */
const userStore = useUserStore()
/** 用户是否已登录 */
const isLoggedIn = computed(() => userStore.LoggedIn)
/** 用户显示名称 */
const displayName = computed(() => userStore.getUserName)
/** 用户头像 */
const avatarUrl = computed(() => userStore.avatarUrl)

/**
 * 根据用户名生成头像背景色
 * @param name 用户名
 * @returns 渐变背景色CSS样式
 */
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

// 导航相关方法
function goHome() {
  navigateTo('/')
}

async function goToHelp() {
  navigateTo('/help')
}
async function goToLogin() {
  navigateTo('/login')
}

async function goToAnalysisIllness() {
  navigateTo('/disease')
}

/**
 * 处理用户下拉菜单命令
 * @param command 菜单命令
 */
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
}


const api = useApi()
const getAvatarUrl = async () => {
  // 如果没有 avatar ID，跳过
  if (!userStore.avatar) return
  const now = Date.now()
  const expire = parseInt(localStorage.getItem('avatar-expire') || '0', 10)
  const cachedUrl = localStorage.getItem('avatar-url')

  if (cachedUrl && now < expire) {
    userStore.setAvatarUrl(cachedUrl)
    return
  }

  // 否则发起请求更新签名 URL
  const { data: response } = await api.oss.renewUrl(userStore.avatar)

  const avatarUrl = response.data
  const expireTime = now + 55 * 60 * 1000 // 设置 55 分钟有效期（防止签名提前失效）

  userStore.setAvatarUrl(avatarUrl)
  localStorage.setItem('avatar-url', avatarUrl)
  localStorage.setItem('avatar-expire', expireTime.toString())

  console.log('avatarUrl:', avatarUrl)
}

onMounted(() => {
  userStore.restoreUserInfo()
  getAvatarUrl()
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
          <span>找医院</span>
        </div>
        <div class="nav-item v-link" @click="goToAnalysisIllness">
          <el-icon>
            <Location />
          </el-icon>
          <span>查病情</span>
        </div>
        <div class="nav-item v-link" @click="goToHelp">
          <el-icon>
            <QuestionFilled />
          </el-icon>
          <span>需帮助</span>
        </div>
      </div>

      <!-- 右侧用户菜单 -->
      <div class="right-wrapper">
        <div class="action-items">
          <div class="v-link notification">
            <el-icon>
              <Bell />
            </el-icon>
            <span>消息</span>
            <span class="badge">2</span>
          </div>
        </div>

        <!-- 登录/用户信息 -->
        <template v-if="!isLoggedIn">
          <div class="auth-section">
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
                <div v-if="avatarUrl" class="avatar"
                  :style="{ backgroundImage: `url(${avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }">
                </div>
                <div v-else class="avatar" :style="{ background: generateAvatarColor(displayName) }">
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

/* 响应式设计 */
@media screen and (max-width: 768px) {

  /* 用户信息区域 */
  .user-details {
    display: none;
  }

  .auth-section {
    gap: 4px;
  }

  .login-btn {
    padding: 8px 16px;
  }

  /* Logo区域 */
  .left-wrapper .text {
    display: none;
  }

  /* 导航菜单 */
  .nav-item span {
    display: none;
  }

  .nav-item {
    padding: 8px;
  }

  /* 操作按钮区域 */
  .action-items {
    display: none;
  }

  /* 整体布局调整 */
  .wrapper {
    gap: 20px;
    padding: 0 10px;
  }
}

/* 更小屏幕的额外调整 */
@media screen and (max-width: 480px) {
  .wrapper {
    gap: 10px;
  }

  .nav-wrapper {
    gap: 5px;
  }
}

.online-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
}
</style>
