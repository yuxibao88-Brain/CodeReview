<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { scanApi } from '@/api'
import { Search, Refresh } from '@element-plus/icons-vue'
import request from '@/api/request'

const loading = ref(true)
const activeTab = ref('all')
const searchText = ref('')
const issues = ref<any[]>([])
const summary = ref({ errors: 0, warnings: 0, suggestions: 0, total: 0 })
const currentPage = ref(1)
const pageSize = ref(50)
const totalIssues = ref(0)

const fetchSummary = async () => {
  try {
    const res: any = await scanApi.getSummary()
    summary.value = res
  } catch {}
}

const fetchIssues = async () => {
  loading.value = true
  try {
    const severity = activeTab.value === 'all' ? undefined : activeTab.value
    const res: any = await request.get('/scan/issues', {
      params: { page: currentPage.value, pageSize: pageSize.value, severity }
    })
    issues.value = res.items || []
    totalIssues.value = res.total || 0
  } finally {
    loading.value = false
  }
}

onMounted(() => { fetchSummary(); fetchIssues() })

watch([activeTab], () => { currentPage.value = 1; fetchIssues() })
watch([currentPage], () => { fetchIssues() })

const filteredIssues = computed(() => {
  if (!searchText.value) return issues.value
  const q = searchText.value.toLowerCase()
  return issues.value.filter(i => i.file?.toLowerCase().includes(q) || i.message?.toLowerCase().includes(q) || i.rule?.toLowerCase().includes(q))
})

const handleRescan = async () => {
  loading.value = true
  try {
    await scanApi.rescan()
    await fetchSummary()
    await fetchIssues()
  } finally { loading.value = false }
}

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
  error:      { color: '#b91c1c', bg: '#fee2e2', label: '错误' },
  warning:    { color: '#b45309', bg: '#fef3c7', label: '警告' },
  suggestion: { color: '#1d4ed8', bg: '#dbeafe', label: '建议' },
}
</script>

<template>
  <div class="scan-page" v-loading="loading">
    <!-- 汇总卡片 -->
    <div class="summary-bar">
      <div class="summary-item" :class="{ active: activeTab === 'all' }" @click="activeTab = 'all'">
        <span class="summary-count">{{ summary.total }}</span>
        <span class="summary-label">全部</span>
      </div>
      <div class="summary-item error" :class="{ active: activeTab === 'error' }" @click="activeTab = 'error'">
        <span class="summary-count">{{ summary.errors }}</span>
        <span class="summary-label">错误</span>
      </div>
      <div class="summary-item warning" :class="{ active: activeTab === 'warning' }" @click="activeTab = 'warning'">
        <span class="summary-count">{{ summary.warnings }}</span>
        <span class="summary-label">警告</span>
      </div>
      <div class="summary-item suggestion" :class="{ active: activeTab === 'suggestion' }" @click="activeTab = 'suggestion'">
        <span class="summary-count">{{ summary.suggestions }}</span>
        <span class="summary-label">建议</span>
      </div>
    </div>

    <!-- 搜索与操作栏 -->
    <div class="card toolbar">
      <el-input v-model="searchText" placeholder="搜索文件、规则或问题内容..." class="search-input" clearable :prefix-icon="Search" />
      <el-button :icon="Refresh" @click="handleRescan">重新扫描</el-button>
    </div>

    <!-- 问题列表 -->
    <div class="card issues-list">
      <div v-if="filteredIssues.length === 0" class="empty-state">
        <p>暂无匹配的扫描结果</p>
      </div>
      <div v-for="issue in filteredIssues" :key="issue.id" class="issue-item">
        <div class="issue-row">
          <span class="severity-dot" :style="{ background: severityConfig[issue.severity]?.color }"></span>
          <span class="severity-tag" :style="{ color: severityConfig[issue.severity]?.color, background: severityConfig[issue.severity]?.bg }">
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
.summary-bar { display: flex; gap: 20px; margin-bottom: 24px; }
.summary-item { flex: 1; display: flex; flex-direction: column; align-items: center; padding: 28px 20px; background: var(--color-bg-card); border-radius: 16px; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-shadow: 0 4px 20px rgba(15, 23, 42, 0.02); border: 1px solid rgba(255, 255, 255, 0.8); }
.summary-item:hover { transform: translateY(-4px); box-shadow: 0 12px 30px rgba(15, 23, 42, 0.05); }
.summary-item.active { background: linear-gradient(135deg, #ffffff 0%, #eff6ff 100%); border-color: #bfdbfe; box-shadow: 0 12px 30px rgba(59, 130, 246, 0.1); transform: translateY(-4px); }
.summary-item.error.active { background: linear-gradient(135deg, #ffffff 0%, #fee2e2 100%); border-color: #fecaca; box-shadow: 0 12px 30px rgba(239, 68, 68, 0.1); }
.summary-item.warning.active { background: linear-gradient(135deg, #ffffff 0%, #fef3c7 100%); border-color: #fde68a; box-shadow: 0 12px 30px rgba(245, 158, 11, 0.1); }
.summary-item.suggestion.active { background: linear-gradient(135deg, #ffffff 0%, #dbeafe 100%); border-color: #bfdbfe; box-shadow: 0 12px 30px rgba(29, 78, 216, 0.1); }
.summary-count { font-size: 36px; font-weight: 800; color: var(--color-text); letter-spacing: -0.04em; line-height: 1; }
.summary-label { font-size: 14px; color: var(--color-text-secondary); margin-top: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }

.toolbar { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; padding: 20px 24px; }
.search-input { flex: 1; }
:deep(.search-input .el-input__wrapper) { border-radius: 10px; box-shadow: none !important; border: 1px solid transparent; background: #f8fafc; padding: 10px 16px; transition: all 0.2s ease; }
:deep(.search-input .el-input__wrapper:hover) { background: #f1f5f9; }
:deep(.search-input .el-input__wrapper.is-focus) { background: #ffffff; border-color: #bfdbfe; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important; }

.issues-list { padding: 12px; }
.issue-item { border-radius: 12px; margin-bottom: 4px; transition: all 0.25s ease; border: 1px solid transparent; }
.issue-item:hover { background: #f8fafc; border-color: var(--color-border); transform: translateX(4px); box-shadow: 0 4px 12px rgba(15, 23, 42, 0.02); }
.issue-row { display: flex; align-items: center; gap: 16px; padding: 16px 20px; }
.severity-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.8); }
.severity-tag { font-size: 12px; font-weight: 600; padding: 4px 10px; border-radius: 6px; flex-shrink: 0; letter-spacing: 0.02em; }
.issue-message { flex: 1; font-size: 14px; font-weight: 500; color: var(--color-text); line-height: 1.5; }
.issue-file { font-size: 13px; color: var(--color-text-secondary); font-family: 'SF Mono', 'Fira Code', monospace; padding: 4px 8px; background: var(--color-bg); border-radius: 6px; }
.issue-rule { font-size: 12px; color: var(--color-text-tertiary); font-family: monospace; border: 1px solid var(--color-border); padding: 2px 6px; border-radius: 4px; }

.pagination-wrap { display: flex; justify-content: center; margin-top: 32px; margin-bottom: 16px; }
.empty-state { text-align: center; padding: 80px 20px; color: var(--color-text-tertiary); font-size: 15px; font-weight: 500; }
</style>
