<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useApi } from "~/composables";
import { useUserStore } from "~/stores/user";
import CryptoJS from 'crypto-js'; // 需要安装: npm install crypto-js
import { useJWT } from '~/composables/useJWT';
import { User, Lock, Message, Key } from '@element-plus/icons-vue';

definePageMeta({
  layout: false
})

useHead({
  title: '登录 - 医捷通',
  meta: [
    { name: 'description', content: '医捷通在线医疗预约平台登录页面' }
  ]
})

// 获取API
const api = useApi();
const userStore = useUserStore()
const jwt = useJWT();

// 表单配置
const formConfig = reactive({
  maxlength: 11,
  placeholder: '请输入'
})

// 账号密码登录表单
const passwordForm = reactive({
  account: '',
  password: '',
})

// 手机验证码登录表单
const smsForm = reactive({
  phoneNumber: '',
  captcha: ''
})

// 表单验证规则
const passwordFormRules = {
  account: [
    { required: true, message: '请输入账号', trigger: 'blur' },
    { min: 3, max: 20, message: '长度在3到20个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少6个字符', trigger: 'blur' }
  ]
}

const smsFormRules = {
  phoneNumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3456789]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }
  ],
  captcha: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码长度为6位', trigger: 'blur' }
  ]
}

// API请求数据对象
const requestData = reactive({
  pwd: {
    phone: '',
    password: '',
    openid: ''
  },
  sms: {
    phone: '',
    code: '',
    openid: ''
  }
})

// 验证码计时器状态
const captchaTimer = reactive({
  buttonText: '获取验证码',
  counting: false,
  seconds: 0,
  interval: undefined as NodeJS.Timeout | undefined
})

// 密码强度检测
const passwordStrength = reactive({
  visible: false,
  score: 0,
  text: ''
})

// 登录状态数据
const loginState = reactive({
  error: '',
  attempts: 0,
  lastAttemptTime: 0,
  isLocked: false,
  lockDuration: 15 * 60 * 1000, // 15分钟
  maxAttempts: 5,
  loading: false
})

// 计算密码强度样式类
const passwordStrengthClass = computed(() => {
  if (passwordStrength.score < 2) return 'strength-weak';
  if (passwordStrength.score < 4) return 'strength-medium';
  return 'strength-strong';
});

// 评估密码强度
const evaluatePasswordStrength = (password: string) => {
  if (!password) {
    passwordStrength.visible = false;
    return;
  }

  passwordStrength.visible = true;
  let score = 0;

  // 长度检查
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // 复杂度检查
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  // 根据分数设置文本
  if (score <= 2) {
    passwordStrength.text = '弱';
  } else if (score <= 4) {
    passwordStrength.text = '中';
  } else {
    passwordStrength.text = '强';
  }

  passwordStrength.score = Math.min(score, 5);
};

// 监听密码变化
watch(() => passwordForm.password, (newValue) => {
  evaluatePasswordStrength(newValue);
});

// 密码加密函数 - 使用加盐哈希
const encryptPassword = (password: string): string => {
  // 固定盐值 - 实际应用中可以使用用户特定信息作为盐
  const salt = "MedicalAppSalt_2025";

  // 将密码和盐拼接后进行SHA-256哈希
  return CryptoJS.SHA256(password + salt).toString();
}

// 账号密码登录
const pwdLogin = async () => {
  if (!passwordForm.account || !passwordForm.password) {
    ElMessage.error('账号和密码不能为空');
    return;
  }

  // 检查登录尝试限制
  if (!checkLoginAttempts()) {
    return;
  }

  loginState.loading = true;

  // 准备请求数据
  requestData.pwd.phone = passwordForm.account;
  // 加密密码后发送
  requestData.pwd.password = encryptPassword(passwordForm.password);

  // 调用登录接口
  try {
    const { data } = await api.loginByPassword(requestData.pwd)
    if (data.value && data.value.code === 200) {
      ElMessage.success(data.value.message || "登录成功");
      const { name, accessToken, avatar } = data.value.data

      jwt.saveTokens(accessToken) // JWT 单独处理
      // 更清晰、更匹配 userAvatar 语义（avatar 是 ID，不是 URL）
      userStore.setUserInfo(name, accessToken, avatar)
      await navigateTo('/')
    } else {
      loginState.error = data.value?.message || '登录失败，请重试';
      loginState.attempts++;
      loginState.lastAttemptTime = Date.now();
      ElMessage.error(loginState.error);
    }
  } catch (error) {
    loginState.error = "登录失败，请重试";
    loginState.attempts++;
    loginState.lastAttemptTime = Date.now();
    ElMessage.error(loginState.error);
    console.error(error);
  } finally {
    loginState.loading = false;
  }
}

