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
      addLog('face_recognition_login', `人脸识别登录成功，角色: ${getRoleName(role)}`, `用户ID: ${user.id}, 姓名: ${user.name}`)
      saveLogsToStorage()
      return true
    }
    addLog('face_recognition_failed', '人脸识别登录失败', `尝试角色: ${getRoleName(role)}`)
    saveLogsToStorage()
    return false
  }

  const getRoleName = (role: UserRole): string => {
    const names: Record<UserRole, string> = {
      window: '窗口人员',
      chief: '审批科长',
      leader: '中心领导'
    }
    return names[role]
  }

  const saveLogsToStorage = () => {
    try {
      localStorage.setItem('gov_hall_logs', JSON.stringify(logs.value.slice(0, 500)))
    } catch (e) {
      console.warn('Failed to save logs to storage')
    }
  }

  const loadLogsFromStorage = () => {
    try {
      const stored = localStorage.getItem('gov_hall_logs')
      if (stored) {
        const parsed = JSON.parse(stored)
        logs.value = parsed.map((l: any) => ({
          ...l,
          timestamp: new Date(l.timestamp)
        }))
      }
    } catch (e) {
      console.warn('Failed to load logs from storage')
    }
  }

  const logout = () => {
    addLog('logout', '用户登出')
    currentUser.value = null
    isLoggedIn.value = false
  }

  const addLog = (action: string, details?: string, extra?: string) => {
    const logDetails = extra ? `${details} - ${extra}` : details
    if (action === 'face_recognition_failed') {
      logs.value.unshift({
        timestamp: new Date(),
        userId: 'unknown',
        userName: '未登录用户',
        action,
        details: logDetails
      })
    } else if (currentUser.value) {
      logs.value.unshift({
        timestamp: new Date(),
        userId: currentUser.value.id,
        userName: currentUser.value.name,
        action,
        details: logDetails
      })
    } else if (action.startsWith('face_recognition_')) {
      logs.value.unshift({
        timestamp: new Date(),
        userId: 'unknown',
        userName: '未登录用户',
        action,
        details: logDetails
      })
    }
    if (logs.value.length > 100) {
      logs.value.pop()
    }
  }

  loadLogsFromStorage()

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
    addLog,
    loadLogsFromStorage,
    getRoleName
  }
})
