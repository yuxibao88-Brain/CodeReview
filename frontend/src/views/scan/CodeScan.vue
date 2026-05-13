<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { scanApi } from "@/api";
import { Search, Refresh } from "@element-plus/icons-vue";
import request from "@/api/request";

const loading = ref(true);
const activeTab = ref("all");
const searchText = ref("");
const issues = ref<any[]>([]);
const summary = ref({ errors: 0, warnings: 0, suggestions: 0, total: 0 });
const currentPage = ref(1);
const pageSize = ref(50);
const totalIssues = ref(0);

const fetchSummary = async () => {
  try {
    const res: any = await scanApi.getSummary();
    summary.value = res;
  } catch {}
};

const fetchIssues = async () => {
  loading.value = true;
  try {
    const severity = activeTab.value === "all" ? undefined : activeTab.value;
    const res: any = await request.get("/scan/issues", {
      params: { page: currentPage.value, pageSize: pageSize.value, severity },
    });
    issues.value = res.items || [];
    totalIssues.value = res.total || 0;
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchSummary();
  fetchIssues();
});

watch([activeTab], () => {
  currentPage.value = 1;
  fetchIssues();
});
watch([currentPage], () => {
  fetchIssues();
});

const filteredIssues = computed(() => {
  if (!searchText.value) return issues.value;
  const q = searchText.value.toLowerCase();
  return issues.value.filter(
    (i) =>
      i.file?.toLowerCase().includes(q) ||
      i.message?.toLowerCase().includes(q) ||
      i.rule?.toLowerCase().includes(q),
  );
});

const handleRescan = async () => {
  loading.value = true;
  try {
    await scanApi.rescan();
    await fetchSummary();
    await fetchIssues();
  } finally {
    loading.value = false;
  }
};

const severityConfig: Record<
  string,
  { color: string; bg: string; label: string }
> = {
  error: { color: "#b91c1c", bg: "#fee2e2", label: "错误" },
  warning: { color: "#b45309", bg: "#fef3c7", label: "警告" },
  suggestion: { color: "#1d4ed8", bg: "#dbeafe", label: "建议" },
};
</script>

<template>
  <div class="scan-page" v-loading="loading">
    <!-- 汇总卡片 -->
    <div class="summary-bar">
      <div
        class="summary-item"
        :class="{ active: activeTab === 'all' }"
        @click="activeTab = 'all'"
      >
        <span class="summary-count">{{ summary.total }}</span>
        <span class="summary-label">全部</span>
      </div>
      <div
        class="summary-item error"
        :class="{ active: activeTab === 'error' }"
        @click="activeTab = 'error'"
      >
        <span class="summary-count">{{ summary.errors }}</span>
        <span class="summary-label">错误</span>
      </div>
      <div
        class="summary-item warning"
        :class="{ active: activeTab === 'warning' }"
        @click="activeTab = 'warning'"
      >
        <span class="summary-count">{{ summary.warnings }}</span>
        <span class="summary-label">警告</span>
      </div>
      <div
        class="summary-item suggestion"
        :class="{ active: activeTab === 'suggestion' }"
        @click="activeTab = 'suggestion'"
      >
        <span class="summary-count">{{ summary.suggestions }}</span>
        <span class="summary-label">建议</span>
      </div>
    </div>

    <!-- 搜索与操作栏 -->
    <div class="card toolbar">
      <el-input
        v-model="searchText"
        placeholder="搜索文件、规则或问题内容..."
        class="search-input"
        clearable
        :prefix-icon="Search"
      />
      <el-button :icon="Refresh" @click="handleRescan">重新扫描</el-button>
    </div>

    <!-- 问题列表 -->
    <div class="card issues-list">
      <div v-if="filteredIssues.length === 0" class="empty-state">
        <p>暂无匹配的扫描结果</p>
      </div>
      <div v-for="issue in filteredIssues" :key="issue.id" class="issue-item">
        <div class="issue-row">
          <span
            class="severity-dot"
            :style="{ background: severityConfig[issue.severity]?.color }"
          ></span>
          <span
            class="severity-tag"
            :style="{
              color: severityConfig[issue.severity]?.color,
              background: severityConfig[issue.severity]?.bg,
            }"
          >
            {{ severityConfig[issue.severity]?.label }}
          </span>
          <span class="issue-message">{{ issue.message }}</span>
          <span class="issue-file">{{ issue.file }}:{{ issue.line }}</span>
          <span class="issue-rule">{{ issue.rule }}</span>
        </div>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination-wrap" v-if="totalIssues > pageSize">
      <el-pagination
        v-model:current-page="currentPage"
        :page-size="pageSize"
        :total="totalIssues"
        layout="total, prev, pager, next"
        background
      />
    </div>
  </div>
