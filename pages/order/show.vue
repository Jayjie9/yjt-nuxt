<script setup>
import { useRoute, useRouter } from 'nuxt/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApi } from '~/composables'
import { ArrowLeft, Clock, InfoFilled, SuccessFilled, WarningFilled, Document } from '@element-plus/icons-vue'

/* API & 路由 */
const route = useRoute()
const router = useRouter()
const api = useApi()
const orderApi = api.order
const alipay = api.alipay
/* 定义响应式数据 */
const orderId = ref(route.query.orderId)
const orderInfo = reactive({})
const loading = ref(true)
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

/* 初始化订单详情 */
const init = async () => {
  loading.value = true
  try {
    const { data: response } = await orderApi.getOrderDetailDollar(orderId.value)
    Object.assign(orderInfo, response.data)
  } catch (error) {
    ElMessage.error('获取订单详情失败，请稍后再试')
  } finally {
    loading.value = false
  }
}
/* 返回订单列表 */
const goBack = () => {
  router.push('/order')
}
/* Alipay 支付 */
const pay = async () => {
  handlePay(orderId.value)
}
/* 模拟 Alipay 支付 */
const payTest = async () => {
  alipay.toPayTest(orderId.value)
    .then(res => {
      console.log('支付结果:', res.data);

      if (res.data.code == 200) {
        ElMessage.success('支付成功')
        if (import.meta.client) {
          window.location.reload()
        }
      } else {
        ElMessage.error('支付失败')
      }
    })
}
function handlePay(orderId) {
  alipay.toPay(orderId)
    .then(res => {
      if (import.meta.client) {
        let divForm = document.getElementsByTagName('divform')
        if (divForm.length) {
          document.body.removeChild(divForm[0])
        }
        const div = document.createElement('divform')
        div.style.display = 'none'  // 隐藏表单
        div.innerHTML = res.data
        document.body.appendChild(div)

        // 使用 nextTick 确保 DOM 更新后执行
        nextTick(() => {
          const form = document.forms[0]
          if (form) {
            form.submit()
          }
        })
      }
    })
    .catch(error => {
      ElMessage.error('支付请求失败，请重试', error)
    })
}
/* 取消预约按钮 */
const cancelOrder = async () => {
  try {
    await ElMessageBox.confirm('确定取消预约吗?', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    const { data: cancelResp } = await orderApi.cancelOrderDollar(orderId.value)
    if (cancelResp.code === 226) {
      ElMessage.error('取消失败:' + cancelResp.message)
    } else {
      ElMessage.success('取消成功')
    }
    await init()
  } catch {
    ElMessage.info('预约状态同步中，请稍后再试')
  }
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="order-detail-page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">挂号详情</h1>
        <p class="page-subtitle">查看您的挂号预约详细信息</p>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="content-container">
        <!-- 返回按钮 -->
        <div class="back-button-container">
          <el-button @click="goBack" class="back-button" type="default" size="default">
            <el-icon>
              <ArrowLeft />
            </el-icon>
            返回订单列表
          </el-button>
        </div>

        <!-- 订单详情卡片 -->
        <el-card class="detail-card" shadow="hover" v-loading="loading" element-loading-text="加载订单信息中...">
          <!-- 订单状态栏 -->
          <div class="status-section">
            <div class="status-icon">
              <el-icon v-if="orderInfo.orderStatus === -1">
                <WarningFilled />
              </el-icon>
              <el-icon v-else-if="orderInfo.orderStatus === 0">
                <Clock />
              </el-icon>
              <el-icon v-else-if="orderInfo.orderStatus === 1">
                <InfoFilled />
              </el-icon>
              <el-icon v-else-if="orderInfo.orderStatus === 2">
                <SuccessFilled />
              </el-icon>
              <el-icon v-else>
                <Document />
              </el-icon>
            </div>
            <div class="status-info">
              <h2 class="status-title">{{ orderInfo.param?.orderStatusString || '加载中...' }}</h2>
              <p class="status-desc" v-if="orderInfo.orderStatus === 0">
                请尽快完成支付，未支付订单将在30分钟后自动取消
              </p>
              <p class="status-desc" v-else-if="orderInfo.orderStatus === 1">
                请按照医院要求，在就诊当天及时取号
              </p>
              <p class="status-desc" v-else-if="orderInfo.orderStatus === 2">
                就诊已完成，感谢您的使用
              </p>
              <p class="status-desc" v-else-if="orderInfo.orderStatus === -1">
                订单已取消
              </p>
            </div>
            <div class="status-tag">
              <el-tag :type="getStatusType(orderInfo.orderStatus)" size="large" effect="light" class="status-tag-item">
                {{ orderInfo.param?.orderStatusString }}
              </el-tag>
            </div>
          </div>

          <!-- 订单信息部分 -->
          <div class="info-section">
            <div class="section-header">
              <div class="section-title">
                <span class="title-icon"></span>
                <span>挂号信息</span>
              </div>
            </div>

            <div class="info-content">
              <el-descriptions :column="2" border size="large" class="descriptions-table">
                <el-descriptions-item label="就诊人">
                  <span class="info-value">{{ orderInfo.patientName }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="就诊日期">
                  <span class="info-value">
                    {{ orderInfo.reserveDate }}
                    <el-tag size="small" :type="orderInfo.reserveTime === 0 ? 'success' : 'warning'" effect="light">
                      {{ orderInfo.reserveTime === 0 ? '上午' : '下午' }}
                    </el-tag>
                  </span>
                </el-descriptions-item>
                <el-descriptions-item label="就诊医院">
                  <span class="info-value hospital-name">{{ orderInfo.hosname }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="就诊科室">
                  <span class="info-value">{{ orderInfo.depname }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="医生职称">
                  <span class="info-value">{{ orderInfo.title }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="医事服务费">
                  <span class="info-value amount">¥{{ orderInfo.amount }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="挂号单号">
                  <span class="info-value order-number">{{ orderInfo.outTradeNo }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="挂号时间">
                  <span class="info-value">{{ orderInfo.createTime }}</span>
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>

          <!-- 注意事项部分 -->
          <div class="notice-section">
            <div class="section-header">
              <div class="section-title">
                <span class="title-icon"></span>
                <span>注意事项</span>
              </div>
            </div>

            <div class="notice-content">
              <div class="notice-list">
                <p><el-icon class="notice-icon">
                    <WarningFilled />
                  </el-icon>1、请确认就诊人信息是否准确，若填写错误将无法取号就诊，损失由本人承担；</p>
                <p class="important"><el-icon class="notice-icon">
                    <WarningFilled />
                  </el-icon>2、【取号】就诊当天需在{{ orderInfo.fetchTime }}取号，未取号视为爽约，该号不退不换；</p>
                <p><el-icon class="notice-icon">
                    <WarningFilled />
                  </el-icon>3、【退号】在{{ orderInfo.quitTime }}前可在线退号，逾期将不可办理退号退费；</p>
                <p><el-icon class="notice-icon">
                    <WarningFilled />
                  </el-icon>4、预约挂号支持自费患者使用身份证预约，同时支持医保患者使用社保卡在平台预约挂号。请于就诊当日，携带预约挂号所使用的有效身份证件到院取号；</p>
                <p><el-icon class="notice-icon">
                    <WarningFilled />
                  </el-icon>5、请珍惜您挂到的号码，多次取消可能会被拉入黑名单。</p>
              </div>
            </div>
          </div>

          <!-- 操作按钮部分 -->
          <div class="action-section" v-if="orderInfo.orderStatus == 0 || orderInfo.orderStatus == 1">
            <el-button type="default" @click="cancelOrder" class="cancel-btn">取消预约</el-button>
            <el-popconfirm title="点击确定跳转到支付页面" @confirm="pay" placement="top-start">
              <template #reference>
                <el-button v-if="orderInfo.orderStatus == 0" type="primary" class="pay-btn">立即支付</el-button>
              </template>
            </el-popconfirm>
            <el-popconfirm title="点击确定直接支付成功" @confirm="payTest" placement="top-start">
              <template #reference>
                <el-button v-if="orderInfo.orderStatus == 0" type="primary" class="pay-btn">模拟支付</el-button>
              </template>
            </el-popconfirm>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 页面基础样式 */
.order-detail-page {
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
  max-width: 1000px;
  margin: -20px auto 30px;
  padding: 0 20px;
  position: relative;
}

.content-container {
  position: relative;
}

/* 返回按钮 */
.back-button-container {
  margin-bottom: 16px;
}

.back-button {
  display: flex;
  align-items: center;
  gap: 5px;
}

/* 详情卡片 */
.detail-card {
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
  box-shadow: var(--el-box-shadow-light);
  margin-bottom: 30px;
}

/* 状态部分 */
.status-section {
  display: flex;
  align-items: center;
  padding: 24px;
  background: linear-gradient(to right, rgba(24, 144, 255, 0.05), rgba(24, 144, 255, 0.1));
  border-radius: 8px;
  margin-bottom: 24px;
}

.status-icon {
  font-size: 48px;
  margin-right: 20px;
  color: var(--el-color-primary);
}

.status-info {
  flex: 1;
}

.status-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  color: var(--el-text-color-primary);
}

.status-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.status-tag-item {
  font-size: 14px;
  padding: 8px 16px;
}

/* 信息部分 */
.info-section,
.notice-section {
  margin-bottom: 30px;
}

.section-header {
  margin-bottom: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.title-icon {
  width: 4px;
  height: 18px;
  background-color: var(--el-color-primary);
  margin-right: 8px;
  border-radius: 2px;
}

.info-content {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.info-value {
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.hospital-name {
  color: var(--el-color-primary);
}

.amount {
  color: #f56c6c;
  font-weight: 600;
}

.order-number {
  font-family: monospace;
  background-color: #f0f0f0;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 13px;
}

/* 注意事项部分 */
.notice-content {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  border-radius: 8px;
  padding: 16px 24px;
  margin-top: 0;
}

.notice-list {
  font-size: 14px;
  line-height: 1.8;
  color: #606266;
}

.notice-list p {
  margin: 10px 0;
  display: flex;
  align-items: flex-start;
}

.notice-icon {
  margin-right: 8px;
  color: #e6a23c;
  font-size: 16px;
  margin-top: 3px;
}

.notice-list .important {
  color: #f56c6c;
  font-weight: 500;
}

.notice-list .important .notice-icon {
  color: #f56c6c;
}

/* 描述列表样式：修改element-plus组件内部样式 */
:deep(.el-descriptions__label) {
  font-weight: 500;
  color: var(--el-text-color-secondary);
  background-color: #f5f7fa;
}

:deep(.el-descriptions__cell) {
  padding: 16px;
}

/* 操作按钮部分 */
.action-section {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.cancel-btn,
.pay-btn {
  min-width: 120px;
  padding: 12px 20px;
  font-size: 16px;
}

.pay-btn {
  background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
}

.pay-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(24, 144, 255, 0.3);
}

.pay-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(24, 144, 255, 0.2);
}


/* 响应式布局 */
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

  .status-section {
    flex-direction: column;
    text-align: center;
    padding: 20px;
  }

  .status-icon {
    margin-right: 0;
    margin-bottom: 16px;
  }

  .status-tag {
    margin-top: 16px;
  }

  :deep(.el-descriptions) {
    width: 100%;
  }

  :deep(.el-descriptions__body) {
    display: block;
  }

  :deep(.el-descriptions__table) {
    display: block;
    width: 100%;
  }

  :deep(.el-descriptions__cell) {
    display: block;
    width: 100%;
  }

  .action-section {
    flex-direction: column;
    align-items: center;
  }

  .cancel-btn,
  .pay-btn {
    width: 100%;
  }
}
</style>