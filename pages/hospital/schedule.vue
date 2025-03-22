<template>
  <!-- 医院排班页面 -->
  <div class="nav-container page-component">
    <!-- 左侧导航栏 -->
    <div class="nav left-nav">
      <div class="nav-item">
        <NuxtLink :to="`/hospital/${hoscode}`" class="v-link clickable dark">预约挂号</NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink :to="`/hospital/detail/${hoscode}`" class="v-link clickable dark">医院详情</NuxtLink>
      </div>
      <div class="nav-item">
        <NuxtLink :to="`/hospital/notice/${hoscode}`" class="v-link clickable dark">预约须知</NuxtLink>
      </div>
      <div class="nav-item">
        <span class="v-link clickable dark">停诊信息</span>
      </div>
      <div class="nav-item">
        <span class="v-link clickable dark">查询/取消</span>
      </div>
    </div>
    <!-- 左侧导航结束 -->

    <!-- 右侧内容区域 -->
    <div class="page-container">
      <div class="hospital-source-list">
        <!-- 医院名称和科室显示 -->
        <div class="header-wrapper" style="justify-content:normal">
          <span class="v-link clickable" @click="show()">{{ baseMap.hosname }}</span>
          <div class="split"></div>
          <div>{{ baseMap.bigname }}</div>
        </div>
        <div class="title mt20">{{ baseMap.depname }}</div>

        <!-- 日期选择区域 -->
        <div class="mt60">
          <div class="title-wrapper">{{ baseMap.workDateString }}</div>
          <div class="calendar-list-wrapper">
            <!-- 日期列表，动态添加样式 -->
            <div v-for="(item, index) in bookingScheduleList" :key="item.id" :class="'calendar-item ' + item.curClass"
              style="width: 124px;" @click="selectDate(item, index)">
              <div class="date-wrapper">
                <span>{{ item.workDate }}</span>
                <span class="week">{{ item.dayOfWeek }}</span>
              </div>
              <div class="status-wrapper" v-if="item.status == 0">{{ item.availableNumber == -1 ? '无号' :
                item.availableNumber == 0 ? '约满' : '有号' }}</div>
              <div class="status-wrapper" v-if="item.status == 1">即将放号</div>
              <div class="status-wrapper" v-if="item.status == -1">停止挂号</div>
            </div>
          </div>

          <!-- 分页控件 -->
          <el-pagination class="pagination" layout="prev, pager, next" :current-page="page" :total="total"
            :page-size="limit" @current-change="getPage">
          </el-pagination>
        </div>

        <!-- 即将放号倒计时区域 -->
        <div class="countdown-wrapper mt60" v-if="!tabShow">
          <div class="countdonw-title">{{ time }}<span class="v-link selected">{{ baseMap.releaseTime }}</span>放号</div>
          <div class="countdown-text">
            倒 计 时
            <div>
              <span class="number">{{ timeString }}</span>
            </div>
          </div>
        </div>

        <!-- 上午号源列表 -->
        <div class="mt60" v-if="tabShow">
          <div class="">
            <div class="list-title">
              <div class="block"></div>
              上午号源
            </div>
            <div v-for="item in morningSchedules" :key="item.id">
              <div class="list-item">
                <div class="item-wrapper">
                  <div class="title-wrapper">
                    <div class="title">{{ item.title }}</div>
                    <div class="split"></div>
                    <div class="name">{{ item.docname }}</div>
                  </div>
                  <div class="special-wrapper">{{ item.skill }}</div>
                </div>
                <div class="right-wrapper">
                  <div class="fee">￥{{ item.amount }}</div>
                  <div class="button-wrapper">
                    <div class="v-button" @click="booking(item.id, item.availableNumber)"
                      :style="item.availableNumber == 0 || pageFirstStatus == -1 ? 'background-color: #7f828b;' : ''">
                      <span>剩余<span class="number">{{ item.availableNumber }}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 下午号源列表 -->
        <div class="mt60" v-if="tabShow">
          <div class="">
            <div class="list-title">
              <div class="block"></div>
              下午号源
            </div>
            <div v-for="item in afternoonSchedules" :key="item.id">
              <div class="list-item">
                <div class="item-wrapper">
                  <div class="title-wrapper">
                    <div class="title">{{ item.title }}</div>
                    <div class="split"></div>
                    <div class="name">{{ item.docname }}</div>
                  </div>
                  <div class="special-wrapper">{{ item.skill }}</div>
                </div>
                <div class="right-wrapper">
                  <div class="fee">￥{{ item.amount }}</div>
                  <div class="button-wrapper">
                    <div class="v-button" @click="booking(item.id, item.availableNumber)"
                      :style="item.availableNumber == 0 || pageFirstStatus == -1 ? 'background-color: #7f828b;' : ''">
                      <span>剩余<span class="number">{{ item.availableNumber }}</span></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- 右侧内容区域结束 -->
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useApi } from '~/composables' // 修复导入路径
import { useRoute, useRouter } from 'nuxt/app'
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useHead } from '#imports'

