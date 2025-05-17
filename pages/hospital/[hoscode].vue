<script setup lang="ts">
import { ElMessage } from 'element-plus'
import { Search, Location, Phone, Trophy, Calendar, Star, House, Document, ArrowDown } from '@element-plus/icons-vue'
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
const activeTab = ref('detail') // 当前激活的Tab: detail, department, rules

// 生成医院文字头像
const getHospitalAvatar = (name: string) => {
  if (!name) return '医院'
  // 提取医院名称的前两个字符作为头像文字
  return name.substring(0, 2)
}

// 生成随机背景色
const getAvatarBgColor = (name: string) => {
  if (!name) return '#1890ff'
  // 根据医院名称生成一个固定的颜色
  const colors = [
    '#1890ff', '#52c41a', '#faad14', '#f5222d', '#722ed1',
    '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', '#1890ff'
  ]
  // 使用医院名称的字符编码和来确定颜色索引
  const charSum = name.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
  return colors[charSum % colors.length]
}

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

// 处理Tab切换
const handleTabClick = () => {
  if (import.meta.client) {
    window.scrollTo(0, 0)
  }
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
            <!-- 使用条件渲染：有logoData显示图片，没有则显示文字头像 -->
            <div v-if="hospital.logoData" class="hospital-logo">
              <el-image :src="`data:image/jpeg;base64,${hospital.logoData}`" :alt="hospital.hosname" fit="cover" />
            </div>
            <div v-else class="hospital-avatar" :style="{ backgroundColor: getAvatarBgColor(hospital.hosname) }">
              {{ getHospitalAvatar(hospital.hosname) }}
            </div>

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
        <!-- 快速预约信息卡片 -->
        <el-card class="booking-info" shadow="hover">
          <div class="booking-info-header">
            <el-icon class="booking-icon">
              <Calendar />
            </el-icon>
            <span class="booking-title">预约信息</span>
          </div>
          <el-alert type="info" :closable="false" show-icon class="booking-time-alert">
            <template #title>
              <div class="booking-time-info">
                <span><strong>放号时间：</strong>{{ bookingRule?.releaseTime }}</span>
                <span class="time-separator">|</span>
                <span><strong>停挂时间：</strong>{{ bookingRule?.stopTime }}</span>
              </div>
            </template>
          </el-alert>
          <el-steps :active="2" simple class="booking-steps">
            <el-step title="选择科室" />
            <el-step title="选择医生" />
            <el-step title="确认预约" />
          </el-steps>
        </el-card>

        <!-- Tab切换区域 -->
        <div class="tab-container">
          <el-tabs v-model="activeTab" type="border-card" class="hospital-tabs" @tab-click="handleTabClick">
            <!-- 医院详情Tab -->
            <el-tab-pane name="detail" lazy>
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span>医院详情</span>
                </div>
              </template>

              <!-- 医院详情内容 -->
              <div class="hospital-detail-content">
                <!-- 医院概览区域 -->
                <section class="hospital-overview-section">
                  <!-- <h2 class="section-title">医院概览</h2> -->

                  <!-- 医院统计信息卡片 -->
                  <div class="hospital-stats">
                    <el-card class="stat-card" shadow="hover" v-motion :initial="{ opacity: 0, y: 20 }"
                      :enter="{ opacity: 1, y: 0, transition: { delay: 100 } }">
                      <div class="stat-content">
                        <div class="stat-icon-container">
                          <el-icon>
                            <Trophy />
                          </el-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-value">{{ hospital.param?.hostypeString || '暂无' }}</div>
                          <div class="stat-label">医院类型</div>
                        </div>
                      </div>
                    </el-card>

                    <el-card class="stat-card" shadow="hover" v-motion :initial="{ opacity: 0, y: 20 }"
                      :enter="{ opacity: 1, y: 0, transition: { delay: 200 } }">
                      <div class="stat-content">
                        <div class="stat-icon-container">
                          <el-icon>
                            <House />
                          </el-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-value">{{ departmentVoList.length }}个</div>
                          <div class="stat-label">科室数量</div>
                        </div>
                      </div>
                    </el-card>

                    <el-card class="stat-card" shadow="hover" v-motion :initial="{ opacity: 0, y: 20 }"
                      :enter="{ opacity: 1, y: 0, transition: { delay: 300 } }">
                      <div class="stat-content">
                        <div class="stat-icon-container">
                          <el-icon>
                            <Calendar />
                          </el-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-value">{{ bookingRule?.cycle }}天</div>
                          <div class="stat-label">预约周期</div>
                        </div>
                      </div>
                    </el-card>

                    <el-card class="stat-card" shadow="hover" v-motion :initial="{ opacity: 0, y: 20 }"
                      :enter="{ opacity: 1, y: 0, transition: { delay: 400 } }">
                      <div class="stat-content">
                        <div class="stat-icon-container">
                          <el-icon>
                            <Phone />
                          </el-icon>
                        </div>
                        <div class="stat-info">
                          <div class="stat-value">{{ '暂无' }}</div>
                          <div class="stat-label">咨询电话</div>
                        </div>
                      </div>
                    </el-card>
                  </div>
                </section>


                <!-- 医院位置区域 -->
                <section class="hospital-location-section">
                  <h2 class="section-title">医院位置</h2>
                  <el-card class="location-card" shadow="hover" v-motion :initial="{ opacity: 0, y: 20 }"
                    :enter="{ opacity: 1, y: 0, transition: { delay: 600 } }">
                    <template #header>
                      <div class="card-header-custom">
                        <el-icon>
                          <Location />
                        </el-icon>
                        <span>地址信息</span>
                      </div>
                    </template>
                    <div class="location-content">
                      <el-alert type="info" :closable="false" show-icon>
                        <template #title>
                          <div class="address-display">
                            {{ hospital.param?.fullAddress || '暂无地址信息' }}
                          </div>
                        </template>
                      </el-alert>
                    </div>
                  </el-card>
                </section>

                <!-- 医院简介区域 -->
                <section class="hospital-intro-section">
                  <hospital-introduction :hospital-intro="hospital.intro" />
                </section>
              </div>
            </el-tab-pane>

            <!-- 科室挂号Tab -->
            <el-tab-pane name="department" lazy>
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <House />
                  </el-icon>
                  <span>科室挂号</span>
                </div>
              </template>

              <!-- 科室挂号内容 -->
              <div class="department-content">
                <div class="section-header">
                  <div class="dept-header-wrapper">
                    <div class="dept-icon-wrapper">
                      <el-icon>
                        <House />
                      </el-icon>
                    </div>
                    <div>
                      <h2>选择科室</h2>
                      <p class="section-desc">请选择要预约的科室</p>
                    </div>
                  </div>

                  <!-- 科室搜索框 -->
                  <div class="department-filter">
                    <el-input v-model="searchDept" placeholder="搜索科室" :prefix-icon="Search" clearable />
                  </div>
                </div>

                <!-- 科室网格列表 -->
                <div class="department-grid">
                  <el-card v-for="dept in filteredDepartments" :key="dept.depcode" class="dept-card"
                    :class="{ 'is-expanded': currentExpandedDept === dept.depcode }" shadow="hover"
                    @click="toggleDept(dept.depcode)" v-motion :initial="{ opacity: 0, scale: 0.95 }"
                    :enter="{ opacity: 1, scale: 1 }">
                    <div class="dept-content">
                      <h3>{{ dept.depname }}</h3>
                      <div class="dept-info">
                        <el-tag size="small" type="info" effect="plain" class="dept-count-tag">
                          {{ dept.children?.length || 0 }}个诊室
                        </el-tag>
                        <el-icon :class="{ 'is-rotate': currentExpandedDept === dept.depcode }" class="dept-arrow-icon">
                          <ArrowDown />
                        </el-icon>
                      </div>
                    </div>
                    <div class="sub-dept-list" v-show="currentExpandedDept === dept.depcode">
                      <el-button v-for="child in dept.children" :key="child.depcode" type="primary"
                        @click.stop="schedule(child.depcode)" class="sub-dept-btn" size="small">
                        {{ child.depname }}
                      </el-button>
                    </div>
                  </el-card>
                </div>
              </div>
            </el-tab-pane>

            <!-- 预约规则Tab -->
            <el-tab-pane name="rules" lazy>
              <template #label>
                <div class="tab-label">
                  <el-icon>
                    <Calendar />
                  </el-icon>
                  <span>预约规则</span>
                </div>
              </template>

              <!-- 预约规则内容 -->
              <div class="rules-content">
                <div class="content-card rules-card" v-motion :initial="{ opacity: 0, y: 20 }"
                  :enter="{ opacity: 1, y: 0 }">
                  <div class="card-header">
                    <div class="header-icon">
                      <el-icon>
                        <Calendar />
                      </el-icon>
                    </div>
                    <h3>医院预约规则</h3>
                  </div>
                  <div class="card-content">
                    <ol class="rule-list">
                      <li v-for="(rule, index) in bookingRule?.rule" :key="index" class="rule-item" v-motion
                        :initial="{ opacity: 0, x: -10 }"
                        :enter="{ opacity: 1, x: 0, transition: { delay: index * 100 } }">
                        {{ rule }}
                      </li>
                    </ol>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </div>
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

.hospital-logo,
.hospital-avatar {
  width: 120px;
  height: 120px;
  border-radius: 12px;
  overflow: hidden;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.hospital-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
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

/* 快速预约信息卡片 */
.booking-info {
  margin-bottom: 24px;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: none;
}

.booking-info:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.booking-info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.booking-icon {
  font-size: 20px;
  color: var(--el-color-primary);
}

.booking-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.booking-time-alert {
  margin-bottom: 16px;
  border-radius: 6px;
}

.booking-time-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
}

.time-separator {
  color: var(--el-text-color-secondary);
  margin: 0 4px;
}

.booking-steps {
  margin-top: 16px;
  padding: 8px 0;
}

/* Tab切换区域 */
.tab-container {
  margin-bottom: 24px;
}

.hospital-tabs {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--el-box-shadow-light);
}

