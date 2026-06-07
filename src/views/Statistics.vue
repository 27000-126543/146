<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useStatisticsStore } from '@/store/statistics'
import { useAuth } from '@/composables/useAuth'
import { exportDailyReport, exportReportsRange } from '@/utils/excel'
import * as echarts from 'echarts'
import type { WindowDaily } from '@/types'
import {
  ArrowLeft,
  Calendar,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  FileSpreadsheet,
  LayoutGrid,
  SortAsc,
  SortDesc
} from 'lucide-vue-next'
import { ElMessage, ElMessageBox } from 'element-plus'

const router = useRouter()
const statisticsStore = useStatisticsStore()
const { hasPermission, isLoggedIn } = useAuth()

const startDate = ref('')
const endDate = ref('')

const trendChartRef = ref<HTMLElement | null>(null)
const pieChartRef = ref<HTMLElement | null>(null)
const barChartRef = ref<HTMLElement | null>(null)

let trendChart: echarts.ECharts | null = null
let pieChart: echarts.ECharts | null = null
let barChart: echarts.ECharts | null = null

const sortField = ref<keyof WindowDaily>('windowNumber')
const sortOrder = ref<'asc' | 'desc'>('asc')

const hasAccess = computed(() => {
  return isLoggedIn && hasPermission(['chief', 'leader'])
})

const todayStr = computed(() => new Date().toISOString().split('T')[0])

const initDateRange = () => {
  const today = new Date()
  const sevenDaysAgo = new Date(today)
  sevenDaysAgo.setDate(today.getDate() - 6)
  startDate.value = sevenDaysAgo.toISOString().split('T')[0]
  endDate.value = today.toISOString().split('T')[0]
}

const filteredReports = computed(() => {
  if (!startDate.value || !endDate.value) return []
  return statisticsStore.getReportsInRange(startDate.value, endDate.value)
})

const currentReport = computed(() => {
  return statisticsStore.getReport(todayStr.value)
})

const sortedWindowData = computed(() => {
  const windows = [...currentReport.value.windows]
  return windows.sort((a, b) => {
    const aVal = a[sortField.value]
    const bVal = b[sortField.value]
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortOrder.value === 'asc' ? aVal - bVal : bVal - aVal
    }
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortOrder.value === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    return 0
  })
})

const handleSort = (field: keyof WindowDaily) => {
  if (sortField.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = field
    sortOrder.value = 'asc'
  }
}

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const initTrendChart = () => {
  if (!trendChartRef.value) return
  trendChart = echarts.init(trendChartRef.value)
  updateTrendChart()
}

const updateTrendChart = () => {
  if (!trendChart) return
  const data = statisticsStore.getTrendData(
    filteredReports.value.length || 7
  )
  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(71, 85, 105, 0.5)',
      textStyle: { color: '#f1f5f9' }
    },
    legend: {
      data: ['办件量', '平均办理时长(分钟)', '满意度(%)'],
      textStyle: { color: '#94a3b8' },
      top: 0
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map(d => d.date),
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: [
      {
        type: 'value',
        name: '办件量',
        splitLine: { lineStyle: { color: 'rgba(71, 85, 105, 0.3)' } },
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      },
      {
        type: 'value',
        name: '时长/满意度',
        splitLine: { show: false },
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
      }
    ],
    series: [
      {
        name: '办件量',
        type: 'line',
        smooth: true,
        data: data.map(d => d.count),
        lineStyle: { color: '#06b6d4', width: 2 },
        itemStyle: { color: '#06b6d4' },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(6, 182, 212, 0.3)' },
            { offset: 1, color: 'rgba(6, 182, 212, 0)' }
          ])
        }
      },
      {
        name: '平均办理时长(分钟)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: data.map(d => Math.round(d.duration / 60)),
        lineStyle: { color: '#f59e0b', width: 2 },
        itemStyle: { color: '#f59e0b' }
      },
      {
        name: '满意度(%)',
        type: 'line',
        smooth: true,
        yAxisIndex: 1,
        data: data.map(d => d.satisfaction),
        lineStyle: { color: '#10b981', width: 2 },
        itemStyle: { color: '#10b981' }
      }
    ]
  }
  trendChart.setOption(option)
}

const initPieChart = () => {
  if (!pieChartRef.value) return
  pieChart = echarts.init(pieChartRef.value)
  updatePieChart()
}

