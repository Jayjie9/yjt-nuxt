<script setup>
import { useRoute } from 'nuxt/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useApi } from '~/composables'

const route = useRoute()
const api = useApi()
const orderApi = api.order
const alipay = api.alipay

const orderId = ref(route.query.orderId)
const orderInfo = reactive({})

const init = async () => {
  const { data: response } = await orderApi.getOrderDetailDollar(orderId.value)
  Object.assign(orderInfo, response.data)
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
      console.error('支付请求失败:', error)
      ElMessage.error('支付请求失败，请重试')
    })
}

const pay = async () => {
  handlePay(orderId.value)
}


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
  <div class="hospital-page">
    <div class="page-layout">
      <NavOrderNav />
      <div class="page-container">
        <el-card class="order-detail" v-loading="loading">
          <template #header>
            <div class="card-header">
              <h2 class="title">挂号详情</h2>
            </div>
          </template>

          <div class="status-bar">
            <el-tag :type="orderInfo.orderStatus === 0 ? 'warning' : 'success'" size="large">
              {{ orderInfo.param?.orderStatusString }}
            </el-tag>
          </div>

          <div class="info-wrapper">
            <div class="section-title">
              <span class="icon"></span>
              <span>挂号信息</span>
            </div>

            <div class="info-form">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="就诊人">
                  {{ orderInfo.patientName }}
                </el-descriptions-item>
                <el-descriptions-item label="就诊日期">
                  {{ orderInfo.reserveDate }} {{ orderInfo.reserveTime === 0 ? '上午' : '下午' }}
                </el-descriptions-item>
                <el-descriptions-item label="就诊医院">
                  {{ orderInfo.hosname }}
                </el-descriptions-item>
                <el-descriptions-item label="就诊科室">
                  {{ orderInfo.depname }}
                </el-descriptions-item>
                <el-descriptions-item label="医生职称">
                  {{ orderInfo.title }}
                </el-descriptions-item>
                <el-descriptions-item label="医事服务费">
                  <span class="amount">¥{{ orderInfo.amount }}</span>
                </el-descriptions-item>
                <el-descriptions-item label="挂号单号">
                  {{ orderInfo.outTradeNo }}
                </el-descriptions-item>
                <el-descriptions-item label="挂号时间">
                  {{ orderInfo.createTime }}
                </el-descriptions-item>
              </el-descriptions>
            </div>
          </div>

          <div class="notice-wrapper">
            <div class="section-title">
              <span class="icon"></span>
              <span>注意事项</span>
            </div>
            <el-alert type="warning" :closable="false" show-icon>
              <template #default>
                <div class="notice-content">
                  <p>1、请确认就诊人信息是否准确，若填写错误将无法取号就诊，损失由本人承担；</p>
                  <p class="important">2、【取号】就诊当天需在{{ orderInfo.fetchTime }}在医院取号，未取号视为爽约，该号不退不换；</p>
                  <p>3、【退号】在{{ orderInfo.quitTime }}前可在线退号，逾期将不可办理退号退费；</p>
                  <p>4、北京114预约挂号支持自费患者使用身份证预约，同时支持北京市医保患者使用北京社保卡在平台预约挂号。请于就诊当日，携带预约挂号所使用的有效身份证件到院取号；</p>
                  <p>5、请注意北京市医保患者在住院期间不能使用社保卡在门诊取号。</p>
                </div>
              </template>
            </el-alert>
          </div>

          <div class="action-wrapper" v-if="orderInfo.orderStatus == 0 || orderInfo.orderStatus == 1">
            <el-button type="default" @click="cancelOrder">取消预约</el-button>
            <el-button v-if="orderInfo.orderStatus == 0" type="primary" @click="pay">立即支付</el-button>
          </div>
        </el-card>
      </div>
    </div>

  </div>
</template>

<style>
.hospital-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.page-layout {
  display: flex;
  gap: 20px;
  padding: 20px;
}

.page-container {
  flex: 1;
}

.order-detail {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.card-header {
  margin-bottom: 20px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.status-bar {
  margin: 20px 0;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  font-size: 16px;
  font-weight: 500;
  color: #333;
}

.section-title .icon {
  width: 4px;
  height: 16px;
  background-color: #409eff;
  margin-right: 8px;
  border-radius: 2px;
}

.info-form {
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.content {
  color: #333;
  font-size: 14px;
  line-height: 1.5;
}

.notice-wrapper {
  margin: 30px 0;
}

.notice-content {
  font-size: 14px;
  line-height: 1.8;
}

.notice-content p {
  margin: 8px 0;
}

.notice-content .important {
  color: #f56c6c;
  font-weight: 500;
}

.action-wrapper {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: 30px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

:deep(.el-form-item__label) {
  font-weight: 500;
  color: #606266;
}

:deep(.el-alert) {
  margin-top: 12px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

.fee {
  color: #f56c6c;
  font-size: 16px;
  font-weight: 500;
}
</style>
