<script setup>
import { useRoute, useRouter } from 'nuxt/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Document, Phone, ArrowLeft, Calendar, Location } from '@element-plus/icons-vue'
import { useApi } from '~/composables'

/* API & 路由 */
const api = useApi()
const patientApi = api.patient
const dictApi = api.dictionary
const route = useRoute()
const router = useRouter()

/*
{
    "code": 200,
    "message": "成功",
    "data": {
        "id": 1,
        "createTime": "2022-02-06 09:18:06",
        "updateTime": "2025-04-12 18:44:52",
        "isDeleted": 0,
        "param": {
            "certificatesTypeString": "身份证",
            "contactsCertificatesTypeString": null,
            "cityString": "市辖区",
            "fullAddress": "北京市市辖区朝阳区大望路114号",
            "districtString": "朝阳区",
            "provinceString": "北京市"
        },
        "userId": 16,
        "name": "张三",
        "certificatesType": "10",
        "certificatesNo": "230281200202023715",
        "sex": 1,
        "birthdate": "2022-02-01",
        "phone": "13845046517",
        "isMarry": 0,
        "provinceCode": "110000",
        "cityCode": "110100",
        "districtCode": "110105",
        "address": "大望路114号",
        "contactsName": "",
        "contactsCertificatesType": "",
        "contactsCertificatesNo": "",
        "contactsPhone": "",
        "isInsure": 0,
        "cardNo": null,
        "status": "0"
    },
    "ok": true
}
*/

// 表单默认值
const defaultForm = {
    name: '',
    certificatesType: '10', // 默认身份证
    certificatesNo: '',
    sex: 1,
    birthdate: '',
    phone: '',
    isMarry: 0,
    isInsure: 0,
    provinceCode: '',
    cityCode: '',
    districtCode: '',
    addressSelected: null,
    address: '',
    contactsName: '',
    contactsCertificatesType: '',
    contactsCertificatesNo: '',
    contactsPhone: '',
    param: {}
}

// 响应式数据
const patient = reactive({ ...defaultForm })
const certificatesTypeList = ref([])
const submitBnt = ref('保存')
const patientRef = ref(null)
const selectedShow = ref(null)
const loading = ref(false)

