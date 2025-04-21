/**
// getUserInfoDollar 接口响应示例
{
"code": 200,
"message": "成功",
"data": {
"id": 10,
"createTime": "2023-05-15 14:32:15",
"updateTime": "2023-05-15 14:32:15",
"isDeleted": 0,
"param": {
"authStatusString": "已认证"
},
"userId": "1234567890",
"name": "张三",
"certificatesType": "身份证",
"certificatesNo": "110101199001011234",
"certificatesUrl": "https://example.com/id-card-image.jpg",
"authStatus": 1,
"status": 1,
"phone": "13800138000"
}
}

// findByDictCodeDollar 接口响应示例
{
"code": 200,
"message": "成功",
"data": [
{
"id": 1,
"parentId": 0,
"name": "身份证",
"value": "1",
"dictCode": "CertificatesType",
"createTime": "2023-05-01 00:00:00",
"updateTime": "2023-05-01 00:00:00",
"isDeleted": 0,
"param": {}
},
{
"id": 2,
"parentId": 0,
"name": "护照",
"value": "2",
"dictCode": "CertificatesType",
"createTime": "2023-05-01 00:00:00",
"updateTime": "2023-05-01 00:00:00",
"isDeleted": 0,
"param": {}
},
{
"id": 3,
"parentId": 0,
"name": "军官证",
"value": "3",
"dictCode": "CertificatesType",
"createTime": "2023-05-01 00:00:00",
"updateTime": "2023-05-01 00:00:00",
"isDeleted": 0,
"param": {}
}
]
}

// saveUserAuth 接口请求示例
{
"name": "张三",
"certificatesType": "身份证",
"certificatesNo": "110101199001011234",
"certificatesUrl": "https://example.com/id-card-image.jpg"
}

// saveUserAuth 接口响应示例
{
"code": 200,
"message": "成功",
"data": null
}
*/
<script setup>
import { ElMessage } from 'element-plus'
import { useApi } from '~/composables'
import {
  User,
  Upload,
  Check,
  Calendar,
  Phone,
  Message,
  Setting,
  Lock,
  Document,
  Bell,
  House
} from '@element-plus/icons-vue'

// 导入api
const api = useApi()
const dictApi = api.dictionary
const userInfoApi = api.user

const defaultForm = {
  name: '',
  certificatesType: '',
  certificatesNo: '',
  certificatesUrl: ''
}

const userAuth = reactive({ ...defaultForm })
const certificatesTypeList = ref([])
const fileUrl = ref('http://localhost:9999/api/oss/file/fileUpload')
const userInfo = reactive({
  param: {}
})
const submitBnt = ref('提交')
const activeTab = ref('profile')

// 模拟数据
const mockUserStats = reactive({
  appointments: 0,
  completedVisits: 0,
  savedHospitals: 0,
  notifications: 0
})

const getUserInfo = async () => {
  const { data: response } = await userInfoApi.getUserInfoDollar()
  Object.assign(userInfo, response.data)

  // 获取用户信息后更新模拟数据
  if (userInfo.authStatus === 1) {
    mockUserStats.appointments = Math.floor(Math.random() * 5)
    mockUserStats.completedVisits = Math.floor(Math.random() * 3)
    mockUserStats.savedHospitals = Math.floor(Math.random() * 4) + 1
    mockUserStats.notifications = Math.floor(Math.random() * 3)
  }
}

const saveUserAuth = async () => {
  if (submitBnt.value === '正在提交...') {
    ElMessage.info('重复提交')
    return
  }
  submitBnt.value = '正在提交...'
  try {
    await userInfoApi.saveUserAuth(userAuth)
    ElMessage.success("提交成功")
    window.location.reload()
  } catch (e) {
    submitBnt.value = '提交'
  }
}

const getDict = async () => {
  const { data: response } = await dictApi.findByDictCodeDollar("CertificatesType")
  certificatesTypeList.value = response.data
}

