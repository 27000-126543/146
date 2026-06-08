import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { WindowInfo, BusinessType, GuideLine, AssignmentRecord, ReassignReason, UserRole, Position3D } from '../types'
import { mockWindows } from '../mock/data'

const ASSIGNMENT_STORAGE_KEY = 'gov_hall_assignments'

export const useWindowStore = defineStore('window', () => {
  const windows = ref<WindowInfo[]>([...mockWindows])
  const selectedWindow = ref<WindowInfo | null>(null)
  const guideLines = ref<GuideLine[]>([])
  const autoAssignEnabled = ref(true)
  const assignmentRecords = ref<AssignmentRecord[]>([])
  const latestAssignment = ref<AssignmentRecord | null>(null)

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
      updateAvgWaitTime(w.id)
    })
  }

  const updateAvgWaitTime = (windowId: string) => {
    const window = getWindowById(windowId)
    if (window) {
      if (window.queueCount === 0) {
        window.avgWaitTime = 0
      } else {
        const avgHandleTime = 8
        window.avgWaitTime = Math.min(30, window.queueCount * avgHandleTime)
      }
    }
  }

  const calculateWaitTime = (queueCount: number): number => {
    if (queueCount === 0) return 0
    const avgHandleTime = 8
    return Math.min(30, queueCount * avgHandleTime)
  }

  const addAssignmentRecord = (
    businessType: BusinessType,
    windowInfo: WindowInfo,
    assignType: 'auto' | 'manual' = 'auto',
    previousWindow: WindowInfo | null = null
  ): AssignmentRecord => {
    const businessNames: Record<BusinessType, string> = {
      tax: '税务',
      social: '社保',
      industry: '工商'
    }
    
    const record: AssignmentRecord = {
      id: `assign_${Date.now()}`,
      businessType,
      businessName: businessNames[businessType],
      windowId: windowInfo.id,
      windowNumber: windowInfo.number,
      queueCount: windowInfo.queueCount,
      estimatedWaitTime: calculateWaitTime(windowInfo.queueCount),
      assignTime: new Date(),
      assignType,
      previousWindowId: previousWindow?.id,
      previousWindowNumber: previousWindow?.number
    }
    
    assignmentRecords.value.unshift(record)
    latestAssignment.value = record
    
    if (assignmentRecords.value.length > 50) {
      assignmentRecords.value = assignmentRecords.value.slice(0, 50)
    }
    
    saveAssignmentsToStorage()
    return record
  }

  const getAvailableWindowsForReassign = (businessType: BusinessType, excludeWindowId?: string): WindowInfo[] => {
    return windows.value.filter(
      w => w.businessType === businessType && 
           w.status !== 'offline' && 
           w.id !== excludeWindowId
    )
  }

  const reassignWindow = (
    assignmentId: string,
    newWindowId: string,
    reason: ReassignReason,
    remark: string = '',
    operatorName: string = '',
    operatorRole: UserRole = 'window'
  ): AssignmentRecord | null => {
    const record = assignmentRecords.value.find(r => r.id === assignmentId)
    if (!record) return null

    const newWindow = getWindowById(newWindowId)
    if (!newWindow || newWindow.businessType !== record.businessType) return null

    const oldWindow = getWindowById(record.windowId)

    clearGuideLines()

    createGuideLine(
      { x: 0, y: 0.1, z: 0 },
      { x: newWindow.position.x, y: 0.1, z: newWindow.position.z + 2 }
    )

    const estimatedWaitTime = calculateWaitTime(newWindow.queueCount)

    const newRecord: AssignmentRecord = {
      id: `assign_${Date.now()}`,
      businessType: record.businessType,
      businessName: record.businessName,
      windowId: newWindow.id,
      windowNumber: newWindow.number,
      queueCount: newWindow.queueCount,
      estimatedWaitTime,
      assignTime: new Date(),
      assignType: 'manual',
      previousWindowId: oldWindow?.id,
      previousWindowNumber: oldWindow?.number,
      reassignReason: reason,
      reassignRemark: remark,
      operatorName,
      operatorRole
    }

    assignmentRecords.value.unshift(newRecord)
    latestAssignment.value = newRecord

    if (assignmentRecords.value.length > 50) {
      assignmentRecords.value = assignmentRecords.value.slice(0, 50)
    }

    saveAssignmentsToStorage()
    return newRecord
  }

  const saveAssignmentsToStorage = () => {
    try {
      localStorage.setItem(ASSIGNMENT_STORAGE_KEY, JSON.stringify(assignmentRecords.value))
    } catch (e) {
      console.error('保存分配记录失败:', e)
    }
  }

  const loadAssignmentsFromStorage = () => {
    try {
      const stored = localStorage.getItem(ASSIGNMENT_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        assignmentRecords.value = parsed.map((r: AssignmentRecord) => ({
          ...r,
          assignTime: new Date(r.assignTime)
        }))
      }
    } catch (e) {
      console.error('加载分配记录失败:', e)
    }
  }

  return {
    windows,
    selectedWindow,
    guideLines,
    autoAssignEnabled,
    assignmentRecords,
    latestAssignment,
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
    simulateQueueUpdate,
    updateAvgWaitTime,
    calculateWaitTime,
    addAssignmentRecord,
    getAvailableWindowsForReassign,
    reassignWindow,
    loadAssignmentsFromStorage,
    saveAssignmentsToStorage
  }
})
