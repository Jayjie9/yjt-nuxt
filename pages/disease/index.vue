<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, ChatDotRound, ArrowRight, View, Share, Star, Location, Calendar, DataAnalysis, Document, WarningFilled } from '@element-plus/icons-vue'
import { useApi } from '~/composables'

// 导入API
const api = useApi()
const diseaseApi = api.disease
const analysisApi = api.analysis

// 搜索相关
const searchQuery = ref('')
const isSearching = ref(false)
const searchResults = ref([])

// AI问诊相关
const aiDialogVisible = ref(false)
const aiMessages = ref([
    { role: 'assistant', content: '您好，我是医疗AI助手，请描述您的症状，我将为您提供初步诊断建议。' }
])
const userInput = ref('')
const aiLoading = ref(false)

// 病情分析相关
const analysisDialogVisible = ref(false)
const analysisLoading = ref(false)
const symptomInput = ref('')
const analysisResult = ref(null)
const analysisHistory = ref([])
const showHistory = ref(false)
const historyPagination = ref({
    total: 0,
    page: 1,
    limit: 5,
    pages: 0
})

// 症状标签
const commonSymptoms = ref([])

// 选中的症状标签
const selectedSymptoms = ref([])

// 常见疾病分类
const diseaseCategories = ref([
    { id: 1, name: '内科', icon: 'internal-medicine.svg', color: '#4a9cd8' },
    { id: 2, name: '外科', icon: 'surgery.svg', color: '#42b983' },
    { id: 3, name: '妇产科', icon: 'gynecology.svg', color: '#f56c6c' },
    { id: 4, name: '儿科', icon: 'pediatrics.svg', color: '#e6a23c' },
    { id: 5, name: '皮肤科', icon: 'dermatology.svg', color: '#9254de' },
    { id: 6, name: '眼科', icon: 'ophthalmology.svg', color: '#1989fa' },
    { id: 7, name: '耳鼻喉科', icon: 'ent.svg', color: '#ff9900' },
    { id: 8, name: '口腔科', icon: 'dental.svg', color: '#13c2c2' }
])

// 热门疾病
const popularDiseases = ref([
    { id: 1, name: '高血压', category: '内科', views: 12500, bookmarks: 3200 },
    { id: 2, name: '糖尿病', category: '内科', views: 10800, bookmarks: 2800 },
    { id: 3, name: '感冒', category: '内科', views: 9600, bookmarks: 1500 },
    { id: 4, name: '肺炎', category: '内科', views: 8900, bookmarks: 2100 },
    { id: 5, name: '骨折', category: '外科', views: 7500, bookmarks: 1800 },
    { id: 6, name: '阑尾炎', category: '外科', views: 6800, bookmarks: 1600 }
])

// 季节性疾病
const seasonalDiseases = ref([
    { id: 1, name: '流感', season: '冬季', description: '流行性感冒是由流感病毒引起的急性呼吸道传染病' },
    { id: 2, name: '过敏性鼻炎', season: '春季', description: '过敏性鼻炎是鼻腔黏膜的变态反应性疾病' },
    { id: 3, name: '中暑', season: '夏季', description: '中暑是指人体在高温环境下，体温调节功能失调' },
    { id: 4, name: '手足口病', season: '夏季', description: '手足口病是由肠道病毒引起的传染病' }
])

// 健康资讯
const healthArticles = ref([
    {
        id: 1,
        title: '如何预防心血管疾病',
        summary: '心血管疾病是当今世界的主要死亡原因之一，本文介绍预防心血管疾病的方法。',
        date: '2023-05-15',
        image: '~assets/images/logo.png'
    },
    {
        id: 2,
        title: '糖尿病患者的饮食指南',
        summary: '合理的饮食控制对糖尿病患者至关重要，本文提供详细的饮食建议。',
        date: '2023-05-10',
        image: '~assets/images/logo.png'
    },
    {
        id: 3,
        title: '儿童常见传染病预防',
        summary: '了解儿童常见传染病的预防措施，保护孩子健康成长。',
        date: '2023-05-05',
        image: '~assets/images/logo.png'
    }
])

// 搜索疾病
const searchDisease = () => {
    if (!searchQuery.value.trim()) return

    isSearching.value = true

    // 模拟API调用
    setTimeout(() => {
        // 这里应该是实际的API调用
        // const { data } = await diseaseApi.searchDisease(searchQuery.value)

        // 模拟数据
        searchResults.value = [
            { id: 1, name: '高血压', category: '内科', description: '高血压是指体循环动脉血压（收缩压和/或舒张压）增高...' },
            { id: 2, name: '高血脂', category: '内科', description: '高血脂是指血液中脂质含量过高的状态，主要包括胆固醇...' },
            { id: 3, name: '高尿酸血症', category: '内科', description: '高尿酸血症是指人体内嘌呤代谢紊乱导致的血尿酸水平升高...' }
        ].filter(item => item.name.includes(searchQuery.value) || item.description.includes(searchQuery.value))

        isSearching.value = false
    }, 500)
}