const onUploadSuccess = (response, file) => {
  if (response.code !== 200) {
    ElMessage.error("上传失败")
    return
  }
  userAuth.certificatesUrl = file.response.data
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 表单验证规则
const rules = {
  name: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  certificatesType: [
    { required: true, message: '请选择证件类型', trigger: 'change' }
  ],
  certificatesNo: [
    { required: true, message: '请输入证件号码', trigger: 'blur' }
  ],
  certificatesUrl: [
    { required: true, message: '请上传证件照片', trigger: 'change' }
  ]
}

// 切换标签页
const changeTab = (tab) => {
  activeTab.value = tab
}

const init = async () => {
  await getUserInfo()
  await getDict()
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="user-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">个人中心</h1>
        <p class="page-subtitle">管理您的个人信息和医疗服务</p>
      </div>
    </div>

    <div class="main-content">
      <!-- 用户信息概览卡片 -->
      <el-card class="user-overview-card" shadow="hover">
        <div class="user-profile">
          <div class="profile-avatar">
            <span>{{ userInfo.name ? userInfo.name.substring(0, 1) : '?' }}</span>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ userInfo.name || '未认证用户' }}</h2>
            <div class="profile-status">
              <el-tag :type="userInfo.authStatus == 0 ? 'warning' : 'success'" effect="light">
                {{ userInfo.param.authStatusString || '未认证' }}
              </el-tag>
              <span class="profile-phone">{{ userInfo.phone || '未绑定手机号' }}</span>
            </div>
          </div>
          <div class="profile-actions">
            <el-button type="primary" plain size="small" @click="$router.push('/user/edit')"
              v-if="userInfo.authStatus == 1">
              <el-icon>
                <Setting />
              </el-icon>
              编辑资料
            </el-button>
          </div>
        </div>

        <div class="user-stats" v-if="userInfo.authStatus == 1">
          <div class="stat-item">
            <div class="stat-value">{{ mockUserStats.appointments }}</div>
            <div class="stat-label">待就诊</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ mockUserStats.completedVisits }}</div>
            <div class="stat-label">已就诊</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ mockUserStats.savedHospitals }}</div>
            <div class="stat-label">收藏医院</div>
          </div>
          <div class="stat-item">
            <div class="stat-value">{{ mockUserStats.notifications }}</div>
            <div class="stat-label">未读消息</div>
          </div>
        </div>
      </el-card>

      <!-- 导航标签页 -->
      <div class="user-tabs">
        <div class="tab-item" :class="{ active: activeTab === 'profile' }" @click="changeTab('profile')">
          <el-icon>
            <User />
          </el-icon>
          <span>个人资料</span>
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'services' }" @click="changeTab('services')">
          <el-icon>
            <Calendar />
          </el-icon>
          <span>医疗服务</span>
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'security' }" @click="changeTab('security')">
          <el-icon>
            <Lock />
          </el-icon>
          <span>账号安全</span>
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'notifications' }" @click="changeTab('notifications')">
          <el-icon>
            <Bell />
          </el-icon>
          <span>消息通知</span>
        </div>
      </div>

      <!-- 个人资料标签页内容 -->
      <div v-if="activeTab === 'profile'">
        <!-- 快速导航卡片 -->
        <div class="quick-nav-section" v-if="userInfo.authStatus == 1">
          <el-card class="quick-nav-card" shadow="hover">
            <div class="nav-grid">
              <div class="nav-item" @click="$router.push('/patient')">
                <div class="nav-icon">
                  <el-icon>
                    <User />
                  </el-icon>
                </div>
                <div class="nav-label">就诊人管理</div>
              </div>
              <div class="nav-item" @click="$router.push('/')">
                <div class="nav-icon">
                  <el-icon>
                    <House />
                  </el-icon>
                </div>
                <div class="nav-label">首页</div>
              </div>
              <div class="nav-item">
                <div class="nav-icon">
                  <el-icon>
                    <Message />
                  </el-icon>
                </div>
                <div class="nav-label">就诊记录</div>
              </div>
              <div class="nav-item">
                <div class="nav-icon">
                  <el-icon>
                    <Document />
                  </el-icon>
                </div>
                <div class="nav-label">健康档案</div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 实名认证卡片 -->
        <el-card class="auth-card" shadow="hover">
          <template #header>
            <div class="auth-header">
              <div class="section-title">
                <el-icon>
                  <User />
                </el-icon>
                <h2 class="auth-title">实名认证</h2>
              </div>
              <el-tag :type="userInfo.authStatus == 0 ? 'warning' : 'success'" class="auth-status">
                {{ userInfo.param.authStatusString || '未认证' }}
              </el-tag>
            </div>
          </template>

          <el-alert type="info" :closable="false" show-icon>
            <p class="auth-tips">
              完成实名认证后才能添加就诊人，正常进行挂号，为了不影响后续步骤，建议提前实名认证。
            </p>
          </el-alert>

          <!-- 未认证表单 -->
          <div v-if="userInfo.authStatus == 0" class="auth-form">
            <el-form :model="userAuth" label-width="120px" :rules="rules" ref="authForm">
              <el-form-item prop="name" label="姓名：">
                <div class="input-with-icon">
                  <el-icon class="field-icon">
                    <User />
                  </el-icon>
                  <el-input v-model="userAuth.name" placeholder="请输入联系人姓名全称" clearable />
                </div>
              </el-form-item>

              <el-form-item prop="certificatesType" label="证件类型：">
                <div class="input-with-icon">
                  <el-icon class="field-icon">
                    <Document />
                  </el-icon>
                  <el-select v-model="userAuth.certificatesType" placeholder="请选择证件类型" class="auth-select">
                    <el-option v-for="item in certificatesTypeList" :key="item.value" :label="item.name"
                      :value="item.name" />
                  </el-select>
                </div>
              </el-form-item>

              <el-form-item prop="certificatesNo" label="证件号码：">
                <div class="input-with-icon">
                  <el-icon class="field-icon">
                    <Document />
                  </el-icon>
                  <el-input v-model="userAuth.certificatesNo" placeholder="请输入联系人证件号码" clearable />
                </div>
              </el-form-item>

              <el-form-item prop="certificatesUrl" label="上传证件：">
                <div class="upload-section">
                  <el-upload class="auth-upload" :action="fileUrl" :show-file-list="false" :on-success="onUploadSuccess"
                    :before-upload="beforeUpload">
                    <div class="upload-area" v-if="!userAuth.certificatesUrl">
                      <el-icon class="upload-icon">
                        <Upload />
                      </el-icon>
                      <span class="upload-text">上传证件照片</span>
                      <span class="upload-hint">支持JPG、PNG格式，不超过2MB</span>
                    </div>
                    <img v-else :src="userAuth.certificatesUrl" class="upload-preview">
                  </el-upload>

                  <div class="upload-example">
                    <img src="//img.114yygh.com/static/web/auth_example.png" alt="示例图">
                    <span class="example-text">证件示例</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="submitBnt === '正在提交...'" @click="saveUserAuth" class="submit-btn">
                  {{ submitBnt }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 已认证信息展示 -->
          <div v-else class="auth-info">
            <div class="auth-success-icon">
              <el-icon>
                <Check />
              </el-icon>
            </div>
            <el-descriptions :column="1" border>
              <el-descriptions-item label="姓名">
                {{ userInfo.name }}
              </el-descriptions-item>
              <el-descriptions-item label="证件类型">
                {{ userInfo.certificatesType }}
              </el-descriptions-item>
              <el-descriptions-item label="证件号码">
                {{ userInfo.certificatesNo }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </div>

      <!-- 医疗服务标签页内容 -->
      <div v-if="activeTab === 'services'">
        <el-card class="service-card" shadow="hover">
          <template #header>
            <div class="section-title">
              <el-icon>
                <Calendar />
              </el-icon>
              <h2 class="service-title">医疗服务</h2>
            </div>
          </template>

          <div v-if="userInfo.authStatus == 1">
            <div class="service-content">
              <div class="service-grid">
                <div class="service-item">
                  <div class="service-icon">
                    <el-icon>
                      <Calendar />
                    </el-icon>
                  </div>
                  <div class="service-name">预约挂号</div>
                  <div class="service-desc">线上预约全国知名医院</div>
                  <el-button type="primary" plain size="small" @click="$router.push('/')">立即预约</el-button>
                </div>
                <div class="service-item">
                  <div class="service-icon">
                    <el-icon>
                      <User />
                    </el-icon>
                  </div>
                  <div class="service-name">就诊人管理</div>
                  <div class="service-desc">管理您的就诊人信息</div>
                  <el-button type="primary" plain size="small" @click="$router.push('/patient')">管理就诊人</el-button>
                </div>
                <div class="service-item">
                  <div class="service-icon">
                    <el-icon>
                      <Document />
                    </el-icon>
                  </div>
                  <div class="service-name">检查报告</div>
                  <div class="service-desc">查看您的检查报告</div>
                  <el-button type="primary" plain size="small">查看报告</el-button>
                </div>
                <div class="service-item">
                  <div class="service-icon">
                    <el-icon>
                      <Message />
                    </el-icon>
                  </div>
                  <div class="service-name">在线咨询</div>
                  <div class="service-desc">在线咨询医生</div>
                  <el-button type="primary" plain size="small">立即咨询</el-button>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="service-unauthorized">
            <div class="unauthorized-icon">
              <el-icon>
                <Lock />
              </el-icon>
            </div>
            <h3>您尚未完成实名认证</h3>
            <p>完成实名认证后才能使用医疗服务</p>
            <el-button type="primary" @click="activeTab = 'profile'">去认证</el-button>
          </div>
        </el-card>
      </div>

      <!-- 账号安全标签页内容 -->
      <div v-if="activeTab === 'security'">
        <el-card class="security-card" shadow="hover">
          <template #header>
            <div class="section-title">
              <el-icon>
                <Lock />
              </el-icon>
              <h2 class="security-title">账号安全</h2>
            </div>
          </template>

          <div class="security-list">
            <div class="security-item">
              <div class="security-info">
                <div class="security-icon">
                  <el-icon>
                    <Phone />
                  </el-icon>
                </div>
                <div class="security-detail">
                  <div class="security-name">手机绑定</div>
                  <div class="security-desc">已绑定手机：{{ userInfo.phone || '未绑定' }}</div>
                </div>
              </div>
              <el-button type="primary" plain size="small">修改</el-button>
            </div>
            <div class="security-item">
              <div class="security-info">
                <div class="security-icon">
                  <el-icon>
                    <Lock />
                  </el-icon>
                </div>
                <div class="security-detail">
                  <div class="security-name">登录密码</div>
                  <div class="security-desc">定期修改密码可以保护账号安全</div>
                </div>
              </div>
              <el-button type="primary" plain size="small">修改</el-button>
            </div>
            <div class="security-item">
              <div class="security-info">
                <div class="security-icon">
                  <el-icon>
                    <Message />
                  </el-icon>
                </div>
                <div class="security-detail">
                  <div class="security-name">邮箱绑定</div>
                  <div class="security-desc">未绑定邮箱</div>
                </div>
              </div>
              <el-button type="primary" plain size="small">绑定</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 消息通知标签页内容 -->
      <div v-if="activeTab === 'notifications'">
        <el-card class="notification-card" shadow="hover">
          <template #header>
            <div class="section-title">
              <el-icon>
                <Bell />
              </el-icon>
              <h2 class="notification-title">消息通知</h2>
            </div>
          </template>

          <div class="notification-empty" v-if="mockUserStats.notifications === 0">
            <div class="empty-icon">
              <el-icon>
                <Bell />
              </el-icon>
            </div>
            <p>暂无消息通知</p>
          </div>
          <div class="notification-list" v-else>
            <div class="notification-item" v-for="i in mockUserStats.notifications" :key="i">
              <div class="notification-content">
                <div class="notification-title">
                  <span class="notification-badge"></span>
                  <span>{{ ['预约成功通知', '就诊提醒', '报告结果通知'][i - 1] }}</span>
                </div>
                <div class="notification-time">{{ new Date().toLocaleDateString() }}</div>
                <div class="notification-desc">
                  {{ ['您的预约已成功，请按时就诊', '您有一个预约即将到期，请及时就诊', '您的检查报告已出，请查看'][i - 1] }}
                </div>
              </div>
              <div class="notification-actions">
                <el-button type="text" size="small">查看详情</el-button>
                <el-button type="text" size="small">标为已读</el-button>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面基础样式 */
.user-page {
  min-height: 100vh;
  background-color: #f0f5f9;
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #4a9cd8 0%, #1a6ca8 100%);
  padding: 60px 0 40px 0;
  color: white;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

/* 主内容区域 */
.main-content {
  max-width: 800px;
  margin: -20px auto 40px;
  padding: 0 20px;
  position: relative;
}

/* 用户概览卡片 */
.user-overview-card {
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 20px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #4a9cd8;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
  box-shadow: 0 4px 8px rgba(74, 156, 216, 0.3);
}

.profile-info {
  flex: 1;
}

.profile-name {
  margin: 0 0 8px;
  font-size: 24px;
  font-weight: 600;
  color: #2c3e50;
}

.profile-status {
  display: flex;
  align-items: center;
  gap: 12px;
}

.profile-phone {
  font-size: 14px;
  color: #7f8c8d;
}

.profile-actions {
  margin-left: auto;
}

.user-stats {
  display: flex;
  border-top: 1px solid #e6eef5;
  padding-top: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 0 10px;
}

.stat-item:not(:last-child) {
  border-right: 1px solid #e6eef5;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #4a9cd8;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #7f8c8d;
}

/* 导航标签页 */
.user-tabs {
  display: flex;
  background-color: white;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.tab-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 0;
  cursor: pointer;
  transition: all 0.3s;
  gap: 8px;
  color: #7f8c8d;
  position: relative;
}

.tab-item.active {
  color: #4a9cd8;
  background-color: #f0f7ff;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 25%;
  width: 50%;
  height: 3px;
  background-color: #4a9cd8;
  border-radius: 3px 3px 0 0;
}

.tab-item .el-icon {
  font-size: 20px;
}

/* 快速导航 */
.quick-nav-section {
  margin-bottom: 20px;
}

.quick-nav-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
}

.nav-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px 10px;
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 8px;
}

.nav-item:hover {
  background-color: #f0f7ff;
}

.nav-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background-color: #e1f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 8px;
}

