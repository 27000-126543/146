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
            <div class="flex items-center gap-2 mb-1">
              <span class="text-cyan-100 font-medium">
                {{ latestAssignment.businessName }} {{ latestAssignment.windowNumber }} 号窗口
              </span>
              <span
                class="px-1.5 py-0.5 rounded text-xs font-medium"
                :class="latestAssignment.assignType === 'manual' ? 'bg-orange-500/20 text-orange-400' : 'bg-cyan-500/20 text-cyan-400'"
              >
                {{ latestAssignment.assignType === 'manual' ? '人工改派' : '自动分配' }}
              </span>
            </div>
            <div v-if="latestAssignment.previousWindowNumber" class="text-orange-400/70 text-xs mb-1">
              ← 从 {{ latestAssignment.businessName }} {{ latestAssignment.previousWindowNumber }} 号窗口改派
            </div>
            <div class="text-cyan-400/70 text-sm">
              {{ formatAssignTime(latestAssignment.assignTime) }}
            </div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="text-center bg-cyan-900/30 rounded-lg p-2">
            <div class="text-xl font-bold text-cyan-300">{{ latestAssignment.queueCount }}</div>
            <div class="text-xs text-cyan-400/60 mt-1">前方排队</div>
          </div>
          <div class="text-center bg-cyan-900/30 rounded-lg p-2">
            <div class="text-xl font-bold text-cyan-300">{{ formatWaitTime(latestAssignment.estimatedWaitTime) }}</div>
            <div class="text-xs text-cyan-400/60 mt-1">预计等待</div>
          </div>
        </div>
        
        <!-- 人工改派按钮 -->
        <el-button
          v-if="canReassign"
          type="warning"
          size="small"
          class="w-full bg-orange-600/30 hover:bg-orange-600/50 border-orange-500/30 text-orange-300"
          @click="showReassignDialog"
        >
          <ArrowLeftRight class="w-4 h-4 mr-1" />
          人工改派
        </el-button>
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
            class="flex items-center gap-3 p-2 rounded-lg bg-slate-800/30 border transition-colors"
            :class="record.assignType === 'manual' ? 'border-orange-500/30 hover:bg-orange-900/20' : 'border-slate-700/30 hover:bg-slate-700/30'"
          >
            <div
              class="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
              :class="getAssignmentBgClass(record.businessType)"
            >
              {{ record.windowNumber }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="text-sm text-cyan-100 font-medium truncate">
                  {{ record.businessName }}
                </span>
                <span
                  v-if="record.assignType === 'manual'"
                  class="px-1 py-0.5 rounded text-xs font-medium bg-orange-500/20 text-orange-400"
                >
                  改派
                </span>
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

  <!-- 人工改派对话框 -->
  <el-dialog
    v-model="reassignDialogVisible"
    title="人工改派窗口"
    width="400px"
    :close-on-click-modal="false"
  >
    <div class="space-y-4">
      <div v-if="latestAssignment" class="bg-slate-800/50 rounded-lg p-4">
        <p class="text-sm text-slate-300 mb-2">当前分配：</p>
        <p class="text-lg font-medium text-cyan-300">
          {{ latestAssignment.businessName }} {{ latestAssignment.windowNumber }} 号窗口
        </p>
        <p class="text-sm text-slate-400 mt-1">
          排队 {{ latestAssignment.queueCount }} 人，预计等待 {{ formatWaitTime(latestAssignment.estimatedWaitTime) }}
        </p>
      </div>

      <div>
        <label class="block text-sm text-slate-300 mb-2">选择目标窗口：</label>
        <el-select
          v-model="selectedNewWindowId"
          class="w-full"
          placeholder="请选择目标窗口"
        >
          <el-option
            v-for="window in availableWindows"
            :key="window.id"
            :label="`${window.businessName} ${window.number}号窗口 (排队${window.queueCount}人)`"
            :value="window.id"
          />
        </el-select>
      </div>

      <div v-if="selectedNewWindowId" class="bg-orange-900/30 rounded-lg p-4 border border-orange-500/30">
        <p class="text-sm text-orange-300 mb-1">改派后预计：</p>
        <p class="text-sm text-orange-200">
          排队 {{ availableWindows.find(w => w.id === selectedNewWindowId)?.queueCount || 0 }} 人，
          预计等待 {{ formatWaitTime(availableWindows.find(w => w.id === selectedNewWindowId)?.queueCount || 0) }}
        </p>
      </div>
    </div>

    <template #footer>
      <el-button @click="reassignDialogVisible = false">取消</el-button>
      <el-button type="warning" @click="handleReassign">确认改派</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, ArrowLeftRight } from 'lucide-vue-next'
import { useWindow } from '@/composables/useWindow'
import { useAuth } from '@/composables/useAuth'
import type { BusinessType } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const {
  latestAssignment,
  assignmentRecords,
  formatWaitTime,
  getBusinessIcon,
  getAvailableWindowsForReassign,
  reassignWindow
} = useWindow()
const { hasPermission, currentUser } = useAuth()

const reassignDialogVisible = ref(false)
const selectedNewWindowId = ref('')

const canReassign = computed(() => {
  return hasPermission(['chief', 'leader']) && latestAssignment.value
})

const availableWindows = computed(() => {
  if (!latestAssignment.value) return []
  return getAvailableWindowsForReassign(
    latestAssignment.value.businessType,
    latestAssignment.value.windowId
  )
})

const showReassignDialog = () => {
  if (!canReassign.value || !latestAssignment.value) return
  
  if (availableWindows.value.length === 0) {
    ElMessage.warning('没有其他可用的同类型窗口')
    return
  }
  
  selectedNewWindowId.value = availableWindows.value[0]?.id || ''
  reassignDialogVisible.value = true
}

const handleReassign = async () => {
  if (!latestAssignment.value || !selectedNewWindowId.value) return
  
  const newWindow = availableWindows.value.find(w => w.id === selectedNewWindowId.value)
  if (!newWindow) return
  
  try {
    await ElMessageBox.confirm(
      `确认将${latestAssignment.value.businessName}业务从${latestAssignment.value.windowNumber}号窗口改派到${newWindow.number}号窗口？`,
      '人工改派确认',
      {
        confirmButtonText: '确认改派',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const result = reassignWindow(latestAssignment.value.id, selectedNewWindowId.value)
    if (result) {
      ElMessage.success(`已改派到${newWindow.number}号窗口，3D引导线已更新`)
      reassignDialogVisible.value = false
    } else {
      ElMessage.error('改派失败')
    }
  } catch {
    // 用户取消
  }
}

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
