<template>
  <div
    class="w-full rounded-2xl backdrop-blur-xl bg-blue-950/40 border border-blue-500/30 shadow-lg shadow-blue-500/20 overflow-hidden max-h-[calc(100vh-480px)] flex flex-col"
  >
    <div class="p-5 border-b border-blue-500/20">
      <h3 class="text-lg font-bold text-blue-100 flex items-center gap-2">
        <ClipboardList class="w-5 h-5 text-blue-400" />
        审批进度
      </h3>
    </div>

    <div class="flex-1 overflow-y-auto p-5 space-y-4">
      <div v-if="approvalProcesses.length === 0" class="text-center py-12">
        <FileX class="w-12 h-12 text-blue-500/50 mx-auto mb-3" />
        <p class="text-blue-300/60 text-sm">暂无审批流程</p>
        <p class="text-blue-300/40 text-xs mt-1">提交材料后将自动创建审批</p>
      </div>

      <div
        v-for="process in approvalProcesses"
        :key="process.id"
        class="bg-blue-900/30 rounded-xl p-4 border transition-all"
        :class="process.status === 'completed' ? 'border-green-500/30' : 'border-blue-500/20'"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-2">
            <FileText class="w-4 h-4 text-blue-400" />
            <span class="text-blue-100 font-medium text-sm">{{ process.materialName }}</span>
          </div>
          <span
            class="px-2 py-0.5 rounded text-xs font-medium"
            :class="process.status === 'completed' ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'"
          >
            {{ process.status === 'completed' ? '已办结' : '审批中' }}
          </span>
        </div>

        <div class="flex items-center gap-4 mb-3 text-xs">
          <div class="flex items-center gap-1 text-blue-400/70">
            <Building2 class="w-3.5 h-3.5" />
            <span>{{ process.windowNumber }}号窗口</span>
          </div>
          <div class="flex items-center gap-1 text-blue-400/70">
            <User class="w-3.5 h-3.5" />
            <span>{{ process.submitter }}</span>
          </div>
          <div v-if="process.status === 'completed' && process.completedTime" class="flex items-center gap-1 text-green-400/70">
            <CheckCircle class="w-3.5 h-3.5" />
            <span>{{ formatTime(process.completedTime) }} 办结</span>
          </div>
        </div>

        <div class="relative pl-6">
          <div class="absolute left-2 top-1 bottom-1 w-0.5 bg-blue-500/30"></div>
          
          <div
            v-for="(step, index) in process.steps"
            :key="step.name"
            class="relative mb-4 last:mb-0"
          >
            <div
              class="absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center z-10"
              :class="getStepDotClass(step.status)"
            >
              <Check v-if="step.status === 'completed'" class="w-2.5 h-2.5 text-white" />
              <XCircle v-else-if="step.status === 'rejected'" class="w-2.5 h-2.5 text-red-400" />
              <div v-else-if="step.status === 'processing'" class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            </div>

            <div class="bg-blue-950/50 rounded-lg p-3 ml-2" :class="{ 'border border-blue-500/30': step.status === 'processing', 'border border-red-500/30': step.status === 'rejected' }">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-sm font-medium" :class="getStepTextClass(step.status)">
                    {{ step.name }}
                  </span>
                  <span class="text-xs px-2 py-0.5 rounded" :class="getStepBadgeClass(step.status)">
                    {{ getStepStatus(step.status) }}
                  </span>
                </div>
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-blue-400/70 flex items-center gap-1">
                    <User class="w-3 h-3" />
                    {{ step.operator || '待分配' }}
                  </span>
                  <span class="text-blue-400/50 flex items-center gap-1">
                    <Clock class="w-3 h-3" />
                    {{ formatFullTime(step.time) }}
                  </span>
                </div>
                <div v-if="step.duration !== undefined && (step.status === 'completed' || step.status === 'rejected')" class="text-xs mb-1">
                  <span :class="step.status === 'rejected' ? 'text-red-400/70' : 'text-green-400/70'" class="flex items-center gap-1">
                    <Timer class="w-3 h-3" />
                    耗时 {{ formatDuration(step.duration) }}
                  </span>
                </div>
                <div v-if="step.opinion" class="text-xs mt-1 p-2 bg-blue-900/30 rounded">
                  <span class="text-blue-300/60">处理意见：</span>
                  <span class="text-blue-200">{{ step.opinion }}</span>
                </div>
                <div v-if="step.rejectReason" class="text-xs mt-1 p-2 bg-red-900/30 rounded">
                  <span class="text-red-300/60">退回原因：</span>
                  <span class="text-red-200">{{ step.rejectReason }}</span>
                </div>
            </div>
          </div>

          <div v-if="process.rejectHistory && process.rejectHistory.length > 0" class="relative mt-2">
            <div
              v-for="(record, index) in process.rejectHistory"
              :key="index"
              class="relative mb-2 pl-6"
            >
              <div class="absolute -left-4 w-3 h-3 rounded-full bg-red-500/50 border border-red-400 flex items-center justify-center">
                <ArrowLeft class="w-2 h-2 text-white" />
              </div>
              <div class="bg-red-900/20 rounded-lg p-2 ml-2 border border-red-500/20">
                <div class="flex items-center justify-between text-xs mb-1">
                  <span class="text-red-300">
                    {{ record.fromStep }} → {{ record.toStep }}
                  </span>
                  <span class="text-red-400/50">{{ formatFullTime(record.time) }}</span>
                </div>
                <div class="text-xs text-red-400/70">
                  <span class="text-red-300/60">操作人：</span>{{ record.operator }}
                </div>
                <div v-if="record.reason" class="text-xs text-red-400/70 mt-1">
                  <span class="text-red-300/60">原因：</span>{{ record.reason }}
                </div>
                <div v-if="record.opinion" class="text-xs text-red-400/70 mt-1">
                  <span class="text-red-300/60">意见：</span>{{ record.opinion }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="canAdvance(process) || canReject(process)" class="mt-3 space-y-2">
          <div v-if="expandedProcessId === process.id" class="space-y-2">
            <el-input
              v-model="opinionInput"
              type="textarea"
              :rows="2"
              placeholder="请输入处理意见（可选）"
              class="text-xs"
            />
            
            <div v-if="canReject(process)" class="space-y-2">
              <el-select
                v-model="rejectReasonInput"
                placeholder="请选择退回原因"
                class="w-full text-xs"
              >
                <el-option label="材料不齐全" value="材料不齐全" />
                <el-option label="信息有误" value="信息有误" />
                <el-option label="不符合规定" value="不符合规定" />
                <el-option label="需补充证明" value="需补充证明" />
                <el-option label="其他原因" value="其他原因" />
              </el-select>
            </div>

            <div class="flex gap-2">
              <el-button
                v-if="canAdvance(process)"
                type="primary"
                size="small"
                class="flex-1 bg-blue-600 hover:bg-blue-500 border-none text-white"
                @click="handleAdvance(process.id)"
              >
                <ArrowRight class="w-3.5 h-3.5 mr-1" />
                {{ getAdvanceButtonText(process) }}
              </el-button>
              
              <el-button
                v-if="canReject(process)"
                type="danger"
                size="small"
                class="flex-1 bg-red-600 hover:bg-red-500 border-none text-white"
                :disabled="!rejectReasonInput"
                @click="handleReject(process.id)"
              >
                <XCircle class="w-3.5 h-3.5 mr-1" />
                {{ getRejectButtonText(process) }}
              </el-button>
            </div>
            
            <el-button
              type="info"
              size="small"
              class="w-full bg-gray-600 hover:bg-gray-500 border-none text-white"
              @click="cancelExpand(process.id)"
            >
              取消
            </el-button>
          </div>
          
          <div v-else class="flex gap-2">
            <el-button
              v-if="canAdvance(process)"
              type="primary"
              size="small"
              class="flex-1 bg-blue-600 hover:bg-blue-500 border-none text-white"
              @click="expandProcess(process.id)"
            >
              <ArrowRight class="w-3.5 h-3.5 mr-1" />
              {{ getAdvanceButtonText(process) }}
            </el-button>
            
            <el-button
              v-if="canReject(process)"
              type="danger"
              size="small"
              class="flex-1 bg-red-600 hover:bg-red-500 border-none text-white"
              @click="expandProcess(process.id)"
            >
              <XCircle class="w-3.5 h-3.5 mr-1" />
              {{ getRejectButtonText(process) }}
            </el-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ClipboardList, FileText, FileX, Check, Clock, User, ArrowRight, Building2, CheckCircle, Timer, XCircle, ArrowLeft } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { useMaterial } from '../../composables/useMaterial'
