<script setup>
import { useRoute, useRouter } from 'nuxt/app'
import { ElMessage, ElMessageBox } from 'element-plus'
import { User, Document, Phone } from '@element-plus/icons-vue'
import { useApi } from '~/composables'

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

// 表单验证规则
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

// 级联选择器配置
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

// 获取就诊人详情
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

// 获取证件类型字典
const getDict = async () => {
    try {
        const { data: response } = await dictApi.findByDictCode("CertificatesType")
        certificatesTypeList.value = response.value.data
    } catch (error) {
        ElMessage.error('获取证件类型失败')
    }
}

// 保存或更新
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

// 保存数据
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

// 更新数据
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

// 初始化
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
    <div class="hospital-page">
        <div class="page-layout">
            <NavPatientNav />
            <div class="page-container">
                <el-card class="patient-form" v-loading="loading">
                    <template #header>
                        <div class="card-header">
                            <h2 class="title">{{ route.query.id ? '编辑' : '添加' }}就诊人</h2>
                        </div>
                    </template>

                    <el-form :model="patient" :rules="validateRules" ref="patientRef" label-width="120px"
                        class="patient-form" :disabled="loading">
                        <!-- 就诊人信息 -->
                        <div class="form-section">
                            <div class="section-title">
                                <el-icon>
                                    <User />
                                </el-icon>
                                就诊人信息
                            </div>
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item prop="name" label="姓名">
                                        <el-input v-model="patient.name" placeholder="请输入真实姓名全称" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item prop="certificatesType" label="证件类型">
                                        <el-select v-model="patient.certificatesType" placeholder="请选择证件类型"
                                            class="w-full">
                                            <el-option v-for="item in certificatesTypeList" :key="item.value"
                                                :label="item.name" :value="item.value" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item prop="certificatesNo" label="证件号码">
                                        <el-input v-model="patient.certificatesNo" placeholder="请输入证件号码" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item prop="sex" label="性别">
                                        <el-radio-group v-model="patient.sex">
                                            <el-radio :label="1">男</el-radio>
                                            <el-radio :label="0">女</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item prop="birthdate" label="出生日期">
                                        <el-date-picker v-model="patient.birthdate" type="date" placeholder="选择日期"
                                            class="w-full" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item prop="phone" label="手机号码">
                                        <el-input v-model="patient.phone" placeholder="请输入手机号码" maxlength="11" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </div>

                        <!-- 建档信息 -->
                        <div class="form-section">
                            <div class="section-title">
                                <el-icon>
                                    <Document />
                                </el-icon>
                                建档信息
                                <span class="section-subtitle">（完善后部分医院首次就诊不排队建档）</span>
                            </div>
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item prop="isMarry" label="婚姻状况">
                                        <el-radio-group v-model="patient.isMarry">
                                            <el-radio :label="0">未婚</el-radio>
                                            <el-radio :label="1">已婚</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item prop="isInsure" label="医保类型">
                                        <el-radio-group v-model="patient.isInsure">
                                            <el-radio :label="0">自费</el-radio>
                                            <el-radio :label="1">医保</el-radio>
                                        </el-radio-group>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-form-item prop="addressSelected" label="当前住址">
                                <el-cascader ref="selectedShow" v-model="patient.addressSelected" :props="props"
                                    class="w-full" placeholder="请选择省/市/区" />
                            </el-form-item>

                            <el-form-item prop="address" label="详细地址">
                                <el-input v-model="patient.address" placeholder="应公安机关要求，请填写现真实住址" />
                            </el-form-item>
                        </div>

                        <!-- 联系人信息 -->
                        <div class="form-section">
                            <div class="section-title">
                                <el-icon>
                                    <Phone />
                                </el-icon>
                                联系人信息
                                <span class="section-subtitle">（选填）</span>
                            </div>
                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item label="联系人姓名">
                                        <el-input v-model="patient.contactsName" placeholder="请输入联系人姓名" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="证件类型">
                                        <el-select v-model="patient.contactsCertificatesType" placeholder="请选择证件类型"
                                            class="w-full">
                                            <el-option v-for="item in certificatesTypeList" :key="item.value"
                                                :label="item.name" :value="item.value" />
                                        </el-select>
                                    </el-form-item>
                                </el-col>
                            </el-row>

                            <el-row :gutter="20">
                                <el-col :span="12">
                                    <el-form-item label="证件号码">
                                        <el-input v-model="patient.contactsCertificatesNo" placeholder="请输入联系人证件号码" />
                                    </el-form-item>
                                </el-col>
                                <el-col :span="12">
                                    <el-form-item label="手机号码">
                                        <el-input v-model="patient.contactsPhone" placeholder="请输入联系人手机号码"
                                            maxlength="11" />
                                    </el-form-item>
                                </el-col>
                            </el-row>
                        </div>

                        <!-- 提交按钮 -->
                        <div class="form-footer">
                            <el-button type="primary" @click="saveOrUpdate" :loading="submitBnt === '正在提交...'"
                                size="large">
                                {{ submitBnt }}
                            </el-button>
                            <el-button @click="router.push('/patient')" size="large">取消</el-button>
                        </div>
                    </el-form>
                </el-card>
            </div>
        </div>
    </div>
</template>

<style scoped>
.hospital-page {
    background-color: #f5f7fa;
    min-height: 100vh;
}

.page-layout {
    display: flex;
    gap: 20px;
    padding: 20px;
}

.page-container {
    flex: 1;
}

.patient-form {
    background: #fff;
    border-radius: 8px;
}

.card-header {
    padding: 0;
}

.title {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.form-section {
    margin-bottom: 30px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 8px;
}

.section-title {
    display: flex;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: #333;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.section-title .el-icon {
    margin-right: 8px;
    font-size: 18px;
    color: #409eff;
}

.section-subtitle {
    margin-left: 8px;
    font-size: 12px;
    color: #909399;
    font-weight: normal;
}

.form-footer {
    margin-top: 30px;
    text-align: center;
}

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
</style>