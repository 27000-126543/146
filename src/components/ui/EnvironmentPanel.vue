<template>
  <div
    class="fixed left-4 bottom-4 w-[480px] rounded-2xl backdrop-blur-xl bg-blue-950/40 border border-blue-500/30 shadow-lg shadow-blue-500/20 overflow-hidden"
  >
    <div class="p-4 border-b border-blue-500/20">
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-bold text-blue-100 flex items-center gap-2">
          <Gauge class="w-5 h-5 text-blue-400" />
          环境监测
        </h3>
        <div class="flex items-center gap-2">
          <span class="text-xs text-blue-400/70">新风系统</span>
          <div
            class="w-3 h-3 rounded-full"
            :class="environment.fanStatus === 'on' ? 'bg-green-400 animate-pulse shadow-lg shadow-green-500/50' : 'bg-gray-500'"
          ></div>
        </div>
      </div>
    </div>

    <div
      v-if="hasWarning()"
      class="bg-red-500/20 border-b border-red-500/30 px-4 py-2 flex items-center gap-2"
    >
      <AlertTriangle class="w-4 h-4 text-red-400 animate-pulse" />
      <span class="text-red-300 text-sm font-medium">
        {{ warningMessage }}
      </span>
    </div>

    <div class="p-4">
      <div class="flex justify-around items-center">
        <div class="text-center">
          <div class="relative w-28 h-28">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="rgba(59, 130, 246, 0.2)"
                stroke-width="6"
                stroke-dasharray="197.92"
                stroke-dashoffset="49.48"
                stroke-linecap="round"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                :stroke="isTemperatureWarning() ? '#f87171' : '#60a5fa'"
                stroke-width="6"
                stroke-dasharray="197.92"
                :stroke-dashoffset="tempDashOffset"
                stroke-linecap="round"
                class="transition-all duration-500"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="rgba(248, 113, 113, 0.5)"
                stroke-width="2"
                stroke-dasharray="197.92"
                :stroke-dashoffset="tempThresholdOffset"
                stroke-linecap="round"
              />
            </svg>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center"
              :class="{ 'animate-pulse': isTemperatureWarning() }"
            >
              <span
                class="text-2xl font-bold"
                :class="isTemperatureWarning() ? 'text-red-400' : 'text-blue-200'"
              >
                {{ environment.temperature.toFixed(1) }}
              </span>
              <span class="text-xs text-blue-400/60">°C</span>
            </div>
            <div
              class="absolute top-1/2 left-1/2 w-0.5 h-10 bg-blue-400 origin-bottom rounded-full transition-transform duration-500"
              :style="{ transform: `translate(-50%, -100%) rotate(${tempAngle}deg)` }"
            >
              <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-blue-400 rounded-full"></div>
            </div>
          </div>
          <div class="mt-2 flex items-center justify-center gap-1">
            <Thermometer class="w-4 h-4 text-blue-400" />
            <span class="text-sm text-blue-300">温度</span>
            <span
              class="text-xs ml-1"
              :class="getTemperatureStatus().color"
            >
              {{ getTemperatureStatus().text }}
            </span>
          </div>
        </div>

        <div class="text-center">
          <div class="relative w-28 h-28">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="rgba(59, 130, 246, 0.2)"
                stroke-width="6"
                stroke-dasharray="197.92"
                stroke-dashoffset="49.48"
                stroke-linecap="round"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                :stroke="isHumidityWarning() ? '#f87171' : '#34d399'"
                stroke-width="6"
                stroke-dasharray="197.92"
                :stroke-dashoffset="humidityDashOffset"
                stroke-linecap="round"
                class="transition-all duration-500"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="rgba(248, 113, 113, 0.5)"
                stroke-width="2"
                stroke-dasharray="197.92"
                :stroke-dashoffset="humidityThresholdOffset"
                stroke-linecap="round"
              />
            </svg>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center"
              :class="{ 'animate-pulse': isHumidityWarning() }"
            >
              <span
                class="text-2xl font-bold"
                :class="isHumidityWarning() ? 'text-red-400' : 'text-emerald-200'"
              >
                {{ environment.humidity.toFixed(0) }}
              </span>
              <span class="text-xs text-blue-400/60">%</span>
            </div>
            <div
              class="absolute top-1/2 left-1/2 w-0.5 h-10 bg-emerald-400 origin-bottom rounded-full transition-transform duration-500"
              :style="{ transform: `translate(-50%, -100%) rotate(${humidityAngle}deg)` }"
            >
              <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-emerald-400 rounded-full"></div>
            </div>
          </div>
          <div class="mt-2 flex items-center justify-center gap-1">
            <Droplets class="w-4 h-4 text-emerald-400" />
            <span class="text-sm text-blue-300">湿度</span>
            <span
              class="text-xs ml-1"
              :class="getHumidityStatus().color"
            >
              {{ getHumidityStatus().text }}
            </span>
          </div>
        </div>

        <div class="text-center">
          <div class="relative w-28 h-28">
            <svg viewBox="0 0 100 100" class="w-full h-full -rotate-90">
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="rgba(59, 130, 246, 0.2)"
                stroke-width="6"
                stroke-dasharray="197.92"
                stroke-dashoffset="49.48"
                stroke-linecap="round"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                :stroke="isCo2Warning() ? '#f87171' : '#fbbf24'"
                stroke-width="6"
                stroke-dasharray="197.92"
                :stroke-dashoffset="co2DashOffset"
                stroke-linecap="round"
                class="transition-all duration-500"
              />
              <circle
                cx="50" cy="50" r="42"
                fill="none"
                stroke="rgba(248, 113, 113, 0.5)"
                stroke-width="2"
                stroke-dasharray="197.92"
                :stroke-dashoffset="co2ThresholdOffset"
                stroke-linecap="round"
              />
            </svg>
            <div
              class="absolute inset-0 flex flex-col items-center justify-center"
              :class="{ 'animate-pulse': isCo2Warning() }"
            >
              <span
                class="text-2xl font-bold"
                :class="isCo2Warning() ? 'text-red-400' : 'text-amber-200'"
              >
                {{ environment.co2.toFixed(0) }}
              </span>
              <span class="text-xs text-blue-400/60">ppm</span>
            </div>
            <div
              class="absolute top-1/2 left-1/2 w-0.5 h-10 bg-amber-400 origin-bottom rounded-full transition-transform duration-500"
              :style="{ transform: `translate(-50%, -100%) rotate(${co2Angle}deg)` }"
            >
              <div class="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-amber-400 rounded-full"></div>
            </div>
          </div>
          <div class="mt-2 flex items-center justify-center gap-1">
            <Wind class="w-4 h-4 text-amber-400" />
            <span class="text-sm text-blue-300">CO₂</span>
            <span
              class="text-xs ml-1"
              :class="getCo2Status().color"
            >
              {{ getCo2Status().text }}
            </span>
          </div>
        </div>
      </div>

      <div class="mt-4 grid grid-cols-3 gap-2 text-center">
        <div class="bg-blue-900/30 rounded-lg px-3 py-2">
          <div class="text-xs text-blue-400/70">温度阈值</div>
          <div class="text-sm text-blue-200 font-medium">{{ environment.thresholds.temperature }}°C</div>
        </div>
        <div class="bg-blue-900/30 rounded-lg px-3 py-2">
          <div class="text-xs text-blue-400/70">湿度阈值</div>
          <div class="text-sm text-blue-200 font-medium">{{ environment.thresholds.humidity }}%</div>
        </div>
        <div class="bg-blue-900/30 rounded-lg px-3 py-2">
          <div class="text-xs text-blue-400/70">CO₂阈值</div>
          <div class="text-sm text-blue-200 font-medium">{{ environment.thresholds.co2 }}ppm</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Gauge, Thermometer, Droplets, Wind, AlertTriangle } from 'lucide-vue-next'
