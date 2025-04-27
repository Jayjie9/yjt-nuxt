<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Search, Location, Phone, Trophy, Calendar, Star, House } from '@element-plus/icons-vue'
import { useApi } from '~/composables'
import { useRoute, useRouter } from 'nuxt/app'
import type { Hospital, BookingRule, HospitalDetailResponse } from '~/types/hospital'
import type { Department, DepartmentResponse } from '~/types/department'

// 获取API
const api = useApi()
const route = useRoute()
const router = useRouter()

// 响应式数据
const hoscode = ref('')
const hospital = ref<Hospital>({} as Hospital)
const bookingRule = ref<BookingRule>({} as BookingRule)
const departmentVoList = ref<Department[]>([])
const activeIndex = ref(0)
const loading = ref(true) // 添加加载状态
const isCollected = ref(false) // 是否已收藏
const collectLoading = ref(false) // 收藏加载状态
const userCollection = ref<any>(null) // 用户收藏信息

// 获取医院详情
const fetchHospitalDetail = async () => {
  const { data: hospitalData } = await api.hospital.findHospDetailDollar(hoscode.value)
  console.log(hospitalData);

  if (hospitalData.data) {
    const response = hospitalData as HospitalDetailResponse
    if (response.code === 200) {
      hospital.value = response.data.hospital
      bookingRule.value = response.data.bookingRule
      // 获取用户收藏信息
      await checkIfCollected()
    }
  }
}


// 获取UserCollection，检查当前医院是否已收藏
const checkIfCollected = async () => {
  const { data: response } = await api.user.isCollectedDollar(hoscode.value)
  userCollection.value = response.data
  if (response.data) {
    isCollected.value = true
  }
}

