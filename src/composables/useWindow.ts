import { useWindowStore } from '../store/window'
import type { BusinessType } from '../types'

export function useWindow() {
  const windowStore = useWindowStore()

  const assignAndGuide = (businessType: BusinessType) => {
    const assignedWindow = windowStore.assignWindow(businessType)
    if (assignedWindow) {
      windowStore.createGuideLine(
        { x: 0, y: 0.1, z: 0 },
        { x: assignedWindow.position.x, y: 0.1, z: assignedWindow.position.z + 2 }
      )
    }
    return assignedWindow
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const getBusinessIcon = (type: BusinessType): string => {
    const icons: Record<BusinessType, string> = {
      tax: '💰',
      social: '📋',
      industry: '🏢'
    }
    return icons[type]
  }

  const getStatusColor = (status: string): string => {
    const colors: Record<string, string> = {
      idle: 'text-green-400',
      busy: 'text-yellow-400',
      offline: 'text-gray-500'
    }
    return colors[status] || 'text-gray-400'
  }

  const getStatusText = (status: string): string => {
    const texts: Record<string, string> = {
      idle: '空闲',
      busy: '办理中',
      offline: '离线'
    }
    return texts[status] || '未知'
  }

  return {
    windows: windowStore.windows,
    selectedWindow: windowStore.selectedWindow,
    guideLines: windowStore.guideLines,
    autoAssignEnabled: windowStore.autoAssignEnabled,
    taxWindows: windowStore.taxWindows,
    socialWindows: windowStore.socialWindows,
    industryWindows: windowStore.industryWindows,
    activeWindows: windowStore.activeWindows,
    busyCount: windowStore.busyCount,
    totalQueue: windowStore.totalQueue,
    selectWindow: windowStore.selectWindow,
    assignWindow: windowStore.assignWindow,
    assignAndGuide,
    callNextNumber: windowStore.callNextNumber,
    updateWindowStatus: windowStore.updateWindowStatus,
    simulateQueueUpdate: windowStore.simulateQueueUpdate,
    clearGuideLines: windowStore.clearGuideLines,
    formatDuration,
    getBusinessIcon,
    getStatusColor,
    getStatusText
  }
}
