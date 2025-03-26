<script setup lang="ts">
import { ElMessage } from "element-plus";
import { useApi } from "~/composables";
import { useUserStore } from "~/stores/user";
import CryptoJS from 'crypto-js'; // 需要安装: npm install crypto-js
import { useJWT } from '~/composables/useJWT';
import { User, Lock } from '@element-plus/icons-vue';

definePageMeta({
  layout: false
})

useHead({
  title: '登录',
  meta: [
    { name: 'description', content: '登录页面' }
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
  // isLoading: false,
  // rememberMe: false
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
  maxAttempts: 5
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

  // 准备请求数据
  requestData.pwd.phone = passwordForm.account;
  // 加密密码后发送
  requestData.pwd.password = encryptPassword(passwordForm.password);

  // 调用登录接口
  try {
    const { data } = await api.loginByPassword(requestData.pwd)
    if (data.value && data.value.code === 200) {
      ElMessage.success(data.value.message || "登录成功");
      // 存储用户信息和accessToken到store
      jwt.saveTokens(data.value.data.accessToken)
      userStore.setUserInfo(data.value.data.name, data.value.data.accessToken)

      // 使用navigateTo进行路由跳转
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

  requestData.sms.phone = smsForm.phoneNumber
  requestData.sms.code = smsForm.captcha

  // 调用登录接口
  try {
    const { data } = await api.loginBySms(requestData.sms)
    if (data.value && data.value.code === 200) {
      ElMessage.success(data.value.message || "登录成功");
      // 存储用户信息和accessToken到store
      jwt.saveTokens(data.value.data.accessToken)
      userStore.setUserInfo(data.value.data.name, data.value.data.accessToken)

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
  ElMessage.info(`${type}登录功能正在开发中`);
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

// 从localStorage恢复记住的账号
// onMounted(() => {
//   if (import.meta.client) {
//     const rememberedAccount = localStorage.getItem('remembered-account');
//     if (rememberedAccount) {
//       jwtForm.account = rememberedAccount;
//       jwtForm.rememberMe = true;
//     }
//   }
// });

// 页面销毁时清除定时器
onUnmounted(() => {
  if (captchaTimer.interval) {
    clearInterval(captchaTimer.interval);
  }
})
</script>

<template>
  <div class="login-bg">
    <!--头部 #start-->
    <div class="login-header">
      <!-- logo -->
      <div class="header-container">
        <div class="left-wrapper v-link selected">
          <img style="width: 50px; height: 50px" src="~assets/images/logo.png" alt="logo">
          <span class="text">医捷通</span>
        </div>
        <div class="right-wrapper">
          <el-menu mode="horizontal" class="nav-menu">
            <el-menu-item index="1">首页</el-menu-item>
            <el-menu-item index="2">医疗服务</el-menu-item>
            <el-menu-item index="3">健康资讯</el-menu-item>
            <el-menu-item index="4">关于我们</el-menu-item>
          </el-menu>
        </div>
      </div>
    </div>
    <!--头部 #end-->

    <!-- 登录 组件-->
    <div class="login-wrapper">
      <div class="login-content">
        <div class="core-wrapper">
          <!-- 第三方登录 -->
          <div class="qr-method">
            <div class="saoma-qr">
              <div class="qrlogin-title">登录</div>
              <div class="methods-text">
                <div>微信扫码登录</div>
              </div>

              <div class="qrcode-wrap">
                <div class="qrcode-wrapper-qq">
                  <img src="//img.114yygh.com/static/web/code_login_wechat.png" class="qq-qrcode" alt="微信二维码">
                </div>
              </div>

              <div class="other-methods">
                <div class="third-party-login-text">其他方式登录</div>
                <div class="third-parties">
                  <div class="third-party-icons">
                    <el-tooltip content="微信登录" placement="top">
                      <i class="el-icon-wechat third-party-icon" @click="thirdPartyLogin('微信')">
                        <svg t="1688888888888" class="icon" viewBox="0 0 1024 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" p-id="1234" width="32" height="32">
                          <path
                            d="M692.2 352.6c11.3 0 22.4 0.8 33.5 2.1-30.2-140.8-180.6-245.4-352.2-245.4-191.6 0-348.8 130.8-348.8 297.5 0 96.1 52.4 175 139.9 236.2l-35 105.4 122.3-61.2c43.8 8.7 78.8 17.8 122.7 17.8 11 0 21.9-0.5 32.7-1.4-6.8-23.4-10.8-48-10.8-73.4 0-152.9 131.3-277.7 296-277.7zM498.6 247.9c26.4 0 43.8 17.4 43.8 43.9s-17.4 44-43.8 44c-26.4 0-52.8-17.4-52.8-44 0-26.5 26.4-43.9 52.8-43.9zM266 335.8c-26.4 0-53.1-17.4-53.1-44 0-26.5 26.7-43.9 53.1-43.9 26.4 0 43.8 17.4 43.8 43.9 0 26.6-17.4 44-43.8 44z"
                            fill="#00C800" p-id="1235"></path>
                          <path
                            d="M1010.4 620.7c0-139.3-139.3-252.9-296-252.9-165.8 0-296.4 113.5-296.4 252.9 0 139.6 130.6 252.9 296.4 252.9 34.6 0 69.6-8.7 104.3-17.5l95.5 52.5-26.2-87.3c70.1-52.6 122.5-122.5 122.5-200.7z m-392.4-43.9c-17.4 0-34.9-17.4-34.9-35 0-17.4 17.5-35 34.9-35 26.4 0 43.8 17.6 43.8 35 0 17.6-17.4 35-43.8 35z m191.2 0c-17.3 0-34.6-17.4-34.6-35 0-17.4 17.3-35 34.6-35 26.2 0 43.9 17.6 43.9 35 0 17.6-17.7 35-43.9 35z"
                            fill="#00C800" p-id="1236"></path>
                        </svg>
                      </i>
                    </el-tooltip>
                    <el-tooltip content="QQ登录" placement="top">
                      <i class="el-icon-qq third-party-icon" @click="thirdPartyLogin('QQ')">
                        <svg t="1688888888889" class="icon" viewBox="0 0 1024 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" p-id="2345" width="32" height="32">
                          <path
                            d="M511.09761 957.257c-80.159 0-153.737-25.019-201.11-62.386-24.057 6.702-54.831 17.489-74.252 30.864-16.617 11.439-14.546 23.106-11.55 27.816 13.15 20.689 225.583 13.211 286.912 6.767v-3.061z"
                            fill="#1296db" p-id="2346"></path>
                          <path
                            d="M496.65061 957.257c80.157 0 153.737-25.019 201.11-62.386 24.057 6.702 54.83 17.489 74.253 30.864 16.616 11.439 14.543 23.106 11.55 27.816-13.15 20.689-225.584 13.211-286.914 6.767v-3.061z"
                            fill="#1296db" p-id="2347"></path>
                          <path
                            d="M497.12861 474.524c131.934-0.876 237.669-25.783 273.497-35.34 8.541-2.28 13.11-6.364 13.11-6.364 0.03-1.172 0.542-20.952 0.542-31.155C784.27761 229.833 701.12561 57.173 496.64061 57.162 292.15661 57.173 209.00061 229.832 209.00061 401.665c0 10.203 0.516 29.983 0.547 31.155 0 0 3.717 3.821 10.529 5.67 33.078 8.98 140.803 35.139 276.08 36.034h0.972z"
                            fill="#1296db" p-id="2348"></path>
                          <path
                            d="M860.28261 619.782c-8.12-26.086-19.204-56.506-30.427-85.72 0 0-6.456-0.795-9.718 0.148-100.71 29.205-222.773 47.818-315.792 46.695h-0.962C410.88561 582.017 289.65061 563.617 189.27961 534.698 185.44461 533.595 177.87261 534.063 177.87261 534.063 166.64961 563.276 155.56661 593.696 147.44761 619.782 108.72961 744.168 121.27261 795.644 130.82461 796.798c20.496 2.474 79.78-93.637 79.78-93.637 0 97.66 88.324 247.617 290.576 248.996a718.01 718.01 0 0 1 5.367 0C708.80161 950.778 797.12261 800.822 797.12261 703.162c0 0 59.284 96.111 79.783 93.637 9.55-1.154 22.093-52.63-16.623-177.017"
                            fill="#1296db" p-id="2349"></path>
                        </svg>
                      </i>
                    </el-tooltip>
                    <el-tooltip content="支付宝登录" placement="top">
                      <i class="el-icon-alipay third-party-icon" @click="thirdPartyLogin('支付宝')">
                        <svg t="1688888888890" class="icon" viewBox="0 0 1024 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" p-id="3456" width="32" height="32">
                          <path
                            d="M230.4 576.512v-21.504h142.336c5.12 40.96 17.408 81.92 35.84 117.76-53.248 30.72-99.328 51.2-164.864 71.68 0 0-71.68 35.84-35.84 81.92s129.024 10.24 194.56-25.6c35.84-20.48 76.8-51.2 112.64-81.92 40.96 40.96 92.16 76.8 148.48 102.4 158.72 76.8 184.32-40.96 119.808-92.16-71.68-56.32-158.72-81.92-225.28-89.088-25.6-28.672-46.08-66.56-61.44-107.52H752.64v-56.32H476.16v-61.44h276.48v-30.72H476.16v-88.064h-107.52v88.064H102.4v30.72h266.24v61.44H153.6v56.32l76.8-5.12z m286.72 107.52c61.44 12.288 122.88 43.008 163.84 76.8-40.96 35.84-81.92 61.44-117.76 71.68-51.2 12.288-92.16 10.24-107.52 0 0 0-20.48-10.24 0-20.48 15.36-15.36 35.84-20.48 35.84-20.48 28.672-15.36 56.32-30.72 79.872-51.2 15.36-15.36 33.792-35.84 45.728-56.32z"
                            fill="#1677FF" p-id="3457"></path>
                        </svg>
                      </i>
                    </el-tooltip>
                    <el-tooltip content="新浪微博登录" placement="top">
                      <i class="el-icon-weibo third-party-icon" @click="thirdPartyLogin('微博')">
                        <svg t="1688888888891" class="icon" viewBox="0 0 1024 1024" version="1.1"
                          xmlns="http://www.w3.org/2000/svg" p-id="4567" width="32" height="32">
                          <path
                            d="M851.4 590.193c-22.196-66.233-90.385-90.422-105.912-91.863-15.523-1.442-29.593-9.94-19.295-27.505 10.302-17.566 29.304-68.684-7.248-104.681-36.564-36.14-116.512-22.462-173.094 0.866-56.434 23.327-53.39 7.055-51.65-8.925 1.89-16.848 32.355-111.02-60.791-122.395C311.395 220.86 154.85 370.754 99.572 457.15 16 587.607 29.208 675.873 29.208 675.873h0.58c10.009 121.819 190.787 218.869 412.328 218.869 190.5 0 350.961-71.853 398.402-169.478 0 0 0.143-0.433 0.575-1.156 4.938-10.506 8.71-21.168 11.035-32.254 6.668-26.205 11.755-64.215-0.728-101.66z m-436.7 251.27c-157.71 0-285.674-84.095-285.674-187.768 0-103.671 127.82-187.76 285.674-187.76 157.705 0 285.673 84.089 285.673 187.76 0 103.815-127.968 187.768-285.673 187.768z"
                            fill="#E71F19" p-id="4568"></path>
                          <path
                            d="M803.096 425.327c2.896 1.298 5.945 1.869 8.994 1.869 8.993 0 17.7-5.328 21.323-14.112 5.95-13.964 8.993-28.793 8.993-44.205 0-62.488-51.208-113.321-114.181-113.321-15.379 0-30.32 3.022-44.396 8.926-11.755 4.896-17.263 18.432-12.335 30.24 4.933 11.662 18.572 17.134 30.465 12.238 8.419-3.46 17.268-5.33 26.41-5.33 37.431 0 67.752 30.241 67.752 67.247 0 9.068-1.735 17.857-5.369 26.202a22.832 22.832 0 0 0 12.335 30.236l0.01 0.01z"
                            fill="#F5AA15" p-id="4569"></path>
                          <path
                            d="M726.922 114.157c-25.969 0-51.65 3.744-76.315 10.942-18.423 5.472-28.868 24.622-23.5 42.91 5.655 18.287 24.752 28.718 43.46 23.217 17.985-5.47 36.564-8.346 56.355-8.346 103.98 0 186.053 82.497 186.053 184.51 0 18.863-3.171 37.06-9.253 54.772-5.655 18.287 4.933 37.588 23.356 43.34a35.64 35.64 0 0 0 10.368 1.442c14.62 0 28.236-8.346 34.458-21.98 9.108-26.48 14.041-54.056 14.041-83.465 0.29-138.87-111.539-247.342-259.023-247.342z"
                            fill="#F5AA15" p-id="4570"></path>
                          <path
                            d="M388.294 534.47c-84.151 0-152.34 59.178-152.34 132.334 0 73.141 68.189 132.328 152.34 132.328 84.148 0 152.337-59.182 152.337-132.328 0-73.15-68.19-132.334-152.337-132.334zM338.53 752.763c-29.454 0-53.39-23.755-53.39-52.987 0-29.228 23.941-52.989 53.39-52.989 29.453 0 53.39 23.76 53.39 52.989 0 29.227-23.937 52.987-53.39 52.987z m99.82-95.465c-6.382 11.086-19.296 15.696-28.726 10.219-9.43-5.323-11.75-18.717-5.37-29.803 6.386-11.09 19.297-15.7 28.725-10.224 9.43 5.472 11.755 18.866 5.37 29.808z"
                            fill="#040000" p-id="4571"></path>
                        </svg>
                      </i>
                    </el-tooltip>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 分割线 -->
          <el-divider direction="vertical" style="height: 100%" />

          <!-- 账密/验证码/JWT登录 #start -->
          <div class="operate-view">
            <div class="wrapper" style="width: 100%">
              <el-tabs class="wrapper-tabs">
                <el-tab-pane label="账密登录">
                  <div class="login-form">
                    <el-form :model="passwordForm" :rules="passwordFormRules">
                      <el-form-item label="账号" prop="account">
                        <el-input v-model="passwordForm.account" :maxlength="formConfig.maxlength"
                          :placeholder="formConfig.placeholder"></el-input>
                      </el-form-item>
                      <el-form-item label="密码" prop="password">
                        <el-input v-model="passwordForm.password" :maxlength="formConfig.maxlength"
                          :placeholder="formConfig.placeholder" type="password" show-password></el-input>
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

                      <!-- <div class="form-options">
                        <el-checkbox v-model="jwtForm.rememberMe">记住我</el-checkbox>
                        <a href="#" class="forgot-password">忘记密码？</a>
                      </div> -->

                      <el-form-item>
                        <div class="forgot-password">忘记密码？</div>
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" class="login-button" @click="pwdLogin">立即登录</el-button>
                      </el-form-item>
                      <el-form-item>
                        <div class="register-link">还没有账号？<span class="register-text">立即注册</span></div>
                      </el-form-item>
                    </el-form>

                    <!-- 错误信息提示 -->
                    <el-alert v-if="loginState.error" :title="loginState.error" type="error" show-icon :closable="true"
                      style="margin-top: 20px;" />
                  </div>
                </el-tab-pane>

                <el-tab-pane label="手机号登录">
                  <div class="login-form">
                    <el-form :model="smsForm" :rules="smsFormRules">
                      <el-form-item label="手机号" prop="phoneNumber">
                        <el-input v-model="smsForm.phoneNumber" :placeholder="formConfig.placeholder"
                          :maxlength="formConfig.maxlength">
                          <template #prepend>
                            <span>+86</span>
                          </template>
                        </el-input>
                      </el-form-item>
                      <el-form-item label="验证码" prop="captcha">
                        <el-input v-model="smsForm.captcha" :placeholder="formConfig.placeholder"
                          :maxlength="formConfig.maxlength">
                          <template #append>
                            <el-button :disabled="captchaTimer.counting" @click="getCaptcha">
                              {{ captchaTimer.buttonText }}
                            </el-button>
                          </template>
                        </el-input>
                      </el-form-item>
                      <el-form-item>
                        <el-button type="primary" class="login-button" @click="captchaLogin">立即登录</el-button>
                      </el-form-item>
                      <el-form-item>
                        <div class="register-link">还没有账号？<span class="register-text">立即注册</span></div>
                      </el-form-item>
                    </el-form>

                    <!-- 错误信息提示 -->
                    <el-alert v-if="loginState.error" :title="loginState.error" type="error" show-icon :closable="true"
                      style="margin-top: 20px;" />
                  </div>
                </el-tab-pane>
              </el-tabs>
            </div>
          </div>
          <!-- 登录 #end -->

        </div>
      </div>
    </div>

    <div class="login-footer">
      <div class="footer-container">
        <div class="footer-links">
          <a href="#" class="footer-link">关于我们</a>
          <a href="#" class="footer-link">服务条款</a>
          <a href="#" class="footer-link">隐私政策</a>
          <a href="#" class="footer-link">帮助中心</a>
          <a href="#" class="footer-link">联系我们</a>
        </div>
        <div class="footer-copyright">
          © 2023 医捷通 All Rights Reserved 京ICP备12345678号-1
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-bg {
  flex: 1 1 0%;
  display: flex;
  flex-direction: column;
  background-size: cover;
  background-attachment: fixed;
  padding-bottom: 64px;
  min-height: 100vh;
  background-color: #f5f7fa;
}

.login-header {
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 0 20px;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 80px;
}

.left-wrapper {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.left-wrapper .text {
  font-size: 24px;
  font-weight: bold;
  margin-left: 10px;
  color: #409EFF;
}

.right-wrapper {
  display: flex;
  align-items: center;
}

.nav-menu {
  border-bottom: none;
}

.login-wrapper {
  display: flex;
  flex: 1 1 0;
}

.login-content {
  display: flex;
  flex-direction: row;
  -webkit-box-pack: center;
  justify-content: center;
  box-sizing: border-box;
  width: 800px;
  margin: 50px auto 0;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.core-wrapper {
  margin: 40px;
  display: flex;
  width: 100%;
}

.qr-method {
  padding: 0 20px;
  position: relative;
  width: 200px;
  z-index: 5;
}

.saoma-qr {
  text-align: left;
  position: relative;
}

.qrlogin-title {
  font-weight: 600;
  font-size: 28px;
  line-height: 44px;
  color: #181818;
  margin-bottom: 20px;
}

.methods-text {
  font-size: 14px;
  line-height: 20px;
  margin-top: 20px;
  color: #717171;
}

.qrcode-wrap {
  margin-top: 20px;
  text-align: center;
}

.qrcode-wrapper-qq {
  position: relative;
  overflow: hidden;
  width: 160px;
  height: 160px;
  border: 1px solid #eee;
  padding: 5px;
  margin: 0 auto;
}

.qq-qrcode {
  width: 100%;
  height: 100%;
}

.third-party-login-text {
  margin-top: 30px;
  font-size: 14px;
  color: #999999;
  line-height: 20px;
  text-align: center;
}

.third-parties {
  margin-top: 15px;
}

.third-party-icons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
}

.third-party-icon {
  cursor: pointer;
  transition: all 0.3s;
}

.third-party-icon:hover {
  transform: scale(1.1);
}

.operate-view {
  flex: 1;
  padding: 0 20px;
}

.wrapper {
  width: 100%;
  padding: 20px;
}

.wrapper-tabs {
  width: 100%;
}

.login-form {
  padding: 10px 20px;
  width: 100%;
}

.forgot-password {
  text-align: right;
  color: #409EFF;
  font-size: 14px;
  cursor: pointer;
}

.login-button {
  width: 100%;
  height: 40px;
  font-size: 16px;
}

.register-link {
  text-align: center;
  font-size: 14px;
  color: #666;
}

.register-text {
  color: #409EFF;
  cursor: pointer;
}

.login-footer {
  background-color: #fff;
  padding: 20px 0;
  margin-top: auto;
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-links {
  margin-bottom: 10px;
}

.footer-link {
  color: #666;
  margin: 0 10px;
  text-decoration: none;
  font-size: 14px;
}

.footer-link:hover {
  color: #409EFF;
}

.footer-copyright {
  color: #999;
  font-size: 12px;
}
</style>