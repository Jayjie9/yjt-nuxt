<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Search, ArrowRight, View, Share, Star, Location, Calendar, DataAnalysis, Document, WarningFilled } from '@element-plus/icons-vue'
import { useApi } from '~/composables'

// 导入API
const dictionary = useApi().dictionary
const disease = useApi().disease

// 搜索相关
const searchQuery = ref('')
const isSearching = ref(false)

// 病情分析相关
const analysisDialogVisible = ref(false)
const analysisLoading = ref(false)
const symptomInput = ref('')
const analysisResult = ref(null)
const analysisHistory = ref([])
const showHistory = ref(false)


// 症状标签
const commonSymptoms = ref([
    '头痛',
    '发热',
    '咳嗽',
    '呼吸困难',
])
// 选中的症状标签
const selectedSymptoms = ref([])

// 疾病列表
const diseaseCategories = ref([])
const diseaseDep = ref([])
const diseaseList = ref([])
const loadingDiseaseList = ref(false)
const selectedDepartment = ref(null)

// 当前选中的大科室
const selectedBigDepartment = ref(null)

// 分页配置
const pagination = reactive({
    currentPage: 1,
    pageSize: 12,
    total: 0
})

// 获取大科室分类
const fetchDiseaseCategories = async () => {
    try {
        const { data } = await dictionary.findDictDiseaseByDictCodeDollar('BigDep')
        diseaseCategories.value = data.data

        // 恢复之前选择的科室状态
        restorePreviousState()
    } catch (error) {
        console.error('获取疾病分类失败:', error)
    }
}

// 处理大科室选择
const handleDepartmentSelect = async (category) => {
    // 如果点击的是已选中的大科室，则取消选择
    if (selectedBigDepartment.value && selectedBigDepartment.value.id === category.id) {
        selectedBigDepartment.value = null
        diseaseDep.value = []
        selectedDepartment.value = null
        return
    }

    selectedBigDepartment.value = category
    selectedDepartment.value = category.name

    try {
        const { data: response } = await dictionary.findDictChildDataDollar(category.id)
        diseaseDep.value = response.data || []
        console.log('子科室数据:', diseaseDep.value)
    } catch (error) {
        console.error('获取子科室失败:', error)
        diseaseDep.value = []
    }
}

// 加载疾病列表
const loadDiseaseList = async () => {
    loadingDiseaseList.value = true
    try {
        // 根据选中的科室ID查询疾病列表
        const departmentId = selectedDepartment.value ?
            diseaseDep.value.find(dep => dep.name === selectedDepartment.value)?.id :
            (selectedBigDepartment.value?.value || '')

        if (!departmentId) {
            diseaseList.value = []
            pagination.total = 0
            loadingDiseaseList.value = false
            return
        }

        // 获取疾病列表
        const { data: response } = await dictionary.findDictChildDataDollar(departmentId)
        if (response && response.data) {
            // 转换后端返回的数据格式为前端需要的格式
            diseaseList.value = response.data.map(item => ({
                _id: item.id,
                name: item.name,
                value: item.value,
                category: selectedBigDepartment.value?.name || '未分类',
                department: selectedDepartment.value || selectedBigDepartment.value?.name || '未知科室',
                tags: [item.value.split('_')[0]],
                description: '暂无描述'
            }))
            pagination.total = diseaseList.value.length
        } else {
            diseaseList.value = []
            pagination.total = 0
        }
    } catch (error) {
        console.error('获取疾病列表失败:', error)
        diseaseList.value = []
        pagination.total = 0
    } finally {
        loadingDiseaseList.value = false
    }
}

// 处理子科室选择
const handleSubDepartmentSelect = (subDepartment) => {
    selectedDepartment.value = subDepartment.name
    loadDiseaseList()
}

// 筛选核心内容部分
const filterCoreSections = (sections) => {
    if (!sections || !Array.isArray(sections)) return []

    // 优先展示的部分标题
    const priorityTitles = ['介绍', '症状表现', '发病原因', '治疗方法']

    // 按优先级筛选sections
    const prioritySections = []

    // 先添加优先级高的部分
    priorityTitles.forEach(title => {
        const section = sections.find(s => s.title === title)
        if (section) {
            prioritySections.push(section)
        }
    })

    // 如果没有找到任何优先级高的部分，则返回前两个section
    if (prioritySections.length === 0 && sections.length > 0) {
        return sections.slice(0, 2)
    }

    // 最多返回3个section
    return prioritySections.slice(0, 3)
}

