<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useApi } from '~/composables'
import { useRoute, useRouter } from 'nuxt/app'
import { useHead } from '#imports'
import { Sunset, Sunrise, Clock, CircleClose, Loading } from '@element-plus/icons-vue'
import type { BookingSchedule, BaseMap, BookingScheduleResponse } from '~/types/schedule'
import type { DoctorSchedule } from '~/types/schedule'

useHead({
  link: [
    { rel: 'stylesheet', href: '/css/hospital_personal.css' },
    { rel: 'stylesheet', href: '/css/hospital.css' }
  ]
})

const api = useApi()
const route = useRoute()
const router = useRouter()

// 医院与科室编码
const hoscode = ref('')
const depcode = ref('')
const workDate = ref('')

// 排班相关数据
const bookingScheduleList = ref<BookingSchedule[]>([])
const scheduleList = ref<DoctorSchedule[]>([])
const baseMap = ref<BaseMap>({} as BaseMap)

// 页面状态控制
const tabShow = ref(true)
const activeIndex = ref(0)
const page = ref(1)
const limit = ref(7)
const total = ref(1)
const timeString = ref('')
const time = ref('今天')
const timer = ref<any>(null)
const pageFirstStatus = ref(0)
const loading = ref(true)
// 计算属性：过滤上下午排班数据
// 上午排班列表（workTime === 0）
const morningSchedules = computed(() =>
  scheduleList.value.filter(item => item.workTime === 0)
)
// 下午排班列表（workTime === 1）
const afternoonSchedules = computed(() =>
  scheduleList.value.filter(item => item.workTime === 1)
)

// 添加展开收起控制
const morningExpanded = ref(false)
const afternoonExpanded = ref(false)
const initialDisplayCount = 6

// 计算显示的排班列表
const displayMorningSchedules = computed(() => {
  return morningExpanded.value
    ? morningSchedules.value
    : morningSchedules.value.slice(0, initialDisplayCount)
})

const displayAfternoonSchedules = computed(() => {
  return afternoonExpanded.value
    ? afternoonSchedules.value
    : afternoonSchedules.value.slice(0, initialDisplayCount)
})

/**
 * 获取可预约排班分页数据: 加载医院科室的排班信息
 */
const getBookingScheduleRule = async () => {
  loading.value = true
  try {
    const { data } = await api.hospital.getBookingScheduleRule(
      page.value,
      limit.value,
      hoscode.value,
      depcode.value
    )

    if (data.value) {
      const response = data.value as BookingScheduleResponse
      if (response.code === 200) {
        bookingScheduleList.value = response.data.bookingScheduleList
        total.value = response.data.total
        baseMap.value = response.data.baseMap
        // 处理排班项样式
        dealClass()
        // 分页后workDate为空，默认选中第一个
        if (!workDate.value && bookingScheduleList.value.length > 0) {
          workDate.value = bookingScheduleList.value[0].workDate
        }
        // 判断当天是否停止预约 status == -1 表示停止预约
        if (workDate.value === getCurDate() && bookingScheduleList.value.length > 0) {
          pageFirstStatus.value = bookingScheduleList.value[0].status
        } else {
          pageFirstStatus.value = 0
        }
        // 获取排班详情
        findScheduleList()
      }
    }
  } catch (error) {
    ElMessage.error('获取排班数据失败')
    console.error(error)
  }
}

/**
 * 获取排班信息详情: 根据选中日期加载具体医生排班
 */
