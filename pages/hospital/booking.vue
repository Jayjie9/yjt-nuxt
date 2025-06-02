<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Check, ArrowLeft } from '@element-plus/icons-vue'
import { useApi } from '~/composables'
import { useRoute, useRouter } from 'nuxt/app'
import type { Schedule, Patient } from '~/types/booking'


// 获取API和路由
const api = useApi()
const route = useRoute()
const router = useRouter()

// 页面数据
const hoscode = ref('')
const scheduleId = ref('')
const hosScheduleId = ref('')
const schedule = ref<Schedule>({} as Schedule)
const patientList = ref<Patient[]>([])
const patient = ref<Patient>({} as Patient)
const activeIndex = ref(0)
const submitBnt = ref('确认挂号')

// 根据ID获取排班信息
const getSchedule = async () => {
  try {
    const { data } = await api.hospital.getSchedule(scheduleId.value)
    if (data.value) {
      schedule.value = data.value.data
    }
  } catch (error) {
    ElMessage.error('获取排班信息失败')
    console.error(error)
  }
}

// 获取就诊人列表
const findPatientList = async () => {
  try {
    const { data } = await api.patient.findList()
    if (data.value) {
      patientList.value = data.value.data
      if (patientList.value.length > 0) {
        patient.value = patientList.value[0]
      }
    }
  } catch (error) {
    ElMessage.error('获取就诊人列表失败')
    console.error(error)
  }
}

// 选择就诊人
const selectPatient = (index: number) => {
  activeIndex.value = index
  patient.value = patientList.value[index]
}

// 返回修改
const backToCheck = () => {
  router.back()
}

// 确认订单
const submitOrder = async () => {
  if (!patient.value.id) {
    ElMessage.error('请选择就诊人')
    return
  }

  // 防止重复提交
  if (submitBnt.value === '正在提交...') {
    ElMessage.error('正在提交，请稍候')
    return
  }

  submitBnt.value = '正在提交...'
  try {
    const { data: response } = await api.order.submitOrder(scheduleId.value, patient.value.id, hosScheduleId.value)
    if (response.value.code === 200) {
      ElMessage.success('预约成功')
      router.push(`/order/show?orderId=${response.value.data}`)
    } else {
      ElMessage.error('预约失败，请稍后再试')
      submitBnt.value = '确认挂号'
    }
  } catch (error) {
    ElMessage.error('预约失败，请重试')
    console.error(error)
    submitBnt.value = '确认挂号'
  }
}

// 添加就诊人
const addPatient = () => {
  router.push('/patient/add')
}
// 获取数据
const init = async () => {
  try {
    await getSchedule()
    await findPatientList()
  } catch (error) {
    ElMessage.error('获取数据失败')
    console.error(error)
  }
}
// 初始化
onMounted(() => {
  hoscode.value = route.query.hoscode as string
  scheduleId.value = route.query.scheduleId as string
  hosScheduleId.value = route.query.hosScheduleId as string
  init()
})
</script>

