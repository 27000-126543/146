<template>
  <div
    class="fixed left-4 top-24 w-96 rounded-2xl backdrop-blur-xl bg-purple-950/40 border border-purple-500/30 shadow-lg shadow-purple-500/20 overflow-hidden max-h-[calc(100vh-200px)] flex flex-col"
  >
    <div class="p-5 border-b border-purple-500/20 flex items-center justify-between">
      <h3 class="text-lg font-bold text-purple-100 flex items-center gap-2">
        <ListTodo class="w-5 h-5 text-purple-400" />
        待办中心
      </h3>
      <div class="flex items-center gap-2">
        <span
          v-if="overdueTodos.length > 0"
          class="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30"
        >
          督办 {{ overdueTodos.length }}
        </span>
        <span
          v-if="warningTodos.length > 0"
          class="px-2 py-0.5 rounded-full text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
        >
          预警 {{ warningTodos.length }}
        </span>
        <span
          v-if="normalTodos.length > 0"
          class="px-2 py-0.5 rounded-full text-xs font-bold bg-green-500/20 text-green-400 border border-green-500/30"
        >
          正常 {{ normalTodos.length }}
        </span>
      </div>
    </div>

    <div class="flex border-b border-purple-500/20">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        class="flex-1 py-2 px-3 text-xs font-medium transition-all"
        :class="activeTab === tab.key 
          ? 'text-purple-300 border-b-2 border-purple-400 bg-purple-900/30' 
          : 'text-purple-400/60 hover:text-purple-300 hover:bg-purple-900/20'"
        @click="activeTab = tab.key"
      >
        <component :is="tab.icon" class="w-3.5 h-3.5 inline mr-1" />
        {{ tab.label }}
        <span v-if="tab.count > 0" class="ml-1">({{ tab.count }})</span>
      </button>
    </div>

    <div class="flex-1 overflow-y-auto p-5 space-y-3">
      <template v-if="activeTab === 'all'">
        <div v-if="displayedTodos.length === 0" class="text-center py-8">
          <CheckCircle2 class="w-12 h-12 text-green-500/50 mx-auto mb-3" />
          <p class="text-green-300/60 text-sm">暂无待办事项</p>
          <p class="text-green-300/40 text-xs mt-1">{{ getEmptyText() }}</p>
        </div>

        <div
          v-for="todo in displayedTodos"
          :key="todo.id"
          class="bg-purple-900/30 rounded-xl p-4 border transition-all cursor-pointer group"
          :class="getTodoCardClass(todo)"
          @click="handleTodoClick(todo)"
        >
          <div class="flex items-start gap-3">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
              :class="getTodoIconClass(todo.type)"
            >
              <component :is="getTodoIcon(todo.type)" class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-purple-100 font-medium text-sm">{{ todo.title }}</span>
                <span
                  v-if="todo.todoStatus === 'overdue'"
                  class="px-1.5 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse"
                >
                  已超时
                </span>
                <span
                  v-else-if="todo.todoStatus === 'warning'"
                  class="px-1.5 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                >
                  临超时
                </span>
                <span
                  v-else
                  class="px-1.5 py-0.5 rounded text-xs font-medium"
                  :class="getPriorityClass(todo.priority)"
                >
                  {{ getPriorityText(todo.priority) }}
                </span>
              </div>
              <p class="text-purple-400/70 text-xs mb-2">{{ todo.description }}</p>
              <div class="flex items-center gap-3 text-xs">
                <span class="text-purple-500/50 flex items-center gap-1">
                  <Clock class="w-3 h-3" />
                  {{ formatTime(todo.time) }}
                </span>
                <span v-if="todo.waitHours !== undefined" class="text-purple-500/50 flex items-center gap-1">
                  <Timer class="w-3 h-3" />
                  已等待 {{ formatWaitHours(todo.waitHours) }}
                </span>
                <span class="text-purple-400/50 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  <ArrowRight class="w-3 h-3" />
                  点击处理
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'overdue'">
        <div v-if="overdueTodos.length === 0" class="text-center py-8">
          <CheckCircle2 class="w-12 h-12 text-green-500/50 mx-auto mb-3" />
          <p class="text-green-300/60 text-sm">暂无超督办事项</p>
          <p class="text-green-300/40 text-xs mt-1">所有待办均在时限内</p>
        </div>

        <div
          v-for="todo in overdueTodos"
          :key="todo.id"
          class="bg-red-900/30 rounded-xl p-4 border border-red-500/30 transition-all cursor-pointer group animate-pulse"
          @click="handleTodoClick(todo)"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-red-500/20 text-red-400">
              <Siren class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-red-100 font-medium text-sm">{{ todo.title }}</span>
                <span class="px-1.5 py-0.5 rounded text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  督办
                </span>
              </div>
              <p class="text-red-400/70 text-xs mb-2">{{ todo.description }}</p>
              <div class="flex items-center gap-3 text-xs">
                <span class="text-red-500/50 flex items-center gap-1">
                  <Clock class="w-3 h-3" />
                  {{ formatTime(todo.time) }}
                </span>
                <span v-if="todo.waitHours !== undefined" class="text-red-400/70 flex items-center gap-1 font-medium">
                  <Timer class="w-3 h-3" />
                  超时 {{ formatWaitHours(todo.waitHours - WARNING_THRESHOLD_HOURS) }}
                </span>
                <span class="text-red-400/50 group-hover:text-red-300 transition-colors flex items-center gap-1">
                  <ArrowRight class="w-3 h-3" />
                  立即处理
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'warning'">
        <div v-if="warningTodos.length === 0" class="text-center py-8">
          <CheckCircle2 class="w-12 h-12 text-green-500/50 mx-auto mb-3" />
          <p class="text-green-300/60 text-sm">暂无预警事项</p>
          <p class="text-green-300/40 text-xs mt-1">所有待办均在正常时限内</p>
        </div>

        <div
          v-for="todo in warningTodos"
          :key="todo.id"
          class="bg-yellow-900/30 rounded-xl p-4 border border-yellow-500/30 transition-all cursor-pointer group"
          @click="handleTodoClick(todo)"
        >
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 bg-yellow-500/20 text-yellow-400">
              <AlertTriangle class="w-5 h-5" />
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-yellow-100 font-medium text-sm">{{ todo.title }}</span>
                <span class="px-1.5 py-0.5 rounded text-xs font-bold bg-yellow-500/20 text-yellow-400 border border-yellow-500/30">
                  预警
                </span>
              </div>
              <p class="text-yellow-400/70 text-xs mb-2">{{ todo.description }}</p>
              <div class="flex items-center gap-3 text-xs">
                <span class="text-yellow-500/50 flex items-center gap-1">
                  <Clock class="w-3 h-3" />
                  {{ formatTime(todo.time) }}
                </span>
                <span v-if="todo.waitHours !== undefined" class="text-yellow-400/70 flex items-center gap-1 font-medium">
                  <Timer class="w-3 h-3" />
                  {{ formatWaitHours(WARNING_THRESHOLD_HOURS - todo.waitHours) }}内将超时
                </span>
                <span class="text-yellow-400/50 group-hover:text-yellow-300 transition-colors flex items-center gap-1">
                  <ArrowRight class="w-3 h-3" />
                  尽快处理
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template v-else-if="activeTab === 'ranking'">
        <div v-if="userRole !== 'leader'" class="text-center py-8">
          <Lock class="w-12 h-12 text-purple-500/50 mx-auto mb-3" />
          <p class="text-purple-300/60 text-sm">仅中心领导可查看</p>
        </div>

        <template v-else>
          <div class="bg-purple-900/30 rounded-xl p-4 border border-purple-500/20 mb-4">
            <h4 class="text-sm font-medium text-purple-200 mb-3 flex items-center gap-2">
              <BarChart3 class="w-4 h-4 text-purple-400" />
              全局超时排行
            </h4>
            <div class="space-y-2">
              <div
                v-for="(item, index) in overdueRanking"
                :key="item.id"
                class="flex items-center gap-3 p-2 rounded-lg bg-purple-900/30 hover:bg-purple-800/30 transition-colors cursor-pointer"
                @click="handleTodoClick(item.todo)"
              >
                <div
                  class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  :class="index === 0 ? 'bg-red-500 text-white' : index === 1 ? 'bg-orange-500 text-white' : index === 2 ? 'bg-yellow-500 text-white' : 'bg-gray-600 text-white'"
                >
                  {{ index + 1 }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm text-purple-200 truncate">{{ item.title }}</div>
                  <div class="text-xs text-purple-400/60">超时 {{ formatWaitHours(item.overdueHours) }}</div>
                </div>
                <ArrowRight class="w-4 h-4 text-purple-400/50" />
              </div>
            </div>
          </div>

          <div class="bg-purple-900/30 rounded-xl p-4 border border-purple-500/20">
            <h4 class="text-sm font-medium text-purple-200 mb-3 flex items-center gap-2">
              <Layers class="w-4 h-4 text-purple-400" />
              各业务积压统计
            </h4>
            <div class="space-y-3">
              <div v-for="item in businessBacklog" :key="item.type" class="space-y-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-purple-300">{{ item.name }}</span>
                  <span
                    class="font-medium"
                    :class="item.count > 10 ? 'text-red-400' : item.count > 5 ? 'text-yellow-400' : 'text-green-400'"
                  >
                    {{ item.count }} 件
                  </span>
                </div>
                <div class="h-2 bg-purple-900/50 rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="item.count > 10 ? 'bg-red-500' : item.count > 5 ? 'bg-yellow-500' : 'bg-green-500'"
                    :style="{ width: `${Math.min(100, item.count * 5)}%` }"
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ListTodo,
  BellRing,
  FileCheck,
  FileSignature,
  AlertTriangle,
  Siren,
  CheckCircle2,
  Clock,
  ArrowRight,
  Timer,
  Lock,
  BarChart3,
  Layers,
  AlertCircle,
  TrendingUp
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useWindow } from '@/composables/useWindow'
import { useMaterial } from '@/composables/useMaterial'
import { useEmergency } from '@/composables/useEmergency'
import type { TodoItem, TodoType } from '@/types'
import { ElMessage } from 'element-plus'

