<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { perfApi } from '@/api'

const loading = ref(true)
const activeTab = ref('bundle')
const bundle = ref<any>({})
const largeFiles = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  try {
    const [bundleRes, filesRes]: any = await Promise.all([perfApi.getBundle(), perfApi.getLargeFiles()])
    bundle.value = bundleRes
    largeFiles.value = filesRes
  } finally {
    loading.value = false
  }
}
onMounted(fetchData)
</script>

<template>
  <div v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">性能监控</h2>
      <div class="tab-bar">
        <span class="tab" :class="{ active: activeTab === 'bundle' }" @click="activeTab = 'bundle'">Bundle 分析</span>
        <span class="tab" :class="{ active: activeTab === 'files' }" @click="activeTab = 'files'">大文件排行</span>
      </div>
    </div>

    <!-- Bundle 分析 -->
    <div v-if="activeTab === 'bundle'">
      <div class="card bundle-summary">
        <div class="bundle-stat">
          <span class="bs-value">{{ bundle.totalSize || '—' }}</span>
          <span class="bs-label">总体积</span>
        </div>
        <div class="bundle-stat">
          <span class="bs-value">{{ bundle.gzipSize || '—' }}</span>
          <span class="bs-label">Gzip 压缩</span>
        </div>
        <div class="bundle-stat">
          <span class="bs-value">{{ bundle.chunks || 0 }}</span>
          <span class="bs-label">Chunks</span>
        </div>
        <div class="bundle-stat">
          <span class="bs-value">{{ bundle.lazyRate || 0 }}%</span>
          <span class="bs-label">懒加载率</span>
        </div>
      </div>
      <div class="card" style="margin-top: 24px; padding: 24px">
        <h4 class="section-title">Bundle 组成</h4>
        <div class="treemap">
          <div v-for="item in (bundle.components || [])" :key="item.name" class="treemap-block" :style="{ flex: item.size, background: item.color }">
            <span class="tm-name">{{ item.name }}</span>
            <span class="tm-size">{{ item.sizeLabel }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 大文件排行 -->
    <div v-if="activeTab === 'files'" class="card">
      <div v-for="(f, i) in largeFiles" :key="f.path" class="large-file-row">
        <span class="rank">{{ i + 1 }}</span>
        <span class="file-path">{{ f.path }}</span>
        <span class="file-size">{{ f.size }}</span>
        <span class="file-note" v-if="f.note">← {{ f.note }}</span>
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

.bundle-summary { display: flex; gap: 0; }
.bundle-stat { flex: 1; padding: 24px; text-align: center; border-right: 1px solid var(--color-border); }
.bundle-stat:last-child { border-right: none; }
.bs-value { display: block; font-size: 28px; font-weight: 700; color: var(--color-text); letter-spacing: -0.03em; }
.bs-label { font-size: 13px; color: var(--color-text-secondary); margin-top: 4px; font-weight: 500; }

.section-title { font-size: 16px; font-weight: 600; margin-bottom: 20px; color: var(--color-text); }
.treemap { display: flex; gap: 8px; height: 160px; border-radius: 8px; overflow: hidden; }
.treemap-block { display: flex; flex-direction: column; align-items: center; justify-content: center; color: white; border-radius: 4px; min-width: 60px; }
.tm-name { font-size: 13px; font-weight: 600; }
.tm-size { font-size: 11px; opacity: 0.8; margin-top: 4px; }

.large-file-row { display: flex; align-items: center; gap: 16px; padding: 16px 24px; border-bottom: 1px solid var(--color-border); }
.large-file-row:last-child { border-bottom: none; }
.rank { width: 24px; height: 24px; background: var(--color-bg); border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 600; color: var(--color-text-secondary); }
.file-path { flex: 1; font-family: monospace; font-size: 14px; color: var(--color-text); font-weight: 500; }
.file-size { font-size: 14px; font-weight: 600; color: var(--color-text); }
.file-note { font-size: 13px; color: var(--color-text-secondary); }
</style>
