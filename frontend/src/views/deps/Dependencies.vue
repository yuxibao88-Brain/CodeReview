<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { depsApi } from '@/api'

const loading = ref(true)
const activeTab = ref('packages')
const packages = ref<any[]>([])
const circular = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  try {
    const [pkgRes, circRes]: any = await Promise.all([depsApi.getPackages(), depsApi.getCircular()])
    packages.value = pkgRes
    circular.value = circRes
  } finally {
    loading.value = false
  }
}
onMounted(fetchData)

const statusType = (s: string) => s === 'ok' ? 'ok' : s === 'outdated' ? 'warn' : 'error'
</script>

<template>
  <div v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">依赖管理</h2>
      <div class="tab-bar">
        <span class="tab" :class="{ active: activeTab === 'packages' }" @click="activeTab = 'packages'">第三方依赖</span>
        <span class="tab" :class="{ active: activeTab === 'circular' }" @click="activeTab = 'circular'">循环依赖</span>
      </div>
    </div>

    <div v-if="activeTab === 'packages'" class="card">
      <el-table :data="packages" style="width: 100%">
        <el-table-column prop="name" label="包名" min-width="180">
          <template #default="{ row }"><span style="font-weight: 600; font-family: monospace">{{ row.name }}</span></template>
        </el-table-column>
        <el-table-column prop="current" label="当前版本" width="120" align="center" />
        <el-table-column prop="latest" label="最新版本" width="120" align="center" />
        <el-table-column prop="size" label="体积" width="100" align="center" />
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <span class="status-icon" :class="statusType(row.status)">
              <svg v-if="row.status === 'ok'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-success)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              <svg v-else-if="row.status === 'outdated'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-warning)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="var(--color-danger)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            </span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="activeTab === 'circular'">
      <div v-if="circular.length === 0" class="card empty-state">未检测到循环依赖</div>
      <div v-for="(c, i) in circular" :key="i" class="card circ-card">
        <span class="circ-icon" :class="c.severity === 'high' ? 'high' : 'medium'">
          <svg v-if="c.severity === 'high'" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#f85149" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#d29922" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <span class="circ-path">{{ c.path }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; }
.tab-bar { display: flex; gap: 4px; background: var(--color-bg); padding: 4px; border-radius: 8px; }
.tab { padding: 8px 16px; font-size: 13px; font-weight: 500; color: var(--color-text-secondary); cursor: pointer; border-radius: 6px; transition: all 0.2s; }
.tab.active { background: var(--color-bg-card); color: var(--color-text); box-shadow: var(--shadow-sm); }

:deep(.el-table) {
  --el-table-bg-color: transparent;
  --el-table-tr-bg-color: transparent;
  --el-table-header-bg-color: transparent;
  --el-table-border-color: var(--color-border);
  --el-table-text-color: var(--color-text);
  --el-table-header-text-color: var(--color-text-secondary);
  --el-table-row-hover-bg-color: var(--color-bg-hover);
  background-color: transparent;
}
:deep(.el-table th.el-table__cell) { background: transparent !important; border-bottom: 1px solid var(--color-border); font-weight: 500; font-size: 13px; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid var(--color-border); }
:deep(.el-table__inner-wrapper::before) { display: none; }

.circ-card { display: flex; align-items: center; gap: 12px; padding: 16px 24px; margin-bottom: 12px; }
.circ-icon { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; flex-shrink: 0; }
.circ-icon.high { background: rgba(248, 81, 73, 0.12); }
.circ-icon.medium { background: rgba(210, 153, 34, 0.12); }
.status-icon { display: inline-flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; }
.status-icon.ok { background: rgba(16, 185, 129, 0.12); }
.status-icon.warn { background: rgba(210, 153, 34, 0.12); }
.status-icon.error { background: rgba(248, 81, 73, 0.12); }
.circ-path { font-family: monospace; font-size: 14px; color: var(--color-text); }
.empty-state { text-align: center; padding: 48px; color: var(--color-text-secondary); }
</style>
