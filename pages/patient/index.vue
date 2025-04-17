<script setup>
import { useRouter } from 'nuxt/app'
import { useApi } from '~/composables'
import { ElMessage, ElMessageBox } from 'element-plus'
import { ArrowRight, Plus, Delete, Edit } from '@element-plus/icons-vue'

const api = useApi()
const router = useRouter()

const patientList = ref([])
const loading = ref(false)
const maxPatients = 5
const length = ref(0)

// 获取就诊人列表
const findPatientList = async () => {
    try {
        loading.value = true
        const { data: response } = await api.patient.findListDollar()
        patientList.value = response.data
        length.value = response.data.length
    } catch (error) {
        ElMessage.error('获取就诊人列表失败')
        console.error(error)
    } finally {
        loading.value = false
    }
}

// 添加就诊人
const add = () => {
    if (patientList.value.length >= maxPatients) {
        return ElMessage.warning(`最多只能添加${maxPatients}个就诊人`)
    }
    router.push({ path: '/patient/add' })
}

// 查看详情
const show = (id) => {
    router.push({ path: '/patient/show', query: { id } })
}

// 编辑就诊人
const edit = (id) => {
    router.push({ path: '/patient/add', query: { id } })
}

// 删除就诊人
const remove = async (id) => {
    try {
        await ElMessageBox.confirm('确定要删除该就诊人吗？', '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        })
        await api.patient.removeById(id)
        ElMessage.success('删除成功')
        await findPatientList()
    } catch (error) {
        if (error !== 'cancel') {
            ElMessage.error('删除失败')
        }
    }
}

onMounted(() => {
    findPatientList()
})
</script>
<template>
    <div class="hospital-page">
        <div class="page-layout">
            <NavPatientNav />
            <div class="page-container">
                <div class="personal-patient" v-loading="loading">
                    <div class="header-wrapper">
                        <div class="title">就诊人管理</div>
                        <div class="tips">
                            您可以添加最多{{ maxPatients }}个就诊人，添加的就诊人信息将用于预约挂号，请确保信息真实准确
                            <span class="count">({{ length }}/{{ maxPatients }})</span>
                        </div>
                    </div>
                    <div class="content-wrapper">
                        <TransitionGroup name="list">
                            <el-card v-for="item in patientList" :key="item.id" class="patient-card" shadow="hover">
                                <template #header>
                                    <div class="card-header">
                                        <div class="left">
                                            <span class="name">{{ item.name }}</span>
                                            <el-tag size="small" :type="item.isInsure === 0 ? 'warning' : 'success'"
                                                class="ml-10">
                                                {{ item.isInsure === 0 ? '自费' : '医保' }}
                                            </el-tag>
                                        </div>
                                        <div class="right">
                                            <el-button-group>
                                                <el-button link type="primary" @click="show(item.id)">
                                                    查看详情 <el-icon>
                                                        <ArrowRight />
                                                    </el-icon>
                                                </el-button>
                                                <el-button link type="primary" @click="edit(item.id)">
                                                    <el-icon>
                                                        <Edit />
                                                    </el-icon>
                                                </el-button>
                                                <el-button link type="danger" @click="remove(item.id)">
                                                    <el-icon>
                                                        <Delete />
                                                    </el-icon>
                                                </el-button>
                                            </el-button-group>
                                        </div>
                                    </div>
                                </template>
                                <div class="card-content">
                                    <div class="info-row">
                                        <span class="label">证件信息：</span>
                                        <span class="value">{{ item.param.certificatesTypeString }} {{
                    item.certificatesNo }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">性别/生日：</span>
                                        <span class="value">{{ item.sex === 1 ? '男' : '女' }} {{ item.birthdate }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">手机号码：</span>
                                        <span class="value">{{ item.phone }}</span>
                                    </div>
                                    <div class="info-row">
                                        <span class="label">居住地址：</span>
                                        <span class="value">{{ item.param.fullAddress }}</span>
                                    </div>
                                </div>
                            </el-card>
                            <div class="item-add-wrapper" :key="'add'" @click="add" v-if="length < maxPatients">
                                <el-card class="add-card" shadow="hover">
                                    <el-icon class="add-icon">
                                        <Plus />
                                    </el-icon>
                                    <div class="add-text">添加就诊人</div>
                                </el-card>
                            </div>
                        </TransitionGroup>
                    </div>
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

.header-wrapper {
    margin-bottom: 20px;
}

.header-wrapper .title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 10px;
}

.header-wrapper .tips {
    font-size: 14px;
    color: #909399;
    display: flex;
    align-items: center;
    gap: 10px;
}

.header-wrapper .count {
    color: #409eff;
    font-weight: 500;
}

.content-wrapper {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
    padding: 20px 0;
}

.patient-card {
    border-radius: 8px;
    transition: all 0.3s ease;
}

.patient-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-header .left {
    display: flex;
    align-items: center;
    gap: 10px;
}

.card-header .left .name {
    font-size: 16px;
    font-weight: 600;
}

.card-content {
    padding: 15px 0;
}

.info-row {
    margin-bottom: 12px;
    font-size: 14px;
    line-height: 1.6;
    display: flex;
}

.info-row:last-child {
    margin-bottom: 0;
}

.info-row .label {
    color: #909399;
    min-width: 80px;
}

.info-row .value {
    color: #333;
    flex: 1;
}

.add-card {
    height: 100%;
    min-height: 250px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 2px dashed #dcdfe6;
    background-color: #fafafa;
    transition: all 0.3s ease;
}

.add-card:hover {
    border-color: #409eff;
    color: #409eff;
    background-color: #f0f7ff;
}

.add-icon {
    font-size: 40px;
    margin-bottom: 15px;
}

.add-text {
    font-size: 16px;
    font-weight: 500;
}

/* 列表动画 */
.list-enter-active,
.list-leave-active {
    transition: all 0.5s ease;
}

.list-enter-from,
.list-leave-to {
    opacity: 0;
    transform: translateY(30px);
}

.list-move {
    transition: transform 0.5s ease;
}
</style>