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

const severityConfig: Record<string, { icon: string; color: string; bg: string; label: string }> = {
  high:   { icon: '🔴', color: '#b91c1c', bg: '#fee2e2', label: '高危' },
  medium: { icon: '🟡', color: '#b45309', bg: '#fef3c7', label: '中危' },
  low:    { icon: '🔵', color: '#1d4ed8', bg: '#dbeafe', label: '低危' },
}
</script>

<template>
  <div v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">安全审计</h2>
      <div class="severity-summary">
        <span class="ss-item high">🔴 高危 {{ vulns.filter(v => v.severity === 'high').length }}</span>
        <span class="ss-item medium">🟡 中危 {{ vulns.filter(v => v.severity === 'medium').length }}</span>
        <span class="ss-item low">🔵 低危 {{ vulns.filter(v => v.severity === 'low').length }}</span>
      </div>
    </div>

    <!-- 漏洞列表 -->
    <div class="section-label">漏洞扫描</div>
    <div class="vuln-list">
      <div v-for="v in vulns" :key="v.id" class="card vuln-card">
        <div class="vuln-header">
          <span class="vuln-severity" :style="{ color: severityConfig[v.severity]?.color, background: severityConfig[v.severity]?.bg }">
            {{ severityConfig[v.severity]?.icon }} {{ severityConfig[v.severity]?.label }}
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
        <span class="s-icon">🟡</span>
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
.ss-item { font-size: 14px; font-weight: 600; color: var(--color-text); }

.section-label { font-size: 16px; font-weight: 600; color: var(--color-text); margin-bottom: 16px; }
.vuln-list { display: flex; flex-direction: column; gap: 16px; }
.vuln-card { padding: 20px 24px; }
.vuln-header { display: flex; align-items: center; gap: 12px; margin-bottom: 12px; }
.vuln-severity { padding: 4px 12px; border-radius: 6px; font-size: 12px; font-weight: 600; }
.vuln-title { font-size: 15px; font-weight: 600; color: var(--color-text); }
.vuln-desc { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; }
.vuln-fix { margin-top: 12px; font-size: 13px; color: var(--color-success); background: #f0fdf4; padding: 8px 14px; border-radius: 6px; }
.fix-label { font-weight: 600; }

.sensitive-row { display: flex; align-items: center; gap: 12px; padding: 14px 24px; border-bottom: 1px solid var(--color-border); }
.sensitive-row:last-child { border-bottom: none; }
.s-icon { font-size: 16px; }
.s-msg { flex: 1; font-size: 14px; color: var(--color-text); }
.s-file { font-family: monospace; font-size: 13px; color: var(--color-text-secondary); }
.empty-state { text-align: center; padding: 48px; color: var(--color-text-secondary); }
</style>
