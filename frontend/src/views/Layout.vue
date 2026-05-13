<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessageBox, ElMessage } from "element-plus";
import {
  Monitor,
  Search,
  Document,
  Ticket,
  FolderOpened,
  Checked,
  Connection,
  Odometer,
  Lock,
  UserFilled,
  DataAnalysis,
  Setting,
  Expand,
  Fold,
} from "@element-plus/icons-vue";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);
const userInfo = computed(() => userStore.userInfo);

const handleLogout = () => {
  ElMessageBox.confirm("确定要退出系统吗？", "提示", {
    type: "warning",
  }).then(() => {
    userStore.logout();
    ElMessage.success("已退出登录");
    router.push("/login");
  });
};

const menuGroups = [
  {
    title: "核心",
    items: [
      { path: "/dashboard", icon: Monitor, label: "仪表盘" },
      { path: "/scan", icon: Search, label: "代码扫描" },
      { path: "/file-analysis", icon: Document, label: "文件分析" },
    ],
  },
  {
    title: "工作流",
    items: [
      { path: "/tickets", icon: Ticket, label: "审查工单" },
      { path: "/projects", icon: FolderOpened, label: "项目概览" },
      { path: "/standards", icon: Checked, label: "规范检查" },
    ],
  },
  {
    title: "分析",
    items: [
      { path: "/dependencies", icon: Connection, label: "依赖管理" },
      { path: "/performance", icon: Odometer, label: "性能监控" },
      { path: "/security", icon: Lock, label: "安全审计" },
    ],
  },
  {
    title: "协作",
    items: [
      { path: "/team", icon: UserFilled, label: "团队协作" },
      { path: "/reports", icon: DataAnalysis, label: "报告中心" },
      { path: "/settings", icon: Setting, label: "系统设置" },
    ],
  },
];

const collapsed = ref(false);
</script>

<template>
  <div class="layout">
    <aside class="sidebar" :class="{ collapsed }">
      <div class="logo">
        <span class="logo-icon">
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z"
              fill="var(--color-accent)"
            />
          </svg>
        </span>
        <span v-if="!collapsed" class="logo-text">CodeReview</span>
      </div>

      <el-menu
        :default-active="activeMenu"
        :collapse="collapsed"
        :collapse-transition="false"
        router
        class="sidebar-menu"
      >
        <template v-for="(group, gi) in menuGroups" :key="gi">
          <div v-if="!collapsed" class="menu-group-title">
            {{ group.title }}
          </div>
          <el-menu-item
            v-for="item in group.items"
            :key="item.path"
            :index="item.path"
          >
            <el-icon><component :is="item.icon" /></el-icon>
            <template #title>{{ item.label }}</template>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <el-icon class="collapse-btn" @click="collapsed = !collapsed">
            <component :is="collapsed ? Expand : Fold" />
          </el-icon>
          <span class="page-title">{{ route.meta.title }}</span>
        </div>
        <div class="topbar-right">
          <el-dropdown trigger="click" @command="handleLogout">
            <div class="user-info-btn">
              <el-avatar :size="32" class="user-avatar">
                {{ userInfo?.name?.charAt(0) || "U" }}
              </el-avatar>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item disabled class="dropdown-header">
                  <div class="user-email">
                    {{ userInfo?.username || "未登录" }}
                  </div>
                </el-dropdown-item>
                <el-dropdown-item divided command="logout"
                  >退出登录</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </header>

      <main class="content">
        <router-view />
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout {
  display: flex;
  height: 100vh;
  overflow: hidden;
  background: transparent;
}

.sidebar {
  width: var(--sidebar-width);
  background: var(--color-bg-secondary);
  display: flex;
  flex-direction: column;
  transition: width 0.2s ease;
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
}

.sidebar.collapsed {
  width: 72px;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  padding: 0 24px;
  font-weight: 700;
  font-size: 20px;
  color: var(--color-text);
  gap: 12px;
  letter-spacing: -0.02em;
}
.sidebar.collapsed .logo {
  padding: 0;
  justify-content: center;
}

.logo-text {
  white-space: nowrap;
}

.sidebar-menu {
  flex: 1;
  border: none !important;
  background: transparent !important;
  overflow-y: auto;
  padding-top: 12px;
}

/* 高级 SaaS 侧边栏菜单样式 */
:deep(.el-menu-item) {
  height: 44px;
  line-height: 44px;
  margin: 0 12px 4px 12px;
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s ease;
}
.sidebar.collapsed :deep(.el-menu-item) {
  margin: 0 12px 4px 12px;
  border-radius: 8px;
  justify-content: center;
  padding: 0 !important;
}

:deep(.el-menu-item:hover) {
  background-color: var(--color-bg-hover);
  color: var(--color-text);
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(74, 140, 246, 0.12);
  color: var(--color-accent);
  font-weight: 600;
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.topbar {
  height: 64px;
  background: var(--color-bg-secondary);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px 0 16px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--color-border);
}

.topbar-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-btn {
  cursor: pointer;
  color: var(--color-text-secondary);
  font-size: 20px;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s;
}

.collapse-btn:hover {
  background: var(--color-bg-hover);
  color: var(--color-text);
}

.page-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  letter-spacing: -0.01em;
}

.topbar-right {
  display: flex;
  align-items: center;
}

.user-info-btn {
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: opacity 0.2s;
}

.user-info-btn:hover {
  opacity: 0.8;
}

.user-avatar {
  background: var(--color-accent);
  font-weight: 600;
  font-size: 14px;
  color: white;
}

.dropdown-header {
  padding: 8px 16px;
}
.user-email {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.menu-group-title {
  font-size: 11px;
  font-weight: 600;
  color: var(--color-text-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.06em;
  padding: 20px 24px 8px;
  line-height: 1;
}
.menu-group-title:first-child {
  padding-top: 8px;
}
</style>
