/**
 * 语音识别工具类
 * 使用浏览器原生 Web Speech API
 */

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList
  resultIndex: number
}

interface SpeechRecognitionResultList {
  length: number
  item(index: number): SpeechRecognitionResult
  [index: number]: SpeechRecognitionResult
}

interface SpeechRecognitionResult {
  length: number
  item(index: number): SpeechRecognitionAlternative
  [index: number]: SpeechRecognitionAlternative
  isFinal: boolean
}

interface SpeechRecognitionAlternative {
  transcript: string
  confidence: number
}

declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export class SpeechRecognitionService {
  private recognition: any
  private isListening = false

  constructor() {
    // 检查浏览器是否支持 Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      console.warn('浏览器不支持语音识别')
      return
    }

    this.recognition = new SpeechRecognition()
    this.recognition.lang = 'zh-CN' // 设置为中文
    this.recognition.continuous = false // 不连续识别
    this.recognition.interimResults = false // 不返回中间结果
  }

  /**
   * 检查是否支持语音识别
   */
  static isSupported(): boolean {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
  }

  /**
   * 开始语音识别
   * @param onResult 识别结果回调
   * @param onError 错误回调
   */
  start(onResult: (text: string) => void, onError?: (error: string) => void) {
    if (!this.recognition) {
      onError?.('浏览器不支持语音识别')
      return
    }

    if (this.isListening) {
      return
    }

    this.isListening = true

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
    }

    this.recognition.onerror = (event: any) => {
      this.isListening = false
      let errorMessage = '语音识别失败'

      switch (event.error) {
        case 'no-speech':
          errorMessage = '未检测到语音输入'
          break
        case 'audio-capture':
          errorMessage = '无法访问麦克风'
          break
        case 'not-allowed':
          errorMessage = '麦克风权限被拒绝'
          break
        case 'network':
          errorMessage = '网络错误'
          break
      }

      onError?.(errorMessage)
    }

    this.recognition.onend = () => {
      this.isListening = false
    }

    try {
      this.recognition.start()
    } catch (error) {
      this.isListening = false
      onError?.('启动语音识别失败')
    }
  }

  /**
   * 停止语音识别
   */
  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop()
      this.isListening = false
    }
  }

  /**
   * 获取当前是否正在监听
   */
  getIsListening(): boolean {
    return this.isListening
  }
}
