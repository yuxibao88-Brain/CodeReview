<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessageBox, ElMessage } from "element-plus";
import { useI18n } from "vue-i18n";

const { locale } = useI18n();

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();

const activeMenu = computed(() => route.path);
const userInfo = computed(() => userStore.userInfo);

const handleLogout = () => {
  ElMessageBox.confirm(
    locale.value === "zh-CN"
      ? "确定要退出系统吗？"
      : "Are you sure you want to log out?",
    locale.value === "zh-CN" ? "提示" : "Warning",
    { type: "warning" },
  ).then(() => {
    userStore.logout();
    ElMessage.success(
      locale.value === "zh-CN" ? "已退出登录" : "Logged out successfully",
    );
    router.push("/login");
  });
};

const menuGroups = [
  {
    titleKey: "layout.core",
    items: [
      { path: "/dashboard", iconKey: "dashboard", labelKey: "layout.dashboard" },
      { path: "/scan", iconKey: "scan", labelKey: "layout.scan" },
      { path: "/file-analysis", iconKey: "file", labelKey: "layout.fileAnalysis" },
    ],
  },
  {
    titleKey: "layout.workflow",
    items: [
      { path: "/tickets", iconKey: "ticket", labelKey: "layout.tickets" },
      { path: "/projects", iconKey: "grid", labelKey: "layout.projects", badge: 1 },
      { path: "/standards", iconKey: "check", labelKey: "layout.standards" },
    ],
  },
  {
    titleKey: "layout.analysis",
    items: [
      { path: "/dependencies", iconKey: "deps", labelKey: "layout.dependencies" },
      { path: "/performance", iconKey: "perf", labelKey: "layout.performance" },
      { path: "/security", iconKey: "shield", labelKey: "layout.security" },
    ],
  },
  {
    titleKey: "layout.collaboration",
    items: [
      { path: "/team", iconKey: "users", labelKey: "layout.team" },
      { path: "/reports", iconKey: "chart", labelKey: "layout.reports" },
      { path: "/settings", iconKey: "settings", labelKey: "layout.settings" },
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
            {{ $t(group.titleKey) }}
          </div>
          <el-menu-item
            v-for="item in group.items"
            :key="item.path"
            :index="item.path"
          >
            <span class="menu-svg-icon">
              <!-- Dashboard: monitor -->
              <svg v-if="item.iconKey === 'dashboard'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              <!-- Scan: search -->
              <svg v-else-if="item.iconKey === 'scan'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <!-- File analysis: file-text -->
              <svg v-else-if="item.iconKey === 'file'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              <!-- Tickets: clipboard -->
              <svg v-else-if="item.iconKey === 'ticket'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
              <!-- Projects: grid -->
              <svg v-else-if="item.iconKey === 'grid'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              <!-- Standards: clipboard-check -->
              <svg v-else-if="item.iconKey === 'check'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/><path d="M9 14l2 2 4-4"/></svg>
              <!-- Dependencies: git-branch -->
              <svg v-else-if="item.iconKey === 'deps'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="6" y1="3" x2="6" y2="15"/><circle cx="18" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M18 9a9 9 0 0 1-9 9"/></svg>
              <!-- Performance: activity -->
              <svg v-else-if="item.iconKey === 'perf'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              <!-- Security: shield -->
              <svg v-else-if="item.iconKey === 'shield'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <!-- Team: users -->
              <svg v-else-if="item.iconKey === 'users'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              <!-- Reports: bar-chart -->
              <svg v-else-if="item.iconKey === 'chart'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="20" x2="12" y2="10"/><line x1="18" y1="20" x2="18" y2="4"/><line x1="6" y1="20" x2="6" y2="16"/></svg>
              <!-- Settings: gear -->
              <svg v-else-if="item.iconKey === 'settings'" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </span>
            <template #title>
              <div class="menu-item-title-wrapper">
                <span>{{ $t(item.labelKey) }}</span>
                <span v-if="item.badge" class="menu-item-badge">{{
                  item.badge
                }}</span>
              </div>
            </template>
          </el-menu-item>
        </template>
      </el-menu>
    </aside>

    <div class="main">
      <header class="topbar">
        <div class="topbar-left">
          <div class="collapse-btn" @click="collapsed = !collapsed">
            <svg
              viewBox="0 0 24 24"
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </div>
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
                <el-dropdown-item divided command="logout">
                  {{ locale === "zh-CN" ? "退出登录" : "Logout" }}
                </el-dropdown-item>
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
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  flex-shrink: 0;
  border-right: 1px solid var(--color-border);
  will-change: width;
  contain: layout style;
  overflow: hidden;
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
  overflow-x: hidden;
  padding-top: 12px;
}

/* 高级 SaaS 侧边栏菜单样式 */
:deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  margin: 0 12px 2px 12px;
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-weight: 500;
  font-size: 13px;
  transition: all 0.2s ease;
}
:deep(.el-menu-item .el-icon),
.menu-svg-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 8px;
  flex-shrink: 0;
  opacity: 0.55;
  transition: opacity 0.2s ease;
}
:deep(.el-menu-item:hover) .menu-svg-icon,
:deep(.el-menu-item.is-active) .menu-svg-icon {
  opacity: 1;
}
.sidebar.collapsed :deep(.el-menu-item) {
  margin: 0 12px 4px 12px;
  border-radius: 8px;
  justify-content: center;
  padding: 0 !important;
}

.sidebar.collapsed :deep(.el-menu-tooltip__trigger) {
  padding: 0 !important;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.menu-item-title-wrapper {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 4px;
}

.menu-item-badge {
  background-color: var(--color-accent);
  color: #fff;
  font-size: 12px;
  height: 20px;
  min-width: 20px;
  line-height: 20px;
  text-align: center;
  border-radius: 10px;
  padding: 0 6px;
  font-weight: 600;
  display: inline-block;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.15s ease;
  -webkit-tap-highlight-color: transparent;
}

.collapse-btn:hover {
  background-color: var(--color-bg-hover);
  color: var(--color-text);
}

.collapse-btn:active {
  transform: scale(0.9);
  background-color: var(--color-border);
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
