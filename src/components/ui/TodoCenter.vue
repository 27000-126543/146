<template>
  <div
    class="fixed left-4 top-24 w-96 rounded-2xl backdrop-blur-xl bg-purple-950/40 border border-purple-500/30 shadow-lg shadow-purple-500/20 overflow-hidden max-h-[calc(100vh-200px)] flex flex-col"
  >
    <div class="p-5 border-b border-purple-500/20 flex items-center justify-between">
      <h3 class="text-lg font-bold text-purple-100 flex items-center gap-2">
        <ListTodo class="w-5 h-5 text-purple-400" />
        待办中心
      </h3>
      <span
        v-if="pendingTodos.length > 0"
        class="px-2 py-0.5 rounded-full text-xs font-bold bg-red-500/20 text-red-400 border border-red-500/30"
      >
        {{ pendingTodos.length }}
      </span>
    </div>

    <div class="flex-1 overflow-y-auto p-5 space-y-3">
      <!-- 窗口人员待办 -->
      <template v-if="userRole === 'window'">
        <div v-if="windowTodos.length === 0" class="text-center py-8">
          <CheckCircle2 class="w-12 h-12 text-green-500/50 mx-auto mb-3" />
          <p class="text-green-300/60 text-sm">暂无待办事项</p>
          <p class="text-green-300/40 text-xs mt-1">当前工作状态良好</p>
        </div>

        <div
          v-for="todo in windowTodos"
          :key="todo.id"
          class="bg-purple-900/30 rounded-xl p-4 border border-purple-500/20 hover:bg-purple-800/30 transition-all cursor-pointer group"
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
                <span class="text-purple-400/50 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  <ArrowRight class="w-3 h-3" />
                  点击处理
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 科长待办 -->
      <template v-else-if="userRole === 'chief'">
        <div v-if="chiefTodos.length === 0" class="text-center py-8">
          <CheckCircle2 class="w-12 h-12 text-green-500/50 mx-auto mb-3" />
          <p class="text-green-300/60 text-sm">暂无待办事项</p>
          <p class="text-green-300/40 text-xs mt-1">审批工作已全部完成</p>
        </div>

        <div
          v-for="todo in chiefTodos"
          :key="todo.id"
          class="bg-purple-900/30 rounded-xl p-4 border transition-all cursor-pointer group"
          :class="todo.priority === 'high' ? 'border-red-500/30 bg-red-900/20' : 'border-purple-500/20 hover:bg-purple-800/30'"
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
                <span class="text-purple-400/50 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  <ArrowRight class="w-3 h-3" />
                  点击处理
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- 领导待办 -->
      <template v-else-if="userRole === 'leader'">
        <div v-if="leaderTodos.length === 0" class="text-center py-8">
          <CheckCircle2 class="w-12 h-12 text-green-500/50 mx-auto mb-3" />
          <p class="text-green-300/60 text-sm">暂无待办事项</p>
          <p class="text-green-300/40 text-xs mt-1">全局运行状态良好</p>
        </div>

        <div
          v-for="todo in leaderTodos"
          :key="todo.id"
          class="bg-purple-900/30 rounded-xl p-4 border transition-all cursor-pointer group"
          :class="todo.type === 'emergency' ? 'border-red-500/30 bg-red-900/20 animate-pulse' : todo.priority === 'high' ? 'border-orange-500/30 bg-orange-900/20' : 'border-purple-500/20 hover:bg-purple-800/30'"
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
                <span class="text-purple-400/50 group-hover:text-purple-300 transition-colors flex items-center gap-1">
                  <ArrowRight class="w-3 h-3" />
                  点击处理
                </span>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  ListTodo,
  BellRing,
  FileCheck,
  FileSignature,
  AlertTriangle,
  Siren,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-vue-next'
import { useAuth } from '@/composables/useAuth'
import { useWindow } from '@/composables/useWindow'
import { useMaterial } from '@/composables/useMaterial'
import { useEmergency } from '@/composables/useEmergency'
import type { TodoItem, TodoType, ApprovalRecord } from '@/types'
import { ElMessage } from 'element-plus'

const { userRole, currentUser } = useAuth()
const { windows, selectWindow } = useWindow()
const { approvalProcesses } = useMaterial()
const { emergencyActive } = useEmergency()

const windowTodos = computed<TodoItem[]>(() => {
  if (userRole.value !== 'window') return []
  if (!currentUser.value) return []
  
  const todos: TodoItem[] = []
  const staffName = currentUser.value.name
  
  const myWindow = windows.value.find(w => w.staffName === staffName)
  if (myWindow) {
    if (myWindow.queueCount > 0) {
      todos.push({
        id: `todo_call_${myWindow.id}`,
        type: 'call_next',
        title: `${myWindow.queueCount}人等待叫号`,
        description: `${myWindow.businessName} ${myWindow.number}号窗口有${myWindow.queueCount}人排队等待`,
        priority: myWindow.queueCount > 5 ? 'high' : 'medium',
        targetId: myWindow.id,
        targetType: 'window',
        time: new Date()
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
        time: new Date()
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
    const waitHours = Math.floor(waitTime / 3600000)
    
    todos.push({
      id: `todo_review_${process.id}`,
      type: 'review',
      title: `待审核：${process.materialName}`,
      description: `${process.windowNumber}号窗口提交的${process.materialName}等待科室审核`,
      priority: waitHours > 2 ? 'high' : waitHours > 1 ? 'medium' : 'low',
      targetId: process.id,
      targetType: 'approval',
      time: process.startTime
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
      time: new Date()
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
      time: new Date()
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
      time: new Date()
    })
  }
  
  return todos.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
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
      time: new Date()
    })
  }
  
  const pendingSigns = approvalProcesses.value.filter(
    p => p.currentStep === 2 && p.status === 'processing'
  )
  
  pendingSigns.forEach(process => {
    todos.push({
      id: `todo_sign_${process.id}`,
      type: 'sign',
      title: `待签批：${process.materialName}`,
      description: `${process.windowNumber}号窗口提交的${process.materialName}等待领导签批`,
      priority: 'high',
      targetId: process.id,
      targetType: 'approval',
      time: process.steps[2].time || new Date()
    })
  })
  
  const totalQueue = windows.value.reduce((sum, w) => sum + w.queueCount, 0)
  const completedCount = approvalProcesses.value.filter(p => p.status === 'completed').length
  const processingCount = approvalProcesses.value.filter(p => p.status === 'processing').length
  
  if (totalQueue > 30) {
    todos.push({
      id: 'todo_global_queue',
      type: 'warning',
      title: '全局排队积压',
      description: `当前全局排队${totalQueue}人，请关注窗口调度`,
      priority: 'medium',
      targetId: 'global',
      targetType: 'environment',
      time: new Date()
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
      time: new Date()
    })
  }
  
  return todos.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    return priorityOrder[a.priority] - priorityOrder[b.priority]
  })
})

const pendingTodos = computed(() => {
  if (userRole.value === 'window') return windowTodos.value
  if (userRole.value === 'chief') return chiefTodos.value
  if (userRole.value === 'leader') return leaderTodos.value
  return []
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
