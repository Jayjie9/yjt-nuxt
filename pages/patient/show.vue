<script setup>
import { useRoute, useRouter } from 'nuxt/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft, Edit, Delete, User, Phone, Location, Calendar } from '@element-plus/icons-vue'
import { useApi } from '~/composables'

const route = useRoute()
const router = useRouter()
const api = useApi()

// 响应式数据
const patient = ref({
  param: {},
  isInsure: 0
})
const loading = ref(false)

// 获取就诊人详情
const fetchDataById = async () => {
  try {
    loading.value = true
    const { data: response } = await api.patient.getByIdDollar(route.query.id)
    console.log('response', response.data);

    if (!response.data) {
      ElMessage.error('获取就诊人详情信息失败')
      return router.push('/patient')
    }
    patient.value = response.data
  } catch (error) {
    console.error('获取就诊人详情错误:', error)
    ElMessage.error('获取就诊人信息失败')
    router.push('/patient')
  } finally {
    loading.value = false
  }
}

// 删除就诊人
const remove = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该就诊人吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.patient.removePatient(patient.value.id)
    ElMessage.success('删除成功')
    router.push('/patient')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 编辑就诊人
const edit = () => {
  router.push({ path: '/patient/add', query: { id: patient.value.id } })
}

// 返回列表
const goBack = () => {
  router.push('/patient')
}

// 获取证件号码脱敏显示
const getMaskedCertificatesNo = (certificatesNo) => {
  if (!certificatesNo) return '';
  if (certificatesNo.length > 8) {
    return certificatesNo.substring(0, 4) + '********' + certificatesNo.substring(certificatesNo.length - 4);
  }
  return certificatesNo.substring(0, 1) + '*****' + certificatesNo.substring(certificatesNo.length - 1);
}

onMounted(() => {
  if (!route.query.id) {
    ElMessage.warning('未指定就诊人')
    return router.push('/patient')
  }
  fetchDataById()
})
</script>

<template>
  <div class="patient-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">就诊人详情</h1>
        <p class="page-subtitle">查看和管理就诊人的详细信息</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-container">
        <!-- 返回按钮 -->
        <div class="back-button-container">
          <el-button class="back-button" @click="goBack" size="default">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            返回就诊人列表
          </el-button>
        </div>

        <!-- 就诊人详情卡片 -->
        <el-card class="detail-card" shadow="hover" v-loading="loading">
          <!-- 就诊人基本信息头部 -->
          <div class="patient-profile">
            <div class="profile-avatar">
              <span>{{ patient.name ? patient.name.substring(0, 1) : '?' }}</span>
            </div>
            <div class="profile-info">
              <div class="profile-name">
                <h2>{{ patient.name }}</h2>
                <el-tag size="small" :type="patient.isInsure === 0 ? 'warning' : 'success'" effect="light">
                  {{ patient.isInsure === 0 ? '自费' : '医保' }}
                </el-tag>
              </div>
              <div class="profile-id">
                {{ patient.param.certificatesTypeString }} {{ getMaskedCertificatesNo(patient.certificatesNo) }}
              </div>
            </div>
          </div>

          <!-- 就诊人详细信息 -->
          <div class="info-section">
            <div class="section-header">
              <div class="section-title">
                <span class="title-icon"></span>
                <span>基本信息</span>
              </div>
            </div>

            <div class="info-grid">
              <div class="info-item">
                <div class="info-icon">
                  <el-icon>
                    <User />
                  </el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">性别</div>
                  <div class="info-value">{{ patient.sex === 1 ? '男' : '女' }}</div>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">出生日期</div>
                  <div class="info-value">{{ patient.birthdate }}</div>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <el-icon>
                    <Phone />
                  </el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">手机号码</div>
                  <div class="info-value">{{ patient.phone }}</div>
                </div>
              </div>

              <div class="info-item">
                <div class="info-icon">
                  <el-icon>
                    <User />
                  </el-icon>
                </div>
                <div class="info-content">
                  <div class="info-label">婚姻状况</div>
                  <div class="info-value">{{ patient.isMarry === 1 ? '已婚' : '未婚' }}</div>
                </div>
              </div>
            </div>
          </div>

          <!-- 地址信息 -->
          <div class="info-section">
            <div class="section-header">
              <div class="section-title">
                <span class="title-icon"></span>
                <span>地址信息</span>
              </div>
            </div>

            <div class="address-info">
              <div class="info-icon large">
                <el-icon>
                  <Location />
                </el-icon>
              </div>
              <div class="address-content">
                <div class="address-region">
                  {{ patient.param.provinceString || '-' }} / {{ patient.param.cityString || '-' }} / {{
                    patient.param.districtString || '-' }}
                </div>
                <div class="address-detail">
                  {{ patient.address || '暂无详细地址' }}
                </div>
              </div>
            </div>
          </div>

          <!-- 证件信息 -->
          <div class="info-section">
            <div class="section-header">
              <div class="section-title">
                <span class="title-icon"></span>
                <span>证件信息</span>
              </div>
            </div>

            <div class="certificate-info">
              <div class="certificate-type">
                <span class="label">证件类型：</span>
                <span class="value">{{ patient.param.certificatesTypeString }}</span>
              </div>
              <div class="certificate-number">
                <span class="label">证件号码：</span>
                <span class="value">{{ patient.certificatesNo }}</span>
              </div>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-section">
            <el-button type="primary" @click="edit" class="action-btn">
              <el-icon>
                <Edit />
              </el-icon>
              修改信息
            </el-button>
            <el-button type="danger" @click="remove" class="action-btn">
              <el-icon>
                <Delete />
              </el-icon>
              删除就诊人
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面基础样式 */
.patient-detail-page {
  min-height: 100vh;
  background-color: var(--el-bg-color-page, #f5f7fa);
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
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

.content-container {
  position: relative;
}

/* 返回按钮 */
.back-button-container {
  margin-bottom: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 详情卡片 */
.detail-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: var(--el-box-shadow-light);
  margin-bottom: 30px;
}

/* 就诊人资料头部 */
.patient-profile {
  display: flex;
  align-items: center;
  gap: 20px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
  margin-bottom: 24px;
}

.profile-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: 600;
}

.profile-info {
  flex: 1;
}

.profile-name {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.profile-name h2 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.profile-id {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 信息区块 */
.info-section {
  margin-bottom: 24px;
}

.section-header {
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.title-icon {
  width: 4px;
  height: 18px;
  background-color: var(--el-color-primary);
  margin-right: 8px;
  border-radius: 2px;
}

/* 信息网格 */
.info-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.info-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(24, 144, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  font-size: 20px;
}

.info-icon.large {
  width: 50px;
  height: 50px;
  font-size: 24px;
}

.info-content {
  flex: 1;
}

.info-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* 地址信息 */
.address-info {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.address-content {
  flex: 1;
}

.address-region {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.address-detail {
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

/* 证件信息 */
.certificate-info {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 8px;
}

.certificate-type,
.certificate-number {
  margin-bottom: 12px;
  display: flex;
}

.certificate-number {
  margin-bottom: 0;
}

.certificate-info .label {
  width: 80px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.certificate-info .value {
  flex: 1;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
}

/* 操作按钮 */
.action-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.action-btn {
  min-width: 120px;
  padding: 12px 20px;
  font-size: 16px;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .main-content {
    padding: 0 15px;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .patient-profile {
    flex-direction: column;
    text-align: center;
  }

  .profile-name {
    justify-content: center;
  }

  .action-section {
    flex-direction: column;
  }

  .action-btn {
    width: 100%;
  }
}
</style>