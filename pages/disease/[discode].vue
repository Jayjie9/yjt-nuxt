<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ElCard, ElTag, ElBreadcrumb, ElBreadcrumbItem, ElIcon, ElDivider, ElSkeleton, ElEmpty, ElMessage, ElButton } from 'element-plus'
import { ArrowRight, CollectionTag, PriceTag, Reading, Calendar, Star } from '@element-plus/icons-vue'
import { useApi } from '~/composables'
import type { DiseaseDetail } from '~/types/disease'

const api = useApi()
const diseaseApi = api.disease

const route = useRoute()
const discode = computed(() => route.params.discode as string)

const disease = ref<DiseaseDetail | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const isCollected = ref(false) // 是否已收藏
const collectLoading = ref(false) // 收藏加载状态
const userCollection = ref<any>(null) // 用户收藏信息
const userInfo = ref(null) // 用户信息

// 获取用户信息
const getUserInfo = async () => {
    try {
        const { data: response } = await api.user.getUserInfoDollar()
        if (response.code === 200) {
            userInfo.value = response.data
        }
    } catch (error) {
        console.error('获取用户信息失败', error)
    }
}

// 获取疾病详情
const fetchDiseaseDetail = async (discode: string) => {
    loading.value = true
    error.value = null
    try {
        const { data } = await diseaseApi.getDiseaseInfoByDiscodeDollar(discode)
        if (data) {
            disease.value = data.data
            // 获取用户收藏信息
            await checkIfCollected()
        } else {
            error.value = '未找到该疾病的信息。'
            disease.value = null
        }
    } catch (e) {
        console.error('获取疾病详情失败:', e)
        error.value = '获取疾病详情失败，请稍后再试。'
        disease.value = null
    } finally {
        loading.value = false
    }
}

// 获取UserCollection，检查当前疾病是否已收藏
const checkIfCollected = async () => {
    try {
        const { data: response } = await api.user.isCollectedDollar(discode.value)
        userCollection.value = response.data
        if (response.data) {
            isCollected.value = true
        }
    } catch (error) {
        console.error('检查收藏状态失败', error)
    }
}

// 收藏/取消收藏疾病
const toggleCollect = async () => {
    if (!userInfo.value) {
        ElMessage.warning('请先登录并完成实名认证')
        return
    }

    collectLoading.value = true
    try {
        if (isCollected.value) {
            // 查找收藏ID
            if (userCollection.value) {
                const collectionId = userCollection.value.id
                const { data: response } = await api.user.deleteCollectDollar(collectionId)
                if (response.code === 200) {
                    ElMessage.success('取消收藏成功')
                    isCollected.value = false
                } else {
                    ElMessage.error(response.message || '取消收藏失败')
                }
            }
        } else {
            // 添加收藏
            const { data: response } = await api.user.addCollectDollar(discode.value)
            if (response.code === 200) {
                ElMessage.success('收藏成功')
                isCollected.value = true
                // 重新获取收藏列表
                await checkIfCollected()
            } else {
                ElMessage.error(response.message || '收藏失败')
            }
        }
    } catch (error) {
        console.error('收藏操作失败', error)
        ElMessage.error('操作失败，请稍后重试')
    } finally {
        collectLoading.value = false
    }
}

// 初始化数据
const init = async () => {
    try {
        // 获取用户信息
        await getUserInfo()
        // 获取疾病详情
        if (discode.value) {
            await fetchDiseaseDetail(discode.value)
        }
    } catch (error) {
        console.error('初始化数据失败', error)
    }
}

onMounted(() => {
    init()
})

