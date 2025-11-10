import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { User } from '@/api/auth'
import { login as loginApi, register as registerApi, getCurrentUser } from '@/api/auth'

export const useUserStore = defineStore('user', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))

  // 登录
  const login = async (username: string, password: string) => {
    const res = await loginApi({ username, password })
    token.value = res.access_token
    localStorage.setItem('access_token', res.access_token)

    // 获取用户信息
    await fetchUserInfo()
  }

  // 注册
  const register = async (email: string, username: string, password: string, fullName?: string) => {
    const userData = await registerApi({
      email,
      username,
      password,
      full_name: fullName,
    })
    user.value = userData
    // 注册后自动登录
    await login(username, password)
  }

  // 获取用户信息
  const fetchUserInfo = async () => {
    if (!token.value) return

    try {
      const userData = await getCurrentUser()
      user.value = userData
    } catch (error) {
      // token 无效，清除
      logout()
    }
  }

  // 登出
  const logout = () => {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
  }

  // 检查是否已登录
  const isLoggedIn = () => {
    return !!token.value
  }

  return {
    user,
    token,
    login,
    register,
    logout,
    fetchUserInfo,
    isLoggedIn,
  }
})
