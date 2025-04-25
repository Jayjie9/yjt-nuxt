<script setup lang="ts">
import { Search, OfficeBuilding, Clock, ArrowDown, ArrowRight, Notification, Warning, Location } from '@element-plus/icons-vue'
import { useApi } from '~/composables'
import { useRouter } from 'nuxt/app'
import type { Hospital, HospitalQueryParams, LinkItem } from '~/types'

// definePageMeta({
//   middleware: 'jwt-auth',
// })

/* Api & 路由 */
const router = useRouter()
const { hospital, dictionary } = useApi()
/* 搜索相关 */
const searchName = ref('')
/* 分页相关 */
const page = ref(1)
const limit = ref(10)
const totalPages = ref(0)
/* 筛选相关 */
const searchObj = reactive<HospitalQueryParams>({})
const hostypeActiveIndex = ref(0)
const provinceActiveIndex = ref(0)
const isDistrictExpanded = ref(false)
const initialDisplayCount = 11  // 首行显示的地区数量
/* 搜索相关 */
let links = ref<LinkItem[]>([])
let timeout: ReturnType<typeof setTimeout>
/* 数据列表 */
const hospitalList = ref<Hospital[]>([])
const hostypeList = ref<any[]>([])
const districtList = ref<any[]>([])

const displayedDistricts = computed(() => {
  if (isDistrictExpanded.value) {
    return districtList.value
  }
  return districtList.value.slice(0, initialDisplayCount)
})

const toggleDistrictExpand = () => {
  isDistrictExpanded.value = !isDistrictExpanded.value
}

// 静态数据（后端异常时候选）
const commonDepts = ref([
  '神经内科', '消化内科', '呼吸内科', '内科',
  '神经外科', '妇科', '产科', '儿科'
])

const linksData = [
  { hoscode: '1000_0', hosname: '北京协和医院' },
  { hoscode: '1000_1', hosname: '上海瑞金医院' },
  { hoscode: '1000_2', hosname: '广州中山大学附属第一医院' },
  { hoscode: '4200_0', hosname: '华中科技大学同济医学院附属同济医院' },
]

const platformNotices = ref([
  '关于延长北京大学国际医院放假的通知',
  '北京中医药大学东方医院部分科室医生门诊',
  '武警总医院号源暂停更新通知',
  '武警总医院号源暂停更新通知'
])

const stopNotices = ref([
  '中国人民解放军总医院第六医学中心(原海军总医院)呼吸内科门诊停诊公告',
  '首都医科大学附属北京潞河医院老年医学科门诊停诊公告',
  '中日友好医院中西医结合心内科门诊停诊公告'
])

/* 初始化数据：SSR */
const { data: districtData } = await useAsyncData('districts', () =>
  dictionary.findByParentIdDollar('86')
)
const { data: hostypeData } = await useAsyncData('hostype', () =>
  dictionary.findByDictCodeDollar('Hostype')
)
/* 初始化数据 */
const init = () => {
  try {
    // 查询医院等级列表
    hostypeList.value = [{ id: 0, name: '全部', value: '' }]
    if (hostypeData.value?.data?.data) {  // 修改这里，增加安全访问
      let names = hostypeData.value.data.data
      hostypeList.value.push(...names)
    }
    // 查询地区数据
    districtList.value = [{ id: 0, name: '全部', value: '' }]
    if (districtData.value?.data?.data) {  // 修改这里，增加安全访问
      let dists = districtData.value.data.data
      districtList.value.push(...dists)
    }
  } catch (error) {
    console.error('初始化数据失败', error)
  }
}
/* 获取医院列表 */
const getHospitalList = async () => {
  try {
    const { data: response } = await hospital.getHospPageListDollar(page.value, limit.value, searchObj)
    if (response.data) {
      hospitalList.value = response.data.content
      totalPages.value = response.data.totalPages
    }
  } catch (error) {
    console.error('获取医院列表失败', error)
  }
}
/* 根据医院等级筛选 */
const hostypeSelect = (hostype: string, index: number) => {
  hospitalList.value = []
  page.value = 1
  hostypeActiveIndex.value = index
  searchObj.hostype = hostype
  // console.log('searchObj.hostype:' + searchObj.hostype)
  // console.log('index:' + index)
  getHospitalList()
}
/* 根据地区筛选 */
const districtSelect = (districtCode: string, index: number) => {
  hospitalList.value = []
  page.value = 1
  provinceActiveIndex.value = index
  searchObj.provinceCode = districtCode
  // console.log('searchObj.districtCode:' + searchObj.districtCode)
  // console.log('proinceActiveIndex:' + provinceActiveIndex.value)
  getHospitalList()
}
/* 搜索建议 */
const querySearchAsync = (queryString: string, cb: (suggestions: any) => void) => {
  if (!queryString) {
    cb(linksData)
    return
  }
  clearTimeout(timeout)
  timeout = setTimeout(async () => {
    try {
      const { data } = await hospital.searchByHosname(queryString)
      let results;
      if (data.data && Array.isArray(data.data)) {
        links.value = data.data
        results = links.value.filter(createFilter(queryString))
      } else {
        console.warn('搜索返回的数据结构不符合预期:', data)
        results = linksData
      }
      // 过滤结果并返回
      cb(results)
    } catch (error) {
      console.error('搜索医院失败:', error)
      cb([])
    }
  }, 800)
}
const createFilter = (queryString: string) => {
  return (restaurant: LinkItem) => {
    return (
      restaurant.hosname.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    )
  }
}
// 选择搜索结果
const handleSelect = (item: Record<string, any>) => {
  navigateToHospital(item.hoscode)
}
// 跳转到医院详情
const navigateToHospital = (hoscode: string) => {
  router.push(`/hospital/${hoscode}`)
}


