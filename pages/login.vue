<script setup lang="ts">
import {ElMessage} from "element-plus";
import {useFetchGet, useFetchPost} from "~/composables/useFetchHttp";
import {loginBySms, sendCaptcha} from "~/composables";

definePageMeta({
  layout: false
})

// 登录相关属性
const loginAttr = reactive({
  accountName: '', // 账户名
  pwd: '',  // 密码
  myPlaceholder: '请输入', // 输入框placeholder
  maxlength: 11, // 输入框长度控制

  phoneNumber: '',  // 手机号码
  captcha: '',         // 验证码
  sending: true     // 是否可以发送验证码
})

// 计时器相关属性
const myTimer = reactive({
  captchaLoginBtn: '获取验证码', // 获取验证码按钮文本
  sending: true,      // 是否可以发送验证码
  captchaTimer: -1,        // 倒计时间  captchaTimer>0 : 显示倒计时 captchaTimer=0 ：重新发送 captchaTimer=-1 ：什么都不显示
  interval: undefined as NodeJS.Timeout | undefined // 倒计时定时任务引用 关闭登录层清除定时任务
})

let myLoginAttr = reactive({...loginAttr})

let userInfo = reactive({
  phone: '',
  code: '',
  openid: ''
})

// 账号密码登录
const pwdLogin = () => {
  ElMessage("login test")
}

// 手机号登录
const captchaLogin = async () => {
  //  输入校验

  userInfo.phone = loginAttr.phoneNumber
  userInfo.code = loginAttr.captcha

  const {data} = await loginBySms(userInfo)
}

// button-获取验证码-计时器任务控制
const getCaptcha = () => {
  userInfo.phone = loginAttr.phoneNumber

  if (!(/^1[34578]\d{9}$/.test(userInfo.phone))) {
    ElMessage.error('手机号码不正确');
    return;
  }

  if (myTimer.captchaTimer > 0) return // 防止重复点击
  myTimer.captchaTimer = 60
  myTimer.captchaLoginBtn = `${myTimer.captchaTimer}`
  startCountdown()

  // 调用接口
  sendCaptcha(userInfo.phone).then(() => {
    startCountdown();
  }).catch(() => {
    ElMessage.error('发送失败，重新发送')
  })
}

const startCountdown = () => {
  myTimer.interval = setInterval(() => {
    if (myTimer.captchaTimer > 0) {
      myTimer.captchaTimer--
      myTimer.captchaLoginBtn = `${myTimer.captchaTimer}`
    } else {
      clearInterval(myTimer.interval)
      myTimer.captchaLoginBtn = "重新发送"
    }
  }, 1000)
}
</script>

<template>

  <div class="login-bg">

    <!--头部 #start-->
    <div class="login-header">
      <!-- logo -->
      <div class="left-wrapper v-link selected">
        <img style="width: 50px; height: 50px" src="~assets/images/logo.png" alt="logo">
        <span class="text">医捷通</span>
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
                <div>QQ/扣扣/qq</div>
              </div>

              <div class="qrcode-wrap">
                <div class="qrcode-wrapper-qq">
                  <img src="//img.114yygh.com/static/web/code_login_wechat.png" class="qq-qrcode" alt="二维码">
                </div>
              </div>

              <div class="other-methods">
                <div class="third-party-login-text">其他方式</div>
                <div class="third-parties">

                </div>
              </div>

            </div>
          </div>

          <!-- 分割线 -->
          <el-divider direction="vertical" style="height: 100%"/>

          <!-- 账密/验证码登录 #start -->
          <div class="operate-view">
            <div class="wrapper" style="width: 100%">
              <el-tabs class="wrapper-tabs">
                <el-tab-pane label="账密登录">
                  <div style="position: static;width: 70%">
                    <span>账号</span>
                    <el-input v-model="loginAttr.accountName" :maxlength="myLoginAttr.maxlength"
                              :placeholder="loginAttr.myPlaceholder"></el-input>
                    <span>密码</span>
                    <el-input v-model="loginAttr.pwd" :maxlength="myLoginAttr.maxlength"
                              :placeholder="loginAttr.myPlaceholder"
                              type="password" show-password></el-input>
                    <el-button @click="pwdLogin"> 立即登录</el-button>
                  </div>
                </el-tab-pane>

                <el-tab-pane label="手机号登录">
                  <div style="position: static;width: 70%">
                    <el-form>
                      <el-form-item>
                        <span>+86</span>
                        <el-input v-model="loginAttr.phoneNumber" :placeholder="loginAttr.myPlaceholder"
                                  :maxlength="myLoginAttr.maxlength">
                        </el-input>
                        <span>验证码</span>
                        <el-input v-model="loginAttr.captcha" :placeholder="loginAttr.myPlaceholder"
                                  :maxlength="myLoginAttr.maxlength">
                          <template #append>
                            <el-button :disabled="myTimer.captchaTimer > 0" @click="getCaptcha">
                              {{ myTimer.captchaLoginBtn }}
                            </el-button>
                          </template>
                        </el-input>
                      </el-form-item>
                    </el-form>
                    <div class="send-button v-button" @click="captchaLogin"> 立即登录</div>
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
      <!--      <my-footer></my-footer>-->
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
  margin: 106px auto 0;
}

.core-wrapper {
  margin-top: 64px;
  margin-bottom: 64px;
  display: flex;
}

.qr-method {
  padding: 0 6px;
  position: relative;
  width: 144px;
  z-index: 5;
}

.saoma-qr {
  text-align: left;
  position: relative;
}

.qrlogin-title {
  font-weight: 600;
  font-size: 34px;
  line-height: 44px;
  color: #181818;
}

.methods-text {
  font-size: 12px;
  line-height: 20px;
  margin-top: 24px;
  color: #717171;
}

.qrcode-wrap {
  margin-top: 12px;
  text-align: center;
}

.qrcode-wrapper-qq {
  position: relative;
  overflow: hidden;
  width: 144px;
  height: 144px;
}

.qq-qrcode {
  width: 100%;
  height: 144px;
}

.third-party-login-text {
  margin-top: 24px;
  font-size: 12px;
  color: #999999;
  line-height: 20px;
}

.third-parties {
  margin-top: 8px;
}
</style>