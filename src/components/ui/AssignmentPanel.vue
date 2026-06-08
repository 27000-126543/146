<template>
  <div
    class="w-full rounded-2xl backdrop-blur-xl bg-cyan-950/40 border border-cyan-500/30 shadow-lg shadow-cyan-500/20 overflow-hidden flex flex-col"
  >
    <div class="p-5 border-b border-cyan-500/20 flex items-center justify-between">
      <h3 class="text-lg font-bold text-cyan-100 flex items-center gap-2">
        <MapPin class="w-5 h-5 text-cyan-400" />
        窗口分配
      </h3>
      <span class="text-xs font-medium text-cyan-400/70">
        最新
      </span>
    </div>

    <div class="flex-1 overflow-y-auto p-5 space-y-4">
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
        
        <div v-if="latestAssignment.assignType === 'manual'" class="bg-orange-900/20 rounded-lg p-3 mb-3 border border-orange-500/20">
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="text-orange-400/60">改派原因：</div>
            <div class="text-orange-300">{{ getReassignReasonText(latestAssignment.reassignReason) }}</div>
            <div class="text-orange-400/60">操作人：</div>
            <div class="text-orange-300">{{ latestAssignment.operatorName || '未知' }}</div>
            <div class="text-orange-400/60">角色：</div>
            <div class="text-orange-300">{{ getRoleText(latestAssignment.operatorRole) }}</div>
            <div v-if="latestAssignment.reassignRemark" class="col-span-2 mt-1">
              <span class="text-orange-400/60">备注：</span>
              <span class="text-orange-300">{{ latestAssignment.reassignRemark }}</span>
            </div>
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
        <p class="text-cyan-300/40 text-xs mt-1">在底部选择业务类型后自动分配</p>
      </div>

      <!-- 最近分配列表 -->
      <div>
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-medium text-cyan-400/70">最近分配</span>
          <span class="text-xs text-cyan-500/50">{{ Math.min(5, assignmentRecords.length) }} 条</span>
        </div>
        <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
          <div
            v-for="(record, index) in recentAssignments"
            :key="record.id"
            class="rounded-lg bg-slate-800/30 border transition-all overflow-hidden"
            :class="record.assignType === 'manual' ? 'border-orange-500/30 hover:bg-orange-900/20' : 'border-slate-700/30 hover:bg-slate-700/30'"
          >
            <div 
              class="flex items-center gap-3 p-2 cursor-pointer"
              @click="toggleExpand(record.id)"
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
                  <ChevronDown 
                    v-if="record.assignType === 'manual'"
                    class="w-3 h-3 text-orange-400/50 transition-transform"
                    :class="{ 'rotate-180': expandedRecordId === record.id }"
                  />
                </div>
                <div class="text-xs text-cyan-400/60">
                  排队{{ record.queueCount }}人 · {{ formatWaitTime(record.estimatedWaitTime) }}
                </div>
              </div>
              <div class="text-xs text-cyan-500/50">
                {{ formatAssignTimeShort(record.assignTime) }}
              </div>
            </div>
            
            <div v-if="expandedRecordId === record.id && record.assignType === 'manual'" class="px-2 pb-2">
              <div class="bg-orange-900/20 rounded-lg p-2 border border-orange-500/20 text-xs space-y-1">
                <div class="flex items-center gap-2 text-orange-300/70">
                  <ArrowLeftRight class="w-3 h-3" />
                  <span>{{ record.businessName }} {{ record.previousWindowNumber }}号 → {{ record.windowNumber }}号</span>
                </div>
                <div class="grid grid-cols-2 gap-1">
                  <span class="text-orange-400/60">原因：</span>
                  <span class="text-orange-300">{{ getReassignReasonText(record.reassignReason) }}</span>
                  <span class="text-orange-400/60">操作人：</span>
                  <span class="text-orange-300">{{ record.operatorName || '未知' }}</span>
                  <span class="text-orange-400/60">角色：</span>
                  <span class="text-orange-300">{{ getRoleText(record.operatorRole) }}</span>
                  <span class="text-orange-400/60">时间：</span>
                  <span class="text-orange-300">{{ formatAssignTimeFull(record.assignTime) }}</span>
                </div>
                <div v-if="record.reassignRemark" class="mt-1">
                  <span class="text-orange-400/60">备注：</span>
                  <span class="text-orange-300">{{ record.reassignRemark }}</span>
                </div>
              </div>
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
    width="450px"
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
            :label="`${window.businessName} ${window.number}号窗口 (排队${window.queueCount}人，预计${formatWaitTime(calculateWaitTime(window.queueCount))})`"
            :value="window.id"
          />
        </el-select>
      </div>

      <div v-if="selectedNewWindowId" class="bg-orange-900/30 rounded-lg p-4 border border-orange-500/30">
        <p class="text-sm text-orange-300 mb-1">改派后预计：</p>
        <p class="text-sm text-orange-200">
          排队 {{ targetWindow?.queueCount || 0 }} 人，
          预计等待 {{ formatWaitTime(calculateWaitTime(targetWindow?.queueCount || 0)) }}
        </p>
      </div>

      <div>
        <label class="block text-sm text-slate-300 mb-2">改派原因：</label>
        <el-select
          v-model="reassignReason"
          class="w-full"
          placeholder="请选择改派原因"
        >
          <el-option label="窗口繁忙" value="window_busy" />
          <el-option label="人员不在岗" value="staff_absent" />
          <el-option label="业务专长匹配" value="business_specialty" />
          <el-option label="其他原因" value="other" />
        </el-select>
      </div>

      <div>
        <label class="block text-sm text-slate-300 mb-2">备注说明（可选）：</label>
        <el-input
          v-model="reassignRemark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注说明"
          maxlength="100"
          show-word-limit
        />
      </div>
    </div>

    <template #footer>
      <el-button @click="reassignDialogVisible = false">取消</el-button>
      <el-button type="warning" @click="handleReassign" :disabled="!canSubmitReassign">
        确认改派
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { MapPin, ArrowLeftRight, ChevronDown } from 'lucide-vue-next'
import { useWindow } from '@/composables/useWindow'
import { useAuth } from '@/composables/useAuth'
import type { BusinessType, ReassignReason, UserRole } from '@/types'
import { ElMessage, ElMessageBox } from 'element-plus'