const WARNING_THRESHOLD_HOURS = 2
const OVERDUE_THRESHOLD_HOURS = 4

const { userRole, currentUser } = useAuth()
const { windows, selectWindow } = useWindow()
const { approvalProcesses } = useMaterial()
const { emergencyActive } = useEmergency()

const activeTab = ref<'all' | 'overdue' | 'warning' | 'ranking'>('all')

const getTodoStatus = (waitHours: number): 'normal' | 'warning' | 'overdue' => {
  if (waitHours >= OVERDUE_THRESHOLD_HOURS) return 'overdue'
  if (waitHours >= WARNING_THRESHOLD_HOURS) return 'warning'
  return 'normal'
}

const windowTodos = computed<TodoItem[]>(() => {
  if (userRole.value !== 'window') return []
  if (!currentUser.value) return []
  
  const todos: TodoItem[] = []
  const staffName = currentUser.value.name
  
  const myWindow = windows.value.find(w => w.staffName === staffName)
  if (myWindow) {
    if (myWindow.queueCount > 0) {
      const waitHours = myWindow.queueCount * 0.13
      todos.push({
        id: `todo_call_${myWindow.id}`,
        type: 'call_next',
        title: `${myWindow.queueCount}人等待叫号`,
        description: `${myWindow.businessName} ${myWindow.number}号窗口有${myWindow.queueCount}人排队等待`,
        priority: myWindow.queueCount > 5 ? 'high' : 'medium',
        targetId: myWindow.id,
        targetType: 'window',
        time: new Date(),
        todoStatus: getTodoStatus(waitHours),
        waitHours
      })
    }
    
    if (myWindow.status === 'idle' && myWindow.queueCount === 0) {
      todos.push({
        id: `todo_idle_${myWindow.id}`,
        type: 'submit_material',
        title: '窗口空闲中',
        description: `${myWindow.businessName} ${myWindow.number}号窗口当前空闲，可随时受理业务`,
        priority: 'low',
        targetId: myWindow.id,
        targetType: 'window',
        time: new Date(),
        todoStatus: 'normal',
        waitHours: 0
      })
    }
  }
  
  return todos
})

