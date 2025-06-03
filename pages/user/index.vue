<script setup>
import { ElMessage } from 'element-plus'
import { useApi } from '~/composables'
import { useAuth } from '~/composables/useAuth'
import {
  User, Upload, Check, Calendar, Phone, Message, Setting, Lock, Document, Bell,
  House, ArrowDown, ArrowUp, Delete, Location, Star
} from '@element-plus/icons-vue'
import { FileType } from '~/types/common'

// 导入api
const api = useApi()
const dictApi = api.dictionary
const userInfoApi = api.user

// 获取用户认证状态
const { isLoggedIn } = useAuth()

// 消息相关状态
const messages = ref([])
const loading = ref(false)

// 获取消息列表
const getMessages = async () => {
  if (!isLoggedIn.value) return

  loading.value = true
  try {
    const { data: response } = await userInfoApi.getMessageList()
    if (response.code === 200) {
      messages.value = response.data || []
      // 更新未读消息数量
      mockUserStats.notifications = messages.value.filter(msg => msg.readFlag === 0).length
    }
  } catch (error) {
    console.error('获取消息列表失败:', error)
    ElMessage.error('获取消息列表失败')
  } finally {
    loading.value = false
  }
}

// 标记消息为已读
const markAsRead = async (message) => {
  if (message.readFlag === 0) {
    message.readFlag = 1
    try {
      const { data: response } = await userInfoApi.updateMessageStatus(message.id)
      if (response.code === 200) {
        // 更新未读消息数量
        mockUserStats.notifications = messages.value.filter(msg => msg.readFlag === 0).length
        ElMessage.success('已标记为已读')
      }
    } catch (error) {
      console.error('更新消息状态失败:', error)
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

const defaultForm = {
  name: '',
  certificatesType: '',
  certificatesNo: '',
  certificatesFileName: ''
}
const certificateUrl = ref('')
const userAuth = reactive({ ...defaultForm })
const certificatesTypeList = ref([])
const userInfo = reactive({
  avatar: '',
  authStatus: 0,
})
// 计算认证状态字符串
const authStatusString = ref('')
const filename = ref('')
const submitBnt = ref('提交')
const activeTab = ref('profile')

// 模拟数据
const mockUserStats = reactive({
  appointments: 0,
  completedVisits: 0,
  savedHospitals: 0,
  notifications: 0
})

// 收藏数据
const favoriteHospitals = ref([])
const favoriteDiseases = ref([])
const hospitalLimit = ref(4) // 默认显示4个医院
const diseaseLimit = ref(4) // 默认显示4个疾病
const showAllHospitals = ref(false)
const showAllDiseases = ref(false)

// 头像URL
const avatarUrl = ref('')

// 获取头像URL
const getAvatarUrl = async () => {
  const avatarId = userInfo.avatar
  if (!avatarId) return

  if (!import.meta.client) return // 避免 SSR 报错

  const now = Date.now()
  const cachedUrl = localStorage.getItem('avatar-url')
  const cachedExpire = parseInt(localStorage.getItem('avatar-expire') || '0')

  if (cachedUrl && cachedExpire > now) {
    avatarUrl.value = cachedUrl
    return
  }

  try {
    const { data: response } = await api.oss.renewUrl(avatarId)
    if (response.code === 200 && response.data) {
      avatarUrl.value = response.data
      localStorage.setItem('avatar-url', response.data)
      localStorage.setItem('avatar-expire', (now + 10 * 60 * 1000).toString())
    }
  } catch (error) {
    console.error('获取头像URL失败:', error)
  }
}


const getUserInfo = async () => {
  const { data: response } = await userInfoApi.getUserInfoDollar()
  Object.assign(userInfo, response.data.userInfo)
  authStatusString.value = response.data.authStatusString
  // 如果有头像，获取头像URL
  if (userInfo.avatar) {
    await getAvatarUrl()
  }
  // 获取用户信息后更新模拟数据
  if (userInfo.authStatus === 1) {
    mockUserStats.appointments = Math.floor(Math.random() * 5)
    mockUserStats.completedVisits = Math.floor(Math.random() * 3)
    mockUserStats.savedHospitals = Math.floor(Math.random() * 4) + 1
    mockUserStats.notifications = Math.floor(Math.random() * 3)
  }
}

const getUserCollect = async () => {
  try {
    // 使用真实API调用获取收藏数据
    const { data: response } = await userInfoApi.getUserCollectDollar()
    // 处理收藏数据
    if (response.code === 200 && response.data) {
      // 处理医院数据
      if (response.data.hospitals && Array.isArray(response.data.hospitals)) {
        favoriteHospitals.value = response.data.hospitals;
        // 更新统计数据
        mockUserStats.savedHospitals = favoriteHospitals.value.length;
      } else {
        favoriteHospitals.value = [];
      }

      // 处理疾病数据
      if (response.data.diseases && Array.isArray(response.data.diseases)) {
        favoriteDiseases.value = response.data.diseases;
      } else {
        favoriteDiseases.value = [];
      }
    }
  } catch (error) {
    console.error('获取收藏数据失败:', error);
    ElMessage.error('获取收藏数据失败');
  }
}

// 删除收藏
const deleteCollection = async (id, type) => {
  try {
    const { data: response } = await userInfoApi.deleteCollectDollar(id)
    if (response.code === 200) {
      ElMessage.success('取消收藏成功')
      // 更新收藏列表
      if (type === 'hospital') {
        favoriteHospitals.value = favoriteHospitals.value.filter(item => item.collectionId !== id)
        mockUserStats.savedHospitals = favoriteHospitals.value.length
      } else if (type === 'disease') {
        favoriteDiseases.value = favoriteDiseases.value.filter(item => item.collectionId !== id)
      }
    } else {
      ElMessage.error(response.message || '取消收藏失败')
    }
  } catch (error) {
    console.error('取消收藏失败:', error)
    ElMessage.error('操作失败，请稍后重试')
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

// 处理证件上传请求
const handleCertificateUpload = async (options) => {
  try {
    const { file } = options
    // 使用API中的uploadFile函数上传文件
    const { data: response } = await api.oss.uploadFile(file, FileType.ID_CARD)

    if (response.code !== 200) {
      ElMessage.error('证件上传失败')
      options.onError(new Error('上传失败'))
      return
    }

    // 获取上传返回的数据并设置证件URL
    userAuth.certificatesFileName = response.data.fileName
    certificateUrl.value = response.data.url
    // 调用成功回调
    options.onSuccess(response)
    ElMessage.success('证件上传成功')
  } catch (error) {
    console.error('上传证件失败:', error)
    ElMessage.error('证件上传失败，请稍后重试')
    options.onError(error)
  }
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

// 头像上传前验证
const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB!')
    return false
  }
  return true
}

// 处理头像上传请求
const handleAvatarUpload = async (options) => {
  try {
    const { file } = options
    // 使用API中的uploadFile函数上传文件
    const { data: response } = await api.oss.uploadFile(file, FileType.AVATAR)

    if (response.code !== 200) {
      ElMessage.error('头像上传失败')
      options.onError(new Error('上传失败'))
      return
    }

    // 获取上传返回的数据
    const { url, fileName } = response.data
    // 直接使用返回的URL显示头像
    avatarUrl.value = url
    // 保存文件名用于后续URL续签
    userInfo.avatar = fileName
    localStorage.setItem('avatar-url', url)
    localStorage.setItem('user-avatar', fileName)
    // 调用成功回调
    options.onSuccess(response)
    ElMessage.success('头像更新成功')
  } catch (error) {
    console.error('更新头像失败:', error)
    ElMessage.error('头像更新失败，请稍后重试')
    options.onError(error)
  }
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

// 切换显示全部/部分收藏医院
const toggleHospitals = () => {
  showAllHospitals.value = !showAllHospitals.value
}

// 切换显示全部/部分收藏疾病
const toggleDiseases = () => {
  showAllDiseases.value = !showAllDiseases.value
}

// 获取要显示的医院列表
const displayedHospitals = computed(() => {
  if (showAllHospitals.value) {
    return favoriteHospitals.value
  }
  return favoriteHospitals.value.slice(0, hospitalLimit.value)
})

// 获取要显示的疾病列表
const displayedDiseases = computed(() => {
  if (showAllDiseases.value) {
    return favoriteDiseases.value
  }
  return favoriteDiseases.value.slice(0, diseaseLimit.value)
})

const init = async () => {
  await getUserInfo()
  await getUserCollect()
  await getDict()
  await getMessages()
}

onMounted(() => {
  init()

  // 处理URL参数，支持从消息通知跳转
  if (import.meta.client) {
    const route = useRoute()
    if (route.query.tab === 'notifications') {
      activeTab.value = 'notifications'
    }
  }
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
            <img v-if="avatarUrl" :src="avatarUrl" alt="用户头像" class="avatar-image">
            <span v-else>{{ userInfo.name ? userInfo.name.substring(0, 1) : '?' }}</span>
            <div class="avatar-upload" v-if="userInfo.authStatus == 2">
              <el-upload class="avatar-uploader" :http-request="handleAvatarUpload" :show-file-list="false"
                :before-upload="beforeAvatarUpload">
                <el-icon class="avatar-upload-icon">
                  <Upload />
                </el-icon>
              </el-upload>
            </div>
          </div>
          <div class="profile-info">
            <h2 class="profile-name">{{ userInfo.nickName || '默认用户名' }}</h2>
            <div class="profile-status">
              <el-tag :type="userInfo.authStatus > 1 ? 'success' : 'danger'" effect="light">
                {{ authStatusString || '未认证' }}
              </el-tag>
              <span class="profile-phone">{{ userInfo.phone || '未绑定手机号' }}</span>
            </div>
          </div>
          <div class="profile-actions">
            <el-button type="primary" plain size="small" @click="$router.push('/user/edit')">
              <el-icon>
                <Setting />
              </el-icon>
              编辑资料
            </el-button>
          </div>
        </div>

        <!-- <div class="user-stats" v-if="userInfo.authStatus == 1">
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
        </div> -->
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
            <Document />
          </el-icon>
          <span>健康档案</span>
        </div>
        <div class="tab-item" :class="{ active: activeTab === 'notifications' }" @click="changeTab('notifications')">
          <el-icon>
            <Message />
          </el-icon>
          <span>就诊记录</span>
        </div>
      </div>

      <!-- 个人资料标签页内容 -->
      <div v-if="activeTab === 'profile'">
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
              <el-tag :type="userInfo.authStatus > 1 ? 'success' : 'warning'" class="auth-status">
                {{ authStatusString || '未认证' }}
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
                  <!-- <el-icon class="field-icon">
                    <User />
                  </el-icon> -->
                  <el-input v-model="userAuth.name" placeholder="请输入联系人姓名全称" clearable />
                </div>
              </el-form-item>

              <el-form-item prop="certificatesType" label="证件类型：">
                <div class="input-with-icon">
                  <!-- <el-icon class="field-icon">
                    <Document />
                  </el-icon> -->
                  <el-select v-model="userAuth.certificatesType" placeholder="请选择证件类型" class="auth-select">
                    <el-option v-for="item in certificatesTypeList" :key="item.value" :label="item.name"
                      :value="item.name" />
                  </el-select>
                </div>
              </el-form-item>

              <el-form-item prop="certificatesNo" label="证件号码：">
                <div class="input-with-icon">
                  <!-- <el-icon class="field-icon">
                    <Document />
                  </el-icon> -->
                  <el-input v-model="userAuth.certificatesNo" placeholder="请输入联系人证件号码" clearable />
                </div>
              </el-form-item>

              <el-form-item prop="certificatesUrl" label="上传证件：">
                <div class="upload-section">
                  <el-upload class="auth-upload" :http-request="handleCertificateUpload" :show-file-list="false"
                    :before-upload="beforeUpload">
                    <div class="upload-area" v-if="!userAuth.certificatesFileName">
                      <el-icon class="upload-icon">
                        <Upload />
                      </el-icon>
                      <span class="upload-text">上传证件照片</span>
                      <span class="upload-hint">支持JPG、PNG格式，不超过2MB</span>
                    </div>
                    <img v-else :src="certificateUrl" class="upload-preview">
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

            <div class="security-item">
              <div class="security-info">
                <div class="security-icon">
                  <el-icon>
                    <Delete />
                  </el-icon>
                </div>
                <div class="security-detail">
                  <div class="security-name">注销账号</div>
                  <div class="security-desc">销毁您的所有账号信息</div>
                </div>
              </div>
              <el-button type="danger" plain size="small">注销</el-button>
            </div>
          </div>
        </el-card>
      </div>

      <!-- 健康档案标签页内容 -->
      <div v-if="activeTab === 'services'">
        <!-- 收藏医院卡片 -->
        <el-card class="service-card" shadow="hover" style="margin-bottom: 20px;">
          <template #header>
            <div class="section-title">
              <el-icon>
                <House />
              </el-icon>
              <h2 class="service-title">收藏医院</h2>
            </div>
          </template>

          <div v-if="userInfo.authStatus > 1">
            <div class="favorite-content">
              <div v-if="favoriteHospitals.length > 0" class="favorite-grid">
                <div v-for="item in displayedHospitals" :key="item.collectionId" class="favorite-item"
                  @click="$router.push(`/hospital/${item.hospital.hoscode}`)">
                  <!-- 收藏标记 -->
                  <div class="favorite-badge">
                    <el-icon color="#ff6b6b">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path
                          d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                    </el-icon>
                  </div>

                  <!-- 删除按钮 -->
                  <div class="favorite-delete">
                    <el-button type="danger" circle size="small"
                      @click.stop="deleteCollection(item.collectionId, 'hospital')" title="取消收藏">
                      <el-icon>
                        <Delete />
                      </el-icon>
                    </el-button>
                  </div>

                  <!-- 医院Logo -->
                  <div class="favorite-icon">
                    <div class="hospital-logo">
                      <span>{{ item.hospital.hosname.substring(0, 2) }}</span>
                    </div>
                  </div>

                  <!-- 医院信息 -->
                  <div class="favorite-info">
                    <div class="favorite-name">{{ item.hospital.hosname }}</div>
                    <div class="favorite-type">
                      <el-tag size="small" effect="plain" type="success">{{ item.hospital.hostype === '1' ? '三甲医院' :
                        '综合医院'
                      }}</el-tag>
                    </div>
                    <div class="favorite-address">
                      <el-icon>
                        <Location />
                      </el-icon>
                      <span class="address-text">{{ item.hospital.address }}</span>
                    </div>
                    <div class="favorite-intro" v-if="item.hospital.intro">
                      <div class="intro-text">{{ item.hospital.intro }}</div>
                    </div>
                    <div class="favorite-actions">
                      <el-button type="primary" size="small"
                        @click="$router.push(`/hospital/${item.hospital.hoscode}`)">
                        <el-icon>
                          <Calendar />
                        </el-icon> 预约挂号
                      </el-button>
                      <el-button type="info" plain size="small" @click="$router.push(`/hospital/${hospital.hoscode}`)">
                        查看详情
                      </el-button>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="favoriteHospitals.length === 0" class="empty-state">
                <el-empty description="暂无收藏医院" :image-size="100">
                  <template #description>
                    <p>您还没有收藏任何医院</p>
                  </template>
                  <el-button type="primary" @click="$router.push('/')">
                    去浏览医院
                  </el-button>
                </el-empty>
              </div>

              <div class="view-more-container" v-if="favoriteHospitals.length > hospitalLimit.value">
                <el-button type="primary" plain @click="toggleHospitals">
                  {{ showAllHospitals ? '收起' : `查看全部 ${favoriteHospitals.length} 家医院` }}
                  <el-icon class="el-icon--right">
                    <ArrowDown v-if="!showAllHospitals" />
                    <ArrowUp v-else />
                  </el-icon>
                </el-button>
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
            <p>完成实名认证后才能查看收藏的医院</p>
            <el-button type="primary" @click="activeTab = 'profile'">去认证</el-button>
          </div>
        </el-card>

        <!-- 收藏疾病卡片 -->
        <el-card class="service-card" shadow="hover">
          <template #header>
            <div class="section-title">
              <el-icon>
                <Document />
              </el-icon>
              <h2 class="service-title">收藏疾病</h2>
            </div>
          </template>

          <div class="favorite-content">
            <div v-if="favoriteDiseases.length > 0" class="favorite-grid">
              <div v-for="item in displayedDiseases" :key="item.collectionId"
                @click="$router.push(`/disease/${item.disease.discode}`)" class="favorite-item disease-item">
                <!-- 收藏标记 -->
                <div class="favorite-badge">
                  <el-icon color="#5e72e4">
                    <Star />
                  </el-icon>
                </div>

                <!-- 删除按钮 -->
                <div class="favorite-delete">
                  <el-button type="danger" circle size="small"
                    @click.stop="deleteCollection(item.collectionId, 'disease')" title="取消收藏">
                    <el-icon>
                      <Delete />
                    </el-icon>
                  </el-button>
                </div>

                <!-- 疾病信息 -->
                <div class="favorite-info">
                  <div class="favorite-name">{{ item.disease.name }}</div>
                  <div class="favorite-type">
                    <el-tag size="small" effect="plain" type="success">{{ item.disease.category.bigname }}</el-tag>
                    <el-tag size="small" effect="plain" type="success">{{ item.disease.department.depname }}</el-tag>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="favoriteDiseases.length === 0" class="empty-state">
              <el-empty description="暂无收藏疾病" :image-size="100">
                <template #description>
                  <p>您还没有收藏任何疾病</p>
                </template>
              </el-empty>
            </div>

            <div v-if="favoriteDiseases.length > diseaseLimit" class="show-more">
              <el-button type="text" @click="toggleDiseases">
                {{ showAllDiseases ? '收起' : '查看更多' }}
                <el-icon>
                  <component :is="showAllDiseases ? ArrowUp : ArrowDown" />
                </el-icon>
              </el-button>
            </div>

            <div v-if="!userInfo.authStatus" class="service-unauthorized">
              <div class="unauthorized-icon">
                <el-icon>
                  <Lock />
                </el-icon>
              </div>
              <h3>您尚未完成实名认证</h3>
              <p>完成实名认证后才能查看收藏的疾病</p>
              <el-button type="primary" @click="activeTab = 'profile'">去认证</el-button>
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

          <!-- 未登录状态 -->
          <div v-if="!isLoggedIn" class="service-unauthorized">
            <div class="unauthorized-icon">
              <el-icon>
                <Lock />
              </el-icon>
            </div>
            <h3>您尚未登录</h3>
            <p>登录后才能查看消息通知</p>
            <el-button type="primary" @click="$router.push('/login')">去登录</el-button>
          </div>

          <!-- 加载中状态 -->
          <div v-else-if="loading" class="loading-state">
            <el-skeleton :rows="3" animated />
          </div>

          <!-- 空消息状态 -->
          <div v-else-if="messages.length === 0" class="notification-empty">
            <div class="empty-icon">
              <el-icon>
                <Bell />
              </el-icon>
            </div>
            <p>暂无消息通知</p>
          </div>

          <!-- 消息列表 -->
          <div v-else class="notification-list">
            <div class="notification-item" v-for="message in messages" :key="message.id"
              :class="{ 'unread': message.readFlag === 0 }">
              <div class="notification-content">
                <div class="notification-title">
                  <span class="notification-badge" v-if="message.readFlag === 0"></span>
                  <span>{{ message.title }}</span>
                </div>
                <div class="notification-time">{{ message.create_time }}</div>
                <div class="notification-desc">
                  {{ message.content }}
                </div>
              </div>
              <div class="notification-actions">
                <el-button type="text" size="small" @click="markAsRead(message)"
                  v-if="message.readFlag === 0">标为已读</el-button>
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

/* 头像样式 */
.profile-avatar {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  color: #409eff;
  overflow: hidden;
  margin-right: 20px;
}

.avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-upload {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 30px;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}

.profile-avatar:hover .avatar-upload {
  opacity: 1;
}

.avatar-upload-icon {
  color: white;
  font-size: 16px;
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
  width: 50%;
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

/* 收藏项目网格 */
.favorite-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

/* 收藏医院卡片样式 */
.favorite-item {
  background-color: #f8fafc;
  border-radius: 12px;
  padding: 0;
  transition: all 0.3s;
  border: 1px solid #e6eef5;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  cursor: pointer;
}

.favorite-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
  border-color: #4a9cd8;
}

.disease-item {
  background: linear-gradient(to bottom right, #f8f9fe, #ffffff);
  border-left: 4px solid #5e72e4;
}

.favorite-delete {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  opacity: 0;
  transition: opacity 0.3s;
}

.favorite-item:hover .favorite-delete {
  opacity: 1;
}

.empty-state {
  padding: 30px;
  text-align: center;
}

/* 收藏标记 */
.favorite-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 2;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

.favorite-icon {
  width: 100%;
  height: 120px;
  background-color: #e1f0ff;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  overflow: hidden;
  border-bottom: 1px solid #ebeef5;
}

.favorite-icon .el-icon {
  font-size: 28px;
  color: #4a9cd8;
}

.disease-icon {
  background-color: #e1f5ee;
}

.disease-icon .el-icon {
  color: #42b983;
}


.hospital-logo {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #409eff 0%, #64b5f6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  border: 3px solid white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 医院信息 */
.favorite-info {
  padding: 15px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.favorite-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 8px;
  text-align: center;
}

.favorite-type {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.favorite-address {
  display: flex;
  align-items: flex-start;
  gap: 5px;
  font-size: 14px;
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.4;
}

.favorite-address .el-icon {
  margin-top: 3px;
  flex-shrink: 0;
  color: #909399;
}

.favorite-intro {
  margin-bottom: 10px;
  position: relative;
}

.intro-text {
  font-size: 13px;
  color: #606266;
  line-height: 1.5;
  max-height: 60px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  position: relative;
  padding-left: 8px;
  border-left: 3px solid #409eff;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
}



.favorite-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.view-more-container {
  text-align: center;
  margin-top: 25px;
  margin-bottom: 10px;
}

.view-more-container .el-button {
  padding: 10px 20px;
  font-weight: 500;
  transition: all 0.3s;
}

.view-more-container .el-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.2);
}

.empty-favorites {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 0;
}

.empty-icon {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #f0f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}

.empty-icon .el-icon {
  font-size: 40px;
  color: #909399;
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
.security-card {
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  border: none;
}

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

/* 收藏医院卡片样式 */
.favorite-address .address-text,
.favorite-intro .intro-text {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.5;
  max-height: 3em;
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

/* 加载状态 */
.loading-state {
  padding: 20px;
}

/* 未读消息样式 */
.notification-item.unread {
  background-color: #f0f7ff;
  border-left: 3px solid #409eff;
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

  .favorite-grid {
    grid-template-columns: 1fr;
  }

  .favorite-actions {
    flex-direction: column;
  }

  .favorite-intro .intro-text {
    line-clamp: 2;
    -webkit-line-clamp: 2;
    max-height: 45px;
  }
}
</style>