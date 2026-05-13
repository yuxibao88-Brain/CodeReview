export default {
  layout: {
    core: '核心',
    dashboard: '仪表盘',
    scan: '代码扫描',
    fileAnalysis: '文件分析',
    workflow: '工作流',
    tickets: '审查工单',
    projects: '项目概览',
    standards: '规范检查',
    analysis: '分析',
    dependencies: '依赖管理',
    performance: '性能监控',
    security: '安全审计',
    collaboration: '协作',
    team: '团队协作',
    reports: '报告中心',
    settings: '系统设置',
  },
  settings: {
    tabs: {
      general: '常规设置',
      notify: '通知设置',
      git: 'Git 集成'
    },
    general: {
      title: '基本配置',
      systemName: '系统名称',
      language: '界面语言',
      autoAssign: '自动分配审查人',
      maxReviewers: '最大审查人数',
      reviewTimeout: '审查超时(小时)',
      saveBtn: '保存设置'
    },
    notify: {
      title: '通知偏好',
      email: '邮件通知',
      browser: '浏览器推送',
      onAssign: '被指派时通知',
      onComment: '收到评论时通知',
      saveBtn: '保存设置'
    },
    git: {
      title: 'GitLab 配置',
      url: 'GitLab 地址',
      token: 'Access Token',
      autoPull: '自动拉取 MR',
      defaultBranch: '默认分支',
      testBtn: '测试连接',
      saveBtn: '保存设置',
      urlPlaceholder: 'https://gitlab.example.com',
      tokenPlaceholder: 'glpat-xxxx'
    },
    messages: {
      saveSuccess: '设置已保存',
      testTesting: '测试连接中...',
      testSuccess: '连接成功'
    }
  },
  reports: {
    title: '数据洞察',
    dateRange: {
      to: '至',
      start: '开始日期',
      end: '结束日期'
    },
    overview: {
      totalReviews: '总审查数',
      completed: '已完成',
      totalIssues: '发现问题',
      avgScore: '平均评分'
    },
    ranking: {
      title: '审查贡献排行',
      reviewer: '审查人',
      reviews: '审查数',
      issues: '提出问题',
      avgScore: '平均评分',
      empty: '暂无审查数据'
    },
    issues: {
      title: '发现问题分布',
      empty: '暂无问题分布数据'
    }
  },
  team: {
    title: '团队协作',
    tabs: {
      members: '成员概览',
      owners: '代码 Owner'
    },
    members: {
      member: '成员',
      commits: '提交数',
      reviews: '审查数',
      pending: '待处理',
      issueRate: '问题引入率',
      empty: '暂无团队成员数据',
      invite: '邀请成员'
    },
    owners: {
      empty: '暂无代码 Owner 配置',
      add: '添加配置'
    }
  }
}
