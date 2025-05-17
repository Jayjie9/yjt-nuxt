<script setup lang="ts">
import { Search, OfficeBuilding, Clock, ArrowDown, ArrowRight, Notification, Warning, Location, Trophy } from '@element-plus/icons-vue'
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
const totalElements = ref(0) // 总记录数
/* 筛选相关 */
const searchObj = reactive<HospitalQueryParams>({})
const hosNatureActiveIndex = ref(0)
const hosLevelActiveIndex = ref(0)
const hosTypeActiveIndex = ref(0)
const provinceActiveIndex = ref(0)
const isDistrictExpanded = ref(false)
const initialDisplayCount = 11  // 首行显示的地区数量
/* 搜索相关 */
let links = ref<LinkItem[]>([])
let timeout: ReturnType<typeof setTimeout>
/* 数据列表 */
const hospitalList = ref<Hospital[]>([])
const hosNatureList = ref<any[]>([])
const hosLevelList = ref<any[]>([])
const hosTypeList = ref<any[]>([])
const districtList = ref<any[]>([])
/* 加载状态 */
const loading = ref(false)
const filterLoading = ref(true) // 筛选面板加载状态

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
const { data: hosNatureData } = await useAsyncData('HosNature', () =>
  dictionary.findByDictCodeDollar('HosNature')
)
const { data: hosLevelData } = await useAsyncData('hosLevel', () =>
  dictionary.findByDictCodeDollar('HosLevel')
)
const { data: hosTypeData } = await useAsyncData('hostype', () =>
  dictionary.findByDictCodeDollar('hostype')
)
/* 初始化数据 */
const init = () => {
  try {
    filterLoading.value = true
    // 查询医院等级列表
    hosNatureList.value = [{ id: 0, name: '全部', value: '' }]
    if (hosNatureData.value?.data?.data) {  // 修改这里，增加安全访问
      let names = hosNatureData.value.data.data
      hosNatureList.value.push(...names)
    }
    // 查询医院等级列表
    hosLevelList.value = [{ id: 0, name: '全部', value: '' }]
    if (hosLevelData.value?.data?.data) {  // 修改这里，增加安全访问
      let names = hosLevelData.value.data.data
      hosLevelList.value.push(...names)
    }
    // 查询医院类型列表
    hosTypeList.value = [{ id: 0, name: '全部', value: '' }]
    if (hosTypeData.value?.data?.data) {  // 修改这里，增加安全访问
      let names = hosTypeData.value.data.data
      hosTypeList.value.push(...names)
    }
    // 查询地区数据
    districtList.value = [{ id: 0, name: '全部', value: '' }]
    if (districtData.value?.data?.data) {  // 修改这里，增加安全访问
      let dists = districtData.value.data.data
      districtList.value.push(...dists)
    }
  } catch (error) {
    console.error('初始化数据失败', error)
  } finally {
    filterLoading.value = false
  }
}
/* 获取医院列表 */
const getHospitalList = async () => {
  try {
    loading.value = true
    const { data: response } = await hospital.getHospPageListDollar(page.value, limit.value, searchObj)
    if (response.data) {
      hospitalList.value = response.data.content
      totalPages.value = response.data.totalPages
      totalElements.value = response.data.totalElements // 获取总记录数
    }
  } catch (error) {
    console.error('获取医院列表失败', error)
  } finally {
    loading.value = false
  }
}

/* 分页处理函数 */
const handleCurrentChange = (val: number) => {
  page.value = val
  loading.value = true // 设置加载状态
  getHospitalList()
}

