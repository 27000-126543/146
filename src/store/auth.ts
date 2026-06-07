import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LogEntry, UserRole } from '../types'
import { mockUsers } from '../mock/data'

interface AuthState {
  currentUser: User | null
  isLoggedIn: boolean
  logs: LogEntry[]
}

export const useAuthStore = defineStore('auth', () => {
  const currentUser = ref<User | null>(null)
  const isLoggedIn = ref(false)
  const logs = ref<LogEntry[]>([])

  const userRole = computed(() => currentUser.value?.role || null)
  const userName = computed(() => currentUser.value?.name || '')

  const hasPermission = (requiredRole: UserRole | UserRole[]): boolean => {
    if (!currentUser.value) return false
    const roleHierarchy: Record<UserRole, number> = {
      window: 1,
      chief: 2,
      leader: 3
    }
    const userLevel = roleHierarchy[currentUser.value.role]
    if (Array.isArray(requiredRole)) {
      return requiredRole.some(r => roleHierarchy[r] <= userLevel)
    }
    return roleHierarchy[requiredRole] <= userLevel
  }

  const login = async (userName: string): Promise<boolean> => {
    const user = mockUsers.find(u => u.name === userName)
    if (user) {
      currentUser.value = user
      isLoggedIn.value = true
      addLog('login', '用户登录')
      return true
    }
    return false
  }

  const loginByRole = async (role: UserRole): Promise<boolean> => {
    const user = mockUsers.find(u => u.role === role)
    if (user) {
      currentUser.value = user
      isLoggedIn.value = true
      addLog('login', `以${user.name}身份登录`)
      return true
    }
    return false
  }

  const logout = () => {
    addLog('logout', '用户登出')
    currentUser.value = null
    isLoggedIn.value = false
  }

  const addLog = (action: string, details?: string) => {
    if (!currentUser.value) return
    logs.value.unshift({
      timestamp: new Date(),
      userId: currentUser.value.id,
      userName: currentUser.value.name,
      action,
      details
    })
    if (logs.value.length > 100) {
      logs.value.pop()
    }
  }

  return {
    currentUser,
    isLoggedIn,
    logs,
    userRole,
    userName,
    hasPermission,
    login,
    loginByRole,
    logout,
    addLog
  }
})