// 手机号登录
const captchaLogin = async () => {
  //  输入校验
  if (!smsForm.phoneNumber || !smsForm.captcha) {
    ElMessage.error('手机号和验证码不能为空');
    return;
  }

  // 检查登录尝试限制
  if (!checkLoginAttempts()) {
    return;
  }

  loginState.loading = true;

  requestData.sms.phone = smsForm.phoneNumber
  requestData.sms.code = smsForm.captcha

  // 调用登录接口
  try {
    const { data } = await api.loginBySms(requestData.sms)
    if (data.value && data.value.code === 200) {
      ElMessage.success(data.value.message || "登录成功");
      // 存储用户信息和accessToken到store
      jwt.saveTokens(data.value.data.accessToken)
      userStore.setUserInfo(data.value.data.name, data.value.data.accessToken, data.value.data.avatar)
      // 获取头像

      // 使用navigateTo进行路由跳转
      await navigateTo('/')
    } else {
      loginState.error = data.value?.message || "登录失败，请重试";
      loginState.attempts++;
      loginState.lastAttemptTime = Date.now();
      ElMessage.error(loginState.error);
    }
  } catch (error) {
    loginState.error = "登录失败，请重试";
    loginState.attempts++;
    loginState.lastAttemptTime = Date.now();
    ElMessage.error(loginState.error);
    console.error(error);
  } finally {
    loginState.loading = false;
  }
}

// 获取验证码
const getCaptcha = () => {
  if (captchaTimer.counting) return; // 防止重复点击

  if (!(/^1[3456789]\d{9}$/.test(smsForm.phoneNumber))) {
    ElMessage.error('手机号码不正确');
    return;
  }

  // 开始倒计时
  captchaTimer.counting = true;
  captchaTimer.seconds = 60;
  captchaTimer.buttonText = `${captchaTimer.seconds}`;
  startCountdown();

  // 调用接口
  api.sendCaptcha(smsForm.phoneNumber).then(({ data }) => {
    if (data.value && data.value.code === 200) {
      ElMessage.success(data.value.message || '验证码已发送');
      // 如果是开发环境，可以显示验证码方便测试
      if (data.value.data?.code && process.env.NODE_ENV === 'development') {
        smsForm.captcha = data.value.data.code;
        ElMessage.info(`开发环境验证码: ${data.value.data.code}`);
      }
    } else {
      ElMessage.error(data.value?.message || '发送失败，请重试');
      resetCaptchaTimer();
    }
  }).catch((error) => {
    ElMessage.error('发送失败，请重试');
    console.error(error);
    resetCaptchaTimer();
  })
}

// 倒计时
const startCountdown = () => {
  captchaTimer.interval = setInterval(() => {
    if (captchaTimer.seconds > 0) {
      captchaTimer.seconds--;
      captchaTimer.buttonText = `${captchaTimer.seconds}`;
    } else {
      resetCaptchaTimer();
    }
  }, 1000);
}

// 重置验证码计时器
const resetCaptchaTimer = () => {
  clearInterval(captchaTimer.interval);
  captchaTimer.counting = false;
  captchaTimer.buttonText = "重新发送";
}

// 第三方登录
const thirdPartyLogin = (type: string) => {
  window.location.href = 'http://localhost:8000/api/user/oauth/qq/login';
}

// 检查登录尝试次数是否超限
const checkLoginAttempts = (): boolean => {
  const now = Date.now();

  // 如果锁定时间已过，重置状态
  if (loginState.isLocked && (now - loginState.lastAttemptTime > loginState.lockDuration)) {
    loginState.isLocked = false;
    loginState.attempts = 0;
  }

  // 如果已锁定，禁止登录
  if (loginState.isLocked) {
    const remainingTime = Math.ceil((loginState.lockDuration - (now - loginState.lastAttemptTime)) / 60000);
    loginState.error = `登录尝试次数过多，请${remainingTime}分钟后再试`;
    ElMessage.error(loginState.error);
    return false;
  }

  // 检查是否超过最大尝试次数
  if (loginState.attempts >= loginState.maxAttempts) {
    loginState.isLocked = true;
    loginState.error = `登录尝试次数过多，请${Math.ceil(loginState.lockDuration / 60000)}分钟后再试`;
    ElMessage.error(loginState.error);
    return false;
  }

  return true;
};

// 导航到首页
const goToHome = () => {
  navigateTo('/');
}
// 忘记密码
const forgotPassword = () => {
  ElMessage.info('找回密码功能正在开发中');
}

