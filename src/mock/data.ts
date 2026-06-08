import type { WindowInfo, Personnel, EnvironmentData, User, DailyReport, ApprovalProcess, Area } from '../types'

export const mockWindows: WindowInfo[] = [
  {
    id: 'w1',
    number: 1,
    businessType: 'tax',
    businessName: '税务',
    currentNumber: 'A00128',
    staffName: '张税务',
    processDuration: 245,
    queueCount: 5,
    avgWaitTime: 40,
    status: 'busy',
    position: { x: -12, y: 0, z: -8 }
  },
  {
    id: 'w2',
    number: 2,
    businessType: 'tax',
    businessName: '税务',
    currentNumber: 'A00129',
    staffName: '李税员',
    processDuration: 180,
    queueCount: 3,
    avgWaitTime: 24,
    status: 'busy',
    position: { x: -8, y: 0, z: -8 }
  },
  {
    id: 'w3',
    number: 3,
    businessType: 'social',
    businessName: '社保',
    currentNumber: 'B00086',
    staffName: '王社保',
    processDuration: 320,
    queueCount: 7,
    avgWaitTime: 56,
    status: 'busy',
    position: { x: -4, y: 0, z: -8 }
  },
  {
    id: 'w4',
    number: 4,
    businessType: 'social',
    businessName: '社保',
    currentNumber: 'B00087',
    staffName: '赵社保',
    processDuration: 150,
    queueCount: 0,
    avgWaitTime: 0,
    status: 'idle',
    position: { x: 0, y: 0, z: -8 }
  },
  {
    id: 'w5',
    number: 5,
    businessType: 'industry',
    businessName: '工商',
    currentNumber: 'C00052',
    staffName: '刘工商',
    processDuration: 420,
    queueCount: 8,
    avgWaitTime: 64,
    status: 'busy',
    position: { x: 4, y: 0, z: -8 }
  },
  {
    id: 'w6',
    number: 6,
    businessType: 'industry',
    businessName: '工商',
    currentNumber: 'C00053',
    staffName: '陈工商',
    processDuration: 380,
    queueCount: 6,
    avgWaitTime: 48,
    status: 'busy',
    position: { x: 8, y: 0, z: -8 }
  },
  {
    id: 'w7',
    number: 7,
    businessType: 'tax',
    businessName: '税务',
    currentNumber: 'A00130',
    staffName: '孙办税',
    processDuration: 0,
    queueCount: 0,
    avgWaitTime: 0,
    status: 'offline',
    position: { x: 12, y: 0, z: -8 }
  }
]

export const mockPersonnel: Personnel[] = [
  {
    id: 'p1',
    name: '张税务',
    position: '税务窗口',
    role: 'window',
    location: { x: -12, y: 0, z: -9 },
    isRestricted: false,
    alertActive: false
  },
  {
    id: 'p2',
    name: '李税员',
    position: '税务窗口',
    role: 'window',
    location: { x: -8, y: 0, z: -9 },
    isRestricted: false,
    alertActive: false
  },
  {
    id: 'p3',
    name: '王社保',
    position: '社保窗口',
    role: 'window',
    location: { x: -4, y: 0, z: -9 },
    isRestricted: false,
    alertActive: false
  },
  {
    id: 'p4',
    name: '赵社保',
    position: '社保窗口',
    role: 'window',
    location: { x: 0, y: 0, z: -9 },
    isRestricted: false,
    alertActive: false
  },
  {
    id: 'p5',
    name: '刘工商',
    position: '工商窗口',
    role: 'window',
    location: { x: 4, y: 0, z: -9 },
    isRestricted: false,
    alertActive: false
  },
  {
    id: 'p6',
    name: '陈工商',
    position: '工商窗口',
    role: 'window',
    location: { x: 8, y: 0, z: -9 },
    isRestricted: false,
    alertActive: false
  },
  {
    id: 'p7',
    name: '周审批',
    position: '审批科长',
    role: 'chief',
    location: { x: -10, y: 0, z: 8 },
    isRestricted: false,
    alertActive: false
  },
  {
    id: 'p8',
    name: '吴领导',
    position: '中心主任',
    role: 'leader',
    location: { x: 10, y: 0, z: 10 },
    isRestricted: false,
    alertActive: false
  }
]

export const mockEnvironment: EnvironmentData = {
  temperature: 24.5,
  humidity: 45,
  co2: 650,
  fanStatus: 'off',
  thresholds: {
    temperature: 28,
    humidity: 60,
    co2: 1000
  }
}

export const mockUsers: User[] = [
  { id: 'u1', name: '张税务', role: 'window' },
  { id: 'u2', name: '李税员', role: 'window' },
  { id: 'u3', name: '王社保', role: 'window' },
  { id: 'u4', name: '赵社保', role: 'window' },
  { id: 'u5', name: '刘工商', role: 'window' },
  { id: 'u6', name: '陈工商', role: 'window' },
  { id: 'u7', name: '周审批', role: 'chief' },
  { id: 'u8', name: '吴领导', role: 'leader' }
]

export const generateDailyReport = (date: string): DailyReport => {
  const windows = mockWindows.map(w => ({
    windowId: w.id,
    windowNumber: w.number,
    businessType: w.businessName,
    count: Math.floor(Math.random() * 30) + 10,
    avgDuration: Math.floor(Math.random() * 300) + 120,
    satisfaction: Math.round((Math.random() * 20 + 80) * 10) / 10
  }))

  return {
    date,
    windows,
    totalCount: windows.reduce((sum, w) => sum + w.count, 0),
    avgDuration: Math.round(windows.reduce((sum, w) => sum + w.avgDuration, 0) / windows.length),
    satisfaction: Math.round(windows.reduce((sum, w) => sum + w.satisfaction, 0) / windows.length * 10) / 10
  }
}

export const generateApprovalProcess = (windowId: string, materialName: string): ApprovalProcess => {
  const now = new Date()
  const window = mockWindows.find(w => w.id === windowId)
  return {
    id: `ap_${Date.now()}`,
    materialId: `m_${Date.now()}`,
    materialName,
    submitter: '办事群众',
    windowId,
    steps: [
      {
        name: '窗口受理',
        status: 'completed',
        operator: window?.staffName || '窗口人员',
        time: new Date(now.getTime() - 1800000)
      },
      {
        name: '科室审核',
        status: 'processing',
        operator: '周审批',
        time: new Date(now.getTime() - 600000)
      },
      {
        name: '领导签批',
        status: 'pending',
        operator: '',
        time: new Date()
      }
    ],
    currentStep: 1,
    startTime: new Date(now.getTime() - 1800000)
  }
}

export const mockAreas: Area[] = [
  {
    id: 'area1',
    name: '窗口区',
    isRestricted: false,
    bounds: { minX: -15, maxX: 15, minZ: -10, maxZ: -5 }
  },
  {
    id: 'area2',
    name: '休息区',
    isRestricted: false,
    bounds: { minX: -15, maxX: -5, minZ: 0, maxZ: 8 }
  },
  {
    id: 'area3',
    name: '后台审批区',
    isRestricted: true,
    bounds: { minX: -15, maxX: 5, minZ: 5, maxZ: 15 }
  },
  {
    id: 'area4',
    name: '监控室',
    isRestricted: true,
    bounds: { minX: 5, maxX: 15, minZ: 5, maxZ: 15 }
  },
  {
    id: 'area5',
    name: '导办台',
    isRestricted: false,
    bounds: { minX: -3, maxX: 3, minZ: -2, maxZ: 2 }
  }
]
