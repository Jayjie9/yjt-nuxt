<script setup>
import { Search, QuestionFilled, Document, Phone, Setting, ArrowRight, User, Message, Location, UserFilled, Calendar, House, Lock } from '@element-plus/icons-vue'

// 常见问题列表
const faqList = ref([
    {
        id: 1,
        question: '如何进行实名认证？',
        answer: '登录后进入个人中心，点击"实名认证"，按照提示填写个人信息并上传证件照片，提交后等待审核即可。'
    },
    {
        id: 2,
        question: '如何添加就诊人？',
        answer: '完成实名认证后，进入"就诊人管理"页面，点击"添加就诊人"，填写就诊人信息并提交即可。'
    },
    {
        id: 3,
        question: '如何预约挂号？',
        answer: '在首页选择医院和科室，选择医生后点击"预约挂号"，选择就诊人和就诊时间，确认后完成预约。'
    },
    {
        id: 4,
        question: '如何查看预约记录？',
        answer: '进入个人中心，点击"预约记录"即可查看所有预约信息，包括待就诊和已就诊记录。'
    },
    {
        id: 5,
        question: '如何取消预约？',
        answer: '在预约记录中找到需要取消的预约，点击"取消预约"按钮，确认后即可取消。请注意取消规则和时间限制。'
    },
    {
        id: 6,
        question: '忘记密码怎么办？',
        answer: '在登录页面点击"忘记密码"，通过手机验证码重置密码。如有问题请联系客服。'
    }
])

// 使用指南列表
const guideList = ref([
    {
        id: 1,
        title: '新用户注册',
        icon: 'User',
        description: '了解如何快速注册账号并完成实名认证'
    },
    {
        id: 2,
        title: '预约挂号',
        icon: 'Calendar',
        description: '学习如何在平台上预约全国知名医院的专家号'
    },
    {
        id: 3,
        title: '就诊人管理',
        icon: 'UserFilled',
        description: '管理家人的就诊信息，为家人预约挂号'
    },
    {
        id: 4,
        title: '查询医院',
        icon: 'House',
        description: '如何查找医院信息和科室排班'
    },
    {
        id: 5,
        title: '查看报告',
        icon: 'Document',
        description: '在线查看和管理检查报告'
    },
    {
        id: 6,
        title: '账号安全',
        icon: 'Lock',
        description: '保护您的账号安全和个人隐私'
    }
])

// 联系方式
const contactInfo = ref({
    phone: '400-123-4567',
    email: 'jayjie@whut.deu.cn',
    workTime: '周一至周日 8:00-22:00',
    address: '湖北省武汉市洪山区洪山街道武汉理工大学智园'
})

// 搜索相关
const searchQuery = ref('')
const searchResults = ref([])
const isSearching = ref(false)

// 搜索功能
const handleSearch = () => {
    if (!searchQuery.value.trim()) {
        searchResults.value = []
        return
    }

    isSearching.value = true

    // 模拟搜索结果
    setTimeout(() => {
        const query = searchQuery.value.toLowerCase()
        searchResults.value = [
            ...faqList.value.filter(item =>
                item.question.toLowerCase().includes(query) ||
                item.answer.toLowerCase().includes(query)
            ),
            ...guideList.value.filter(item =>
                item.title.toLowerCase().includes(query) ||
                item.description.toLowerCase().includes(query)
            )
        ]
        isSearching.value = false
    }, 300)
}

// 展开/收起问题
const expandedQuestions = ref(new Set())
const toggleQuestion = (id) => {
    if (expandedQuestions.value.has(id)) {
        expandedQuestions.value.delete(id)
    } else {
        expandedQuestions.value.add(id)
    }
}

// 当前选中的分类
const activeCategory = ref('faq')

// 提交留言
const submitMessage = () => {
    // 处理提交留言的逻辑
    // 可以发送请求到后台进行留言保存
    // TODO 
}
</script>

