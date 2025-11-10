<template>
  <div class="expenses-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>费用管理</h2>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="showAddDialog = true">
              添加费用
            </el-button>
            <el-button @click="router.push('/trips')">返回行程列表</el-button>
          </div>
        </div>
      </el-header>

      <el-main>
        <!-- 预算分析 -->
        <el-card v-if="budgetAnalysis" class="analysis-card">
          <template #header>
            <h3>预算分析</h3>
          </template>

          <div class="analysis-grid">
            <div class="analysis-item">
              <div class="label">总预算</div>
              <div class="value">¥{{ budgetAnalysis.total_budget }}</div>
            </div>
            <div class="analysis-item">
              <div class="label">已支出</div>
              <div class="value expense">¥{{ budgetAnalysis.total_spent }}</div>
            </div>
            <div class="analysis-item">
              <div class="label">剩余</div>
              <div class="value" :class="budgetAnalysis.remaining < 0 ? 'danger' : 'success'">
                ¥{{ budgetAnalysis.remaining }}
              </div>
            </div>
            <div class="analysis-item">
              <div class="label">使用率</div>
              <div class="value">{{ budgetAnalysis.spending_percentage }}%</div>
            </div>
          </div>

          <el-progress
            :percentage="Math.min(budgetAnalysis.spending_percentage, 100)"
            :status="getProgressStatus(budgetAnalysis.status)"
            :stroke-width="20"
            style="margin-top: 20px"
          />

          <el-divider />

          <h4>分类支出</h4>
          <div class="category-grid">
            <div
              v-for="(amount, category) in budgetAnalysis.category_breakdown"
              :key="category"
              class="category-item"
            >
              <div class="category-label">{{ getCategoryName(category) }}</div>
              <div class="category-amount">¥{{ amount }}</div>
            </div>
          </div>
        </el-card>

        <!-- 费用列表 -->
        <el-card class="expenses-list-card">
          <template #header>
            <div class="card-header">
              <h3>费用记录</h3>
              <voice-input @result="handleVoiceExpense" />
            </div>
          </template>

          <el-table :data="expenses" stripe style="width: 100%">
            <el-table-column prop="expense_date" label="日期" width="120">
              <template #default="{ row }">
                {{ formatDate(row.expense_date) }}
              </template>
            </el-table-column>
            <el-table-column prop="category" label="分类" width="100">
              <template #default="{ row }">
                <el-tag :type="getCategoryType(row.category)" size="small">
                  {{ getCategoryName(row.category) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="description" label="描述" />
            <el-table-column prop="amount" label="金额" width="120">
              <template #default="{ row }">
                <span class="amount">¥{{ row.amount }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="payment_method" label="支付方式" width="100" />
            <el-table-column label="操作" width="150">
              <template #default="{ row }">
                <el-button size="small" @click="handleEdit(row)">编辑</el-button>
                <el-button type="danger" size="small" @click="handleDelete(row.id)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-main>
    </el-container>

    <!-- 添加/编辑费用对话框 -->
    <el-dialog
      v-model="showAddDialog"
      :title="editingExpense ? '编辑费用' : '添加费用'"
      width="500px"
    >
      <el-form :model="expenseForm" :rules="rules" ref="formRef" label-width="100px">
        <el-form-item label="分类" prop="category">
          <el-select v-model="expenseForm.category" placeholder="请选择" style="width: 100%">
            <el-option label="交通" value="transport" />
            <el-option label="住宿" value="accommodation" />
            <el-option label="餐饮" value="food" />
            <el-option label="景点" value="attraction" />
            <el-option label="购物" value="shopping" />
            <el-option label="其他" value="other" />
          </el-select>
        </el-form-item>

        <el-form-item label="金额" prop="amount">
          <el-input-number v-model="expenseForm.amount" :min="0" :step="0.01" style="width: 100%" />
        </el-form-item>

        <el-form-item label="描述">
          <el-input v-model="expenseForm.description" type="textarea" :rows="2" />
        </el-form-item>

        <el-form-item label="日期" prop="expense_date">
          <el-date-picker
            v-model="expenseForm.expense_date"
            type="datetime"
            placeholder="选择日期时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DDTHH:mm:ss"
            style="width: 100%"
          />
        </el-form-item>

        <el-form-item label="支付方式">
          <el-select v-model="expenseForm.payment_method" placeholder="请选择" style="width: 100%">
            <el-option label="现金" value="cash" />
            <el-option label="信用卡" value="credit_card" />
            <el-option label="借记卡" value="debit_card" />
            <el-option label="移动支付" value="mobile_payment" />
          </el-select>
        </el-form-item>

        <el-form-item label="备注">
          <el-input v-model="expenseForm.notes" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" :loading="loading" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  analyzeBudget,
  type Expense,
  type BudgetAnalysis,
} from '@/api/expenses'
import VoiceInput from '@/components/VoiceInput.vue'

const router = useRouter()
const route = useRoute()

const tripId = ref(route.query.trip_id ? Number(route.query.trip_id) : undefined)
const expenses = ref<Expense[]>([])
const budgetAnalysis = ref<BudgetAnalysis | null>(null)
const showAddDialog = ref(false)
const editingExpense = ref<Expense | null>(null)
const loading = ref(false)
const formRef = ref<FormInstance>()

const expenseForm = reactive({
  category: '',
  amount: 0,
  description: '',
  expense_date: new Date().toISOString(),
  payment_method: '',
  notes: '',
})

const rules: FormRules = {
  category: [{ required: true, message: '请选择分类', trigger: 'change' }],
  amount: [{ required: true, message: '请输入金额', trigger: 'blur' }],
  expense_date: [{ required: true, message: '请选择日期', trigger: 'change' }],
}

onMounted(() => {
  fetchExpenses()
  if (tripId.value) {
    fetchBudgetAnalysis()
  }
})

const fetchExpenses = async () => {
  try {
    expenses.value = await getExpenses({ trip_id: tripId.value })
  } catch (error: any) {
    ElMessage.error('获取费用列表失败')
  }
}

const fetchBudgetAnalysis = async () => {
  if (!tripId.value) return

  try {
    budgetAnalysis.value = await analyzeBudget(tripId.value)
  } catch (error: any) {
    // 预算分析失败不影响主要功能
    console.error('获取预算分析失败', error)
  }
}

const handleVoiceExpense = (text: string) => {
  // 简单解析语音输入
  // 例如："花了80块吃饭" 或 "交通费50元"
  const amountMatch = text.match(/(\d+)(?:块|元)/)
  if (amountMatch) {
    expenseForm.amount = Number(amountMatch[1])
  }

  // 识别分类
  const categoryMap: Record<string, string> = {
    交通: 'transport',
    住宿: 'accommodation',
    吃饭: 'food',
    餐饮: 'food',
    景点: 'attraction',
    门票: 'attraction',
    购物: 'shopping',
  }

  for (const [key, value] of Object.entries(categoryMap)) {
    if (text.includes(key)) {
      expenseForm.category = value
      break
    }
  }

  expenseForm.description = text
  showAddDialog.value = true
  ElMessage.success('已根据语音填充表单，请确认')
}

const handleEdit = (expense: Expense) => {
  editingExpense.value = expense
  Object.assign(expenseForm, {
    category: expense.category,
    amount: expense.amount,
    description: expense.description,
    expense_date: expense.expense_date,
    payment_method: expense.payment_method,
    notes: expense.notes,
  })
  showAddDialog.value = true
}

const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const data = {
        ...expenseForm,
        trip_id: tripId.value,
      }

      if (editingExpense.value) {
        await updateExpense(editingExpense.value.id, data)
        ElMessage.success('更新成功')
      } else {
        await createExpense(data)
        ElMessage.success('添加成功')
      }

      showAddDialog.value = false
      editingExpense.value = null
      resetForm()
      fetchExpenses()
      if (tripId.value) {
        fetchBudgetAnalysis()
      }
    } catch (error: any) {
      ElMessage.error(error.response?.data?.detail || '操作失败')
    } finally {
      loading.value = false
    }
  })
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这条费用记录吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await deleteExpense(id)
      ElMessage.success('删除成功')
      fetchExpenses()
      if (tripId.value) {
        fetchBudgetAnalysis()
      }
    })
    .catch(() => {})
}

