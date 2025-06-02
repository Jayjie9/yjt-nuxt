// 排班日期项
export interface BookingSchedule {
  workDate: string
  workDateMd: string
  dayOfWeek: string
  docCount: number
  reservedNumber: number | null
  availableNumber: number
  status: number
  curClass?: string // 用于样式控制
}

// 基础信息
export interface BaseMap {
  workDateString: string
  releaseTime: string
  bigname: string
  stopTime: string
  depname: string
  hosname: string
}

// API响应
export interface BookingScheduleResponse {
  code: number
  message: string
  data: {
    total: number
    bookingScheduleList: BookingSchedule[]
    baseMap: BaseMap
  }
  ok: boolean
}

export interface DoctorSchedule {
  id: string
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
  param: {
    dayOfWeek: string
    depname: string
    hosname: string
  }
}
