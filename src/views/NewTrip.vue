<template>
  <div class="new-trip-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>创建新旅行</h2>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </el-header>

      <el-main>
        <el-card>
          <template #header>
            <div class="card-header">
              <h3>智能行程规划</h3>
              <p>告诉我们您的旅行需求，AI 将为您生成个性化行程</p>
            </div>
          </template>

          <el-tabs v-model="activeTab">
            <el-tab-pane label="语音输入" name="voice">
              <div class="voice-tab">
                <el-alert
                  title="使用提示"
                  type="info"
                  :closable="false"
                  style="margin-bottom: 20px"
                >
                  <p>您可以说："我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"</p>
                  <p>系统会自动识别您的需求并填入表单</p>
                </el-alert>

                <div class="voice-input-area">
                  <voice-input @result="handleVoiceResult" />
                </div>

                <el-divider>或手动填写</el-divider>
              </div>
            </el-tab-pane>

            <el-tab-pane label="文字输入" name="text">
              <el-input
                v-model="textInput"
                type="textarea"
                :rows="4"
                placeholder="例如：我想去日本，5天，预算1万元，喜欢美食和动漫，带孩子"
                style="margin-bottom: 20px"
              />
              <el-button type="primary" @click="parseTextInput">
                解析需求
              </el-button>
              <el-divider>或手动填写</el-divider>
            </el-tab-pane>
          </el-tabs>

          <el-form :model="form" :rules="rules" ref="formRef" label-width="120px">
            <el-form-item label="目的地" prop="destination">
              <el-input v-model="form.destination" placeholder="例如：日本东京" />
            </el-form-item>

            <el-form-item label="旅行日期" prop="dates">
              <el-date-picker
                v-model="form.dates"
                type="daterange"
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>

            <el-form-item label="预算（元）">
              <el-input-number v-model="form.budget" :min="0" :step="100" style="width: 100%" />
            </el-form-item>

            <el-form-item label="同行人数" prop="traveler_count">
              <el-input-number v-model="form.traveler_count" :min="1" :max="20" style="width: 100%" />
            </el-form-item>

            <el-form-item label="旅行偏好">
              <el-checkbox-group v-model="form.interests">
                <el-checkbox label="美食">美食</el-checkbox>
                <el-checkbox label="自然风光">自然风光</el-checkbox>
                <el-checkbox label="历史文化">历史文化</el-checkbox>
                <el-checkbox label="购物">购物</el-checkbox>
                <el-checkbox label="冒险">冒险</el-checkbox>
                <el-checkbox label="亲子">亲子</el-checkbox>
                <el-checkbox label="摄影">摄影</el-checkbox>
                <el-checkbox label="艺术">艺术</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="旅行风格">
              <el-radio-group v-model="form.travel_style">
                <el-radio label="休闲">休闲</el-radio>
                <el-radio label="深度游">深度游</el-radio>
                <el-radio label="快节奏">快节奏</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="住宿偏好">
              <el-select v-model="form.accommodation_type" placeholder="请选择" style="width: 100%">
                <el-option label="经济型" value="budget" />
                <el-option label="舒适型" value="comfort" />
                <el-option label="豪华型" value="luxury" />
              </el-select>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" size="large" :loading="loading" @click="handleGenerate">
                AI 生成行程
              </el-button>
              <el-button size="large" @click="handleReset">
                重置
              </el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { useTripStore } from '@/stores/trip'
import VoiceInput from '@/components/VoiceInput.vue'

const router = useRouter()
const tripStore = useTripStore()

const activeTab = ref('voice')
const textInput = ref('')
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  destination: '',
  dates: [] as string[],
  budget: undefined as number | undefined,
  traveler_count: 1,
  interests: [] as string[],
  travel_style: '休闲',
  accommodation_type: 'comfort',
})

const rules: FormRules = {
  destination: [{ required: true, message: '请输入目的地', trigger: 'blur' }],
  dates: [{ required: true, message: '请选择旅行日期', trigger: 'change' }],
  traveler_count: [{ required: true, message: '请输入同行人数', trigger: 'blur' }],
}

// 处理语音识别结果
const handleVoiceResult = (text: string) => {
  textInput.value = text
  parseTextInput()
}

// 解析文本输入（简单的关键词提取）
const parseTextInput = () => {
  const text = textInput.value

  // 提取目的地（简单正则）
  const destMatch = text.match(/去(.{2,10}?)(?:[，,。]|$)/)
  if (destMatch) {
    form.destination = destMatch[1].trim()
  }

  // 提取天数
  const daysMatch = text.match(/(\d+)天/)
  if (daysMatch) {
    const days = parseInt(daysMatch[1])
    const today = new Date()
    const endDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000)
    form.dates = [
      today.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0],
    ]
  }

  // 提取预算
  const budgetMatch = text.match(/(?:预算|花费)?(\d+)(?:万|元)/)
  if (budgetMatch) {
    let budget = parseInt(budgetMatch[1])
    if (text.includes('万')) {
      budget *= 10000
    }
    form.budget = budget
  }

  // 提取人数
  const peopleMatch = text.match(/(\d+)人/)
  if (peopleMatch) {
    form.traveler_count = parseInt(peopleMatch[1])
  }

  // 提取兴趣
  const interestKeywords = ['美食', '自然', '历史', '购物', '冒险', '亲子', '摄影', '艺术', '动漫']
  form.interests = interestKeywords.filter((keyword) => text.includes(keyword))

  // 特殊处理
  if (text.includes('孩子') || text.includes('小孩')) {
    if (!form.interests.includes('亲子')) {
      form.interests.push('亲子')
    }
  }

  ElMessage.success('已自动填充表单，请检查并调整')
}

// 生成行程
const handleGenerate = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (!valid) return

    loading.value = true
    try {
      const trip = await tripStore.aiGenerateTrip({
        destination: form.destination,
        start_date: form.dates[0],
        end_date: form.dates[1],
        budget: form.budget,
        traveler_count: form.traveler_count,
        preferences: {
          interests: form.interests,
          travel_style: form.travel_style,
          accommodation_type: form.accommodation_type,
        },
      })

      ElMessage.success('行程生成成功！')
      router.push(`/trips/${trip.id}`)
    } catch (error: any) {
      ElMessage.error(error.response?.data?.detail || '生成行程失败')
    } finally {
      loading.value = false
    }
  })
}

// 重置表单
const handleReset = () => {
  formRef.value?.resetFields()
  textInput.value = ''
}
</script>

<style scoped>
.new-trip-container {
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

.el-main {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.card-header {
  text-align: center;
}

.card-header h3 {
  margin: 0 0 10px 0;
  color: #303133;
}

.card-header p {
  margin: 0;
  color: #909399;
  font-size: 14px;
}

.voice-tab {
  margin-bottom: 20px;
}

.voice-input-area {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
</style>