// 动画相关
const activeTab = ref('password');

// 页面销毁时清除定时器
onUnmounted(() => {
  if (captchaTimer.interval) {
    clearInterval(captchaTimer.interval);
  }
})
</script>
<template>
  <div class="login-page">
    <!-- 头部导航 -->
    <header class="login-header">
      <div class="header-container">
        <div class="logo-container" @click="goToHome">
          <img src="~/assets/images/logo.png" alt="医捷通" class="logo-image">
          <span class="logo-text">医捷通</span>
        </div>
        <nav class="nav-links">
          <a href="/" class="nav-link">挂号服务</a>
          <a href="/disease" class="nav-link">疾病百科</a>
          <a href="/help" class="nav-link">关于我们</a>
        </nav>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="login-main">
      <div class="login-container">
        <div class="login-content">
          <!-- 左侧图片区域 -->
          <div class="login-banner">
            <div class="banner-content">
              <h2 class="banner-title">欢迎使用医捷通</h2>
              <p class="banner-subtitle">便捷挂号，智慧就医，为您的健康保驾护航</p>
              <div class="banner-features">
                <div class="feature-item">
                  <el-icon><i class="el-icon-check-circle"></i></el-icon>
                  <span>全国知名医院在线预约</span>
                </div>
                <div class="feature-item">
                  <el-icon><i class="el-icon-check-circle"></i></el-icon>
                  <span>专业医生一对一问诊</span>
                </div>
                <div class="feature-item">
                  <el-icon><i class="el-icon-check-circle"></i></el-icon>
                  <span>智能导诊精准匹配科室</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧登录表单区域 -->
          <div class="login-form-container">
            <h2 class="form-title">账号登录</h2>

            <!-- 登录方式切换 -->
            <div class="login-tabs">
              <div class="tab-item" :class="{ 'active': activeTab === 'password' }" @click="activeTab = 'password'">
                密码登录
              </div>
              <div class="tab-item" :class="{ 'active': activeTab === 'sms' }" @click="activeTab = 'sms'">
                验证码登录
              </div>
            </div>

            <!-- 密码登录表单 -->
            <transition name="fade-transform" mode="out-in">
              <div v-if="activeTab === 'password'" class="login-form">
                <el-form :model="passwordForm" :rules="passwordFormRules" label-position="top">
                  <el-form-item prop="account">
                    <el-input v-model="passwordForm.account" :prefix-icon="User" placeholder="请输入账号/手机号" clearable />
                  </el-form-item>

                  <el-form-item prop="password">
                    <el-input v-model="passwordForm.password" :prefix-icon="Lock" type="password" placeholder="请输入密码"
                      show-password clearable />
                  </el-form-item>

                  <!-- 密码强度指示器 -->
                  <div v-if="passwordStrength.visible" class="password-strength">
                    <div class="strength-meter">
                      <div class="strength-value" :class="passwordStrengthClass"
                        :style="{ width: `${passwordStrength.score * 20}%` }"></div>
                    </div>
                    <div class="strength-label" :class="passwordStrengthClass">
                      密码强度: {{ passwordStrength.text }}
                    </div>
                  </div>

                  <div class="form-actions">
                    <a class="forgot-password" @click="forgotPassword">忘记密码?</a>
                  </div>

                  <el-button type="primary" class="submit-button" @click="pwdLogin" :loading="loginState.loading">
                    登录
                  </el-button>
                </el-form>
              </div>

              <!-- 验证码登录表单 -->
              <div v-else-if="activeTab === 'sms'" class="login-form">
                <el-form :model="smsForm" :rules="smsFormRules" label-position="top">
                  <el-form-item prop="phoneNumber">
                    <el-input v-model="smsForm.phoneNumber" :prefix-icon="Message" placeholder="请输入手机号" clearable>
                      <template #prepend>
                        <span class="country-code">+86</span>
                      </template>
                    </el-input>
                  </el-form-item>

                  <el-form-item prop="captcha">
                    <el-input v-model="smsForm.captcha" :prefix-icon="Key" placeholder="请输入验证码" clearable>
                      <template #append>
                        <el-button class="captcha-button" :disabled="captchaTimer.counting" @click="getCaptcha">
                          {{ captchaTimer.buttonText }}
                        </el-button>
                      </template>
                    </el-input>
                  </el-form-item>

                  <!-- 添加一个空的占位div，保持与密码登录表单高度一致 -->
                  <div class="form-actions-placeholder"></div>

                  <el-button type="primary" class="submit-button" @click="captchaLogin" :loading="loginState.loading">
                    登录
                  </el-button>
                </el-form>
              </div>
            </transition>

            <!-- 其他登录方式 - 只保留QQ登录 -->
            <div class="other-login-methods">
              <div class="divider">
                <span>其他登录方式</span>
              </div>

              <div class="social-login">
                <el-tooltip content="QQ登录" placement="top">
                  <div class="social-icon qq" @click="thirdPartyLogin('QQ')">
                    <svg viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" width="28"
                      height="28">
                      <path
                        d="M511.09761 957.257c-80.159 0-153.737-25.019-201.11-62.386-24.057 6.702-54.831 17.489-74.252 30.864-16.617 11.439-14.546 23.106-11.55 27.816 13.15 20.689 225.583 13.211 286.912 6.767v-3.061z"
                        fill="#1296db"></path>
                      <path
                        d="M496.65061 957.257c80.157 0 153.737-25.019 201.11-62.386 24.057 6.702 54.83 17.489 74.253 30.864 16.616 11.439 14.543 23.106 11.55 27.816-13.15 20.689-225.584 13.211-286.914 6.767v-3.061z"
                        fill="#1296db"></path>
                      <path
                        d="M497.12861 474.524c131.934-0.876 237.669-25.783 273.497-35.34 8.541-2.28 13.11-6.364 13.11-6.364 0.03-1.172 0.542-20.952 0.542-31.155C784.27761 229.833 701.12561 57.173 496.64061 57.162 292.15661 57.173 209.00061 229.832 209.00061 401.665c0 10.203 0.516 29.983 0.547 31.155 0 0 3.717 3.821 10.529 5.67 33.078 8.98 140.803 35.139 276.08 36.034h0.972z"
                        fill="#1296db"></path>
                      <path
                        d="M860.28261 619.782c-8.12-26.086-19.204-56.506-30.427-85.72 0 0-6.456-0.795-9.718 0.148-100.71 29.205-222.773 47.818-315.792 46.695h-0.962C410.88561 582.017 289.65061 563.617 189.27961 534.698 185.44461 533.595 177.87261 534.063 177.87261 534.063 166.64961 563.276 155.56661 593.696 147.44761 619.782 108.72961 744.168 121.27261 795.644 130.82461 796.798c20.496 2.474 79.78-93.637 79.78-93.637 0 97.66 88.324 247.617 290.576 248.996a718.01 718.01 0 0 1 5.367 0C708.80161 950.778 797.12261 800.822 797.12261 703.162c0 0 59.284 96.111 79.783 93.637 9.55-1.154 22.093-52.63-16.623-177.017"
                        fill="#1296db"></path>
                    </svg>
                  </div>
                </el-tooltip>
              </div>
            </div>

            <!-- 注册提示 -->
            <div class="register-hint">
              登录成功，自动注册！
            </div>

            <!-- 错误信息提示 -->
            <el-alert v-if="loginState.error" :title="loginState.error" type="error" show-icon :closable="true"
              style="margin-top: 20px;" />
          </div>
        </div>
      </div>
    </main>

    <!-- 页脚 -->
    <footer class="login-footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="#" class="footer-link">关于我们</a>
          <a href="#" class="footer-link">服务条款</a>
          <a href="#" class="footer-link">隐私政策</a>
          <a href="#" class="footer-link">帮助中心</a>
          <a href="#" class="footer-link">联系我们</a>
        </div>
        <div class="copyright">
          © 2023 医捷通 All Rights Reserved 京ICP备12345678号-1
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* 全局样式 */
.login-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
}

