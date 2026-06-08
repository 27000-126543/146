<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useWindow } from '@/composables/useWindow'
import { useEmergency } from '@/composables/useEmergency'
import { useAuth } from '@/composables/useAuth'
import { useEnvironment } from '@/composables/useEnvironment'
import type { BusinessType } from '@/types'
import {
  Building2,
  LogOut,
  Users,
  SquareTerminal,
  ThermometerSun,
  Droplets,
  Wind,
  AlertTriangle,
  Trash2,
  Siren,
  Landmark,
  HeartPulse,
  Briefcase
} from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'

const {
  totalQueue,
  busyCount,
  assignAndGuide,
  clearGuideLines,
  guideLines
} = useWindow()

const { emergencyActive, startEmergency, stopEmergency } = useEmergency()
const { currentUser, isLoggedIn, userRole, logout, hasPermission } = useAuth()
const {
  environment,
  hasWarning,
  getTemperatureStatus,
  getHumidityStatus,
  getCo2Status
} = useEnvironment()

const currentTime = ref('')
const currentDate = ref('')

let timer: number | null = null

const updateTime = () => {
  const now = new Date()
  currentTime.value = now.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    weekday: 'long'
  })
}

const handleBusinessAssign = (type: BusinessType) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('请先登录')
    return
  }
  const window = assignAndGuide(type)
  if (window) {
    const typeNames: Record<BusinessType, string> = {
      tax: '税务',
      social: '社保',
      industry: '工商'
    }
    ElMessage.success(`已分配至 ${typeNames[type]} ${window.number} 号窗口`)
  } else {
    ElMessage.error('暂无可用窗口')
  }
}

const handleEmergency = async () => {
  if (!hasPermission('leader')) {
    ElMessage.error('只有中心领导有权限操作')
    return
  }
  if (emergencyActive) {
    try {
      await ElMessageBox.confirm('确认解除应急疏散状态？', '提示', {
        confirmButtonText: '确认解除',
        cancelButtonText: '取消',
        type: 'warning'
      })
      stopEmergency()
      ElMessage.success('应急疏散状态已解除')
    } catch {
      // 用户取消
    }
  } else {
    startEmergency()
    ElMessage({
      message: '应急疏散系统已启动！请所有人员按照指引撤离！',
      type: 'error',
      duration: 5000,
      showClose: true
    })
  }
}

const handleClearGuideLines = () => {
  if (guideLines.value.length === 0) {
    ElMessage.info('当前没有引导线可清除')
    return
  }
  clearGuideLines()
  ElMessage.success('已清除所有引导线')
}

const handleLogout = () => {
  ElMessageBox.confirm('确认退出登录？', '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => {
      logout()
      ElMessage.success('已退出登录')
    })
    .catch(() => {
      // 用户取消
    })
}

const getRoleText = computed(() => {
  const roles: Record<string, string> = {
    window: '窗口工作人员',
    chief: '科长',
    leader: '中心领导'
  }
  return currentUser.value ? roles[currentUser.value.role] || '访客' : '未登录'
})

const activeGuideCount = computed(() => {
  return guideLines.value.filter(g => g.active).length
})