const updatePieChart = () => {
  if (!pieChart) return
  const stats = statisticsStore.getWindowTypeStats()
  const data = Object.entries(stats).map(([name, value]) => ({
    name,
    value: value.count
  }))
  const colors = ['#3b82f6', '#10b981', '#f59e0b']
  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(71, 85, 105, 0.5)',
      textStyle: { color: '#f1f5f9' },
      formatter: '{b}: {c}件 ({d}%)'
    },
    legend: {
      orient: 'vertical',
      right: '5%',
      top: 'center',
      textStyle: { color: '#94a3b8' }
    },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 8,
          borderColor: 'rgba(15, 23, 42, 0.9)',
          borderWidth: 2
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 14,
            fontWeight: 'bold',
            color: '#f1f5f9'
          }
        },
        labelLine: {
          show: false
        },
        data,
        color: colors
      }
    ]
  }
  pieChart.setOption(option)
}

const initBarChart = () => {
  if (!barChartRef.value) return
  barChart = echarts.init(barChartRef.value)
  updateBarChart()
}

const updateBarChart = () => {
  if (!barChart) return
  const stats = statisticsStore.getWindowTypeStats()
  const types = Object.keys(stats)
  const data = types.map(type => stats[type].satisfaction)
  const colors = ['#3b82f6', '#10b981', '#f59e0b']
  const option: echarts.EChartsOption = {
    backgroundColor: 'transparent',
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15, 23, 42, 0.9)',
      borderColor: 'rgba(71, 85, 105, 0.5)',
      textStyle: { color: '#f1f5f9' },
      formatter: '{b}: {c}%'
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: types,
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
      type: 'value',
      max: 100,
      splitLine: { lineStyle: { color: 'rgba(71, 85, 105, 0.3)' } },
      axisLine: { lineStyle: { color: '#334155' } },
      axisLabel: { color: '#94a3b8', formatter: '{value}%' }
    },
    series: [
      {
        type: 'bar',
        data: data.map((value, index) => ({
          value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colors[index] },
              { offset: 1, color: colors[index] + '66' }
            ]),
            borderRadius: [6, 6, 0, 0]
          }
        })),
        barWidth: '40%',
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          color: '#e2e8f0',
          fontSize: 12
        }
      }
    ]
  }
  barChart.setOption(option)
}

const handleExportDaily = () => {
  try {
    exportDailyReport(currentReport.value)
    ElMessage.success('当日日报已导出')
  } catch {
    ElMessage.error('导出失败，请重试')
  }
}