// 系统公告数据
const systemAnnouncements = ref([
  {
    id: '1',
    title: '系统维护通知',
    date: new Date('2025-04-22T10:00:00'),
    content: `<p>尊敬的用户：</p>
    <p>为了提供更优质的服务，我们的系统将于2025年4月25日凌晨2:00-4:00进行例行维护升级。维护期间，网站及APP将暂停服务，给您带来的不便敬请谅解。</p>
    <p>此次更新包括：</p>
    <ul>
      <li>预约流程优化，提升用户体验</li>
      <li>新增专家在线问诊功能</li>
      <li>修复已知问题，提升系统稳定性</li>
    </ul>
    <p>如有疑问，请联系客服热线：400-123-4567</p>`,
    attachments: [
      { name: '系统更新详情.pdf', url: '#' },
      { name: '新功能使用指南.pdf', url: '#' }
    ]
  },
  {
    id: '2',
    title: '春节门诊安排',
    date: new Date('2025-04-21T14:30:00'),
    content: `<p>尊敬的用户：</p>
    <p>春节期间（2025年2月1日至2月7日），我院门诊安排如下：</p>
    <ul>
      <li>急诊科：24小时正常接诊</li>
      <li>内科、外科：每日上午8:00-12:00开诊</li>
      <li>专科门诊：暂停服务，2月8日恢复正常</li>
    </ul>
    <p>请广大患者合理安排就诊时间。祝大家新春快乐，身体健康！</p>`,
    attachments: []
  }
]);
const announcementModal = ref(null);

/* 全局初始化 */
init()
onMounted(() => {
  getHospitalList()
})
</script>

