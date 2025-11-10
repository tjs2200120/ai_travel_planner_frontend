<template>
  <div class="trip-detail-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>行程详情</h2>
          <el-button @click="router.back()">返回</el-button>
        </div>
      </el-header>

      <el-main v-if="trip">
        <!-- 行程概览 -->
        <el-card class="overview-card">
          <template #header>
            <div class="card-header">
              <h3>{{ trip.title }}</h3>
              <el-tag :type="getStatusType(trip.status)">
                {{ getStatusText(trip.status) }}
              </el-tag>
            </div>
          </template>

          <div class="overview-grid">
            <div class="overview-item">
              <el-icon><Location /></el-icon>
              <div>
                <div class="label">目的地</div>
                <div class="value">{{ trip.destination }}</div>
              </div>
            </div>
            <div class="overview-item">
              <el-icon><Calendar /></el-icon>
              <div>
                <div class="label">日期</div>
                <div class="value">
                  {{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}
                </div>
              </div>
            </div>
            <div class="overview-item">
              <el-icon><User /></el-icon>
              <div>
                <div class="label">人数</div>
                <div class="value">{{ trip.traveler_count }} 人</div>
              </div>
            </div>
            <div class="overview-item" v-if="trip.budget">
              <el-icon><Wallet /></el-icon>
              <div>
                <div class="label">预算</div>
                <div class="value">¥{{ trip.budget }}</div>
              </div>
            </div>
          </div>

          <el-divider />

          <div v-if="trip.description" class="description">
            <h4>行程简介</h4>
            <p>{{ trip.description }}</p>
          </div>

          <div v-if="trip.ai_generated?.tips" class="tips">
            <h4>实用建议</h4>
            <ul>
              <li v-for="(tip, index) in trip.ai_generated.tips" :key="index">{{ tip }}</li>
            </ul>
          </div>
        </el-card>

        <!-- 每日行程 -->
        <el-card v-if="trip.days && trip.days.length > 0" class="days-card">
          <template #header>
            <h3>详细行程</h3>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="day in trip.days"
              :key="day.id"
              :timestamp="formatDate(day.date)"
              placement="top"
            >
              <el-card>
                <h4>{{ day.title }}</h4>
                <p v-if="day.description" class="day-description">{{ day.description }}</p>

                <div v-if="day.activities && day.activities.length > 0" class="activities">
                  <div
                    v-for="activity in day.activities"
                    :key="activity.id"
                    class="activity-item"
                  >
                    <div class="activity-time">
                      {{ activity.start_time ? formatTime(activity.start_time) : '' }}
                    </div>
                    <div class="activity-content">
                      <div class="activity-header">
                        <el-tag :type="getActivityType(activity.activity_type)" size="small">
                          {{ getActivityName(activity.activity_type) }}
                        </el-tag>
                        <h5>{{ activity.name }}</h5>
                      </div>
                      <div class="activity-info">
                        <span v-if="activity.location">
                          <el-icon><MapLocation /></el-icon>
                          {{ activity.location }}
                        </span>
                        <span v-if="activity.duration">
                          <el-icon><Clock /></el-icon>
                          {{ activity.duration }} 分钟
                        </span>
                        <span v-if="activity.cost">
                          <el-icon><Money /></el-icon>
                          ¥{{ activity.cost }}
                        </span>
                      </div>
                      <p v-if="activity.description" class="activity-description">
                        {{ activity.description }}
                      </p>
                    </div>
                  </div>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </el-card>

        <!-- 预算分解 -->
        <el-card v-if="trip.ai_generated?.budget_breakdown" class="budget-card">
          <template #header>
            <h3>预算分解</h3>
          </template>

          <div class="budget-grid">
            <div
              v-for="(value, key) in trip.ai_generated.budget_breakdown"
              :key="key"
              class="budget-item"
            >
              <div class="budget-label">{{ getCategoryName(key) }}</div>
              <div class="budget-value">¥{{ value }}</div>
            </div>
          </div>
        </el-card>
      </el-main>

      <div v-else-if="tripStore.loading" class="loading">
        <el-icon class="is-loading">
          <Loading />
        </el-icon>
        <p>加载中...</p>
      </div>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  Location,
  Calendar,
  User,
  Wallet,
  MapLocation,
  Clock,
  Money,
  Loading,
} from '@element-plus/icons-vue'
import { useTripStore } from '@/stores/trip'

const route = useRoute()
const router = useRouter()
const tripStore = useTripStore()

const tripId = ref(Number(route.params.id))
const trip = computed(() => tripStore.currentTrip)

onMounted(async () => {
  await tripStore.fetchTrip(tripId.value)
})

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const formatTime = (dateStr: string) => {
  return new Date(dateStr).toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getStatusType = (status: string) => {
  const typeMap: Record<string, any> = {
    planning: 'info',
    ongoing: 'warning',
    completed: 'success',
    cancelled: 'danger',
  }
  return typeMap[status] || 'info'
}

const getStatusText = (status: string) => {
  const textMap: Record<string, string> = {
    planning: '计划中',
    ongoing: '进行中',
    completed: '已完成',
    cancelled: '已取消',
  }
  return textMap[status] || '未知'
}

const getActivityType = (type: string) => {
  const typeMap: Record<string, any> = {
    attraction: 'primary',
    restaurant: 'success',
    hotel: 'warning',
    transport: 'info',
    other: '',
  }
  return typeMap[type] || ''
}

const getActivityName = (type: string) => {
  const nameMap: Record<string, string> = {
    attraction: '景点',
    restaurant: '餐厅',
    hotel: '住宿',
    transport: '交通',
    other: '其他',
  }
  return nameMap[type] || type
}

const getCategoryName = (key: string) => {
  const nameMap: Record<string, string> = {
    accommodation: '住宿',
    food: '餐饮',
    transport: '交通',
    attraction: '景点门票',
    shopping: '购物',
    other: '其他',
  }
  return nameMap[key] || key
}
</script>

<style scoped>
.trip-detail-container {
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

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #909399;
}

.loading .el-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.overview-card,
.days-card,
.budget-card {
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

.overview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
}

.overview-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.overview-item .el-icon {
  font-size: 24px;
  color: #409eff;
  margin-top: 4px;
}

.overview-item .label {
  font-size: 12px;
  color: #909399;
  margin-bottom: 4px;
}

.overview-item .value {
  font-size: 16px;
  color: #303133;
  font-weight: 500;
}

.description h4,
.tips h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.description p {
  color: #606266;
  line-height: 1.6;
}

.tips ul {
  margin: 0;
  padding-left: 20px;
}

.tips li {
  color: #606266;
  line-height: 1.8;
}

.day-description {
  color: #909399;
  font-size: 14px;
  margin: 10px 0;
}

.activities {
  margin-top: 15px;
}

.activity-item {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #ebeef5;
}

.activity-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.activity-time {
  color: #909399;
  font-size: 14px;
  min-width: 60px;
}

.activity-content {
  flex: 1;
}

.activity-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 8px;
}

.activity-header h5 {
  margin: 0;
  color: #303133;
}

.activity-info {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.activity-info span {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: #606266;
}

.activity-info .el-icon {
  color: #909399;
}

.activity-description {
  color: #909399;
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
}

.budget-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 20px;
}

.budget-item {
  text-align: center;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.budget-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.budget-value {
  font-size: 20px;
  color: #303133;
  font-weight: 500;
}
</style>
