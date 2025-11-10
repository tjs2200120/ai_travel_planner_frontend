import request from '@/utils/request'

export interface TripGenerateRequest {
  destination: string
  start_date: string
  end_date: string
  budget?: number
  traveler_count: number
  preferences?: Record<string, any>
}

export interface TripCreate {
  title: string
  destination: string
  start_date: string
  end_date: string
  budget?: number
  traveler_count: number
  preferences?: Record<string, any>
  description?: string
}

export interface Trip {
  id: number
  user_id: number
  title: string
  destination: string
  start_date: string
  end_date: string
  budget?: number
  traveler_count: number
  preferences?: Record<string, any>
  description?: string
  status: string
  ai_generated?: Record<string, any>
  created_at: string
  updated_at: string
  days?: TripDay[]
}

export interface TripDay {
  id: number
  day_number: number
  date: string
  title?: string
  description?: string
  activities?: TripActivity[]
}

export interface TripActivity {
  id: number
  activity_type: string
  name: string
  location?: string
  start_time?: string
  end_time?: string
  duration?: number
  cost?: number
  description?: string
  notes?: string
  order_index: number
}

// AI 生成行程
export const generateTrip = (data: TripGenerateRequest) => {
  return request.post<any, Trip>('/trips/generate', data)
}

// 创建行程
export const createTrip = (data: TripCreate) => {
  return request.post<any, Trip>('/trips/', data)
}

// 获取行程列表
export const getTrips = (params?: { skip?: number; limit?: number }) => {
  return request.get<any, Trip[]>('/trips/', { params })
}

// 获取单个行程
export const getTrip = (id: number) => {
  return request.get<any, Trip>(`/trips/${id}`)
}

// 更新行程
export const updateTrip = (id: number, data: Partial<TripCreate>) => {
  return request.put<any, Trip>(`/trips/${id}`, data)
}

// 删除行程
export const deleteTrip = (id: number) => {
  return request.delete(`/trips/${id}`)
}
