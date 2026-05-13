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
    <div class="glass-toolbar">
      <div class="search-container">
        <el-input
          v-model="searchText"
          placeholder="搜索文件、规则或问题内容..."
          class="search-input"
          clearable
          :prefix-icon="Search"
        />
      </div>
      <div class="spacer"></div>
      <el-button class="rescan-btn" :icon="Refresh" @click="handleRescan" round>
        重新扫描
      </el-button>
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
                <span
                  class="severity-dot"
                  :style="{ background: severityConfig[issue.severity]?.color }"
                ></span>
                {{ severityConfig[issue.severity]?.label }}
              </span>
              <span class="issue-rule">{{ issue.rule }}</span>
            </div>
            <div class="issue-message">{{ issue.message }}</div>
          </div>
          <div class="issue-side">
            <span class="issue-file">{{ issue.file }}</span>
            <span class="issue-line">Line {{ issue.line }}</span>
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
.summary-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.summary-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 16px 20px;
  background: var(--color-bg-card);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}
.summary-item:hover {
  background: var(--color-bg-hover);
  transform: translateY(-2px);
  border-color: var(--color-border-hover);
  box-shadow: var(--shadow-md);
}
.summary-item.active {
  background: var(--color-bg-card);
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}
.summary-item.error.active {
  border-color: var(--color-danger);
  box-shadow: 0 0 0 1px var(--color-danger);
}
.summary-item.warning.active {
  border-color: var(--color-warning);
  box-shadow: 0 0 0 1px var(--color-warning);
}
.summary-item.suggestion.active {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 1px var(--color-accent);
}

.summary-count {
  font-size: 36px;
  font-weight: 700;
  color: var(--color-text);
  font-family: "SF Mono", "Fira Code", monospace;
  line-height: 1;
  text-shadow: none;
}
.summary-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-top: 10px;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.glass-toolbar {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 8px 8px 8px 16px;
  background: var(--color-bg-card);
  border-radius: 12px;
  border: 1px solid var(--color-border);
  box-shadow: var(--shadow-sm);
}

.search-container {
  width: 220px;
  position: relative;
  transition: width 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.search-container:focus-within {
  width: 380px;
}

.spacer {
  flex: 1;
}

:deep(.search-input .el-input__wrapper) {
  background: rgba(255, 255, 255, 0.03);
  box-shadow: none !important;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 4px 12px;
  transition: all 0.2s ease;
}

:deep(.search-input .el-input__wrapper.is-focus) {
  background: rgba(255, 255, 255, 0.05);
  border-color: var(--color-accent) !important;
  box-shadow: 0 0 0 3px rgba(74, 140, 246, 0.15) !important;
}

:deep(.search-input .el-input__inner) {
  height: 32px;
  font-size: 14px;
  color: var(--color-text);
}

:deep(.search-input input::placeholder) {
  color: var(--color-text-tertiary);
}
.rescan-btn {
  border: none;
  background: var(--color-accent);
  color: white;
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 8px;
  transition: all 0.2s ease;
}
.rescan-btn:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 140, 246, 0.3);
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