/* 头部导航样式 */
.login-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 0 20px;
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
}

.logo-container {
  display: flex;
  align-items: center;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.logo-container:hover {
  transform: scale(1.05);
}

.logo-image {
  width: 40px;
  height: 40px;
}

.logo-text {
  font-size: 22px;
  font-weight: bold;
  margin-left: 10px;
  color: #409EFF;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #606266;
  text-decoration: none;
  font-size: 16px;
  transition: color 0.3s;
  padding: 5px 0;
  position: relative;
}

.nav-link:hover {
  color: #409EFF;
}

.nav-link:hover::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 2px;
}

/* 主要内容区样式 */
.login-main {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background-image: linear-gradient(135deg, #f5f7fa 0%, #e4f1fe 100%);
}

.login-container {
  width: 100%;
  max-width: 1000px;
}

.login-content {
  display: flex;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeIn 0.5s ease-out;
}

.login-content:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
}

/* 左侧图片区域样式 */
.login-banner {
  flex: 1;
  background: linear-gradient(135deg, #409EFF 0%, #67C23A 100%);
  color: white;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.banner-content {
  max-width: 400px;
}

.banner-title {
  font-size: 28px;
  font-weight: 600;
  margin-bottom: 15px;
}

.banner-subtitle {
  font-size: 16px;
  margin-bottom: 30px;
  opacity: 0.9;
}

.banner-features {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feature-item i {
  font-size: 20px;
}

/* 右侧表单区域样式 */
.login-form-container {
  width: 400px;
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.form-title {
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 20px;
  color: #303133;
  position: relative;
}

.form-title::after {
  content: '';
  position: absolute;
  bottom: -8px;
  left: 0;
  width: 40px;
  height: 3px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 2px;
}

/* 登录方式切换样式 */
.login-tabs {
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #EBEEF5;
}

.tab-item {
  padding: 10px 0;
  margin-right: 20px;
  cursor: pointer;
  color: #909399;
  position: relative;
  transition: all 0.3s;
}

.tab-item.active {
  color: #409EFF;
  font-weight: 500;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border-radius: 2px 2px 0 0;
}

/* 表单样式 */
.login-form {
  margin-bottom: 20px;
  min-height: 240px;
}

.login-form :deep(.el-input__inner) {
  height: 42px;
  border-radius: 4px;
}

.login-form :deep(.el-input-group__prepend) {
  padding: 0 10px;
}

.captcha-button {
  width: 100px;
  padding: 0;
  height: 100%;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 15px;
  height: 20px;
}

.form-actions-placeholder {
  height: 20px;
  margin-bottom: 15px;
}


.forgot-password {
  color: #409EFF;
  font-size: 14px;
  cursor: pointer;
  transition: color 0.3s;
}

.forgot-password:hover {
  color: #66b1ff;
  text-decoration: underline;
}

.submit-button {
  width: 100%;
  height: 42px;
  font-size: 16px;
  background: linear-gradient(90deg, #409EFF, #67C23A);
  border: none;
  transition: all 0.3s;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
}

/* 密码强度指示器样式 */
.password-strength {
  margin: 5px 0 15px;
}

.strength-meter {
  height: 4px;
  background-color: #eee;
  border-radius: 2px;
  overflow: hidden;
}

.strength-value {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.strength-weak {
  background-color: #F56C6C;
}

.strength-medium {
  background-color: #E6A23C;
}

.strength-strong {
  background-color: #67C23A;
}

.strength-label {
  font-size: 12px;
  margin-top: 5px;
  text-align: right;
}

/* 其他登录方式样式 */
.other-login-methods {
  margin: 20px 0;
}

.divider {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background-color: #EBEEF5;
}

.divider span {
  padding: 0 15px;
}

.social-login {
  display: flex;
  justify-content: center;
  margin-top: 15px;
}

.social-icon {
  cursor: pointer;
  transition: all 0.3s;
  padding: 10px;
  border-radius: 50%;
  background-color: #f5f7fa;
  display: flex;
  align-items: center;
  justify-content: center;
}

.social-icon:hover {
  transform: scale(1.1);
  background-color: #e4f1fe;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 注册提示样式 */
.register-hint {
  text-align: center;
  margin-top: 20px;
  font-size: 14px;
  color: #606266;
}

/* 页脚样式 */
.login-footer {
  background-color: #fff;
  padding: 20px 0;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
  padding: 0 20px;
}

.footer-links {
  margin-bottom: 10px;
}

.footer-link {
  color: #606266;
  margin: 0 10px;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
}

.footer-link:hover {
  color: #409EFF;
}

.copyright {
  color: #909399;
  font-size: 12px;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 过渡动画 */
.fade-transform-enter-active,
.fade-transform-leave-active {
  transition: all 0.3s;
}

.fade-transform-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.fade-transform-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}

/* 响应式设计 */
@media (max-width: 992px) {
  .login-content {
    flex-direction: column;
  }

  .login-banner {
    padding: 30px;
  }

  .login-form-container {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .login-main {
    padding: 20px 10px;
  }

  .header-container {
    height: 60px;
  }

  .logo-text {
    font-size: 18px;
  }

  .nav-links {
    gap: 10px;
  }

  .nav-link {
    font-size: 14px;
  }

  .login-banner {
    padding: 20px;
  }

  .banner-title {
    font-size: 22px;
  }

  .banner-subtitle {
    font-size: 14px;
  }

  .login-form-container {
    padding: 20px;
  }

  .form-title {
    font-size: 20px;
  }
}
</style>