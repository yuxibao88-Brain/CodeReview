<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { securityApi } from '@/api'

const loading = ref(true)
const vulns = ref<any[]>([])
const sensitive = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  try {
    const [vRes, sRes]: any = await Promise.all([securityApi.getVulnerabilities(), securityApi.getSensitive()])
    vulns.value = vRes
    sensitive.value = sRes
  } finally {
    loading.value = false
  }
}
onMounted(fetchData)

const severityConfig: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: '#f85149', bg: 'rgba(248, 81, 73, 0.15)', label: '高危' },
  medium: { color: '#d29922', bg: 'rgba(210, 153, 34, 0.15)', label: '中危' },
  low:    { color: '#58a6ff', bg: 'rgba(88, 166, 255, 0.15)', label: '低危' },
}
</script>

<template>
  <div v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">安全审计</h2>
      <div class="severity-summary">
        <span class="ss-item high">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#f85149" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          高危 {{ vulns.filter(v => v.severity === 'high').length }}
        </span>
        <span class="ss-item medium">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#d29922" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          中危 {{ vulns.filter(v => v.severity === 'medium').length }}
        </span>
        <span class="ss-item low">
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#58a6ff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          低危 {{ vulns.filter(v => v.severity === 'low').length }}
        </span>
      </div>
    </div>

    <!-- 漏洞列表 -->
    <div class="section-label">漏洞扫描</div>
    <div class="vuln-list">
      <div v-for="v in vulns" :key="v.id" class="card vuln-card">
        <div class="vuln-header">
          <span class="vuln-severity" :style="{ color: severityConfig[v.severity]?.color, background: severityConfig[v.severity]?.bg }">
            <svg v-if="v.severity === 'high'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <svg v-else-if="v.severity === 'medium'" viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            <svg v-else viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            {{ severityConfig[v.severity]?.label }}
          </span>
          <span class="vuln-title">{{ v.title }}</span>
        </div>
        <p class="vuln-desc">{{ v.description }}</p>
        <div class="vuln-fix" v-if="v.fix">
          <span class="fix-label">建议:</span> {{ v.fix }}
        </div>
      </div>
    </div>

    <!-- 敏感信息 -->
    <div class="section-label" style="margin-top: 32px">敏感信息检测</div>
    <div class="card">
      <div v-for="s in sensitive" :key="s.id" class="sensitive-row">
        <span class="s-icon">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#d29922" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        </span>
        <span class="s-msg">{{ s.message }}</span>
        <span class="s-file">{{ s.file }}</span>
      </div>
      <div v-if="sensitive.length === 0" class="empty-state">未检测到敏感信息泄露</div>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
.page-title { font-size: 24px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; }
.severity-summary { display: flex; gap: 16px; }
.ss-item { font-size: 14px; font-weight: 600; color: var(--color-text); display: inline-flex; align-items: center; gap: 5px; }

.section-label { font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 16px; }
.vuln-list { display: flex; flex-direction: column; gap: 16px; }
.vuln-card { padding: 20px 24px; }
.vuln-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.vuln-severity { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; }
.vuln-title { font-size: 15px; font-weight: 600; color: var(--color-text); }
.vuln-desc { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; }
.vuln-fix { margin-top: 12px; font-size: 13px; color: var(--color-success); background: rgba(16, 185, 129, 0.1); padding: 8px 14px; border-radius: 6px; border: 1px solid rgba(16, 185, 129, 0.2); }
.fix-label { font-weight: 600; }

.sensitive-row { display: flex; align-items: center; gap: 12px; padding: 14px 24px; border-bottom: 1px solid var(--color-border); }
.sensitive-row:last-child { border-bottom: none; }
.s-icon { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; border-radius: 6px; background: rgba(210, 153, 34, 0.12); flex-shrink: 0; }
.s-msg { flex: 1; font-size: 14px; color: var(--color-text); }
.s-file { font-family: monospace; font-size: 13px; color: var(--color-text-secondary); }
.empty-state { text-align: center; padding: 48px; color: var(--color-text-secondary); }
</style>
