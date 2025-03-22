<template>
  <div class="hospital-page">
    <!-- 页面容器 -->
    <div class="nav-container page-component">
      <!-- 左侧导航 -->
      <div class="nav left-nav">
        <div class="nav-item selected">
          <NuxtLink :to="`/hospital/${hoscode}`" class="v-link selected dark">预约挂号</NuxtLink>
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
      
      <!-- 右侧内容 -->
      <div class="page-container">
        <div class="hospital-home">
          <!-- 医院标题 -->
          <div class="common-header">
            <div class="title-wrapper">
              <span class="hospital-title">{{ hospital.hosname }}</span>
              <div class="icon-wrapper">
                <el-tag size="small" type="primary">{{ hospital.param.hostypeString }}</el-tag>
              </div>
            </div>
          </div>
          
          <!-- 医院信息 -->
          <div class="info-wrapper">
            <el-image 
              class="hospital-img" 
              :src="hospital.logoData ? `data:image/jpeg;base64,${hospital.logoData}` : ''" 
              :alt="hospital.hosname" 
              fit="cover" />
            <div class="content-wrapper">
              <h3 class="section-title">挂号规则</h3>
              <div class="line">
                <div><span class="label">预约周期：</span><span>{{ bookingRule.cycle }}天</span></div>
                <div class="space"><span class="label">放号时间：</span><span>{{ bookingRule.releaseTime }}</span></div>
                <div class="space"><span class="label">停挂时间：</span><span>{{ bookingRule.stopTime }}</span></div>
              </div>
              <div class="line">
                <span class="label">退号时间：</span>
                <span v-if="bookingRule.quitDay == -1">就诊前一工作日{{ bookingRule.quitTime }}前取消</span>
                <span v-if="bookingRule.quitDay == 0">就诊前当天{{ bookingRule.quitTime }}前取消</span>
              </div>
              
              <h3 class="section-title">医院预约规则</h3>
              <div class="rule-wrapper">
                <ol>
                  <li v-for="item in bookingRule.rule" :key="item">{{ item }}</li>
                </ol>
              </div>
            </div>
          </div>
          
          <!-- 科室选择 -->
          <h2 class="title select-title">选择科室</h2>
          <div class="select-dept-wrapper">
            <!-- 左侧科室大类 -->
            <div class="department-wrapper">
              <div class="hospital-department">
                <el-scrollbar height="400px">
                  <div 
                    v-for="(item, index) in departmentVoList" 
                    :key="item.id" 
                    :class="['sub-item', index === activeIndex ? 'selected' : '']" 
                    @click="move(index, item.depcode)">
                    {{ item.depname }}
                  </div>
                </el-scrollbar>
              </div>
            </div>
            
            <!-- 右侧科室小类 -->
            <div class="sub-dept-container">
              <div 
                v-for="(item, index) in departmentVoList" 
                :key="item.id" 
                :class="['sub-dept-wrapper', index === 0 ? 'selected' : '']" 
                :id="item.depcode">
                <div class="sub-title">
                  <div class="block selected"></div>{{ item.depname }}
                </div>
                <div class="sub-item-wrapper">
                  <el-tag
                    v-for="it in item.children" 
                    :key="it.id" 
                    class="sub-item" 
                    @click="schedule(it.depcode)"
                    type="success"
                    effect="light"
                    size="large"
                    style="margin: 5px; cursor: pointer">
                    {{ it.depname }}
                  </el-tag>
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
import { useRoute, useRouter } from 'nuxt/app'

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
const router = useRouter()

// 响应式数据
const hoscode = ref('')
const hospital = ref<any>({
  param: {}
})
const bookingRule = ref<any>({})
const departmentVoList = ref<any>([])
const activeIndex = ref(0)

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

    // 获取科室列表
    const { data: depData } = await api.hospital.findDepartment(hoscode.value)
    if (depData.value) {
      departmentVoList.value = depData.value
    }
  } catch (error) {
    ElMessage.error('获取医院信息失败')
    console.error(error)
  }
}

// 移动到指定科室
const move = (index: number, depcode: string) => {
  activeIndex.value = index
  document.getElementById(depcode)?.scrollIntoView({ behavior: 'smooth' })
}

// 跳转到排班页面
const schedule = async (depcode: string) => {
  // 检查是否登录
  const token = useCookie('token').value
  if (!token) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }

  try {
    // 检查认证状态
    const { data: userData } = await api.user.getUserInfo()
    if (userData.value) {
      const authStatus = userData.value.authStatus
      if (!authStatus || authStatus !== 2) {
        ElMessage.warning('请先完成实名认证')
        router.push('/user')
        return
      }
      
      // 跳转到排班页面
      router.push(`/hospital/schedule?hoscode=${hoscode.value}&depcode=${depcode}`)
    }
  } catch (error) {
    ElMessage.error('获取用户信息失败')
    console.error(error)
  }
}
</script>

<style scoped>
.hospital-page {
  background-color: #f5f7fa;
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
  margin: 20px 0 15px 0;
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

.rule-wrapper {
  background-color: #f8f8f8;
  border-radius: 4px;
  padding: 15px 20px;
  margin-top: 10px;
}

.rule-wrapper ol {
  padding-left: 20px;
}

.rule-wrapper li {
  line-height: 1.8;
  color: #606266;
}

.label {
  color: #909399;
  margin-right: 8px;
  display: inline-block;
  min-width: 80px;
}

.line {
  margin-bottom: 12px;
  line-height: 1.8;
}

.hospital-img {
  width: 120px;
  height: 120px;
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
}

.content-wrapper {
  flex: 1;
}

.title.select-title {
  font-size: 1.2rem;
  color: #303133;
  margin: 30px 0 15px 0;
  font-weight: bold;
}

.select-dept-wrapper {
  display: flex;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.department-wrapper {
  width: 220px;
  border-right: 1px solid #ebeef5;
}

.hospital-department {
  height: 400px;
}

.sub-item {
  padding: 15px 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.sub-item:hover {
  background-color: #f5f7fa;
}

.sub-item.selected {
  background-color: #ecf5ff;
  color: #409EFF;
  font-weight: bold;
}

.sub-dept-container {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  max-height: 400px;
}

.sub-dept-wrapper {
  margin-bottom: 20px;
}

.sub-title {
  display: flex;
  align-items: center;
  font-weight: bold;
  margin-bottom: 15px;
  color: #409EFF;
}

.block {
  width: 4px;
  height: 16px;
  background-color: #409EFF;
  margin-right: 10px;
  border-radius: 2px;
}

.sub-item-wrapper {
  display: flex;
  flex-wrap: wrap;
}
</style> 