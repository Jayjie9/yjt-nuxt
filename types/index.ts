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
    fullAddress: string
  }
}

export interface HospitalQueryParams {
  hosname?: string
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
