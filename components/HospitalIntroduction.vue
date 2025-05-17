<template>
    <div class="hospital-intro-card">
        <h2 class="intro-title">医院简介</h2>
        <div class="intro-content" v-if="hospitalIntro">
            <div v-for="(paragraph, index) in formattedIntro" :key="index" class="intro-paragraph">
                {{ paragraph }}
            </div>
        </div>
        <div v-else class="loading-placeholder">
            <p>加载中...</p>
        </div>
    </div>
</template>

<script>
export default {
    name: 'HospitalIntroduction',
    props: {
        hospitalIntro: {
            type: String,
            default: ''
        }
    },
    computed: {
        formattedIntro() {
            if (!this.hospitalIntro) return [];

            // 按照段落分割文本（空格分隔的段落）
            return this.hospitalIntro
                .split(/\s{2,}/)  // 使用两个或更多空格作为分隔符
                .map(paragraph => paragraph.trim())
                .filter(paragraph => paragraph.length > 0);
        }
    }
}
</script>

<style scoped>
.hospital-intro-card {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
    padding: 24px;
    margin-bottom: 20px;
}

.intro-title {
    color: #2c78b0;
    font-size: 20px;
    font-weight: 600;
    margin-bottom: 24px;
    padding-bottom: 12px;
    border-bottom: 1px solid #eaeaea;
    position: relative;
}

.intro-title::after {
    content: '';
    position: absolute;
    left: 0;
    bottom: -1px;
    width: 80px;
    height: 3px;
    background-color: #2c78b0;
}

.intro-content {
    color: #333;
    line-height: 1.8;
}

.intro-paragraph {
    margin-bottom: 16px;
    text-indent: 2em;
    font-size: 15px;
}

.intro-paragraph:last-child {
    margin-bottom: 0;
}

/* 添加一些关键字突出显示效果 */
.intro-paragraph>>>strong,
.intro-paragraph>>>b {
    color: #2c78b0;
    font-weight: 600;
}

/* 响应式调整 */
@media screen and (max-width: 768px) {
    .hospital-intro-card {
        padding: 16px;
    }

    .intro-title {
        font-size: 18px;
        margin-bottom: 16px;
    }

    .intro-paragraph {
        font-size: 14px;
        line-height: 1.7;
    }
}

.loading-placeholder {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100px;
    color: #999;
}
</style>