import { useAuth } from '../../composables/useAuth'
import type { ApprovalRecord } from '../../types'

const { approvalProcesses, processNextStep, rejectStep, getStepStatus } = useMaterial()
const { hasPermission, currentUser, userRole } = useAuth()

const expandedProcessId = ref<string | null>(null)
const opinionInput = ref('')
const rejectReasonInput = ref('')

const expandProcess = (processId: string) => {
  expandedProcessId.value = processId
  opinionInput.value = ''
  rejectReasonInput.value = ''
}

const cancelExpand = (processId: string) => {
  expandedProcessId.value = null
  opinionInput.value = ''
  rejectReasonInput.value = ''
}

const getStepDotClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'bg-green-500 border-green-500',
    processing: 'bg-blue-900 border-blue-400',
    pending: 'bg-gray-800 border-gray-500',
    rejected: 'bg-red-900 border-red-400'
  }
  return classes[status] || classes.pending
}

const getStepTextClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'text-green-400',
    processing: 'text-blue-300',
    pending: 'text-gray-500',
    rejected: 'text-red-400'
  }
  return classes[status] || classes.pending
}

const getStepBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    processing: 'bg-blue-500/20 text-blue-400',
    pending: 'bg-gray-500/20 text-gray-400',
    rejected: 'bg-red-500/20 text-red-400'
  }
  return classes[status] || classes.pending
}