.nav-icon .el-icon {
  font-size: 24px;
  color: #4a9cd8;
}

.nav-label {
  font-size: 14px;
  color: #2c3e50;
}

/* 认证卡片 */
.auth-card {
  border-radius: 12px;
  margin-bottom: 20px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
}

.auth-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title .el-icon {
  font-size: 20px;
  color: #4a9cd8;
}

.auth-title,
.service-title,
.security-title,
.notification-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.auth-status {
  font-size: 14px;
}

.auth-tips {
  margin: 0;
  line-height: 1.6;
  color: #7f8c8d;
}

.auth-form {
  margin-top: 24px;
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.field-icon {
  position: absolute;
  left: 10px;
  color: #95a5a6;
  font-size: 16px;
  z-index: 1;
}

.input-with-icon .el-input__inner {
  padding-left: 35px;
}

.auth-select {
  width: 100%;
}

.upload-section {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.auth-upload {
  width: 200px;
}

.upload-area {
  width: 200px;
  height: 200px;
  border: 1px dashed #bdc3c7;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #4a9cd8;
}

.upload-icon {
  font-size: 28px;
  color: #95a5a6;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #2c3e50;
  margin-bottom: 4px;
}

.upload-hint {
  font-size: 12px;
  color: #7f8c8d;
}

.upload-preview {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.upload-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-example img {
  width: 200px;
  border-radius: 4px;
  border: 1px solid #e6eef5;
}

.example-text {
  font-size: 12px;
  color: #7f8c8d;
}

.submit-btn {
  min-width: 120px;
  background-color: #4a9cd8;
  border-color: #4a9cd8;
}

.submit-btn:hover {
  background-color: #3a8bc8;
  border-color: #3a8bc8;
}

/* 已认证信息 */
.auth-info {
  padding: 20px 0;
  position: relative;
}

.auth-success-icon {
  position: absolute;
  top: 10px;
  right: 10px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e1f5ee;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-success-icon .el-icon {
  font-size: 24px;
  color: #42b983;
}

/* 服务卡片 */
.service-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
}

.service-content {
  padding: 20px 0;
}

.service-message {
  font-size: 16px;
  color: #2c3e50;
  margin-bottom: 20px;
  text-align: center;
}

.service-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
}

/* 医疗服务网格 */
.service-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.service-item {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  transition: all 0.3s;
  border: 1px solid #e6eef5;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.service-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  border-color: #4a9cd8;
}

.service-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #e1f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.service-icon .el-icon {
  font-size: 28px;
  color: #4a9cd8;
}

.service-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.service-desc {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 16px;
}

/* 未认证服务提示 */
.service-unauthorized {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
}

.unauthorized-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #fef0f0;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.unauthorized-icon .el-icon {
  font-size: 40px;
  color: #f56c6c;
}