// 格式化section内容
const formatSectionContent = (text) => {
    if (!text) return '暂无内容'

    // 移除HTML标签
    const plainText = text.replace(/<[^>]*>/g, '')

    // 限制长度，最多显示100个字符
    if (plainText.length > 100) {
        return plainText.substring(0, 100) + '...'
    }

    return plainText
}

// 跳转到疾病详情页
const navigateToDisease = (disease) => {
    // 保存疾病信息到本地存储，以便在详情页使用
    localStorage.setItem('selectedDisease', JSON.stringify(disease))
    // 保存当前选中的科室信息，以便返回时恢复状态
    if (selectedBigDepartment.value) {
        localStorage.setItem('selectedBigDepartment', JSON.stringify(selectedBigDepartment.value))
    }
    if (selectedDepartment.value) {
        localStorage.setItem('selectedDepartment', selectedDepartment.value)
    }
    if (diseaseDep.value.length > 0) {
        localStorage.setItem('diseaseDep', JSON.stringify(diseaseDep.value))
    }
    // 这里的 disease.value = discode
    navigateTo(`/disease/${disease.value}`)
}

// 搜索疾病相关变量
const timeout = ref(null)
const diseaseSearchResults = ref([])

// 搜索疾病建议
const querySearchDiseaseAsync = (queryString, cb) => {
    if (!queryString) {
        cb([])
        return
    }
    clearTimeout(timeout.value)
    timeout.value = setTimeout(async () => {
        try {
            const { data } = await disease.searchDiseaseByKeyword(queryString)
            let results = []

            if (data.data && Array.isArray(data.data)) {
                // 保存原始搜索结果
                diseaseSearchResults.value = data.data
                // 将后端返回的数据格式化为自动补全需要的格式
                results = diseaseSearchResults.value.map(item => ({
                    value: item.discode,
                    diseaseName: item.diseaseName,
                    depname: item.depname,
                    discode: item.discode
                }))
            } else {
                console.warn('搜索返回的数据结构不符合预期:', data)
            }

            // 返回搜索结果
            cb(results)
        } catch (error) {
            console.error('搜索疾病失败:', error)
            cb([])
        }
    }, 800)
}

