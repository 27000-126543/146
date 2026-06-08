<script setup lang="ts">
import ThreeScene from '@/components/three/ThreeScene.vue'
import WindowInfoPanel from '@/components/ui/WindowInfoPanel.vue'
import ApprovalPanel from '@/components/ui/ApprovalPanel.vue'
import EnvironmentPanel from '@/components/ui/EnvironmentPanel.vue'
import PersonnelPanel from '@/components/ui/PersonnelPanel.vue'
import AssignmentPanel from '@/components/ui/AssignmentPanel.vue'
import TodoCenter from '@/components/ui/TodoCenter.vue'
import ControlBar from '@/components/ui/ControlBar.vue'
import { useAuth } from '@/composables/useAuth'
import { useWindow } from '@/composables/useWindow'
import { useMaterial } from '@/composables/useMaterial'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const { userName, userRole, isLoggedIn, hasPermission, logout } = useAuth()
const { loadAssignmentsFromStorage } = useWindow()
const { loadApprovalsFromStorage } = useMaterial()
const router = useRouter()

onMounted(() => {
  if (!isLoggedIn.value) {
    router.push('/login')
  }
  loadAssignmentsFromStorage()
  loadApprovalsFromStorage()
})
</script>

<template>
  <div class="relative w-full h-screen overflow-hidden bg-[#0a1628]">
    <div class="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-3 bg-gradient-to-b from-black/50 to-transparent">
      <div class="flex items-center gap-4">
        <div class="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
          3D智慧政务服务中心
        </div>
        <div class="text-sm text-gray-400">综合调度与便民服务可视化平台</div>
      </div>
      <div class="flex items-center gap-4">
        <div class="text-sm text-gray-300">
          当前用户：<span class="text-cyan-400 font-medium">{{ userName }}</span>
          <span class="ml-2 text-gray-500">({{ userRole === 'window' ? '窗口人员' : userRole === 'chief' ? '审批科长' : '中心领导' }})</span>
        </div>
        <button
          v-if="hasPermission(['chief', 'leader'])"
          @click="router.push('/statistics')"
          class="px-4 py-1.5 text-sm bg-blue-600/30 hover:bg-blue-600/50 text-blue-300 rounded-lg transition-all border border-blue-500/30"
        >
          数据统计
        </button>
        <button
          @click="logout(); router.push('/login')"
          class="px-4 py-1.5 text-sm bg-red-600/30 hover:bg-red-600/50 text-red-300 rounded-lg transition-all border border-red-500/30"
        >
          退出登录
        </button>
      </div>
    </div>

    <ThreeScene />

    <div class="absolute top-16 left-4 z-10 w-96">
      <TodoCenter />
    </div>

    <div class="absolute top-16 right-4 z-10 w-80">
      <WindowInfoPanel />
    </div>

    <div class="absolute right-4 z-10 w-80" style="top: 420px;">
      <AssignmentPanel />
    </div>

    <div class="absolute left-4 z-10 w-96" style="top: 420px;">
      <ApprovalPanel />
    </div>

    <div class="absolute bottom-24 right-4 z-10 w-72">
      <PersonnelPanel />
    </div>

    <div class="absolute bottom-24 left-4 z-10 w-72">
      <EnvironmentPanel />
    </div>

    <ControlBar />

    <div class="absolute top-16 left-1/2 -translate-x-1/2 z-10">
      <div class="px-6 py-2 bg-black/40 backdrop-blur-md rounded-full border border-cyan-500/30">
        <span class="text-cyan-400 text-sm">
          鼠标左键拖拽旋转 | 滚轮缩放 | 点击窗口查看详情
        </span>
      </div>
    </div>
  </div>
</template>