const findScheduleList = async () => {
  try {
    const { data } = await api.hospital.findScheduleList(
      hoscode.value,
      depcode.value,
      workDate.value
    )

    if (data.value) {
      scheduleList.value = data.value.data as DoctorSchedule[]
      // console.log("排班列表数据:", JSON.stringify(scheduleList.value, null, 2))
    }
  } catch (error) {
    ElMessage.error('获取排班详情失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

/**
 * 处理排班项的样式类: 根据状态和选中情况动态添加CSS类
 */
const dealClass = () => {
  bookingScheduleList.value.forEach(item => {
    // 设置自定义样式类
    let curClass = 'calendar-item'

    // 判断是否已选中
    const index = bookingScheduleList.value.findIndex(i => i.workDate === workDate.value)
    if (index !== -1 && item.workDate === workDate.value) {
      curClass += ' selected'
    }

    // 根据号源状态设置样式
    if (item.availableNumber === -1) {
      curClass += ' gray space'
    } else if (item.availableNumber === 0) {
      curClass += ' gray'
    } else {
      curClass += ' small small-space'
    }

    // 将样式类赋值给item
    item.curClass = curClass
  })
}
/**
 * 分页操作处理
 * @param pageNum 页码
 */
const getPage = (pageNum = 1) => {
  page.value = pageNum
  workDate.value = ''
  activeIndex.value = 0
  getBookingScheduleRule()
}
// 获取状态样式类
const getStatusClass = (item: BookingSchedule) => {
  if (item.status === -1) return 'disabled'
  if (item.status === 1) return 'upcoming'
  if (item.availableNumber === -1) return 'disabled'
  if (item.availableNumber === 0) return 'full'
  return 'available'
}

/**
 * 选择日期
 * @param item 选中的日期项
 * @param index 索引
 */
const selectDate = (item: any, index: number) => {
  // console.log("------scheduleList.value-------:" + scheduleList.value);

  workDate.value = item.workDate
  activeIndex.value = index
  loading.value = true

  // 清理定时器
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }

  // 判断是否是即将放号状态
  if (item.status === 1) {
    tabShow.value = false
    // 放号时间
    const releaseTime = new Date(`${getCurDate()} ${baseMap.value.releaseTime}`).getTime()
    const nowTime = new Date().getTime()
    countDown(releaseTime, nowTime)
    dealClass()
  } else {
    tabShow.value = true
    getBookingScheduleRule()
  }
}

/**
 * 倒计时功能
 * @param releaseTime 放号时间的时间戳
 * @param nowTime 当前时间的时间戳
 */
const countDown = (releaseTime: number, nowTime: number) => {
  // 计算剩余时间
  let seconds = Math.floor((releaseTime - nowTime) / 1000)

  if (seconds <= 0) {
    timeString.value = "已开始"
    // 重新获取数据
    getBookingScheduleRule()
    return
  }

  // 更新剩余时间显示
  updateTimeString(seconds)

  // 启动定时器
  timer.value = setInterval(() => {
    seconds--
    if (seconds <= 0) {
      clearInterval(timer.value)
      timeString.value = "已开始"
      // 重新获取数据
      getBookingScheduleRule()
      return
    }
    updateTimeString(seconds)
  }, 1000)
}

/**
 * 更新时间字符串显示
 * 将秒数转换为时:分:秒格式
 * @param seconds 剩余秒数
 */
const updateTimeString = (seconds: number) => {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60
  timeString.value = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * 获取当前日期字符串
 * @returns 格式化的日期字符串 YYYY-MM-DD
 */
const getCurDate = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = (now.getMonth() + 1).toString().padStart(2, '0')
  const day = now.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * 跳转到预约页面
 * @param scheduleId 排班ID
 * @param availableNumber 可用号源数
 */
const booking = (scheduleId: string, availableNumber: number) => {
  // 检查是否还有号
  if (availableNumber === 0) {
    ElMessage.warning('已约满')
    return
  }

  // 检查当前状态
  if (pageFirstStatus.value === -1) {
    ElMessage.warning('停止挂号')
    return
  }

  // 跳转到预约页面
  router.push(`/hospital/booking?scheduleId=${scheduleId}`)
}

/**
 * 返回医院主页
 */
const show = () => {
  router.push(`/hospital/${hoscode.value}`)
}

// 组件挂载时初始化数据
onMounted(() => {
  hoscode.value = route.query.hoscode as string
  depcode.value = route.query.depcode as string
  workDate.value = getCurDate()
  getBookingScheduleRule()
})

// 组件卸载时清除定时器
onUnmounted(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})
</script>

<template>
  <div class="hospital-page">
    <!-- 医院头部信息区 -->
    <div class="hospital-hero">
      <div class="hero-content">
        <div class="hospital-basic">
          <!-- 添加骨架屏加载效果 -->
          <template v-if="loading">
            <div class="loading-container">
              <el-icon class="loading-icon">
                <Loading />
              </el-icon>
              <span class="loading-text">加载中...</span>
            </div>
          </template>
          <!-- 实际内容 -->
          <template v-else>
            <h1 class="hospital-title" @click="show">{{ baseMap.hosname }}</h1>
            <div class="hospital-tags">
              <el-tag size="large" type="primary" effect="plain">{{ baseMap.bigname }}</el-tag>
              <el-tag size="large" type="danger" effect="plain">{{ baseMap.depname }}</el-tag>
            </div>
          </template>
        </div>
      </div>
    </div>

    <div class="main-content">
      <!-- 排班日历卡片 -->
      <el-card class="schedule-calendar">
        <template #header>
          <div class="card-header">
            <h3>选择就诊日期</h3>
            <div class="schedule-info">
              <span class="info-item">
                <el-icon>
                  <Clock />
                </el-icon>
                放号时间：{{ baseMap.releaseTime }}
              </span>
              <span class="info-item">
                <el-icon>
                  <CircleClose />
                </el-icon>
                停止挂号：{{ baseMap.stopTime }}
              </span>
            </div>
          </div>
        </template>

        <div class="schedule-list">
          <div v-for="(item, index) in bookingScheduleList" :key="item.workDate" class="schedule-item" :class="[
            getStatusClass(item),
            { 'active': workDate === item.workDate }
          ]" @click="selectDate(item, index)">
            <div class="date-info">
              <span class="date">{{ item.workDateMd }}</span>
              <span class="week">{{ item.dayOfWeek }}</span>
            </div>
            <div class="status-badge" :class="getStatusClass(item)">
              <template v-if="item.status === 0">
                {{ item.availableNumber === -1 ? '无号' : item.availableNumber === 0 ? '约满' : '有号' }}
              </template>
              <template v-else-if="item.status === 1">即将放号</template>
              <template v-else-if="item.status === -1">停止挂号</template>
            </div>
          </div>
        </div>

        <el-pagination class="pagination" background layout="prev, pager, next" :current-page="page" :total="total"
          :page-size="limit" @current-change="getPage">
        </el-pagination>
      </el-card>

      <!-- 即将放号倒计时区域 -->
      <div v-if="!tabShow" class="countdown-card">
        <el-result icon="warning" title="即将放号">
          <template #extra>
            <div class="countdown-info">
              <p class="release-time">{{ baseMap.releaseTime }} 放号</p>
              <div class="countdown-timer">{{ timeString }}</div>
            </div>
          </template>
        </el-result>
      </div>

      <!-- 排班列表区域 -->
      <template v-if="tabShow">
        <!-- 上午排班 -->
        <el-card class="schedule-period">
          <template #header>
            <div class="period-header">
              <div class="period-title">
                <el-icon>
                  <Sunrise />
                </el-icon>
                <span>上午号源</span>
              </div>
              <div class="period-actions">
                <el-tag type="info">共 {{ morningSchedules.length }} 个号源</el-tag>
                <el-button v-if="morningSchedules.length > initialDisplayCount" link
                  @click="morningExpanded = !morningExpanded">
                  {{ morningExpanded ? '收起' : '展开' }}
                  <el-icon class="expand-icon" :class="{ 'is-expanded': morningExpanded }">
                    <ArrowDown />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </template>

          <div v-if="loading" class="schedule-cards">
            <el-skeleton :rows="3" animated />
          </div>

          <el-empty v-else-if="morningSchedules.length === 0" description="暂无号源" />

          <div v-else class="schedule-cards">
            <div v-for="item in displayMorningSchedules" :key="item.id" class="schedule-card"
              :class="{ 'disabled': item.availableNumber === 0 }">
              <div class="doctor-info">
                <div class="doctor-header">
                  <span class="doctor-name">{{ item.docname }}</span>
                  <el-tag size="small" type="success">{{ item.title }}</el-tag>
                </div>
                <div class="doctor-skill">{{ item.skill }}</div>
              </div>
              <div class="booking-info">
                <div class="price">￥{{ item.amount }}</div>
                <el-button type="primary" :disabled="item.availableNumber === 0"
                  @click="booking(item.id, item.availableNumber)">
                  剩余 {{ item.availableNumber }} 号
                </el-button>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 下午排班 -->
        <el-card class="schedule-period">
          <template #header>
            <div class="period-header">
              <div class="period-title">
                <el-icon>
                  <Sunset />
                </el-icon>
                <span>下午号源</span>
              </div>
              <div class="period-actions">
                <el-tag type="info">共 {{ afternoonSchedules.length }} 个号源</el-tag>
                <el-button v-if="afternoonSchedules.length > initialDisplayCount" link
                  @click="afternoonExpanded = !afternoonExpanded">
                  {{ afternoonExpanded ? '收起' : '展开' }}
                  <el-icon class="expand-icon" :class="{ 'is-expanded': afternoonExpanded }">
                    <ArrowDown />
                  </el-icon>
                </el-button>
              </div>
            </div>
          </template>

          <!-- 下午排班列表使用相同的逻辑 -->
          <div v-if="loading" class="schedule-cards">
            <el-skeleton :rows="3" animated />
          </div>

          <el-empty v-else-if="afternoonSchedules.length === 0" description="暂无号源" />

          <div v-else class="schedule-cards">
            <div v-for="item in displayAfternoonSchedules" :key="item.id" class="schedule-card"
              :class="{ 'disabled': item.availableNumber === 0 }">
              <div class="doctor-info">
                <div class="doctor-header">
                  <span class="doctor-name">{{ item.docname }}</span>
                  <el-tag size="small" type="success">{{ item.title }}</el-tag>
                </div>
                <div class="doctor-skill">{{ item.skill }}</div>
              </div>
              <div class="booking-info">
                <div class="price">￥{{ item.amount }}</div>
                <el-button type="primary" :disabled="item.availableNumber === 0"
                  @click="booking(item.id, item.availableNumber)">
                  剩余 {{ item.availableNumber }} 号
                </el-button>
              </div>
            </div>
          </div>
        </el-card>
      </template>
    </div>
  </div>
</template>

<style scoped>
.period-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.expand-icon {
  transition: transform 0.3s ease;
}

.expand-icon.is-expanded {
  transform: rotate(180deg);
}

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

/* 头部信息 加载动画 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.loading-icon {
  font-size: 32px;
  color: white;
  animation: rotate 1s linear infinite;
}

.loading-text {
  color: white;
  font-size: 16px;
  opacity: 0.8;
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

/* 医院标题 科室标签*/
.hospital-title {
  font-size: 28px;
  margin: 0 0 16px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.hospital-title:hover {
  opacity: 0.8;
}

.hospital-tags {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* 主要内容区域 */
.main-content {
  max-width: 1200px;
  margin: -30px auto 40px;
  padding: 0 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 日历卡片样式 */
.schedule-calendar {
  background: white;
  border-radius: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.schedule-info {
  display: flex;
  gap: 20px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
}

.schedule-list {
  display: flex;
  gap: 12px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.schedule-item {
  width: 120px;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--el-border-color);
  cursor: pointer;
  transition: all 0.3s;
  text-align: center;
}

.schedule-item:hover:not(.disabled) {
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
}

.schedule-item.active {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}

.date-info {
  margin-bottom: 12px;
}

.date {
  display: block;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 4px;
}

.week {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.status-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 14px;
}

.status-badge.available {
  background-color: var(--el-color-success-light-9);
  color: var(--el-color-success);
}

.status-badge.full {
  background-color: var(--el-color-warning-light-9);
  color: var(--el-color-warning);
}

.status-badge.disabled {
  background-color: var(--el-color-info-light-9);
  color: var(--el-text-color-secondary);
}

.status-badge.upcoming {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

/* 倒计时样式 */
.countdown-card {
  text-align: center;
  padding: 40px 0;
}

.countdown-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.release-time {
  font-size: 18px;
  color: var(--el-text-color-primary);
  margin: 0;
}

.countdown-timer {
  font-size: 36px;
  font-weight: 600;
  color: var(--el-color-danger);
}

/* 排班列表样式 */
.schedule-period {
  margin-bottom: 24px;
}

.period-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.period-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
}

.schedule-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.schedule-card {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
}

.schedule-card:hover:not(.disabled) {
  border-color: var(--el-color-primary);
  transform: translateY(-2px);
}

.schedule-card.disabled {
  opacity: 0.7;
  background-color: var(--el-fill-color-lighter);
}

.doctor-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.doctor-name {
  font-size: 16px;
  font-weight: 500;
}

.doctor-skill {
  color: var(--el-text-color-secondary);
  font-size: 14px;
  margin-bottom: 16px;
  line-height: 1.4;
}

.booking-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.price {
  color: var(--el-color-danger);
  font-size: 18px;
  font-weight: 500;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .hero-content {
    padding: 0 16px;
  }

  .main-content {
    padding: 0 16px;
  }

  .schedule-list {
    gap: 8px;
  }

  .schedule-item {
    width: calc(33.33% - 6px);
    padding: 12px;
  }

  .schedule-cards {
    grid-template-columns: 1fr;
  }
}
</style>