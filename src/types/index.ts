export type BusinessType = 'tax' | 'social' | 'industry'
export type WindowStatus = 'idle' | 'busy' | 'offline'
export type StepStatus = 'pending' | 'processing' | 'completed'
export type StepName = '窗口受理' | '科室审核' | '领导签批'
export type UserRole = 'window' | 'chief' | 'leader'

export interface Position3D {
  x: number
  y: number
  z: number
}

export interface WindowInfo {
  id: string
  number: number
  businessType: BusinessType
  businessName: string
  currentNumber: string
  staffName: string
  processDuration: number
  queueCount: number
  avgWaitTime: number
  status: WindowStatus
  position: Position3D
}

export interface ApprovalStep {
  name: StepName
  status: StepStatus
  operator: string
  time: Date
}

export interface ApprovalProcess {
  id: string
  materialId: string
  materialName: string
  submitter: string
  windowId: string
  steps: ApprovalStep[]
  currentStep: number
  startTime: Date
}

export interface Personnel {
  id: string
  name: string
  position: string
  role: UserRole
  location: Position3D
  isRestricted: boolean
  alertActive: boolean
  model?: any
}

export interface EnvironmentData {
  temperature: number
  humidity: number
  co2: number
  fanStatus: 'on' | 'off'
  thresholds: {
    temperature: number
    humidity: number
    co2: number
  }
}

export interface WindowDaily {
  windowId: string
  windowNumber: number
  businessType: string
  count: number
  avgDuration: number
  satisfaction: number
}

export interface DailyReport {
  date: string
  windows: WindowDaily[]
  totalCount: number
  avgDuration: number
  satisfaction: number
}

export interface User {
  id: string
  name: string
  role: UserRole
  faceData?: string
}

export interface LogEntry {
  timestamp: Date
  userId: string
  userName: string
  action: string
  details?: string
}

export interface GuideLine {
  id: string
  start: Position3D
  end: Position3D
  active: boolean
}

export interface MaterialFlow {
  id: string
  materialName: string
  from: Position3D
  to: Position3D
  progress: number
  active: boolean
}

export interface Area {
  id: string
  name: string
  isRestricted: boolean
  bounds: {
    minX: number
    maxX: number
    minZ: number
    maxZ: number
  }
}

export interface EvacuationPath {
  id: string
  type: 'evacuation' | 'supply'
  points: Position3D[]
  active: boolean
}

export interface AssignmentRecord {
  id: string
  businessType: BusinessType
  businessName: string
  windowId: string
  windowNumber: number
  queueCount: number
  estimatedWaitTime: number
  assignTime: Date
}

export interface ApprovalRecord {
  id: string
  materialId: string
  materialName: string
  submitter: string
  windowId: string
  windowNumber: number
  steps: ApprovalStep[]
  currentStep: number
  startTime: Date
  completedTime?: Date
  status: 'processing' | 'completed'
