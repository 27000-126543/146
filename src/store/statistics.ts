import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { DailyReport } from '../types'
import { generateDailyReport } from '../mock/data'

export const useStatisticsStore = defineStore('statistics', () => {
  const reports = ref<Map<string, DailyReport>>(new Map())
  const selectedDate = ref<string>(new Date().toISOString().split('T')[0])

  const getReport = (date: string): DailyReport => {
    if (!reports.value.has(date)) {
      reports.value.set(date, generateDailyReport(date))
    }
    return reports.value.get(date)!
  }

  const getReportsInRange = (startDate: string, endDate: string): DailyReport[] => {
    const reportsList: DailyReport[] = []
    const start = new Date(startDate)
    const end = new Date(endDate)
    const current = new Date(start)

    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0]
      reportsList.push(getReport(dateStr))
      current.setDate(current.getDate() + 1)
    }

    return reportsList
  }

  const getTrendData = (days: number = 7) => {
    const data: { date: string; count: number; duration: number; satisfaction: number }[] = []
    const today = new Date()

    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const dateStr = d.toISOString().split('T')[0]
      const report = getReport(dateStr)
      data.push({
        date: `${d.getMonth() + 1}/${d.getDate()}`,
        count: report.totalCount,
        duration: report.avgDuration,
        satisfaction: report.satisfaction
      })
    }

    return data
  }

  const getWindowTypeStats = () => {
    const report = getReport(selectedDate.value)
    const stats: Record<string, { count: number; duration: number; satisfaction: number; windows: number }> = {
      '税务': { count: 0, duration: 0, satisfaction: 0, windows: 0 },
      '社保': { count: 0, duration: 0, satisfaction: 0, windows: 0 },
      '工商': { count: 0, duration: 0, satisfaction: 0, windows: 0 }
    }

    report.windows.forEach(w => {
      const type = w.businessType
      stats[type].count += w.count
      stats[type].duration += w.avgDuration
      stats[type].satisfaction += w.satisfaction
      stats[type].windows++
    })

    Object.keys(stats).forEach(key => {
      if (stats[key].windows > 0) {
        stats[key].duration = Math.round(stats[key].duration / stats[key].windows)
        stats[key].satisfaction = Math.round(stats[key].satisfaction / stats[key].windows * 10) / 10
      }
    })

    return stats
  }

  return {
    reports,
    selectedDate,
    getReport,
    getReportsInRange,
    getTrendData,
    getWindowTypeStats
  }
})
