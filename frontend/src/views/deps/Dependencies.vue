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

const statusIcon = (s: string) => s === 'ok' ? '✅' : s === 'outdated' ? '⚠️' : '🔴'
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
          <template #default="{ row }">{{ statusIcon(row.status) }}</template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="activeTab === 'circular'">
      <div v-if="circular.length === 0" class="card empty-state">未检测到循环依赖</div>
      <div v-for="(c, i) in circular" :key="i" class="card circ-card">
        <span class="circ-icon">{{ c.severity === 'high' ? '🔴' : '🟡' }}</span>
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
:deep(.el-table th.el-table__cell) { background: transparent !important; border-bottom: 1px solid var(--color-border); font-weight: 500; font-size: 13px; }
:deep(.el-table td.el-table__cell) { border-bottom: 1px solid #f1f5f9; }
:deep(.el-table__inner-wrapper::before) { display: none; }
.circ-card { display: flex; align-items: center; gap: 12px; padding: 16px 24px; margin-bottom: 12px; }
.circ-icon { font-size: 16px; }
.circ-path { font-family: monospace; font-size: 14px; color: var(--color-text); }
.empty-state { text-align: center; padding: 48px; color: var(--color-text-secondary); }
</style>