.hospital-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
  background-color: var(--el-color-primary-light-9);
  border-bottom: 1px solid var(--el-border-color-light);
}

.hospital-tabs :deep(.el-tabs__item) {
  height: 56px;
  line-height: 56px;
  transition: all 0.3s;
  font-size: 16px;
}

.hospital-tabs :deep(.el-tabs__item.is-active) {
  font-weight: 600;
  color: var(--el-color-primary);
  background-color: white;
}

.hospital-tabs :deep(.el-tabs__content) {
  padding: 28px;
  background-color: white;
  border-radius: 0 0 12px 12px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
}

/* 医院详情内容区域 */
.hospital-detail-content {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 区域标题样式 */
.section-title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 16px 0;
  padding-left: 12px;
  border-left: 4px solid var(--el-color-primary);
  line-height: 1.4;
}

/* 医院统计信息卡片 */
.hospital-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 8px;
}

.stat-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  padding: 8px;
}

.stat-icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--el-color-primary-light-8) 0%, var(--el-color-primary-light-5) 100%);
  margin-right: 16px;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.stat-icon-container .el-icon {
  font-size: 28px;
  color: var(--el-color-primary);
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 4px;
  line-height: 1.2;
}

.stat-label {
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

/* 医院简介卡片 */
.card-header-custom {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.card-header-custom .el-icon {
  font-size: 18px;
  color: var(--el-color-primary);
}

/* 医院位置卡片 */
.location-content {
  padding: 8px 0;
}

.address-display {
  font-size: 15px;
  line-height: 1.6;
  display: flex;
  align-items: center;
  min-height: 40px;
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

/* 卡片通用样式 */
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

/* Tab内容区域样式 */
.hospital-detail-content,
.department-content,
.rules-content {
  padding: 16px 0;
  animation: fadeIn 0.3s ease-in-out;
}

/* 科室部分 */
.department-content {
  background: white;
  border-radius: 0;
  padding: 0;
}

.section-header {
  margin-bottom: 28px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 16px;
  background: var(--el-color-primary-light-9);
  padding: 20px 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dept-header-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.dept-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  background-color: white;
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.15);
}

.dept-icon-wrapper .el-icon {
  font-size: 28px;
  color: var(--el-color-primary);
}

.section-header h2 {
  margin: 0 0 8px;
  font-size: 22px;
  font-weight: 600;
}

.section-desc {
  color: var(--el-text-color-secondary);
  margin: 6px 0 0 0;
  font-size: 15px;
}

.department-filter {
  width: 320px;
}

.department-filter :deep(.el-input__wrapper) {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border-radius: 8px;
  padding: 8px 12px;
}

.department-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
}

.dept-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid var(--el-border-color-lighter);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dept-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.dept-card.is-expanded {
  border-color: var(--el-color-primary);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.dept-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  background: linear-gradient(to right, var(--el-color-primary-light-9), white);
}

.dept-content h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dept-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dept-count-tag {
  font-size: 13px;
  padding: 4px 10px;
  border-radius: 12px;
}

.dept-arrow-icon {
  font-size: 16px;
  color: var(--el-color-primary);
  transition: transform 0.3s;
}

.el-icon.is-rotate {
  transform: rotate(180deg);
}

.sub-dept-list {
  margin: 0;
  padding: 16px 20px;
  border-top: 1px dashed var(--el-border-color);
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  background-color: var(--el-fill-color-light);
}

.sub-dept-btn {
  border-radius: 20px;
  padding: 8px 16px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.sub-dept-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.2);
}

