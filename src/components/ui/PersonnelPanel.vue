<template>
  <div
    class="fixed right-4 bottom-4 w-80 rounded-2xl backdrop-blur-xl bg-blue-950/40 border border-blue-500/30 shadow-lg shadow-blue-500/20 overflow-hidden max-h-[400px] flex flex-col"
  >
    <div class="p-4 border-b border-blue-500/20">
      <div class="flex items-center justify-between mb-3">
        <h3 class="text-lg font-bold text-blue-100 flex items-center gap-2">
          <Users class="w-5 h-5 text-blue-400" />
          人员状态
        </h3>
        <div class="flex gap-3">
          <div class="text-center">
            <div class="text-xl font-bold text-blue-300">{{ onDutyCount }}</div>
            <div class="text-xs text-blue-400/60">在岗</div>
          </div>
          <div class="text-center">
            <div
              class="text-xl font-bold"
              :class="activeAlerts.length > 0 ? 'text-red-400 animate-pulse' : 'text-blue-300'"
            >
              {{ activeAlerts.length }}
            </div>
            <div class="text-xs text-blue-400/60">报警</div>
          </div>
        </div>
      </div>

      <div class="flex gap-4 text-xs">
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-blue-400"></div>
          <span class="text-blue-400/70">窗口人员</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-purple-400"></div>
          <span class="text-blue-400/70">审批科长</span>
        </div>
        <div class="flex items-center gap-1">
          <div class="w-3 h-3 rounded-full bg-yellow-400"></div>
          <span class="text-blue-400/70">中心领导</span>
        </div>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-2">
      <div
        v-for="person in personnel"
        :key="person.id"
        class="rounded-xl p-3 transition-all duration-300"
        :class="[
          person.alertActive
            ? 'bg-red-500/20 border border-red-500/40 shadow-lg shadow-red-500/20'
            : person.isRestricted
              ? 'bg-yellow-500/20 border border-yellow-500/30'
              : 'bg-blue-900/30 border border-blue-500/20 hover:border-blue-500/40'
        ]"
      >
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
              :class="getRoleBgClass(person.role)"
            >
              {{ person.name.charAt(0) }}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="text-blue-100 font-medium text-sm">{{ person.name }}</span>
                <AlertCircle
                  v-if="person.alertActive"
                  class="w-4 h-4 text-red-400 animate-pulse"
                />
                <Ban
                  v-else-if="person.isRestricted && !person.alertActive"
                  class="w-4 h-4 text-yellow-400"
                />
              </div>
              <div class="text-xs text-blue-400/60">{{ person.position }}</div>
            </div>
          </div>
          <div class="text-right">
            <div
              class="text-xs px-2 py-0.5 rounded-full mb-1"
              :class="getRoleBadgeClass(person.role)"
            >
              {{ getRoleName(person.role) }}
            </div>
            <div class="text-xs text-blue-400/70 flex items-center justify-end gap-1">
              <MapPin class="w-3 h-3" />
              {{ getCurrentArea(person.location) }}
            </div>
          </div>
        </div>

        <div
          v-if="person.alertActive"
          class="mt-2 text-xs text-red-300 flex items-center gap-1 bg-red-500/10 rounded px-2 py-1"
        >
          <AlertTriangle class="w-3 h-3 animate-pulse" />
          非法进入限制区域
        </div>
        <div
          v-else-if="person.isRestricted"
          class="mt-2 text-xs text-yellow-300 flex items-center gap-1 bg-yellow-500/10 rounded px-2 py-1"
        >
          <Shield class="w-3 h-3" />
          处于限制区域（已授权）
        </div>
      </div>

      <div v-if="personnel.length === 0" class="text-center py-8">
        <UserX class="w-10 h-10 text-blue-500/50 mx-auto mb-2" />
        <p class="text-blue-300/60 text-sm">暂无人员数据</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Users, AlertCircle, AlertTriangle, MapPin, Ban, Shield, UserX } from 'lucide-vue-next'
import { usePersonnel } from '../../composables/usePersonnel'

const { personnel, activeAlerts, getRoleColor, getRoleName, getCurrentArea } = usePersonnel()

const onDutyCount = computed(() => personnel.value.length)

const getRoleBgClass = (role: string): string => {
  const classes: Record<string, string> = {
    window: 'bg-gradient-to-br from-blue-500 to-blue-600',
    chief: 'bg-gradient-to-br from-purple-500 to-purple-600',
    leader: 'bg-gradient-to-br from-yellow-500 to-amber-600'
  }
  return classes[role] || 'bg-gray-500'
}

const getRoleBadgeClass = (role: string): string => {
  const classes: Record<string, string> = {
    window: 'bg-blue-500/20 text-blue-400',
    chief: 'bg-purple-500/20 text-purple-400',
    leader: 'bg-yellow-500/20 text-yellow-400'
  }
  return classes[role] || 'bg-gray-500/20 text-gray-400'
}
</script>
