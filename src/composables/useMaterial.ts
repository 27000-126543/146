import { useHallStore } from '../store/hall'
import { useWindowStore } from '../store/window'
import { useAuthStore } from '../store/auth'

export function useMaterial() {
  const hallStore = useHallStore()
  const windowStore = useWindowStore()
  const authStore = useAuthStore()

  const submitMaterial = (windowId: string, materialName: string) => {
    const window = windowStore.getWindowById(windowId)
    if (!window) return null

    const process = hallStore.createApprovalProcess(windowId, materialName)
    hallStore.createMaterialFlow(
      materialName,
      { x: window.position.x, y: 1.2, z: window.position.z },
      { x: -10, y: 1.2, z: 8 }
    )

    authStore.addLog('material_submit', `提交材料: ${materialName}，窗口: ${window.number}`)

    return process
  }

  const processNextStep = (processId: string) => {
    const process = hallStore.approvalProcesses.find(p => p.id === processId)
    if (!process) return

    const currentStepName = process.steps[process.currentStep]?.name
    if (currentStepName === '科室审核' && !authStore.hasPermission(['chief', 'leader'])) {
      return
    }
    if (currentStepName === '领导签批' && !authStore.hasPermission('leader')) {
      return
    }

    hallStore.advanceApprovalStep(processId)
    authStore.addLog('approval_step', `审批流程: ${process.materialName}，推进到下一步`)
  }

  const getStepColor = (status: string): string => {
    const colors: Record<string, string> = {
      completed: 'bg-green-500',
      processing: 'bg-blue-500',
      pending: 'bg-gray-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getStepStatus = (status: string): string => {
    const texts: Record<string, string> = {
      completed: '已完成',
      processing: '进行中',
      pending: '待处理'
    }
    return texts[status] || '未知'
  }

  const formatTime = (date: Date): string => {
    if (!date) return '--:--'
    const d = new Date(date)
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  }

  return {
    materialFlows: hallStore.materialFlows,
    approvalProcesses: hallStore.approvalProcesses,
    submitMaterial,
    processNextStep,
    getStepColor,
    getStepStatus,
    formatTime,
    createMaterialFlow: hallStore.createMaterialFlow,
    createApprovalProcess: hallStore.createApprovalProcess,
    advanceApprovalStep: hallStore.advanceApprovalStep
  }
}
