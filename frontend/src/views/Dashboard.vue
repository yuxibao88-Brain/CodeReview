<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { dashboardApi } from '@/api'
import { Clock, CircleCheck, CircleClose, Folder } from '@element-plus/icons-vue'

const loading = ref(true)
const healthScore = ref(0)
const stats = ref<any[]>([])
const trend = ref<any[]>([])
const moduleScores = ref<any[]>([])
const activities = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  try {
    const [statsRes, trendRes, moduleRes, actRes]: any = await Promise.all([
      dashboardApi.getStats(),
      dashboardApi.getTrend(),
      dashboardApi.getModuleScores(),
      dashboardApi.getActivity(),
    ])
    healthScore.value = statsRes.healthScore || 86
    stats.value = [
      { label: '待审查', value: statsRes.pendingReviews, color: '#f59e0b', icon: Clock },
      { label: '本周完成', value: statsRes.todayCompleted, color: '#10b981', icon: CircleCheck },
      { label: '高危问题', value: statsRes.criticalIssues, color: '#ef4444', icon: CircleClose },
      { label: '参与项目', value: statsRes.activeProjects, color: '#3b82f6', icon: Folder },
    ]
    trend.value = trendRes
    moduleScores.value = moduleRes
    activities.value = actRes
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const gradeColor = (g: string) => g.startsWith('A') ? 'var(--color-success)' : g.startsWith('B') ? 'var(--color-accent)' : 'var(--color-warning)'
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <!-- 健康评分 + 统计卡片 -->
    <div class="top-row">
      <div class="card health-card">
        <div class="health-label">项目健康评分</div>
        <div class="health-score">{{ healthScore }}<span class="health-unit">/100</span></div>
        <div class="health-bar">
          <div class="health-fill" :style="{ width: healthScore + '%' }"></div>
        </div>
      </div>
      <div v-for="s in stats" :key="s.label" class="card stat-card">
        <div class="stat-header">
          <span class="stat-label">{{ s.label }}</span>
          <el-icon :style="{ color: s.color }" class="stat-icon"><component :is="s.icon" /></el-icon>
        </div>
        <div class="stat-value">{{ s.value }}</div>
      </div>
    </div>

    <!-- 中间行：质量趋势 + 模块评分 -->
    <div class="mid-row">
      <div class="card trend-card">
        <h4 class="section-title">质量趋势</h4>
        <div class="trend-table">
          <div class="trend-header">
            <span>周</span><span>错误</span><span>警告</span><span>评分</span>
          </div>
          <div v-for="t in trend" :key="t.week" class="trend-row">
            <span class="tw">{{ t.week }}</span>
            <span class="te" :style="{ color: t.errors > 8 ? 'var(--color-danger)' : 'var(--color-text)' }">{{ t.errors }}</span>
            <span class="tw2">{{ t.warnings }}</span>
            <span class="ts" :style="{ color: t.score >= 85 ? 'var(--color-success)' : 'var(--color-warning)' }">{{ t.score }}</span>
          </div>
        </div>
      </div>
      <div class="card module-card">
        <h4 class="section-title">模块评分排行</h4>
        <div v-for="m in moduleScores" :key="m.name" class="module-row">
          <span class="mod-name">{{ m.name }}</span>
          <div class="mod-bar-wrap">
            <div class="mod-bar" :style="{ width: m.score + '%', background: gradeColor(m.grade) }"></div>
          </div>
          <span class="mod-grade" :style="{ color: gradeColor(m.grade) }">{{ m.grade }}</span>
          <span class="mod-score">{{ m.score }}</span>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="card">
      <h4 class="section-title">最近活动</h4>
      <div v-for="a in activities" :key="a.id" class="activity-row">
        <div class="act-dot"></div>
        <span class="act-user">{{ a.user }}</span>
        <span class="act-action">{{ a.action }}</span>
        <span class="act-target">— {{ a.target }}</span>
        <span class="act-time">{{ a.time }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.top-row { display: grid; grid-template-columns: 1.2fr repeat(4, 1fr); gap: 20px; margin-bottom: 24px; }
.health-card { display: flex; flex-direction: column; justify-content: center; padding: 28px; }
.health-label { font-size: 14px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px; }
.health-score { font-size: 48px; font-weight: 800; color: var(--color-text); letter-spacing: -0.04em; line-height: 1; }
.health-unit { font-size: 20px; font-weight: 500; color: var(--color-text-secondary); }
.health-bar { height: 6px; background: var(--color-border); border-radius: 3px; margin-top: 16px; overflow: hidden; }
.health-fill { height: 100%; background: var(--color-success); border-radius: 3px; transition: width 0.6s ease; }

.stat-card { padding: 24px; display: flex; flex-direction: column; }
.stat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
.stat-icon { font-size: 20px; opacity: 0.9; }
.stat-value { font-size: 32px; font-weight: 700; color: var(--color-text); line-height: 1; letter-spacing: -0.03em; }
.stat-label { font-size: 13px; font-weight: 500; color: var(--color-text-secondary); }

.mid-row { display: grid; grid-template-columns: 1.2fr 1fr; gap: 24px; margin-bottom: 24px; }
.section-title { font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 20px; letter-spacing: -0.01em; }

.trend-table { font-size: 14px; }
.trend-header { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; padding: 8px 0; font-weight: 600; color: var(--color-text-secondary); font-size: 13px; border-bottom: 1px solid var(--color-border); }
.trend-row { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.trend-row:last-child { border-bottom: none; }
.tw, .tw2 { color: var(--color-text); font-weight: 500; }
.te { font-weight: 600; }
.ts { font-weight: 700; }

.module-row { display: flex; align-items: center; gap: 16px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
.module-row:last-child { border-bottom: none; }
.mod-name { font-size: 14px; font-weight: 500; color: var(--color-text); width: 100px; flex-shrink: 0; }
.mod-bar-wrap { flex: 1; height: 8px; background: var(--color-bg); border-radius: 4px; overflow: hidden; }
.mod-bar { height: 100%; border-radius: 4px; transition: width 0.6s ease; }
.mod-grade { font-size: 14px; font-weight: 700; width: 32px; text-align: center; }
.mod-score { font-size: 13px; font-weight: 600; color: var(--color-text-secondary); width: 32px; text-align: right; }

.activity-row { display: flex; align-items: center; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; font-size: 14px; }
.activity-row:last-child { border-bottom: none; }
.act-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--color-accent); flex-shrink: 0; }
.act-user { font-weight: 600; color: var(--color-text); flex-shrink: 0; }
.act-action { color: var(--color-text); }
.act-target { color: var(--color-text-secondary); flex: 1; }
.act-time { color: var(--color-text-tertiary); font-size: 13px; flex-shrink: 0; }
</style>
