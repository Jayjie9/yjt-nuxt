// 导出疾病相关类型
export * from './disease'

export interface Hospital {
  id: string
  hoscode: string
  hosname: string
  hostype: string
  logoData: string
  route: string
  intro: string
  status: number
  bookingRule: {
    cycle: number
    releaseTime: string
    stopTime: string
    quitDay: number
    quitTime: string
    rule: Array<{
      title: string
      content: string
    }>
  }
  param: {
    hostypeString: string
    hosLevelString: string
    fullAddress: string
  }
}

export interface HospitalQueryParams {
  hosname?: string
  nature?: string
  level?: string
  hostype?: string
  provinceCode?: string
  cityCode?: string
  districtCode?: string
  status?: number
}

export interface BookingRule {
  cycle: number
  releaseTime: string
  stopTime: string
  quitDay: number
  quitTime: string
  rule: Array<{
    content: string
  }>
}

export interface LinkItem {
  hosname: string
  hoscode: string
}
