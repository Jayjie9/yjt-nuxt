<script setup>
import { ElMessage } from 'element-plus'
import { useApi } from '~/composables'

// 导入api
const api = useApi()
const dictApi = api.dictionary
const userInfoApi = api.user

const defaultForm = {
  name: '',
  certificatesType: '',
  certificatesNo: '',
  certificatesUrl: ''
}

const userAuth = reactive({ ...defaultForm })
const certificatesTypeList = ref([])
const fileUrl = ref('http://localhost:9999/api/oss/file/fileUpload')
const userInfo = reactive({
  param: {}
})
const submitBnt = ref('提交')

const getUserInfo = async () => {
  const { data: response } = await userInfoApi.getUserInfoDollar()
  Object.assign(userInfo, response.data)
}

const saveUserAuth = async () => {
  if (submitBnt.value === '正在提交...') {
    ElMessage.info('重复提交')
    return
  }
  submitBnt.value = '正在提交...'
  try {
    await userInfoApi.saveUserAuth(userAuth)
    ElMessage.success("提交成功")
    window.location.reload()
  } catch (e) {
    submitBnt.value = '提交'
  }
}

const getDict = async () => {
  const { data: response } = await dictApi.findByDictCodeDollar("CertificatesType")
  certificatesTypeList.value = response.data
}

const onUploadSuccess = (response, file) => {
  if (response.code !== 200) {
    ElMessage.error("上传失败")
    return
  }
  userAuth.certificatesUrl = file.response.data
}

const init = async () => {
  await getUserInfo()
  await getDict()
}

onMounted(() => {
  init()
})
</script>

<template>
  <div class="user-page">
    <div class="user-layout">
      <NavUserNav />
      <div class="user-container">
        <el-card class="auth-card">
          <template #header>
            <div class="auth-header">
              <h2 class="auth-title">实名认证</h2>
              <el-tag :type="userInfo.authStatus == 0 ? 'warning' : 'success'" class="auth-status">
                {{ userInfo.param.authStatusString }}
              </el-tag>
            </div>
          </template>

          <el-alert type="info" :closable="false" show-icon>
            <p class="auth-tips">
              完成实名认证后才能添加就诊人，正常进行挂号，为了不影响后续步骤，建议提前实名认证。
            </p>
          </el-alert>

          <!-- 未认证表单 -->
          <div v-if="userInfo.authStatus == 0" class="auth-form">
            <el-form :model="userAuth" label-width="120px" :rules="rules" ref="authForm">
              <el-form-item prop="name" label="姓名：">
                <el-input v-model="userAuth.name" placeholder="请输入联系人姓名全称" clearable />
              </el-form-item>

              <el-form-item prop="certificatesType" label="证件类型：">
                <el-select v-model="userAuth.certificatesType" placeholder="请选择证件类型" class="auth-select">
                  <el-option v-for="item in certificatesTypeList" :key="item.value" :label="item.name"
                    :value="item.name" />
                </el-select>
              </el-form-item>

              <el-form-item prop="certificatesNo" label="证件号码：">
                <el-input v-model="userAuth.certificatesNo" placeholder="请输入联系人证件号码" clearable />
              </el-form-item>

              <el-form-item prop="certificatesUrl" label="上传证件：">
                <div class="upload-section">
                  <el-upload class="auth-upload" :action="fileUrl" :show-file-list="false" :on-success="onUploadSuccess"
                    :before-upload="beforeUpload">
                    <div class="upload-area" v-if="!userAuth.certificatesUrl">
                      <el-icon class="upload-icon">
                        <Plus />
                      </el-icon>
                      <span class="upload-text">上传证件照片</span>
                    </div>
                    <img v-else :src="userAuth.certificatesUrl" class="upload-preview">
                  </el-upload>

                  <div class="upload-example">
                    <img src="//img.114yygh.com/static/web/auth_example.png" alt="示例图">
                    <span class="example-text">证件示例</span>
                  </div>
                </div>
              </el-form-item>

              <el-form-item>
                <el-button type="primary" :loading="submitBnt === '正在提交...'" @click="saveUserAuth">
                  {{ submitBnt }}
                </el-button>
              </el-form-item>
            </el-form>
          </div>

          <!-- 已认证信息展示 -->
          <div v-else class="auth-info">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="姓名">
                {{ userInfo.name }}
              </el-descriptions-item>
              <el-descriptions-item label="证件类型">
                {{ userInfo.certificatesType }}
              </el-descriptions-item>
              <el-descriptions-item label="证件号码">
                {{ userInfo.certificatesNo }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped>
.user-page {
  background-color: #f5f7fa;
  min-height: 100vh;
}

.user-layout {
  display: flex;
  gap: 24px;
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
}

.user-container {
  flex: 1;
  min-width: 0;
}

.auth-card {
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.auth-header {
  display: flex;
  align-items: center;
  gap: 16px;
}

.auth-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.auth-status {
  font-size: 14px;
}

.auth-tips {
  margin: 0;
  line-height: 1.6;
  color: #606266;
}

.auth-form {
  margin-top: 24px;
  max-width: 600px;
}

.auth-select {
  width: 100%;
}

.upload-section {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

.auth-upload {
  width: 200px;
}

.upload-area {
  width: 200px;
  height: 200px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: border-color 0.3s;
}

.upload-area:hover {
  border-color: #409eff;
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  margin-bottom: 8px;
}

.upload-text {
  font-size: 14px;
  color: #606266;
}

.upload-preview {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}

.upload-example {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.upload-example img {
  width: 200px;
  border-radius: 4px;
}

.example-text {
  font-size: 12px;
  color: #909399;
}

.auth-info {
  max-width: 600px;
}

:deep(.el-descriptions__label) {
  width: 120px;
  justify-content: flex-end;
}

:deep(.el-form-item__label) {
  font-weight: 500;
}

@media screen and (max-width: 768px) {
  .user-layout {
    flex-direction: column;
  }

  .auth-form {
    max-width: 100%;
  }

  .upload-section {
    flex-direction: column;
    align-items: center;
  }

  .upload-example {
    margin-top: 16px;
  }
}
</style>