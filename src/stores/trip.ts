import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Trip } from '@/api/trips'
import { getTrips, getTrip, generateTrip, createTrip, updateTrip, deleteTrip } from '@/api/trips'

export const useTripStore = defineStore('trip', () => {
  const trips = ref<Trip[]>([])
  const currentTrip = ref<Trip | null>(null)
  const loading = ref(false)

  // 获取所有行程
  const fetchTrips = async () => {
    loading.value = true
    try {
      trips.value = await getTrips()
    } finally {
      loading.value = false
    }
  }

  // 获取单个行程
  const fetchTrip = async (id: number) => {
    loading.value = true
    try {
      currentTrip.value = await getTrip(id)
      return currentTrip.value
    } finally {
      loading.value = false
    }
  }

  // AI 生成行程
  const aiGenerateTrip = async (data: any) => {
    loading.value = true
    try {
      const trip = await generateTrip(data)
      trips.value.unshift(trip)
      currentTrip.value = trip
      return trip
    } finally {
      loading.value = false
    }
  }

  // 创建行程
  const addTrip = async (data: any) => {
    loading.value = true
    try {
      const trip = await createTrip(data)
      trips.value.unshift(trip)
      return trip
    } finally {
      loading.value = false
    }
  }

  // 更新行程
  const modifyTrip = async (id: number, data: any) => {
    loading.value = true
    try {
      const trip = await updateTrip(id, data)
      const index = trips.value.findIndex((t) => t.id === id)
      if (index !== -1) {
        trips.value[index] = trip
      }
      if (currentTrip.value?.id === id) {
        currentTrip.value = trip
      }
      return trip
    } finally {
      loading.value = false
    }
  }

  // 删除行程
  const removeTrip = async (id: number) => {
    loading.value = true
    try {
      await deleteTrip(id)
      trips.value = trips.value.filter((t) => t.id !== id)
      if (currentTrip.value?.id === id) {
        currentTrip.value = null
      }
    } finally {
      loading.value = false
    }
  }

  return {
    trips,
    currentTrip,
    loading,
    fetchTrips,
    fetchTrip,
    aiGenerateTrip,
    addTrip,
    modifyTrip,
    removeTrip,
  }
})
