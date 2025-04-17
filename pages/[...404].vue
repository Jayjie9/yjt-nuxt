<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'nuxt/app'

const router = useRouter()

const goBack = () => {
    router.back()
}

const goHome = () => {
    router.push('/')
}
</script>

<template>
    <div class="error-page">
        <div class="error-container">
            <div class="error-image">
                <img src="~/assets/images/logo.png" alt="404 错误">
            </div>
            <div class="error-content">
                <h1 class="error-code">404</h1>
                <h2 class="error-title">诊断结果：页面未找到</h2>
                <p class="error-desc">
                    医生提醒：您访问的页面可能已经转院或不存在<br>
                    建议进行以下治疗方案：
                </p>
                <div class="error-actions">
                    <el-button type="primary" @click="goBack">
                        <el-icon>
                            <ArrowLeft />
                        </el-icon>
                        返回上页
                    </el-button>
                    <el-button @click="goHome">
                        返回首页
                    </el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f7fa;
}

.error-container {
    display: flex;
    align-items: center;
    max-width: 1000px;
    padding: 40px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.error-image {
    flex: 1;
    padding-right: 60px;
}

.error-image img {
    max-width: 100%;
    height: auto;
}

.error-content {
    flex: 1;
}

.error-code {
    font-size: 72px;
    color: #409EFF;
    margin: 0 0 20px;
    font-weight: bold;
}

.error-title {
    font-size: 28px;
    color: #303133;
    margin: 0 0 20px;
}

.error-desc {
    font-size: 16px;
    color: #606266;
    line-height: 1.8;
    margin: 0 0 30px;
}

.error-actions {
    display: flex;
    gap: 16px;
}

@media (max-width: 768px) {
    .error-container {
        flex-direction: column;
        text-align: center;
        padding: 20px;
    }

    .error-image {
        padding-right: 0;
        padding-bottom: 30px;
    }

    .error-code {
        font-size: 56px;
    }

    .error-title {
        font-size: 24px;
    }
}
</style>