/* 医院地址详情 */
.hospital-address-detail {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  border: 1px solid var(--el-border-color-lighter);
  transition: all 0.3s ease;
}

.hospital-address-detail:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
  border-color: var(--el-color-primary-light-5);
}

.address-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: var(--el-color-primary-light-9);
}

.address-icon-wrapper .el-icon {
  font-size: 24px;
  color: var(--el-color-primary);
}

/* 预约规则样式 */
.rules-content {
  padding: 0;
}

.rules-card {
  margin-bottom: 0;
}

.rule-list {
  padding-left: 24px;
  margin: 0;
}

.rule-item {
  margin-bottom: 16px;
  line-height: 1.8;
  color: var(--el-text-color-regular);
  padding: 12px 16px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  transition: all 0.3s ease;
  position: relative;
}

.rule-item:hover {
  transform: translateX(4px);
  background-color: var(--el-color-primary-light-9);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.rule-item::before {
  content: '';
  position: absolute;
  left: -12px;
  top: 50%;
  transform: translateY(-50%);
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--el-color-primary);
  box-shadow: 0 0 0 4px var(--el-color-primary-light-8);
}

.rule-item:last-child {
  margin-bottom: 0;
}

/* 动画效果增强 */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0.4);
  }

  70% {
    box-shadow: 0 0 0 10px rgba(24, 144, 255, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(24, 144, 255, 0);
  }
}

