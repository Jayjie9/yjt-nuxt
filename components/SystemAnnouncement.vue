<!-- components/SystemAnnouncement.vue -->
<template>
    <Teleport to="body">
        <transition name="fade">
            <div v-if="isVisible" class="announcement-overlay" @click.self="closeAnnouncement">
                <div class="announcement-modal">
                    <div class="announcement-header">
                        <h2>系统公告</h2>
                        <button class="close-btn" @click="closeAnnouncement">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                    </div>
                    <div class="announcement-content">
                        <div class="announcement-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
                                fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                                stroke-linejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                            </svg>
                        </div>
                        <div class="announcement-title">{{ announcement.title }}</div>
                        <div class="announcement-time">发布时间: {{ formatDate(announcement.date) }}</div>
                        <div class="announcement-body" v-html="announcement.content"></div>
                        <div v-if="announcement.attachments && announcement.attachments.length > 0"
                            class="announcement-attachments">
                            <h4>附件</h4>
                            <ul>
                                <li v-for="(attachment, index) in announcement.attachments" :key="index">
                                    <a :href="attachment.url" target="_blank">
                                        {{ attachment.name }}
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div class="announcement-footer">
                        <div class="page-indicator" v-if="announcements.length > 1">
                            {{ currentIndex + 1 }}/{{ announcements.length }}
                        </div>
                        <div class="navigation-buttons" v-if="announcements.length > 1">
                            <button class="nav-btn" :disabled="currentIndex === 0" @click="prevAnnouncement">
                                上一条
                            </button>
                            <button class="nav-btn" :disabled="currentIndex === announcements.length - 1"
                                @click="nextAnnouncement">
                                下一条
                            </button>
                        </div>
                        <div class="action-buttons">
                            <label class="dont-show-again">
                                <input type="checkbox" v-model="dontShowAgain" />
                                <span>不再显示</span>
                            </label>
                            <button class="primary-btn" @click="closeAnnouncement">确认</button>
                        </div>
                    </div>
                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
const props = defineProps({
    announcements: {
        type: Array,
        default: () => ([{
            id: '1',
            title: '系统维护通知',
            date: new Date(),
            content: `<p>尊敬的用户：</p>
        <p>为了提供更优质的服务，我们的系统将于2025年4月25日凌晨2:00-4:00进行例行维护升级。维护期间，网站及APP将暂停服务，给您带来的不便敬请谅解。</p>
        <p>此次更新包括：</p>
        <ul>
          <li>预约流程优化，提升用户体验</li>
          <li>新增专家在线问诊功能</li>
          <li>修复已知问题，提升系统稳定性</li>
        </ul>
        <p>如有疑问，请联系客服热线：400-123-4567</p>`,
            attachments: [
                { name: '系统更新详情.pdf', url: '#' },
                { name: '新功能使用指南.pdf', url: '#' }
            ]
        }])
    },
    showOnMount: {
        type: Boolean,
        default: true
    }
});

const isVisible = ref(false);
const currentIndex = ref(0);
const dontShowAgain = ref(false);

const announcement = computed(() => {
    return props.announcements[currentIndex.value] || {};
});

function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function closeAnnouncement() {
    isVisible.value = false;
    if (dontShowAgain.value) {
        localStorage.setItem('dontShowAnnouncement', 'true');
    }
}

function nextAnnouncement() {
    if (currentIndex.value < props.announcements.length - 1) {
        currentIndex.value++;
    }
}

function prevAnnouncement() {
    if (currentIndex.value > 0) {
        currentIndex.value--;
    }
}

function showAnnouncement() {
    if (localStorage.getItem('dontShowAnnouncement') !== 'true') {
        isVisible.value = true;
    }
}

onMounted(() => {
    if (props.showOnMount) {
        // 延迟显示，让页面有时间加载
        setTimeout(showAnnouncement, 1000);
    }
});

// 导出方法供外部调用
defineExpose({
    showAnnouncement
});
</script>

<style scoped>
.announcement-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.announcement-modal {
    background-color: #ffffff;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    width: 90%;
    max-width: 600px;
    max-height: 85vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.announcement-header {
    background-color: #1976d2;
    color: white;
    padding: 12px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.announcement-header h2 {
    margin: 0;
    font-weight: 500;
    font-size: 1.2rem;
}

.close-btn {
    background: transparent;
    border: none;
    color: white;
    cursor: pointer;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.2s;
}

.close-btn:hover {
    transform: scale(1.1);
}

.announcement-content {
    padding: 20px;
    overflow-y: auto;
    max-height: 50vh;
}

.announcement-icon {
    display: flex;
    justify-content: center;
    color: #1976d2;
    margin-bottom: 15px;
}

.announcement-title {
    font-size: 1.4rem;
    font-weight: 600;
    text-align: center;
    margin-bottom: 10px;
    color: #1976d2;
}

.announcement-time {
    font-size: 0.9rem;
    color: #666;
    text-align: center;
    margin-bottom: 20px;
}

.announcement-body {
    line-height: 1.6;
    color: #333;
}

.announcement-body p {
    margin-bottom: 12px;
}

.announcement-body ul {
    margin-left: 20px;
    margin-bottom: 12px;
}

.announcement-attachments {
    margin-top: 20px;
    border-top: 1px solid #eee;
    padding-top: 15px;
}

.announcement-attachments h4 {
    margin-top: 0;
    margin-bottom: 10px;
    color: #1976d2;
}

.announcement-attachments ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.announcement-attachments li {
    padding: 8px 0;
}

.announcement-attachments a {
    color: #1976d2;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
}

.announcement-attachments a:hover {
    text-decoration: underline;
}

.announcement-footer {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
}

.page-indicator {
    font-size: 0.9rem;
    color: #666;
}

.navigation-buttons {
    display: flex;
    gap: 10px;
}

.nav-btn {
    background-color: #e3f2fd;
    border: 1px solid #bbdefb;
    color: #1976d2;
    padding: 6px 12px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: background-color 0.2s;
}

.nav-btn:hover:not(:disabled) {
    background-color: #bbdefb;
}

.nav-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.action-buttons {
    display: flex;
    align-items: center;
    gap: 15px;
}

.dont-show-again {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 0.9rem;
    color: #666;
    cursor: pointer;
}

.primary-btn {
    background-color: #1976d2;
    color: white;
    border: none;
    padding: 8px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: background-color 0.2s;
}

.primary-btn:hover {
    background-color: #1565c0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}

@media (max-width: 600px) {
    .announcement-modal {
        width: 95%;
    }

    .announcement-footer {
        flex-direction: column;
        align-items: stretch;
    }

    .navigation-buttons {
        margin: 10px 0;
        justify-content: center;
    }

    .action-buttons {
        justify-content: space-between;
    }
}
</style>