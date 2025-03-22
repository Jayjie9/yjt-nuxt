<template>
  <div class="hospital-page">
    <div class="nav-container page-component">
      <!-- 左侧导航 -->
      <div class="nav left-nav">
        <div class="nav-item">
          <NuxtLink :to="`/hospital/${hospital.hoscode}`" class="v-link clickable dark">预约挂号</NuxtLink>
        </div>
        <div class="nav-item">
          <NuxtLink :to="`/hospital/detail/${hospital.hoscode}`" class="v-link clickable dark">医院详情</NuxtLink>
        </div>
        <div class="nav-item selected">
          <NuxtLink :to="`/hospital/notice/${hospital.hoscode}`" class="v-link selected dark">预约须知</NuxtLink>
        </div>
        <div class="nav-item">
          <span class="v-link clickable dark">停诊信息</span>
        </div>
        <div class="nav-item">
          <span class="v-link clickable dark">查询/取消</span>
        </div>
      </div>

      <!-- 右侧内容 -->
      <div class="page-container">
        <div class="notice-container">
          <div class="common-header">
            <div class="title-wrapper">
              <span class="hospital-title">{{ hospital.hosname }}</span>
              <div class="icon-wrapper">
                <el-tag size="small" type="primary">{{ hospital.param.hostypeString }}</el-tag>
              </div>
            </div>
          </div>
          
          <div class="notice-wrapper">
            <h2 class="section-title">预约须知</h2>
            <div class="notice-content">
              <div class="notice">
                <h3 class="notice-title">挂号规则</h3>
                <div class="rule" v-for="(item, index) in bookingRule.rule" :key="index">
                  <div class="rule-title">{{ item.title }}</div>
                  <div class="rule-content">{{ item.content }}</div>
                </div>
              </div>
              
              <div class="notice">
                <h3 class="notice-title">停挂时间</h3>
                <div class="rule">
                  <div class="rule-content">{{ bookingRule.stopTime }}</div>
                </div>
              </div>
              
              <div class="notice">
                <h3 class="notice-title">退号规则</h3>
                <div class="rule">
                  <div class="rule-content">{{ bookingRule.quitDay === 0 
                    ? '当天预约不可取消' 
                    : `${bookingRule.quitTime}前可以取消，预约${bookingRule.quitDay}天前不可取消` }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { useApi } from '~/composables'
import { useRoute } from 'nuxt/app'

// 导入样式
useHead({
  link: [
    { rel: 'stylesheet', href: '/css/hospital_personal.css' },
    { rel: 'stylesheet', href: '/css/hospital.css' }
  ]
})

// 获取API
const api = useApi()
const route = useRoute()

// 响应式数据
const hoscode = ref('')
const hospital = ref<any>({
  param: {}
})
const bookingRule = ref<any>({
  rule: []
})

// 获取医院代码和初始化
onMounted(() => {
  hoscode.value = route.params.hoscode as string || '1000_0'
  init()
})

// 初始化数据
const init = async () => {
  try {
    // 获取医院详情
    const { data: hospitalData } = await api.hospital.findHospDetail(hoscode.value)
    if (hospitalData.value) {
      hospital.value = hospitalData.value.hospital
      bookingRule.value = hospitalData.value.bookingRule
    }
  } catch (error) {
    ElMessage.error('获取医院信息失败')
    console.error(error)
  }
}
</script>

<style scoped>
.hospital-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.hospital-title {
  font-size: 1.5rem;
  font-weight: bold;
  color: #303133;
  margin-right: 10px;
}

.section-title {
  font-size: 1.2rem;
  font-weight: 600;
  color: #409EFF;
  margin: 30px 0 20px 0;
  position: relative;
  padding-left: 12px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 5px;
  height: 16px;
  width: 4px;
  background-color: #409EFF;
  border-radius: 2px;
}

.notice-wrapper {
  margin-top: 20px;
}

.notice-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.notice {
  margin-bottom: 30px;
}

.notice:last-child {
  margin-bottom: 0;
}

.notice-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: #303133;
  margin-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

.rule {
  margin-bottom: 15px;
}

.rule:last-child {
  margin-bottom: 0;
}

.rule-title {
  font-weight: 500;
  color: #606266;
  margin-bottom: 5px;
}

.rule-content {
  color: #606266;
  line-height: 1.6;
}
</style> 