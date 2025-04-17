/**
 * 客户端API接口
 * 负责处理客户端API请求
 * 包括登录、注册、用户信息获取等
 */
import {
  useFetchGet,
  useFetchPost,
  useFetchPut,
  useFetchDelete,
} from './useFetchHttp'

import {
  fetchGet,
  fetchPost,
  fetchPut,
  fetchDelete,
} from './useDollarFetchHttp'

interface UserLoginData {
  phone: string
  code: string
  openid?: string
}

interface UserPwdLoginData {
  phone: string
  password: string
  openid?: string
}

interface PatientData {
  id?: string
  name: string
  certificatesType: string
  certificatesNo: string
  sex: number
  birthdate: string
  phone: string
  isMarry: number
  isInsure: number
  addressSelected: string
  address: string
  contactsName: string
  contactsCertificatesType: string
  contactsCertificatesNo: string
  contactsPhone: string
}

interface UserAuthData {
  name: string
  certificatesType: string
  certificatesNo: string
}

interface OrderQueryParams {
  patientId?: string
  orderStatus?: string
  reserveDate?: string
  hosname?: string
}

interface HospitalQueryParams {
  hostype?: string
  districtCode?: string
}

// 用户手机号验证码登录
export const loginBySms = (data: UserLoginData) => {
  return useFetchPost('/api/user/login', data)
}

export const loginByPassword = (data: UserPwdLoginData) => {
  return useFetchPost('/api/user/pwdLogin', data)
}

// 测试接口
export const test = () => {
  return useFetchGet('/api/user/test')
}

// 发送手机验证码
export const sendCaptcha = (phone: string) => {
  const encodedPhone = encodeURIComponent(phone)
  return useFetchGet(`/api/sms/send/${encodedPhone}`)
}

// 医院接口
export const useHospitalApi = () => {
  // 分页查询医院列表
  const getHospPageList = (
    page: number,
    limit: number,
    searchObj: HospitalQueryParams
  ) => {
    return useFetchGet(
      `/api/hosp/hospital/findHospList/${page}/${limit}`,
      searchObj
    )
  }

  const getHospPageListDollar = (
    page: number,
    limit: number,
    searchObj: HospitalQueryParams
  ) => {
    return fetchGet(
      `/api/hosp/hospital/findHospList/${page}/${limit}`,
      searchObj
    )
  }

  // 根据医院名称获取医院列表
  const getByHosname = (hosname: string) => {
    return useFetchGet(`/api/hosp/hospital/findByHosname/${hosname}`)
  }

  // 根据医院编号，查询医院预约挂号详情信息
  const findHospDetail = (hoscode: string) => {
    return useFetchGet(`/api/hosp/hospital/findHospDetail/${hoscode}`)
  }

  const findHospDetailDollar = (hoscode: string) => {
    return fetchGet(`/api/hosp/hospital/findHospDetail/${hoscode}`)
  }

  // 根据医院编号，查询医院所有科室列表
  const findDepartment = (hoscode: string) => {
    return useFetchGet(`/api/hosp/hospital/department/${hoscode}`)
  }

  // 获取可预约排班分页数据
  const getBookingScheduleRule = (
    page: number,
    limit: number,
    hoscode: string,
    depcode: string
  ) => {
    return useFetchGet(
      `/api/hosp/hospital/getBookingScheduleRule/${page}/${limit}/${hoscode}/${depcode}`
    )
  }

  // 获取排班数据
  const findScheduleList = (
    hoscode: string,
    depcode: string,
    workDate: string
  ) => {
    return useFetchGet(
      `/api/hosp/hospital/findScheduleList/${hoscode}/${depcode}/${workDate}`
    )
  }

  // 根据id获取排班信息
  const getSchedule = (id: string) => {
    return useFetchGet(`/api/hosp/hospital/getSchedule/${id}`)
  }

  return {
    getHospPageList,
    getHospPageListDollar,
    getByHosname,
    findHospDetail,
    findHospDetailDollar,
    findDepartment,
    getBookingScheduleRule,
    findScheduleList,
    getSchedule,
  }
}

// 字典接口
export const useDictionaryApi = () => {
  // 根据dictCode获取下级节点
  const findByDictCode = (dictCode: string) => {
    return useFetchGet(`/api/cmn/dict/findByDictCode/${dictCode}`)
  }

  // 根据数据id查询子数据列表
  const findByParentId = (parentId: string) => {
    return useFetchGet(`/api/cmn/dict/findChildData/${parentId}`)
  }

  const findByParentIdDollar = (parentId: string) => {
    return fetchGet(`/api/cmn/dict/findChildData/${parentId}`)
  }

  const findByDictCodeDollar = (dictCode: string) => {
    return fetchGet(`/api/cmn/dict/findByDictCode/${dictCode}`)
  }

  return {
    findByDictCode,
    findByParentId,
    findByDictCodeDollar,
    findByParentIdDollar,
  }
}

