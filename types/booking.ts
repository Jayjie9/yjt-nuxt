// 排班信息接口
export interface Schedule {
  id: string
  createTime: string
  updateTime: string
  param: {
    dayOfWeek: string
    depname: string
    hosname: string
  }
  hoscode: string
  depcode: string
  hosScheduleId: string
  title: string
  docname: string
  skill: string
  workDate: string
  workTime: number
  reservedNumber: number
  availableNumber: number
  amount: number
  status: number
}

// 就诊人信息接口
export interface Patient {
  id: number
  createTime: string
  updateTime: string
  param: {
    certificatesTypeString: string
    contactsCertificatesTypeString: string | null
    cityString: string
    fullAddress: string
    districtString: string
    provinceString: string
  }
  userId: number
  name: string
  certificatesType: string
  certificatesNo: string
  sex: number
  birthdate: string
  phone: string
  isMarry: number
  provinceCode: string
  cityCode: string
  districtCode: string
  address: string
  contactsName: string
  contactsCertificatesType: string
  contactsCertificatesNo: string
  contactsPhone: string
  isInsure: number
  cardNo: string | null
  status: string
}

// API响应接口
export interface ApiResponse<T> {
  code: number
  message: string
  data: T
  ok: boolean
}