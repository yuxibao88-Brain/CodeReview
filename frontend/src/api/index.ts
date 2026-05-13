import request from './request'

// ===== P0 核心 =====
export const dashboardApi = {
  getStats: () => request.get('/dashboard/stats'),
  getTrend: () => request.get('/dashboard/trend'),
  getActivity: () => request.get('/dashboard/activity'),
  getModuleScores: () => request.get('/dashboard/module-scores'),
  getIssueDistribution: () => request.get('/dashboard/issue-distribution'),
  getContributors: () => request.get('/dashboard/contributors'),
}

export const scanApi = {
  getIssues: (params?: any) => request.get('/scan/issues', { params }),
  getSummary: () => request.get('/scan/summary'),
  rescan: () => request.post('/scan/rescan'),
}

export const fileApi = {
  getTree: () => request.get('/files/tree'),
  getDetail: (path: string) => request.get('/files/detail', { params: { path } }),
}

// ===== P1 工作流 =====
export const ticketApi = {
  getList: (params?: any) => request.get('/tickets', { params }),
  getDetail: (id: string | number) => request.get(`/tickets/${id}`),
  create: (data: any) => request.post('/tickets', data),
  update: (id: string | number, data: any) => request.put(`/tickets/${id}`, data),
}

export const projectApi = {
  getList: (params?: any) => request.get('/projects', { params }),
  getDetail: (id: string | number) => request.get(`/projects/${id}`),
}

export const standardsApi = {
  getSummary: () => request.get('/standards/summary'),
  getDetails: (category: string) => request.get(`/standards/${category}`),
}

// ===== P2 分析 =====
export const depsApi = {
  getPackages: () => request.get('/deps/packages'),
  getCircular: () => request.get('/deps/circular'),
}

export const perfApi = {
  getBundle: () => request.get('/perf/bundle'),
  getLargeFiles: () => request.get('/perf/large-files'),
}

export const securityApi = {
  getVulnerabilities: () => request.get('/security/vulnerabilities'),
  getSensitive: () => request.get('/security/sensitive'),
}

// ===== P3 协作 =====
export const teamApi = {
  getMembers: () => request.get('/team/members'),
  getOwners: () => request.get('/team/owners'),
}

export const reportApi = {
  getOverview: () => request.get('/reports/overview'),
  getRanking: () => request.get('/reports/ranking'),
  getIssueTypes: () => request.get('/reports/issue-types'),
  getHistory: () => request.get('/reports/history'),
}

export const authApi = {
  login: (data: any) => request.post('/auth/login', data),
}

export const settingsApi = {
  get: () => request.get('/settings'),
  save: (type: string, data: any) => request.post('/settings', { type, data }),
}

