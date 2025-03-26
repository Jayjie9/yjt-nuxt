<script setup lang="ts">
import { Search, OfficeBuilding, Clock, ArrowRight, Notification, Warning } from '@element-plus/icons-vue'
import { useApi } from '~/composables'
import { useRouter } from 'nuxt/app'
import type { Hospital, HospitalQueryParams } from '~/types'

// definePageMeta({
//   middleware: 'jwt-auth',
// })

// 获取API
const { hospital, dictionary } = useApi()
const router = useRouter()

// 搜索相关
const searchName = ref('')

// 分页相关
const page = ref(1)
const limit = ref(10)
const totalPages = ref(0)

// 筛选相关
const searchObj = reactive<HospitalQueryParams>({})
const hostypeActiveIndex = ref(0)
const provinceActiveIndex = ref(0)

// 数据列表
const hospitalList = ref<Hospital[]>([])
const hostypeList = ref<any[]>([])
const districtList = ref<any[]>([])

// 静态数据（实际应从API获取）
const commonDepts = ref([
  '神经内科', '消化内科', '呼吸内科', '内科',
  '神经外科', '妇科', '产科', '儿科'
])

const platformNotices = ref([
  '关于延长北京大学国际医院放假的通知',
  '北京中医药大学东方医院部分科室医生门诊医',
  '武警总医院号源暂停更新通知'
])

const stopNotices = ref([
  '中国人民解放军总医院第六医学中心(原海军总医院)呼吸内科门诊停诊公告',
  '首都医科大学附属北京潞河医院老年医学科门诊停诊公告',
  '中日友好医院中西医结合心内科门诊停诊公告'
])

// 初始化数据
onMounted(() => {
  init()
  getHospitalList()
})

// 初始化医院等级和地区列表
const init = async () => {
  try {
    // 查询医院等级列表
    const { data: hostypeData } = await dictionary.findByDictCode('Hostype')
    hostypeList.value = [{ id: 0, name: '全部', value: '' }]
    if (hostypeData.value) {
      hostypeList.value.push(...hostypeData.value)
    }

    // 查询地区数据
    const { data: districtData } = await dictionary.findByDictCode('Beijing')
    districtList.value = [{ id: 0, name: '全部', value: '' }]
    if (districtData.value) {
      districtList.value.push(...districtData.value)
    }
  } catch (error) {
    console.error('初始化数据失败', error)
  }
}

// 获取医院列表
const getHospitalList = async () => {
  try {
    const { data: response } = await hospital.getHospPageList(page.value, limit.value, searchObj)
    if (response.value) {
      hospitalList.value = response.value.content
      totalPages.value = response.value.totalPages
    }
  } catch (error) {
    console.error('获取医院列表失败', error)
  }
}

// 根据医院等级筛选
const hostypeSelect = (hostype: string, index: number) => {
  hospitalList.value = []
  page.value = 1
  hostypeActiveIndex.value = index
  searchObj.hostype = hostype
  getHospitalList()
}

// 根据地区筛选
const districtSelect = (districtCode: string, index: number) => {
  hospitalList.value = []
  page.value = 1
  provinceActiveIndex.value = index
  searchObj.districtCode = districtCode
  getHospitalList()
}

// 搜索建议
const querySearchAsync = (queryString: string, cb: (suggestions: any[]) => void) => {
  if (!queryString) {
    cb([])
    return
  }

  hospital.getByHosname(queryString).then(({ data }) => {
    if (data.value) {
      const suggestions = data.value.map((item: any) => ({
        ...item,
        value: item.hosname
      }))
      cb(suggestions)
    } else {
      cb([])
    }
  }).catch((error) => {
    console.error('搜索失败', error)
    cb([])
  })
}

const test = () => {
  const jwt = useJWT()
  console.log(jwt.accessToken.value)
}

// 选择搜索结果
const handleSelect = (item: any) => {
  navigateToHospital(item.hoscode)
}

// 跳转到医院详情
const navigateToHospital = (hoscode: string) => {
  router.push(`/hospital/${hoscode}`)
}
</script>

