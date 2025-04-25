<script setup lang="ts">
/**
 * @component MyHeader
 * @description 医捷通平台的全局头部导航组件，包含以下功能：
 * 1. 导航菜单：首页、病症分析、预约挂号、帮助中心
 * 2. 用户管理：登录、注册、个人中心
 * 3. 在线客服：可拖拽的实时聊天窗口
 * @author Your Name
 * @created 2024-01-20
 */

// 导入外部依赖
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

// 类型定义
/** 聊天消息类型定义 */
interface Message {
  /** 消息类型：系统消息、用户消息、客服消息 */
  type: 'system' | 'user' | 'service'
  /** 消息内容 */
  content: string
  /** 消息发送时间 */
  time: string
}

/** 位置坐标类型定义 */
interface Position {
  /** X轴坐标 */
  x: number
  /** Y轴坐标 */
  y: number
}

/** 拖拽偏移量类型定义 */
interface DragOffset {
  /** X轴偏移量 */
  x: number
  /** Y轴偏移量 */
  y: number
}

// 状态管理
/** 用户状态管理 */
const userStore = useUserStore()

// 聊天组件状态
/** 聊天窗口是否可见 */
const isVisible = ref<boolean>(false)
/** 聊天窗口是否最小化 */
const isMinimized = ref<boolean>(false)
/** 是否正在输入中 */
const isTyping = ref<boolean>(false)
/** 聊天窗口位置 */
const position = ref<Position>({
  x: typeof window !== 'undefined' ? window.innerWidth - 420 : 0,
  y: 100
})
/** 消息输入框内容 */
const messageText = ref<string>('')
/** 聊天消息列表 */
const messages = ref<Message[]>([
  {
    type: 'system',
    content: '欢迎使用在线医疗咨询服务',
    time: formatTime(new Date())
  },
  {
    type: 'service',
    content: '您好，我是您的医疗顾问小王，很高兴为您服务。请问有什么可以帮助您的吗？',
    time: formatTime(new Date())
  }
])

// 拖拽相关状态
/** 是否正在拖拽中 */
const isDragging = ref<boolean>(false)
/** 拖拽偏移量 */
const dragOffset = ref<DragOffset>({ x: 0, y: 0 })

// DOM引用
/** 聊天内容容器引用 */
const chatBody = ref<HTMLElement | null>(null)
/** 消息输入框引用 */
const messageInput = ref<HTMLTextAreaElement | null>(null)
// 计算属性
/** 用户是否已登录 */
const isLoggedIn = computed(() => userStore.LoggedIn)
/** 用户显示名称 */
const displayName = computed(() => userStore.getUserName)

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

/**
 * 导航到注册页面
 */
const goToRegister = () => {
  navigateTo('/register')
}

// 聊天窗口拖拽相关方法
/**
 * 开始拖拽聊天窗口
 * @param event 鼠标事件对象
 */
function startDrag(event: MouseEvent): void {
  isDragging.value = true
  dragOffset.value = {
    x: event.clientX - position.value.x,
    y: event.clientY - position.value.y
  }

  document.addEventListener('mousemove', onDrag)
  document.addEventListener('mouseup', stopDrag)
}

/**
 * 处理拖拽过程中的位置更新
 * @param event 鼠标事件对象
 */
function onDrag(event: MouseEvent): void {
  if (isDragging.value) {
    const chatWidth = 400
    const chatHeight = 550
    let newX = event.clientX - dragOffset.value.x
    let newY = event.clientY - dragOffset.value.y

    // 确保聊天窗口不会超出视窗边界
    newX = Math.max(0, Math.min(window.innerWidth - chatWidth, newX))
    newY = Math.max(0, Math.min(window.innerHeight - 100, newY))

    position.value = { x: newX, y: newY }
  }
}

/**
 * 结束拖拽操作
 */
function stopDrag(): void {
  isDragging.value = false
  document.removeEventListener('mousemove', onDrag)
  document.removeEventListener('mouseup', stopDrag)
}

// 聊天功能相关方法
/**
 * 发送聊天消息
 * 处理用户消息发送并模拟客服自动回复
 */
function sendMessage(): void {
  const content = messageText.value.trim()
  if (!content) return

  // 添加用户消息
  messages.value.push({
    type: 'user',
    content,
    time: formatTime(new Date())
  })

  // 清空输入框并滚动到底部
  messageText.value = ''
  scrollToBottom()
  isTyping.value = true

  // 模拟客服延迟回复
  setTimeout(() => {
    isTyping.value = false
    const reply = getReply(content)
    messages.value.push({
      type: 'service',
      content: reply,
      time: formatTime(new Date())
    })
    scrollToBottom()
  }, 1500)
}

/**
 * 根据用户消息获取自动回复内容
 * @param message 用户输入的消息
 * @returns 自动回复的内容
 */