const {
  latestAssignment,
  assignmentRecords,
  formatWaitTime,
  getBusinessIcon,
  getAvailableWindowsForReassign,
  reassignWindow,
  calculateWaitTime
} = useWindow()
const { hasPermission, currentUser } = useAuth()

const reassignDialogVisible = ref(false)
const selectedNewWindowId = ref('')
const reassignReason = ref<ReassignReason | ''>('')
const reassignRemark = ref('')
const expandedRecordId = ref<string | null>(null)

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

const targetWindow = computed(() => {
  if (!selectedNewWindowId.value) return null
  return availableWindows.value.find(w => w.id === selectedNewWindowId.value)
})

const canSubmitReassign = computed(() => {
  return selectedNewWindowId.value && reassignReason.value
})

const recentAssignments = computed(() => {
  return assignmentRecords.value.slice(0, 5)
})

const toggleExpand = (recordId: string) => {
  if (expandedRecordId.value === recordId) {
    expandedRecordId.value = null
  } else {
    expandedRecordId.value = recordId
  }
}

const showReassignDialog = () => {
  if (!canReassign.value || !latestAssignment.value) return
  
  if (availableWindows.value.length === 0) {
    ElMessage.warning('没有其他可用的同类型窗口')
    return
  }
  
  selectedNewWindowId.value = availableWindows.value[0]?.id || ''
  reassignReason.value = ''
  reassignRemark.value = ''
  reassignDialogVisible.value = true
}

const getReassignReasonText = (reason?: ReassignReason): string => {
  const texts: Record<ReassignReason, string> = {
    window_busy: '窗口繁忙',
    staff_absent: '人员不在岗',
    business_specialty: '业务专长匹配',
    other: '其他原因'
  }
  return reason ? texts[reason] : '未填写'
}

const getRoleText = (role?: UserRole): string => {
  const texts: Record<UserRole, string> = {
    window: '窗口人员',
    chief: '审批科长',
    leader: '中心领导'
  }
  return role ? texts[role] : '未知'
}

const getAssignmentBgClass = (type: BusinessType): string => {
  const classes: Record<BusinessType, string> = {
    tax: 'bg-cyan-600/30 text-cyan-300',
    social: 'bg-emerald-600/30 text-emerald-300',
    industry: 'bg-amber-600/30 text-amber-300'
  }
  return classes[type] || classes.tax
}

const formatAssignTime = (date: Date): string => {
  if (!date) return '--:--'
  const d = new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) return '刚刚分配'
  if (minutes < 60) return `${minutes}分钟前分配`
  
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前分配`
  
  return d.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

const formatAssignTimeShort = (date: Date): string => {
  if (!date) return '--:--'
  const d = new Date(date)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const formatAssignTimeFull = (date: Date): string => {
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

const handleReassign = async () => {
  if (!latestAssignment.value || !selectedNewWindowId.value || !reassignReason.value) return
  
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
    
    const operatorName = currentUser.value?.name || ''
    const operatorRole = currentUser.value?.role || 'window'
    
    const result = reassignWindow(
      latestAssignment.value.id,
      selectedNewWindowId.value,
      reassignReason.value,
      reassignRemark.value,
      operatorName,
      operatorRole
    )
    
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
</script>