// 发送AI消息
const sendAiMessage = () => {
    if (!userInput.value.trim()) return

    // 添加用户消息
    aiMessages.value.push({ role: 'user', content: userInput.value })

    // 清空输入框
    const userQuestion = userInput.value
    userInput.value = ''

    // 模拟AI回复
    aiLoading.value = true
    setTimeout(() => {
        // 这里应该是实际的AI API调用
        // const { data } = await diseaseApi.aiDiagnosis(userQuestion)

        // 模拟AI回复
        let aiResponse = ''
        if (userQuestion.includes('头痛')) {
            aiResponse = '头痛可能由多种原因引起，如紧张性头痛、偏头痛、颅内感染等。建议您注意休息，如症状持续或加重，请及时就医。'
        } else if (userQuestion.includes('发热') || userQuestion.includes('发烧')) {
            aiResponse = '发热是机体对感染或其他疾病的一种防御反应。如体温超过38.5℃，请适当使用退热药物，多饮水，并及时就医。'
        } else if (userQuestion.includes('咳嗽')) {
            aiResponse = '咳嗽可能是由感冒、支气管炎、肺炎等引起。如伴有高热、胸痛或呼吸困难，建议尽快就医。'
        } else {
            aiResponse = '根据您描述的症状，建议您及时就医，由专业医生进行面诊和必要的检查，以获得准确诊断和治疗方案。'
        }

        aiMessages.value.push({ role: 'assistant', content: aiResponse })
        aiLoading.value = false
    }, 1000)
}

// 添加症状标签
const addSymptomTag = (symptom) => {
    if (!selectedSymptoms.value.includes(symptom)) {
        selectedSymptoms.value.push(symptom)
        if (symptomInput.value.trim()) {
            symptomInput.value += '、' + symptom
        } else {
            symptomInput.value = symptom
        }
    }
}

// 清空症状输入
const clearSymptoms = () => {
    symptomInput.value = ''
    selectedSymptoms.value = []
}

// 提交病情分析
const submitAnalysis = () => {
    if (!symptomInput.value.trim()) return

    analysisLoading.value = true
    analysisResult.value = null

    // 模拟API调用
    setTimeout(() => {
        // 这里应该是实际的API调用
        // const { data } = await analysisApi.analyzeSymptoms(symptomInput.value)

        // 模拟分析结果
        const symptoms = symptomInput.value
        let result = {
            id: Date.now(),
            date: new Date().toISOString(),
            symptoms: symptoms,
            possibleDiseases: [],
            recommendations: [],
            riskLevel: ''
        }

        if (symptoms.includes('头痛')) {
            result.possibleDiseases.push(
                { name: '偏头痛', probability: 0.75, description: '偏头痛是一种常见的神经血管性疾病，特点是反复发作的中重度、搏动性头痛。' },
                { name: '紧张性头痛', probability: 0.65, description: '紧张性头痛是最常见的头痛类型，通常表现为双侧头部的紧绷或压迫感。' }
            )
            result.riskLevel = '中等'
        }

        if (symptoms.includes('发热') || symptoms.includes('发烧')) {
            result.possibleDiseases.push(
                { name: '上呼吸道感染', probability: 0.85, description: '上呼吸道感染是指鼻、咽、喉等上呼吸道的急性炎症。' },
                { name: '流感', probability: 0.7, description: '流感是由流感病毒引起的急性呼吸道传染病。' }
            )
            result.riskLevel = '中等'
        }

        if (symptoms.includes('咳嗽')) {
            result.possibleDiseases.push(
                { name: '支气管炎', probability: 0.8, description: '支气管炎是支气管黏膜的炎症，可由感染或非感染因素引起。' },
                { name: '肺炎', probability: 0.4, description: '肺炎是肺部实质的炎症，通常由感染引起。' }
            )
            result.riskLevel = '中等'
        }

        if (symptoms.includes('胸痛') && symptoms.includes('呼吸困难')) {
            result.possibleDiseases.push(
                { name: '冠心病', probability: 0.6, description: '冠心病是由冠状动脉狭窄或阻塞引起的心脏疾病。' },
                { name: '肺栓塞', probability: 0.3, description: '肺栓塞是由血栓阻塞肺动脉或其分支引起的疾病。' }
            )
            result.riskLevel = '高'
            result.recommendations.push('请立即就医！')
        }

        // 如果没有匹配到特定疾病
        if (result.possibleDiseases.length === 0) {
            result.possibleDiseases.push(
                { name: '未能确定', probability: 0, description: '根据提供的症状无法确定可能的疾病。' }
            )
            result.riskLevel = '未知'
        }

        // 添加通用建议
        if (result.recommendations.length === 0) {
            if (result.riskLevel === '高') {
                result.recommendations.push('建议立即就医')
            } else if (result.riskLevel === '中等') {
                result.recommendations.push('建议近期就医', '保持充分休息', '多饮水')
            } else {
                result.recommendations.push('观察症状变化', '如症状加重请及时就医')
            }
        }

        analysisResult.value = result

        // 添加到历史记录
        analysisHistory.value.unshift(result)

        analysisLoading.value = false
    }, 1500)
}