<template>
  <div class="home-page">
    <!-- 轮播图区域 -->
    <div class="banner-section">
      <el-carousel height="400px" :interval="5000" arrow="always" indicator-position="outside" class="main-carousel">
        <el-carousel-item v-for="item in 2" :key="item">
          <div class="carousel-content">
            <img src="~/assets/images/web-banner1.png" alt="医院轮播图" class="carousel-image">
            <div class="carousel-overlay">
              <h2 class="carousel-title">便捷就医 · 健康生活</h2>
              <p class="carousel-desc">提供全国知名医院挂号、问诊服务</p>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </div>

    <!-- 搜索区域 -->
    <div class="search-section">
      <div class="search-container">
        <div class="search-title">
          <h3>查找医院</h3>
          <p>全国超过2000家医院在线挂号</p>
        </div>
        <div class="search-box">
          <el-autocomplete class="search-input" v-model="searchName" :fetch-suggestions="querySearchAsync"
            placeholder="请输入医院名称" @select="handleSelect" :trigger-on-focus="false" highlight-first-item>
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
            <template #suffix>
              <el-button type="primary" class="search-btn">搜索</el-button>
            </template>
            <template #default="{ item }">
              <div class="search-suggestion-item">
                <span>{{ item.hosname }}</span>
                <span class="hospital-level">{{ item.param?.hostypeString }}</span>
              </div>
            </template>
          </el-autocomplete>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-left">
        <!-- 筛选区域 -->
        <div class="filter-panel">
          <div class="panel-header">
            <h3>医院筛选</h3>
          </div>
          <div class="filter-options">
            <div class="filter-group">
              <span class="filter-label">等级：</span>
              <div class="filter-items">
                <span v-for="(item, index) in hostypeList" :key="item.id" class="filter-tag"
                  :class="{ 'filter-tag-active': hostypeActiveIndex === index }"
                  @click="hostypeSelect(item.value, index)">
                  {{ item.name }}
                </span>
              </div>
            </div>

            <div class="filter-group">
              <span class="filter-label">地区：</span>
              <div class="filter-items">
                <span v-for="(item, index) in districtList" :key="item.id" class="filter-tag"
                  :class="{ 'filter-tag-active': provinceActiveIndex === index }"
                  @click="districtSelect(item.value, index)">
                  {{ item.name }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- 医院列表 -->
        <div class="hospital-grid">
          <el-card v-for="item in hospitalList" :key="item.id" class="hospital-card" shadow="hover"
            @click="navigateToHospital(item.hoscode)">
            <div class="hospital-card-content">
              <div class="hospital-info">
                <h3 class="hospital-name">{{ item.hosname }}</h3>
                <div class="hospital-meta">
                  <div class="meta-item">
                    <el-icon>
                      <OfficeBuilding />
                    </el-icon>
                    <span>{{ item.param.hostypeString }}</span>
                  </div>
                  <div class="meta-item">
                    <el-icon>
                      <Clock />
                    </el-icon>
                    <span>每天{{ item.bookingRule.releaseTime }}放号</span>
                  </div>
                </div>
              </div>
              <img :src="`data:image/jpeg;base64,${item.logoData}`" :alt="item.hosname" class="hospital-logo">
            </div>
          </el-card>
        </div>
      </div>

      <div>
        <el-button type="primary" @click="test">测试</el-button>
      </div>

      <div class="content-right">
        <!-- 常见科室 -->
        <div class="side-panel dept-panel">
          <div class="panel-header">
            <h3>常见科室</h3>
            <div class="view-all">
              <span>全部</span>
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
          <div class="dept-list">
            <span class="dept-item" v-for="dept in commonDepts" :key="dept">{{ dept }}</span>
          </div>
        </div>

        <!-- 平台公告 -->
        <div class="side-panel notice-panel">
          <div class="panel-header">
            <div class="header-with-icon">
              <el-icon>
                <Notification />
              </el-icon>
              <h3>平台公告</h3>
            </div>
            <div class="view-all">
              <span>全部</span>
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
          <div class="notice-list">
            <div class="notice-item" v-for="(notice, index) in platformNotices" :key="index">
              <div class="notice-dot"></div>
              <span class="notice-text">{{ notice }}</span>
            </div>
          </div>
        </div>

        <!-- 停诊公告 -->
        <div class="side-panel notice-panel stop-panel">
          <div class="panel-header">
            <div class="header-with-icon">
              <el-icon>
                <Warning />
              </el-icon>
              <h3>停诊公告</h3>
            </div>
            <div class="view-all">
              <span>全部</span>
              <el-icon>
                <ArrowRight />
              </el-icon>
            </div>
          </div>
          <div class="notice-list">
            <div class="notice-item" v-for="(notice, index) in stopNotices" :key="index">
              <div class="notice-dot"></div>
              <span class="notice-text">{{ notice }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
/* 全局页面样式 */
.home-page {
  padding-bottom: 40px;
  background-color: #f5f7fa;
}

/* 轮播图样式 */
.banner-section {
  width: 100%;
}

.main-carousel {
  height: 400px;
  border-radius: 0;
}

.carousel-content {
  position: relative;
  width: 100%;
  height: 100%;
}

.carousel-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.carousel-overlay {
  position: absolute;
  bottom: 80px;
  left: 10%;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.carousel-title {
  font-size: 32px;
  margin: 0 0 10px;
}

.carousel-desc {
  font-size: 18px;
  margin: 0;
}

/* 搜索区域样式 */
.search-section {
  margin-top: -80px;
  position: relative;
  z-index: 10;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  background-color: white;
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.search-title {
  text-align: center;
  margin-bottom: 20px;
}

.search-title h3 {
  font-size: 22px;
  color: #333;
  margin: 0 0 5px;
}

.search-title p {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.search-box {
  width: 100%;
}

.search-input {
  width: 100%;
}

.search-input :deep(.el-input__inner) {
  height: 50px;
  font-size: 16px;
}

.search-btn {
  height: 36px;
  margin-right: -8px;
}

.search-suggestion-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.hospital-level {
  font-size: 12px;
  color: #909399;
}

/* 主内容区域 */
.main-content {
  max-width: 1200px;
  margin: 30px auto 0;
  display: flex;
  gap: 20px;
  padding: 0 20px;
}

.content-left {
  flex: 1;
}

.content-right {
  width: 300px;
}

/* 筛选面板 */
.filter-panel {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  padding: 20px;
  margin-bottom: 20px;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.panel-header h3 {
  font-size: 18px;
  margin: 0;
  color: #303133;
}

.filter-group {
  margin-bottom: 15px;
}

.filter-label {
  color: #606266;
  font-weight: 500;
  margin-right: 10px;
  display: inline-block;
  width: 60px;
}

.filter-items {
  display: inline-flex;
  flex-wrap: wrap;
}

.filter-tag {
  padding: 6px 12px;
  margin: 0 8px 8px 0;
  border-radius: 4px;
  background-color: #f5f7fa;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s;
}

.filter-tag:hover {
  background-color: #e6f1fc;
  color: #409EFF;
}

.filter-tag-active {
  background-color: #409EFF;
  color: white;
}

/* 医院列表 */
.hospital-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
}

.hospital-card {
  cursor: pointer;
  transition: transform 0.3s;
}

.hospital-card:hover {
  transform: translateY(-5px);
}

.hospital-card-content {
  display: flex;
  justify-content: space-between;
}

.hospital-info {
  flex: 1;
  padding-right: 15px;
}

.hospital-name {
  font-size: 16px;
  font-weight: bold;
  color: #303133;
  margin: 0 0 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.hospital-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.meta-item {
  display: flex;
  align-items: center;
  color: #606266;
  font-size: 13px;
}

.meta-item .el-icon {
  margin-right: 5px;
  color: #409EFF;
}

.hospital-logo {
  width: 80px;
  height: 80px;
  border-radius: 4px;
  object-fit: cover;
}

/* 侧边栏组件 */
.side-panel {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.header-with-icon {
  display: flex;
  align-items: center;
}

.header-with-icon .el-icon {
  margin-right: 8px;
  font-size: 18px;
  color: #409EFF;
}

.view-all {
  display: flex;
  align-items: center;
  color: #909399;
  font-size: 13px;
  cursor: pointer;
}

.view-all:hover {
  color: #409EFF;
}

.view-all .el-icon {
  margin-left: 4px;
}

/* 科室列表 */
.dept-list {
  display: flex;
  flex-wrap: wrap;
}

.dept-item {
  width: 33.33%;
  padding: 8px 5px;
  color: #606266;
  cursor: pointer;
  transition: color 0.3s;
}

.dept-item:hover {
  color: #409EFF;
}

/* 公告列表 */
.notice-list {
  display: flex;
  flex-direction: column;
}

.notice-item {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  cursor: pointer;
}

.notice-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #409EFF;
  margin: 7px 8px 0 0;
  flex-shrink: 0;
}

.notice-text {
  color: #606266;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.5;
}

.notice-item:hover .notice-text {
  color: #409EFF;
}

.stop-panel .notice-dot {
  background-color: #f56c6c;
}

/* 响应式布局 */
@media screen and (max-width: 1200px) {
  .main-content {
    padding: 0 15px;
  }
}

@media screen and (max-width: 992px) {
  .main-content {
    flex-direction: column;
  }

  .content-right {
    width: 100%;
  }

  .hospital-grid {
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  }
}

@media screen and (max-width: 768px) {
  .carousel-title {
    font-size: 26px;
  }

  .carousel-desc {
    font-size: 16px;
  }

  .search-container {
    padding: 15px;
  }

  .filter-label {
    width: 50px;
  }

  .hospital-grid {
    grid-template-columns: 1fr;
  }

  .dept-item {
    width: 50%;
  }
}

@media screen and (max-width: 576px) {
  .carousel-overlay {
    bottom: 50px;
    left: 5%;
  }

  .carousel-title {
    font-size: 22px;
  }

  .search-section {
    margin-top: -60px;
  }
}
</style>