function getReply(message: string): string {
  if (message.includes('预约')) return "您可以通过我院官网首页的预约系统进行预约..."
  if (message.includes('门诊')) return "我院门诊时间为周一至周五上午8:00-12:00，下午13:30-17:30..."
  if (message.includes('报告')) return "您可以在个人中心的'检查报告'栏目查看您的检查报告..."
  if (message.includes('医保')) return "我院支持医保报销，具体政策请咨询医保科..."
  return "感谢您的咨询，请问还有其他问题吗？"
}

/**
 * 选择快捷问题
 * @param question 预设的问题内容
 */
function selectQuickQuestion(question: string): void {
  messageText.value = question
  messageInput.value?.focus()
}

/**
 * 将聊天内容滚动到底部
 */
function scrollToBottom(): void {
  nextTick(() => {
    chatBody.value?.scrollTo({
      top: chatBody.value.scrollHeight,
      behavior: 'smooth'
    })
  })
}

/**
 * 打开客服聊天窗口
 */
function openServiceChat(): void {
  isVisible.value = true
  isMinimized.value = false
  nextTick(() => {
    messageInput.value?.focus()
    scrollToBottom()
  })
}

/**
 * 关闭客服聊天窗口
 */
function closeChat(): void {
  isVisible.value = false
  isMinimized.value = false
}

/**
 * 最小化聊天窗口
 */
function minimizeChat(): void {
  isMinimized.value = true
}

/**
 * 还原最小化的聊天窗口
 */
function restoreChat(): void {
  isMinimized.value = false
  scrollToBottom()
}

/**
 * 格式化时间
 * @param date 日期对象
 * @returns 格式化后的时间字符串 (HH:mm)
 */
function formatTime(date: Date): string {
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
}

/**
 * 处理窗口大小变化
 * 确保聊天窗口始终在可视区域内
 */
function handleResize(): void {
  if (typeof window === 'undefined') return
  position.value.x = Math.min(position.value.x, window.innerWidth - 400)
  position.value.y = Math.min(position.value.y, window.innerHeight - 100)
}

// 导航相关方法
/**
 * 导航到首页
 */
function goHome() {
  navigateTo('/')
}

/**
 * 导航到帮助中心页面
 */
async function goToHelp() {
  navigateTo('/help')
}

/**
 * 导航到登录页面
 */
async function goToLogin() {
  navigateTo('/login')
}

/**
 * 导航到病情分析页面
 */
async function goToAnalysisIllness() {
  navigateTo('/disease')
}

/**
 * 导航到预约挂号页面
 */
async function goToAppointment() {
  navigateTo('/')
}

/**
 * 处理用户下拉菜单命令
 * @param command 菜单命令
 */
const handleLoginCommand = (command: string | number | object) => {
  // 处理退出登录
  if (command === 'logout') {
    userStore.logout()
    ElMessage.info('已退出登录')
    // 强制刷新页面以确保状态更新
    if (import.meta.client) {
      window.location.href = '/'
    }
    return
  }

  // 处理各种导航选项
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

  // 其他选项的反馈
  if (import.meta.client) ElMessage(`点击了${command}选项`)
}

// 生命周期钩子
/**
 * 组件挂载时恢复用户状态
 */
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
          <div class="v-link service" @click="openServiceChat">
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
  <Transition name="fade">
    <div>
      <div v-if="isVisible && !isMinimized" class="service-chat-container"
        :style="{ top: position.y + 'px', left: position.x + 'px' }">
        <!-- 拖拽区域 -->
        <div class="service-chat-header" @mousedown="startDrag">
          <div class="service-chat-title">
            <div class="service-chat-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                <line x1="6" y1="1" x2="6" y2="4"></line>
                <line x1="10" y1="1" x2="10" y2="4"></line>
                <line x1="14" y1="1" x2="14" y2="4"></line>
              </svg>
            </div>
            <div class="title-text">
              <h3>医疗咨询服务</h3>
              <span class="online-status">
                <span class="status-dot"></span>
                在线咨询
              </span>
            </div>
          </div>
          <div class="service-chat-actions">
            <button class="minimize-btn" @click="minimizeChat" aria-label="最小化">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
            <button class="close-btn" @click="closeChat" aria-label="关闭">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        <!-- 聊天内容区域 -->
        <div class="service-chat-body" ref="chatBody">
          <div class="chat-welcome">
            <div class="doctor-avatar">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
                <circle cx="12" cy="7" r="3"></circle>
              </svg>
            </div>
            <div class="welcome-text">
              <h4>您好，我是专业医疗顾问</h4>
              <p>请告诉我您遇到的健康问题或疑问，我将尽快为您解答。</p>
              <div class="service-hours">服务时间: 08:00 - 22:00</div>
            </div>
          </div>

          <!-- 聊天消息 -->
          <div class="chat-messages">
            <template v-for="(message, index) in messages" :key="index">
              <!-- 系统消息 -->
              <div v-if="message.type === 'system'" class="system-message">
                <div class="message-time">{{ message.time }}</div>
                <div class="message-content">{{ message.content }}</div>
              </div>

              <!-- 用户消息 -->
              <div v-else-if="message.type === 'user'" class="message user-message">
                <div class="message-content">{{ message.content }}</div>
                <div class="message-time">{{ message.time }}</div>
              </div>

              <!-- 客服消息 -->
              <div v-else-if="message.type === 'service'" class="message service-message">
                <div class="service-avatar">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                    <polyline points="9 22 9 12 15 12 15 22"></polyline>
                  </svg>
                </div>
                <div class="message-bubble">
                  <div class="message-content">{{ message.content }}</div>
                  <div class="message-time">{{ message.time }}</div>
                </div>
              </div>
            </template>

            <!-- 加载中动画 -->
            <div v-if="isTyping" class="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>

        <!-- 快捷问题 -->
        <div class="quick-questions">
          <div class="quick-question-title">常见问题:</div>
          <div class="quick-question-buttons">
            <button @click="selectQuickQuestion('预约流程是怎样的？')">预约流程</button>
            <button @click="selectQuickQuestion('门诊时间是什么时候？')">门诊时间</button>
            <button @click="selectQuickQuestion('如何查看检查报告？')">查看报告</button>
            <button @click="selectQuickQuestion('医保报销政策有哪些？')">医保政策</button>
          </div>
        </div>

        <!-- 输入框区域 -->
        <div class="service-chat-footer">
          <div class="service-chat-tools">
            <button class="tool-btn" aria-label="表情">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                <line x1="9" y1="9" x2="9.01" y2="9"></line>
                <line x1="15" y1="9" x2="15.01" y2="9"></line>
              </svg>
            </button>
            <button class="tool-btn" aria-label="上传图片">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
              </svg>
            </button>
          </div>

          <div class="service-chat-input">
            <textarea ref="messageInput" v-model="messageText" placeholder="请输入您的问题..."
              @keydown.enter.prevent="sendMessage"></textarea>
            <button class="send-btn" @click="sendMessage" :disabled="!messageText.trim()">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
            </button>
          </div>
        </div>

      </div>

      <!-- 最小化状态 -->
      <div v-if="isVisible && isMinimized" class="minimized-indicator" @click="restoreChat">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>医疗咨询</span>
      </div>
    </div>


  </Transition>
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

