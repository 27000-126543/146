import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { EnvironmentData, Personnel, MaterialFlow, EvacuationPath, Area, ApprovalProcess, ApprovalRecord } from '../types'
import { mockEnvironment, mockPersonnel, mockAreas, generateApprovalProcess, mockWindows } from '../mock/data'

const APPROVAL_STORAGE_KEY = 'gov_hall_approvals'

export const useHallStore = defineStore('hall', () => {
  const environment = ref<EnvironmentData>({ ...mockEnvironment })
  const personnel = ref<Personnel[]>([...mockPersonnel])
  const areas = ref<Area[]>([...mockAreas])
  const materialFlows = ref<MaterialFlow[]>([])
  const approvalProcesses = ref<ApprovalRecord[]>([])
  const evacuationPaths = ref<EvacuationPath[]>([])
  const emergencyActive = ref(false)
  const fanParticles = ref<{ positions: number[]; active: boolean }>({ positions: [], active: false })

  const activeAlerts = computed(() => personnel.value.filter(p => p.alertActive))
  const restrictedAreas = computed(() => areas.value.filter(a => a.isRestricted))

  const isInRestrictedArea = (x: number, z: number): boolean => {
    return restrictedAreas.value.some(area =>
      x >= area.bounds.minX && x <= area.bounds.maxX &&
      z >= area.bounds.minZ && z <= area.bounds.maxZ
    )
  }

  const getAreaAtPosition = (x: number, z: number): Area | undefined => {
    return areas.value.find(area =>
      x >= area.bounds.minX && x <= area.bounds.maxX &&
      z >= area.bounds.minZ && z <= area.bounds.maxZ
    )
  }

  const updateEnvironment = (data: Partial<EnvironmentData>) => {
    environment.value = { ...environment.value, ...data }
    checkThresholds()
  }

  const checkThresholds = () => {
    const env = environment.value
    const overThreshold =
      env.temperature > env.thresholds.temperature ||
      env.humidity > env.thresholds.humidity ||
      env.co2 > env.thresholds.co2

    if (overThreshold && env.fanStatus === 'off') {
      environment.value.fanStatus = 'on'
      startFanParticles()
    } else if (!overThreshold && env.fanStatus === 'on') {
      environment.value.fanStatus = 'off'
      stopFanParticles()
    }
  }

  const startFanParticles = () => {
    fanParticles.value.active = true
    const positions: number[] = []
    for (let i = 0; i < 50; i++) {
      positions.push(
        (Math.random() - 0.5) * 30,
        Math.random() * 5,
        (Math.random() - 0.5) * 30
      )
    }
    fanParticles.value.positions = positions
  }

  const stopFanParticles = () => {
    fanParticles.value.active = false
  }

  const simulateEnvironment = () => {
    const env = environment.value
    env.temperature += (Math.random() - 0.48) * 0.2
    env.humidity += (Math.random() - 0.48) * 0.5
    env.co2 += (Math.random() - 0.45) * 10
    env.temperature = Math.max(18, Math.min(35, env.temperature))
    env.humidity = Math.max(30, Math.min(80, env.humidity))
    env.co2 = Math.max(400, Math.min(2000, env.co2))
    checkThresholds()
  }

  const updatePersonnelLocation = (id: string, location: { x: number; y: number; z: number }) => {
    const person = personnel.value.find(p => p.id === id)
    if (person) {
      person.location = location
      const inRestricted = isInRestrictedArea(location.x, location.z)
      person.isRestricted = inRestricted
      const canAccess = person.role !== 'window'
      person.alertActive = inRestricted && !canAccess
    }
  }

  const movePersonnelRandomly = () => {
    personnel.value.forEach(person => {
      if (Math.random() > 0.8) {
        const dx = (Math.random() - 0.5) * 2
        const dz = (Math.random() - 0.5) * 2
        let newX = person.location.x + dx
        let newZ = person.location.z + dz
        newX = Math.max(-14, Math.min(14, newX))
        newZ = Math.max(-14, Math.min(14, newZ))
        updatePersonnelLocation(person.id, { ...person.location, x: newX, z: newZ })
      }
    })
  }

  const createMaterialFlow = (materialName: string, from: { x: number; y: number; z: number }, to: { x: number; y: number; z: number }) => {
    const id = `flow_${Date.now()}`
    materialFlows.value.push({
      id,
      materialName,
      from,
      to,
      progress: 0,
      active: true
    })
    return id
  }

  const createApprovalProcess = (windowId: string, materialName: string, submitter: string = '办事群众') => {
    const approvalProcess = generateApprovalProcess(windowId, materialName)
    const window = mockWindows.find(w => w.id === windowId)
    
    const record: ApprovalRecord = {
      id: approvalProcess.id,
      materialId: approvalProcess.materialId,
      materialName: approvalProcess.materialName,
      submitter,
      windowId,
      windowNumber: window?.number || 0,
      steps: approvalProcess.steps,
      currentStep: approvalProcess.currentStep,
      startTime: approvalProcess.startTime,
      status: 'processing'
    }
    
    approvalProcesses.value.unshift(record)
    
    if (approvalProcesses.value.length > 100) {
      approvalProcesses.value = approvalProcesses.value.slice(0, 100)
    }
    
    saveApprovalsToStorage()
    return record
  }

  const advanceApprovalStep = (processId: string, operatorName: string = '') => {
    const process = approvalProcesses.value.find(p => p.id === processId)
    if (!process || process.currentStep >= 2 || process.status === 'completed') return
    
    const now = new Date()
    const prevStep = process.steps[process.currentStep]
    prevStep.status = 'completed'
    prevStep.duration = Math.floor((now.getTime() - new Date(prevStep.time).getTime()) / 60000)
    
    process.currentStep++
    const currentStep = process.steps[process.currentStep]
    currentStep.status = 'processing'
    currentStep.time = now
    if (operatorName) {
      currentStep.operator = operatorName
    } else if (process.currentStep === 1) {
      currentStep.operator = '周审批'
    } else if (process.currentStep === 2) {
      currentStep.operator = '吴领导'
    }
    
    if (process.currentStep >= 2) {
      process.steps[2].status = 'completed'
      process.steps[2].duration = 0
      process.status = 'completed'
      process.completedTime = now
    }
    
    saveApprovalsToStorage()
  }

  const saveApprovalsToStorage = () => {
    try {
      localStorage.setItem(APPROVAL_STORAGE_KEY, JSON.stringify(approvalProcesses.value))
    } catch (e) {
      console.error('保存审批记录失败:', e)
    }
  }

  const loadApprovalsFromStorage = () => {
    try {
      const stored = localStorage.getItem(APPROVAL_STORAGE_KEY)
      if (stored) {
        const parsed = JSON.parse(stored)
        approvalProcesses.value = parsed.map((r: ApprovalRecord) => ({
          ...r,
          startTime: new Date(r.startTime),
          completedTime: r.completedTime ? new Date(r.completedTime) : undefined,
          steps: r.steps.map(s => ({
            ...s,
            time: new Date(s.time)
          }))
        }))
      }
    } catch (e) {
      console.error('加载审批记录失败:', e)
    }
  }

  const startEmergency = () => {
    emergencyActive.value = true
    evacuationPaths.value = [
      {
        id: 'evac1',
        type: 'evacuation',
        active: true,
        points: [
          { x: 0, y: 0.1, z: 0 },
          { x: 0, y: 0.1, z: -12 },
          { x: -10, y: 0.1, z: -12 },
          { x: -10, y: 0.1, z: -14 }
        ]
      },
      {
        id: 'evac2',
        type: 'evacuation',
        active: true,
        points: [
          { x: 0, y: 0.1, z: 0 },
          { x: 0, y: 0.1, z: -12 },
          { x: 10, y: 0.1, z: -12 },
          { x: 10, y: 0.1, z: -14 }
        ]
      },
      {
        id: 'supply1',
        type: 'supply',
        active: true,
        points: [
          { x: 12, y: 0.1, z: 10 },
          { x: 12, y: 0.1, z: 0 },
          { x: 0, y: 0.1, z: 0 }
        ]
      }
    ]
  }

  const stopEmergency = () => {
    emergencyActive.value = false
    evacuationPaths.value = []
  }

  const updateFanParticles = () => {
    if (!fanParticles.value.active) return
    const positions = fanParticles.value.positions
    for (let i = 0; i < positions.length; i += 3) {
      positions[i + 1] += 0.05
      positions[i] += (Math.random() - 0.5) * 0.1
      positions[i + 2] += (Math.random() - 0.5) * 0.1
      if (positions[i + 1] > 6) {
        positions[i] = (Math.random() - 0.5) * 30
        positions[i + 1] = 0.5
        positions[i + 2] = (Math.random() - 0.5) * 30
      }
    }
  }

  return {
    environment,
    personnel,
    areas,
    materialFlows,
    approvalProcesses,
    evacuationPaths,
    emergencyActive,
    fanParticles,
    activeAlerts,
    restrictedAreas,
    isInRestrictedArea,
    getAreaAtPosition,
    updateEnvironment,
    simulateEnvironment,
    updatePersonnelLocation,
    movePersonnelRandomly,
    createMaterialFlow,
    createApprovalProcess,
    advanceApprovalStep,
    saveApprovalsToStorage,
    loadApprovalsFromStorage,
    startEmergency,
    stopEmergency,
    updateFanParticles,
    startFanParticles,
    stopFanParticles
  }
})