</template>

<style scoped>
.summary-bar { display: flex; gap: 16px; margin-bottom: 24px; }
.summary-item { flex: 1; display: flex; flex-direction: column; align-items: flex-start; padding: 24px; background: rgba(255, 255, 255, 0.4); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-radius: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border: 1px solid rgba(255, 255, 255, 0.6); box-shadow: 0 4px 16px rgba(0,0,0,0.02); }
.summary-item:hover { background: rgba(255, 255, 255, 0.7); transform: translateY(-4px); box-shadow: 0 12px 24px rgba(15, 23, 42, 0.05); }
.summary-item.active { background: rgba(255, 255, 255, 0.85); border-color: rgba(59, 130, 246, 0.4); box-shadow: 0 8px 32px rgba(59, 130, 246, 0.1); }
.summary-item.error.active { border-color: rgba(239, 68, 68, 0.4); box-shadow: 0 8px 32px rgba(239, 68, 68, 0.1); }
.summary-item.warning.active { border-color: rgba(245, 158, 11, 0.4); box-shadow: 0 8px 32px rgba(245, 158, 11, 0.1); }
.summary-item.suggestion.active { border-color: rgba(29, 78, 216, 0.4); box-shadow: 0 8px 32px rgba(29, 78, 216, 0.1); }

.summary-count { font-size: 36px; font-weight: 700; color: var(--color-text); font-family: 'SF Mono', 'Fira Code', monospace; line-height: 1; text-shadow: 0 2px 10px rgba(0,0,0,0.05); }
.summary-label { font-size: 13px; color: var(--color-text-secondary); margin-top: 10px; font-weight: 600; letter-spacing: 0.02em; }

.toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 16px 20px; }
.search-input { flex: 1; }
:deep(.search-input .el-input__wrapper) { border-radius: 12px; box-shadow: none !important; border: 1px solid rgba(255,255,255,0.7); background: rgba(255,255,255,0.3); padding: 8px 16px; transition: all 0.3s; }
:deep(.search-input .el-input__wrapper:hover) { background: rgba(255,255,255,0.5); }
:deep(.search-input .el-input__wrapper.is-focus) { background: rgba(255,255,255,0.8); border-color: var(--color-accent); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15) !important; }

.issues-list { padding: 8px; border: 1px solid rgba(255,255,255,0.6); border-radius: 16px; overflow: hidden; background: rgba(255, 255, 255, 0.3); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }
.issue-item { border-bottom: none; transition: all 0.25s ease; border-radius: 12px; margin-bottom: 4px; box-shadow: none; border: 1px solid transparent; }
.issue-item:last-child { margin-bottom: 0; }
.issue-item:hover { background: rgba(255,255,255,0.6); transform: scale(1.005); box-shadow: 0 4px 12px rgba(0,0,0,0.02); border-color: rgba(255,255,255,0.8); }
.issue-row { display: flex; align-items: center; gap: 16px; padding: 16px 20px; }
.severity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 8px currentColor; }
.severity-tag { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 8px; flex-shrink: 0; }
.issue-message { flex: 1; font-size: 14px; font-weight: 500; color: var(--color-text); line-height: 1.5; }
.issue-file { font-size: 13px; color: var(--color-text-secondary); font-family: 'SF Mono', 'Fira Code', monospace; padding: 4px 8px; background: rgba(255,255,255,0.5); border-radius: 6px; }
.issue-rule { font-size: 12px; color: var(--color-text-tertiary); font-family: monospace; border: 1px solid rgba(0,0,0,0.05); padding: 2px 6px; border-radius: 6px; background: rgba(255,255,255,0.2); }

.pagination-wrap { display: flex; justify-content: center; margin-top: 24px; margin-bottom: 16px; }
.empty-state { text-align: center; padding: 60px 20px; color: var(--color-text-secondary); font-size: 14px; font-weight: 500; }
</style>