/**
 * 导入样式文件
 */
useHead({
  link: [
    { rel: 'stylesheet', href: '/css/hospital_personal.css' },
    { rel: 'stylesheet', href: '/css/hospital.css' }
  ]
})

/**
 * 初始化API和路由
 */
const api = useApi()
const route = useRoute()
const router = useRouter()

/**
 * 页面状态数据
 */
// 医院与科室编码
const hoscode = ref('')
const depcode = ref('')
const workDate = ref('')

// 排班相关数据
const bookingScheduleList = ref<any[]>([])
const scheduleList = ref<any[]>([])
const baseMap = ref<any>({})

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

/**
 * 计算属性：过滤上下午排班数据
 */
// 上午排班列表（workTime === 0）
const morningSchedules = computed(() =>
  scheduleList.value.filter(item => item.workTime === 0)
)

// 下午排班列表（workTime === 1）
const afternoonSchedules = computed(() =>
  scheduleList.value.filter(item => item.workTime === 1)
)

/**
 * 生命周期钩子
 */
// 组件挂载时初始化数据
onMounted(() => {
  hoscode.value = route.params.hoscode as string || '1000_0'
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

/**
 * 获取可预约排班分页数据
 * 加载医院科室的排班信息
 */
const getBookingScheduleRule = async () => {
  try {
    const { data } = await api.hospital.getBookingScheduleRule(
      page.value,
      limit.value,
      hoscode.value,
      depcode.value
    )

    if (data.value) {
      // 类型断言确保TypeScript正确识别数据结构
      const responseData = data.value as {
        bookingScheduleList: any[]
        total: number
        baseMap: Record<string, any>
      }

      bookingScheduleList.value = responseData.bookingScheduleList
      total.value = responseData.total
      baseMap.value = responseData.baseMap

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
  } catch (error) {
    ElMessage.error('获取排班数据失败')
    console.error(error)
  }
}

/**
 * 处理排班项的样式类
 * 根据状态和选中情况动态添加CSS类
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
 * 获取排班信息详情
 * 根据选中日期加载具体医生排班
 */
const findScheduleList = async () => {
  try {
    const { data } = await api.hospital.findScheduleList(
      hoscode.value,
      depcode.value,
      workDate.value
    )

    if (data.value) {
      scheduleList.value = data.value as any[]
    }
  } catch (error) {
    ElMessage.error('获取排班详情失败')
    console.error(error)
  }
}

/**
 * 选择日期
 * @param item 选中的日期项
 * @param index 索引
 */
const selectDate = (item: any, index: number) => {
  workDate.value = item.workDate
  activeIndex.value = index

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
</script>

<style scoped>
/* 可以添加页面的样式定义，或者依赖外部CSS */
</style>
