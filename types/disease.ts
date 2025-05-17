export interface DiseaseBigDepartment {
  id: string
  name: string
  value: string
}

export interface DiseaseSubDepartment {
  id: string
  name: string
  value?: string
  parentId?: string
}

// 疾病详情
export interface DiseaseDepartment {
  depcode: string
  depname: string
}

export interface DiseaseCategory {
  bigcode: string
  bigname: string
}

export interface DiseaseSection {
  title: string
  html: string
  text: string
}

export interface DiseaseDetail {
  id: string
  name: string
  department: DiseaseDepartment
  category: DiseaseCategory
  sections: DiseaseSection[]
  createdAt?: string | Date
  updatedAt?: string | Date
}

/**
 * 疾病列表项类型
 */
export interface DiseaseListItem {
  _id: string
  name: string
  value: string
  category: string
  department: string
  tags: string[]
  description: string
}

// 搜索相关类型
export interface DiseaseSearchResult {
  id: number | string
  name: string
  category: string
  description: string
}

// 分页相关类型
export interface DiseasePagination {
  total: number
  page: number
  limit: number
  pages: number
}

// 健康资讯相关类型
export interface HealthArticle {
  id: string
  title: string
  summary: string
  content: string
  author: string
  publishDate: string | Date
  tags: string[]
  imageUrl?: string
}

// AI问诊相关类型
export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp?: string | Date
}

// 病情分析相关类型
export interface AnalysisResult {
  id: number | string
  date: string | Date
  symptoms: string
  possibleDiseases: {
    name: string
    probability: number
    description: string
    department?: string
  }[]
  recommendations: string[]
  riskLevel: string
}
