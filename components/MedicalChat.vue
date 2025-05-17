<template>
    <div class="medical-chat-container">
        <div class="mode-selector">
            <button :class="{ active: mode === 'ai' }" @click="changeMode('ai')">
                <span class="icon"><i class="fa-solid fa-robot"></i></span>
                AI对话
            </button>
            <button :class="{ active: mode === 'symptom' }" @click="changeMode('symptom')">
                <span class="icon"><i class="fa-solid fa-stethoscope"></i></span>
                症状分析
            </button>
        </div>

        <div class="chat-messages" ref="chatContainer">
            <div v-for="(message, index) in messages" :key="index"
                :class="['message', message.sender === 'user' ? 'user-message' : 'ai-message']">
                <div class="message-avatar">
                    <div v-if="message.sender === 'user'" class="user-avatar">
                        <i class="fa-solid fa-user"></i>
                    </div>
                    <div v-else class="ai-avatar">
                        <i class="fa-solid fa-hospital"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="message-text">{{ message.text }}</div>
                    <div class="message-time">{{ message.time }}</div>
                </div>
            </div>
            <div v-if="isLoading" class="message ai-message loading">
                <div class="message-avatar">
                    <div class="ai-avatar">
                        <i class="fa-solid fa-hospital"></i>
                    </div>
                </div>
                <div class="message-content">
                    <div class="typing-indicator">
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="input-container">
            <textarea v-model="userInput" :placeholder="mode === 'ai' ? '请输入您的问题...' : '请描述您的症状...'"
                @keydown.enter.prevent="sendMessage" ref="inputField" rows="1"></textarea>
            <button class="send-button" @click="sendMessage" :disabled="!userInput.trim() || isLoading">
                <i class="fa-solid fa-paper-plane"></i>
            </button>
        </div>

        <div class="mode-hint">
            <div v-if="mode === 'ai'" class="hint-text">
                <i class="fa-solid fa-lightbulb"></i>
                当前为AI对话模式，您可以询问任何健康相关问题
            </div>
            <div v-else class="hint-text">
                <i class="fa-solid fa-clipboard-list"></i>
                当前为症状分析模式，请详细描述您的症状以获得准确分析
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue';

// 状态管理
const mode = ref('ai'); // 'ai' 或 'symptom'
const userInput = ref('');
const messages = ref([]);
const isLoading = ref(false);
const chatContainer = ref(null);
const inputField = ref(null);

// 切换模式
const changeMode = (newMode) => {
    mode.value = newMode;
};

// 自动调整文本区域高度
const adjustTextareaHeight = () => {
    if (inputField.value) {
        inputField.value.style.height = 'auto';
        inputField.value.style.height = `${Math.min(inputField.value.scrollHeight, 120)}px`;
    }
};

watch(userInput, () => {
    adjustTextareaHeight();
});

// 格式化当前时间
const formatTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
};

// 发送消息
const sendMessage = async () => {
    if (!userInput.value.trim() || isLoading.value) return;

    // 添加用户消息到聊天
    const userMessage = {
        text: userInput.value,
        sender: 'user',
        time: formatTime()
    };

    messages.value.push(userMessage);

    // 清空输入框
    const inputContent = userInput.value;
    userInput.value = '';
    adjustTextareaHeight();

    // 滚动到底部
    await nextTick();
    scrollToBottom();

    // 显示加载状态
    isLoading.value = true;

    try {
        // 根据当前模式调用不同的API
        const endpoint = mode.value === 'ai' ? '/api/ai-chat' : '/api/symptom-analysis';

        // 这里使用模拟响应，实际使用时替换为真实API调用
        // const response = await fetch(endpoint, {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ message: inputContent })
        // });
        // const data = await response.json();

        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 模拟响应数据
        let responseText;
        if (mode.value === 'ai') {
            responseText = `感谢您的提问。${inputContent.length < 10 ? '请提供更多信息，以便我能更好地帮助您。' : '我们建议您保持良好的生活习惯，定期锻炼，均衡饮食，如有持续不适请及时就医。'}`;
        } else {
            responseText = `基于您描述的症状"${inputContent}"，可能与以下情况有关：\n1. 建议您关注症状变化\n2. 保持充分休息\n3. 如症状加重，请立即就医`;
        }

        // 添加AI响应到聊天
        messages.value.push({
            text: responseText,
            sender: 'ai',
            time: formatTime()
        });
    } catch (error) {
        console.error('Error sending message:', error);
        // 添加错误消息
        messages.value.push({
            text: '抱歉，服务出现了问题，请稍后再试。',
            sender: 'ai',
            time: formatTime()
        });
    } finally {
        isLoading.value = false;
        // 滚动到底部
        await nextTick();
        scrollToBottom();
    }
};

