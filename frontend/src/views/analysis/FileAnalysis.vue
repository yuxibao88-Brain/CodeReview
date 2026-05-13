<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fileApi } from '@/api'

const loading = ref(true)
const activeTab = ref('overview')
const selectedFile = ref<any>(null)
const fileTree = ref<any[]>([])
const treeProps = { children: 'children', label: 'name' }

const fetchTree = async () => {
  loading.value = true
  try {
    const res: any = await fileApi.getTree()
    fileTree.value = res
    if (res.length > 0) handleNodeClick(res[0])
  } finally {
    loading.value = false
  }
}

const handleNodeClick = async (node: any) => {
  if (node.type === 'file') {
    try {
      const detail: any = await fileApi.getDetail(node.path)
      selectedFile.value = detail
    } catch {
      selectedFile.value = { ...node, lines: node.lines || 0, complexity: node.complexity || 0, issues: [] }
    }
  } else {
    selectedFile.value = { ...node, isDir: true }
  }
}

onMounted(fetchTree)

const complexityColor = (v: number) => v > 20 ? 'var(--color-danger)' : v > 10 ? 'var(--color-warning)' : 'var(--color-success)'
</script>

<template>
  <div class="analysis-page" v-loading="loading">
    <div class="analysis-layout">
      <!-- 左侧文件树 -->
      <div class="card tree-panel">
        <h4 class="panel-title">项目文件</h4>
        <el-tree
          :data="fileTree"
          :props="treeProps"
          highlight-current
          default-expand-all
          @node-click="handleNodeClick"
          class="file-tree"
        >
          <template #default="{ data }">
            <span class="tree-node">
              <span class="node-icon">{{ data.type === 'dir' ? '📁' : '📄' }}</span>
              <el-tooltip :content="data.name" placement="top-start" :show-after="500">
                <span class="node-name">{{ data.name }}</span>
              </el-tooltip>
              <span v-if="data.issues > 0" class="node-badge">{{ data.issues }}</span>
            </span>
          </template>
        </el-tree>
      </div>

      <!-- 右侧详情 -->
      <div class="detail-panel" v-if="selectedFile">
        <!-- 文件头信息 -->
        <div class="card file-header">
          <h3 class="file-path">{{ selectedFile.path || selectedFile.name }}</h3>
          <div class="file-meta">
            <div class="meta-item">
              <span class="meta-value">{{ selectedFile.size || '—' }}</span>
              <span class="meta-label">大小</span>
            </div>
            <div class="meta-item">
              <span class="meta-value">{{ selectedFile.lines || 0 }}</span>
              <span class="meta-label">行数</span>
            </div>
            <div class="meta-item">
              <span class="meta-value" :style="{ color: complexityColor(selectedFile.complexity || 0) }">
                {{ selectedFile.complexity || 0 }}
              </span>
              <span class="meta-label">复杂度</span>
            </div>
            <div class="meta-item">
              <span class="meta-value" :style="{ color: (selectedFile.issueCount || 0) > 0 ? 'var(--color-danger)' : 'var(--color-success)' }">
                {{ selectedFile.issueCount || 0 }}
              </span>
              <span class="meta-label">问题数</span>
            </div>
          </div>
        </div>

        <!-- Tab 切换 -->
        <div class="card content-panel">
          <div class="tab-bar">
            <span class="tab-item" :class="{ active: activeTab === 'overview' }" @click="activeTab = 'overview'">概览</span>
            <span class="tab-item" :class="{ active: activeTab === 'issues' }" @click="activeTab = 'issues'">问题</span>
            <span class="tab-item" :class="{ active: activeTab === 'deps' }" @click="activeTab = 'deps'">依赖</span>
            <span class="tab-item" :class="{ active: activeTab === 'stats' }" @click="activeTab = 'stats'">统计</span>
          </div>

          <!-- 概览 -->
          <div v-if="activeTab === 'overview'" class="tab-content">
            <div class="code-viewer" v-if="selectedFile.codeLines">
              <div v-for="(line, idx) in selectedFile.codeLines" :key="idx" class="cv-line" :class="{ 'cv-highlight': line.hasIssue }">
                <span class="cv-num">{{ line.num }}</span>
                <span class="cv-code">{{ line.code }}</span>
                <span v-if="line.hasIssue" class="cv-issue-tag">⚠ {{ line.issueText }}</span>
              </div>
            </div>
            <div v-else class="empty-state">选择一个文件以查看代码概览</div>
          </div>

          <!-- 问题列表 -->
          <div v-if="activeTab === 'issues'" class="tab-content">
            <div v-if="!selectedFile.issues || selectedFile.issues.length === 0" class="empty-state">该文件暂无审查意见</div>
            <div v-for="issue in (selectedFile.issues || [])" :key="issue.id" class="issue-card">
              <div class="issue-header">
                <span class="severity-badge" :class="`severity-${issue.severity}`">{{ issue.severity === 'high' ? '高危' : issue.severity === 'medium' ? '中等' : '建议' }}</span>
                <span class="issue-loc">第 {{ issue.line }} 行</span>
              </div>
              <p class="issue-text">{{ issue.message }}</p>
            </div>
          </div>

          <!-- 依赖关系 -->
          <div v-if="activeTab === 'deps'" class="tab-content">
            <div class="dep-section">
              <h5>引用的模块</h5>
              <div class="dep-list">
                <span v-for="d in (selectedFile.imports || ['暂无数据'])" :key="d" class="dep-tag">{{ d }}</span>
              </div>
            </div>
            <div class="dep-section" style="margin-top: 24px">
              <h5>被引用于</h5>
              <div class="dep-list">
                <span v-for="d in (selectedFile.usedBy || ['暂无数据'])" :key="d" class="dep-tag used-by">{{ d }}</span>
              </div>
            </div>
          </div>

          <!-- 统计 -->
          <div v-if="activeTab === 'stats'" class="tab-content">
            <div class="stats-grid">
              <div class="stat-block">
                <span class="stat-num">{{ selectedFile.tsPercent || 0 }}%</span>
                <span class="stat-desc">TypeScript 覆盖率</span>
              </div>
              <div class="stat-block">
                <span class="stat-num">{{ selectedFile.commentRate || 0 }}%</span>
                <span class="stat-desc">注释率</span>
              </div>
              <div class="stat-block">
                <span class="stat-num">{{ selectedFile.avgFnLength || 0 }}</span>
                <span class="stat-desc">平均函数长度</span>
              </div>
              <div class="stat-block">
                <span class="stat-num">{{ selectedFile.maxFnLength || 0 }}</span>
                <span class="stat-desc">最长函数行数</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analysis-layout { display: flex; gap: 24px; height: calc(100vh - 130px); }