<template>
    <div class="help-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">帮助中心</h1>
                <p class="page-subtitle">我们随时为您提供帮助和支持</p>

                <!-- 搜索框 -->
                <div class="search-container">
                    <el-input v-model="searchQuery" placeholder="搜索问题或关键词" class="search-input"
                        @keyup.enter="handleSearch">
                        <template #prefix>
                            <el-icon class="search-icon">
                                <Search />
                            </el-icon>
                        </template>
                        <template #append>
                            <el-button @click="handleSearch" :loading="isSearching">
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
                        <div v-for="result in searchResults" :key="result.id" class="search-result-item">
                            <div class="result-title">
                                <el-icon>
                                    <QuestionFilled />
                                </el-icon>
                                <span>{{ result.question || result.title }}</span>
                            </div>
                            <div class="result-content">
                                {{ result.answer || result.description }}
                            </div>
                        </div>

                        <div v-if="searchResults.length === 0" class="no-results">
                            <el-empty description="没有找到相关结果" />
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 分类导航 -->
            <div class="category-tabs">
                <div class="category-tab" :class="{ active: activeCategory === 'faq' }" @click="activeCategory = 'faq'">
                    <el-icon>
                        <QuestionFilled />
                    </el-icon>
                    <span>常见问题</span>
                </div>
                <div class="category-tab" :class="{ active: activeCategory === 'guide' }"
                    @click="activeCategory = 'guide'">
                    <el-icon>
                        <Document />
                    </el-icon>
                    <span>使用指南</span>
                </div>
                <div class="category-tab" :class="{ active: activeCategory === 'contact' }"
                    @click="activeCategory = 'contact'">
                    <el-icon>
                        <Phone />
                    </el-icon>
                    <span>联系我们</span>
                </div>
            </div>

            <!-- 常见问题 -->
            <div v-if="activeCategory === 'faq'" class="faq-container">
                <el-card class="faq-card" shadow="hover">
                    <template #header>
                        <div class="section-title">
                            <el-icon>
                                <QuestionFilled />
                            </el-icon>
                            <h2>常见问题</h2>
                        </div>
                    </template>

                    <div class="faq-list">
                        <div v-for="faq in faqList" :key="faq.id" class="faq-item"
                            :class="{ expanded: expandedQuestions.has(faq.id) }">
                            <div class="faq-question" @click="toggleQuestion(faq.id)">
                                <span class="question-text">{{ faq.question }}</span>
                                <el-icon class="expand-icon">
                                    <ArrowRight />
                                </el-icon>
                            </div>
                            <div class="faq-answer">
                                <p>{{ faq.answer }}</p>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 使用指南 -->
            <div v-if="activeCategory === 'guide'" class="guide-container">
                <el-card class="guide-card" shadow="hover">
                    <template #header>
                        <div class="section-title">
                            <el-icon>
                                <Document />
                            </el-icon>
                            <h2>使用指南</h2>
                        </div>
                    </template>

                    <div class="guide-grid">
                        <div v-for="guide in guideList" :key="guide.id" class="guide-item">
                            <div class="guide-icon">
                                <el-icon>
                                    <component :is="guide.icon" />
                                </el-icon>
                            </div>
                            <div class="guide-content">
                                <h3 class="guide-title">{{ guide.title }}</h3>
                                <p class="guide-description">{{ guide.description }}</p>
                                <el-button text class="guide-link">
                                    查看详情
                                    <el-icon class="link-icon">
                                        <ArrowRight />
                                    </el-icon>
                                </el-button>
                            </div>
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 联系我们 -->
            <div v-if="activeCategory === 'contact'" class="contact-container">
                <el-card class="contact-card" shadow="hover">
                    <template #header>
                        <div class="section-title">
                            <el-icon>
                                <Phone />
                            </el-icon>
                            <h2>联系我们</h2>
                        </div>
                    </template>

                    <div class="contact-content">
                        <div class="contact-info">
                            <div class="contact-item">
                                <el-icon>
                                    <Phone />
                                </el-icon>
                                <div class="contact-detail">
                                    <h3>客服电话</h3>
                                    <p>{{ contactInfo.phone }}</p>
                                    <p class="contact-note">{{ contactInfo.workTime }}</p>
                                </div>
                            </div>

                            <div class="contact-item">
                                <el-icon>
                                    <Message />
                                </el-icon>
                                <div class="contact-detail">
                                    <h3>电子邮箱</h3>
                                    <p><a :href="`mailto:${contactInfo.email}`" class="email-link">{{ contactInfo.email
                                            }}</a>
                                    </p>
                                    <p class="contact-note">我们会在24小时内回复您的邮件</p>
                                </div>
                            </div>

                            <div class="contact-item">
                                <el-icon>
                                    <Location />
                                </el-icon>
                                <div class="contact-detail">
                                    <h3>公司地址</h3>
                                    <p>{{ contactInfo.address }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="contact-form">
                            <h3 class="form-title">在线留言</h3>
                            <el-form>
                                <el-form-item>
                                    <el-input placeholder="我们对您的称呼" />
                                </el-form-item>
                                <el-form-item>
                                    <el-input placeholder="如何联系到您（选填）" />
                                </el-form-item>
                                <el-form-item>
                                    <el-input type="textarea" :rows="7" maxlength="200" resize="none"
                                        placeholder="请描述您遇到的问题或建议" />
                                </el-form-item>
                                <el-form-item>
                                    <el-button type="primary" @click="submitMessage">提交留言</el-button>
                                </el-form-item>
                            </el-form>
                        </div>
                    </div>
                </el-card>
            </div>

            <!-- 快速链接 -->
            <div class="quick-links">
                <el-card class="links-card" shadow="hover">
                    <div class="links-grid">
                        <div class="link-item" @click="$router.push('/')">
                            <el-icon>
                                <House />
                            </el-icon>
                            <span>返回首页</span>
                        </div>
                        <div class="link-item" @click="$router.push('/user')">
                            <el-icon>
                                <User />
                            </el-icon>
                            <span>个人中心</span>
                        </div>
                        <div class="link-item" @click="$router.push('/patient')">
                            <el-icon>
                                <UserFilled />
                            </el-icon>
                            <span>就诊人管理</span>
                        </div>
                        <div class="link-item">
                            <el-icon>
                                <Setting />
                            </el-icon>
                            <span>系统设置</span>
                        </div>
                    </div>
                </el-card>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 页面基础样式 */
.help-page {
    min-height: 100vh;
    background-color: #f0f5f9;
}

/* 页面头部 */
.page-header {
    background: linear-gradient(135deg, #4a9cd8 0%, #1a6ca8 100%);
    padding: 60px 0 80px 0;
    color: white;
    text-align: center;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.page-title {
    font-size: 2.2rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.page-subtitle {
    font-size: 1.1rem;
    opacity: 0.9;
    margin-bottom: 2rem;
}

/* 搜索框 */
.search-container {
    max-width: 600px;
    margin: 0 auto;
}

.search-input {
    --el-input-height: 50px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-input :deep(.el-input__wrapper) {
    padding-left: 15px;
}

.search-icon {
    font-size: 18px;
    color: #95a5a6;
}

/* 主内容区域 */
.main-content {
    max-width: 1000px;
    margin: -40px auto 40px;
    padding: 0 20px;
    position: relative;
}

/* 搜索结果 */
.search-results-container {
    margin-bottom: 20px;
}

.search-results-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
}

.card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.results-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
}

.search-results-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.search-result-item {
    padding: 15px;
    border-radius: 8px;
    background-color: #f8fafc;
    border-left: 3px solid #4a9cd8;
}

.result-title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 8px;
}

.result-title .el-icon {
    color: #4a9cd8;
}

.result-content {
    color: #7f8c8d;
    font-size: 14px;
    line-height: 1.5;
}

.no-results {
    padding: 30px 0;
    text-align: center;
}

/* 分类导航 */
.category-tabs {
    display: flex;
    background-color: white;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    overflow: hidden;
}

.category-tab {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 0;
    cursor: pointer;
    transition: all 0.3s;
    gap: 8px;
    color: #7f8c8d;
    position: relative;
}

.category-tab.active {
    color: #4a9cd8;
    background-color: #f0f7ff;
}

.category-tab.active::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 25%;
    width: 50%;
    height: 3px;
    background-color: #4a9cd8;
    border-radius: 3px 3px 0 0;
}

.category-tab .el-icon {
    font-size: 24px;
}

/* 常见问题 */
.faq-card {
    border-radius: 12px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
}

.section-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-title .el-icon {
    font-size: 20px;
    color: #4a9cd8;
}

.section-title h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
}

