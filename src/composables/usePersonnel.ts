import { useHallStore } from '../store/hall'
import type { Position3D } from '../types'

export function usePersonnel() {
  const hallStore = useHallStore()

  const getRoleColor = (role: string): string => {
    const colors: Record<string, string> = {
      window: 'text-blue-400',
      chief: 'text-purple-400',
      leader: 'text-yellow-400'
    }
    return colors[role] || 'text-gray-400'
  }

  const getRoleName = (role: string): string => {
    const names: Record<string, string> = {
      window: '窗口人员',
      chief: '审批科长',
      leader: '中心领导'
    }
    return names[role] || '未知'
  }

  const getCurrentArea = (location: Position3D): string => {
    const area = hallStore.getAreaAtPosition(location.x, location.z)
    return area?.name || '公共区域'
  }

  return {
    personnel: hallStore.personnel,
    activeAlerts: hallStore.activeAlerts,
    areas: hallStore.areas,
    restrictedAreas: hallStore.restrictedAreas,
    getRoleColor,
    getRoleName,
    getCurrentArea,
    updatePersonnelLocation: hallStore.updatePersonnelLocation,
    movePersonnelRandomly: hallStore.movePersonnelRandomly,
    isInRestrictedArea: hallStore.isInRestrictedArea
  }
}
