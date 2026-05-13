<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { reportApi } from '@/api'
import { Document, CircleCheck, Warning, Star } from '@element-plus/icons-vue'

const loading = ref(true)
const dateRange = ref<[string, string]>(['2024-01-01', '2024-01-31'])

const overview = ref<any[]>([])
const reviewerRanking = ref<any[]>([])
const issueTypes = ref<any[]>([])

const fetchReports = async () => {
  loading.value = true
  try {
    const [overviewRes, rankingRes, issuesRes]: any = await Promise.all([
      reportApi.getOverview(),
      reportApi.getRanking(),
      reportApi.getIssueTypes(),
    ])

    overview.value = [
      { label: '总审查数', value: overviewRes.totalReviews, icon: Document, color: '#3b82f6' },
      { label: '已完成',   value: overviewRes.completed,    icon: CircleCheck, color: '#10b981' },
      { label: '发现问题', value: overviewRes.totalIssues,   icon: Warning, color: '#f59e0b' },
      { label: '平均评分', value: overviewRes.avgScore,      icon: Star, color: '#ef4444' },
    ]
    reviewerRanking.value = rankingRes.map((r: any) => ({ ...r, avatar: r.name.charAt(0) }))
    issueTypes.value = issuesRes
  } finally {
    loading.value = false
  }
}

onMounted(fetchReports)
</script>

<template>
  <div class="reports-page" v-loading="loading">
    <!-- 时间筛选 -->
    <div class="page-header">
      <h2 class="page-title">数据洞察</h2>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 260px"
      />
    </div>

    <!-- 总览卡片 -->
    <div class="overview-grid">
      <div v-for="item in overview" :key="item.label" class="card overview-card">
        <div class="ov-header">
          <span class="ov-label">{{ item.label }}</span>
          <el-icon :style="{ color: item.color }" class="ov-icon">
            <component :is="item.icon" />
          </el-icon>
        </div>
        <div class="ov-value">{{ item.value }}</div>
      </div>
    </div>

    <div class="report-body">
      <!-- 审查人排名 -->
      <div class="card ranking-panel">
        <h4 class="panel-title">审查贡献排行</h4>
        <el-table :data="reviewerRanking" style="width: 100%">
          <el-table-column label="#" width="60" align="center">
            <template #default="{ $index }">
              <span :class="['rank-badge', `rank-${$index + 1}`]">{{ $index + 1 }}</span>
            </template>
          </el-table-column>
          <el-table-column label="审查人" min-width="120">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 12px">
                <el-avatar :size="32" style="background: var(--color-accent); font-size: 14px; font-weight: 600">
                  {{ row.avatar }}
                </el-avatar>
                <span style="font-weight: 500; color: var(--color-text)">{{ row.name }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="reviews" label="审查数" width="80" align="center" />
          <el-table-column prop="issues" label="提出问题" width="90" align="center" />
          <el-table-column label="平均评分" width="90" align="center">
            <template #default="{ row }">
              <span :style="{ color: row.avgScore >= 80 ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }">
                {{ row.avgScore }}
              </span>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 问题类型分布 -->
      <div class="card issue-panel">
        <h4 class="panel-title">发现问题分布</h4>
        <div class="issue-list">
          <div v-for="item in issueTypes" :key="item.type" class="issue-row">
            <div class="issue-row-header">
              <span class="issue-type">{{ item.type }}</span>
              <span class="issue-count">{{ item.count }} ({{ item.percent }}%)</span>
            </div>
            <el-progress
              :percentage="item.percent"
              :show-text="false"
              :stroke-width="6"
              :color="item.percent > 30 ? '#f59e0b' : item.percent > 15 ? '#3b82f6' : '#10b981'"
              style="margin-top: 8px"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.02em;
}
.overview-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;
}
.overview-card {
  display: flex;
  flex-direction: column;
  padding: 24px;
}
.ov-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.ov-icon {
  font-size: 20px;
  opacity: 0.9;
}
.ov-value {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1;
  letter-spacing: -0.03em;
}
.ov-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-secondary);
}
.report-body {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
}
.panel-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 24px;
  letter-spacing: -0.01em;
}
.rank-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  background: var(--color-bg);
  color: var(--color-text-secondary);
}
.rank-1 { background: #fef3c7; color: #b45309; }
.rank-2 { background: #f1f5f9; color: #64748b; }
.rank-3 { background: #fee2e2; color: #b91c1c; }

.issue-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.issue-row-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.issue-type {
  font-size: 14px;
  color: var(--color-text);
  font-weight: 500;
}
.issue-count {
  font-size: 13px;
  color: var(--color-text-secondary);
}

/* 覆盖表格内边距 */
:deep(.el-table) {
  --el-table-border-color: var(--color-border);
  --el-table-header-text-color: var(--color-text-secondary);
}
:deep(.el-table th.el-table__cell) {
  background-color: transparent !important;
  border-bottom: 1px solid var(--color-border);
  font-weight: 500;
  font-size: 13px;
  padding: 12px 0;
}
:deep(.el-table td.el-table__cell) {
  border-bottom: 1px solid #f1f5f9;
  padding: 16px 0;
}
:deep(.el-table__inner-wrapper::before) {
  display: none;
}
</style>
