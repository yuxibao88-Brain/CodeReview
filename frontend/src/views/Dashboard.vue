<script setup lang="ts">
import { ref, onMounted } from "vue";
import { dashboardApi } from "@/api";
import {
  Clock,
  CircleCheck,
  CircleClose,
  Folder,
  CaretTop,
  Warning,
  User,
  Management,
  Connection,
} from "@element-plus/icons-vue";

const loading = ref(true);
const healthScore = ref(0);
const stats = ref<any[]>([]);
const trend = ref<any[]>([]);
const moduleScores = ref<any[]>([]);
const activities = ref<any[]>([]);
const issueDistribution = ref<any[]>([]);
const contributors = ref<any[]>([]);

const fetchData = async () => {
  loading.value = true;
  try {
    const [statsRes, trendRes, moduleRes, actRes, distRes, contRes]: any =
      await Promise.all([
        dashboardApi.getStats().catch(() => ({})),
        dashboardApi.getTrend().catch(() => []),
        dashboardApi.getModuleScores().catch(() => []),
        dashboardApi.getActivity().catch(() => []),
        dashboardApi.getIssueDistribution().catch(() => []),
        dashboardApi.getContributors().catch(() => []),
      ]);
    healthScore.value = statsRes.healthScore || 86;
    stats.value = [
      {
        label: "待审查",
        value: statsRes.pendingReviews || 0,
        color: "#f59e0b",
        icon: Clock,
      },
      {
        label: "本周完成",
        value: statsRes.todayCompleted || 0,
        color: "#10b981",
        icon: CircleCheck,
      },
      {
        label: "高危问题",
        value: statsRes.criticalIssues || 0,
        color: "#ef4444",
        icon: CircleClose,
      },
      {
        label: "参与项目",
        value: statsRes.activeProjects || 0,
        color: "#3b82f6",
        icon: Folder,
      },
    ];
    trend.value = trendRes;
    moduleScores.value = moduleRes;
    activities.value = actRes;
    issueDistribution.value = distRes;
    contributors.value = contRes;
  } catch {
  } finally {
    loading.value = false;
  }
};

onMounted(fetchData);

const gradeColor = (g: string) =>
  g.startsWith("A")
    ? "var(--color-success)"
    : g.startsWith("B")
      ? "var(--color-accent)"
      : "var(--color-warning)";
</script>