// 处理疾病选择
const handleDiseaseSelect = (item) => {
    // 如果选择了搜索结果，直接跳转到疾病详情页
    if (item && item.discode) {
        navigateTo(`/disease/${item.discode}`)
    }
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
const submitAnalysis = async () => {
    if (!symptomInput.value.trim()) return

    analysisLoading.value = true
    analysisResult.value = null

    const { data } = await disease.symptomAnalysis(symptomInput.value)

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
    const diseaseList = data.data
    console.log('diseaseList', diseaseList);


    if (Array.isArray(data.data)) {
        result.possibleDiseases = data.data.map(item => {
            const disease = item.disease || {}
            return {
                name: disease.name || '未知疾病',
                discode: disease.discode || '未知编码',
                department: disease.department.depname || '未知科室',
                category: disease.category.bigname || '未知分类',
                probability: item.relatedScore ? item.relatedScore / 100 : null,
                description: disease.sections?.find(sec => sec.title === '介绍')?.text || '',
                hospital: disease.hospital || null  // 假设后端会在此添加 hospital 字段
            }
        })
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

// 恢复之前的选择状态
const restorePreviousState = () => {
    try {
        // 恢复大科室选择
        const savedBigDepartment = localStorage.getItem('selectedBigDepartment')
        if (savedBigDepartment) {
            const parsedBigDepartment = JSON.parse(savedBigDepartment)
            // 确保在当前科室列表中找到对应的科室
            selectedBigDepartment.value = diseaseCategories.value.find(cat => cat.id === parsedBigDepartment.id) || null
        }

        // 恢复子科室列表
        const savedDiseaseDep = localStorage.getItem('diseaseDep')
        if (savedDiseaseDep) {
            diseaseDep.value = JSON.parse(savedDiseaseDep)
        }

        // 恢复选中的科室
        const savedDepartment = localStorage.getItem('selectedDepartment')
        if (savedDepartment) {
            selectedDepartment.value = savedDepartment
            // 加载疾病列表
            loadDiseaseList()
        }
    } catch (error) {
        console.error('恢复选择状态失败:', error)
    }
}
onMounted(() => {
    fetchDiseaseCategories() // 获取大科室分类
    loadDiseaseList() // 初始加载疾病列表
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
                    <el-autocomplete class="disease-search-input" v-model="searchQuery"
                        :fetch-suggestions="querySearchDiseaseAsync" placeholder="搜索疾病、症状或健康问题"
                        @select="handleDiseaseSelect" :trigger-on-focus="true" highlight-first-item fit-input-width>
                        <template #prefix>
                            <el-icon>
                                <Search />
                            </el-icon>
                        </template>
                        <template #default="{ item }">
                            <div class="suggestion-item">
                                <span class="suggestion-name">{{ item.diseaseName }}</span>
                                <el-tag size="small" effect="plain" type="info">{{ item.depname }}</el-tag>
                            </div>
                        </template>
                    </el-autocomplete>
                </div>
            </div>
        </div>

        <div class="main-content">


            <!-- 病情分析入口 -->
            <el-row :gutter="20" class="diagnosis-section">
                <el-col :xs="24" :sm="24" :md="24">
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

            <!-- 疾病大科室分类 -->
            <div class="disease-categories-section">
                <h2 class="section-title">疾病大科室分类</h2>

                <!-- 加载动画 -->
                <div v-if="diseaseCategories.length === 0" class="categories-loading">
                    <div class="loading-spinner">
                        <svg class="circular" viewBox="25 25 50 50">
                            <circle class="path" cx="50" cy="50" r="20" fill="none" stroke-width="5"
                                stroke-miterlimit="10" />
                        </svg>
                    </div>
                    <p class="loading-text">正在加载科室分类...</p>
                </div>

                <div v-else class="categories-grid">
                    <div v-for="category in diseaseCategories" :key="category.id" class="category-item"
                        :class="{ 'active': selectedBigDepartment && selectedBigDepartment.id === category.id }"
                        @click="handleDepartmentSelect(category)">
                        <div class="category-icon">
                            <el-icon>
                                <Location />
                            </el-icon>
                        </div>
                        <div class="category-name">{{ category.name }}</div>
                        <div class="category-indicator"
                            v-if="selectedBigDepartment && selectedBigDepartment.id === category.id">
                            <el-icon>
                                <ArrowRight />
                            </el-icon>
                        </div>
                    </div>
                </div>

                <!-- 子科室列表 -->
                <transition name="slide-fade">
                    <div v-if="diseaseDep.length > 0" class="sub-departments-container">
                        <div class="sub-departments-header">
                            <span class="sub-departments-title">{{ selectedBigDepartment ? selectedBigDepartment.name :
                                '' }}
                                子科室</span>
                            <el-divider>
                                <el-icon>
                                    <Location />
                                </el-icon>
                            </el-divider>
                        </div>
                        <div class="sub-departments-list">
                            <div v-for="subDep in diseaseDep" :key="subDep.id" class="sub-department-item"
                                :class="{ 'active': selectedDepartment === subDep.name }"
                                @click="handleSubDepartmentSelect(subDep)">
                                <el-icon class="sub-dep-icon">
                                    <View />
                                </el-icon>
                                <span class="sub-dep-name">{{ subDep.name }}</span>
                            </div>
                        </div>
                    </div>
                </transition>
            </div>

            <!-- 疾病列表 -->
            <div class="disease-list-section">
                <h2 class="section-title">{{ selectedDepartment ? selectedDepartment + ' - ' : '' }}疾病列表</h2>
                <div v-if="loadingDiseaseList" class="loading-placeholder">
                    <el-skeleton :rows="6" animated />
                </div>
                <div v-else-if="diseaseList.length === 0 && selectedDepartment" class="empty-placeholder">
                    <el-empty :description="`暂无${selectedDepartment}相关疾病信息`" />
                </div>
                <div v-else-if="diseaseList.length === 0 && !selectedDepartment" class="empty-placeholder">
                    <el-empty description="请先选择一个科室查看疾病列表" />
                </div>
                <div v-else>
                    <el-row :gutter="20">
                        <el-col v-for="disease in diseaseList" :key="disease._id" :xs="24" :sm="12" :md="8" :lg="6">
                            <el-card class="disease-card" shadow="hover" @click="navigateToDisease(disease)">
                                <div class="disease-card-simple">
                                    <span class="disease-name-title">{{ disease.name }}</span>
                                </div>
                            </el-card>
                        </el-col>
                    </el-row>
                </div>
            </div>
        </div>



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

                    <!-- <div class="risk-level" :class="`risk-${analysisResult.riskLevel}`">
                        <el-icon v-if="analysisResult.riskLevel === '高'">
                            <WarningFilled />
                        </el-icon>
                        风险等级：{{ analysisResult.riskLevel }}
                    </div> -->

                    <div class="possible-diseases">
                        <h4>可能的疾病：</h4>
                        <div class="disease-list">
                            <div v-for="(disease, index) in analysisResult.possibleDiseases" :key="index"
                                class="disease-item" @click="navigateTo(`/disease/${disease.discode}`)">
                                <div class="disease-header">
                                    <span class="disease-name">{{ disease.name }}</span>
                                    <el-tag size="small" effect="plain" type="info" class="disease-department">
                                        {{ disease.department || '未知科室' }}
                                    </el-tag>
                                    <el-tag size="small" effect="plain" type="success" class="disease-category">
                                        {{ disease.category || '未分类' }}
                                    </el-tag>
                                    <el-progress v-if="disease.probability > 0" :percentage="disease.probability * 100"
                                        :color="disease.probability > 0.7 ? '#F56C6C' : disease.probability > 0.4 ? '#E6A23C' : '#67C23A'"
                                        :show-text="false" :stroke-width="8" class="disease-probability" />
                                    <span v-if="disease.probability > 0" class="probability-text">{{
                                        (disease.probability * 100).toFixed(0) }}%</span>
                                </div>

                                <!-- 展示核心内容 -->
                                <div class="disease-sections" v-if="disease.sections && disease.sections.length > 0">
                                    <div v-for="(section, sectionIndex) in filterCoreSections(disease.sections)"
                                        :key="sectionIndex" class="disease-section">
                                        <h5 class="section-title">{{ section.title }}</h5>
                                        <p class="section-content">{{ formatSectionContent(section.text) }}</p>
                                    </div>
                                </div>
                                <p class="disease-description" v-else>{{ disease.description || '暂无详细信息' }}</p>
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
@import '@/assets/css/pages/disease/index.css';

/* 搜索框样式 */
.search-container {
    max-width: 600px;
    margin: 0 auto 20px;
}

.disease-search-input {
    width: 100%;
}

.search-icon {
    color: var(--el-color-primary);
}

.suggestion-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 5px 0;
}

.suggestion-name {
    font-weight: 500;
}

/* 疾病列表样式 */
.disease-list-section {
    margin-top: 30px;
    animation: fadeIn 0.8s ease-out;
}

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

.disease-item {
    border-bottom: 1px solid #ebeef5;
    padding: 15px 0;
    cursor: pointer;
    transition: all 0.3s;
}

.disease-item:last-child {
    border-bottom: none;
}

.disease-item:hover {
    background-color: #f5f7fa;
}

.disease-header {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    flex-wrap: wrap;
}

.disease-name {
    font-weight: 600;
    font-size: 16px;
    margin-right: 10px;
}

.disease-department,
.disease-category {
    margin-right: 8px;
    font-size: 12px;
}

.disease-probability {
    width: 100px;
    margin: 0 10px;
}

.probability-text {
    font-size: 14px;
    color: #606266;
}

.disease-description {
    color: #606266;
    font-size: 14px;
    line-height: 1.5;
    margin: 0;
}

.disease-sections {
    margin-top: 10px;
}

.disease-section {
    margin-bottom: 12px;
}

.section-title {
    font-size: 14px;
    font-weight: 600;
    color: #303133;
    margin: 0 0 5px 0;
}

.section-content {
    font-size: 13px;
    color: #606266;
    line-height: 1.5;
    margin: 0;
    text-align: justify;
}

.disease-card {
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border-radius: 8px;
    overflow: hidden;
    border-left: 3px solid transparent;
    animation: fadeIn 0.5s ease-out forwards;
    height: 100%;
    background-color: #fff;
}

.disease-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.08);
    border-left: 3px solid var(--el-color-primary);
}

.disease-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f8f9fa;
    padding: 10px 12px;
    border-bottom: 1px solid #ebeef5;
}

.disease-name-title {
    font-weight: 600;
    font-size: 15px;
    color: #333;
    transition: color 0.3s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
}

.disease-card:hover .disease-name-title {
    color: var(--el-color-primary);
}

.disease-card-simple {
    text-align: center;
    min-height: 30px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
}

.disease-name-title {
    font-weight: 600;
    color: #333;
    transition: color 0.3s;
    font-size: 1.05rem;
    flex-grow: 1;
    text-align: center;
}

.disease-card:hover .disease-name-title {
    color: var(--el-color-primary);
}

.disease-card-indicator {
    opacity: 0;
    color: var(--el-color-primary);
    transition: all 0.3s ease;
    position: absolute;
    right: 15px;
    font-size: 1.1rem;
}

.disease-card:hover .disease-card-indicator {
    opacity: 1;
    transform: translateX(3px);
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(10px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.disease-card:hover .disease-name-title {
    color: var(--el-color-primary);
}

.disease-pagination {
    margin-top: 30px;
    margin-bottom: 20px;
    display: flex;
    justify-content: center;
}

.loading-placeholder,
.empty-placeholder {
    min-height: 300px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f9fafc;
    border-radius: 12px;
    padding: 20px;
    margin-top: 20px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.disease-categories-section {
    margin-top: 30px;
}

.section-title {
    font-size: 20px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    position: relative;
    padding-left: 15px;
}

.section-title::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 4px;
    height: 20px;
    background-color: var(--el-color-primary);
    border-radius: 2px;
}

/* 大科室分类加载动画 */
.categories-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 0;
}

.loading-spinner {
    position: relative;
    width: 50px;
    height: 50px;
    margin-bottom: 15px;
}

.circular {
    animation: rotate 2s linear infinite;
    height: 100%;
    transform-origin: center center;
    width: 100%;
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    margin: auto;
}

.path {
    stroke: var(--el-color-primary);
    stroke-dasharray: 90, 150;
    stroke-dashoffset: 0;
    stroke-linecap: round;
    animation: dash 1.5s ease-in-out infinite;
}

@keyframes rotate {
    100% {
        transform: rotate(360deg);
    }
}

@keyframes dash {
    0% {
        stroke-dasharray: 1, 150;
        stroke-dashoffset: 0;
    }

    50% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -35;
    }

    100% {
        stroke-dasharray: 90, 150;
        stroke-dashoffset: -124;
    }
}

.loading-text {
    color: #909399;
    font-size: 14px;
    margin-top: 10px;
}

/* 大科室分类网格 */
.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 20px;
    margin-top: 20px;
    animation: fadeIn 0.6s ease-out;
}

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

