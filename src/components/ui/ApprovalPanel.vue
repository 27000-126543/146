<template>
  <div
    class="fixed left-4 top-24 w-96 rounded-2xl backdrop-blur-xl bg-blue-950/40 border border-blue-500/30 shadow-lg shadow-blue-500/20 overflow-hidden max-h-[calc(100vh-200px)] flex flex-col"
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
        class="bg-blue-900/30 rounded-xl p-4 border border-blue-500/20"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <FileText class="w-4 h-4 text-blue-400" />
            <span class="text-blue-100 font-medium text-sm">{{ process.materialName }}</span>
          </div>
          <span
            class="px-2 py-0.5 rounded text-xs font-medium"
            :class="process.currentStep >= 2 ? 'bg-green-500/20 text-green-400' : 'bg-blue-500/20 text-blue-400'"
          >
            {{ process.currentStep >= 2 ? '已完成' : '审批中' }}
          </span>
        </div>

        <div class="relative pl-6">
          <div class="absolute left-2 top-1 bottom-1 w-0.5 bg-blue-500/30"></div>
          
          <div
            v-for="(step, index) in process.steps"
            :key="step.name"
            class="relative mb-4 last:mb-0"
          >
            <div
              class="absolute -left-6 w-4 h-4 rounded-full border-2 flex items-center justify-center"
              :class="getStepDotClass(step.status)"
            >
              <Check v-if="step.status === 'completed'" class="w-2.5 h-2.5 text-white" />
              <div v-else-if="step.status === 'processing'" class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></div>
            </div>

            <div class="bg-blue-950/50 rounded-lg p-3 ml-2" :class="{ 'border border-blue-500/30': step.status === 'processing' }">
              <div class="flex items-center justify-between mb-1">
                <span class="text-sm font-medium" :class="getStepTextClass(step.status)">
                  {{ step.name }}
                </span>
                <span class="text-xs px-2 py-0.5 rounded" :class="getStepBadgeClass(step.status)">
                  {{ getStepStatus(step.status) }}
                </span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="text-blue-400/70 flex items-center gap-1">
                  <User class="w-3 h-3" />
                  {{ step.operator || '待分配' }}
                </span>
                <span class="text-blue-400/50 flex items-center gap-1">
                  <Clock class="w-3 h-3" />
                  {{ formatTime(step.time) }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <el-button
          v-if="process.currentStep < 2 && canAdvance(process)"
          type="primary"
          size="small"
          class="w-full mt-3 bg-blue-600 hover:bg-blue-500 border-none text-white"
          @click="handleAdvance(process.id)"
        >
          <ArrowRight class="w-3.5 h-3.5 mr-1" />
          推进到{{ process.steps[process.currentStep + 1]?.name || '下一步' }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ClipboardList, FileText, FileX, Check, Clock, User, ArrowRight } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { useMaterial } from '../../composables/useMaterial'
import { useAuth } from '../../composables/useAuth'
import type { ApprovalProcess } from '../../types'

const { approvalProcesses, processNextStep, getStepStatus, formatTime } = useMaterial()
const { hasPermission } = useAuth()

const getStepDotClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'bg-green-500 border-green-500',
    processing: 'bg-blue-900 border-blue-400',
    pending: 'bg-gray-800 border-gray-500'
  }
  return classes[status] || classes.pending
}

const getStepTextClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'text-green-400',
    processing: 'text-blue-300',
    pending: 'text-gray-500'
  }
  return classes[status] || classes.pending
}

const getStepBadgeClass = (status: string): string => {
  const classes: Record<string, string> = {
    completed: 'bg-green-500/20 text-green-400',
    processing: 'bg-blue-500/20 text-blue-400',
    pending: 'bg-gray-500/20 text-gray-400'
  }
  return classes[status] || classes.pending
}

const canAdvance = (process: ApprovalProcess): boolean => {
  const currentStepName = process.steps[process.currentStep]?.name
  if (currentStepName === '科室审核' && !hasPermission(['chief', 'leader'])) {
    return false
  }
  if (currentStepName === '领导签批' && !hasPermission('leader')) {
    return false
  }
  return true
}

const handleAdvance = (processId: string) => {
  processNextStep(processId)
  ElMessage.success('审批已推进到下一步')
}
</script>
