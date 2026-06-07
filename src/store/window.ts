import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WindowInfo, BusinessType, GuideLine, Position3D } from '../types'
import { mockWindows } from '../mock/data'

export const useWindowStore = defineStore('window', () => {
  const windows = ref<WindowInfo[]>([...mockWindows])
  const selectedWindow = ref<WindowInfo | null>(null)
  const guideLines = ref<GuideLine[]>([])
  const autoAssignEnabled = ref(true)

  const taxWindows = computed(() => windows.value.filter(w => w.businessType === 'tax' && w.status !== 'offline'))
  const socialWindows = computed(() => windows.value.filter(w => w.businessType === 'social' && w.status !== 'offline'))
  const industryWindows = computed(() => windows.value.filter(w => w.businessType === 'industry' && w.status !== 'offline'))
  const activeWindows = computed(() => windows.value.filter(w => w.status !== 'offline'))
  const busyCount = computed(() => windows.value.filter(w => w.status === 'busy').length)
  const totalQueue = computed(() => windows.value.reduce((sum, w) => sum + w.queueCount, 0))

  const getWindowById = (id: string) => windows.value.find(w => w.id === id)

  const selectWindow = (window: WindowInfo | null) => {
    selectedWindow.value = window
  }

  const assignWindow = (businessType: BusinessType): WindowInfo | null => {
    const availableWindows = windows.value.filter(
      w => w.businessType === businessType && w.status !== 'offline'
    )
    if (availableWindows.length === 0) return null

    const sorted = [...availableWindows].sort((a, b) => {
      const scoreA = a.queueCount * 100 + (a.status === 'idle' ? 0 : 1)
      const scoreB = b.queueCount * 100 + (b.status === 'idle' ? 0 : 1)
      return scoreA - scoreB
    })

    return sorted[0]
  }

  const createGuideLine = (start: Position3D, end: Position3D): string => {
    const id = `guide_${Date.now()}`
    guideLines.value.push({ id, start, end, active: true })

    setTimeout(() => {
      const idx = guideLines.value.findIndex(g => g.id === id)
      if (idx !== -1) {
        guideLines.value[idx].active = false
      }
    }, 15000)

    return id
  }

  const removeGuideLine = (id: string) => {
    guideLines.value = guideLines.value.filter(g => g.id !== id)
  }

  const clearGuideLines = () => {
    guideLines.value = []
  }

  const callNextNumber = (windowId: string) => {
    const window = getWindowById(windowId)
    if (!window || window.queueCount === 0) return

    const prefix = window.businessType === 'tax' ? 'A' : window.businessType === 'social' ? 'B' : 'C'
    const currentNum = parseInt(window.currentNumber.replace(/[A-Z]/, ''))
    window.currentNumber = `${prefix}${String(currentNum + 1).padStart(5, '0')}`
    window.queueCount = Math.max(0, window.queueCount - 1)
    window.status = 'busy'
    window.processDuration = Math.floor(Math.random() * 300) + 120
  }

  const updateWindowStatus = (windowId: string, status: WindowInfo['status']) => {
    const window = getWindowById(windowId)
    if (window) {
      window.status = status
    }
  }

  const simulateQueueUpdate = () => {
    windows.value.forEach(w => {
      if (w.status !== 'offline' && Math.random() > 0.7) {
        w.queueCount = Math.min(20, w.queueCount + (Math.random() > 0.5 ? 1 : -1))
      }
      if (w.status === 'busy' && w.processDuration > 0) {
        w.processDuration -= 5
        if (w.processDuration <= 0) {
          w.status = 'idle'
          w.processDuration = 0
        }
      }
    })
  }

  return {
    windows,
    selectedWindow,
    guideLines,
    autoAssignEnabled,
    taxWindows,
    socialWindows,
    industryWindows,
    activeWindows,
    busyCount,
    totalQueue,
    getWindowById,
    selectWindow,
    assignWindow,
    createGuideLine,
    removeGuideLine,
    clearGuideLines,
    callNextNumber,
    updateWindowStatus,
    simulateQueueUpdate
  }
})