const chiefTodos = computed<TodoItem[]>(() => {
  if (userRole.value !== 'chief') return []
  
  const todos: TodoItem[] = []
  
  const pendingReviews = approvalProcesses.value.filter(
    p => p.currentStep === 1 && p.status === 'processing'
  )
  
  pendingReviews.forEach(process => {
    const waitTime = Date.now() - new Date(process.startTime).getTime()
    const waitHours = waitTime / 3600000
    
    todos.push({
      id: `todo_review_${process.id}`,
      type: 'review',
      title: `待审核：${process.materialName}`,
      description: `${process.windowNumber}号窗口提交的${process.materialName}等待科室审核`,
      priority: waitHours > 2 ? 'high' : waitHours > 1 ? 'medium' : 'low',
      targetId: process.id,
      targetType: 'approval',
      time: process.startTime,
      todoStatus: getTodoStatus(waitHours),
      waitHours
    })
  })
  
  const taxQueue = windows.value.filter(w => w.businessType === 'tax').reduce((sum, w) => sum + w.queueCount, 0)
  const socialQueue = windows.value.filter(w => w.businessType === 'social').reduce((sum, w) => sum + w.queueCount, 0)
  const industryQueue = windows.value.filter(w => w.businessType === 'industry').reduce((sum, w) => sum + w.queueCount, 0)
  
  if (taxQueue > 15) {
    todos.push({
      id: 'todo_warning_tax',
      type: 'warning',
      title: '税务业务积压预警',
      description: `税务窗口当前排队${taxQueue}人，超过预警阈值15人`,
      priority: 'high',
      targetId: 'tax',
      targetType: 'environment',
      time: new Date(),
      todoStatus: taxQueue > 20 ? 'overdue' : 'warning',
      waitHours: taxQueue * 0.13
    })
  }
  if (socialQueue > 15) {
    todos.push({
      id: 'todo_warning_social',
      type: 'warning',
      title: '社保业务积压预警',
      description: `社保窗口当前排队${socialQueue}人，超过预警阈值15人`,
      priority: 'high',
      targetId: 'social',
      targetType: 'environment',
      time: new Date(),
      todoStatus: socialQueue > 20 ? 'overdue' : 'warning',
      waitHours: socialQueue * 0.13
    })
  }
  if (industryQueue > 15) {
    todos.push({
      id: 'todo_warning_industry',
      type: 'warning',
      title: '工商业务积压预警',
      description: `工商窗口当前排队${industryQueue}人，超过预警阈值15人`,
      priority: 'high',
      targetId: 'industry',
      targetType: 'environment',
      time: new Date(),
      todoStatus: industryQueue > 20 ? 'overdue' : 'warning',
      waitHours: industryQueue * 0.13
    })
  }
  
  return todos.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const statusOrder = { overdue: 0, warning: 1, normal: 2 }
    const statusDiff = statusOrder[a.todoStatus || 'normal'] - statusOrder[b.todoStatus || 'normal']
    if (statusDiff !== 0) return statusDiff
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

const leaderTodos = computed<TodoItem[]>(() => {
  if (userRole.value !== 'leader') return []
  
  const todos: TodoItem[] = []
  
  if (emergencyActive.value) {
    todos.push({
      id: 'todo_emergency',
      type: 'emergency',
      title: '应急疏散进行中',
      description: '应急疏散系统已启动，请关注人员撤离情况',
      priority: 'high',
      targetId: 'emergency',
      targetType: 'environment',
      time: new Date(),
      todoStatus: 'overdue',
      waitHours: 999
    })
  }
  
  const pendingSigns = approvalProcesses.value.filter(
    p => p.currentStep === 2 && p.status === 'processing'
  )
  
  pendingSigns.forEach(process => {
    const waitTime = Date.now() - new Date(process.startTime).getTime()
    const waitHours = waitTime / 3600000
    
    todos.push({
      id: `todo_sign_${process.id}`,
      type: 'sign',
      title: `待签批：${process.materialName}`,
      description: `${process.windowNumber}号窗口提交的${process.materialName}等待领导签批`,
      priority: 'high',
      targetId: process.id,
      targetType: 'approval',
      time: process.steps[2].time || new Date(),
      todoStatus: getTodoStatus(waitHours),
      waitHours
    })
  })
  
  const totalQueue = windows.value.reduce((sum, w) => sum + w.queueCount, 0)
  
  if (totalQueue > 30) {
    todos.push({
      id: 'todo_global_queue',
      type: 'warning',
      title: '全局排队积压',
      description: `当前全局排队${totalQueue}人，请关注窗口调度`,
      priority: 'medium',
      targetId: 'global',
      targetType: 'environment',
      time: new Date(),
      todoStatus: totalQueue > 50 ? 'overdue' : 'warning',
      waitHours: totalQueue * 0.13
    })
  }
  
  const pendingLong = approvalProcesses.value.filter(p => {
    const waitTime = Date.now() - new Date(p.startTime).getTime()
    return waitTime > 86400000 && p.status === 'processing'
  })
  
  if (pendingLong.length > 0) {
    todos.push({
      id: 'todo_timeout',
      type: 'warning',
      title: `${pendingLong.length}件审批超时`,
      description: `有${pendingLong.length}件审批等待时间超过24小时`,
      priority: 'high',
      targetId: 'timeout',
      targetType: 'approval',
      time: new Date(),
      todoStatus: 'overdue',
      waitHours: 25
    })
  }
  
  return todos.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    const statusOrder = { overdue: 0, warning: 1, normal: 2 }
    const statusDiff = statusOrder[a.todoStatus || 'normal'] - statusOrder[b.todoStatus || 'normal']
    if (statusDiff !== 0) return statusDiff
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

const pendingTodos = computed(() => {
  if (userRole.value === 'window') return windowTodos.value
  if (userRole.value === 'chief') return chiefTodos.value
  if (userRole.value === 'leader') return leaderTodos.value
  return []
})

const normalTodos = computed(() => pendingTodos.value.filter(t => t.todoStatus === 'normal' || !t.todoStatus))
const warningTodos = computed(() => pendingTodos.value.filter(t => t.todoStatus === 'warning'))
const overdueTodos = computed(() => pendingTodos.value.filter(t => t.todoStatus === 'overdue'))

const displayedTodos = computed(() => {
  if (activeTab.value === 'all') return pendingTodos.value
  if (activeTab.value === 'overdue') return overdueTodos.value
  if (activeTab.value === 'warning') return warningTodos.value
  return []
})

const tabs = computed<{ key: 'all' | 'overdue' | 'warning' | 'ranking'; label: string; icon: any; count: number }[]>(() => [
  { key: 'all', label: '全部', icon: ListTodo, count: pendingTodos.value.length },
  { key: 'overdue', label: '督办', icon: Siren, count: overdueTodos.value.length },
  { key: 'warning', label: '预警', icon: AlertTriangle, count: warningTodos.value.length },
  { key: 'ranking', label: '排行', icon: TrendingUp, count: 0 }
])

const overdueRanking = computed(() => {
  return [...overdueTodos.value]
    .filter(t => t.waitHours !== undefined)
    .map(t => ({
      id: t.id,
      title: t.title,
      overdueHours: (t.waitHours || 0) - OVERDUE_THRESHOLD_HOURS,
      todo: t
    }))
    .sort((a, b) => b.overdueHours - a.overdueHours)
    .slice(0, 5)
})

const businessBacklog = computed(() => {
  const taxCount = approvalProcesses.value.filter(p => p.status === 'processing').length +
                   windows.value.filter(w => w.businessType === 'tax').reduce((sum, w) => sum + w.queueCount, 0)
  const socialCount = approvalProcesses.value.filter(p => p.status === 'processing').length +
                      windows.value.filter(w => w.businessType === 'social').reduce((sum, w) => sum + w.queueCount, 0)
  const industryCount = approvalProcesses.value.filter(p => p.status === 'processing').length +
                        windows.value.filter(w => w.businessType === 'industry').reduce((sum, w) => sum + w.queueCount, 0)
  
  return [
    { type: 'tax', name: '税务业务', count: taxCount },
    { type: 'social', name: '社保业务', count: socialCount },
    { type: 'industry', name: '工商业务', count: industryCount }
  ]
})

const getTodoIcon = (type: TodoType) => {
  const icons: Record<TodoType, any> = {
    call_next: BellRing,
    submit_material: FileCheck,
    review: FileCheck,
    sign: FileSignature,
    warning: AlertTriangle,
    emergency: Siren
  }
  return icons[type]
}

const getTodoIconClass = (type: TodoType): string => {
  const classes: Record<TodoType, string> = {
    call_next: 'bg-blue-500/20 text-blue-400',
    submit_material: 'bg-emerald-500/20 text-emerald-400',
    review: 'bg-yellow-500/20 text-yellow-400',
    sign: 'bg-purple-500/20 text-purple-400',
    warning: 'bg-orange-500/20 text-orange-400',
    emergency: 'bg-red-500/20 text-red-400'
  }
  return classes[type]
}

const getTodoCardClass = (todo: TodoItem): string => {
  if (todo.todoStatus === 'overdue') return 'border-red-500/30 bg-red-900/20'
  if (todo.todoStatus === 'warning') return 'border-yellow-500/30 bg-yellow-900/20'
  if (todo.priority === 'high') return 'border-orange-500/30 bg-orange-900/20'
  return 'border-purple-500/20 hover:bg-purple-800/30'
}

const getPriorityClass = (priority: string): string => {
  const classes: Record<string, string> = {
    high: 'bg-red-500/20 text-red-400',
    medium: 'bg-yellow-500/20 text-yellow-400',
    low: 'bg-green-500/20 text-green-400'
  }
  return classes[priority] || classes.low
}

const getPriorityText = (priority: string): string => {
  const texts: Record<string, string> = {
    high: '紧急',
    medium: '一般',
    low: '普通'
  }
  return texts[priority] || '普通'
}

const formatTime = (date: Date): string => {
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatWaitHours = (hours: number): string => {
  if (hours < 1) return `${Math.floor(hours * 60)}分钟`
  if (hours < 24) return `${Math.floor(hours)}小时`
  const days = Math.floor(hours / 24)
  const remainingHours = Math.floor(hours % 24)
  if (remainingHours === 0) return `${days}天`
  return `${days}天${remainingHours}小时`
}

const getEmptyText = (): string => {
  if (userRole.value === 'window') return '当前工作状态良好'
  if (userRole.value === 'chief') return '审批工作已全部完成'
  if (userRole.value === 'leader') return '全局运行状态良好'
  return '暂无待办'
}

const handleTodoClick = (todo: TodoItem) => {
  if (todo.targetType === 'window') {
    const window = windows.value.find(w => w.id === todo.targetId)
    if (window) {
      selectWindow(window)
      ElMessage.success(`已定位到${window.businessName} ${window.number}号窗口`)
    }
  } else if (todo.targetType === 'approval') {
    ElMessage.info(`请在审批进度面板中处理：${todo.title}`)
  } else if (todo.targetType === 'environment') {
    if (todo.targetId === 'emergency') {
      ElMessage.info('请在底部操作栏处理应急疏散')
    } else {
      ElMessage.info(`请关注${todo.title}`)
    }
  }
}
</script>