/* 聊天窗口样式 */
.service-chat-container {
  position: fixed;
  width: 380px;
  height: 550px;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  background-color: var(--el-bg-color);
  box-shadow: 0 5px 30px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  transition: all 0.3s ease;
  z-index: 9999;
  border: 1px solid var(--el-border-color);
}

.service-chat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  color: white;
  cursor: move;
  user-select: none;
}

.service-chat-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.service-chat-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.title-text {
  display: flex;
  flex-direction: column;
}

.title-text h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
}

.online-status {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0.8;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-color-success);
}

.service-chat-actions {
  display: flex;
  gap: 8px;
}

.minimize-btn,
.close-btn {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.minimize-btn:hover,
.close-btn:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.service-chat-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.chat-welcome {
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
}

.doctor-avatar {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.welcome-text {
  flex: 1;
}

.welcome-text h4 {
  margin: 0 0 8px;
  font-size: 16px;
  color: var(--el-text-color-primary);
}

.welcome-text p {
  margin: 0 0 8px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.service-hours {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 8px;
  max-width: 80%;
}

.system-message {
  text-align: center;
  margin: 8px 0;
}

.message-time {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.user-message {
  margin-left: auto;
  flex-direction: row-reverse;
}

.service-message {
  margin-right: auto;
}

.service-avatar {
  width: 32px;
  height: 32px;
  border-radius: 16px;
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  display: flex;
  align-items: center;
  justify-content: center;
}

.message-bubble {
  background-color: var(--el-color-primary-light-9);
  padding: 8px 12px;
  border-radius: 12px;
  position: relative;
}

.user-message .message-content {
  background-color: var(--el-color-primary);
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
  background-color: var(--el-color-primary-light-9);
  border-radius: 12px;
  width: fit-content;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  animation: typing 1s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-4px);
  }
}

.quick-questions {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.quick-question-title {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 8px;
}

.quick-question-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.quick-question-buttons button {
  padding: 6px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 16px;
  background: none;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
}

.quick-question-buttons button:hover {
  background-color: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
}

.service-chat-footer {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.service-chat-tools {
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
}

.tool-btn {
  background: none;
  border: none;
  padding: 4px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  border-radius: 4px;
  transition: all 0.2s;
}

.tool-btn:hover {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.service-chat-input {
  display: flex;
  gap: 8px;
}

.service-chat-input textarea {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  resize: none;
  height: 36px;
  line-height: 20px;
  font-size: 14px;
  transition: all 0.2s;
}

.service-chat-input textarea:focus {
  outline: none;
  border-color: var(--el-color-primary);
}

.send-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 8px;
  background-color: var(--el-color-primary);
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.send-btn:disabled {
  background-color: var(--el-color-primary-light-5);
  cursor: not-allowed;
}

.send-btn:not(:disabled):hover {
  background-color: var(--el-color-primary-dark-2);
}

.minimized-indicator {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: var(--el-color-primary);
  color: white;
  border-radius: 24px;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s;
}

.minimized-indicator:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
