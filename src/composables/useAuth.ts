import { ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../store/auth'
import type { UserRole } from '../types'

export function useAuth() {
  const authStore = useAuthStore()
  const { currentUser, isLoggedIn, userRole, userName, logs } = storeToRefs(authStore)
  const isFaceScanning = ref(false)
  const scanProgress = ref(0)

  const simulateFaceScan = async (role: UserRole): Promise<boolean> => {
    isFaceScanning.value = true
    scanProgress.value = 0

    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 100))
      scanProgress.value = i
    }

    const success = await authStore.loginByRole(role)
    isFaceScanning.value = false
    scanProgress.value = 0
    return success
  }

  const logout = () => {
    authStore.logout()
  }

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    return authStore.hasPermission(requiredRole)
  }

  return {
    isFaceScanning,
    scanProgress,
    currentUser,
    isLoggedIn,
    userRole,
    userName,
    logs,
    simulateFaceScan,
    login: authStore.login,
    logout,
    hasPermission,
    addLog: authStore.addLog
  }
}
