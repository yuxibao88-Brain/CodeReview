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
  error: { color: "#f85149", bg: "rgba(248, 81, 73, 0.15)", label: "错误" },
  warning: { color: "#d29922", bg: "rgba(210, 153, 34, 0.15)", label: "警告" },
  suggestion: {
    color: "#58a6ff",
    bg: "rgba(88, 166, 255, 0.15)",
    label: "建议",
  },
};
</script>

<template>
  <div class="scan-page" v-loading="loading">
    <!-- 统一指令栏 -->
    <div class="command-bar">
      <div class="command-stats">
        <div class="summary-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
          <div class="summary-icon-wrap" style="--ic: #3b82f6">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
          </div>
          <div class="summary-data">
            <span class="summary-label">全部问题</span>
            <span class="summary-count">{{ summary.total }}</span>
          </div>
        </div>
        <div class="bar-divider"></div>
        <div class="summary-item error" :class="{ active: activeTab === 'error' }" @click="activeTab = 'error'">
          <div class="summary-icon-wrap" style="--ic: #3b82f6">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </div>
          <div class="summary-data">
            <span class="summary-label">错误</span>
            <span class="summary-count">{{ summary.errors }}</span>
          </div>
        </div>
        <div class="bar-divider"></div>
        <div class="summary-item warning" :class="{ active: activeTab === 'warning' }" @click="activeTab = 'warning'">
          <div class="summary-icon-wrap" style="--ic: #3b82f6">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <div class="summary-data">
            <span class="summary-label">警告</span>
            <span class="summary-count">{{ summary.warnings }}</span>
          </div>
        </div>
        <div class="bar-divider"></div>
        <div class="summary-item suggestion" :class="{ active: activeTab === 'suggestion' }" @click="activeTab = 'suggestion'">
          <div class="summary-icon-wrap" style="--ic: #3b82f6">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <div class="summary-data">
            <span class="summary-label">建议</span>
            <span class="summary-count">{{ summary.suggestions }}</span>
          </div>
        </div>
      </div>
      <div class="command-actions">
        <div class="search-container">
          <el-input v-model="searchText" placeholder="搜索文件或规则..." class="search-input" clearable :prefix-icon="Search" />
        </div>
        <el-button class="rescan-btn" :icon="Refresh" @click="handleRescan">重新扫描</el-button>
      </div>
    </div>

    <!-- 问题列表 -->
    <div class="card issues-list">
      <div v-if="filteredIssues.length === 0" class="empty-state">
        <p>暂无匹配的扫描结果</p>
      </div>
      <div v-for="issue in filteredIssues" :key="issue.id" class="issue-item">
        <div class="issue-row">
          <div class="issue-main">
            <div class="issue-header">
              <span
                class="severity-tag"
                :style="{
                  color: severityConfig[issue.severity]?.color,
                  background: severityConfig[issue.severity]?.bg,
                }"
              >
                {{ severityConfig[issue.severity]?.label }}
              </span>
              <span class="rule-id">{{ issue.rule }}</span>
            </div>
            <div class="issue-msg">{{ issue.message }}</div>
            <div class="issue-file">
              <span class="file-icon">📄</span>
              {{ issue.file }}
              <span class="line-num">行 {{ issue.line }}</span>
            </div>
          </div>
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
/* 统一指令栏 */
.command-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
  padding: 12px 20px;
  background: var(--color-bg-card);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
  min-height: 64px;
}
.command-stats {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}
.summary-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  border: 1px solid transparent;
}
.summary-item:hover {
  background: rgba(255, 255, 255, 0.04);
}
.summary-item.active {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.08);
}
.summary-item.active .summary-icon-wrap {
  transform: scale(1.05);
}
.bar-divider {
  width: 1px;
  height: 32px;
  background: rgba(255, 255, 255, 0.08);
  flex-shrink: 0;
  margin: 0 4px;
}
.summary-icon-wrap {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  background: color-mix(in srgb, var(--ic) 15%, transparent);
  color: var(--ic);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: transform 0.2s ease;
}
.summary-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.summary-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-weight: 500;
  line-height: 1;
}
.summary-count {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
  font-family: "SF Pro Text", "Inter", sans-serif;
  line-height: 1;
}
.command-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}
.search-container {
  width: 200px;
  transition: width 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.search-container:focus-within {
  width: 260px;
}

:deep(.search-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: none !important;
  border-radius: 6px;
  height: 36px;
}
:deep(.search-input .el-input__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.15) !important;
}
:deep(.search-input .el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-accent) !important;
  box-shadow: 0 0 0 3px rgba(74, 140, 246, 0.15) !important;
}

:deep(.search-input .el-input__inner) {
  height: 36px;
  font-size: 13px;
  color: #fff !important;
}

:deep(.search-input input::placeholder) {
  color: var(--color-text-tertiary);
}
.rescan-btn {
  height: 36px;
  padding: 0 20px;
  background: #3b82f6 !important;
  color: #ffffff !important;
  border: none !important;
  font-weight: 500;
  border-radius: 6px !important;
  font-size: 13px;
  letter-spacing: 0.02em;
  transition: all 0.2s ease;
}
.rescan-btn:hover {
  background: #2563eb !important;
  color: white !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.issues-list {
  padding: 0;
  border: 1px solid var(--color-border);
  border-radius: 16px;
  overflow: hidden;
  background: var(--color-bg-card);
  box-shadow: var(--shadow-sm);
}
.issue-item {
  border-bottom: 1px solid var(--color-border);
  transition: background 0.1s ease;
  border-radius: 0;
  margin-bottom: 0;
  border-left: none;
  border-right: none;
  border-top: none;
}
.issue-item:last-child {
  border-bottom: none;
}
.issue-item:hover {
  background: var(--color-bg-hover);
}
.issue-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  padding: 20px 24px;
}
.issue-main {
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}
.issue-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.severity-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 100px;
  flex-shrink: 0;
  letter-spacing: 0.02em;
}
.severity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}
.issue-rule {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-family: "SF Mono", "Fira Code", monospace;
  padding: 2px 8px;
  border-radius: 100px;
  background: rgba(110, 118, 129, 0.15);
  border: 1px solid var(--color-border);
}
.issue-message {
  font-size: 15px;
  font-weight: 500;
  color: var(--color-text);
  line-height: 1.6;
}
.issue-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  flex-shrink: 0;
}
.issue-file {
  font-size: 13px;
  color: var(--color-accent);
  font-weight: 500;
  font-family: "SF Mono", "Fira Code", monospace;
}
.issue-line {
  font-size: 12px;
  color: var(--color-text-tertiary);
  font-weight: 600;
  background: rgba(110, 118, 129, 0.15);
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid var(--color-border);
}

.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
  margin-bottom: 16px;
}
.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: var(--color-text-secondary);
  font-size: 14px;
  font-weight: 500;
}
</style>