.faq-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.faq-item {
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e6eef5;
    transition: all 0.3s;
}

.faq-item:hover {
    border-color: #4a9cd8;
}

.faq-question {
    padding: 16px;
    background-color: #f8fafc;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.question-text {
    font-weight: 600;
    color: #2c3e50;
}

.expand-icon {
    transition: transform 0.3s;
    color: #95a5a6;
}

.faq-item.expanded .expand-icon {
    transform: rotate(90deg);
    color: #4a9cd8;
}

.faq-answer {
    padding: 0 16px;
    max-height: 0;
    overflow: hidden;
    transition: all 0.3s;
    background-color: white;
}

.faq-item.expanded .faq-answer {
    padding: 16px;
    max-height: 500px;
}

.faq-answer p {
    margin: 0;
    color: #7f8c8d;
    line-height: 1.6;
}

/* 使用指南 */
.guide-card {
    border-radius: 12px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
}

.guide-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

.guide-item {
    display: flex;
    gap: 15px;
    padding: 20px;
    border-radius: 8px;
    background-color: #f8fafc;
    transition: all 0.3s;
    border: 1px solid #e6eef5;
}

.guide-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.05);
    border-color: #4a9cd8;
}

.guide-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #e1f0ff;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.guide-icon .el-icon {
    font-size: 24px;
    color: #4a9cd8;
}

