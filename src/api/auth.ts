import request from '@/utils/request'

export interface UserRegister {
  email: string
  username: string
  password: string
  full_name?: string
}

export interface UserLogin {
  username: string
  password: string
}

export interface User {
  id: number
  email: string
  username: string
  full_name?: string
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  token_type: string
}

// 用户注册
export const register = (data: UserRegister) => {
  return request.post<any, User>('/auth/register', data)
}

// 用户登录
export const login = (data: UserLogin) => {
  return request.post<any, TokenResponse>('/auth/login', data)
}

// 获取当前用户信息
export const getCurrentUser = () => {
  return request.get<any, User>('/auth/me')
}
