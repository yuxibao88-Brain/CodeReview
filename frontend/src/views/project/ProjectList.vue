<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { projectApi } from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { FolderAdd, Refresh } from '@element-plus/icons-vue'
import request from '@/api/request'

const loading = ref(true)
const searchText = ref('')
const projects = ref<any[]>([])
const showDialog = ref(false)
const scanningId = ref<number | null>(null)
const scanProgress = ref({ scanning: false, current: 0, total: 0, currentFile: '' })
let progressTimer: any = null

const form = ref({ name: '', path: '', description: '' })

const fetchProjects = async () => {
  loading.value = true
  try {
    const res: any = await projectApi.getList({})
    projects.value = res
  } finally {
    loading.value = false
  }
}

onMounted(fetchProjects)
onUnmounted(() => { if (progressTimer) clearInterval(progressTimer) })

const filteredProjects = computed(() => {
  if (!searchText.value) return projects.value
  const q = searchText.value.toLowerCase()
  return projects.value.filter((p: any) => p.name?.toLowerCase().includes(q) || p.desc?.toLowerCase().includes(q))
})

const progressPercent = computed(() => {
  if (!scanProgress.value.total) return 0
  return Math.round((scanProgress.value.current / scanProgress.value.total) * 100)
})

const startProgressPolling = () => {
  progressTimer = setInterval(async () => {
    try {
      const res: any = await request.get('/scan/progress')
      scanProgress.value = res
      if (!res.scanning) { clearInterval(progressTimer); progressTimer = null }
    } catch {}
  }, 500)
}

const handleAddProject = async () => {
  if (!form.value.name || !form.value.path) { ElMessage.warning('请输入项目名称和路径'); return }
  try {
    const res: any = await request.post('/projects', form.value)
    ElMessage.success(res.message || '项目已添加')
    showDialog.value = false
    form.value = { name: '', path: '', description: '' }
    await fetchProjects()
    if (res.id) handleScan(res.id)
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '添加失败')
  }
}

const handleScan = async (projectId: number) => {
  scanningId.value = projectId
  scanProgress.value = { scanning: true, current: 0, total: 0, currentFile: '准备中...' }
  startProgressPolling()
  try {
    const res: any = await request.post(`/projects/${projectId}/scan`)
    ElMessage.success(`扫描完成: 发现 ${res.summary?.total || 0} 个问题`)
    await fetchProjects()
  } catch (err: any) {
    ElMessage.error(err?.response?.data?.message || '扫描失败')
  } finally {
    scanningId.value = null
    scanProgress.value = { scanning: false, current: 0, total: 0, currentFile: '' }
    if (progressTimer) { clearInterval(progressTimer); progressTimer = null }
  }
}

const handleDelete = async (projectId: number, name: string) => {
  await ElMessageBox.confirm(`确定要删除项目「${name}」吗？`, '确认删除', { type: 'warning' })
  try {
    await request.delete(`/projects/${projectId}`)
    ElMessage.success('项目已删除')
    await fetchProjects()
  } catch { ElMessage.error('删除失败') }
}
</script>