<template>
  <div class="dashboard" v-loading="loading">
    <!-- 项目概览栏 -->
    <div class="card project-header">
      <div class="ph-item">
        <el-icon><Management /></el-icon>
        <div class="ph-info">
          <span class="ph-label">当前项目</span>
          <span class="ph-value">Code Review System</span>
        </div>
      </div>
      <div class="ph-divider"></div>
      <div class="ph-item">
        <el-icon><Connection /></el-icon>
        <div class="ph-info">
          <span class="ph-label">分支</span>
          <span class="ph-value">main</span>
        </div>
      </div>
      <div class="ph-divider"></div>
      <div class="ph-item">
        <el-icon><Clock /></el-icon>
        <div class="ph-info">
          <span class="ph-label">上次扫描</span>
          <span class="ph-value">10 分钟前</span>
        </div>
      </div>
      <div class="ph-actions">
        <el-button type="primary" size="small" plain>全量扫描</el-button>
        <el-button size="small">项目设置</el-button>
      </div>
    </div>

    <!-- 顶部统计 -->
    <div class="top-row">
      <div class="card health-card">
        <div class="health-info">
          <div class="health-label">项目健康评分</div>
          <div class="health-score">
            {{ healthScore }}<span class="health-unit">/100</span>
          </div>
          <div class="health-status">
            <span class="status-dot"></span>
            {{ healthScore >= 80 ? "运行良好" : "风险预警" }}
          </div>
        </div>
        <div class="health-progress-wrap">
          <el-progress
            type="dashboard"
            :percentage="healthScore"
            :stroke-width="12"
            :color="[
              { color: '#f56c6c', percentage: 40 },
              { color: '#e6a23c', percentage: 60 },
              { color: '#5cb87a', percentage: 80 },
              { color: '#1989fa', percentage: 100 },
            ]"
            :width="100"
          >
            <template #default="{ percentage }">
              <span class="progress-text">{{ percentage }}</span>
            </template>
          </el-progress>
        </div>
      </div>
      <div v-for="s in stats" :key="s.label" class="card stat-card">
        <div class="stat-icon-wrap" :style="{ background: s.color + '15' }">
          <el-icon :style="{ color: s.color }" class="stat-icon"
            ><component :is="s.icon"
          /></el-icon>
        </div>
        <div class="stat-content">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">{{ s.value }}</div>
          <div class="stat-trend" :style="{ color: s.color }">
            <el-icon><CaretTop /></el-icon> 较昨日 +2
          </div>
        </div>
      </div>
    </div>

    <!-- 中间行：质量趋势 + 缺陷分布 -->
    <div class="mid-row">
      <div class="card trend-card">
        <h4 class="section-title">
          <el-icon><CaretTop /></el-icon>质量趋势
        </h4>
        <div class="trend-table">
          <div class="trend-header">
            <span>周</span><span>错误</span><span>警告</span><span>评分</span>
          </div>
          <div v-for="t in trend" :key="t.week" class="trend-row">
            <span class="tw">{{ t.week }}</span>
            <span
              class="te"
              :style="{
                color:
                  t.errors > 8 ? 'var(--color-danger)' : 'var(--color-text)',
              }"
              >{{ t.errors }}</span
            >
            <span class="tw2">{{ t.warnings }}</span>
            <span
              class="ts"
              :style="{
                color:
                  t.score >= 85
                    ? 'var(--color-success)'
                    : 'var(--color-warning)',
              }"
              >{{ t.score }}</span
            >
          </div>
        </div>
      </div>
      <div class="card distribution-card">
        <h4 class="section-title">
          <el-icon><Warning /></el-icon>缺陷类型分布
        </h4>
        <div class="dist-list">
          <div v-for="d in issueDistribution" :key="d.label" class="dist-item">
            <div class="dist-info">
              <span class="dist-label">{{ d.label }}</span>
              <span class="dist-value">{{ d.value }}%</span>
            </div>
            <div class="dist-bar-bg">
              <div
                class="dist-bar"
                :style="{ width: d.value + '%', background: d.color }"
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部行：模块评分 + 最近活动 + 贡献者 -->
    <div class="bottom-row">
      <div class="card module-card">
        <h4 class="section-title">
          <el-icon><Management /></el-icon>模块评分排行
        </h4>
        <div v-for="m in moduleScores" :key="m.name" class="module-row">
          <span class="mod-name">{{ m.name }}</span>
          <div class="mod-bar-wrap">
            <div
              class="mod-bar"
              :style="{ width: m.score + '%', background: gradeColor(m.grade) }"
            ></div>
          </div>
          <div
            class="mod-badge"
            :style="{
              background: gradeColor(m.grade) + '15',
              color: gradeColor(m.grade),
            }"
          >
            {{ m.grade }}
          </div>
          <span class="mod-score">{{ m.score }}</span>
        </div>
      </div>

      <div class="card activity-card">
        <h4 class="section-title">
          <el-icon><Clock /></el-icon>最近动态
        </h4>
        <div class="activity-list">
          <div v-for="a in activities" :key="a.id" class="activity-row">
            <div class="act-avatar">{{ a.user.charAt(0) }}</div>
            <div class="act-main">
              <div class="act-header">
                <span class="act-user">{{ a.user }}</span>
                <span class="act-time">{{ a.time }}</span>
              </div>
              <div class="act-body">
                <span class="act-action">{{ a.action }}</span>
                <span class="act-target">{{ a.target }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="card contributors-card">
        <h4 class="section-title">
          <el-icon><User /></el-icon>核心贡献者
        </h4>
        <div class="contributor-list">
          <div v-for="c in contributors" :key="c.name" class="cont-item">
            <div class="cont-avatar">{{ c.avatar }}</div>
            <div class="cont-info">
              <div class="cont-name">{{ c.name }}</div>
              <div class="cont-stats">
                <span>审查: {{ c.reviews }}</span>
                <span>发现问题: {{ c.issuesFound }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 项目概览 */
.project-header {
  display: flex;
  align-items: center;
  padding: 16px 24px;
  gap: 40px;
}
.ph-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ph-item .el-icon {
  font-size: 20px;
  color: var(--color-accent);
  opacity: 0.8;
}
.ph-info {
  display: flex;
  flex-direction: column;
}
.ph-label {
  font-size: 11px;
  color: var(--color-text-tertiary);
  font-weight: 600;
  text-transform: uppercase;
}
.ph-value {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
}
.ph-divider {
  width: 1px;
  height: 32px;
  background: var(--color-border);
}
.ph-actions {
  margin-left: auto;
  display: flex;
  gap: 12px;
}

.top-row {
  display: grid;
  grid-template-columns: 1.5fr repeat(4, 1fr);
  gap: 16px;
}
.health-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(
    135deg,
    var(--color-bg-card) 0%,
    rgba(74, 140, 246, 0.05) 100%
  );
}
.health-info {
  display: flex;
  flex-direction: column;
}
.health-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
  margin-bottom: 8px;
}
.health-score {
  font-size: 42px;
  font-weight: 800;
  color: var(--color-text);
  letter-spacing: -0.04em;
  line-height: 1;
  font-family: "SF Mono", monospace;
}
.health-unit {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  margin-left: 2px;
}
.health-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--color-success);
  margin-top: 12px;
  font-weight: 600;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--color-success);
  box-shadow: 0 0 8px var(--color-success);
}
.progress-text {
  font-size: 20px;
  font-weight: 800;
  color: var(--color-text);
}

