<script setup lang="ts">
import { ref } from 'vue'

const ticketId = '102'
</script>

<template>
  <div class="card" style="padding: 48px; text-align: center">
    <h3 style="color: var(--color-text); margin-bottom: 8px">工单详情 #{{ ticketId }}</h3>
    <p style="color: var(--color-text-secondary)">Diff 视图 + 行级评论功能开发中</p>
    <el-button type="primary" style="margin-top: 24px" @click="$router.back()">返回列表</el-button>
  </div>
</template>