const resetForm = () => {
  Object.assign(expenseForm, {
    category: '',
    amount: 0,
    description: '',
    expense_date: new Date().toISOString(),
    payment_method: '',
    notes: '',
  })
  formRef.value?.resetFields()
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
}

const getCategoryName = (category: string) => {
  const nameMap: Record<string, string> = {
    transport: '交通',
    accommodation: '住宿',
    food: '餐饮',
    attraction: '景点',
    shopping: '购物',
    other: '其他',
  }
  return nameMap[category] || category
}

const getCategoryType = (category: string) => {
  const typeMap: Record<string, any> = {
    transport: 'primary',
    accommodation: 'warning',
    food: 'success',
    attraction: 'danger',
    shopping: 'info',
    other: '',
  }
  return typeMap[category] || ''
}

const getProgressStatus = (status: string) => {
  const statusMap: Record<string, any> = {
    on_track: 'success',
    warning: 'warning',
    over_budget: 'exception',
  }
  return statusMap[status] || ''
}
</script>

<style scoped>
.expenses-container {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.el-header {
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
}

.header-content h2 {
  margin: 0;
  color: #303133;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.analysis-card,
.expenses-list-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  margin: 0;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.analysis-item {
  text-align: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.analysis-item .label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.analysis-item .value {
  font-size: 24px;
  color: #303133;
  font-weight: 500;
}

.analysis-item .value.expense {
  color: #e6a23c;
}

.analysis-item .value.success {
  color: #67c23a;
}

.analysis-item .value.danger {
  color: #f56c6c;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 15px;
}

.category-item {
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
  text-align: center;
}

.category-label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 5px;
}

.category-amount {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.amount {
  color: #e6a23c;
  font-weight: 500;
}
</style>