import { useEnvironment } from '../../composables/useEnvironment'

const { environment, isTemperatureWarning, isHumidityWarning, isCo2Warning, hasWarning, getTemperatureStatus, getHumidityStatus, getCo2Status } = useEnvironment()

const tempDashOffset = computed(() => {
  const percent = (environment.temperature - 15) / 25
  const clamped = Math.max(0, Math.min(1, percent))
  return 197.92 * (1 - clamped * 0.75)
})

const tempThresholdOffset = computed(() => {
  const percent = (environment.thresholds.temperature - 15) / 25
  const clamped = Math.max(0, Math.min(1, percent))
  return 197.92 * (1 - clamped * 0.75)
})

const tempAngle = computed(() => {
  const percent = (environment.temperature - 15) / 25
  const clamped = Math.max(0, Math.min(1, percent))
  return clamped * 270 - 135
})

const humidityDashOffset = computed(() => {
  const percent = (environment.humidity - 30) / 50
  const clamped = Math.max(0, Math.min(1, percent))
  return 197.92 * (1 - clamped * 0.75)
})

const humidityThresholdOffset = computed(() => {
  const percent = (environment.thresholds.humidity - 30) / 50
  const clamped = Math.max(0, Math.min(1, percent))
  return 197.92 * (1 - clamped * 0.75)
})

const humidityAngle = computed(() => {
  const percent = (environment.humidity - 30) / 50
  const clamped = Math.max(0, Math.min(1, percent))
  return clamped * 270 - 135
})

const co2DashOffset = computed(() => {
  const percent = (environment.co2 - 400) / 1600
  const clamped = Math.max(0, Math.min(1, percent))
  return 197.92 * (1 - clamped * 0.75)
})

const co2ThresholdOffset = computed(() => {
  const percent = (environment.thresholds.co2 - 400) / 1600
  const clamped = Math.max(0, Math.min(1, percent))
  return 197.92 * (1 - clamped * 0.75)
})

const co2Angle = computed(() => {
  const percent = (environment.co2 - 400) / 1600
  const clamped = Math.max(0, Math.min(1, percent))
  return clamped * 270 - 135
})

const warningMessage = computed(() => {
  const warnings: string[] = []
  if (isTemperatureWarning()) warnings.push('温度')
  if (isHumidityWarning()) warnings.push('湿度')
  if (isCo2Warning()) warnings.push('CO₂浓度')
  return `${warnings.join('、')}超标，新风系统已启动`
})
</script>
