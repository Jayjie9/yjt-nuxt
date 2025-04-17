// 医院信息接口
export interface Hospital {
  id: string
  hoscode: string
  hosname: string
  hostype: string
  provinceCode: string
  cityCode: string
  districtCode: string
  address: string
  logoData: string
  intro: string
  route: string
  status: number
  param: {
    hostypeString: string
    fullAddress: string
  }
}

// 预约规则接口
export interface BookingRule {
  cycle: number
  releaseTime: string
  stopTime: string
  quitDay: number
  quitTime: string
  rule: string[]
}

// API响应接口
export interface HospitalDetailResponse {
  code: number
  message: string
  data: {
    hospital: Hospital
    bookingRule: BookingRule
  }
  ok: boolean
}