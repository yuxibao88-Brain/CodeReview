<script setup lang="ts">
import { ref, onMounted } from "vue";
import { reportApi } from "@/api";

const loading = ref(true);
const dateRange = ref<[string, string]>(["2024-01-01", "2024-01-31"]);

const overview = ref<any[]>([]);
const reviewerRanking = ref<any[]>([]);
const issueTypes = ref<any[]>([]);

const fetchReports = async () => {
  loading.value = true;
  try {
    const [overviewRes, rankingRes, issuesRes]: any = await Promise.all([
      reportApi.getOverview(),
      reportApi.getRanking(),
      reportApi.getIssueTypes(),
    ]);

    overview.value = [
      {
        labelKey: "reports.overview.totalReviews",
        value: overviewRes.totalReviews,
        svgId: "reviews",
        color: "#3b82f6",
      },
      {
        labelKey: "reports.overview.completed",
        value: overviewRes.completed,
        svgId: "completed",
        color: "#10b981",
      },
      {
        labelKey: "reports.overview.totalIssues",
        value: overviewRes.totalIssues,
        svgId: "issues",
        color: "#f59e0b",
      },
      {
        labelKey: "reports.overview.avgScore",
        value: overviewRes.avgScore,
        svgId: "score",
        color: "#ef4444",
      },
    ];
    reviewerRanking.value = rankingRes.map((r: any) => ({
      ...r,
      avatar: r.name.charAt(0),
    }));
    issueTypes.value = issuesRes;
  } finally {
    loading.value = false;
  }
};

onMounted(fetchReports);
</script>

<template>
  <div class="reports-page" v-loading="loading">
    <!-- 时间筛选 -->
    <div class="page-header">
      <h2 class="page-title">{{ $t('reports.title') }}</h2>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        :range-separator="$t('reports.dateRange.to')"
        :start-placeholder="$t('reports.dateRange.start')"
        :end-placeholder="$t('reports.dateRange.end')"
        style="width: 260px"
      />
    </div>

    <!-- 总览卡片 -->
    <div class="overview-grid">
      <div
        v-for="item in overview"
        :key="item.labelKey"
        class="card overview-card"
        :style="{ '--icon-color': item.color }"
      >
        <div class="ov-header">
          <span class="ov-label">{{ $t(item.labelKey) }}</span>
          <div class="ov-icon-wrap" :style="{ color: item.color }">
            <!-- 总审查：文档图标 -->
            <svg v-if="item.svgId === 'reviews'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <!-- 已完成：带勾的圆 -->
            <svg v-else-if="item.svgId === 'completed'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
            <!-- 问题数：警示三角 -->
            <svg v-else-if="item.svgId === 'issues'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
            <!-- 平均分：奖杯 -->
            <svg v-else-if="item.svgId === 'score'" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/>
              <path d="M4 22h16"/>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>
            </svg>
          </div>
        </div>
        <div class="ov-value">{{ item.value }}</div>
      </div>
    </div>

    <div class="report-body">
      <!-- 审查人排名 -->
      <div class="card ranking-panel">
        <h4 class="panel-title">{{ $t('reports.ranking.title') }}</h4>
        <el-table :data="reviewerRanking" style="width: 100%">
          <el-table-column label="#" width="60" align="center">
            <template #default="{ $index }">
              <span :class="['rank-badge', `rank-${$index + 1}`]">{{
                $index + 1
              }}</span>
            </template>
          </el-table-column>
          <el-table-column :label="$t('reports.ranking.reviewer')" min-width="120">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 12px">
                <el-avatar
                  :size="32"
                  style="
                    background: var(--color-accent);
                    font-size: 14px;
                    font-weight: 600;
                  "
                >
                  {{ row.avatar }}
                </el-avatar>
                <span style="font-weight: 500; color: var(--color-text)">{{
                  row.name
                }}</span>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            prop="reviews"
            :label="$t('reports.ranking.reviews')"
            width="80"
            align="center"
          />
          <el-table-column
            prop="issues"
            :label="$t('reports.ranking.issues')"
            width="90"
            align="center"
          />
          <el-table-column :label="$t('reports.ranking.avgScore')" width="90" align="center">
            <template #default="{ row }">
              <span
                :style="{
                  color:
                    row.avgScore >= 80
                      ? 'var(--color-success)'
                      : 'var(--color-danger)',
                  fontWeight: 600,
                }"
              >
                {{ row.avgScore }}
              </span>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty :description="$t('reports.ranking.empty')" :image-size="80" />
          </template>
        </el-table>
      </div>

      <!-- 问题类型分布 -->
      <div class="card issue-panel">
        <h4 class="panel-title">{{ $t('reports.issues.title') }}</h4>
        <div class="issue-list" v-if="issueTypes && issueTypes.length > 0">
          <div v-for="item in issueTypes" :key="item.type" class="issue-row">
            <div class="issue-row-header">
              <span class="issue-type">{{ item.type }}</span>
              <span class="issue-count"
                >{{ item.count }} ({{ item.percent }}%)</span
              >
            </div>
            <el-progress
              :percentage="item.percent"
              :show-text="false"
              :stroke-width="6"
              :color="
                item.percent > 30
                  ? '#f59e0b'
                  : item.percent > 15
                    ? '#3b82f6'
                    : '#10b981'
              "
              style="margin-top: 8px"
            />
          </div>
        </div>
        <el-empty v-else :description="$t('reports.issues.empty')" :image-size="80" />
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
  background: linear-gradient(
    145deg,
    var(--color-bg-card) 0%,
    rgba(255, 255, 255, 0.02) 100%
  );
  border: 1px solid var(--color-border);
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease,
    border-color 0.3s ease;
  position: relative;
  overflow: hidden;
}
.overview-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
  border-color: rgba(255, 255, 255, 0.1);
}
.overview-card::after {
  content: "";
  position: absolute;
  top: -20px;
  right: -20px;
  width: 120px;
  height: 120px;
  background: radial-gradient(
    circle at center,
    var(--icon-color),
    transparent 70%
  );
  opacity: 0.08;
  pointer-events: none;
  transition: opacity 0.3s ease;
}
.overview-card:hover::after {
  opacity: 0.15;
}
.ov-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.ov-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: color-mix(in srgb, currentColor 10%, transparent);
  opacity: 0.85;
  transition: opacity 0.2s ease;
}
.overview-card:hover .ov-icon-wrap {
  opacity: 1;
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
.rank-1 {
  background: rgba(210, 153, 34, 0.2);
  color: #d29922;
}
.rank-2 {
  background: rgba(148, 163, 184, 0.15);
  color: #94a3b8;
}
.rank-3 {
  background: rgba(248, 81, 73, 0.15);
  color: #f85149;
}

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

/* 覆盖表格内边距和背景色 */
:deep(.el-table) {
  --el-table-border-color: var(--color-border);
  --el-table-header-text-color: var(--color-text-secondary);
  background-color: transparent !important;
}
:deep(.el-table tr) {
  background-color: transparent !important;
}
:deep(.el-table th.el-table__cell) {
  background-color: transparent !important;
  border-bottom: 1px solid var(--color-border);
  font-weight: 500;
  font-size: 13px;
  padding: 12px 0;
}
:deep(.el-table td.el-table__cell) {
  background-color: transparent !important;
  border-bottom: 1px solid var(--color-border);
  padding: 16px 0;
}
:deep(.el-table__inner-wrapper::before) {
  display: none;
}
:deep(.el-table:not(.el-table--border) .el-table__cell) {
  background-color: transparent !important;
}
</style>