// 订单接口
export const useOrderApi = () => {
  // 生成订单
  const submitOrder = (scheduleId: string, patientId: number) => {
    return useFetchPost(
      `/api/order/orderInfo/auth/submitOrder/${scheduleId}/${patientId}`,
      {}
    )
  }

  // 订单详情
  const getOrderDetail = (orderId: string) => {
    return useFetchGet(`/api/order/orderInfo/auth/getOrders/${orderId}`)
  }

  const getOrderDetailDollar = (orderId: string) => {
    return fetchGet(`/api/order/orderInfo/auth/getOrders/${orderId}`)
  }

  // 订单列表（条件查询带分页）
  const getOrderPageList = (
    page: number,
    limit: number,
    searchObj: OrderQueryParams
  ) => {
    return useFetchGet(`/api/order/orderInfo/${page}/${limit}`, searchObj)
  }

  const getOrderPageListDollar = (
    page: number,
    limit: number,
    searchObj: OrderQueryParams
  ) => {
    return fetchGet(`/api/order/orderInfo/${page}/${limit}`, searchObj)
  }

  // 获取订单状态
  const getStatusList = () => {
    return useFetchGet(`/api/order/orderInfo/getStatusList`)
  }

  const getStatusListDollar = () => {
    return fetchGet(`/api/order/orderInfo/getStatusList`)
  }

  // 取消预约
  const cancelOrder = (orderId: string) => {
    return useFetchGet(`/api/order/orderInfo/auth/cancelOrder/${orderId}`)
  }

  const cancelOrderDollar = (orderId: string) => {
    return fetchGet(`/api/order/orderInfo/auth/cancelOrder/${orderId}`)
  }

  return {
    submitOrder,
    getOrderDetail,
    getOrderDetailDollar,
    getOrderPageList,
    getOrderPageListDollar,
    getStatusList,
    getStatusListDollar,
    cancelOrder,
    cancelOrderDollar,
  }
}

export const useAlipayApi = () => {
  const toPay = (orderId: string) => {
    return fetchGet(
      `/api/order/pay`,
      { id: orderId },
      {
        headers: {
          Accept: 'text/html',
        },
      }
    )
  }

  return {
    toPay,
  }
}

// 就诊人接口
export const usePatientApi = () => {
  // 就诊人列表
  const findList = () => {
    return useFetchGet(`/api/user/patient/auth/findAll`)
  }

  const findListDollar = () => {
    return fetchGet(`/api/user/patient/auth/findAll`)
  }

  // 根据id查询就诊人信息
  const getById = (id: string) => {
    return useFetchGet(`/api/user/patient/auth/get/${id}`)
  }

  const getByIdDollar = (id: string) => {
    return fetchGet(`/api/user/patient/auth/get/${id}`)
  }

  // 添加就诊人信息
  const savePatient = (patient: PatientData) => {
    return useFetchPost(`/api/user/patient/auth/save`, patient)
  }

  // 修改就诊人信息
  const updatePatient = (patient: PatientData) => {
    return useFetchPost(`/api/user/patient/auth/update`, patient)
  }

  // 删除就诊人信息
  const removePatient = (id: string) => {
    return useFetchDelete(`/api/user/patient/auth/remove/${id}`)
  }

  return {
    findList,
    findListDollar,
    getById,
    getByIdDollar,
    savePatient,
    updatePatient,
    removePatient,
  }
}

// 用户信息接口
export const useUserApi = () => {
  // 用户认证接口
  const saveUserAuth = (userAuth: UserAuthData) => {
    return useFetchPost(`/api/user/auth/userAuth`, userAuth)
  }

  // 获取用户信息接口
  const getUserInfo = () => {
    return useFetchGet(`/api/user/auth/getUserInfo`)
  }

  const getUserInfoDollar = () => {
    return fetchGet(`/api/user/auth/getUserInfo`)
  }

  return {
    saveUserAuth,
    getUserInfo,
    getUserInfoDollar,
  }
}

// 导出所有API的组合函数，方便使用
export const useApi = () => {
  return {
    hospital: useHospitalApi(),
    dictionary: useDictionaryApi(),
    order: useOrderApi(),
    alipay: useAlipayApi(),
    patient: usePatientApi(),
    user: useUserApi(),
    loginBySms,
    loginByPassword,
    sendCaptcha,
  }
}
