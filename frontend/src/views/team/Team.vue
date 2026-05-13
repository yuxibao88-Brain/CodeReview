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
      <h2 class="page-title">团队协作</h2>
      <div class="tab-bar">
        <span class="tab" :class="{ active: activeTab === 'members' }" @click="activeTab = 'members'">成员概览</span>
        <span class="tab" :class="{ active: activeTab === 'owners' }" @click="activeTab = 'owners'">代码 Owner</span>
      </div>
    </div>

    <div v-if="activeTab === 'members'" class="card">
      <el-table :data="members" style="width: 100%">
        <el-table-column label="成员" min-width="160">
          <template #default="{ row }">
            <div style="display: flex; align-items: center; gap: 12px">
              <el-avatar :size="32" style="background: var(--color-accent); font-weight: 600; font-size: 14px; color: white">{{ row.name.charAt(0) }}</el-avatar>
              <span style="font-weight: 600">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="commits" label="提交数" width="100" align="center" />
        <el-table-column prop="reviews" label="审查数" width="100" align="center" />
        <el-table-column prop="pending" label="待处理" width="100" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.pending > 3 ? 'var(--color-danger)' : 'var(--color-text)', fontWeight: 600 }">{{ row.pending }}</span>
          </template>
        </el-table-column>
        <el-table-column label="问题引入率" width="120" align="center">
          <template #default="{ row }">
            <span :style="{ color: row.issueRate > 3 ? 'var(--color-danger)' : 'var(--color-success)', fontWeight: 600 }">{{ row.issueRate }}%</span>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <div v-if="activeTab === 'owners'">
      <div v-for="o in owners" :key="o.path" class="card owner-card">
        <span class="owner-path">{{ o.path }}</span>
        <span class="owner-arrow">→</span>
        <div class="owner-names">
          <el-tag v-for="name in o.owners" :key="name" size="small" effect="plain">{{ name }}</el-tag>
        </div>
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

.owner-card { display: flex; align-items: center; gap: 16px; padding: 16px 24px; margin-bottom: 12px; }
.owner-path { font-family: monospace; font-size: 14px; color: var(--color-text); font-weight: 500; min-width: 280px; }
.owner-arrow { color: var(--color-text-secondary); }
.owner-names { display: flex; gap: 8px; }
</style>