<template>
  <div class="page-common">
    <!-- 系统公告弹窗 -->
    <SystemAnnouncement ref="announcementModal" :announcements="systemAnnouncements" />
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="header-title">在线医疗预约平台</h1>
        <p class="header-subtitle">便捷挂号，智慧就医，为您的健康保驾护航</p>

        <!-- 搜索区域 -->
        <div class="search-container">
          <el-autocomplete class="home-search-input" v-model="searchName" :fetch-suggestions="querySearchAsync"
            placeholder="搜索医院名称或科室" @select="handleSelect" :trigger-on-focus="true" highlight-first-item
            fit-input-width>
            <template #prefix>
              <el-icon>
                <Search />
              </el-icon>
            </template>
            <template #default="{ item }">
              <span class="suggestion-name">{{ item.hosname }}</span>
            </template>
          </el-autocomplete>
        </div>

        <!-- 快速入口 -->
        <div class="quick-access">
          <div v-for="dept in commonDepts.slice(0, 6)" :key="dept" class="quick-access-item">
            {{ dept }}
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-left">
        <!-- 筛选面板 -->
        <div class="filter-panel">
          <div class="filter-group">
            <div class="filter-label">医院等级</div>
            <div class="filter-options">
              <el-tag v-for="(item, index) in hostypeList" :key="item.id"
                :class="{ 'is-active': hostypeActiveIndex === index }" @click="hostypeSelect(item.value, index)"
                :effect="hostypeActiveIndex === index ? 'dark' : 'plain'">
                {{ item.name }}
              </el-tag>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">所在地区</div>
            <div class="filter-options">
              <el-tag v-for="(item, index) in displayedDistricts" :key="item.id"
                :class="{ 'is-active': provinceActiveIndex === index }" @click="districtSelect(item.value, index)"
                :effect="provinceActiveIndex === index ? 'dark' : 'plain'">
                {{ item.name }}
              </el-tag>
              <el-button v-if="districtList.length > initialDisplayCount" link class="expand-button"
                @click="toggleDistrictExpand">
                {{ isDistrictExpanded ? '收起' : '展开' }}
                <el-icon class="expand-icon" :class="{ 'is-expanded': isDistrictExpanded }">
                  <ArrowDown />
                </el-icon>
              </el-button>
            </div>
          </div>
        </div>

        <!-- 医院列表 -->
        <div class="hospital-list">
          <el-card v-for="item in hospitalList" :key="item.id" class="hospital-card" shadow="hover"
            @click="navigateToHospital(item.hoscode)">
            <div class="hospital-header">
              <div class="hospital-logo">
                <img v-if="item.logoData" :src="`data:image/jpeg;base64,${item.logoData}`" :alt="item.hosname" />
                <el-icon v-else>
                  <OfficeBuilding />
                </el-icon>
              </div>
              <div class="hospital-info">
                <h3 class="hospital-name">{{ item.hosname }}</h3>
                <div class="hospital-tags">
                  <el-tag size="small" type="success" effect="plain" v-if="item.bookingRule">
                    预约挂号
                  </el-tag>
                  <el-tag size="small" type="info" effect="plain">
                    {{ item.param?.hostypeString || '未知等级' }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div class="hospital-details">
              <div class="detail-item">
                <el-icon>
                  <Clock />
                </el-icon>
                <span>放号时间：{{ item.bookingRule?.releaseTime || '暂无' }}</span>
              </div>
              <div class="detail-item">
                <el-icon>
                  <Location />
                </el-icon>
                <span>{{ item.param?.fullAddress }}</span>
              </div>
            </div>

            <div class="hospital-intro" v-if="item.intro">
              {{ item.intro.substring(0, 100) }}{{ item.intro.length > 100 ? '...' : '' }}
            </div>
          </el-card>
        </div>
      </div>

      <div class="content-right">
        <!-- 公告面板 -->
        <div class="notice-panel">
          <div class="panel-header">
            <div class="notice-title">
              <el-icon>
                <Notification />
              </el-icon>
              <span>最新公告</span>
            </div>
            <el-button link>查看全部</el-button>
          </div>

          <div class="notice-list">
            <div v-for="(notice, index) in platformNotices" :key="index" class="notice-item">
              <span class="notice-text">{{ notice }}</span>
              <span class="notice-time">{{ new Date().toLocaleDateString() }}</span>
            </div>
          </div>
        </div>

        <!-- 停诊信息 -->
        <div class="notice-panel warning-panel">
          <div class="panel-header">
            <div class="notice-title">
              <el-icon>
                <Warning />
              </el-icon>
              <span>停诊信息</span>
            </div>
            <el-button link>查看全部</el-button>
          </div>

          <div class="notice-list">
            <div v-for="(notice, index) in stopNotices" :key="index" class="notice-item">
              <span class="notice-text">{{ notice }}</span>
              <span class="notice-time">{{ new Date().toLocaleDateString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@import '@/assets/css/common.css';

/* 搜索候选 */
.suggestion-name {
  font-weight: 500;
}

/* 快速入口 */
.quick-access {
  display: flex;
  justify-content: center;
  gap: 20px;
  flex-wrap: wrap;
}

.quick-access-item {
  padding: 8px 20px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s;
}

.quick-access-item:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* 主内容区域 */
.main-content {
  display: grid;
  margin: -40px auto 0;
  grid-template-columns: 1fr 300px;
  gap: 20px;
}

/* 筛选面板 */
.filter-panel {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group:last-child {
  margin-bottom: 0;
}

.filter-label {
  font-weight: 500;
  margin-bottom: 12px;
  color: #303133;
}

.filter-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-options .el-tag {
  cursor: pointer;
  margin-right: 8px;
  margin-bottom: 8px;
}

.filter-options .el-tag.is-active {
  background-color: var(--el-color-primary);
  border-color: var(--el-color-primary);
  color: white;
}

/* 医院列表 */
.hospital-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.hospital-card {
  cursor: pointer;
  transition: all 0.3s;
}

.hospital-card:hover {
  transform: translateY(-5px);
}

.hospital-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.hospital-logo {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}

.hospital-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hospital-logo .el-icon {
  font-size: 24px;
  color: #909399;
}

.hospital-info {
  flex: 1;
}

.hospital-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 500;
  color: #303133;
}

.hospital-tags {
  display: flex;
  gap: 8px;
}

.hospital-details {
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.hospital-intro {
  color: #909399;
  font-size: 13px;
  line-height: 1.5;
}

/* 右侧面板 */
.notice-panel {
  background: #ffffff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.notice-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  color: #303133;
}

.notice-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.notice-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
  border-bottom: 1px solid #ebeef5;
}

.notice-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.notice-text {
  color: #303133;
  font-size: 14px;
  line-height: 1.5;
}

.notice-time {
  color: #909399;
  font-size: 12px;
}

.warning-panel .header-title .el-icon {
  color: var(--el-color-danger);
}

/* 响应式布局 */
@media screen and (max-width: 1024px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .content-right {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 20px;
  }
}

@media screen and (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }

  .hero-subtitle {
    font-size: 1rem;
  }

  .quick-access {
    gap: 10px;
  }

  .quick-access-item {
    padding: 6px 15px;
    font-size: 14px;
  }

  .hospital-list {
    grid-template-columns: 1fr;
  }

  .content-right {
    grid-template-columns: 1fr;
  }
}

@media screen and (max-width: 480px) {
  .hero-section {
    padding: 40px 15px;
  }

  .hero-title {
    font-size: 1.5rem;
  }

  .main-content {
    padding: 0 15px;
    margin-top: -20px;
  }

  .filter-options {
    gap: 6px;
  }

  .hospital-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .hospital-logo {
    width: 80px;
    height: 80px;
  }

  .hospital-tags {
    justify-content: center;
  }
}
</style>