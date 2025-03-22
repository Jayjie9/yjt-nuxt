export interface Hospital {
  id: string
  hoscode: string
  hosname: string
  hostype: string
  logoData: string
  route: string
  intro: string
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
  districtCode?: string
} 