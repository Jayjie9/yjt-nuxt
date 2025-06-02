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
        await api.patient.removePatient(id)
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
    <div class="patient-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">就诊人管理</h1>
                <p class="page-subtitle">管理您的就诊人信息，用于预约挂号和医疗服务</p>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
            <div class="content-container">
                <!-- 就诊人管理说明 -->
                <div class="info-banner">
                    <div class="info-icon">
                        <el-icon>
                            <Plus />
                        </el-icon>
                    </div>
                    <div class="info-content">
                        <h3>添加就诊人</h3>
                        <p>您可以添加最多{{ maxPatients }}个就诊人，添加的就诊人信息将用于预约挂号，请确保信息真实准确</p>
                        <div class="patient-count">
                            <div class="count-progress">
                                <div class="progress-bar" :style="{ width: `${(length / maxPatients) * 100}%` }"></div>
                            </div>
                            <span class="count-text">{{ length }}/{{ maxPatients }}</span>
                        </div>
                    </div>
                </div>

                <!-- 就诊人列表 -->
                <div class="patient-list-container" v-loading="loading">
                    <TransitionGroup name="list" tag="div" class="patient-list">
                        <!-- 就诊人卡片 -->
                        <el-card v-for="item in patientList" :key="item.id" class="patient-card" shadow="hover">
                            <div class="patient-header">
                                <div class="patient-avatar">{{ item.name.substring(0, 1) }}</div>
                                <div class="patient-basic">
                                    <div class="patient-name-row">
                                        <span class="patient-name">{{ item.name }}</span>
                                        <el-tag size="small" :type="item.isInsure === 0 ? 'warning' : 'success'"
                                            effect="light">
                                            {{ item.isInsure === 0 ? '自费' : '医保' }}
                                        </el-tag>
                                    </div>
                                    <div class="patient-id">
                                        {{ item.param.certificatesTypeString }} {{
                                            item.certificatesNo.replace(/^(.{4})(?:.+)(.{4})$/, '$1********$2') }}
                                    </div>
                                </div>
                            </div>

                            <div class="patient-info">
                                <div class="info-item">
                                    <span class="info-label">性别/生日</span>
                                    <span class="info-value">{{ item.sex === 1 ? '男' : '女' }} · {{ item.birthdate
                                    }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">手机号码</span>
                                    <span class="info-value">{{ item.phone }}</span>
                                </div>
                                <div class="info-item">
                                    <span class="info-label">居住地址</span>
                                    <span class="info-value address">{{ item.param.fullAddress }}</span>
                                </div>
                            </div>

                            <div class="patient-actions">
                                <el-button type="primary" plain @click="show(item.id)">
                                    查看详情
                                    <el-icon class="el-icon--right">
                                        <ArrowRight />
                                    </el-icon>
                                </el-button>
                                <el-button type="primary" @click="edit(item.id)">
                                    <el-icon>
                                        <Edit />
                                    </el-icon>
                                    编辑
                                </el-button>
                                <el-button type="danger" @click="remove(item.id)">
                                    <el-icon>
                                        <Delete />
                                    </el-icon>
                                    删除
                                </el-button>
                            </div>
                        </el-card>

                        <!-- 添加就诊人卡片 -->
                        <div class="add-card-container" :key="'add'" v-if="length < maxPatients">
                            <el-card class="add-card" shadow="hover" @click="add">
                                <div class="add-content">
                                    <el-icon class="add-icon">
                                        <Plus />
                                    </el-icon>
                                    <div class="add-text">添加就诊人</div>
                                    <div class="add-desc">添加新的就诊人信息</div>
                                </div>
                            </el-card>
                        </div>
                    </TransitionGroup>

                    <!-- 空状态 -->
                    <el-empty v-if="patientList.length === 0 && !loading" description="暂无就诊人信息">
                        <el-button type="primary" @click="add">添加就诊人</el-button>
                    </el-empty>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 页面基础样式 */
.patient-page {
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
    padding: 0 20px;
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
    margin: -20px auto 40px;
    padding: 0 20px;
    position: relative;
}

.content-container {
    position: relative;
}

/* 信息横幅 */
.info-banner {
    background: white;
    border-radius: 8px;
    padding: 20px;
    margin-bottom: 24px;
    box-shadow: var(--el-box-shadow-light);
    display: flex;
    align-items: center;
    gap: 20px;
}

.info-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: rgba(24, 144, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: var(--el-color-primary);
    font-size: 24px;
}

.info-content {
    flex: 1;
}

.info-content h3 {
    margin: 0 0 8px 0;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.info-content p {
    margin: 0 0 12px 0;
    color: var(--el-text-color-secondary);
    font-size: 14px;
    line-height: 1.5;
}

.patient-count {
    display: flex;
    align-items: center;
    gap: 10px;
}

.count-progress {
    flex: 1;
    height: 8px;
    background: #f0f0f0;
    border-radius: 4px;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: var(--el-color-primary);
    border-radius: 4px;
    transition: width 0.3s ease;
}

.count-text {
    font-weight: 500;
    color: var(--el-color-primary);
}

/* 就诊人列表 */
.patient-list-container {
    min-height: 300px;
    position: relative;
}

.patient-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 20px;
}

.patient-card {
    border-radius: 8px;
    transition: all 0.3s ease;
    overflow: hidden;
}

.patient-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.patient-header {
    display: flex;
    align-items: center;
    gap: 15px;
    padding-bottom: 15px;
    border-bottom: 1px solid var(--el-border-color-lighter);
}

.patient-avatar {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background: var(--el-color-primary);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
    font-weight: 600;
}

.patient-basic {
    flex: 1;
}

.patient-name-row {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 5px;
}

.patient-name {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
}

.patient-id {
    font-size: 13px;
    color: var(--el-text-color-secondary);
}

.patient-info {
    padding: 15px 0;
}

.info-item {
    display: flex;
    margin-bottom: 10px;
}

.info-item:last-child {
    margin-bottom: 0;
}

.info-label {
    width: 80px;
    color: var(--el-text-color-secondary);
    font-size: 14px;
}

.info-value {
    flex: 1;
    color: var(--el-text-color-primary);
    font-size: 14px;
}

.info-value.address {
    word-break: break-all;
}

.patient-actions {
    display: flex;
    gap: 10px;
    padding-top: 15px;
    border-top: 1px solid var(--el-border-color-lighter);
}

/* 添加就诊人卡片 */
.add-card {
    height: 100%;
    min-height: 250px;
    cursor: pointer;
    border: 2px dashed #dcdfe6;
    background-color: #fafafa;
    transition: all 0.3s ease;
}

.add-card:hover {
    border-color: var(--el-color-primary);
    background-color: #f0f7ff;
}

.add-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;
}

.add-icon {
    font-size: 40px;
    color: var(--el-color-primary);
    margin-bottom: 15px;
}

.add-text {
    font-size: 18px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 8px;
}

.add-desc {
    font-size: 14px;
    color: var(--el-text-color-secondary);
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
    }

    .info-banner {
        flex-direction: column;
        text-align: center;
        padding: 15px;
    }

    .patient-list {
        grid-template-columns: 1fr;
    }

    .patient-actions {
        flex-direction: column;
    }

    .patient-actions .el-button {
        width: 100%;
    }
}
</style>