.stat-icon-wrapper {
  animation: pulse 2s infinite;
}

/* 响应式优化 */
@media screen and (max-width: 768px) {
  .hospital-stats {
    grid-template-columns: 1fr;
  }

  .department-grid {
    grid-template-columns: 1fr;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .department-filter {
    width: 100%;
    margin-top: 16px;
  }
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
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

  .hospital-logo,
  .hospital-avatar {
    width: 100px;
    height: 100px;
  }

  .hospital-avatar {
    font-size: 36px;
    margin: 0 auto;
  }

  .hospital-title-row {
    flex-direction: column;
    gap: 12px;
  }

  .hospital-tags {
    justify-content: center;
  }

  .hospital-address {
    justify-content: center;
  }

  .main-content {
    margin-top: -20px;
  }

  .booking-info {
    padding: 16px;
  }

  .booking-time-info {
    flex-direction: column;
    align-items: flex-start;
  }

  .time-separator {
    display: none;
  }

  .hospital-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .stat-item {
    padding: 16px;
  }

  .card-header {
    flex-direction: column;
    gap: 16px;
  }

  .section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .department-filter {
    width: 100%;
  }

  .department-grid {
    grid-template-columns: 1fr;
  }

  .tab-label {
    font-size: 14px;
  }

  .hospital-tabs :deep(.el-tabs__item) {
    height: 40px;
    line-height: 40px;
    padding: 0 12px;
  }

  .hospital-tabs :deep(.el-tabs__content) {
    padding: 16px;
  }

  .rules-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

/* 添加过渡动画 */
.hospital-page * {
  transition: all 0.3s ease;
}

.hospital-detail-content,
.department-content,
.rules-content {
  animation: fadeIn 0.5s ease-out;
}
</style>
