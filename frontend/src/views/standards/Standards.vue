<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { standardsApi } from '@/api'

const loading = ref(true)
const activeTab = ref('vue')
const data = ref<any>({})

const fetchData = async () => {
  loading.value = true
  try {
    const res: any = await standardsApi.getSummary()
    data.value = res
  } finally {
    loading.value = false
  }
}

onMounted(fetchData)

const tabs = [
  { key: 'vue', label: 'Vue 规范' },
  { key: 'ts', label: 'TypeScript' },
  { key: 'i18n', label: 'i18n' },
  { key: 'naming', label: '命名规范' },
]

const complianceColor = (v: number) => v >= 80 ? 'var(--color-success)' : v >= 60 ? 'var(--color-warning)' : 'var(--color-danger)'
</script>

<template>
  <div v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">规范检查</h2>
      <span class="overall-score" v-if="data.overall">
        总体合规率: <strong :style="{ color: complianceColor(data.overall) }">{{ data.overall }}%</strong>
      </span>
    </div>

    <!-- Tab 切换 -->
    <div class="tab-bar">
      <span v-for="tab in tabs" :key="tab.key" class="tab-item" :class="{ active: activeTab === tab.key }" @click="activeTab = tab.key">
        {{ tab.label }}
      </span>
    </div>

    <!-- 规范项列表 -->
    <div class="standards-list">
      <div v-for="item in (data[activeTab] || [])" :key="item.name" class="card standard-card">
        <div class="standard-header">
          <span class="standard-icon" :class="item.pass ? 'pass' : 'fail'">
            <svg v-if="item.pass" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <svg v-else-if="item.compliance >= 60" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-warning)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <svg v-else viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="var(--color-danger)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          </span>
          <span class="standard-name">{{ item.name }}</span>
          <span class="standard-ratio">{{ item.current }}/{{ item.total }}</span>
          <span class="standard-percent" :style="{ color: complianceColor(item.compliance) }">{{ item.compliance }}%</span>
        </div>
        <el-progress :percentage="item.compliance" :show-text="false" :stroke-width="4"
          :color="complianceColor(item.compliance)" style="margin-top: 12px" />
        <div v-if="item.violations?.length" class="violations">
          <div v-for="(v, vi) in item.violations.slice(0, 3)" :key="vi" class="violation-item">
            <span class="v-file">{{ v.file }}</span>
            <span class="v-msg">{{ v.message }}</span>
          </div>
          <span v-if="item.violations.length > 3" class="more-link">
            还有 {{ item.violations.length - 3 }} 项...
          </span>
        </div>
      </div>
      <div v-if="!data[activeTab]?.length" class="card empty-state">暂无数据</div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; }
.overall-score { font-size: 15px; color: var(--color-text-secondary); }
.overall-score strong { font-size: 20px; font-weight: 700; }

.tab-bar { display: flex; gap: 4px; background: var(--color-bg-card); border: 1px solid var(--color-border); padding: 4px; border-radius: 10px; margin-bottom: 24px; width: fit-content; }
.tab-item { padding: 8px 20px; font-size: 13px; font-weight: 500; color: var(--color-text-secondary); cursor: pointer; border-radius: 8px; transition: all 0.2s; }
.tab-item:hover { color: var(--color-text); }
.tab-item.active { background: var(--color-accent); color: white; }

.standards-list { display: flex; flex-direction: column; gap: 16px; }
.standard-card { padding: 20px 24px; }
.standard-header { display: flex; align-items: center; gap: 12px; }
.standard-icon { font-size: 16px; display: flex; align-items: center; justify-content: center; width: 28px; height: 28px; border-radius: 6px; flex-shrink: 0; }
.standard-icon.pass { background: rgba(16, 185, 129, 0.12); }
.standard-icon.fail { background: rgba(239, 68, 68, 0.12); }
.standard-name { flex: 1; font-size: 14px; font-weight: 600; color: var(--color-text); }
.standard-ratio { font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
.standard-percent { font-size: 14px; font-weight: 700; min-width: 48px; text-align: right; }

.violations { margin-top: 16px; padding-top: 16px; border-top: 1px solid var(--color-border); }
.violation-item { display: flex; gap: 16px; padding: 6px 0; font-size: 13px; }
.v-file { color: var(--color-accent); font-family: monospace; font-weight: 500; flex-shrink: 0; }
.v-msg { color: var(--color-text-secondary); }
.more-link { font-size: 12px; color: var(--color-accent); margin-top: 8px; display: inline-block; cursor: pointer; }

.empty-state { text-align: center; padding: 48px; color: var(--color-text-secondary); }
</style>