// 查看历史分析记录
const viewAnalysisHistory = () => {
    showHistory.value = true
}

// 查看历史分析详情
const viewHistoryDetail = (item) => {
    analysisResult.value = item
    showHistory.value = false
}

// 格式化日期
const formatDate = (dateString) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 选择疾病分类
const selectCategory = (category) => {
    console.log('选择疾病分类:', category.name)
    // 这里应该是实际的分类跳转逻辑
    // router.push(`/disease/category/${category.id}`)
}

// 查看疾病详情
const viewDiseaseDetail = (disease) => {
    console.log('查看疾病详情:', disease.name)
    // 这里应该是实际的详情页跳转逻辑
    // router.push(`/disease/detail/${disease.id}`)
}

// 查看健康资讯
const viewArticle = (article) => {
    console.log('查看健康资讯:', article.title)
    // 这里应该是实际的文章页跳转逻辑
    // router.push(`/article/${article.id}`)
}

onMounted(() => {
    // 初始化数据
    // 这里可以添加实际的API调用

    // 获取历史分析记录
    // const fetchAnalysisHistory = async () => {
    //     try {
    //         const { data } = await analysisApi.getAnalysisHistory()
    //         analysisHistory.value = data || []
    //     } catch (error) {
    //         console.error('获取历史分析记录失败:', error)
    //     }
    // }
    // fetchAnalysisHistory()
})
</script>

