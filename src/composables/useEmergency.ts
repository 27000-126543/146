import { useHallStore } from '../store/hall'
import { useAuthStore } from '../store/auth'
import { ElMessage } from 'element-plus'

export function useEmergency() {
  const hallStore = useHallStore()
  const authStore = useAuthStore()

  const startEmergency = () => {
    if (!authStore.hasPermission('leader')) {
      ElMessage.error('只有中心领导有权限启动应急疏散')
      return false
    }
    hallStore.startEmergency()
    authStore.addLog('emergency_start', '启动应急疏散系统')
    ElMessage.warning('应急疏散系统已启动，请所有人员保持冷静，按照指引撤离')
    return true
  }

  const stopEmergency = () => {
    if (!authStore.hasPermission('leader')) {
      ElMessage.error('只有中心领导有权限停止应急疏散')
      return false
    }
    hallStore.stopEmergency()
    authStore.addLog('emergency_stop', '停止应急疏散系统')
    ElMessage.success('应急疏散系统已解除')
    return true
  }

  return {
    emergencyActive: hallStore.emergencyActive,
    evacuationPaths: hallStore.evacuationPaths,
    startEmergency,
    stopEmergency
  }
}
