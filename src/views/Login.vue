<template>
  <div class="min-h-screen w-full bg-gradient-to-br from-[#0a1628] via-[#1a2a4a] to-[#0a1628] flex items-center justify-center overflow-hidden relative">
    <div class="absolute inset-0 overflow-hidden">
      <div class="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div class="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-3xl"></div>
    </div>

    <div class="absolute inset-0 opacity-10">
      <div class="w-full h-full" style="background-image: linear-gradient(rgba(64, 158, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(64, 158, 255, 0.1) 1px, transparent 1px); background-size: 50px 50px;"></div>
    </div>

    <div class="relative z-10 w-full max-w-md mx-4">
      <div class="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl shadow-2xl overflow-hidden">
        <div class="p-8">
          <div class="text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-500 mb-4 shadow-lg shadow-blue-500/30">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <h1 class="text-2xl font-bold text-white mb-2">智慧政务服务中心</h1>
            <p class="text-gray-400 text-sm">人脸识别登录系统</p>
          </div>

          <div class="relative mb-8">
            <div class="w-56 h-56 mx-auto relative">
              <div class="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-br from-blue-500 via-cyan-400 to-blue-500 p-1 rounded-full">
                <div class="w-full h-full rounded-full bg-[#0a1628] overflow-hidden relative">
                  <div class="absolute inset-2 rounded-full overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                    <div class="absolute inset-0 flex items-center justify-center">
                      <div v-if="!isFaceScanning" class="text-center">
                        <svg class="w-24 h-24 mx-auto text-gray-600 mb-2" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                        </svg>
                        <p class="text-gray-500 text-sm">请将面部对准识别框</p>
                      </div>
                      <div v-else class="w-full h-full relative">
                        <div class="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/20 to-transparent animate-pulse"></div>
                        <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-scan"></div>
                        <div class="absolute inset-0 border-2 border-cyan-400/50 rounded-full m-4 animate-ping opacity-30"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                          <svg class="w-32 h-32 text-cyan-400 opacity-60" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div class="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-blue-400 rounded-tl-lg"></div>
                  <div class="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-blue-400 rounded-tr-lg"></div>
                  <div class="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-blue-400 rounded-bl-lg"></div>
                  <div class="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-blue-400 rounded-br-lg"></div>
                </div>
              </div>

              <div class="absolute inset-0 rounded-full border-2 border-transparent animate-spin-slow" style="background: conic-gradient(from 0deg, transparent 0deg, #22d3ee 90deg, transparent 180deg); -webkit-mask: radial-gradient(circle, transparent 90%, black 91%); mask: radial-gradient(circle, transparent 90%, black 91%);"></div>
            </div>

            <div v-if="isFaceScanning" class="mt-6 px-4">
              <div class="flex items-center justify-between mb-2">
                <span class="text-cyan-400 text-sm font-medium">正在识别中...</span>
                <span class="text-cyan-400 text-sm font-bold">{{ scanProgress }}%</span>
              </div>
              <div class="h-2 bg-gray-700/50 rounded-full overflow-hidden backdrop-blur-sm">
                <div 
                  class="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500 rounded-full transition-all duration-100 ease-out relative"
                  :style="{ width: scanProgress + '%' }"
                >
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shine"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-6">
            <p class="text-gray-400 text-sm text-center mb-4">请选择登录角色</p>
            <div class="grid grid-cols-3 gap-3">
              <button
                v-for="role in roles"
                :key="role.value"
                @click="handleLogin(role.value)"
                :disabled="isFaceScanning"
                class="group relative px-4 py-4 rounded-xl border transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
                :class="[
                  selectedRole === role.value 
                    ? 'bg-white/10 border-white/30 shadow-lg' 
                    : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                ]"
              >
                <div 
                  class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  :class="role.gradient"
                ></div>
                <div class="relative z-10">
                  <div 
                    class="w-10 h-10 mx-auto mb-2 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    :class="role.bgColor"
                  >
                    <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path :d="role.icon" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                    </svg>
                  </div>
                  <p class="text-white text-sm font-medium">{{ role.label }}</p>
                </div>
              </button>
            </div>
          </div>

          <div class="text-center">
            <p class="text-gray-500 text-xs">
              登录即表示您同意
              <a href="#" class="text-blue-400 hover:text-blue-300 transition-colors">《服务协议》</a>
              和
              <a href="#" class="text-blue-400 hover:text-blue-300 transition-colors">《隐私政策》</a>
            </p>
          </div>
        </div>

        <div class="px-8 py-4 bg-black/20 border-t border-white/5">
          <div class="flex items-center justify-center gap-2 text-gray-500 text-xs">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <span>本系统已通过国家安全等级保护三级认证</span>
          </div>
        </div>
      </div>

      <div class="mt-6 text-center">
        <p class="text-gray-600 text-xs">
          智慧政务服务中心可视化平台 v1.0.0
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuth } from '@/composables/useAuth'
import type { UserRole } from '@/types'

const router = useRouter()
const { isFaceScanning, scanProgress, simulateFaceScan } = useAuth()

const selectedRole = ref<UserRole | null>(null)

const roles = [
  {
    value: 'window' as UserRole,
    label: '窗口人员',
    icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
    bgColor: 'bg-blue-500',
    gradient: 'bg-gradient-to-br from-blue-500/30 to-blue-600/30'
  },
  {
    value: 'chief' as UserRole,
    label: '审批科长',
    icon: 'M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
    bgColor: 'bg-purple-500',
    gradient: 'bg-gradient-to-br from-purple-500/30 to-purple-600/30'
  },
  {
    value: 'leader' as UserRole,
    label: '中心领导',
    icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z',
    bgColor: 'bg-yellow-500',
    gradient: 'bg-gradient-to-br from-yellow-500/30 to-yellow-600/30'
  }
]

const handleLogin = async (role: UserRole) => {
  if (isFaceScanning.value) return
  
  selectedRole.value = role
  
  const success = await simulateFaceScan(role)
  
  if (success) {
    ElMessage.success('人脸识别验证通过，正在进入系统...')
    setTimeout(() => {
      router.push('/dashboard')
    }, 500)
  } else {
    ElMessage.error('人脸识别失败，请重试')
    selectedRole.value = null
  }
}
</script>

<style>
@keyframes scan {
  0% { transform: translateY(0); opacity: 1; }
  50% { transform: translateY(100%); opacity: 0.8; }
  100% { transform: translateY(0); opacity: 1; }
}

@keyframes spin-slow {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes shine {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.animate-scan {
  animation: scan 2s ease-in-out infinite;
}

.animate-spin-slow {
  animation: spin-slow 3s linear infinite;
}

.animate-shine {
  animation: shine 1.5s ease-in-out infinite;
}
</style>