<template>
    <div class="page-common">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="header-title">疾病百科</h1>
                <p class="header-subtitle">了解疾病知识，关注健康生活</p>

                <!-- 搜索框 -->
                <div class="search-container">
                    <el-input v-model="searchQuery" placeholder="搜索疾病、症状或健康问题" class="search-input"
                        @keyup.enter="searchDisease">
                        <template #prefix>
                            <el-icon class="search-icon">
                                <Search />
                            </el-icon>
                        </template>
                        <template #append>
                            <el-button @click="searchDisease">
                                搜索
                            </el-button>
                        </template>
                    </el-input>
                </div>
            </div>
        </div>

        <div class="main-content">
            <!-- 搜索结果 -->
            <div v-if="searchResults.length > 0" class="search-results-container">
                <el-card class="search-results-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <h2 class="results-title">搜索结果</h2>
                            <el-button text @click="searchResults = []">清除</el-button>
                        </div>
                    </template>

                    <div class="search-results-list">
                        <div v-for="result in searchResults" :key="result.id" class="search-result-item"
                            @click="viewDiseaseDetail(result)">
                            <div class="result-title">
                                <span>{{ result.name }}</span>
                                <el-tag size="small" effect="plain" type="info">{{ result.category }}</el-tag>
                            </div>
                            <div class="result-content">
                                {{ result.description }}
                            </div>
                            <div class="result-action">
                                <el-button text type="primary">
                                    查看详情
                                    <el-icon>
                                        <ArrowRight />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- AI问诊和病情分析入口 -->
            <el-row :gutter="20" class="diagnosis-section">
                <!-- AI问诊入口 -->
                <el-col :xs="24" :sm="24" :md="12">
                    <el-card class="ai-card" shadow="hover">
                        <div class="ai-content">
                            <div class="ai-info">
                                <h2 class="ai-title">AI智能问诊</h2>
                                <p class="ai-description">
                                    描述您的症状，AI助手将为您提供初步诊断建议和就医指导。
                                    <span class="ai-note">（仅供参考，不能替代医生诊断）</span>
                                </p>
                                <el-button type="primary" @click="aiDialogVisible = true" class="ai-button">
                                    <el-icon>
                                        <ChatDotRound />
                                    </el-icon>
                                    开始问诊
                                </el-button>
                            </div>
                            <div class="ai-image">
                                <img src="~assets/images/logo.png" alt="AI问诊" />
                            </div>
                        </div>
                    </el-card>
                </el-col>

                <!-- 病情分析入口 -->
                <el-col :xs="24" :sm="24" :md="12">
                    <el-card class="analysis-card" shadow="hover">
                        <div class="analysis-content">
                            <div class="analysis-info">
                                <h2 class="analysis-title">病情分析</h2>
                                <p class="analysis-description">
                                    输入您的症状，系统将分析可能的疾病并提供健康建议。
                                    <span class="analysis-note">（仅供参考，不能替代医生诊断）</span>
                                </p>
                                <el-button type="success" @click="analysisDialogVisible = true" class="analysis-button">
                                    <el-icon>
                                        <DataAnalysis />
                                    </el-icon>
                                    开始分析
                                </el-button>
                            </div>
                            <div class="analysis-image">
                                <img src="~assets/images/logo.png" alt="病情分析" />
                            </div>
                        </div>
                    </el-card>
                </el-col>
            </el-row>

            <!-- 疾病分类 -->
            <div class="disease-categories-section">
                <h2 class="section-title">疾病分类</h2>
                <div class="categories-grid">
                    <div v-for="category in diseaseCategories" :key="category.id" class="category-item"
                        @click="selectCategory(category)">
                        <div class="category-icon"
                            :style="{ backgroundColor: category.color + '15', borderColor: category.color }">
                            <img :src="`/images/icons/${category.icon}`" :alt="category.name" />
                        </div>
                        <div class="category-name">{{ category.name }}</div>
                    </div>
                </div>
            </div>

            <!-- 热门疾病 -->
            <div class="popular-diseases-section">
                <div class="section-header">
                    <h2 class="section-title">热门疾病</h2>
                    <el-button text type="primary">
                        查看更多
                        <el-icon>
                            <ArrowRight />
                        </el-icon>
                    </el-button>
                </div>

                <el-row :gutter="20">
                    <el-col :xs="24" :sm="12" :md="8" v-for="disease in popularDiseases" :key="disease.id">
                        <el-card class="disease-card" shadow="hover" @click="viewDiseaseDetail(disease)">
                            <div class="disease-card-content">
                                <h3 class="disease-name">{{ disease.name }}</h3>
                                <el-tag size="small" effect="plain">{{ disease.category }}</el-tag>
                                <div class="disease-stats">
                                    <div class="stat-item">
                                        <el-icon>
                                            <View />
                                        </el-icon>
                                        <span>{{ disease.views }}</span>
                                    </div>
                                    <div class="stat-item">
                                        <el-icon>
                                            <Star />
                                        </el-icon>
                                        <span>{{ disease.bookmarks }}</span>
                                    </div>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>

            <!-- 季节性疾病 -->
            <div class="seasonal-diseases-section">
                <div class="section-header">
                    <h2 class="section-title">季节性疾病</h2>
                    <el-button text type="primary">
                        查看更多
                        <el-icon>
                            <ArrowRight />
                        </el-icon>
                    </el-button>
                </div>

                <el-carousel :interval="5000" type="card" height="200px">
                    <el-carousel-item v-for="disease in seasonalDiseases" :key="disease.id">
                        <div class="seasonal-disease-card">
                            <div class="seasonal-tag">{{ disease.season }}</div>
                            <h3 class="seasonal-name">{{ disease.name }}</h3>
                            <p class="seasonal-description">{{ disease.description }}</p>
                            <el-button text type="primary" @click="viewDiseaseDetail(disease)">
                                了解更多
                                <el-icon>
                                    <ArrowRight />
                                </el-icon>
                            </el-button>
                        </div>
                    </el-carousel-item>
                </el-carousel>
            </div>

            <!-- 健康资讯 -->
            <div class="health-articles-section">
                <div class="section-header">
                    <h2 class="section-title">健康资讯</h2>
                    <el-button text type="primary">
                        查看更多
                        <el-icon>
                            <ArrowRight />
                        </el-icon>
                    </el-button>
                </div>

                <el-row :gutter="20">
                    <el-col :xs="24" :sm="24" :md="8" v-for="article in healthArticles" :key="article.id">
                        <el-card class="article-card" shadow="hover" @click="viewArticle(article)">
                            <div class="article-image">
                                <img :src="article.image" :alt="article.title" />
                            </div>
                            <div class="article-content">
                                <h3 class="article-title">{{ article.title }}</h3>
                                <p class="article-summary">{{ article.summary }}</p>
                                <div class="article-footer">
                                    <span class="article-date">
                                        <el-icon>
                                            <Calendar />
                                        </el-icon>
                                        {{ article.date }}
                                    </span>
                                    <el-button text type="primary" size="small">
                                        阅读全文
                                    </el-button>
                                </div>
                            </div>
                        </el-card>
                    </el-col>
                </el-row>
            </div>
        </div>

        <!-- AI问诊对话框 -->
        <el-dialog v-model="aiDialogVisible" title="AI智能问诊" width="600px" class="ai-dialog">
            <div class="ai-chat-container">
                <div class="ai-chat-messages">
                    <div v-for="(message, index) in aiMessages" :key="index" class="chat-message"
                        :class="{ 'user-message': message.role === 'user', 'ai-message': message.role === 'assistant' }">
                        <div class="message-avatar">
                            <el-avatar :icon="message.role === 'user' ? 'User' : 'ChatDotRound'" :size="36" />
                        </div>
                        <div class="message-content">
                            {{ message.content }}
                        </div>
                    </div>

                    <div v-if="aiLoading" class="ai-typing">
                        <div class="typing-indicator">
                            <span></span>
                            <span></span>
                            <span></span>
                        </div>
                    </div>
                </div>

                <div class="ai-chat-input">
                    <el-input v-model="userInput" placeholder="请描述您的症状..." :disabled="aiLoading"
                        @keyup.enter="sendAiMessage">
                        <template #append>
                            <el-button @click="sendAiMessage" :disabled="aiLoading || !userInput.trim()">
                                发送
                            </el-button>
                        </template>
                    </el-input>
                    <div class="ai-disclaimer">
                        注意：AI问诊仅供参考，不能替代专业医生的诊断和治疗建议。如有紧急情况，请立即就医。
                    </div>
                </div>
            </div>
        </el-dialog>

        <!-- 病情分析对话框 -->
        <el-dialog v-model="analysisDialogVisible" title="病情分析" width="700px" class="analysis-dialog">
            <div class="analysis-container">
                <!-- 输入区域 -->
                <div v-if="!analysisResult && !showHistory" class="analysis-input-section">
                    <h3 class="section-subtitle">请描述您的症状</h3>

                    <div class="symptom-tags">
                        <span class="tag-label">常见症状：</span>
                        <div class="tags-container">
                            <el-tag v-for="symptom in commonSymptoms" :key="symptom" class="symptom-tag"
                                :class="{ 'selected': selectedSymptoms.includes(symptom) }"
                                @click="addSymptomTag(symptom)" effect="plain">
                                {{ symptom }}
                            </el-tag>
                        </div>
                    </div>

                    <el-input v-model="symptomInput" type="textarea" :rows="4" placeholder="请输入您的症状，多个症状请用顿号、分隔..."
                        class="symptom-input" />

                    <div class="analysis-actions">
                        <el-button @click="clearSymptoms">清空</el-button>
                        <el-button type="primary" @click="submitAnalysis" :loading="analysisLoading"
                            :disabled="!symptomInput.trim()">
                            <el-icon>
                                <DataAnalysis />
                            </el-icon> 开始分析
                        </el-button>
                        <el-button type="info" @click="viewAnalysisHistory" :disabled="analysisHistory.length === 0">
                            <el-icon>
                                <Document />
                            </el-icon> 历史记录
                        </el-button>
                    </div>
                </div>

                <!-- 分析结果 -->
                <div v-if="analysisResult && !showHistory" class="analysis-result-section">
                    <div class="result-header">
                        <div class="result-title">
                            <h3>分析结果</h3>
                            <span class="result-date">{{ formatDate(analysisResult.date) }}</span>
                        </div>
                        <div class="result-actions">
                            <el-button type="primary" plain size="small" @click="analysisResult = null">
                                <el-icon>
                                    <ArrowRight />
                                </el-icon> 重新分析
                            </el-button>
                            <el-button type="info" plain size="small" @click="viewAnalysisHistory"
                                :disabled="analysisHistory.length <= 1">
                                <el-icon>
                                    <Document />
                                </el-icon> 历史记录
                            </el-button>
                        </div>
                    </div>

                    <div class="symptoms-summary">
                        <strong>症状描述：</strong> {{ analysisResult.symptoms }}
                    </div>

                    <div class="risk-level" :class="`risk-${analysisResult.riskLevel}`">
                        <el-icon v-if="analysisResult.riskLevel === '高'">
                            <WarningFilled />
                        </el-icon>
                        风险等级：{{ analysisResult.riskLevel }}
                    </div>

                    <div class="possible-diseases">
                        <h4>可能的疾病：</h4>
                        <div class="disease-list">
                            <div v-for="(disease, index) in analysisResult.possibleDiseases" :key="index"
                                class="disease-item">
                                <div class="disease-header">
                                    <span class="disease-name">{{ disease.name }}</span>
                                    <el-progress v-if="disease.probability > 0" :percentage="disease.probability * 100"
                                        :color="disease.probability > 0.7 ? '#F56C6C' : disease.probability > 0.4 ? '#E6A23C' : '#67C23A'"
                                        :show-text="false" :stroke-width="8" class="disease-probability" />
                                    <span v-if="disease.probability > 0" class="probability-text">{{
                                        (disease.probability *
                                            100).toFixed(0) }}%</span>
                                </div>
                                <p class="disease-description">{{ disease.description }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="recommendations">
                        <h4>建议：</h4>
                        <ul class="recommendation-list">
                            <li v-for="(recommendation, index) in analysisResult.recommendations" :key="index">
                                {{ recommendation }}
                            </li>
                        </ul>
                    </div>

                    <div class="analysis-disclaimer">
                        注意：此分析结果仅供参考，不能替代专业医生的诊断和治疗建议。如有疑问或症状加重，请及时就医。
                    </div>
                </div>

                <!-- 历史记录 -->
                <div v-if="showHistory" class="analysis-history-section">
                    <div class="history-header">
                        <h3>历史分析记录</h3>
                        <el-button type="primary" plain size="small"
                            @click="showHistory = false; analysisResult = null;">
                            <el-icon>
                                <ArrowRight />
                            </el-icon> 新的分析
                        </el-button>
                    </div>

                    <div v-if="analysisHistory.length === 0" class="empty-history">
                        暂无历史记录
                    </div>

                    <div v-else class="history-list">
                        <div v-for="item in analysisHistory" :key="item.id" class="history-item"
                            @click="viewHistoryDetail(item)">
                            <div class="history-item-content">
                                <div class="history-date">{{ formatDate(item.date) }}</div>
                                <div class="history-symptoms">{{ item.symptoms }}</div>
                                <div class="history-diseases">
                                    <span v-for="(disease, index) in item.possibleDiseases.slice(0, 2)" :key="index">
                                        {{ disease.name }}{{ index < Math.min(item.possibleDiseases.length, 2) - 1 ? '、'
                                            : '' }} </span>
                                            <span v-if="item.possibleDiseases.length > 2">等</span>
                                </div>
                            </div>
                            <div class="history-risk" :class="`risk-${item.riskLevel}`">{{ item.riskLevel }}</div>
                            <el-icon class="history-arrow">
                                <ArrowRight />
                            </el-icon>
                        </div>
                    </div>
                </div>
            </div>
        </el-dialog>
    </div>
</template>

<style scoped>
@import '@/assets/css/common.css';
@import '@/assets/css/components/search.css';

/* 页面头部 */
.page-header {
    padding: 60px 0 80px 0;
    margin-bottom: 20px;
}

.header-content {
    padding: 0 20px;
}

.header-subtitle {
    font-size: 1.1rem;
}

/* 主内容区域 */
.main-content {
    max-width: 1000px;
}

/* 搜索结果 */
.result-content {
    margin-bottom: 10px;
}

.result-action {
    display: flex;
    justify-content: flex-end;
}

/* 病情分析相关样式 */
.diagnosis-section {
    margin-bottom: 30px;
}

/* AI问诊和病情分析卡片共享样式 */
.ai-card,
.analysis-card {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    transition: all 0.3s;
}

.ai-card:hover,
.analysis-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-5px);
}

