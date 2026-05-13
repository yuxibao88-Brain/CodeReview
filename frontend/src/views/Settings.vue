<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { settingsApi } from '@/api'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t, locale } = useI18n()

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
    ElMessage.success(t('settings.messages.saveSuccess'))
  } finally {
    loading.value = false
  }
}

const handleTest = () => {
  ElMessage.info(t('settings.messages.testTesting'))
  setTimeout(() => ElMessage.success(t('settings.messages.testSuccess')), 1000)
}

watch(() => generalForm.value.language, (newLang) => {
  if (newLang) {
    locale.value = newLang
    localStorage.setItem('code-review-lang', newLang)
  }
})
</script>

<template>
  <div class="settings-page" v-loading="loading">
    <el-tabs v-model="activeTab" class="settings-tabs">
      <el-tab-pane :label="$t('settings.tabs.general')" name="general">
        <div class="card settings-section">
          <h3 class="section-title">{{ $t('settings.general.title') }}</h3>
          <el-form :model="generalForm" label-width="140px" label-position="left">
            <el-form-item :label="$t('settings.general.systemName')">
              <el-input v-model="generalForm.siteName" style="width: 320px" />
            </el-form-item>
            <el-form-item :label="$t('settings.general.language')">
              <el-select v-model="generalForm.language" style="width: 200px">
                <el-option label="简体中文" value="zh-CN" />
                <el-option label="English" value="en-US" />
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('settings.general.autoAssign')">
              <el-switch v-model="generalForm.autoAssign" />
            </el-form-item>
            <el-form-item :label="$t('settings.general.maxReviewers')">
              <el-input-number v-model="generalForm.maxReviewers" :min="1" :max="10" />
            </el-form-item>
            <el-form-item :label="$t('settings.general.reviewTimeout')">
              <el-input-number v-model="generalForm.reviewTimeout" :min="1" :max="168" :step="12" />
            </el-form-item>
          </el-form>
          <div class="section-actions">
            <el-button type="primary" @click="handleSave('general', generalForm)">{{ $t('settings.general.saveBtn') }}</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="$t('settings.tabs.notify')" name="notify">
        <div class="card settings-section">
          <h3 class="section-title">{{ $t('settings.notify.title') }}</h3>
          <el-form :model="notifyForm" label-width="160px" label-position="left">
            <el-form-item :label="$t('settings.notify.email')"><el-switch v-model="notifyForm.email" /></el-form-item>
            <el-form-item :label="$t('settings.notify.browser')"><el-switch v-model="notifyForm.browser" /></el-form-item>
            <el-form-item :label="$t('settings.notify.onAssign')"><el-switch v-model="notifyForm.onAssign" /></el-form-item>
            <el-form-item :label="$t('settings.notify.onComment')"><el-switch v-model="notifyForm.onComment" /></el-form-item>
          </el-form>
          <div class="section-actions">
            <el-button type="primary" @click="handleSave('notify', notifyForm)">{{ $t('settings.notify.saveBtn') }}</el-button>
          </div>
        </div>
      </el-tab-pane>

      <el-tab-pane :label="$t('settings.tabs.git')" name="git">
        <div class="card settings-section">
          <h3 class="section-title">{{ $t('settings.git.title') }}</h3>
          <el-form :model="gitForm" label-width="160px" label-position="left">
            <el-form-item :label="$t('settings.git.url')">
              <el-input v-model="gitForm.url" style="width: 360px" :placeholder="$t('settings.git.urlPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('settings.git.token')">
              <el-input v-model="gitForm.token" type="password" show-password style="width: 360px" :placeholder="$t('settings.git.tokenPlaceholder')" />
            </el-form-item>
            <el-form-item :label="$t('settings.git.autoPull')"><el-switch v-model="gitForm.autoPull" /></el-form-item>
            <el-form-item :label="$t('settings.git.defaultBranch')">
              <el-input v-model="gitForm.defaultBranch" style="width: 200px" />
            </el-form-item>
          </el-form>
          <div class="section-actions">
            <el-button @click="handleTest">{{ $t('settings.git.testBtn') }}</el-button>
            <el-button type="primary" @click="handleSave('git', gitForm)">{{ $t('settings.git.saveBtn') }}</el-button>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<style scoped>
.settings-page { max-width: 800px; padding: 24px; }
.settings-section { 
  margin-bottom: 24px; 
  padding: 32px; 
  background: var(--color-bg-card); 
  border: 1px solid var(--color-border); 
  border-radius: 12px; 
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); 
}
.section-title {
  font-size: 16px; font-weight: 600;
  margin-bottom: 32px; padding-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text);
  letter-spacing: -0.01em;
}
.section-actions {
  margin-top: 32px; padding-top: 24px;
  border-top: 1px solid var(--color-border);
  display: flex; justify-content: flex-end; gap: 16px;
}
:deep(.el-tabs__item) { color: var(--color-text-secondary); font-size: 14px; font-weight: 500; padding: 0 24px; height: 48px; line-height: 48px; }
:deep(.el-tabs__item.is-active) { color: var(--color-accent); font-weight: 600; }
:deep(.el-tabs__active-bar) { height: 3px; border-radius: 3px 3px 0 0; }
:deep(.el-tabs__nav-wrap::after) { background: var(--color-border); height: 1px; }
:deep(.el-form-item) { margin-bottom: 24px; }
:deep(.el-form-item__label) { color: var(--color-text-secondary) !important; font-weight: 500; }
:deep(.el-input__wrapper), 
:deep(.el-select .el-input__wrapper), 
:deep(.el-select__wrapper) { 
  background: var(--color-bg) !important; 
  border: 1px solid var(--color-border) !important; 
  box-shadow: none !important; 
  padding: 0 12px;
  border-radius: 6px;
  transition: all 0.2s;
}
:deep(.el-input__wrapper:hover), 
:deep(.el-select .el-input__wrapper:hover), 
:deep(.el-select__wrapper:hover) {
  border-color: rgba(255, 255, 255, 0.2) !important;
}
:deep(.el-input__wrapper.is-focus), 
:deep(.el-select .el-input__wrapper.is-focus), 
:deep(.el-select__wrapper.is-focused) {
  border-color: var(--color-accent) !important;
  box-shadow: 0 0 0 1px var(--color-accent) !important;
}
:deep(.el-input__inner), :deep(.el-select__placeholder) { color: var(--color-text) !important; }
:deep(.el-switch__core) { border-color: var(--color-border); }
:deep(.el-input-number__decrease), :deep(.el-input-number__increase) {
  background: var(--color-bg) !important;
  border-color: var(--color-border) !important;
  color: var(--color-text) !important;
}
:deep(.el-input-number__decrease:hover), :deep(.el-input-number__increase:hover) {
  color: var(--color-accent) !important;
}
</style>
