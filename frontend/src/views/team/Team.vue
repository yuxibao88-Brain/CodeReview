<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { teamApi } from '@/api'

const loading = ref(true)
const activeTab = ref('members')
const members = ref<any[]>([])
const owners = ref<any[]>([])

const fetchData = async () => {
  loading.value = true
  try {
    const [mRes, oRes]: any = await Promise.all([teamApi.getMembers(), teamApi.getOwners()])
    members.value = mRes
    owners.value = oRes
  } finally {
    loading.value = false
  }
}
onMounted(fetchData)
</script>

<template>
  <div v-loading="loading">
    <div class="page-header">
      <h2 class="page-title">{{ $t('team.title') }}</h2>
      <div class="tab-bar">
        <span class="tab" :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'">{{ $t('team.tabs.members') }}</span>
        <span class="tab" :class="{ active: activeTab === 'owners' }" @click="activeTab = 'owners'">{{ $t('team.tabs.owners') }}</span>
      </div>
    </div>

    <div v-if="activeTab === 'members'" class="card">
      <el-table :data="members" style="width: 100%">
        <el-table-column :label="$t('team.members.member')" min-width="160">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 12px">
              <el-avatar :size="32" style="background: var(--color-accent); font-weight: 600; font-size: 14px; color: white">{{ row.name.charAt(0) }}</el-avatar>
              <span style="font-weight: 600">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="commits" :label="$t('team.members.commits')" width="100" align="center" />
        <el-table-column prop="reviews" :label="$t('team.members.reviews')" width="100" align="center" />
        <el-table-column prop="pending" :label="$t('team.members.pending')" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.pending > 3 ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 600 }">{{ row.pending }}</span>
          </template>
        </el-table-column>
        <el-table-column :label="$t('team.members.issueRate')" width="120" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.issueRate > 3 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }">{{ row.issueRate }}%</span>
          </template>
        </el-table-column>
        <template #empty>
          <el-empty :description="$t('team.members.empty')" :image-size="120">
            <el-button type="primary" plain size="small">{{ $t('team.members.invite') }}</el-button>
          </el-empty>
        </template>
      </el-table>
    </div>

    <div v-if="activeTab === 'owners'">
      <template v-if="owners && owners.length > 0">
        <div v-for="o in owners" :key="o.path" class="card owner-card">
          <span class="owner-path">{{ o.path }}</span>
          <span class="owner-arrow">→</span>
          <div class="owner-names">
            <el-tag v-for="name in o.owners" :key="name" size="small" effect="plain">{{ name }}</el-tag>
          </div>
        </div>
      </template>
      <el-empty v-else :description="$t('team.owners.empty')" :image-size="120">
        <el-button type="primary" plain size="small">{{ $t('team.owners.add') }}</el-button>
      </el-empty>
    </div>
  </div>
</template>

<style scoped>
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border); }
.page-title { font-size: 24px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; display: flex; align-items: center; gap: 8px; }
.tab-bar { display: flex; gap: 6px; background: rgba(0, 0, 0, 0.2); padding: 6px; border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.05); }
.tab { padding: 8px 20px; font-size: 13px; font-weight: 600; color: var(--color-text-secondary); cursor: pointer; border-radius: 6px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
.tab:hover { color: var(--color-text); }
.tab.active { background: var(--color-accent); color: white; box-shadow: 0 2px 8px rgba(74, 140, 246, 0.3); }
:deep(.el-table), :deep(.el-table__expanded-cell) { background-color: transparent !important; }
:deep(.el-table th.el-table__cell) { background-color: transparent !important; border-bottom: 1px solid var(--color-border); font-weight: 500; font-size: 13px; }
:deep(.el-table tr) { background-color: transparent !important; }
:deep(.el-table td.el-table__cell) { background-color: transparent !important; border-bottom: 1px solid var(--color-border); padding: 16px 0; }
:deep(.el-table__inner-wrapper::before) { display: none; }
:deep(.el-table:not(.el-table--border) .el-table__cell) { background-color: transparent !important; }

.owner-card { display: flex; align-items: center; gap: 16px; padding: 20px 24px; margin-bottom: 12px; transition: transform 0.2s; border: 1px solid transparent; }
.owner-card:hover { transform: translateX(4px); border-color: var(--color-border); background: var(--color-bg-hover); }
.owner-path { font-family: 'JetBrains Mono', monospace; font-size: 14px; color: var(--color-text); font-weight: 500; min-width: 280px; }
.owner-arrow { color: var(--color-text-secondary); opacity: 0.5; }
.owner-names { display: flex; gap: 8px; }
</style>