/* 卡片样式 */
.ai-card {
    background: linear-gradient(to right bottom, #f0f9ff, #e6f7ff);
}

.analysis-card {
    background: linear-gradient(to right bottom, #f0fff4, #e6ffec);
}

/* AI问诊和病情分析内容共享样式 */
.ai-content,
.analysis-content {
    display: flex;
    padding: 20px;
}

.ai-info,
.analysis-info {
    flex: 1;
}

.ai-title,
.analysis-title {
    font-size: 1.5rem;
    margin-bottom: 10px;
    color: #2c3e50;
}

.ai-description,
.analysis-description {
    color: #5a6a7e;
    margin-bottom: 20px;
    line-height: 1.5;
}

.ai-note,
.analysis-note {
    font-size: 0.85rem;
    color: #95a5a6;
}

.ai-button,
.analysis-button {
    margin-top: 10px;
}

.ai-image,
.analysis-image {
    width: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ai-image img,
.analysis-image img {
    max-width: 100%;
    height: auto;
}

/* AI问诊部分 */
.ai-diagnosis-section {
    margin-bottom: 30px;
}

.ai-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    transition: all 0.3s;
    background: linear-gradient(to right, #ffffff, #f0f7ff);
}

.ai-card:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
    transform: translateY(-3px);
}

.ai-content {
    display: flex;
    align-items: center;
}

.ai-info {
    flex: 1;
    padding: 30px;
}

.ai-title {
    font-size: 24px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 15px;
    position: relative;
    padding-left: 15px;
}

.ai-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 5px;
    height: 20px;
    width: 5px;
    background-color: #4a9cd8;
    border-radius: 3px;
}

.ai-description {
    color: #7f8c8d;
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 20px;
}

.ai-note {
    font-size: 14px;
    color: #e67e22;
    font-weight: 500;
}

.ai-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    font-size: 16px;
    background-color: #4a9cd8;
    border-color: #4a9cd8;
    border-radius: 25px;
    transition: all 0.3s;
}