// 收藏/取消收藏医院
const toggleCollect = async () => {
  if (!userInfo.value) {
    ElMessage.warning('请先登录并完成实名认证')
    return
  }

  collectLoading.value = true
  try {
    if (isCollected.value) {
      // 查找收藏ID
      if (userCollection.value) {
        const collectionId = userCollection.value.id
        const { data: response } = await api.user.deleteCollectDollar(collectionId)
        if (response.code === 200) {
          ElMessage.success('取消收藏成功')
          isCollected.value = false
        } else {
          ElMessage.error(response.message || '取消收藏失败')
        }
      }
    } else {
      // 添加收藏
      const { data: response } = await api.user.addCollectDollar(hoscode.value)
      if (response.code === 200) {
        ElMessage.success('收藏成功')
        isCollected.value = true
        // 重新获取收藏列表
        await checkIfCollected()
      } else {
        ElMessage.error(response.message || '收藏失败')
      }
    }
  } catch (error) {
    console.error('收藏操作失败', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    collectLoading.value = false
  }
}
// 获取科室列表
const fetchDepartments = async () => {
  const { data } = await api.hospital.findDepartment(hoscode.value)
  if (data.value) {
    const response = data.value as DepartmentResponse
    if (response.code === 200) {
      departmentVoList.value = response.data
    }
  }
}

// 获取用户信息
const userInfo = ref(null)
const getUserInfo = async () => {
  try {
    const { data: response } = await api.user.getUserInfoDollar()
    if (response.code === 200) {
      userInfo.value = response.data
    }
  } catch (error) {
    console.error('获取用户信息失败', error)
  }
}

// 初始化数据
const init = async () => {
  loading.value = true
  try {
    // 获取用户信息
    await getUserInfo()
    // 获取医院详情
    await fetchHospitalDetail()
    // 获取科室列表
    await fetchDepartments()
  } catch (error) {
    ElMessage.error('获取医院信息失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

// 跳转到排班页面
const schedule = async (depcode: string) => {
  router.push(`/hospital/schedule?hoscode=${hoscode.value}&depcode=${depcode}`)
}

// 科室搜索
const searchDept = ref('')
const filteredDepartments = computed(() => {
  if (!searchDept.value) return departmentVoList.value
  const keyword = searchDept.value.toLowerCase()
  return departmentVoList.value.filter(dept =>
    dept.depname.toLowerCase().includes(keyword) ||
    dept.children?.some(child => child.depname.toLowerCase().includes(keyword))
  )
})

// 使用 ref 来控制当前展开的科室
const currentExpandedDept = ref<string | null>(null)

// 切换科室展开状态
const toggleDept = (deptCode: string) => {
  currentExpandedDept.value = currentExpandedDept.value === deptCode ? null : deptCode
}

// 获取医院代码和初始化
onMounted(() => {
  hoscode.value = route.params.hoscode as string
  init()
})
</script>

<template>
  <div class="hospital-page">
    <el-skeleton :loading="loading" animated :count="1" v-if="loading">
      <template #template>
        <div style="padding: 20px">
          <el-skeleton-item variant="h1" style="width: 50%" />
          <div style="display: flex; margin-top: 20px">
            <el-skeleton-item variant="image" style="width: 120px; height: 120px" />
            <div style="margin-left: 20px; flex: 1">
              <el-skeleton-item variant="h3" style="width: 30%" />
              <el-skeleton-item variant="text" style="margin-top: 20px; width: 80%" />
              <el-skeleton-item variant="text" style="width: 60%" />
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>

    <div v-else>
      <!-- 医院头部信息区 -->
      <div class="hospital-hero">
        <div class="hero-content">
          <div class="hospital-basic">
            <el-image class="hospital-logo"
              :src="hospital.logoData ? `data:image/jpeg;base64,${hospital.logoData}` : '/images/hospital-default.png'"
              :alt="hospital.hosname" fit="cover" />
            <div class="hospital-info">
              <div class="hospital-title-row">
                <h1 class="hospital-title">{{ hospital.hosname }}</h1>
                <el-button :type="isCollected ? 'danger' : 'primary'" :icon="Star" circle size="large"
                  :loading="collectLoading" @click="toggleCollect" class="collect-btn"
                  :title="isCollected ? '取消收藏' : '收藏医院'" />
              </div>
              <div class="hospital-tags">
                <el-tag size="large" type="primary" effect="plain">{{ hospital.param.hostypeString }}</el-tag>
                <el-tag size="large" type="success" effect="plain">可预约</el-tag>
              </div>
              <p class="hospital-address">
                <el-icon>
                  <Location />
                </el-icon>
                {{ hospital.param?.fullAddress }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 主要内容区 -->
      <div class="main-content">
        <!-- 快速预约规则卡片 -->
        <el-card class="booking-rules">
          <template #header>
            <div class="card-header">
              <h3>预约规则</h3>
              <el-alert type="info" :closable="false" show-icon>
                <template #title>
                  放号时间：{{ bookingRule?.releaseTime }} | 停挂时间：{{ bookingRule?.stopTime }}
                </template>
              </el-alert>
            </div>
          </template>
          <el-steps :active="2" simple>
            <el-step title="选择科室" />
            <el-step title="选择医生" />
            <el-step title="确认预约" />
          </el-steps>
        </el-card>

        <!-- 添加医院详情卡片 -->
        <el-card class="hospital-detail-card">
          <template #header>
            <div class="card-header">
              <h3>医院详情</h3>
            </div>
          </template>

          <div class="hospital-stats">
            <div class="stat-item">
              <el-icon>
                <Trophy />
              </el-icon>
              <div class="stat-content">
                <div class="stat-label">医院等级</div>
                <div class="stat-value">{{ hospital.param?.hostypeString }}</div>
              </div>
            </div>
            <div class="stat-item">
              <el-icon>
                <House />
              </el-icon>
              <div class="stat-content">
                <div class="stat-label">科室数量</div>
                <div class="stat-value">{{ departmentVoList.length }}个</div>
              </div>
            </div>
            <div class="stat-item">
              <el-icon>
                <Calendar />
              </el-icon>
              <div class="stat-content">
                <div class="stat-label">预约周期</div>
                <div class="stat-value">{{ bookingRule?.cycle }}天</div>
              </div>
            </div>
            <div class="stat-item">
              <el-icon>
                <Phone />
              </el-icon>
              <div class="stat-content">
                <div class="stat-label">咨询电话</div>
                <!-- <div class="stat-value">{{ hospital.param?.contactNumber || '暂无' }}</div> -->
                <div class="stat-value">{{ '暂无' }}</div>
              </div>
            </div>
          </div>

          <el-divider>
            <span class="divider-text">医院简介</span>
          </el-divider>

          <div class="hospital-intro">
            <p>{{ hospital.intro || '暂无简介' }}</p>
          </div>

          <el-divider>
            <span class="divider-text">医院特色</span>
          </el-divider>

          <!-- <div class="hospital-features">
            <el-tag v-for="(feature, index) in hospital.param?.features?.split(',')" :key="index" class="feature-tag"
              effect="plain">
              {{ feature }}
            </el-tag>
          </div> -->

          <el-divider>
            <span class="divider-text">交通指南</span>
          </el-divider>

          <div class="hospital-route">
            <el-icon>
              <Location />
            </el-icon>
            <span>{{ hospital.route || '暂无交通信息' }}</span>
          </div>
        </el-card>

        <!-- 科室导航与列表 -->
        <div class="department-section">
          <div class="section-header">
            <h2>选择科室</h2>
            <p class="section-desc">请选择要预约的科室</p>
          </div>

          <!-- 科室搜索框 -->
          <div class="department-filter">
            <el-input v-model="searchDept" placeholder="搜索科室" :prefix-icon="Search" clearable />
          </div>

          <!-- 科室网格列表 -->
          <div class="department-grid">
            <el-card v-for="dept in filteredDepartments" :key="dept.depcode" class="dept-card"
              :class="{ 'is-expanded': currentExpandedDept === dept.depcode }" shadow="hover"
              @click="toggleDept(dept.depcode)">
              <div class="dept-content">
                <h3>{{ dept.depname }}</h3>
                <div class="dept-info">
                  <span>{{ dept.children?.length || 0 }}个诊室</span>
                  <el-icon :class="{ 'is-rotate': currentExpandedDept === dept.depcode }">
                    <ArrowDown />
                  </el-icon>
                </div>
              </div>
              <div class="sub-dept-list" v-show="currentExpandedDept === dept.depcode">
                <el-button v-for="child in dept.children" :key="child.depcode" text
                  @click.stop="schedule(child.depcode)">
                  {{ child.depname }}
                </el-button>
              </div>
            </el-card>
          </div>
        </div>

        <!-- 预约规则详情 -->
        <el-card class="rule-details">
          <template #header>
            <h3>医院预约规则</h3>
          </template>
          <ol class="rule-list">
            <li v-for="(rule, index) in bookingRule?.rule" :key="index">
              {{ rule }}
            </li>
          </ol>
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

/* 医院头部区域 */
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
  display: flex;
  gap: 24px;
  align-items: center;
}

.hospital-logo {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hospital-info {
  flex: 1;
}

.hospital-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.hospital-title {
  font-size: 28px;
  margin: 0;
}

.collect-btn {
  transition: all 0.3s;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.hospital-tags {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.hospital-address {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.9;
  font-size: 14px;
}

/* 主要内容区 */
.main-content {
  max-width: 1200px;
  margin: -30px auto 40px;
  padding: 0 20px;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 添加医院详情卡片样式 */
.hospital-detail-card {
  margin-bottom: 24px;
}

.hospital-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

.stat-item .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

.stat-content {
  flex: 1;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}

.stat-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.divider-text {
  font-size: 16px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
}

.hospital-intro {
  color: var(--el-text-color-regular);
  line-height: 1.8;
  margin: 16px 0;
}

.hospital-features {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 16px 0;
}

.feature-tag {
  padding: 8px 16px;
}

.hospital-route {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  padding: 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
}

/* 预约规则卡片 */
.booking-rules {
  margin-bottom: 24px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

/* 科室部分 */
.department-section {
  background: white;
  border-radius: 8px;
  padding: 24px;
  box-shadow: var(--el-box-shadow-light);
}

.section-header {
  margin-bottom: 24px;
}

.section-header h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
}

.section-desc {
  color: var(--el-text-color-secondary);
  margin: 0;
}

.department-filter {
  margin-bottom: 24px;
}

.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.dept-card {
  cursor: pointer;
  transition: all 0.3s;
}

.dept-card.is-expanded {
  border-color: var(--el-color-primary);
}

.dept-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}



.dept-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.el-icon.is-rotate {
  transform: rotate(180deg);
  transition: transform 0.3s;
}

.sub-dept-list {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
  .hospital-hero {
    padding: 24px 0;
  }

  .hospital-basic {
    flex-direction: column;
    text-align: center;
  }

  .hospital-logo {
    width: 100px;
    height: 100px;
  }

  .hospital-tags {
    justify-content: center;
  }

  .hospital-address {
    justify-content: center;
  }

  .hospital-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    padding: 12px;
  }

  .feature-tag {
    padding: 6px 12px;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
  }

  .department-grid {
    grid-template-columns: 1fr;
  }
}
</style>
