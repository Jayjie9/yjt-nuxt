<template>
  <div class="hospital-page">
    <div class="nav-container page-component">
      <!-- 左侧导航 -->
      <div class="nav left-nav">
        <div class="nav-item">
          <NuxtLink :to="`/hospital/${hospital.hoscode}`" class="v-link clickable dark">预约挂号</NuxtLink>
        </div>
        <div class="nav-item selected">
          <NuxtLink :to="`/hospital/detail/${hospital.hoscode}`" class="v-link selected dark">医院详情</NuxtLink>
        </div>
        <div class="nav-item">
          <NuxtLink :to="`/hospital/notice/${hospital.hoscode}`" class="v-link clickable dark">预约须知</NuxtLink>
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
        <div class="hospital-detail">
          <div class="common-header">
            <div class="title-wrapper">
              <span class="hospital-title">{{ hospital.hosname }}</span>
              <div class="icon-wrapper">
                <el-tag size="small" type="primary">{{ hospital.param.hostypeString }}</el-tag>
              </div>
            </div>
          </div>
          
          <div class="info-wrapper">
            <el-image 
              class="hospital-img" 
              :src="hospital.logoData ? `data:image/jpeg;base64,${hospital.logoData}` : ''" 
              :alt="hospital.hosname" 
              fit="cover" />
              
            <div class="content-wrapper">
              <div class="location">
                <el-icon><Location /></el-icon>
                <span>{{ hospital.route }}</span>
              </div>
            </div>
          </div>
          
          <h2 class="section-title">医院介绍</h2>
          <div class="hospital-intro">
            <p>{{ hospital.intro }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Location } from '@element-plus/icons-vue'
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

.hospital-img {
  width: 100px;
  height: 100px;
  border-radius: 4px;
  object-fit: cover;
  margin-right: 20px;
  border: 1px solid #ebeef5;
}

.info-wrapper {
  display: flex;
  padding: 20px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  margin-top: 20px;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.location {
  display: flex;
  align-items: center;
  color: #606266;
}

.location .el-icon {
  margin-right: 8px;
  color: #409EFF;
}

.hospital-intro {
  background-color: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  line-height: 1.8;
  color: #606266;
}

.hospital-intro p {
  text-indent: 2em;
  margin: 0;
}
</style> 