.category-item {
    background-color: #fff;
    border-radius: 12px;
    padding: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    cursor: pointer;
    text-align: center;
    border: 2px solid transparent;
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.category-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.category-item.active {
    border-color: var(--el-color-primary);
    background-color: rgba(64, 158, 255, 0.08);
}

.category-icon {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background-color: rgba(64, 158, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 10px;
    color: var(--el-color-primary);
    transition: all 0.3s ease;
}

.category-item:hover .category-icon {
    transform: scale(1.1);
}

.category-name {
    font-weight: 600;
    color: #333;
    font-size: 15px;
    transition: color 0.3s ease;
}

.category-item:hover .category-name {
    color: var(--el-color-primary);
}

.category-indicator {
    position: absolute;
    bottom: 8px;
    right: 8px;
    color: var(--el-color-primary);
    animation: pulse 1.5s infinite;
}

@keyframes pulse {
    0% {
        opacity: 0.6;
        transform: scale(1);
    }

    50% {
        opacity: 1;
        transform: scale(1.2);
    }

    100% {
        opacity: 0.6;
        transform: scale(1);
    }
}

/* 子科室列表样式 */
.sub-departments-container {
    margin-top: 25px;
    background-color: #f9fafc;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
    border: 1px solid #ebeef5;
}

.sub-departments-header {
    text-align: center;
    margin-bottom: 15px;
}

.sub-departments-title {
    font-size: 16px;
    font-weight: 600;
    color: #333;
}

.sub-departments-list {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    justify-content: center;
}

.sub-department-item {
    background-color: #fff;
    border-radius: 8px;
    padding: 10px 16px;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    border: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
}

.sub-department-item:hover {
    background-color: #f0f9ff;
    border-color: #a0cfff;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.sub-department-item.active {
    background-color: var(--el-color-primary);
    color: #fff;
    border-color: var(--el-color-primary);
}

.sub-dep-icon {
    margin-right: 6px;
    font-size: 16px;
}

.sub-dep-name {
    font-weight: 500;
}

/* 过渡动画 */
.slide-fade-enter-active {
    transition: all 0.4s cubic-bezier(0.36, 0.66, 0.04, 1);
}

.slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(0.36, 0.66, 0.04, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    opacity: 0;
    transform: translateY(-15px);
}
</style>