.stat-card {
  padding: 20px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  transition: transform 0.2s;
}
.stat-card:hover {
  transform: translateY(-4px);
}
.stat-icon-wrap {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.stat-icon {
  font-size: 20px;
}
.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: var(--color-text);
  line-height: 1.2;
  font-family: "SF Mono", monospace;
}
.stat-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.stat-trend {
  font-size: 11px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 2px;
  margin-top: 4px;
  opacity: 0.8;
}

.mid-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}
.bottom-row {
  display: grid;
  grid-template-columns: 1fr 1.5fr 1fr;
  gap: 20px;
}

.section-title {
  font-size: 15px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.section-title .el-icon {
  font-size: 16px;
  color: var(--color-accent);
}

/* 趋势表 */
.trend-table {
  font-size: 13px;
}
.trend-header {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  font-size: 12px;
  border-bottom: 1px solid var(--color-border);
}
.trend-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  padding: 12px;
  border-bottom: 1px solid var(--color-border);
}

/* 分布 */
.dist-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.dist-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}
.dist-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-secondary);
}
.dist-value {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}
.dist-bar-bg {
  height: 6px;
  background: var(--color-border);
  border-radius: 100px;
}
.dist-bar {
  height: 100%;
  border-radius: 100px;
}

/* 模块 */
.module-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}
.mod-name {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.mod-bar-wrap {
  flex: 1;
  height: 6px;
  background: var(--color-border);
  border-radius: 100px;
}
.mod-bar {
  height: 100%;
  border-radius: 100px;
}
.mod-badge {
  font-size: 10px;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  min-width: 20px;
  text-align: center;
}
.mod-score {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  width: 28px;
  text-align: right;
}

/* 活动 */
.activity-list {
  display: flex;
  flex-direction: column;
}
.activity-row {
  display: flex;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--color-border);
}
.act-avatar {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--color-bg-hover);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 12px;
  flex-shrink: 0;
  border: 1px solid var(--color-border);
}
.act-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.act-header {
  display: flex;
  justify-content: space-between;
}
.act-user {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text);
}
.act-time {
  font-size: 11px;
  color: var(--color-text-tertiary);
}
.act-body {
  font-size: 12px;
}
.act-action {
  color: var(--color-text-secondary);
}
.act-target {
  color: var(--color-accent);
  font-weight: 600;
  margin-left: 4px;
}

/* 贡献者 */
.contributor-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cont-item {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cont-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-accent) 0%, #a5b4fc 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
}
.cont-info {
  display: flex;
  flex-direction: column;
}
.cont-name {
  font-size: 14px;
  font-weight: 700;
  color: var(--color-text);
}
.cont-stats {
  font-size: 11px;
  color: var(--color-text-tertiary);
  display: flex;
  gap: 8px;
}
</style>
