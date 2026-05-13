import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: () => import('@/views/Layout.vue'),
      redirect: '/dashboard',
      children: [
        // P0 - 核心模块
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('@/views/Dashboard.vue'),
          meta: { title: '仪表盘' },
        },
        {
          path: 'scan',
          name: 'CodeScan',
          component: () => import('@/views/scan/CodeScan.vue'),
          meta: { title: '代码扫描' },
        },
        {
          path: 'file-analysis',
          name: 'FileAnalysis',
          component: () => import('@/views/analysis/FileAnalysis.vue'),
          meta: { title: '文件分析' },
        },
        // P1 - 完善工作流
        {
          path: 'tickets',
          name: 'ReviewTickets',
          component: () => import('@/views/ticket/TicketList.vue'),
          meta: { title: '审查工单' },
        },
        {
          path: 'tickets/:id',
          name: 'TicketDetail',
          component: () => import('@/views/ticket/TicketDetail.vue'),
          meta: { title: '工单详情' },
        },
        {
          path: 'projects',
          name: 'Projects',
          component: () => import('@/views/project/ProjectList.vue'),
          meta: { title: '项目概览' },
        },
        {
          path: 'standards',
          name: 'Standards',
          component: () => import('@/views/standards/Standards.vue'),
          meta: { title: '规范检查' },
        },
        // P2 - 深度分析
        {
          path: 'dependencies',
          name: 'Dependencies',
          component: () => import('@/views/deps/Dependencies.vue'),
          meta: { title: '依赖管理' },
        },
        {
          path: 'performance',
          name: 'Performance',
          component: () => import('@/views/perf/Performance.vue'),
          meta: { title: '性能监控' },
        },
        {
          path: 'security',
          name: 'Security',
          component: () => import('@/views/security/Security.vue'),
          meta: { title: '安全审计' },
        },
        // P3 - 锦上添花
        {
          path: 'team',
          name: 'Team',
          component: () => import('@/views/team/Team.vue'),
          meta: { title: '团队协作' },
        },
        {
          path: 'reports',
          name: 'Reports',
          component: () => import('@/views/report/Reports.vue'),
          meta: { title: '报告中心' },
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('@/views/Settings.vue'),
          meta: { title: '系统设置' },
        },
      ],
    },
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
    },
  ],
})

router.beforeEach((to) => {
  document.title = `${to.meta.title ?? ''} - 代码审查系统`
})

export default router