<template>
  <div class="hospital-page">
    <!-- 医院头部信息区 -->
    <div class="hospital-hero">
      <div class="hero-content">
        <div class="hospital-basic">

          <h1 class="hospital-title">{{ schedule.param?.hosname }}</h1>
          <div class="hospital-tags">
            <el-tag size="large" type="primary" effect="plain">{{ schedule.param?.depname }}</el-tag>
            <el-tag size="large" type="success" effect="plain">预约挂号</el-tag>
          </div>
        </div>
      </div>
    </div>

    <div class="page-layout">
      <div class="main-content">
        <!-- 预约进度提示 -->
        <el-card class="progress-card">
          <el-steps :active="2" finish-status="success">
            <el-step title="选择科室" />
            <el-step title="选择医生" />
            <el-step title="确认预约" />
          </el-steps>
        </el-card>

        <!-- 预约信息确认区域 -->
        <el-card class="booking-card">
          <template #header>
            <div class="card-header">
              <el-icon>
                <Calendar />
              </el-icon>
              <h3>确认挂号信息</h3>
            </div>
          </template>

          <!-- 就诊人选择 -->
          <div class="section patient-section">
            <div class="section-header">
              <div class="section-title">
                <el-icon>
                  <User />
                </el-icon>
                <span>选择就诊人</span>
              </div>
              <el-button type="primary" plain size="small" @click="addPatient">
                <el-icon>
                  <Plus />
                </el-icon>添加就诊人
              </el-button>
            </div>

            <div class="patient-list">
              <el-empty v-if="patientList.length === 0" description="暂无就诊人信息" :image-size="120">
                <el-button type="primary" @click="addPatient">立即添加</el-button>
              </el-empty>

              <div v-else class="patient-grid">
                <div v-for="(item, index) in patientList" :key="item.id" class="patient-card"
                  :class="{ 'active': activeIndex === index }" @click="selectPatient(index)">
                  <div class="patient-avatar">{{ item.name.charAt(0) }}</div>
                  <div class="patient-info">
                    <div class="patient-name">
                      {{ item.name }}
                      <el-tag size="small" :type="item.isInsure === 0 ? 'info' : 'success'" effect="light">
                        {{ item.isInsure === 0 ? '自费' : '医保' }}
                      </el-tag>
                    </div>
                    <div class="patient-details">
                      <span class="id-type">{{ item.param.certificatesTypeString }}</span>
                      <span class="id-number">{{ item.certificatesNo }}</span>
                    </div>
                  </div>
                  <el-icon v-if="activeIndex === index" class="check-icon">
                    <Check />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 预约信息 -->
          <div class="section schedule-section">
            <div class="section-title">
              <el-icon>
                <Document />
              </el-icon>
              <span>预约信息</span>
            </div>
            <el-descriptions :column="2" border class="info-descriptions">
              <el-descriptions-item label="就诊日期" class="date-item">
                <div class="date-info">
                  <span class="date">{{ schedule.workDate }}</span>
                  <span class="week">{{ schedule.param?.dayOfWeek }}</span>
                  <el-tag size="small" :type="schedule.workTime === 0 ? 'warning' : 'success'" effect="light">
                    {{ schedule.workTime === 0 ? '上午' : '下午' }}
                  </el-tag>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="医生姓名">
                <div class="doctor-info">
                  <span class="name">{{ schedule.docname }}</span>
                  <el-tag size="small" type="primary" effect="light">{{ schedule.title }}</el-tag>
                </div>
              </el-descriptions-item>
              <el-descriptions-item label="就诊科室">
                {{ schedule.param?.depname }}
              </el-descriptions-item>
              <el-descriptions-item label="医事服务费">
                <span class="price">￥{{ schedule.amount }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <!-- 预约提示 -->
          <div class="section notice-section">
            <div class="section-title">
              <el-icon>
                <Warning />
              </el-icon>
              <span>预约须知</span>
            </div>
            <el-alert type="warning" :closable="false" show-icon class="notice-alert">
              <template #title>
                <div class="notice-list">
                  <p>1. 请确认就诊人信息准确无误，避免影响就医</p>
                  <p>2. 预约成功后请在规定时间内完成取号，过期将自动取消</p>
                  <p>3. 如需取消预约，请提前24小时操作，给其他患者就医机会</p>
                </div>
              </template>
            </el-alert>
          </div>

          <!-- 底部操作区 -->
          <div class="action-bar">
            <el-button plain size="large" @click="backToCheck">
              <el-icon>
                <ArrowLeft />
              </el-icon>返回修改
            </el-button>
            <el-button type="primary" size="large" :loading="submitBnt === '正在提交...'" :disabled="!patient.id"
              @click="submitOrder">
              <el-icon v-if="submitBnt !== '正在提交...'">
                <Check />
              </el-icon>
              {{ submitBnt }}
            </el-button>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.hospital-page {
  min-height: 100vh;
  background-color: var(--el-bg-color-page);
}

.hospital-hero {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 80px 0 40px 0;
  color: white;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

.hospital-basic {
  text-align: center;
}

.hospital-title {
  font-size: 24px;
  margin: 0 0 16px;
}

.hospital-tags {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: -20px auto 40px;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.progress-card {
  padding: 24px;
}

.booking-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.section {
  padding: 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.section:last-child {
  border-bottom: none;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.patient-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.patient-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.patient-card:hover {
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.patient-card.active {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary);
}

.patient-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 500;
}

.patient-info {
  flex: 1;
}

.patient-name {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.patient-details {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.info-descriptions {
  margin-top: 16px;
}

.date-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date {
  font-weight: 500;
  color: var(--el-color-primary);
}

.week {
  color: var(--el-text-color-secondary);
}

.doctor-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price {
  color: #f56c6c;
  font-weight: 500;
  font-size: 16px;
}

.notice-alert {
  margin-top: 16px;
}

.notice-list {
  font-size: 14px;
  line-height: 1.8;
  color: #7d7d7d;
}

.action-bar {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
}

@media screen and (max-width: 768px) {
  .patient-grid {
    grid-template-columns: 1fr;
  }

  .section {
    padding: 16px;
  }

  .info-descriptions {
    margin-top: 12px;
  }
}
</style>