/* 安全设置 */
.security-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 8px;
  background-color: #f8fafc;
  border: 1px solid #e6eef5;
}

.security-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.security-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e1f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.security-icon .el-icon {
  font-size: 20px;
  color: #4a9cd8;
}

.security-name {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.security-desc {
  font-size: 14px;
  color: #7f8c8d;
}

/* 消息通知 */
.notification-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px 20px;
  text-align: center;
  color: #7f8c8d;
}

.empty-icon {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-color: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.empty-icon .el-icon {
  font-size: 30px;
  color: #bdc3c7;
}

.notification-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.notification-item {
  padding: 16px;
  border-radius: 8px;
  background-color: #f8fafc;
  border: 1px solid #e6eef5;
}

.notification-content {
  margin-bottom: 12px;
}

.notification-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
}

.notification-badge {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #f56c6c;
}

.notification-time {
  font-size: 12px;
  color: #95a5a6;
  margin-bottom: 8px;
}

.notification-desc {
  font-size: 14px;
  color: #2c3e50;
}

.notification-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .nav-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .service-grid {
    grid-template-columns: 1fr;
  }

  .upload-section {
    flex-direction: column;
    align-items: center;
  }

  .upload-example {
    margin-top: 16px;
  }

  .user-profile {
    flex-direction: column;
    text-align: center;
  }

  .profile-status {
    justify-content: center;
  }

  .service-actions {
    flex-direction: column;
    gap: 10px;
  }

  .user-tabs {
    overflow-x: auto;
  }

  .tab-item {
    min-width: 100px;
  }
}
</style>