<script setup lang="ts">
import { ArrowLeft, House, FirstAidKit } from '@element-plus/icons-vue'
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
                <img src="~/assets/images/logo.png" alt="404 错误" class="main-image">
                <div class="pulse-circle"></div>
            </div>
            <div class="error-content">
                <div class="error-badge">404</div>
                <h1 class="error-title">诊断结果：页面未找到</h1>
                <div class="error-card">
                    <div class="card-header">
                        <FirstAidKit />
                        <span>医生处方</span>
                    </div>
                    <div class="card-body">
                        <p>尊敬的用户，您访问的页面可能已经转诊或不存在。</p>
                        <ul class="treatment-plan">
                            <li>检查您输入的网址是否正确</li>
                            <li>返回上一页面重新操作</li>
                            <li>通过首页导航寻找所需服务</li>
                        </ul>
                    </div>
                </div>
                <div class="error-actions">
                    <el-button type="primary" @click="goBack" class="action-button back-button">
                        <el-icon>
                            <ArrowLeft />
                        </el-icon>
                        返回上页
                    </el-button>
                    <el-button @click="goHome" class="action-button home-button">
                        <el-icon>
                            <House />
                        </el-icon>
                        返回首页
                    </el-button>
                </div>
            </div>
        </div>
        <div class="decoration-pills">
            <div class="pill pill-1"></div>
            <div class="pill pill-2"></div>
            <div class="pill pill-3"></div>
        </div>
    </div>
</template>

<style scoped>
.error-page {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f5f9;
    position: relative;
    overflow: hidden;
    padding: 20px;
}

.error-container {
    display: flex;
    align-items: center;
    max-width: 1000px;
    padding: 50px;
    background: white;
    border-radius: 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    position: relative;
    z-index: 2;
}

.error-image {
    flex: 1;
    padding-right: 60px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
}

.main-image {
    max-width: 100%;
    height: auto;
    position: relative;
    z-index: 2;
}

.pulse-circle {
    position: absolute;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: rgba(74, 156, 216, 0.1);
    z-index: 1;
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(74, 156, 216, 0.3);
    }

    70% {
        transform: scale(1);
        box-shadow: 0 0 0 20px rgba(74, 156, 216, 0);
    }

    100% {
        transform: scale(0.95);
        box-shadow: 0 0 0 0 rgba(74, 156, 216, 0);
    }
}

.error-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 20px;
}

.error-badge {
    display: inline-block;
    background: linear-gradient(135deg, #4a9cd8 0%, #1a6ca8 100%);
    color: white;
    font-size: 24px;
    font-weight: bold;
    padding: 8px 16px;
    border-radius: 30px;
    margin-bottom: 5px;
}

.error-title {
    font-size: 32px;
    color: #2c3e50;
    margin: 0;
    line-height: 1.3;
}

.error-card {
    background-color: #f8fafc;
    border-radius: 12px;
    border-left: 4px solid #4a9cd8;
    overflow: hidden;
}

.card-header {
    background-color: #e1f0ff;
    padding: 12px 20px;
    display: flex;
    align-items: center;
    gap: 10px;
    color: #1a6ca8;
    font-weight: 600;
    font-size: 16px;
}

.card-header .el-icon {
    font-size: 18px;
}

.card-body {
    padding: 20px;
}

.card-body p {
    margin: 0 0 15px;
    color: #2c3e50;
    line-height: 1.6;
}

.treatment-plan {
    margin: 0;
    padding-left: 20px;
    color: #7f8c8d;
}

.treatment-plan li {
    margin-bottom: 8px;
    position: relative;
}

.treatment-plan li:last-child {
    margin-bottom: 0;
}

.error-actions {
    display: flex;
    gap: 16px;
    margin-top: 10px;
}

.action-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 24px;
    font-weight: 500;
    transition: all 0.3s;
}

.back-button {
    background-color: #4a9cd8;
    border-color: #4a9cd8;
}

.back-button:hover {
    background-color: #3a8bc8;
    border-color: #3a8bc8;
    transform: translateY(-2px);
}

.home-button {
    color: #4a9cd8;
    border-color: #4a9cd8;
}

.home-button:hover {
    color: white;
    background-color: #4a9cd8;
    transform: translateY(-2px);
}

/* 装饰元素 */
.decoration-pills {
    position: absolute;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
}

.pill {
    position: absolute;
    border-radius: 50px;
    opacity: 0.1;
    background-color: #4a9cd8;
}

.pill-1 {
    width: 100px;
    height: 30px;
    top: 20%;
    left: 10%;
    transform: rotate(45deg);
}

.pill-2 {
    width: 80px;
    height: 25px;
    bottom: 30%;
    right: 15%;
    transform: rotate(-30deg);
}

.pill-3 {
    width: 60px;
    height: 20px;
    bottom: 15%;
    left: 20%;
    transform: rotate(15deg);
}

@media (max-width: 900px) {
    .error-container {
        flex-direction: column;
        text-align: center;
        padding: 30px;
    }

    .error-image {
        padding-right: 0;
        padding-bottom: 40px;
        width: 80%;
        max-width: 300px;
    }

    .error-badge {
        margin: 0 auto 10px;
    }

    .error-title {
        font-size: 26px;
    }

    .error-actions {
        justify-content: center;
    }
}

@media (max-width: 480px) {
    .error-container {
        padding: 25px 15px;
    }

    .error-actions {
        flex-direction: column;
    }

    .action-button {
        width: 100%;
        justify-content: center;
    }
}
</style>