const handleExportRange = async () => {
  if (filteredReports.value.length === 0) {
    ElMessage.warning('请选择有效的日期范围')
    return
  }
  try {
    await ElMessageBox.confirm(
      `确认导出 ${startDate.value} 至 ${endDate.value} 的统计报表？共 ${filteredReports.value.length} 天数据`,
      '导出确认',
      {
        confirmButtonText: '确认导出',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    exportReportsRange(filteredReports.value)
    ElMessage.success('区间统计报表已导出')
  } catch {
    // 用户取消
  }
}

const handleBack = () => {
  router.push('/')
}

const handleResize = () => {
  trendChart?.resize()
  pieChart?.resize()
  barChart?.resize()
}

watch([startDate, endDate], () => {
  nextTick(() => {
    updateTrendChart()
    updatePieChart()
    updateBarChart()
  })
})

onMounted(() => {
  initDateRange()
  if (hasAccess.value) {
    nextTick(() => {
      initTrendChart()
      initPieChart()
      initBarChart()
      window.addEventListener('resize', handleResize)
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  pieChart?.dispose()
  barChart?.dispose()
})
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-white">
    <!-- 无权限提示 -->
    <div
      v-if="!hasAccess"
      class="min-h-screen flex items-center justify-center"
    >
      <div class="text-center">
        <div
          class="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center"
        >
          <LayoutGrid class="w-12 h-12 text-red-400" />
        </div>
        <h2 class="text-2xl font-bold text-white mb-2">权限不足</h2>
        <p class="text-slate-400 mb-6">
          只有科长及以上职位可以访问数据统计页面
        </p>
        <p class="text-slate-500 text-sm mb-8">
          {{ isLoggedIn ? '请联系管理员提升权限' : '请先登录系统' }}
        </p>
        <button
          class="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
          @click="handleBack"
        >
          <ArrowLeft class="w-4 h-4" />
          返回调度大屏
        </button>
      </div>
    </div>

    <!-- 正常页面 -->
    <div v-else class="p-6 pb-28">
      <!-- 顶部导航栏 -->
      <div
        class="flex items-center justify-between mb-6 px-6 py-4 bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-700/50"
      >
        <div class="flex items-center gap-4">
          <button
            class="p-2 rounded-lg bg-slate-800/50 hover:bg-slate-700/50 border border-slate-600/50 transition-colors"
            @click="handleBack"
            title="返回调度大屏"
          >
            <ArrowLeft class="w-5 h-5 text-slate-300" />
          </button>
          <div>
            <h1 class="text-xl font-bold text-white">数据统计与日报导出</h1>
            <p class="text-sm text-slate-400">政务服务中心运营数据分析</p>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <button
            class="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            @click="handleExportDaily"
          >
            <FileSpreadsheet class="w-4 h-4" />
            导出当日日报
          </button>
          <button
            class="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            @click="handleExportRange"
          >
            <Download class="w-4 h-4" />
            导出区间统计
          </button>
        </div>
      </div>

      <!-- 筛选栏 -->
      <div
        class="flex items-center gap-6 mb-6 px-6 py-4 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50"
      >
        <div class="flex items-center gap-2">
          <Calendar class="w-5 h-5 text-slate-400" />
          <span class="text-sm text-slate-400">日期范围：</span>
        </div>
        <input
          v-model="startDate"
          type="date"
          class="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        <span class="text-slate-500">至</span>
        <input
          v-model="endDate"
          type="date"
          class="px-3 py-2 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white text-sm focus:outline-none focus:border-blue-500 transition-colors"
        />
        <div class="flex items-center gap-2 ml-auto text-sm">
          <span class="text-slate-400">今日：</span>
          <span class="text-white font-medium">{{ todayStr }}</span>
          <span class="text-slate-500 mx-2">|</span>
          <span class="text-slate-400">总办件量：</span>
          <span class="text-cyan-400 font-bold">{{ currentReport.totalCount }}</span>
          <span class="text-slate-500 mx-2">|</span>
          <span class="text-slate-400">满意度：</span>
          <span class="text-emerald-400 font-bold">{{ currentReport.satisfaction }}%</span>
        </div>
      </div>

      <!-- 图表区 -->
      <div class="grid grid-cols-3 gap-6 mb-6">
        <!-- 办件量趋势折线图 -->
        <div
          class="col-span-2 bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
        >
          <div class="flex items-center gap-2 mb-4">
            <TrendingUp class="w-5 h-5 text-cyan-400" />
            <h3 class="text-lg font-semibold text-white">办件量趋势</h3>
            <span class="text-xs text-slate-500 ml-2">最近{{ filteredReports.length || 7 }}天</span>
          </div>
          <div ref="trendChartRef" class="w-full h-72"></div>
        </div>

        <!-- 右侧两个小图表 -->
        <div class="flex flex-col gap-6">
          <!-- 业务类型饼图 -->
          <div
            class="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 flex-1"
          >
            <div class="flex items-center gap-2 mb-2">
              <PieChart class="w-5 h-5 text-blue-400" />
              <h3 class="text-lg font-semibold text-white">业务类型占比</h3>
            </div>
            <div ref="pieChartRef" class="w-full h-52"></div>
          </div>

          <!-- 满意度柱状图 -->
          <div
            class="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 flex-1"
          >
            <div class="flex items-center gap-2 mb-2">
              <BarChart3 class="w-5 h-5 text-emerald-400" />
              <h3 class="text-lg font-semibold text-white">各业务满意度</h3>
            </div>
            <div ref="barChartRef" class="w-full h-52"></div>
          </div>
        </div>
      </div>

      <!-- 表格区 -->
      <div
        class="bg-slate-900/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
      >
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <LayoutGrid class="w-5 h-5 text-amber-400" />
            <h3 class="text-lg font-semibold text-white">窗口明细数据</h3>
            <span class="text-xs text-slate-500 ml-2">{{ todayStr }}</span>
          </div>
          <div class="text-sm text-slate-400">
            共 <span class="text-white font-medium">{{ sortedWindowData.length }}</span> 个窗口
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-700/50">
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                  @click="handleSort('windowNumber')"
                >
                  <div class="flex items-center gap-1">
                    窗口号
                    <span v-if="sortField === 'windowNumber'">
                      <SortAsc v-if="sortOrder === 'asc'" class="w-4 h-4" />
                      <SortDesc v-else class="w-4 h-4" />
                    </span>
                  </div>
                </th>
                <th
                  class="px-4 py-3 text-left text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                  @click="handleSort('businessType')"
                >
                  <div class="flex items-center gap-1">
                    业务类型
                    <span v-if="sortField === 'businessType'">
                      <SortAsc v-if="sortOrder === 'asc'" class="w-4 h-4" />
                      <SortDesc v-else class="w-4 h-4" />
                    </span>
                  </div>
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                  @click="handleSort('count')"
                >
                  <div class="flex items-center justify-end gap-1">
                    办件量
                    <span v-if="sortField === 'count'">
                      <SortAsc v-if="sortOrder === 'asc'" class="w-4 h-4" />
                      <SortDesc v-else class="w-4 h-4" />
                    </span>
                  </div>
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                  @click="handleSort('avgDuration')"
                >
                  <div class="flex items-center justify-end gap-1">
                    平均办理时长
                    <span v-if="sortField === 'avgDuration'">
                      <SortAsc v-if="sortOrder === 'asc'" class="w-4 h-4" />
                      <SortDesc v-else class="w-4 h-4" />
                    </span>
                  </div>
                </th>
                <th
                  class="px-4 py-3 text-right text-sm font-medium text-slate-400 cursor-pointer hover:text-white transition-colors"
                  @click="handleSort('satisfaction')"
                >
                  <div class="flex items-center justify-end gap-1">
                    满意度
                    <span v-if="sortField === 'satisfaction'">
                      <SortAsc v-if="sortOrder === 'asc'" class="w-4 h-4" />
                      <SortDesc v-else class="w-4 h-4" />
                    </span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="window in sortedWindowData"
                :key="window.windowId"
                class="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
              >
                <td class="px-4 py-3 text-sm text-white font-medium">
                  {{ window.windowNumber }} 号窗口
                </td>
                <td class="px-4 py-3 text-sm">
                  <span
                    class="px-2.5 py-1 rounded-full text-xs font-medium"
                    :class="{
                      'bg-blue-500/20 text-blue-300': window.businessType === '税务',
                      'bg-emerald-500/20 text-emerald-300': window.businessType === '社保',
                      'bg-amber-500/20 text-amber-300': window.businessType === '工商'
                    }"
                  >
                    {{ window.businessType }}
                  </span>
                </td>
                <td class="px-4 py-3 text-sm text-cyan-400 font-medium text-right">
                  {{ window.count }}
                </td>
                <td class="px-4 py-3 text-sm text-slate-300 text-right">
                  {{ formatDuration(window.avgDuration) }}
                </td>
                <td class="px-4 py-3 text-sm text-right">
                  <span
                    class="font-medium"
                    :class="[
                      window.satisfaction >= 95
                        ? 'text-emerald-400'
                        : window.satisfaction >= 90
                          ? 'text-green-400'
                          : window.satisfaction >= 85
                            ? 'text-yellow-400'
                            : 'text-red-400'
                    ]"
                  >
                    {{ window.satisfaction }}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 汇总信息 -->
        <div class="mt-4 pt-4 border-t border-slate-700/50 flex items-center justify-between text-sm">
          <div class="flex items-center gap-6">
            <span class="text-slate-400">
              合计办件量：<span class="text-white font-bold ml-1">{{
                currentReport.totalCount
              }}</span> 件
            </span>
            <span class="text-slate-400">
              平均办理时长：<span class="text-white font-bold ml-1">{{
                formatDuration(currentReport.avgDuration)
              }}</span>
            </span>
            <span class="text-slate-400">
              综合满意度：<span
                class="font-bold ml-1"
                :class="[
                  currentReport.satisfaction >= 95
                    ? 'text-emerald-400'
                    : currentReport.satisfaction >= 90
                      ? 'text-green-400'
                      : currentReport.satisfaction >= 85
                        ? 'text-yellow-400'
                        : 'text-red-400'
                ]"
                >{{ currentReport.satisfaction }}%</span
              >
            </span>
          </div>
          <div class="text-slate-500">
            数据更新时间：{{ new Date().toLocaleString('zh-CN') }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