onMounted(() => {
  updateTime()
  timer = window.setInterval(updateTime, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <div
    class="fixed bottom-0 left-0 right-0 h-20 z-50"
    :class="{ 'backdrop-blur-xl': !emergencyActive }"
  >
    <div
      class="h-full px-6 flex items-center justify-between border-t transition-all duration-300"
      :class="[
        emergencyActive
          ? 'bg-red-900/80 border-red-500/50 animate-pulse'
          : 'bg-slate-900/70 border-slate-700/50'
      ]"
    >
      <!-- 左侧：Logo和用户信息 -->
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
          <div
            class="w-12 h-12 rounded-xl flex items-center justify-center"
            :class="
              emergencyActive
                ? 'bg-red-500/30 border border-red-400/50'
                : 'bg-gradient-to-br from-blue-500/30 to-cyan-500/30 border border-blue-400/30'
            "
          >
            <Building2
              class="w-7 h-7"
              :class="emergencyActive ? 'text-red-300' : 'text-blue-300'"
            />
          </div>
          <div>
            <h1
              class="text-lg font-bold"
              :class="emergencyActive ? 'text-red-100' : 'text-white'"
            >
              3D智慧政务服务中心
            </h1>
            <p class="text-xs" :class="emergencyActive ? 'text-red-300' : 'text-slate-400'">
              可视化调度平台
            </p>
          </div>
        </div>

        <div
          v-if="isLoggedIn && currentUser"
          class="flex items-center gap-3 pl-6 border-l"
          :class="emergencyActive ? 'border-red-500/30' : 'border-slate-700'"
        >
          <div
            class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold"
            :class="
              emergencyActive
                ? 'bg-red-500/30 text-red-200 border border-red-400/50'
                : 'bg-slate-700/50 text-slate-200 border border-slate-600/50'
            "
          >
            {{ currentUser.name.charAt(0) }}
          </div>
          <div>
            <p
              class="text-sm font-medium"
              :class="emergencyActive ? 'text-red-100' : 'text-white'"
            >
              {{ currentUser.name }}
            </p>
            <p
              class="text-xs"
              :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
            >
              {{ getRoleText }}
            </p>
          </div>
          <button
            class="ml-2 p-2 rounded-lg transition-colors"
            :class="
              emergencyActive
                ? 'hover:bg-red-500/30 text-red-300'
                : 'hover:bg-slate-700/50 text-slate-400 hover:text-white'
            "
            @click="handleLogout"
            title="退出登录"
          >
            <LogOut class="w-4 h-4" />
          </button>
        </div>
      </div>

      <!-- 中间：快速操作区（按角色显示） -->
      <div class="flex items-center gap-4">
        <!-- 窗口人员操作区 -->
        <template v-if="userRole === 'window'">
          <div
            class="flex items-center gap-2 px-4 py-2 rounded-xl"
            :class="
              emergencyActive
                ? 'bg-red-800/40 border border-red-500/30'
                : 'bg-slate-800/50 border border-slate-700/50'
            "
          >
            <span
              class="text-xs font-medium mr-1"
              :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
            >
              窗口操作
            </span>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :class="[
                emergencyActive
                  ? 'bg-red-600/50 text-red-100 border border-red-400/30'
                  : 'bg-blue-600/30 text-blue-200 hover:bg-blue-500/40 border border-blue-400/30 hover:scale-105'
              ]"
              :disabled="emergencyActive"
              @click="handleBusinessAssign('tax')"
            >
              <Landmark class="w-4 h-4" />
              税务
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :class="[
                emergencyActive
                  ? 'bg-red-600/50 text-red-100 border border-red-400/30'
                  : 'bg-emerald-600/30 text-emerald-200 hover:bg-emerald-500/40 border border-emerald-400/30 hover:scale-105'
              ]"
              :disabled="emergencyActive"
              @click="handleBusinessAssign('social')"
            >
              <HeartPulse class="w-4 h-4" />
              社保
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :class="[
                emergencyActive
                  ? 'bg-red-600/50 text-red-100 border border-red-400/30'
                  : 'bg-amber-600/30 text-amber-200 hover:bg-amber-500/40 border border-amber-400/30 hover:scale-105'
              ]"
              :disabled="emergencyActive"
              @click="handleBusinessAssign('industry')"
            >
              <Briefcase class="w-4 h-4" />
              工商
            </button>
          </div>

          <!-- 清除引导线 -->
          <button
            class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            :class="[
              emergencyActive
                ? 'bg-red-800/40 text-red-300 border border-red-500/30'
                : activeGuideCount > 0
                  ? 'bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700/50 hover:text-white'
                  : 'bg-slate-800/30 text-slate-500 border border-slate-700/30 cursor-not-allowed'
            ]"
            :disabled="emergencyActive || activeGuideCount === 0"
            @click="handleClearGuideLines"
          >
            <Trash2 class="w-4 h-4" />
            清除引导
            <span
              v-if="activeGuideCount > 0"
              class="px-1.5 py-0.5 rounded-full text-xs"
              :class="
                emergencyActive
                  ? 'bg-red-500/50 text-red-100'
                  : 'bg-cyan-500/30 text-cyan-200'
              "
            >
              {{ activeGuideCount }}
            </span>
          </button>
        </template>

        <!-- 科长操作区 -->
        <template v-else-if="userRole === 'chief'">
          <div
            class="flex items-center gap-2 px-4 py-2 rounded-xl"
            :class="
              emergencyActive
                ? 'bg-red-800/40 border border-red-500/30'
                : 'bg-slate-800/50 border border-slate-700/50'
            "
          >
            <span
              class="text-xs font-medium mr-1"
              :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
            >
              全局分配
            </span>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :class="[
                emergencyActive
                  ? 'bg-red-600/50 text-red-100 border border-red-400/30'
                  : 'bg-blue-600/30 text-blue-200 hover:bg-blue-500/40 border border-blue-400/30 hover:scale-105'
              ]"
              :disabled="emergencyActive"
              @click="handleBusinessAssign('tax')"
            >
              <Landmark class="w-4 h-4" />
              税务
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :class="[
                emergencyActive
                  ? 'bg-red-600/50 text-red-100 border border-red-400/30'
                  : 'bg-emerald-600/30 text-emerald-200 hover:bg-emerald-500/40 border border-emerald-400/30 hover:scale-105'
              ]"
              :disabled="emergencyActive"
              @click="handleBusinessAssign('social')"
            >
              <HeartPulse class="w-4 h-4" />
              社保
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :class="[
                emergencyActive
                  ? 'bg-red-600/50 text-red-100 border border-red-400/30'
                  : 'bg-amber-600/30 text-amber-200 hover:bg-amber-500/40 border border-amber-400/30 hover:scale-105'
              ]"
              :disabled="emergencyActive"
              @click="handleBusinessAssign('industry')"
            >
              <Briefcase class="w-4 h-4" />
              工商
            </button>
          </div>

          <!-- 清除引导线 -->
          <button
            class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            :class="[
              emergencyActive
                ? 'bg-red-800/40 text-red-300 border border-red-500/30'
                : activeGuideCount > 0
                  ? 'bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700/50 hover:text-white'
                  : 'bg-slate-800/30 text-slate-500 border border-slate-700/30 cursor-not-allowed'
            ]"
            :disabled="emergencyActive || activeGuideCount === 0"
            @click="handleClearGuideLines"
          >
            <Trash2 class="w-4 h-4" />
            清除引导
            <span
              v-if="activeGuideCount > 0"
              class="px-1.5 py-0.5 rounded-full text-xs"
              :class="
                emergencyActive
                  ? 'bg-red-500/50 text-red-100'
                  : 'bg-cyan-500/30 text-cyan-200'
              "
            >
              {{ activeGuideCount }}
            </span>
          </button>
        </template>

        <!-- 领导操作区 -->
        <template v-else-if="userRole === 'leader'">
          <div
            class="flex items-center gap-2 px-4 py-2 rounded-xl"
            :class="
              emergencyActive
                ? 'bg-red-800/40 border border-red-500/30'
                : 'bg-slate-800/50 border border-slate-700/50'
            "
          >
            <span
              class="text-xs font-medium mr-1"
              :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
            >
              全局调度
            </span>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :class="[
                emergencyActive
                  ? 'bg-red-600/50 text-red-100 border border-red-400/30'
                  : 'bg-blue-600/30 text-blue-200 hover:bg-blue-500/40 border border-blue-400/30 hover:scale-105'
              ]"
              :disabled="emergencyActive"
              @click="handleBusinessAssign('tax')"
            >
              <Landmark class="w-4 h-4" />
              税务
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :class="[
                emergencyActive
                  ? 'bg-red-600/50 text-red-100 border border-red-400/30'
                  : 'bg-emerald-600/30 text-emerald-200 hover:bg-emerald-500/40 border border-emerald-400/30 hover:scale-105'
              ]"
              :disabled="emergencyActive"
              @click="handleBusinessAssign('social')"
            >
              <HeartPulse class="w-4 h-4" />
              社保
            </button>
            <button
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5"
              :class="[
                emergencyActive
                  ? 'bg-red-600/50 text-red-100 border border-red-400/30'
                  : 'bg-amber-600/30 text-amber-200 hover:bg-amber-500/40 border border-amber-400/30 hover:scale-105'
              ]"
              :disabled="emergencyActive"
              @click="handleBusinessAssign('industry')"
            >
              <Briefcase class="w-4 h-4" />
              工商
            </button>
          </div>

          <!-- 应急疏散 -->
          <button
            class="px-5 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 relative overflow-hidden"
            :class="[
              emergencyActive
                ? 'bg-red-600 text-white border-2 border-red-300 shadow-lg shadow-red-500/50'
                : 'bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-red-900/30 hover:text-red-300 hover:border-red-500/50'
            ]"
            @click="handleEmergency"
          >
            <Siren
              class="w-5 h-5"
              :class="{ 'animate-bounce': emergencyActive }"
            />
            {{ emergencyActive ? '疏散中 - 点击解除' : '应急疏散' }}
            <div
              v-if="emergencyActive"
              class="absolute inset-0 bg-white/20 animate-ping"
            />
          </button>

          <!-- 清除引导线 -->
          <button
            class="px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2"
            :class="[
              emergencyActive
                ? 'bg-red-800/40 text-red-300 border border-red-500/30'
                : activeGuideCount > 0
                  ? 'bg-slate-800/50 text-slate-300 border border-slate-600/50 hover:bg-slate-700/50 hover:text-white'
                  : 'bg-slate-800/30 text-slate-500 border border-slate-700/30 cursor-not-allowed'
            ]"
            :disabled="emergencyActive || activeGuideCount === 0"
            @click="handleClearGuideLines"
          >
            <Trash2 class="w-4 h-4" />
            清除引导
            <span
              v-if="activeGuideCount > 0"
              class="px-1.5 py-0.5 rounded-full text-xs"
              :class="
                emergencyActive
                  ? 'bg-red-500/50 text-red-100'
                  : 'bg-cyan-500/30 text-cyan-200'
              "
            >
              {{ activeGuideCount }}
            </span>
          </button>
        </template>
      </div>

      <!-- 右侧：实时数据和时钟 -->
      <div class="flex items-center gap-6">
        <!-- 数据统计 -->
        <div
          class="flex items-center gap-5 px-4 py-2 rounded-xl"
          :class="
            emergencyActive
              ? 'bg-red-800/40 border border-red-500/30'
              : 'bg-slate-800/50 border border-slate-700/50'
          "
        >
          <div class="flex items-center gap-2">
            <Users
              class="w-5 h-5"
              :class="emergencyActive ? 'text-red-300' : 'text-cyan-400'"
            />
            <div>
              <p
                class="text-xl font-bold leading-none"
                :class="emergencyActive ? 'text-red-100' : 'text-white'"
              >
                {{ totalQueue }}
              </p>
              <p
                class="text-xs"
                :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
              >
                排队人数
              </p>
            </div>
          </div>

          <div
            class="w-px h-8"
            :class="emergencyActive ? 'bg-red-500/30' : 'bg-slate-700'"
          />

          <div class="flex items-center gap-2">
            <SquareTerminal
              class="w-5 h-5"
              :class="emergencyActive ? 'text-red-300' : 'text-emerald-400'"
            />
            <div>
              <p
                class="text-xl font-bold leading-none"
                :class="emergencyActive ? 'text-red-100' : 'text-white'"
              >
                {{ busyCount }}
              </p>
              <p
                class="text-xs"
                :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
              >
                办理中
              </p>
            </div>
          </div>

          <div
            class="w-px h-8"
            :class="emergencyActive ? 'bg-red-500/30' : 'bg-slate-700'"
          />

          <!-- 环境状态 -->
          <div class="flex items-center gap-2">
            <div class="flex flex-col gap-0.5">
              <div class="flex items-center gap-1">
                <ThermometerSun
                  class="w-3.5 h-3.5"
                  :class="[
                    emergencyActive
                      ? 'text-red-300'
                      : getTemperatureStatus().color
                  ]"
                />
                <span
                  class="text-xs"
                  :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
                >
                  {{ environment.temperature }}°
                </span>
              </div>
              <div class="flex items-center gap-1">
                <Droplets
                  class="w-3.5 h-3.5"
                  :class="[
                    emergencyActive ? 'text-red-300' : getHumidityStatus().color
                  ]"
                />
                <span
                  class="text-xs"
                  :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
                >
                  {{ environment.humidity }}%
                </span>
              </div>
            </div>
            <div class="flex flex-col gap-0.5">
              <div class="flex items-center gap-1">
                <Wind
                  class="w-3.5 h-3.5"
                  :class="[
                    emergencyActive ? 'text-red-300' : getCo2Status().color
                  ]"
                />
                <span
                  class="text-xs"
                  :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
                >
                  {{ environment.co2 }}
                </span>
              </div>
              <div class="flex items-center gap-1">
                <AlertTriangle
                  v-if="hasWarning() && !emergencyActive"
                  class="w-3.5 h-3.5 text-yellow-400 animate-pulse"
                />
                <span
                  v-else
                  class="w-3.5 h-3.5"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- 时钟 -->
        <div
          class="text-right px-4 py-2 rounded-xl"
          :class="
            emergencyActive
              ? 'bg-red-800/40 border border-red-500/30'
              : 'bg-slate-800/50 border border-slate-700/50'
          "
        >
          <p
            class="text-2xl font-mono font-bold tracking-wider"
            :class="emergencyActive ? 'text-red-100' : 'text-white'"
          >
            {{ currentTime }}
          </p>
          <p
            class="text-xs"
            :class="emergencyActive ? 'text-red-300' : 'text-slate-400'"
          >
            {{ currentDate }}
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