.tree-panel { width: 320px; flex-shrink: 0; overflow: auto; padding: 20px; }
.panel-title { font-size: 16px; font-weight: 600; margin-bottom: 16px; color: var(--color-text); }
.file-tree { background: transparent; }
:deep(.el-tree-node__content) { height: 36px; border-radius: 6px; padding: 0 8px; }
:deep(.el-tree-node__content:hover) { background: var(--color-bg-hover); }
.tree-node { display: flex; align-items: center; gap: 8px; font-size: 13px; width: 100%; overflow: hidden; }
.node-icon { font-size: 14px; flex-shrink: 0; }
.node-name { flex: 1; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; display: block; }
.node-badge { font-size: 11px; background: rgba(248, 81, 73, 0.15); color: #f85149; padding: 1px 6px; border-radius: 10px; font-weight: 600; flex-shrink: 0; }

.detail-panel { flex: 1; display: flex; flex-direction: column; gap: 24px; overflow-y: auto; }
.file-header { padding: 24px; }
.file-path { font-size: 18px; font-weight: 600; color: var(--color-text); margin-bottom: 20px; letter-spacing: -0.01em; font-family: 'SF Mono', 'Fira Code', monospace; }
.file-meta { display: flex; gap: 32px; }
.meta-item { display: flex; flex-direction: column; align-items: center; }
.meta-value { font-size: 24px; font-weight: 700; color: var(--color-text); letter-spacing: -0.02em; }
.meta-label { font-size: 12px; color: var(--color-text-secondary); margin-top: 4px; font-weight: 500; }

.content-panel { flex: 1; overflow-y: auto; padding: 0; }
.tab-bar { display: flex; gap: 0; border-bottom: 1px solid var(--color-border); padding: 0 24px; }
.tab-item {
  padding: 16px 20px; font-size: 14px; font-weight: 500; color: var(--color-text-secondary);
  cursor: pointer; border-bottom: 2px solid transparent; transition: all 0.2s;
}
.tab-item:hover { color: var(--color-text); }
.tab-item.active { color: var(--color-accent); border-bottom-color: var(--color-accent); }
.tab-content { padding: 24px; }

.code-viewer { background: var(--color-bg); border-radius: 8px; padding: 16px; font-family: 'SF Mono', 'Fira Code', monospace; font-size: 13px; overflow-x: auto; border: 1px solid var(--color-border); }
.cv-line { display: flex; line-height: 1.8; color: var(--color-text); }
.cv-highlight { background: rgba(248, 81, 73, 0.1); border-radius: 4px; }
.cv-num { width: 40px; color: var(--color-text-tertiary); text-align: right; margin-right: 16px; flex-shrink: 0; user-select: none; }
.cv-code { flex: 1; white-space: pre; }
.cv-issue-tag { color: var(--color-warning); font-weight: 600; margin-left: 16px; font-size: 12px; }

.issue-card { padding: 16px; border: 1px solid var(--color-border); border-radius: 8px; margin-bottom: 12px; }
.issue-header { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
.issue-loc { font-family: monospace; font-size: 13px; color: var(--color-text-secondary); }
.issue-text { font-size: 14px; line-height: 1.6; color: var(--color-text); }

.dep-section h5 { font-size: 14px; font-weight: 600; color: var(--color-text); margin-bottom: 12px; }
.dep-list { display: flex; flex-wrap: wrap; gap: 8px; }
.dep-tag { padding: 6px 14px; background: rgba(88, 166, 255, 0.1); color: var(--color-accent); border-radius: 6px; font-size: 13px; font-weight: 500; }
.dep-tag.used-by { background: rgba(63, 185, 80, 0.1); color: var(--color-success); }

.stats-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.stat-block { background: var(--color-bg); padding: 24px; border-radius: 8px; text-align: center; border: 1px solid var(--color-border); }
.stat-num { font-size: 28px; font-weight: 700; color: var(--color-text); display: block; }
.stat-desc { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; font-weight: 500; }

.empty-state { text-align: center; padding: 48px; color: var(--color-text-secondary); font-size: 14px; }
</style>