.ai-button:hover {
    background-color: #3a8bc8;
    border-color: #3a8bc8;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(74, 156, 216, 0.3);
}

.ai-image {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
}

.ai-image img {
    max-width: 100%;
    height: auto;
    max-height: 200px;
    filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
    transition: all 0.3s;
}

.ai-card:hover .ai-image img {
    transform: scale(1.05);
}

/* 疾病分类 */
.disease-categories-section {
    margin-bottom: 30px;
}

.section-title {
    font-size: 22px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 20px;
    position: relative;
    padding-left: 15px;
}

.section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 5px;
    height: 20px;
    width: 5px;
    background-color: #4a9cd8;
    border-radius: 3px;
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
}

.category-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px;
    background-color: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    cursor: pointer;
    transition: all 0.3s;
}

.category-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.category-icon {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 15px;
    border: 2px solid;
    transition: all 0.3s;
}

.category-item:hover .category-icon {
    transform: scale(1.1);
}

.category-icon img {
    width: 30px;
    height: 30px;
    transition: all 0.3s;
}

.category-name {
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    transition: all 0.3s;
}

.category-item:hover .category-name {
    color: #4a9cd8;
}

/* 热门疾病 */
.popular-diseases-section {
    margin-bottom: 30px;
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
}

.disease-card {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

.disease-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.disease-card-content {
    padding: 20px;
    position: relative;
    overflow: hidden;
}

.disease-card-content::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background-color: #4a9cd8;
    opacity: 0;
    transition: all 0.3s;
}

