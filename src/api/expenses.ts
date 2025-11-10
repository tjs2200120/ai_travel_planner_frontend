import request from '@/utils/request'

export interface ExpenseCreate {
  trip_id?: number
  category: string
  amount: number
  currency?: string
  description?: string
  expense_date: string
  payment_method?: string
  notes?: string
}

export interface Expense {
  id: number
  user_id: number
  trip_id?: number
  category: string
  amount: number
  currency: string
  description?: string
  expense_date: string
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface BudgetAnalysis {
  total_budget: number
  total_spent: number
  remaining: number
  spending_percentage: number
  category_breakdown: Record<string, number>
  status: string
}

// 创建费用记录
export const createExpense = (data: ExpenseCreate) => {
  return request.post<any, Expense>('/expenses/', data)
}

// 获取费用列表
export const getExpenses = (params?: { trip_id?: number; skip?: number; limit?: number }) => {
  return request.get<any, Expense[]>('/expenses/', { params })
}

// 获取单个费用记录
export const getExpense = (id: number) => {
  return request.get<any, Expense>(`/expenses/${id}`)
}

// 更新费用记录
export const updateExpense = (id: number, data: Partial<ExpenseCreate>) => {
  return request.put<any, Expense>(`/expenses/${id}`, data)
}

// 删除费用记录
export const deleteExpense = (id: number) => {
  return request.delete(`/expenses/${id}`)
}

// 分析预算
export const analyzeBudget = (tripId: number) => {
  return request.get<any, BudgetAnalysis>(`/expenses/analysis/${tripId}`)
}