// 滚动到底部
const scrollToBottom = () => {
    if (chatContainer.value) {
        chatContainer.value.scrollTop = chatContainer.value.scrollHeight;
    }
};

onMounted(() => {
    // 初始化欢迎消息
    messages.value = [{
        text: '您好，我是您的医疗助手。我可以回答健康问题或分析您的症状。请选择合适的模式并开始咨询。',
        sender: 'ai',
        time: formatTime()
    }];
});
</script>

<style scoped>
.medical-chat-container {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    max-width: 800px;
    margin: 0 auto;
    border-radius: 12px;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    background-color: #f8fafc;
    height: 600px;
    position: relative;
}

.mode-selector {
    display: flex;
    background-color: #e8f4fa;
    padding: 12px;
    border-bottom: 1px solid #e0e7ee;
}

.mode-selector button {
    flex: 1;
    background: none;
    border: none;
    padding: 10px;
    font-size: 14px;
    font-weight: 600;
    color: #5a6878;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    margin: 0 5px;
}

.mode-selector button .icon {
    margin-right: 8px;
    font-size: 16px;
}

.mode-selector button.active {
    background-color: #fff;
    color: #0078d7;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}

.mode-selector button:hover:not(.active) {
    background-color: rgba(255, 255, 255, 0.7);
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    background-color: #f8fafc;
    scroll-behavior: smooth;
}

.message {
    display: flex;
    max-width: 85%;
    animation: fadeIn 0.3s ease;
}

.user-message {
    align-self: flex-end;
    flex-direction: row-reverse;
}

.ai-message {
    align-self: flex-start;
}

.message-avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.user-avatar {
    background-color: #0078d7;
    color: white;
}

.ai-avatar {
    background-color: #4caf50;
    color: white;
}

.message-content {
    background-color: white;
    padding: 12px 16px;
    border-radius: 18px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    position: relative;
    margin: 0 12px;
}

.user-message .message-content {
    background-color: #e3f2fd;
    color: #0d47a1;
}

.ai-message .message-content {
    background-color: white;
    color: #263238;
}

.message-text {
    line-height: 1.5;
    white-space: pre-line;
}

.message-time {
    font-size: 11px;
    color: #90a4ae;
    text-align: right;
    margin-top: 4px;
}

.input-container {
    display: flex;
    align-items: flex-end;
    padding: 12px 16px;
    background-color: white;
    border-top: 1px solid #e0e7ee;
    position: relative;
}

textarea {
    flex: 1;
    border: 1px solid #e0e7ee;
    border-radius: 20px;
    padding: 12px 16px;
    font-size: 14px;
    line-height: 1.4;
    max-height: 120px;
    resize: none;
    outline: none;
    transition: border-color 0.2s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    font-family: inherit;
}

textarea:focus {
    border-color: #0078d7;
}

.send-button {
    background-color: #0078d7;
    border: none;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    margin-left: 12px;
    transition: all 0.2s ease;
    flex-shrink: 0;
    box-shadow: 0 2px 5px rgba(0, 120, 215, 0.3);
}

.send-button:hover {
    background-color: #0066b3;
}

.send-button:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    box-shadow: none;
}

.mode-hint {
    padding: 8px 16px;
    background-color: #f0f7ff;
    border-top: 1px solid #e0e7ee;
    font-size: 12px;
    color: #5a6878;
}

.hint-text {
    display: flex;
    align-items: center;
}

.hint-text i {
    margin-right: 8px;
    color: #0078d7;
}

/* 打字动画 */
.typing-indicator {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    height: 20px;
}

.typing-indicator span {
    height: 8px;
    width: 8px;
    background-color: #90a4ae;
    border-radius: 50%;
    display: inline-block;
    margin: 0 2px;
    opacity: 0.6;
    animation: typing 1.4s infinite ease-in-out both;
}

.typing-indicator span:nth-child(1) {
    animation-delay: 0s;
}

.typing-indicator span:nth-child(2) {
    animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
    animation-delay: 0.4s;
}

@keyframes typing {
    0% {
        transform: scale(1);
    }

    50% {
        transform: scale(1.5);
    }

    100% {
        transform: scale(1);
    }
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

/* 响应式设计 */
@media (max-width: 768px) {
    .medical-chat-container {
        height: calc(100vh - 40px);
        border-radius: 0;
        max-width: 100%;
    }

    .message {
        max-width: 90%;
    }
}
</style>