<script setup>
import { useApi } from '~/composables'
import { useRoute, useRouter } from 'nuxt/app'
import { Search } from '@element-plus/icons-vue'

/* API & 路由 */
const route = useRoute()
const router = useRouter()
const api = useApi()
const orderInfoApi = api.order
const patientApi = api.patient
/* 定义响应式数据 */
const orderId = ref(route.query.orderId)
const loading = ref(true) // 加载中状态
const list = ref([])  // banner列表
const total = ref(0)  // 数据库中的总记录数
const page = ref(1)   // 默认页码
const limit = ref(10) // 每页记录数
const searchObj = reactive({}) // 查询表单对象
const patientList = ref([])
const statusList = ref([])
/* 辅助函数 - 根据订单状态返回对应的Element Plus标签类型 */
/* 辅助函数 */
function getStatusType(status) {
  switch (status) {
    case -1: return 'danger';  // 已取消
    case 0: return 'warning';  // 预约成功，待付款
    case 1: return 'success';  // 已支付
    case 2: return 'primary';  // 已取号
    default: return 'info';
  }
}
/* 身份证号脱敏处理函数 */
function maskCertificateNo(certificateNo) {
  if (!certificateNo) return '';
  // 保留前4位和后4位，中间用星号代替
  if (certificateNo.length > 8) {
    return certificateNo.substring(0, 4) + '********' + certificateNo.substring(certificateNo.length - 4);
  }
  // 如果证件号不足8位，则只显示前1位和后1位
  return certificateNo.substring(0, 1) + '*****' + certificateNo.substring(certificateNo.length - 1);
}

/* 获取就诊人列表 */
const findPatientList = async () => {
  const { data: response } = await patientApi.findListDollar()
  patientList.value = response.data
}
/* 获取订单状态列表 */
const getStatusList = async () => {
  const { data: response } = await orderInfoApi.getStatusListDollar()
  statusList.value = response.data
}
/* 获取订单列表 */
const fetchData = async (currentPage = 1) => {
  page.value = currentPage
  const { data: response } = await orderInfoApi.getOrderPageListDollar(page.value, limit.value, searchObj)
  list.value = response.data.records
  loading.value = false
  total.value = response.data.total
}


/* 处理分页大小改变事件，更新每页显示数量并重新获取第一页数据 */
const changeSize = (size) => {
  limit.value = size  // 更新每页显示数量
  fetchData(1)        // 重新获取第一页数据
}
/* 跳转到订单详情页 */
const show = (id) => {
  router.push({
    path: '/order/show',
    query: { orderId: id }
  })
}
const toSchedule = () => {
  router.push({
    path: '/'
  })
}
onMounted(async () => {
  await fetchData()
  await findPatientList()
  await getStatusList()
})
</script>

