<script setup>
import { useApi } from '~/composables'
import { useRoute } from 'nuxt/app'

const route = useRoute()
const api = useApi()
const orderInfoApi = api.order
const patientApi = api.patient


const list = ref([]) // banner列表
const total = ref(0) // 数据库中的总记录数
const page = ref(1) // 默认页码
const limit = ref(10) // 每页记录数
const searchObj = reactive({}) // 查询表单对象
const patientList = ref([])
const statusList = ref([])
const orderId = ref(route.query.orderId)


const fetchData = async (currentPage = 1) => {
  page.value = currentPage
  const { data: response } = await orderInfoApi.getOrderPageListDollar(page.value, limit.value, searchObj)
  list.value = response.data.records
  total.value = response.data.total
}

// 获取就诊人列表
const findPatientList = async () => {
  const { data: response } = await patientApi.findListDollar()
  patientList.value = response.data
}

// 获取订单状态列表
const getStatusList = async () => {
  const { data: response } = await orderInfoApi.getStatusListDollar()
  statusList.value = response.data
}

const changeSize = (size) => {
  limit.value = size
  fetchData(1)
}

const show = (id) => {
  window.location.href = '/order/show?orderId=' + id
}

onMounted(async () => {
  await fetchData()
  await findPatientList()
  await getStatusList()
})
</script>

<template>
  <div class="order-page">
    <div class="order-layout">
      <NavOrderNav />
      <div class="order-container">
        <el-card class="order-list-card">
          <template #header>
            <div class="order-card-header">
              <h2 class="order-title">挂号订单</h2>
            </div>
          </template>

          <div class="order-search">
            <el-form :inline="true" class="order-search-form">
              <el-form-item label="就诊人：">
                <el-select v-model="searchObj.patientId" placeholder="请选择就诊人" class="order-select">
                  <el-option v-for="item in patientList" :key="item.id"
                    :label="item.name + '【' + item.certificatesNo + '】'" :value="item.id" />
                </el-select>
              </el-form-item>
              <el-form-item label="订单状态：">
                <el-select v-model="searchObj.orderStatus" placeholder="全部" class="order-select">
                  <el-option v-for="item in statusList" :key="item.status" :label="item.comment" :value="item.status" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button type="primary" class="order-search-btn" @click="fetchData()">
                  查询
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <div class="order-table">
            <el-table :data="list" stripe border class="order-table-content">
              <el-table-column label="就诊时间" width="150" align="center">
                <template #default="{ row }">
                  {{ row.reserveDate }} {{ row.reserveTime === 0 ? '上午' : '下午' }}
                </template>
              </el-table-column>
              <el-table-column prop="hosname" label="医院" width="180" show-overflow-tooltip />
              <el-table-column prop="depname" label="科室" width="150" show-overflow-tooltip />
              <el-table-column prop="title" label="医生" width="120" />
              <el-table-column prop="amount" label="医事服务费" width="120">
                <template #default="{ row }">
                  <span class="order-amount">￥{{ row.amount }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="patientName" label="就诊人" width="120" />
              <el-table-column prop="param.orderStatusString" label="订单状态" width="120">
                <template #default="{ row }">
                  <el-tag :type="row.orderStatus === 0 ? 'warning' : 'success'" class="order-status-tag">
                    {{ row.param.orderStatusString }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="100" fixed="right" align="center">
                <template #default="{ row }">
                  <el-button type="primary" link class="order-detail-btn" @click="show(row.id)">
                    详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="order-pagination">
            <el-pagination background :current-page="page" :total="total" :page-size="limit"
              layout="prev, pager, next, total" @current-change="fetchData" />
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.order-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.order-layout {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.order-container {
  flex: 1;
}

.order-list-card {
  border-radius: 8px;
}

.order-card-header {
  padding: 0;
}

.order-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  position: relative;
  padding-left: 12px;
}

.order-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 18px;
  background-color: #409eff;
  border-radius: 2px;
}

.order-search {
  margin-bottom: 20px;
}

.order-search-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 4px;
}

.order-select {
  width: 220px !important;
}

.order-search-btn {
  margin-left: 16px;
}

.order-table {
  margin-bottom: 20px;
}

.order-table-content {
  width: 100%;
}

:deep(.el-table) {
  border-radius: 4px;
  overflow: hidden;
}

:deep(.el-table th) {
  background-color: #f5f7fa !important;
  color: #606266;
  font-weight: 500;
}

.order-amount {
  color: #f56c6c;
  font-weight: 500;
}

.order-status-tag {
  font-weight: 500;
}

.order-detail-btn {
  font-size: 14px;
}

.order-pagination {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

:deep(.el-pagination.is-background .el-pager li:not(.is-disabled).is-active) {
  background-color: #409eff;
}

@media screen and (max-width: 1200px) {
  .order-layout {
    flex-direction: column;
  }

  .order-search-form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .order-select {
    width: 100% !important;
  }

  .order-search-btn {
    margin-left: 0;
    width: 100%;
  }
}
</style>