const handleSizeChange = (val: number) => {
  limit.value = val
  page.value = 1 // 切换每页记录数时重置为第一页
  loading.value = true // 设置加载状态
  getHospitalList()
}
/* 根据医院性质筛选 */
const hosNatureSelect = (hosNature: string, index: number) => {
  hospitalList.value = []
  page.value = 1
  hosNatureActiveIndex.value = index
  if (index === 0) {
    delete searchObj.nature // 选择"全部"时删除该属性
  } else {
    searchObj.nature = hosNature
  }
  loading.value = true // 设置加载状态
  getHospitalList()
}
/* 根据医院等级筛选 */
const hosLevelSelect = (hosLevel: string, index: number) => {
  hospitalList.value = []
  page.value = 1
  hosLevelActiveIndex.value = index
  if (index === 0) {
    delete searchObj.level // 选择"全部"时删除该属性
  } else {
    searchObj.level = hosLevel
  }
  loading.value = true // 设置加载状态
  getHospitalList()
}
/* 根据医院类型筛选 */
const hosTypeSelect = (hosType: string, index: number) => {
  hospitalList.value = []
  page.value = 1
  hosTypeActiveIndex.value = index
  if (index === 0) {
    delete searchObj.hostype // 选择"全部"时删除该属性
  } else {
    searchObj.hostype = hosType
  }
  loading.value = true // 设置加载状态
  getHospitalList()
}
/* 根据地区筛选 */
const districtSelect = (districtCode: string, index: number) => {
  hospitalList.value = []
  page.value = 1
  provinceActiveIndex.value = index
  if (index === 0) {
    delete searchObj.provinceCode // 选择"全部"时删除该属性
  } else {
    searchObj.provinceCode = districtCode
  }
  loading.value = true // 设置加载状态
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
      let results
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
    <p>为了提供更优质的服务，我们的系统将于2025年4月25凌晨2:00-4:00进行例行维护升级。维护期间，网站及APP将暂停服务，给您带来的不便敬请谅解。</p>
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

/* 为没有logo的医院生成颜色 */
const getHospitalColor = (hosname: string) => {
  // 医疗主题颜色数组
  const medicalColors = [
    '#4a9cd8', // 医疗蓝
    '#42b983', // 医疗绿
    '#5c6bc0', // 靛蓝色
    '#26a69a', // 蓝绿色
    '#66bb6a', // 绿色
    '#7986cb', // 靛蓝色变种
    '#4db6ac', // 蓝绿色变种
    '#81c784'  // 绿色变种
  ]

  // 根据医院名称生成一个稳定的索引
  let hashCode = 0
  for (let i = 0; i < hosname.length; i++) {
    hashCode += hosname.charCodeAt(i)
  }

  // 使用取模运算获取颜色索引
  const colorIndex = hashCode % medicalColors.length
  return medicalColors[colorIndex]
}

/* 过渡动画钩子 */
const beforeEnter = (el: any) => {
  el.style.opacity = 0
  el.style.transform = 'translateY(20px)'
}

const enter = (el: any, done: any) => {
  const delay = el.dataset.index * 50 || 0 // 减少延迟时间
  setTimeout(() => {
    el.style.transition = 'all 0.3s ease'
    el.style.opacity = 1
    el.style.transform = 'translateY(0)'
    done()
  }, delay)
}

const leave = (el: any, done: any) => {
  // 移除延迟，让所有元素同时开始离开动画
  el.style.transition = 'all 0.3s ease'
  el.style.opacity = 0
  el.style.transform = 'translateY(-10px)' // 减小位移距离
  setTimeout(done, 300)
}
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
        <div class="filter-panel" v-loading="filterLoading">

          <div class="filter-group">
            <div class="filter-label">医院性质</div>
            <div class="filter-options">
              <el-tag v-for="(item, index) in hosNatureList" :key="item.id"
                :class="{ 'is-active': hosNatureActiveIndex === index }" @click="hosNatureSelect(item.value, index)"
                :effect="hosNatureActiveIndex === index ? 'dark' : 'plain'">
                {{ item.name }}
              </el-tag>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">医院等级</div>
            <div class="filter-options">
              <el-tag v-for="(item, index) in hosLevelList" :key="item.id"
                :class="{ 'is-active': hosLevelActiveIndex === index }" @click="hosLevelSelect(item.value, index)"
                :effect="hosLevelActiveIndex === index ? 'dark' : 'plain'">
                {{ item.name }}
              </el-tag>
            </div>
          </div>

          <div class="filter-group">
            <div class="filter-label">医院类型</div>
            <div class="filter-options">
              <el-tag v-for="(item, index) in hosTypeList" :key="item.id"
                :class="{ 'is-active': hosTypeActiveIndex === index }" @click="hosTypeSelect(item.value, index)"
                :effect="hosTypeActiveIndex === index ? 'dark' : 'plain'">
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
        <div class="hospital-list" v-loading="loading">
          <transition name="fade">
            <!-- 空状态提示 -->
            <div v-if="!loading && hospitalList.length === 0" class="empty-state">
              <svg class="empty-illustration" width="200" height="200" viewBox="0 0 200 200" fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path d="M100 180c44.183 0 80-35.817 80-80s-35.817-80-80-80-80 35.817-80 80 35.817 80 80 80z"
                  fill="#f0f7ff" />
                <path d="M65 70h70v60H65z" fill="#e6f0ff" />
                <path d="M75 85h50v30H75z" fill="white" />
                <path d="M97 75v-10M103 75v-10M85 100h30M85 105h20" stroke="#1890ff" stroke-width="2"
                  stroke-linecap="round" />
                <path d="M65 70h70v10H65z" fill="#1890ff" />
                <circle cx="140" cy="75" r="3" fill="white" />
              </svg>
              <h3 class="empty-title">暂无符合条件的医院</h3>
              <p class="empty-description">您可以尝试：</p>
              <ul class="empty-suggestions">
                <li>调整筛选条件</li>
                <li>使用关键词搜索</li>
                <li>查看其他地区的医院</li>
              </ul>
            </div>
          </transition>
          <transition-group name="fade-list" appear @before-enter="beforeEnter" @enter="enter" @leave="leave">
            <el-card v-for="(item, index) in hospitalList" :key="item.id" class="hospital-card" shadow="hover"
              :data-index="index" @click="navigateToHospital(item.hoscode)">
              <div class="hospital-card-badge"
                v-if="item.param?.hosLevelString && item.param.hosLevelString.includes('三')">
                <el-icon>
                  <Trophy />
                </el-icon>
              </div>
              <div class="hospital-header">
                <div class="hospital-logo" :style="{ backgroundColor: getHospitalColor(item.hosname) }">
                  <img v-if="item.logoData" :src="`data:image/jpeg;base64,${item.logoData}`" :alt="item.hosname" />
                  <span v-else class="hospital-logo-text">{{ item.hosname.substring(0, 2) }}</span>
                </div>
                <div class="hospital-info">
                  <h3 class="hospital-name">{{ item.hosname }}</h3>
                  <div class="hospital-tags">
                    <el-tag size="small" type="success" effect="plain" v-if="item.bookingRule">
                      预约挂号
                    </el-tag>
                    <el-tag size="small" type="info" effect="plain">
                      {{ item.param?.hostypeString || '其他类型' }}
                    </el-tag>
                    <el-tag size="small" type="danger" effect="plain">
                      {{ item.param?.hosLevelString || '其他等级' }}
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
                  <span class="address-text">{{ item.param?.fullAddress || '地址信息暂无' }}</span>
                </div>
              </div>

              <div class="hospital-intro">
                <template v-if="item.intro">{{ item.intro.substring(0, 100) }}{{ item.intro.length > 100 ? '...' : ''
                }}</template>
                <template v-else>该医院暂无详细介绍，请点击查看更多信息。</template>
              </div>
            </el-card>
          </transition-group>
        </div>

        <!-- 分页组件 -->
        <div class="pagination-container" v-if="totalPages > 0">
          <el-pagination v-model:current-page="page" v-model:page-size="limit" :page-sizes="[5, 10, 20]"
            layout="total, sizes, prev, pager, next, jumper" :total="totalElements" @size-change="handleSizeChange"
            @current-change="handleCurrentChange" background />
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

/* 页面头部样式 */
.page-header {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 60px 20px;
  color: #ffffff;
  position: relative;
  overflow: hidden;
}

/* 分页容器样式 */
.pagination-container {
  min-height: 48px;
  margin-top: 20px;
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* 医院列表容器样式 */
.hospital-list {
  min-height: 400px;
  position: relative;
}

.page-header::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxkZWZzPjxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHBhdHRlcm5Vbml0cz0idXNlclNwYWNlT25Vc2UiIHBhdHRlcm5UcmFuc2Zvcm09InJvdGF0ZSgzMCkiPjxwYXRoIGQ9Ik0gMCwxMCBMIDEwLDAgTCAyMCwxMCBMIDEwLDIwIHoiIGZpbGw9Im5vbmUiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPjwvc3ZnPg==');
  opacity: 0.4;
  z-index: 0;
}

.header-content {
  position: relative;
  z-index: 1;
}

/* 空状态样式 */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  background: #ffffff;
  border-radius: 8px;
  text-align: center;
}

