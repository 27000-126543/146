import { storeToRefs } from 'pinia'
import { useHallStore } from '../store/hall'

export function useEnvironment() {
  const hallStore = useHallStore()
  const { environment, fanParticles } = storeToRefs(hallStore)

  const isTemperatureWarning = () => {
    return environment.value.temperature > environment.value.thresholds.temperature
  }

  const isHumidityWarning = () => {
    return environment.value.humidity > environment.value.thresholds.humidity
  }

  const isCo2Warning = () => {
    return environment.value.co2 > environment.value.thresholds.co2
  }

  const hasWarning = () => {
    return isTemperatureWarning() || isHumidityWarning() || isCo2Warning()
  }

  const getTemperatureStatus = () => {
    const temp = environment.value.temperature
    if (temp < 20) return { text: '偏冷', color: 'text-blue-400' }
    if (temp > environment.value.thresholds.temperature) return { text: '偏高', color: 'text-red-400' }
    return { text: '正常', color: 'text-green-400' }
  }

  const getHumidityStatus = () => {
    const hum = environment.value.humidity
    if (hum < 35) return { text: '偏干', color: 'text-yellow-400' }
    if (hum > environment.value.thresholds.humidity) return { text: '偏高', color: 'text-red-400' }
    return { text: '正常', color: 'text-green-400' }
  }

  const getCo2Status = () => {
    const co2 = environment.value.co2
    if (co2 > environment.value.thresholds.co2) return { text: '超标', color: 'text-red-400' }
    if (co2 > 800) return { text: '偏高', color: 'text-yellow-400' }
    return { text: '正常', color: 'text-green-400' }
  }

  return {
    environment,
    fanParticles,
    isTemperatureWarning,
    isHumidityWarning,
    isCo2Warning,
    hasWarning,
    getTemperatureStatus,
    getHumidityStatus,
    getCo2Status,
    simulateEnvironment: hallStore.simulateEnvironment,
    updateFanParticles: hallStore.updateFanParticles,
    startFanParticles: hallStore.startFanParticles,
    stopFanParticles: hallStore.stopFanParticles
  }
}