.disease-card:hover .disease-card-content::before {
    opacity: 1;
}

.disease-name {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 10px;
    transition: all 0.3s;
}

.disease-card:hover .disease-name {
    transform: translateX(8px);
    color: #4a9cd8;
}

.disease-stats {
    display: flex;
    gap: 15px;
    margin-top: 15px;
}

.stat-item {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #7f8c8d;
    font-size: 14px;
}

/* 季节性疾病 */
.seasonal-diseases-section {
    margin-bottom: 30px;
}

.seasonal-disease-card {
    height: 100%;
    background-color: white;
    border-radius: 12px;
    padding: 20px;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transition: all 0.3s;
    overflow: hidden;
}

.seasonal-disease-card::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, #4a9cd8, #42b983);
}

.seasonal-disease-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.seasonal-tag {
    position: absolute;
    top: 15px;
    right: 15px;
    background-color: #4a9cd8;
    color: white;
    padding: 5px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.seasonal-name {
    font-size: 20px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 10px;
}

.seasonal-description {
    color: #7f8c8d;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 15px;
}

/* 健康资讯 */
.health-articles-section {
    margin-bottom: 30px;
}

/* 病情分析对话框样式 */
.analysis-dialog :deep(.el-dialog__header) {
    padding: 15px 20px;
    margin-right: 0;
    border-bottom: 1px solid #edf2f7;
}

.analysis-container {
    padding: 20px;
    max-height: 70vh;
    overflow-y: auto;
}

.section-subtitle {
    margin-top: 0;
    margin-bottom: 15px;
    color: #2c3e50;
    font-size: 1.2rem;
}

/* 症状标签样式 */
.symptom-tags {
    margin-bottom: 15px;
}

.tag-label {
    display: block;
    margin-bottom: 8px;
    color: #5a6a7e;
}

.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 15px;
}

.symptom-tag {
    cursor: pointer;
    transition: all 0.2s;
}

.symptom-tag:hover {
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.symptom-tag.selected {
    background-color: #ecf5ff;
    color: #409eff;
    border-color: #409eff;
}

.symptom-input {
    margin-bottom: 15px;
}

.analysis-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 15px;
}

/* 分析结果样式 */
.result-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #edf2f7;
}

.result-title {
    display: flex;
    align-items: baseline;
    gap: 10px;
}

.result-title h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.2rem;
}

.result-date {
    color: #95a5a6;
    font-size: 0.9rem;
}

.symptoms-summary {
    margin-bottom: 15px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 6px;
    color: #5a6a7e;
}

.risk-level {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 4px;
    font-weight: 500;
    margin-bottom: 20px;
}

.risk-高 {
    background-color: #fef0f0;
    color: #f56c6c;
}

.risk-中等 {
    background-color: #fdf6ec;
    color: #e6a23c;
}

.risk-低 {
    background-color: #f0f9eb;
    color: #67c23a;
}

.risk-未知 {
    background-color: #f4f4f5;
    color: #909399;
}

.possible-diseases,
.recommendations {
    margin-bottom: 20px;
}

.possible-diseases h4,
.recommendations h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #2c3e50;
    font-size: 1.1rem;
}

.disease-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.disease-item {
    padding: 12px;
    border-radius: 6px;
    background-color: #f8f9fa;
    border-left: 4px solid #409eff;
}

.disease-header {
    display: flex;
    align-items: center;
    margin-bottom: 8px;
}

.disease-name {
    font-weight: 500;
    color: #2c3e50;
    margin-right: 10px;
    min-width: 80px;
}

.disease-probability {
    flex: 1;
    margin-right: 10px;
}

.probability-text {
    font-size: 0.9rem;
    color: #5a6a7e;
    min-width: 40px;
    text-align: right;
}

.disease-description {
    margin: 0;
    color: #5a6a7e;
    font-size: 0.95rem;
    line-height: 1.5;
}

.recommendation-list {
    margin: 0;
    padding-left: 20px;
}

.recommendation-list li {
    margin-bottom: 5px;
    color: #5a6a7e;
}

.analysis-disclaimer {
    margin-top: 20px;
    padding: 10px;
    background-color: #f8f9fa;
    border-radius: 6px;
    color: #95a5a6;
    font-size: 0.9rem;
    text-align: center;
}

/* 历史记录样式 */
.history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.history-header h3 {
    margin: 0;
    color: #2c3e50;
    font-size: 1.2rem;
}

