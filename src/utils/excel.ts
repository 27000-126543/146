import * as XLSX from 'xlsx'
import type { DailyReport, WindowDaily } from '../types'

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const exportDailyReport = (report: DailyReport) => {
  const wb = XLSX.utils.book_new()

  const summaryData = [
    ['政务服务中心运营日报'],
    ['日期', report.date],
    ['总办件量', report.totalCount],
    ['平均办理时长', formatDuration(report.avgDuration)],
    ['群众满意度', `${report.satisfaction}%`],
    [],
    ['各业务类型统计'],
    ['业务类型', '办件量', '平均办理时长', '平均满意度']
  ]

  const typeStats: Record<string, { count: number; duration: number; satisfaction: number }> = {}
  report.windows.forEach(w => {
    if (!typeStats[w.businessType]) {
      typeStats[w.businessType] = { count: 0, duration: 0, satisfaction: 0 }
    }
    typeStats[w.businessType].count += w.count
    typeStats[w.businessType].duration += w.avgDuration
    typeStats[w.businessType].satisfaction += w.satisfaction
  })

  Object.keys(typeStats).forEach(type => {
    const count = typeStats[type].count
    const duration = Math.round(typeStats[type].duration / report.windows.filter(w => w.businessType === type).length)
    const satisfaction = Math.round(typeStats[type].satisfaction / report.windows.filter(w => w.businessType === type).length * 10) / 10
    summaryData.push([type, count, formatDuration(duration), `${satisfaction}%`])
  })

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summaryWs, '汇总')

  const detailData = [
    ['窗口明细'],
    ['窗口号', '业务类型', '办件量', '平均办理时长', '满意度']
  ]

  report.windows.forEach((w: WindowDaily) => {
    detailData.push([
      String(w.windowNumber),
      w.businessType,
      String(w.count),
      formatDuration(w.avgDuration),
      `${w.satisfaction}%`
    ])
  })

  const detailWs = XLSX.utils.aoa_to_sheet(detailData)
  XLSX.utils.book_append_sheet(wb, detailWs, '窗口明细')

  const colWidths = [
    { wch: 15 },
    { wch: 15 },
    { wch: 12 },
    { wch: 15 },
    { wch: 12 }
  ]
  summaryWs['!cols'] = colWidths
  detailWs['!cols'] = colWidths

  XLSX.writeFile(wb, `政务服务中心日报_${report.date}.xlsx`)
}

export const exportReportsRange = (reports: DailyReport[]) => {
  const wb = XLSX.utils.book_new()

  const summaryData = [
    ['政务服务中心运营统计'],
    ['统计区间', `${reports[0]?.date || ''} 至 ${reports[reports.length - 1]?.date || ''}`],
    ['总办件量', reports.reduce((sum, r) => sum + r.totalCount, 0)],
    ['平均办理时长', formatDuration(Math.round(reports.reduce((sum, r) => sum + r.avgDuration, 0) / reports.length))],
    ['平均满意度', `${Math.round(reports.reduce((sum, r) => sum + r.satisfaction, 0) / reports.length * 10) / 10}%`],
    [],
    ['每日统计'],
    ['日期', '办件量', '平均办理时长', '满意度']
  ]

  reports.forEach(r => {
    summaryData.push([
      r.date,
      r.totalCount,
      formatDuration(r.avgDuration),
      `${r.satisfaction}%`
    ])
  })

  const summaryWs = XLSX.utils.aoa_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(wb, summaryWs, '统计汇总')

  reports.forEach(report => {
    const detailData = [
      [`${report.date} 窗口明细`],
      ['窗口号', '业务类型', '办件量', '平均办理时长', '满意度']
    ]

    report.windows.forEach(w => {
      detailData.push([
        String(w.windowNumber),
        w.businessType,
        String(w.count),
        formatDuration(w.avgDuration),
        `${w.satisfaction}%`
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(detailData)
    ws['!cols'] = [{ wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 10 }]
    XLSX.utils.book_append_sheet(wb, ws, report.date)
  })

  XLSX.writeFile(wb, `政务服务中心统计_${reports[0]?.date || ''}_${reports[reports.length - 1]?.date || ''}.xlsx`)
}
