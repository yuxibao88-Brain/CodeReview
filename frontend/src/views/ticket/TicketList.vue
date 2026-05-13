<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ticketApi } from '@/api'

const router = useRouter()
const loading = ref(true)
const filterStatus = ref('all')
const tickets = ref<any[]>([])

const fetchTickets = async () => {
  loading.value = true
  try {
    const res: any = await ticketApi.getList({ status: filterStatus.value })
    tickets.value = res
  } finally {
    loading.value = false
  }
}

onMounted(fetchTickets)

const filteredTickets = computed(() => {
  if (filterStatus.value === 'all') return tickets.value
  return tickets.value.filter(t => t.status === filterStatus.value)
})

const priorityConfig: Record<string, { color: string; bg: string; label: string }> = {
  high:   { color: '#b91c1c', bg: '#fee2e2', label: '高优先' },
  medium: { color: '#b45309', bg: '#fef3c7', label: '中优先' },
  low:    { color: '#047857', bg: '#d1fae5', label: '低优先' },
}

const statusConfig: Record<string, { label: string; type: string }> = {
  open:     { label: '待处理', type: 'warning' },
  progress: { label: '进行中', type: 'primary' },
  done:     { label: '已完成', type: 'success' },
  closed:   { label: '已关闭', type: 'info' },
}
</script>

<template>
  <div v-loading="loading">
    <!-- 顶部操作 -->
    <div class="ticket-header">
      <h2 class="page-title">审查工单</h2>
      <div class="header-actions">
        <div class="filter-tabs">
          <span class="tab" :class="{ active: filterStatus === 'all' }" @click="filterStatus = 'all'">全部</span>
          <span class="tab" :class="{ active: filterStatus === 'open' }" @click="filterStatus = 'open'">待处理</span>
          <span class="tab" :class="{ active: filterStatus === 'progress' }" @click="filterStatus = 'progress'">进行中</span>
          <span class="tab" :class="{ active: filterStatus === 'done' }" @click="filterStatus = 'done'">已完成</span>
        </div>
        <el-button type="primary" class="primary-btn">+ 新建工单</el-button>
      </div>
    </div>

    <!-- 工单列表 -->
    <div class="ticket-list">
      <div v-if="filteredTickets.length === 0" class="card empty-state">
        <p>暂无工单数据</p>
      </div>
      <div v-for="t in filteredTickets" :key="t.id" class="card ticket-card" @click="router.push(`/tickets/${t.id}`)">
        <div class="ticket-top">
          <div class="ticket-title-row">
            <span class="ticket-id">#{{ t.id }}</span>
            <span class="ticket-title">{{ t.title }}</span>
            <span class="priority-tag" :style="{ color: priorityConfig[t.priority]?.color, background: priorityConfig[t.priority]?.bg }">
              {{ priorityConfig[t.priority]?.label || t.priority }}
            </span>
          </div>
          <el-tag size="small" :type="(statusConfig[t.status]?.type as any) || 'info'">
            {{ statusConfig[t.status]?.label || t.status }}
          </el-tag>
        </div>
        <div class="ticket-meta">
          <span>发起人: {{ t.creator }}</span>
          <span>审查人: {{ t.reviewer }}</span>
          <span>{{ t.fileCount }} 个文件</span>
          <span>{{ t.createdAt }}</span>
        </div>
        <div class="ticket-tags" v-if="t.tags?.length">
          <span v-for="tag in t.tags" :key="tag" class="tag-item">{{ tag }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ticket-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
.page-title { font-size: 24px; font-weight: 600; color: var(--color-text); letter-spacing: -0.02em; }
.header-actions { display: flex; align-items: center; gap: 24px; }
.filter-tabs { display: flex; gap: 4px; background: var(--color-bg); padding: 4px; border-radius: 8px; }
.tab {
  padding: 8px 16px; font-size: 13px; font-weight: 500; color: var(--color-text-secondary);
  cursor: pointer; border-radius: 6px; transition: all 0.2s;
}
.tab:hover { color: var(--color-text); }
.tab.active { background: var(--color-bg-card); color: var(--color-text); box-shadow: var(--shadow-sm); }
.primary-btn {
  background-color: var(--color-accent); border-color: var(--color-accent);
  border-radius: 8px; padding: 0 20px; height: 38px; font-weight: 500;
}

.ticket-list { display: flex; flex-direction: column; gap: 16px; }
.ticket-card { cursor: pointer; padding: 24px; }
.ticket-card:hover { border-color: var(--color-accent); }
.ticket-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
.ticket-title-row { display: flex; align-items: center; gap: 12px; }
.ticket-id { font-weight: 700; color: var(--color-text-secondary); font-size: 14px; }
.ticket-title { font-size: 16px; font-weight: 600; color: var(--color-text); }
.priority-tag { font-size: 12px; font-weight: 600; padding: 2px 10px; border-radius: 4px; }
.ticket-meta { display: flex; gap: 24px; font-size: 13px; color: var(--color-text-secondary); font-weight: 500; }
.ticket-tags { display: flex; gap: 8px; margin-top: 12px; }
.tag-item { padding: 4px 12px; background: var(--color-bg); border-radius: 6px; font-size: 12px; color: var(--color-text-secondary); font-weight: 500; }

.empty-state { text-align: center; padding: 60px; color: var(--color-text-secondary); font-size: 14px; }
</style>
