<template>
  <!-- header -->
  <div class="nav-container page-component">
    <!--左侧导航 #start -->
    <div class="nav left-nav">
      <div class="nav-item selected">
        <NuxtLink :to="`/hospital/${schedule.hoscode}`" class="v-link selected dark">预约挂号</NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink :to="`/hospital/detail/${schedule.hoscode}`" class="v-link clickable dark">医院详情</NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink :to="`/hospital/notice/${schedule.hoscode}`" class="v-link clickable dark">预约须知</NuxtLink>
      </div>
      <div class="nav-item">
        <span class="v-link clickable dark">停诊信息</span>
      </div>
      <div class="nav-item">
        <span class="v-link clickable dark">查询/取消</span>
      </div>
    </div>
    <!-- 左侧导航 #end -->

    <!-- 右侧内容 #start -->
    <div class="page-container">
      <div class="hospital-order">
        <div class="header-wrapper">
          <div class="title mt20"> 确认挂号信息</div>
          <div>
            <div class="sub-title">
              <div class="block"></div>
              选择就诊人：
            </div>
            <div class="patient-wrapper">
              <div class="patient-list">
                <div v-for="(item, index) in patientList" :key="item.id" class="inline" @click="selectPatient(index)"
                  style="margin-right: 10px;">
                  <el-card :class="['item-wrapper', activeIndex === index ? 'selected' : '']" shadow="hover">
                    <div>
                      <div class="item-title">{{ item.name }}</div>
                      <div>{{ item.param.certificatesTypeString }}</div>
                      <div>{{ item.certificatesNo }}</div>
                    </div>
                    <el-icon v-if="activeIndex === index" class="checked">
                      <Check />
                    </el-icon>
                  </el-card>
                </div>
              </div>
              <div class="add-patient-btn">
                <el-button @click="addPatient" type="primary" plain icon="Plus">添加就诊人</el-button>
              </div>
              <div class="el-loading-mask" style="display: none;">
                <div class="el-loading-spinner">
                  <svg viewBox="25 25 50 50" class="circular">
                    <circle cx="50" cy="50" r="20" fill="none" class="path"></circle>
                  </svg>
                </div>
              </div>
            </div>
            <!-- 就诊人，选中显示 -->
            <div class="sub-title" v-if="patientList.length > 0">
              <div class="block"></div>
              选择就诊卡： <span class="card-tips"><span class="iconfont"></span> 如您持社保卡就诊，请务必选择医保预约挂号，以保证正常医保报销</span>
            </div>

            <el-card class="patient-card" shadow="hover" v-if="patientList.length > 0">
              <template #header>
                <div class="clearfix">
                  <span class="name">
                    {{ patient.name }} {{ patient.certificatesNo }} 居民身份证
                  </span>
                </div>
              </template>
              <div class="card-type">
                <el-tag :type="patient.isInsure === 0 ? 'info' : 'success'">
                  {{ patient.isInsure === 0 ? '自费' : '医保' }}
                </el-tag>
                <span class="card-no">{{ patient.certificatesNo }}</span>
                <span class="card-view">居民身份证</span>
              </div>
            </el-card>

            <div class="section">
              <div class="section-title">
                <div class="block"></div>挂号信息
              </div>
              <div class="content-wrapper">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="就诊日期">
                    {{ schedule.workDate }} {{ schedule.param.dayOfWeek }} {{ schedule.workTime === 0 ? '上午' : '下午' }}
                  </el-descriptions-item>
                  <el-descriptions-item label="就诊医院">
                    {{ schedule.param.hosname }}
                  </el-descriptions-item>
                  <el-descriptions-item label="就诊科室">
                    {{ schedule.param.depname }}
                  </el-descriptions-item>
                  <el-descriptions-item label="医生姓名">
                    {{ schedule.docname }}
                  </el-descriptions-item>
                  <el-descriptions-item label="医生职称">
                    {{ schedule.title }}
                  </el-descriptions-item>
                  <el-descriptions-item label="医生专长">
                    {{ schedule.skill }}
                  </el-descriptions-item>
                  <el-descriptions-item label="医事服务费">
                    <div class="fee">{{ schedule.amount }}元</div>
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>

            <!-- 用户信息 -->
            <div class="section">
              <div class="section-title">
                <div class="block"></div>用户信息
              </div>
              <div class="content-wrapper">
                <el-descriptions :column="1" border>
                  <el-descriptions-item label="就诊人手机号">
                    {{ patient.phone }}
                  </el-descriptions-item>
                </el-descriptions>
              </div>
            </div>
            <div class="bottom-wrapper">
              <el-button type="primary" class="submit-btn" size="large" :loading="submitBnt === '正在提交...'"
                @click="submitOrder">
                {{ submitBnt }}
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 右侧内容 #end -->
  </div>
  <!-- footer -->
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Check } from '@element-plus/icons-vue'
import { useApi } from '~/composables'
import { useRoute, useRouter } from 'nuxt/app'
import { ref, computed, onMounted } from 'vue'
import { useHead } from '#imports'

// 导入样式
useHead({
  link: [
    { rel: 'stylesheet', href: '/css/hospital_personal.css' },
    { rel: 'stylesheet', href: '/css/hospital.css' }
  ]
})

// 获取API和路由
const api = useApi()
const route = useRoute()
const router = useRouter()

// 页面数据
const scheduleId = ref('')
const schedule = ref<any>({
  param: {}
})
const patientList = ref<any[]>([])
const patient = ref<any>({})
const activeIndex = ref(0)
const submitBnt = ref('确认挂号')

// 初始化
onMounted(() => {
  scheduleId.value = route.query.scheduleId as string
  init()
})

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

// 根据ID获取排班信息
const getSchedule = async () => {
  try {
    const { data } = await api.hospital.getSchedule(scheduleId.value)
    if (data.value) {
      schedule.value = data.value
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
      patientList.value = data.value
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
    const { data } = await api.order.submitOrder(scheduleId.value, patient.value.id)
    if (data.value) {
      ElMessage.success('预约成功')
      router.push(`/order/show?orderId=${data.value}`)
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
</script>

<style scoped>
.hospital-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 30px;
  color: #303133;
}

.section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: #606266;
  margin-bottom: 15px;
}

.block {
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 10px;
  border-radius: 2px;
}

.patient-wrapper {
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 20px;
}

.patient-list {
  display: flex;
  flex-wrap: wrap;
  flex: 1;
}

.inline {
  cursor: pointer;
}

.item-wrapper {
  position: relative;
  padding: 15px;
  width: 220px;
  min-height: 120px;
  transition: all 0.3s;
}

.item-wrapper:hover {
  transform: translateY(-2px);
}

.item-wrapper.selected {
  border-color: #409EFF;
  background-color: #ecf5ff;
}

.item-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 10px;
  color: #303133;
}

.checked {
  position: absolute;
  right: 10px;
  top: 10px;
  color: #409EFF;
  font-size: 20px;
}

.add-patient-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.card-tips {
  margin-left: 10px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
}

.card-tips .el-icon {
  margin-right: 5px;
  color: #E6A23C;
}

.patient-card {
  margin-bottom: 20px;
}

.patient-card .name {
  font-weight: bold;
  color: #303133;
}

.card-type {
  display: flex;
  align-items: center;
}

.card-no {
  margin-left: 10px;
  font-weight: 500;
  color: #606266;
}

.card-view {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}

.content-wrapper {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.fee {
  color: #f56c6c;
  font-weight: bold;
  font-size: 16px;
}

.bottom-wrapper {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.submit-btn {
  min-width: 200px;
  padding: 15px 30px;
  font-size: 16px;
}
</style>
