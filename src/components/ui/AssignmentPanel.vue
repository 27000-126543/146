<template>
  <div
    class="fixed right-4 top-[420px] w-80 rounded-2xl backdrop-blur-xl bg-cyan-950/40 border border-cyan-500/30 shadow-lg shadow-cyan-500/20 overflow-hidden"
  >
    <div class="p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-cyan-100 flex items-center gap-2">
          <MapPin class="w-5 h-5 text-cyan-400" />
          分配结果
        </h3>
        <span
          v-if="latestAssignment"
          class="px-2 py-1 rounded-full text-xs font-medium bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
        >
          最新
        </span>
      </div>

      <!-- 最新分配结果 -->
      <div v-if="latestAssignment" class="bg-cyan-900/30 rounded-xl p-4 mb-4 border border-cyan-500/20">
        <div class="flex items-center gap-3 mb-3">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            :class="getAssignmentBgClass(latestAssignment.businessType)"
          >
            {{ getBusinessIcon(latestAssignment.businessType) }}
          </div>
          <div class="flex-1">
            <div class="text-cyan-100 font-medium">
              {{ latestAssignment.businessName }} {{ latestAssignment.windowNumber }} 号窗口
            </div>
            <div class="text-cyan-400/70 text-sm">
              {{ formatAssignTime(latestAssignment.assignTime) }}
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div class="text-center bg-cyan-900/30 rounded-lg p-2">
            <div class="text-xl font-bold text-cyan-300">{{ latestAssignment.queueCount }}</div>
            <div class="text-xs text-cyan-400/60 mt-1">前方排队</div>
          </div>
          <div class="text-center bg-cyan-900/30 rounded-lg p-2">
            <div class="text-xl font-bold text-cyan-300">{{ formatWaitTime(latestAssignment.estimatedWaitTime) }}</div>
            <div class="text-xs text-cyan-400/60 mt-1">预计等待</div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <MapPin class="w-10 h-10 text-cyan-500/50 mx-auto mb-3" />
        <p class="text-cyan-300/60 text-sm">暂无分配记录</p>
        <p class="text-cyan-300/40 text-xs mt-1">点击下方业务按钮开始分配</p>
      </div>

      <!-- 最近分配列表 -->
      <div v-if="assignmentRecords.length > 0">
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-medium text-cyan-400/70">最近分配</span>
          <span class="text-xs text-cyan-500/50">{{ Math.min(5, assignmentRecords.length) }} 条</span>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          <div
            v-for="(record, index) in recentAssignments"
            :key="record.id"
            class="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30 hover:bg-slate-700/30 transition-colors"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              :class="getAssignmentBgClass(record.businessType)"
            >
              {{ record.windowNumber }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="text-sm text-cyan-100 font-medium truncate">
                {{ record.businessName }}
              </div>
              <div class="text-xs text-cyan-400/60">
                排队{{ record.queueCount }}人 · {{ formatWaitTime(record.estimatedWaitTime) }}
              </div>
            </div>
            <div class="text-xs text-cyan-500/50">
              {{ formatAssignTimeShort(record.assignTime) }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { MapPin } from 'lucide-vue-next'
import { useWindow } from '@/composables/useWindow'
import type { BusinessType } from '@/types'

const {
  latestAssignment,
  assignmentRecords,
  formatWaitTime,
  getBusinessIcon
} = useWindow()

const recentAssignments = computed(() => {
  return assignmentRecords.value.slice(0, 5)
})

const getAssignmentBgClass = (type: BusinessType): string => {
  const classes: Record<BusinessType, string> = {
    tax: 'bg-blue-500/20 border border-blue-500/30',
    social: 'bg-emerald-500/20 border border-emerald-500/30',
    industry: 'bg-amber-500/20 border border-amber-500/30'
  }
  return classes[type]
}

const formatAssignTime = (date: Date): string => {
  return date.toLocaleString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

const formatAssignTimeShort = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  
  return date.toLocaleDateString('zh-CN', { month: '2-digit', day: '2-digit' })
}
</script>