const formatDate = (dateString: string | Date | undefined) => {
    if (!dateString) return '未知'
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

</script>

<template>
    <div class="page-common">
        <div class="disease-detail-page">
            <div class="disease-detail-container"> <!-- 加载状态 -->
                <div v-if="loading" class="loading-container">
                    <el-skeleton :rows="10" animated />
                </div>

                <!-- 错误状态 -->
                <div v-else-if="error" class="error-container">
                    <el-empty :description="error" />
                </div>

                <!-- 疾病详情内容 -->
                <div v-else-if="disease" class="disease-content">
                    <!-- 面包屑导航 -->
                    <div class="breadcrumb-container">
                        <el-breadcrumb separator="/">
                            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
                            <el-breadcrumb-item :to="{ path: '/disease' }">疾病百科</el-breadcrumb-item>
                            <el-breadcrumb-item>{{ disease?.name || '疾病详情' }}</el-breadcrumb-item>
                        </el-breadcrumb>
                    </div>
                    <!-- 疾病头部信息 -->
                    <div class="disease-header">
                        <div class="disease-title-section">

                            <div class="disease-title-row">
                                <h1 class="disease-title">{{ disease.name }}</h1>
                                <el-button :type="isCollected ? 'danger' : 'primary'" :icon="Star" circle size="large"
                                    :loading="collectLoading" @click="toggleCollect" class="collect-btn"
                                    :title="isCollected ? '取消收藏' : '收藏疾病'" />
                            </div>
                            <div class="disease-tags">
                                <el-tag type="primary" effect="plain" size="large" round>
                                    <span class="category-tag">
                                        <el-icon>
                                            <CollectionTag />
                                        </el-icon>
                                        {{ disease.category.bigname }}
                                    </span>
                                </el-tag>

                                <el-tag type="success" effect="plain" size="large" round>
                                    <span class="department-tag">
                                        <el-icon>
                                            <PriceTag />
                                        </el-icon>
                                        {{ disease.department.depname }}
                                    </span>
                                </el-tag>
                            </div>
                            <div class="meta-info">
                                <span v-if="disease.updatedAt" class="update-time">
                                    <el-icon>
                                        <Calendar />
                                    </el-icon>
                                    最后更新: {{ formatDate(disease.updatedAt) }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 内容导航 -->
                    <div class="content-navigation">
                        <el-anchor type="underline" :offset="300">
                            <el-anchor-link v-for="(section, index) in disease.sections" :key="index"
                                :href="`#section-${index}`">
                                {{ section.title }}
                            </el-anchor-link>
                        </el-anchor>
                    </div>

                    <!-- 疾病详细内容区域 -->
                    <div class="sections-container">
                        <div v-for="(section, index) in disease.sections" :key="index" class="section-card"
                            :id="`section-${index}`">
                            <div class="section-header">
                                <div class="section-icon">
                                    <el-icon>
                                        <Reading />
                                    </el-icon>
                                </div>
                                <h2 class="section-title">{{ section.title }}</h2>
                            </div>
                            <div class="section-content" v-html="section.html"></div>
                        </div>
                    </div>
                </div>

                <!-- 空状态 -->
                <div v-else class="empty-container">
                    <el-empty description="暂无疾病数据" />
                </div>
            </div>
        </div>
    </div>

</template>

<style scoped>
.page-common {
    margin-top: -40px;
}

.disease-detail-page {
    background-color: var(--el-bg-color-page);
    min-height: 100vh;
}

.disease-detail-container {
    max-width: 1200px;
    margin: 0 auto;
    margin-top: 100px;
    padding: 20px;
}

.breadcrumb-container {
    padding-left: 5px;
}

.loading-container,
.error-container,
.empty-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 50vh;
    padding: 30px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.disease-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 20px;
}

@media (max-width: 992px) {
    .disease-content {
        grid-template-columns: 1fr;
    }
}

/* 疾病标题部分 */
.disease-header {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
    padding: 25px 30px;
    margin-bottom: 20px;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    grid-column: 1 / -1;
    color: white;
}

.disease-title-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.disease-title-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
}

.disease-title {
    font-size: 2.5em;
    color: white;
    margin: 0;
    font-weight: 700;
    line-height: 1.2;
    position: relative;
    padding-bottom: 15px;
}

.disease-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 80px;
    height: 4px;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 2px;
}

.collect-btn {
    transition: all 0.3s;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.disease-tags {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    margin-top: 1px;
}

.category-tag,
.department-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 100%;
    justify-content: center;
    width: 100%;
}

.category-tag:hover,
.department-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    background-color: rgba(255, 255, 255, 0.3);
}

.category-tag .el-icon,
.department-tag .el-icon {
    font-size: 1.2em;
}

.meta-info {
    font-size: 0.9em;
    color: rgba(255, 255, 255, 0.9);
    display: flex;
    gap: 15px;
    margin-top: 10px;
    align-items: center;
}

.update-time {
    display: flex;
    align-items: center;
    gap: 5px;
}

/* 内容导航 */
.content-navigation {
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    position: sticky;
    top: 100px;
    grid-column: 2;
    grid-row: span 2;
    align-self: start;
    max-height: calc(100vh - 40px);
    overflow-y: auto;
    transition: all 0.3s ease;
}

@media (max-width: 992px) {
    .content-navigation {
        grid-column: 1;
        position: static;
        margin-bottom: 20px;
    }
}

/* 疾病内容部分 */
.sections-container {
    margin-top: -20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    grid-column: 1;
}

.section-card {
    background-color: white;
    border-radius: 12px;
    padding: 25px 30px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    scroll-margin-top: 20px;
}

.section-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
}

.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
}

.section-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(var(--el-color-primary-rgb), 0.1);
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--el-color-primary);
    font-size: 1.2em;
}

.section-title {
    font-size: 1.5em;
    color: var(--el-text-color-primary);
    margin: 0;
    font-weight: 600;
}

.section-content {
    font-size: 1em;
    line-height: 1.8;
    color: var(--el-text-color-primary);
}

.section-content p {
    margin-bottom: 1em;
}

.section-content ul,
.section-content ol {
    padding-left: 1.5em;
    margin-bottom: 1em;
}

.section-content li {
    margin-bottom: 0.5em;
}

/* 动画效果 */
@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.disease-header,
.section-card,
.content-navigation {
    animation: fadeIn 0.6s ease-out forwards;
}
</style>