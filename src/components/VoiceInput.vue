<template>
  <div class="voice-input">
    <el-button
      :type="isListening ? 'danger' : 'primary'"
      :icon="Microphone"
      :loading="isListening"
      @click="toggleListening"
      :disabled="!isSupported"
    >
      {{ isListening ? '正在录音...' : '语音输入' }}
    </el-button>
    <span v-if="!isSupported" class="unsupported-text">
      您的浏览器不支持语音识别
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Microphone } from '@element-plus/icons-vue'
import { SpeechRecognitionService } from '@/utils/speech'

const emit = defineEmits<{
  result: [text: string]
}>()

const isSupported = SpeechRecognitionService.isSupported()
const isListening = ref(false)
let speechService: SpeechRecognitionService | null = null

if (isSupported) {
  speechService = new SpeechRecognitionService()
}

const toggleListening = () => {
  if (!speechService) return

  if (isListening.value) {
    // 停止录音
    speechService.stop()
    isListening.value = false
  } else {
    // 开始录音
    isListening.value = true
    speechService.start(
      (text) => {
        isListening.value = false
        emit('result', text)
        ElMessage.success(`识别结果：${text}`)
      },
      (error) => {
        isListening.value = false
        ElMessage.error(error)
      }
    )
  }
}

onUnmounted(() => {
  if (speechService) {
    speechService.stop()
  }
})
</script>

<style scoped>
.voice-input {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.unsupported-text {
  color: #909399;
  font-size: 12px;
}
</style>
