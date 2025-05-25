<script setup>
import { ElMessage } from 'element-plus'
import { useApi } from '~/composables'
import { User, ArrowLeft, Phone, Message, Lock, Document, Check, Upload } from '@element-plus/icons-vue'
import { FileType } from '~/types/common'

// 导入api
const api = useApi()
const userInfoApi = api.user

// 用户信息表单
const userForm = reactive({
    id: '',
    nickName: '',
    name: '',
    phone: '',
    email: '',
    address: '',
    certificatesType: '',
    certificatesNo: '',
    certificatesUrl: '',
    gender: '',
    birthday: '',
    avatar: ''
})

// 表单验证规则
const rules = {
    nickName: [
        { required: true, message: '请输入昵称', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20个字符', trigger: 'blur' }
    ],
    phone: [
        { required: true, message: '请输入手机号', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
    ],
    email: [
        { pattern: /^[\w-]+(\.[\w-]+)*@[\w-]+(\.[\w-]+)+$/, message: '请输入正确的邮箱地址', trigger: 'blur' }
    ],
    certificatesNo: [
        { required: true, message: '请输入证件号码', trigger: 'blur' }
    ]
}

const formRef = ref(null)
const loading = ref(false)
const router = useRouter()

// 获取用户信息
const getUserInfo = async () => {
    try {
        const { data: response } = await userInfoApi.getUserInfoDollar()
        if (response.code === 200 && response.data) {
            // 填充表单数据
            Object.keys(userForm).forEach(key => {
                if (response.data.userInfo[key] !== undefined) {
                    userForm[key] = response.data.userInfo[key]
                }
            })
        }
    } catch (error) {
        ElMessage.error('获取用户信息失败')
    }
}

// 保存用户信息
const saveUserInfo = async () => {
    if (!formRef.value) return

    await formRef.value.validate(async (valid) => {
        if (!valid) {
            ElMessage.warning('请正确填写表单信息')
            return
        }

        loading.value = true
        try {
            const { data: response } = await userInfoApi.updateUserInfo(userForm)
            if (response.code === 200) {
                ElMessage.success('保存成功')
                router.push('/user')
            } else {
                ElMessage.error(response.message || '保存失败')
            }
        } catch (error) {
            ElMessage.error('保存失败，请稍后重试')
        } finally {
            loading.value = false
        }
    })
}

// 处理头像上传请求
const handleAvatarUpload = async (options) => {
    try {
        const { file } = options
        // 使用API中的uploadFile函数上传文件
        const { data: response } = await api.oss.uploadFile(file, FileType.AVATAR)

        if (response.code !== 200) {
            ElMessage.error('头像上传失败')
            options.onError(new Error('上传失败'))
            return
        }

        // 获取上传返回的数据
        const { url, fileName } = response.data
        // 直接使用返回的URL显示头像
        userForm.avatar = url
        // 保存文件名用于后续URL续签
        userForm.avatarFileName = fileName

        // 调用成功回调
        options.onSuccess(response)
        ElMessage.success('头像更新成功')
    } catch (error) {
        console.error('更新头像失败:', error)
        ElMessage.error('头像更新失败，请稍后重试')
        options.onError(error)
    }
}

// 处理证件上传请求
const handleCertificateUpload = async (options) => {
    try {
        const { file } = options
        // 使用API中的uploadFile函数上传文件
        const { data: response } = await api.oss.uploadFile(file, FileType.ID_CARD)

        if (response.code !== 200) {
            ElMessage.error('证件上传失败')
            options.onError(new Error('上传失败'))
            return
        }

        // 获取上传返回的数据并设置证件URL
        userForm.certificatesUrl = response.data.url

        // 调用成功回调
        options.onSuccess(response)
        ElMessage.success('证件上传成功')
    } catch (error) {
        console.error('上传证件失败:', error)
        ElMessage.error('证件上传失败，请稍后重试')
        options.onError(error)
    }
}

// 上传前验证
const beforeUpload = (file) => {
    const isImage = file.type.startsWith('image/')
    const isLt2M = file.size / 1024 / 1024 < 2

    if (!isImage) {
        ElMessage.error('只能上传图片文件!')
        return false
    }
    if (!isLt2M) {
        ElMessage.error('图片大小不能超过 2MB!')
        return false
    }
    return true
}

// 返回用户中心
const goBack = () => {
    router.push('/user')
}

// 重置表单
const resetForm = () => {
    getUserInfo()
}

onMounted(() => {
    getUserInfo()
})
</script>

<template>
    <div class="edit-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">编辑个人资料</h1>
                <p class="page-subtitle">完善您的个人信息，获得更好的医疗服务体验</p>
            </div>
        </div>

        <div class="main-content">
            <!-- 返回按钮 -->
            <div class="back-section">
                <el-button @click="goBack" plain class="back-button">
                    <el-icon>
                        <ArrowLeft />
                    </el-icon>
                    返回个人中心
                </el-button>
            </div>

            <!-- 编辑表单卡片 -->
            <el-card class="edit-card" shadow="hover">
                <template #header>
                    <div class="card-header">
                        <div class="section-title">
                            <el-icon>
                                <User />
                            </el-icon>
                            <h2 class="edit-title">个人资料</h2>
                        </div>
                    </div>
                </template>

                <div class="form-container">
                    <div class="avatar-section">
                        <div class="avatar-container">
                            <div class="avatar-wrapper" v-if="!userForm.avatar">
                                <span>{{ userForm.name ? userForm.name.substring(0, 1) : '?' }}</span>
                            </div>
                            <img v-if="avatarUrl" :src="avatarUrl" alt="用户头像" class="avatar-image">

                            <el-upload class="avatar-upload" :http-request="handleAvatarUpload" :show-file-list="false"
                                :before-upload="beforeUpload">
                                <div class="upload-overlay">
                                    <el-icon class="upload-icon">
                                        <Upload />
                                    </el-icon>
                                    <span>更换头像</span>
                                </div>
                            </el-upload>
                        </div>
                        <p class="avatar-tip">点击头像更换，支持JPG、PNG格式，不超过2MB</p>
                    </div>

                    <el-form ref="formRef" :model="userForm" :rules="rules" label-width="100px" class="user-form">
                        <div class="form-section">
                            <h3 class="section-subtitle">
                                <el-icon>
                                    <User />
                                </el-icon>
                                基本信息
                            </h3>

                            <div class="form-row">
                                <el-form-item label="昵称" prop="nickName" class="form-item">
                                    <el-input v-model="userForm.nickName" placeholder="请输入昵称" />
                                </el-form-item>

                                <el-form-item label="性别" prop="gender" class="form-item">
                                    <el-select v-model="userForm.gender" placeholder="请选择性别" class="full-width">
                                        <el-option label="男" value="1" />
                                        <el-option label="女" value="2" />
                                        <el-option label="保密" value="0" />
                                    </el-select>
                                </el-form-item>
                            </div>

                            <div class="form-row">
                                <el-form-item label="出生日期" prop="birthday" class="form-item">
                                    <el-date-picker v-model="userForm.birthday" type="date" placeholder="选择出生日期"
                                        class="full-width" />
                                </el-form-item>

                                <el-form-item label="地址" prop="address" class="form-item">
                                    <el-input v-model="userForm.address" placeholder="请输入地址" />
                                </el-form-item>
                            </div>
                        </div>

                        <div class="form-section">
                            <h3 class="section-subtitle">
                                <el-icon>
                                    <Document />
                                </el-icon>
                                证件信息
                            </h3>

                            <div class="form-row">
                                <el-form-item label="证件类型" prop="certificatesType" class="form-item">
                                    <el-input v-model="userForm.certificatesType" placeholder="证件类型" disabled />
                                </el-form-item>

                                <el-form-item label="证件号码" prop="certificatesNo" class="form-item">
                                    <el-input v-model="userForm.certificatesNo" placeholder="证件号码" disabled />
                                </el-form-item>
                            </div>

                            <el-form-item label="证件照片" prop="certificatesUrl">
                                <div class="certificate-upload">
                                    <div v-if="userForm.certificatesUrl" class="certificate-preview">
                                        <img :src="userForm.certificatesUrl" alt="证件照片">
                                        <div class="certificate-overlay">
                                            <el-upload :http-request="handleCertificateUpload" :show-file-list="false"
                                                :before-upload="beforeUpload">
                                                <el-button type="primary" size="small">更换照片</el-button>
                                            </el-upload>
                                        </div>
                                    </div>

                                    <el-upload v-else class="upload-area" :http-request="handleCertificateUpload"
                                        :show-file-list="false" :before-upload="beforeUpload">
                                        <div class="upload-content">
                                            <el-icon class="upload-icon">
                                                <Upload />
                                            </el-icon>
                                            <span class="upload-text">上传证件照片</span>
                                            <span class="upload-hint">支持JPG、PNG格式，不超过2MB</span>
                                        </div>
                                    </el-upload>
                                </div>
                            </el-form-item>
                        </div>

                        <div class="form-section">
                            <h3 class="section-subtitle">
                                <el-icon>
                                    <Message />
                                </el-icon>
                                联系方式
                            </h3>

                            <div class="form-row">
                                <el-form-item label="手机号码" prop="phone" class="form-item">
                                    <el-input v-model="userForm.phone" placeholder="您绑定的手机号" disabled />
                                </el-form-item>

                                <el-form-item label="电子邮箱" prop="email" class="form-item">
                                    <el-input v-model="userForm.email" placeholder="您绑定的邮箱" disabled />
                                </el-form-item>
                            </div>
                        </div>

                        <div class="form-actions">
                            <el-button @click="resetForm" plain>重置</el-button>
                            <el-button type="primary" @click="saveUserInfo" :loading="loading">保存修改</el-button>
                        </div>
                    </el-form>
                </div>
            </el-card>
        </div>
    </div>
</template>

<style scoped>
/* 页面基础样式 */
.edit-page {
    min-height: 100vh;
    background-color: #f0f5f9;
}

/* 页面头部 */
.page-header {
    background: linear-gradient(135deg, #4a9cd8 0%, #1a6ca8 100%);
    padding: 60px 0 40px 0;
    color: white;
    text-align: center;
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.page-title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    font-weight: 600;
}

.page-subtitle {
    font-size: 1rem;
    opacity: 0.9;
}

/* 主内容区域 */
.main-content {
    max-width: 800px;
    margin: -20px auto 40px;
    padding: 0 20px;
    position: relative;
}

/* 返回按钮 */
.back-section {
    margin-bottom: 20px;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 8px;
}

/* 编辑卡片 */
.edit-card {
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

.section-title {
    display: flex;
    align-items: center;
    gap: 10px;
}

.section-title .el-icon {
    font-size: 20px;
    color: #4a9cd8;
}

.edit-title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #2c3e50;
}

/* 表单容器 */
.form-container {
    padding: 20px 0;
}

/* 头像部分 */
.avatar-section {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-bottom: 30px;
}

.avatar-container {
    position: relative;
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    margin-bottom: 10px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.avatar-wrapper {
    width: 100%;
    height: 100%;
    background: #4a9cd8;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 48px;
    font-weight: 600;
}

.avatar-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.avatar-upload {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

.upload-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: white;
    opacity: 0;
    transition: opacity 0.3s;
}

.avatar-container:hover .upload-overlay {
    opacity: 1;
}

.upload-icon {
    font-size: 24px;
    margin-bottom: 5px;
}

.avatar-tip {
    font-size: 12px;
    color: #7f8c8d;
    text-align: center;
}

/* 表单样式 */
.user-form {
    padding: 0 20px;
}

.form-section {
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e6eef5;
}

.form-section:last-child {
    border-bottom: none;
}

.section-subtitle {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 16px;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 20px;
}

.section-subtitle .el-icon {
    color: #4a9cd8;
}

.form-row {
    display: flex;
    gap: 20px;
    margin-bottom: 20px;
}

.form-item {
    flex: 1;
}

.full-width {
    width: 100%;
}

/* 证件上传 */
.certificate-upload {
    display: flex;
    gap: 20px;
}

.certificate-preview {
    position: relative;
    width: 240px;
    height: 150px;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid #e6eef5;
}

.certificate-preview img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.certificate-overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    padding: 10px;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
}

.certificate-preview:hover .certificate-overlay {
    opacity: 1;
}

.upload-area {
    width: 240px;
    height: 150px;
    border: 1px dashed #bdc3c7;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: border-color 0.3s;
}

.upload-area:hover {
    border-color: #4a9cd8;
}

.upload-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}

.upload-icon {
    font-size: 28px;
    color: #95a5a6;
    margin-bottom: 8px;
}

.upload-text {
    font-size: 14px;
    color: #2c3e50;
    margin-bottom: 4px;
}

.upload-hint {
    font-size: 12px;
    color: #7f8c8d;
}

/* 表单操作按钮 */
.form-actions {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 30px;
}

.form-actions .el-button {
    min-width: 120px;
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
    .form-row {
        flex-direction: column;
        gap: 0;
    }

    .certificate-upload {
        flex-direction: column;
        align-items: center;
    }

    .certificate-preview,
    .upload-area {
        width: 100%;
        max-width: 300px;
    }
}
</style>