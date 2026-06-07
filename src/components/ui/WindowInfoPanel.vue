<template>
  <div
    class="fixed right-4 top-24 w-80 rounded-2xl backdrop-blur-xl bg-blue-950/40 border border-blue-500/30 shadow-lg shadow-blue-500/20 overflow-hidden"
    :class="{ 'animate-pulse': !selectedWindow }"
  >
    <div class="p-5">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-blue-100 flex items-center gap-2">
          <LayoutDashboard class="w-5 h-5 text-blue-400" />
          窗口信息
        </h3>
        <span
          v-if="selectedWindow"
          class="px-3 py-1 rounded-full text-xs font-medium"
          :class="statusClass"
        >
          {{ getStatusText(selectedWindow.status) }}
        </span>
      </div>

      <div v-if="!selectedWindow" class="text-center py-12">
        <MousePointerClick class="w-12 h-12 text-blue-500/50 mx-auto mb-3" />
        <p class="text-blue-300/60 text-sm">点击场景中的窗口</p>
        <p class="text-blue-300/40 text-xs mt-1">查看详细信息</p>
      </div>

      <div v-else>
        <div class="bg-blue-900/30 rounded-xl p-4 mb-4 border border-blue-500/20">
          <div class="flex items-center gap-3 mb-3">
            <span class="text-3xl">{{ getBusinessIcon(selectedWindow.businessType) }}</span>
            <div>
              <div class="text-blue-100 font-medium">{{ selectedWindow.businessName }}</div>
              <div class="text-blue-400/70 text-sm">窗口 #{{ selectedWindow.number }}</div>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-300">{{ selectedWindow.currentNumber }}</div>
              <div class="text-xs text-blue-400/60 mt-1">当前叫号</div>
            </div>
            <div class="text-center">
              <div class="text-2xl font-bold text-blue-300">{{ formatDuration(selectedWindow.processDuration) }}</div>
              <div class="text-xs text-blue-400/60 mt-1">办理时长</div>
            </div>
          </div>
        </div>

        <div class="space-y-3 mb-4">
          <div class="flex items-center justify-between text-sm">
            <span class="text-blue-400/70 flex items-center gap-2">
              <User class="w-4 h-4" />
              工作人员
            </span>
            <span class="text-blue-100 font-medium">{{ selectedWindow.staffName }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-blue-400/70 flex items-center gap-2">
              <Users class="w-4 h-4" />
              排队人数
            </span>
            <span class="text-blue-100 font-medium">{{ selectedWindow.queueCount }} 人</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-blue-400/70 flex items-center gap-2">
              <Clock class="w-4 h-4" />
              平均等待
            </span>
            <span class="text-blue-100 font-medium">{{ selectedWindow.avgWaitTime }} 分钟</span>
          </div>
        </div>

        <div class="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-xl p-4 mb-4 border border-blue-500/20">
          <div class="flex items-center justify-between">
            <div>
              <div class="text-xs text-blue-400/70">总排队人数</div>
              <div class="text-2xl font-bold text-blue-200 mt-1">{{ totalQueue }}</div>
            </div>
            <div class="text-right">
              <div class="text-xs text-blue-400/70">办理中窗口</div>
              <div class="text-2xl font-bold text-blue-200 mt-1">{{ busyCount }}</div>
            </div>
          </div>
        </div>

        <div class="flex gap-2">
          <el-button
            type="primary"
            class="flex-1 bg-blue-600 hover:bg-blue-500 border-none text-white shadow-lg shadow-blue-500/30"
            @click="handleCallNext"
            :disabled="selectedWindow.queueCount === 0"
          >
            <BellRing class="w-4 h-4 mr-1" />
            叫下一号
          </el-button>
          <el-button
            type="success"
            class="flex-1 bg-emerald-600 hover:bg-emerald-500 border-none text-white shadow-lg shadow-emerald-500/30"
            @click="handleSubmitMaterial"
          >
            <FileCheck class="w-4 h-4 mr-1" />
            提交材料
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { LayoutDashboard, User, Users, Clock, BellRing, FileCheck, MousePointerClick } from 'lucide-vue-next'
import { ElMessage } from 'element-plus'
import { useWindow } from '../../composables/useWindow'
import { useMaterial } from '../../composables/useMaterial'

const { selectedWindow, totalQueue, busyCount, formatDuration, getBusinessIcon, getStatusText, getStatusColor, callNextNumber } = useWindow()
const { submitMaterial } = useMaterial()

const statusClass = computed(() => {
  if (!selectedWindow) return ''
  const colorMap: Record<string, string> = {
    idle: 'bg-green-500/20 text-green-400 border border-green-500/30',
    busy: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30',
    offline: 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
  return colorMap[selectedWindow.status] || colorMap.offline
})

const handleCallNext = () => {
  if (selectedWindow) {
    callNextNumber(selectedWindow.id)
    ElMessage.success(`已叫号: ${selectedWindow.currentNumber}`)
  }
}

const handleSubmitMaterial = () => {
  if (selectedWindow) {
    const result = submitMaterial(selectedWindow.id, `${selectedWindow.businessName}申请材料`)
    if (result) {
      ElMessage.success('材料提交成功，审批流程已启动')
    }
  }
}
</script>
