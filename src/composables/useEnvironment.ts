import { useHallStore } from '../store/hall'

export function useEnvironment() {
  const hallStore = useHallStore()

  const isTemperatureWarning = () => {
    return hallStore.environment.temperature > hallStore.environment.thresholds.temperature
  }

  const isHumidityWarning = () => {
    return hallStore.environment.humidity > hallStore.environment.thresholds.humidity
  }

  const isCo2Warning = () => {
    return hallStore.environment.co2 > hallStore.environment.thresholds.co2
  }

  const hasWarning = () => {
    return isTemperatureWarning() || isHumidityWarning() || isCo2Warning()
  }

  const getTemperatureStatus = () => {
    const temp = hallStore.environment.temperature
    if (temp < 20) return { text: '偏冷', color: 'text-blue-400' }
    if (temp > hallStore.environment.thresholds.temperature) return { text: '偏高', color: 'text-red-400' }
    return { text: '正常', color: 'text-green-400' }
  }

  const getHumidityStatus = () => {
    const hum = hallStore.environment.humidity
    if (hum < 35) return { text: '偏干', color: 'text-yellow-400' }
    if (hum > hallStore.environment.thresholds.humidity) return { text: '偏高', color: 'text-red-400' }
    return { text: '正常', color: 'text-green-400' }
  }

  const getCo2Status = () => {
    const co2 = hallStore.environment.co2
    if (co2 > hallStore.environment.thresholds.co2) return { text: '超标', color: 'text-red-400' }
    if (co2 > 800) return { text: '偏高', color: 'text-yellow-400' }
    return { text: '正常', color: 'text-green-400' }
  }

  return {
    environment: hallStore.environment,
    fanParticles: hallStore.fanParticles,
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