/* 表单验证规则 */
const validateRules = {
    name: [
        { required: true, message: '请输入姓名', trigger: 'blur' },
        { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
    ],
    certificatesType: [{ required: true, message: '请选择证件类型', trigger: 'change' }],
    certificatesNo: [
        { required: true, message: '请输入证件号码', trigger: 'blur' },
        { pattern: /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/, message: '请输入正确的身份证号', trigger: 'blur' }
    ],
    birthdate: [{ required: true, message: '请选择出生日期', trigger: 'change' }],
    phone: [
        { required: true, message: '请输入手机号码', trigger: 'blur' },
        { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
    ],
    addressSelected: [{ required: true, message: '请选择居住地址', trigger: 'change' }],
    address: [
        { required: true, message: '请输入详细地址', trigger: 'blur' },
        { min: 5, max: 100, message: '长度在 5 到 100 个字符', trigger: 'blur' }
    ]
}

/* 级联选择器配置 */
const props = {
    lazy: true,
    lazyLoad: async (node, resolve) => {
        try {
            const { level } = node
            const { data: response } = await dictApi.findByParentIdDollar(level ? node.value : '86')
            const list = response.data?.map(item => ({  // 移除 .value
                value: item.id,
                label: item.name,
                leaf: level === 2
            }))
            resolve(list)
        } catch (error) {
            console.error('加载地区数据失败:', error)
            ElMessage.error('加载地区数据失败')
            resolve([])
        }
    }
}

/* ============================================== */
/* 方法 */
/* ============================================== */

/* 获取就诊人详情 */
const fetchDataById = async (id) => {
    try {
        loading.value = true
        const { data: response } = await patientApi.getByIdDollar(id)
        if (response?.data) {  // 修改这里的数据结构判断
            const patientData = response.data
            // 合并数据到表单
            Object.assign(patient, patientData)
            // 设置地址选择器的值
            patient.addressSelected = [
                patientData.provinceCode,
                patientData.cityCode,
                patientData.districtCode
            ]
            // TODO
            // 等待DOM更新后设置地址显示文本
            // 等待DOM更新完成后,设置级联选择器的显示文本
            // 将省市区的名称拼接成一个字符串显示,例如"北京市/市辖区/朝阳区"
            nextTick(() => {
                if (selectedShow.value && patientData.param) {
                    selectedShow.presentText = [
                        patientData.param.provinceString,
                        patientData.param.cityString,
                        patientData.param.districtString
                    ].filter(Boolean).join('/')
                }
            })
        }
    } catch (error) {
        console.error('获取就诊人详情错误:', error)
        ElMessage.error('获取就诊人信息失败')
    } finally {
        loading.value = false
    }
}

/* 获取证件类型字典 */
const getDict = async () => {
    try {
        const { data: response } = await dictApi.findByDictCode("CertificatesType")
        certificatesTypeList.value = response.value.data
    } catch (error) {
        ElMessage.error('获取证件类型失败')
    }
}

/* 保存或更新 */
const saveOrUpdate = () => {
    patientRef.value?.validate(async valid => {
        if (valid) {
            if (patient.addressSelected?.length === 3) {
                [patient.provinceCode, patient.cityCode, patient.districtCode] = patient.addressSelected
            }
            await (patient.id ? updateData() : saveData())
        }
    })
}

/* 保存数据 */
const saveData = async () => {
    if (submitBnt.value === '正在提交...') return ElMessage.info('请勿重复提交')

    try {
        submitBnt.value = '正在提交...'
        await patientApi.savePatient(patient)
        ElMessage.success('添加成功')
        await navigateTo('/patient')
    } catch (error) {
        ElMessage.error('添加失败')
    } finally {
        submitBnt.value = '保存'
    }
}

/* 更新数据 */
const updateData = async () => {
    if (submitBnt.value === '正在提交...') return ElMessage.info('请勿重复提交')

    try {
        submitBnt.value = '正在提交...'
        await patientApi.updatePatient(patient)
        ElMessage.success('更新成功')
        await navigateTo('/patient')
    } catch (error) {
        ElMessage.error('更新失败')
    } finally {
        submitBnt.value = '保存'
    }
}

/* 返回列表 */
const goBack = () => {
    if (route.query.id) {
        return navigateTo({
            path: '/patient/show',
            query: { id: route.query.id }
        })
    }
    return navigateTo('/patient')
}

/* 初始化 */
const init = async () => {
    try {
        loading.value = true
        if (route.query.id) {
            await fetchDataById(route.query.id)
        }
        await getDict()
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    init()
})
</script>

<template>
    <div class="patient-add-page">
        <!-- 页面头部 -->
        <div class="page-header">
            <div class="header-content">
                <h1 class="page-title">{{ route.query.id ? '编辑' : '添加' }}就诊人</h1>
                <p class="page-subtitle">{{ route.query.id ? '修改就诊人信息' : '添加新的就诊人，用于预约挂号和医疗服务' }}</p>
            </div>
        </div>

        <!-- 主要内容区域 -->
        <div class="main-content">
            <div class="content-container">
                <!-- 返回按钮 -->
                <div class="back-button-container">
                    <el-button class="back-button" @click="goBack">
                        <el-icon>
                            <ArrowLeft />
                        </el-icon>
                        返回就诊人列表
                    </el-button>
                </div>

                <!-- 表单卡片 -->
                <el-card class="form-card" shadow="hover" v-loading="loading">
                    <div class="form-header">
                        <div class="form-progress">
                            <div class="progress-step active">
                                <div class="step-icon">
                                    <el-icon>
                                        <User />
                                    </el-icon>
                                </div>
                                <div class="step-label">基本信息</div>
                            </div>
                            <div class="progress-line"></div>
                            <div class="progress-step active">
                                <div class="step-icon">
                                    <el-icon>
                                        <Location />
                                    </el-icon>
                                </div>
                                <div class="step-label">建档信息</div>
                            </div>
                            <div class="progress-line"></div>
                            <div class="progress-step">
                                <div class="step-icon">
                                    <el-icon>
                                        <Phone />
                                    </el-icon>
                                </div>
                                <div class="step-label">联系人信息</div>
                            </div>
                        </div>
                    </div>

                    <el-form :model="patient" :rules="validateRules" ref="patientRef" label-width="100px"
                        class="patient-form" :disabled="loading">
                        <!-- 就诊人信息 -->
                        <div class="form-section">
                            <div class="section-header">
                                <div class="section-title">
                                    <span class="title-icon"></span>
                                    <span>就诊人信息</span>
                                </div>
                                <div class="section-desc">请填写真实信息，用于医院就诊</div>
                            </div>

                            <div class="form-grid">
                                <el-form-item prop="name" label="姓名">
                                    <div class="input-with-icon">
                                        <el-icon class="field-icon">
                                            <User />
                                        </el-icon>
                                        <el-input v-model="patient.name" placeholder="请输入真实姓名全称" />
                                    </div>
                                </el-form-item>

                                <el-form-item prop="sex" label="性别">
                                    <el-radio-group v-model="patient.sex">
                                        <el-radio :label="1">男</el-radio>
                                        <el-radio :label="0">女</el-radio>
                                    </el-radio-group>
                                </el-form-item>

                                <el-form-item prop="birthdate" label="出生日期">
                                    <div class="input-with-icon">
                                        <el-icon class="field-icon">
                                            <Calendar />
                                        </el-icon>
                                        <el-date-picker v-model="patient.birthdate" type="date" placeholder="选择日期"
                                            class="w-full" />
                                    </div>
                                </el-form-item>

                                <el-form-item prop="phone" label="手机号码">
                                    <div class="input-with-icon">
                                        <el-icon class="field-icon">
                                            <Phone />
                                        </el-icon>
                                        <el-input v-model="patient.phone" placeholder="请输入手机号码" maxlength="11" />
                                    </div>
                                </el-form-item>

                                <el-form-item prop="certificatesType" label="证件类型">
                                    <div class="input-with-icon">
                                        <el-icon class="field-icon">
                                            <User />
                                        </el-icon>
                                        <el-select v-model="patient.certificatesType" placeholder="请选择证件类型"
                                            class="w-full">
                                            <el-option v-for="item in certificatesTypeList" :key="item.value"
                                                :label="item.name" :value="item.value" />
                                        </el-select>
                                    </div>
                                </el-form-item>

                                <el-form-item prop="certificatesNo" label="证件号码">
                                    <div class="input-with-icon">
                                        <el-icon class="field-icon">
                                            <Document />
                                        </el-icon>
                                        <el-input v-model="patient.certificatesNo" placeholder="请输入证件号码" />
                                    </div>
                                </el-form-item>
                            </div>
                        </div>

                        <!-- 建档信息 -->
                        <div class="form-section">
                            <div class="section-header">
                                <div class="section-title">
                                    <span class="title-icon"></span>
                                    <span>建档信息</span>
                                </div>
                                <div class="section-desc">完善后部分医院首次就诊不排队建档</div>
                            </div>

                            <div class="form-grid">
                                <el-form-item prop="isMarry" label="婚姻状况">
                                    <el-radio-group v-model="patient.isMarry">
                                        <el-radio :label="0">未婚</el-radio>
                                        <el-radio :label="1">已婚</el-radio>
                                    </el-radio-group>
                                </el-form-item>

                                <el-form-item prop="isInsure" label="医保类型">
                                    <el-radio-group v-model="patient.isInsure">
                                        <el-radio :label="0">自费</el-radio>
                                        <el-radio :label="1">医保</el-radio>
                                    </el-radio-group>
                                </el-form-item>
                            </div>

                            <el-form-item prop="addressSelected" label="当前住址">
                                <div class="input-with-icon">
                                    <el-icon class="field-icon">
                                        <Location />
                                    </el-icon>
                                    <el-cascader ref="selectedShow" v-model="patient.addressSelected" :props="props"
                                        class="w-full" placeholder="请选择省/市/区" />
                                </div>
                            </el-form-item>

                            <el-form-item prop="address" label="详细地址">
                                <el-input v-model="patient.address" placeholder="应公安机关要求，请填写现真实住址" />
                            </el-form-item>
                        </div>

                        <!-- 联系人信息 -->
                        <div class="form-section">
                            <div class="section-header">
                                <div class="section-title">
                                    <span class="title-icon"></span>
                                    <span>联系人信息</span>
                                </div>
                                <div class="section-desc">选填，用于紧急情况联系</div>
                            </div>

                            <div class="form-grid">
                                <el-form-item label="联系人姓名">
                                    <div class="input-with-icon">
                                        <el-icon class="field-icon">
                                            <User />
                                        </el-icon>
                                        <el-input v-model="patient.contactsName" placeholder="请输入联系人姓名" />
                                    </div>
                                </el-form-item>

                                <el-form-item label="联系人手机">
                                    <div class="input-with-icon">
                                        <el-icon class="field-icon">
                                            <Phone />
                                        </el-icon>
                                        <el-input v-model="patient.contactsPhone" placeholder="请输入联系人手机号码"
                                            maxlength="11" />
                                    </div>
                                </el-form-item>

                                <el-form-item label="证件类型">
                                    <div class="input-with-icon">
                                        <el-icon class="field-icon">
                                            <User />
                                        </el-icon>
                                        <el-select v-model="patient.contactsCertificatesType" placeholder="请选择证件类型"
                                            class="w-full">
                                            <el-option v-for="item in certificatesTypeList" :key="item.value"
                                                :label="item.name" :value="item.value" />
                                        </el-select>
                                    </div>
                                </el-form-item>

                                <el-form-item label="证件号码">
                                    <div class="input-with-icon">
                                        <el-icon class="field-icon">
                                            <Document />
                                        </el-icon>
                                        <el-input v-model="patient.contactsCertificatesNo" placeholder="请输入联系人证件号码" />
                                    </div>
                                </el-form-item>
                            </div>
                        </div>

                        <!-- 提交按钮 -->
                        <div class="form-footer">
                            <el-button type="primary" @click="saveOrUpdate" :loading="submitBnt === '正在提交...'"
                                size="large" class="submit-btn">
                                {{ submitBnt }}
                            </el-button>
                            <el-button @click="goBack" size="large" class="cancel-btn">取消</el-button>
                        </div>
                    </el-form>
                </el-card>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 页面基础样式 */
.patient-add-page {
    min-height: 100vh;
    background-color: var(--el-bg-color-page, #f5f7fa);
}

/* 页面头部 */
.page-header {
    background: linear-gradient(135deg, #1890ff 0%, #096dd9 100%);
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
    max-width: 900px;
    margin: -20px auto 40px;
    padding: 0 20px;
    position: relative;
}

.content-container {
    position: relative;
}

/* 返回按钮 */
.back-button-container {
    margin-bottom: 16px;
}

.back-button {
    display: flex;
    align-items: center;
    gap: 5px;
}

/* 表单卡片 */
.form-card {
    border-radius: 8px;
    overflow: hidden;
    transition: all 0.3s;
    box-shadow: var(--el-box-shadow-light);
    margin-bottom: 30px;
}

/* 表单头部进度条 */
.form-header {
    margin-bottom: 30px;
}

.form-progress {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 40px;
    background-color: #f8f9fa;
    border-radius: 8px;
}

.progress-step {
    display: flex;
    flex-direction: column;
    align-items: center;
    position: relative;
    z-index: 1;
}

.step-icon {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #f0f0f0;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    color: #909399;
    font-size: 20px;
    transition: all 0.3s;
}

.progress-step.active .step-icon {
    background-color: var(--el-color-primary);
    color: white;
}

.step-label {
    font-size: 14px;
    color: #606266;
    font-weight: 500;
}

.progress-step.active .step-label {
    color: var(--el-color-primary);
}

.progress-line {
    flex: 1;
    height: 2px;
    background-color: #f0f0f0;
    position: relative;
    z-index: 0;
}

/* 表单区域 */
.form-section {
    margin-bottom: 30px;
    padding: 24px;
    background: #f8f9fa;
    border-radius: 8px;
}

.section-header {
    margin-bottom: 20px;
}

.section-title {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
}

.title-icon {
    width: 4px;
    height: 18px;
    background-color: var(--el-color-primary);
    margin-right: 8px;
    border-radius: 2px;
}

.section-desc {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin-left: 12px;
}

/* 表单网格布局 */
.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
}

/* 输入框带图标 */
.input-with-icon {
    position: relative;
}

.field-icon {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    color: #909399;
    z-index: 1;
}

.input-with-icon :deep(.el-input__wrapper),
.input-with-icon :deep(.el-select),
.input-with-icon :deep(.el-cascader) {
    padding-left: 35px;
}

/* 表单底部 */
.form-footer {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 40px;
}

.submit-btn,
.cancel-btn {
    min-width: 120px;
    padding: 12px 20px;
    font-size: 16px;
}

/* 通用样式 */
.w-full {
    width: 100%;
}

:deep(.el-form-item__label) {
    font-weight: 500;
}

:deep(.el-input__wrapper),
:deep(.el-select),
:deep(.el-cascader) {
    width: 100%;
}

:deep(.el-radio-group) {
    width: 100%;
    display: flex;
    gap: 30px;
}

:deep(.el-form-item.is-error .el-input__wrapper) {
    box-shadow: 0 0 0 1px var(--el-color-danger) inset;
}

/* 响应式布局 */
@media screen and (max-width: 768px) {
    .page-title {
        font-size: 1.5rem;
    }

    .page-subtitle {
        font-size: 0.9rem;
    }

    .main-content {
        padding: 0 15px;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .form-progress {
        padding: 15px;
    }

    .step-icon {
        width: 40px;
        height: 40px;
        font-size: 16px;
    }

    .step-label {
        font-size: 12px;
    }

    .form-footer {
        flex-direction: column;
    }

    .submit-btn,
    .cancel-btn {
        width: 100%;
    }
}
</style>