<template>
  <div>
    <div class="toolbar">
      <h2 class="page-title">项目概览</h2>
      <div class="toolbar-actions">
        <el-input v-model="searchText" placeholder="搜索项目..." class="search-input" clearable />
        <el-button type="primary" class="primary-btn" :icon="FolderAdd" @click="showDialog = true">添加项目</el-button>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-if="!loading && projects.length === 0" class="card empty-hero">
      <div class="empty-icon">📁</div>
      <h3>尚未添加任何项目</h3>
      <p>添加您的代码项目路径，系统将自动扫描分析</p>
      <el-button type="primary" :icon="FolderAdd" @click="showDialog = true" size="large">添加第一个项目</el-button>
    </div>

    <!-- 项目卡片 -->
    <div class="project-grid" v-loading="loading" v-else>
      <div v-for="p in filteredProjects" :key="p.id" class="card project-card">
        <div class="card-header">
          <div class="project-info">
            <div class="project-avatar">{{ p.name?.charAt(0).toUpperCase() }}</div>
            <div>
              <div class="project-name">{{ p.name }}</div>
              <div class="project-path">{{ p.path }}</div>
            </div>
          </div>
          <el-button size="small" :icon="Refresh" :loading="scanningId === p.id" @click="handleScan(p.id)">
            {{ scanningId === p.id ? '扫描中' : '重新扫描' }}
          </el-button>
        </div>

        <!-- 扫描进度条 -->
        <div v-if="scanningId === p.id" class="scan-progress">
          <div class="progress-bar-wrap">
            <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="progress-info">
            <span class="progress-text">{{ progressPercent }}% ({{ scanProgress.current }}/{{ scanProgress.total }})</span>
            <span class="progress-file">{{ scanProgress.currentFile }}</span>
          </div>
        </div>

        <div class="project-desc" v-if="p.desc">{{ p.desc }}</div>
        <div class="card-footer">
          <div class="last-active">更新: {{ p.updated || '—' }}</div>
          <el-button size="small" type="danger" link @click.stop="handleDelete(p.id, p.name)">删除</el-button>
        </div>
      </div>
    </div>

    <!-- 添加项目弹窗 -->
    <el-dialog v-model="showDialog" title="添加项目" width="520px" :close-on-click-modal="false">
      <el-form :model="form" label-width="80px" label-position="left">
        <el-form-item label="项目名称" required>
          <el-input v-model="form.name" placeholder="如：前端项目" />
        </el-form-item>
        <el-form-item label="项目路径" required>
          <el-input v-model="form.path" placeholder="如：/Users/xxx/my-project" />
          <div class="path-hint">请输入项目在本机的绝对路径</div>
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="简要描述项目" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" @click="handleAddProject">添加并扫描</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.toolbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.page-title { font-size: 24px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; }
.toolbar-actions { display: flex; align-items: center; gap: 16px; }
.search-input { width: 280px; }
:deep(.search-input .el-input__wrapper) { border-radius: 8px; box-shadow: none !important; border: 1px solid var(--color-border); padding: 8px 12px; }
:deep(.search-input .el-input__wrapper.is-focus) { border-color: var(--color-accent); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important; }
.primary-btn { background-color: var(--color-accent); border-color: var(--color-accent); border-radius: 8px; padding: 0 20px; height: 38px; font-weight: 500; }

.empty-hero { display: flex; flex-direction: column; align-items: center; padding: 80px 40px; text-align: center; }
.empty-icon { font-size: 64px; margin-bottom: 20px; }
.empty-hero h3 { font-size: 20px; font-weight: 600; color: var(--color-text); margin-bottom: 8px; }
.empty-hero p { font-size: 14px; color: var(--color-text-secondary); margin-bottom: 24px; }

.project-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(380px, 1fr)); gap: 24px; }
.project-card { padding: 24px; display: flex; flex-direction: column; }
.card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.project-info { display: flex; align-items: center; gap: 16px; }
.project-avatar { width: 48px; height: 48px; border-radius: 12px; background: linear-gradient(135deg, var(--color-accent), #8b5cf6); display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 600; color: #fff; flex-shrink: 0; }
.project-name { font-size: 18px; font-weight: 600; color: var(--color-text); letter-spacing: -0.01em; margin-bottom: 4px; }
.project-path { font-size: 12px; color: var(--color-text-tertiary); font-family: monospace; max-width: 240px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.project-desc { font-size: 14px; color: var(--color-text-secondary); line-height: 1.6; flex: 1; margin-bottom: 24px; }
.card-footer { display: flex; align-items: center; justify-content: space-between; padding-top: 16px; border-top: 1px solid var(--color-border); margin-top: auto; }
.last-active { font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
.path-hint { font-size: 12px; color: var(--color-text-tertiary); margin-top: 4px; }

/* 扫描进度 */
.scan-progress { margin-bottom: 16px; }
.progress-bar-wrap { height: 6px; background: var(--color-border); border-radius: 3px; overflow: hidden; margin-bottom: 8px; }
.progress-bar-fill { height: 100%; background: linear-gradient(90deg, var(--color-accent), #8b5cf6); border-radius: 3px; transition: width 0.3s ease; }
.progress-info { display: flex; justify-content: space-between; align-items: center; }
.progress-text { font-size: 13px; font-weight: 600; color: var(--color-accent); }
.progress-file { font-size: 12px; color: var(--color-text-tertiary); font-family: monospace; max-width: 280px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; text-align: right; }
</style>