.empty-illustration {
  margin-bottom: 20px;
  animation: float 3s ease-in-out infinite;
}

@keyframes float {

  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-10px);
  }
}

.empty-title {
  color: #1890ff;
  font-size: 1.5rem;
  margin-bottom: 10px;
}

.empty-description {
  color: #666;
  margin-bottom: 15px;
}

.empty-suggestions {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #8c8c8c;
}

.empty-suggestions li {
  margin: 5px 0;
  font-size: 0.9rem;
}

.empty-suggestions li:before {
  content: '•';
  color: #1890ff;
  margin-right: 8px;
}

/* 过渡动画 */
.fade-list-enter-active,
.fade-list-leave-active {
  transition: all 0.5s ease;
}

.fade-list-enter-from,
.fade-list-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* 加载状态样式 */
.filter-panel,
.hospital-list {
  position: relative;
  min-height: 100px;
}

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
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  transition: all 0.3s ease;
  margin-bottom: 30px;
}

@media (max-width: 768px) {
  .hospital-list {
    grid-template-columns: 1fr;
  }
}

.hospital-card {
  cursor: pointer;
  transition: all 0.3s;
  border-radius: 12px;
  overflow: hidden;
  border: none;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  position: relative;
}

.hospital-card-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: linear-gradient(135deg, #ffd04b 0%, #f56c6c 100%);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 2px 6px rgba(245, 108, 108, 0.4);
  z-index: 1;
}

.hospital-card-badge .el-icon {
  color: #fff;
  font-size: 14px;
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.2));
}

.hospital-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.hospital-header {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  align-items: center;
}

.hospital-logo {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #4a9cd8;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.hospital-card:hover .hospital-logo {
  transform: scale(1.05);
}

.hospital-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hospital-logo-text {
  color: white;
  font-size: 20px;
  font-weight: bold;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
}

.hospital-info {
  flex: 1;
  min-width: 0;
  /* 确保弹性项可以缩小到比内容更小 */
}

.hospital-name {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.hospital-tags {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.hospital-details {
  margin-bottom: 12px;
  border-top: 1px solid #f0f2f5;
  padding-top: 12px;
}

.detail-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 8px;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.address-text {
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  word-break: break-all;
}

.hospital-intro {
  color: #606266;
  font-size: 13px;
  line-height: 1.6;
  border-top: 1px solid #f0f2f5;
  padding-top: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
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

/* 分页容器 */
.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
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