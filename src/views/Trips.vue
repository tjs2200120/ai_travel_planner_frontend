<template>
  <div class="trips-container">
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>我的旅行计划</h2>
          <div class="header-actions">
            <el-button type="primary" :icon="Plus" @click="router.push('/trips/new')">
              创建新旅行
            </el-button>
            <el-button @click="handleLogout">退出登录</el-button>
          </div>
        </div>
      </el-header>

      <el-main>
        <div v-if="tripStore.loading" class="loading">
          <el-icon class="is-loading">
            <Loading />
          </el-icon>
          <p>加载中...</p>
        </div>

        <el-empty v-else-if="tripStore.trips.length === 0" description="还没有旅行计划">
          <el-button type="primary" @click="router.push('/trips/new')">
            立即创建
          </el-button>
        </el-empty>

        <div v-else class="trips-grid">
          <el-card
            v-for="trip in tripStore.trips"
            :key="trip.id"
            class="trip-card"
            :body-style="{ padding: '0px' }"
            shadow="hover"
          >
            <div class="trip-cover">
              <el-tag :type="getStatusType(trip.status)" class="status-tag">
                {{ getStatusText(trip.status) }}
              </el-tag>
            </div>

            <div class="trip-content">
              <h3>{{ trip.title }}</h3>
              <div class="trip-info">
                <div class="info-item">
                  <el-icon><Location /></el-icon>
                  <span>{{ trip.destination }}</span>
                </div>
                <div class="info-item">
                  <el-icon><Calendar /></el-icon>
                  <span>{{ formatDate(trip.start_date) }} - {{ formatDate(trip.end_date) }}</span>
                </div>
                <div class="info-item" v-if="trip.budget">
                  <el-icon><Wallet /></el-icon>
                  <span>预算：¥{{ trip.budget }}</span>
                </div>
                <div class="info-item">
                  <el-icon><User /></el-icon>
                  <span>{{ trip.traveler_count }} 人</span>
                </div>
              </div>

              <div class="trip-actions">
                <el-button type="primary" size="small" @click="viewTrip(trip.id)">
                  查看详情
                </el-button>
                <el-button size="small" @click="router.push('/expenses?trip_id=' + trip.id)">
                  费用管理
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="handleDelete(trip.id)"
                >
                  删除
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import {
  Plus,
  Location,
  Calendar,
  Wallet,
  User,
  Delete,
  Loading,
} from '@element-plus/icons-vue'
import { useTripStore } from '@/stores/trip'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const tripStore = useTripStore()
const userStore = useUserStore()

onMounted(() => {
  tripStore.fetchTrips()
})

const viewTrip = (id: number) => {
  router.push(`/trips/${id}`)
}

const handleDelete = (id: number) => {
  ElMessageBox.confirm('确定要删除这个旅行计划吗？', '确认删除', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  })
    .then(async () => {
      await tripStore.removeTrip(id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
}

const handleLogout = () => {
  userStore.logout()
  router.push('/login')
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('zh-CN')
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
</script>

<style scoped>
.trips-container {
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

.trips-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.trip-card {
  overflow: hidden;
}

.trip-cover {
  height: 150px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  position: relative;
}

.status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
}

.trip-content {
  padding: 20px;
}

.trip-content h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 18px;
}

.trip-info {
  margin-bottom: 15px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #606266;
  font-size: 14px;
  margin-bottom: 8px;
}

.info-item .el-icon {
  color: #909399;
}

.trip-actions {
  display: flex;
  gap: 10px;
}
</style>