.empty-history {
    text-align: center;
    padding: 30px;
    color: #95a5a6;
}

.history-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.history-item {
    display: flex;
    align-items: center;
    padding: 12px 15px;
    border-radius: 6px;
    background-color: #f8f9fa;
    cursor: pointer;
    transition: all 0.2s;
}

.history-item:hover {
    background-color: #ecf5ff;
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.history-item-content {
    flex: 1;
}

.history-date {
    font-size: 0.85rem;
    color: #95a5a6;
    margin-bottom: 5px;
}

.history-symptoms {
    font-weight: 500;
    color: #2c3e50;
    margin-bottom: 5px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 400px;
}

.history-diseases {
    font-size: 0.9rem;
    color: #5a6a7e;
}

.history-risk {
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.85rem;
    margin: 0 10px;
}

.history-arrow {
    color: #c0c4cc;
}

.article-card {
    height: 100%;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
    cursor: pointer;
    transition: all 0.3s;
}

.article-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.article-image {
    height: 180px;
    overflow: hidden;
}

.article-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
}

.article-card:hover .article-image img {
    transform: scale(1.05);
}

.article-content {
    padding: 20px;
}

.article-title {
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
    margin: 0 0 10px;
    display: -webkit-box;
    line-clamp: 2;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    transition: all 0.3s;
}

.article-card:hover .article-title {
    color: #4a9cd8;
}

.article-summary {
    color: #7f8c8d;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 15px;
    display: -webkit-box;
    line-clamp: 3;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.article-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-top: 1px solid #edf2f7;
    padding-top: 15px;
}

.article-date {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #95a5a6;
    font-size: 14px;
}

/* AI对话框 */
.ai-dialog :deep(.el-dialog__header) {
    padding: 20px;
    margin: 0;
    background-color: #4a9cd8;
    color: white;
}

.ai-dialog :deep(.el-dialog__title) {
    color: white;
    font-weight: 600;
}

.ai-dialog :deep(.el-dialog__headerbtn .el-dialog__close) {
    color: white;
}

.ai-dialog :deep(.el-dialog__body) {
    padding: 0;
}

.ai-chat-container {
    display: flex;
    flex-direction: column;
    height: 500px;
}

.ai-chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f8fafc;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.chat-message {
    display: flex;
    gap: 10px;
    max-width: 80%;
}

.ai-message {
    align-self: flex-start;
}

.user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.message-avatar {
    flex-shrink: 0;
}

.message-content {
    padding: 12px 16px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.ai-message .message-content {
    background-color: white;
    color: #2c3e50;
    border-top-left-radius: 4px;
}

.user-message .message-content {
    background-color: #4a9cd8;
    color: white;
    border-top-right-radius: 4px;
}

.ai-typing {
    align-self: flex-start;
    display: flex;
    align-items: center;
    gap: 10px;
}

.typing-indicator {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 12px 16px;
    background-color: white;
    border-radius: 12px;
    border-top-left-radius: 4px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.typing-indicator span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: #95a5a6;
    animation: typing 1.4s infinite both;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0% {
        opacity: 0.4;
        transform: translateY(0);
    }

    50% {
        opacity: 1;
        transform: translateY(-4px);
    }

    100% {
        opacity: 0.4;
        transform: translateY(0);
    }
}

.ai-chat-input {
    padding: 20px;
    border-top: 1px solid #edf2f7;
    background-color: white;
}

.ai-disclaimer {
    margin-top: 10px;
    font-size: 12px;
    color: #e67e22;
    line-height: 1.5;
}

/* 响应式设计 */
@media (max-width: 1200px) {
    .main-content {
        padding: 0 15px;
    }
}

@media (max-width: 992px) {
    .categories-grid {
        grid-template-columns: repeat(3, 1fr);
    }

    .ai-content {
        flex-direction: column;
    }

    .ai-info {
        width: 100%;
        padding: 20px;
    }

    .ai-image {
        width: 100%;
        padding: 0 20px 20px;
    }
}

@media (max-width: 768px) {
    .page-header {
        padding: 40px 0 60px 0;
    }

    .page-title {
        font-size: 1.8rem;
    }

    .page-subtitle {
        font-size: 1rem;
    }

    .categories-grid {
        grid-template-columns: repeat(2, 1fr);
    }

    .seasonal-diseases-section .el-carousel {
        margin: 0 -20px;
    }

    .chat-message {
        max-width: 90%;
    }
}

@media (max-width: 576px) {
    .search-input {
        --el-input-height: 45px;
    }

    .section-title {
        font-size: 20px;
    }

    .ai-title {
        font-size: 20px;
    }

    .ai-description {
        font-size: 14px;
    }

    .ai-button {
        width: 100%;
        justify-content: center;
    }

    .ai-chat-container {
        height: 400px;
    }

    .chat-message {
        max-width: 100%;
    }
}
</style>