const formatFullTime = (date: Date): string => {
  if (!date) return '--:--'
  const d = new Date(date)
  return d.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatTime = (date: Date): string => {
  if (!date) return '--:--'
  const d = new Date(date)
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

const formatDuration = (minutes: number): string => {
  if (minutes === undefined || minutes === null) return '--'
  if (minutes < 1) return '< 1分钟'
  if (minutes < 60) return `${minutes}分钟`
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  if (mins === 0) return `${hours}小时`
  return `${hours}小时${mins}分钟`
}

const canAdvance = (process: ApprovalRecord): boolean => {
  if (process.status === 'completed') return false
  const currentStepName = process.steps[process.currentStep]?.name
  
  if (currentStepName === '科室审核') {
    return hasPermission(['chief', 'leader'])
  }
  if (currentStepName === '领导签批') {
    return hasPermission('leader')
  }
  return false
}

const canReject = (process: ApprovalRecord): boolean => {
  if (process.status === 'completed') return false
  const currentStepName = process.steps[process.currentStep]?.name
  
  if (currentStepName === '科室审核') {
    return hasPermission(['chief', 'leader'])
  }
  if (currentStepName === '领导签批') {
    return hasPermission('leader')
  }
  return false
}

const getAdvanceButtonText = (process: ApprovalRecord): string => {
  const currentStepName = process.steps[process.currentStep]?.name
  if (currentStepName === '科室审核') {
    return '送领导签批'
  }
  if (currentStepName === '领导签批') {
    return '签批通过'
  }
  return '推进到下一步'
}

const getRejectButtonText = (process: ApprovalRecord): string => {
  const currentStepName = process.steps[process.currentStep]?.name
  if (currentStepName === '科室审核') {
    return '退回窗口补材料'
  }
  if (currentStepName === '领导签批') {
    return '退回科室复核'
  }
  return '退回'
}

const handleAdvance = (processId: string) => {
  const operatorName = currentUser.value?.name || ''
  const opinion = opinionInput.value.trim()
  
  processNextStep(processId, operatorName, opinion)
  
  if (userRole.value === 'leader') {
    ElMessage.success('已签批通过，审批已完成')
  } else {
    ElMessage.success('已送领导签批')
  }
  
  cancelExpand(processId)
}

const handleReject = (processId: string) => {
  if (!rejectReasonInput.value) {
    ElMessage.warning('请选择退回原因')
    return
  }
  
  const operatorName = currentUser.value?.name || ''
  const reason = rejectReasonInput.value
  const opinion = opinionInput.value.trim()
  
  rejectStep(processId, operatorName, reason, opinion)
  ElMessage.success('已退回，待重新处理')
  cancelExpand(processId)
}
</script>
