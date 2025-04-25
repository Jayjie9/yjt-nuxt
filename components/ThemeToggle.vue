<!-- components/ThemeToggle.vue -->
<template>
    <div class="theme-toggle-container">
        <button class="theme-toggle-button" :class="{ 'dark': theme === 'dark' }" @click="toggleTheme"
            aria-label="切换主题模式">
            <div class="toggle-icons">
                <div class="sun-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="5"></circle>
                        <line x1="12" y1="1" x2="12" y2="3"></line>
                        <line x1="12" y1="21" x2="12" y2="23"></line>
                        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                        <line x1="1" y1="12" x2="3" y2="12"></line>
                        <line x1="21" y1="12" x2="23" y2="12"></line>
                        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                    </svg>
                </div>
                <div class="moon-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                    </svg>
                </div>
            </div>
            <div class="toggle-slider"></div>
            <div class="medical-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
            </div>
        </button>
    </div>
</template>

<script setup>
import { useTheme } from '@/composables/useTheme';

const { theme, toggleTheme, initTheme } = useTheme();

onMounted(() => {
    initTheme();
});
</script>

<style scoped>
.theme-toggle-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 1001;
    display: flex;
    align-items: center;
    justify-content: center;
}

.theme-toggle-button {
    position: relative;
    width: 68px;
    height: 32px;
    border-radius: 40px;
    background: linear-gradient(45deg, #e0f7fa, #b3e5fc);
    border: none;
    padding: 2px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    box-shadow: 0 2px 10px rgba(0, 105, 217, 0.2),
        0 0 0 2px rgba(255, 255, 255, 0.3);
    transition: all 0.3s ease;
    overflow: hidden;
}

.theme-toggle-button.dark {
    background: linear-gradient(45deg, #1a237e, #283593);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.3),
        0 0 0 2px rgba(30, 30, 60, 0.5);
}

.toggle-icons {
    position: absolute;
    width: 100%;
    display: flex;
    justify-content: space-between;
    padding: 0 8px;
    box-sizing: border-box;
    z-index: 1;
}

.sun-icon,
.moon-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
}

.sun-icon {
    color: #ff9800;
    transform: translateY(0);
    opacity: 1;
}

.moon-icon {
    color: #f5f5f5;
    transform: translateY(0);
    opacity: 0.5;
}

.theme-toggle-button.dark .sun-icon {
    opacity: 0.5;
}

.theme-toggle-button.dark .moon-icon {
    opacity: 1;
}

.toggle-slider {
    position: absolute;
    width: 28px;
    height: 28px;
    background-color: #ffffff;
    border-radius: 50%;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    left: 2px;
    transition: transform 0.3s cubic-bezier(0.68, -0.55, 0.27, 1.55);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
}

.theme-toggle-button.dark .toggle-slider {
    transform: translateX(36px);
    background-color: #121212;
}

.medical-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    color: #1976d2;
    z-index: 3;
    opacity: 0.8;
    transition: all 0.3s ease;
}

.theme-toggle-button.dark .medical-icon {
    color: #64b5f6;
}

@media (max-width: 768px) {
    .theme-toggle-container {
        top: 15px;
        right: 15px;
    }

    .theme-toggle-button {
        width: 60px;
        height: 28px;
    }

    .toggle-slider {
        width: 24px;
        height: 24px;
    }

    .theme-toggle-button.dark .toggle-slider {
        transform: translateX(32px);
    }
}

/* 悬停效果 */
.theme-toggle-button:hover {
    transform: scale(1.05);
}

.theme-toggle-button:hover .medical-icon {
    animation: pulse 1.5s infinite;
}

@keyframes pulse {

    0%,
    100% {
        opacity: 0.8;
    }

    50% {
        opacity: 1;
    }
}

/* 用于支持暗色和亮色主题 */
html[data-theme='light'] .theme-toggle-button {
    --button-bg: linear-gradient(45deg, #e0f7fa, #b3e5fc);
    --button-shadow: rgba(0, 105, 217, 0.2);
    --icon-color: #1976d2;
}

html[data-theme='dark'] .theme-toggle-button {
    --button-bg: linear-gradient(45deg, #1a237e, #283593);
    --button-shadow: rgba(0, 0, 0, 0.3);
    --icon-color: #64b5f6;
}
</style>