<template>
  <div class="order-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">我的订单</h1>
        <p class="page-subtitle">查看和管理您的挂号预约记录</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-layout">
        <div class="order-container">
          <el-card class="order-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <h2 class="section-title">
                  <span class="title-icon"></span>
                  挂号订单
                </h2>
              </div>
            </template>

            <!-- 搜索筛选区 -->
            <div class="filter-section">
              <el-form :inline="true" class="filter-form">
                <el-form-item label="就诊人">
                  <el-select v-model="searchObj.patientId" placeholder="请选择就诊人" class="filter-select" clearable>
                    <el-option v-for="item in patientList" :key="item.id"
                      :label="item.name + '【' + maskCertificateNo(item.certificatesNo) + '】'" :value="item.id" />
                  </el-select>
                </el-form-item>

                <el-form-item label="订单状态">
                  <el-select v-model="searchObj.orderStatus" placeholder="全部" class="filter-select" clearable>
                    <el-option v-for="item in statusList" :key="item.status" :label="item.comment"
                      :value="item.status" />
                  </el-select>
                </el-form-item>

                <el-form-item class="search-btn-item">
                  <el-button type="primary" @click="fetchData()" class="search-btn">
                    <el-icon class="el-icon--left">
                      <Search />
                    </el-icon>
                    查询
                  </el-button>
                </el-form-item>
              </el-form>
            </div>

            <!-- 订单列表 -->
            <div class="order-table-wrapper">
              <el-table :data="list" stripe border class="order-table" v-loading="!list.length && loading"
                element-loading-text="加载中..." empty-text="没有订单记录">
                <el-table-column label="就诊时间" width="150" align="center">
                  <template #default="{ row }">
                    <div class="time-cell">
                      <span class="date">{{ row.reserveDate }}</span>
                      <el-tag size="small" :type="row.reserveTime === 0 ? 'success' : 'warning'" effect="light">
                        {{ row.reserveTime === 0 ? '上午' : '下午' }}
                      </el-tag>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column label="医院信息" min-width="280">
                  <template #default="{ row }">
                    <div class="hospital-cell">
                      <div class="hospital-name">{{ row.hosname }}</div>
                      <div class="hospital-dept">
                        <el-tag size="small" effect="plain">{{ row.depname }}</el-tag>
                        <span class="doctor-title">{{ row.title }}</span>
                      </div>
                    </div>
                  </template>
                </el-table-column>

                <el-table-column prop="amount" label="医事服务费" width="120" align="center">
                  <template #default="{ row }">
                    <span class="amount">￥{{ row.amount }}</span>
                  </template>
                </el-table-column>

                <el-table-column prop="patientName" label="就诊人" width="120" align="center" />

                <el-table-column label="订单状态" width="120" align="center">
                  <template #default="{ row }">
                    <el-tag :type="getStatusType(row.orderStatus)" effect="light" class="status-tag">
                      {{ row.param.orderStatusString }}
                    </el-tag>
                  </template>
                </el-table-column>

                <el-table-column label="操作" width="100" fixed="right" align="center">
                  <template #default="{ row }">
                    <el-button type="primary" link @click="show(row.id)" class="action-btn">
                      详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <!-- 空数据提示 -->
              <el-empty v-if="list.length === 0" description="暂无订单数据" class="empty-data">
                <el-button type="primary" @click="toSchedule">去挂号</el-button>
              </el-empty>
            </div>

            <!-- 分页 -->
            <div class="pagination-wrapper">
              <el-pagination background :current-page="page" :total="total" :page-size="limit"
                layout="prev, pager, next, total" @current-change="fetchData" hide-on-single-page />
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面基础样式 */
.order-page {
  min-height: 100vh;
  background-color: var(--el-bg-color-page, #f5f7fa);
}

/* 页面头部 */
.page-header {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  padding: 60px 0 40px 0;
  color: white;
  text-align: center;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
}

.page-title {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.page-subtitle {
  font-size: 1rem;
  opacity: 0.9;
}

/* 主内容区域 */
.main-content {
  max-width: 1200px;
  margin: -20px auto 30px;
  padding: 0 20px;
  position: relative;
}

.content-layout {
  display: flex;
  gap: 20px;
}

.order-container {
  flex: 1;
}

/* 卡片样式 */
.order-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: var(--el-box-shadow-light);
}

.card-header {
  padding: 0;
  margin-bottom: 10px;
}

.section-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  position: relative;
  padding-left: 12px;
  display: flex;
  align-items: center;
}

.title-icon {
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: var(--el-color-primary);
  border-radius: 2px;
}

/* 筛选区域 */
.filter-section {
  background-color: var(--el-bg-color-page);
  padding: 24px 24px 12px 24px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  align-items: flex-end;
}

.filter-select {
  width: 220px;
}

.search-btn-item {
  margin-left: 8px;
  margin-right: 0;
}

.search-btn {
  padding: 10px 24px;
  font-weight: 500;
  border-radius: 4px;
  transition: all 0.3s;
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(24, 144, 255, 0.2);
}

.search-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.search-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}

/* 表格样式 */
.order-table-wrapper {
  margin-bottom: 20px;
  position: relative;
}

.order-table {
  width: 100%;
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

:deep(.el-table--border .el-table__cell) {
  border-right: 1px solid var(--el-border-color-lighter);
}

.time-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5px;
}

.date {
  font-weight: 500;
}

.hospital-cell {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.hospital-name {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.hospital-dept {
  display: flex;
  align-items: center;
  gap: 8px;
}

.doctor-title {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.amount {
  color: #f56c6c;
  font-weight: 500;
}

.status-tag {
  font-weight: 500;
}

.action-btn {
  font-size: 14px;
}

/* 空数据 */
.empty-data {
  padding: 40px 0;
}

/* 分页 */
.pagination-wrapper {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: var(--el-color-primary);
}

/* 响应式布局 */
@media screen and (max-width: 1024px) {
  .content-layout {
    flex-direction: column;
  }

  .filter-form {
    flex-direction: column;
  }

  .filter-select {
    width: 100% !important;
  }
}

@media screen and (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .page-subtitle {
    font-size: 0.9rem;
  }

  .main-content {
    padding: 0 15px;
    margin-top: -15px;
  }
}

@media screen and (max-width: 480px) {
  .page-header {
    padding: 30px 15px;
  }

  .filter-section {
    padding: 15px;
  }

  :deep(.el-table .cell) {
    padding-left: 8px;
    padding-right: 8px;
  }
}
</style>