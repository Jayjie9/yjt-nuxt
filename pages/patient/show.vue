<script setup>
import { useRoute, useRouter } from 'nuxt/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowLeft } from '@element-plus/icons-vue'
import { useApi } from '~/composables'

const route = useRoute()
const router = useRouter()
const api = useApi()

// 响应式数据
const patient = ref({
  param: {},
  isInsure: 0
})
const loading = ref(false)

// 获取就诊人详情
const fetchDataById = async () => {
  try {
    loading.value = true
    const { data: response } = await api.patient.getByIdDollar(route.query.id)
    console.log('response', response.data);

    if (!response.data) {
      ElMessage.error('获取就诊人详情信息失败')
      return router.push('/patient')
    }
    patient.value = response.data
  } catch (error) {
    console.error('获取就诊人详情错误:', error)
    ElMessage.error('获取就诊人信息失败')
    router.push('/patient')
  } finally {
    loading.value = false
  }
}

// 删除就诊人
const remove = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该就诊人吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    await api.patient.removePatient(patient.value.id)
    ElMessage.success('删除成功')
    router.push('/patient')
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

// 编辑就诊人
const edit = () => {
  router.push({ path: '/patient/add', query: { id: patient.value.id } })
}

// 返回列表
const goBack = () => {
  router.push('/patient')
}

onMounted(() => {
  if (!route.query.id) {
    ElMessage.warning('未指定就诊人')
    return router.push('/patient')
  }
  fetchDataById()
})
</script>

<template>
  <div class="hospital-page">
    <div class="page-layout">
      <NavPatientNav />
      <div class="page-container">
        <div class="personal-patient" v-loading="loading">
          <div class="header">
            <div class="title">就诊人详情</div>
            <el-button link @click="goBack">
              <el-icon class="el-icon--left">
                <ArrowLeft />
              </el-icon>
              返回列表
            </el-button>
          </div>

          <el-card class="patient-info" shadow="never">
            <template #header>
              <div class="card-header">
                <div class="name">{{ patient.name }}</div>
                <el-tag size="small" :type="patient.isInsure === 0 ? 'warning' : 'success'" class="ml-10">
                  {{ patient.isInsure === 0 ? '自费' : '医保' }}
                </el-tag>
              </div>
            </template>

            <el-descriptions :column="2" border>
              <el-descriptions-item label="证件类型">
                {{ patient.param.certificatesTypeString }}
              </el-descriptions-item>
              <el-descriptions-item label="证件号码">
                {{ patient.certificatesNo }}
              </el-descriptions-item>
              <el-descriptions-item label="性别">
                {{ patient.sex === 1 ? '男' : '女' }}
              </el-descriptions-item>
              <el-descriptions-item label="出生日期">
                {{ patient.birthdate }}
              </el-descriptions-item>
              <el-descriptions-item label="手机号码">
                {{ patient.phone }}
              </el-descriptions-item>
              <el-descriptions-item label="婚姻状况">
                {{ patient.isMarry === 1 ? '已婚' : '未婚' }}
              </el-descriptions-item>
              <el-descriptions-item label="当前住址" :span="2">
                {{ patient.param.provinceString }}/{{ patient.param.cityString }}/{{ patient.param.districtString }}
              </el-descriptions-item>
              <el-descriptions-item label="详细地址" :span="2">
                {{ patient.address }}
              </el-descriptions-item>
            </el-descriptions>

            <div class="actions">
              <el-button type="primary" @click="edit">修改信息</el-button>
              <el-button type="danger" @click="remove">删除就诊人</el-button>
            </div>
          </el-card>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.header .title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.patient-info {
  background-color: #fff;
  border-radius: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-header .name {
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.actions {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  gap: 16px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  justify-content: flex-end;
}
</style>