.guide-content {
    flex: 1;
}

.guide-title {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
}

.guide-description {
    margin: 0 0 12px;
    font-size: 14px;
    color: #7f8c8d;
    line-height: 1.5;
}

.guide-link {
    display: flex;
    align-items: center;
    gap: 5px;
    color: #4a9cd8;
    font-size: 14px;
    padding: 0;
}

.link-icon {
    transition: transform 0.3s;
}

.guide-link:hover .link-icon {
    transform: translateX(3px);
}

/* 联系我们 */
.contact-card {
    border-radius: 12px;
    margin-bottom: 20px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
}

.contact-content {
    display: flex;
    gap: 30px;
}

.contact-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.contact-item {
    display: flex;
    gap: 15px;
    padding: 20px;
    border-radius: 8px;
    background-color: #f8fafc;
    border: 1px solid #e6eef5;
}

.contact-item .el-icon {
    font-size: 24px;
    color: #4a9cd8;
    margin-top: 5px;
}

.contact-detail {
    flex: 1;
}

.contact-detail h3 {
    margin: 0 0 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
}

.contact-detail p {
    margin: 0;
    color: #2c3e50;
    font-size: 16px;
}

.email-link {
    color: #4a9cd8;
    text-decoration: none;
    transition: color 0.3s;
}

.email-link:hover {
    color: #1a6ca8;
    text-decoration: underline;
}

.contact-note {
    font-size: 14px !important;
    color: #7f8c8d !important;
    margin-top: 5px !important;
}

.contact-form {
    flex: 1;
    padding: 20px;
    border-radius: 8px;
    max-height: 300px;
    background-color: #f8fafc;
    border: 1px solid #e6eef5;
}

.form-title {
    margin: 0 0 20px;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
}

/* 快速链接 */
.quick-links {
    margin-bottom: 20px;
}

.links-card {
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    border: none;
}

.links-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
}

.link-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 10px;
    cursor: pointer;
    transition: all 0.3s;
    border-radius: 8px;
}

.link-item:hover {
    background-color: #f0f7ff;
}

.link-item .el-icon {
    font-size: 24px;
    color: #4a9cd8;
    margin-bottom: 8px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
    .guide-grid {
        grid-template-columns: 1fr;
    }

    .contact-content {
        flex-direction: column;
    }

    .links-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}
</style>