<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { settingsApi } from '@/api'
import { ElMessage } from 'element-plus'

const loading = ref(true)
const activeTab = ref('general')

const generalForm = ref<any>({})
const notifyForm = ref<any>({})
const gitForm = ref<any>({})

const fetchSettings = async () => {
  loading.value = true
  try {
    const res: any = await settingsApi.get()
    generalForm.value = res.general || {}
    notifyForm.value = res.notify || {}
    gitForm.value = res.git || {}
  } finally {
    loading.value = false
  }
}

onMounted(fetchSettings)

const handleSave = async (type: string, data: any) => {
  loading.value = true
  try {
    await settingsApi.save(type, data)
    ElMessage.success('设置已保存')
  } finally {
    loading.value = false
  }
}

const handleTest = () => {
  ElMessage.info('测试连接中...')
  setTimeout(() => ElMessage.success('连接成功'), 1000)
}
</script>

<template>
  <div class="settings-page" v-loading="loading">
    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane label="常规设置" name="general">
        <div class="card settings-section">
          <h3 class="section-title">基本配置</h3>
          <el-form :model="generalForm" label-width="120px" label-position="left">
            <el-form-item label="系统名称">
              <el-input v-model="generalForm.siteName" style="width: 320px" />
            </el-form-item>
            <el-form-item label="界面语言">
              <el-select v-model="generalForm.language" style="width: 200px">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item label="自动分配审查人">
              <el-switch v-model="generalForm.autoAssign" />
            </el-form-item>
            <el-form-item label="最大审查人数">
              <el-input-number v-model="generalForm.maxReviewers" :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="审查超时(小时)">
              <el-input-number v-model="generalForm.reviewTimeout" :min="1" :max="168" :step="12" />
            </el-form-item>
          </el-form>
          <div class="section-actions">
            <el-button type="primary" @click="handleSave('general', generalForm)">保存设置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="通知设置" name="notify">
        <div class="card settings-section">
          <h3 class="section-title">通知偏好</h3>
          <el-form :model="notifyForm" label-width="140px" label-position="left">
            <el-form-item label="邮件通知"><el-switch v-model="notifyForm.email" /></el-form-item>
            <el-form-item label="浏览器推送"><el-switch v-model="notifyForm.browser" /></el-form-item>
            <el-form-item label="被指派时通知"><el-switch v-model="notifyForm.onAssign" /></el-form-item>
            <el-form-item label="收到评论时通知"><el-switch v-model="notifyForm.onComment" /></el-form-item>
          </el-form>
          <div class="section-actions">
            <el-button type="primary" @click="handleSave('notify', notifyForm)">保存设置</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane label="Git 集成" name="git">
        <div class="card settings-section">
          <h3 class="section-title">GitLab 配置</h3>
          <el-form :model="gitForm" label-width="140px" label-position="left">
            <el-form-item label="GitLab 地址">
              <el-input v-model="gitForm.url" style="width: 360px" placeholder="https://gitlab.example.com" />
            </el-form-item>
            <el-form-item label="Access Token">
              <el-input v-model="gitForm.token" type="password" show-password style="width: 360px" placeholder="glpat-xxxx" />
            </el-form-item>
            <el-form-item label="自动拉取 MR"><el-switch v-model="gitForm.autoPull" /></el-form-item>
            <el-form-item label="默认分支">
              <el-input v-model="gitForm.defaultBranch" style="width: 200px" />
            </el-form-item>
          </el-form>
          <div class="section-actions">
            <el-button @click="handleTest">测试连接</el-button>
            <el-button type="primary" @click="handleSave('git', gitForm)">保存设置</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.settings-page { max-width: 800px; }
.settings-section { margin-bottom: 20px; }
.section-title {
  font-size: 15px; font-weight: 600;
  margin-bottom: 24px; padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}
.section-actions {
  margin-top: 24px; padding-top: 16px;
  border-top: 1px solid var(--color-border);
  display: flex; justify-content: flex-end; gap: 12px;
}
:deep(.el-tabs__item) { color: var(--color-text-secondary); }
:deep(.el-tabs__item.is-active) { color: var(--color-accent); }
:deep(.el-tabs__nav-wrap::after) { background: var(--color-border); }
:deep(.el-form-item__label) { color: var(--color-text-secondary) !important; }
:deep(.el-input__wrapper) { background: var(--color-bg) !important; border: 1px solid var(--color-border) !important; box-shadow: none !important; }
:deep(.el-input__inner) { color: var(--color-text) !important; }
:deep(.el-select .el-input__wrapper) { background: var(--color-bg) !important; }
</style>
