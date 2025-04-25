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
        description: '了解如何快速注册账号并完成实名认证'
    },
    {
        id: 2,
        title: '预约挂号',
        description: '学习如何在平台上预约全国知名医院的专家号'
    },
    {
        id: 3,
        title: '就诊人管理',
        description: '管理家人的就诊信息，为家人预约挂号'
    },
    {
        id: 4,
        title: '查询医院',
        description: '如何查找医院信息和科室排班'
    },
    {
        id: 5,
        title: '查看报告',
        description: '在线查看和管理检查报告'
    },
    {
        id: 6,
        title: '账号安全',
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
    <div class="page-common">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="header-title">帮助中心</h1>
                <p class="header-subtitle">我们随时为您提供帮助和支持</p>

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
                            <el-button @click="handleSearch">
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
                                    <Document />
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
        </div>
    </div>
</template>

<style scoped>
@import '@/assets/css/common.css';
@import '@/assets/css/components/search.css';
@import '@/assets/css/help.css';
</style>