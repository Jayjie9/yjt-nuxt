// 科室子项
export interface DepartmentChild {
  depcode: string
  depname: string
  children: null
}

// 科室大类
export interface Department {
  depcode: string
  depname: string
  children: DepartmentChild[]
}

// API响应
export interface DepartmentResponse {
  code: number
  message: string
  data: Department[]
  ok: boolean
}