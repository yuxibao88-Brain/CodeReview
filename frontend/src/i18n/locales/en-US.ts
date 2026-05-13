export default {
  layout: {
    core: 'Core',
    dashboard: 'Dashboard',
    scan: 'Code Scan',
    fileAnalysis: 'File Analysis',
    workflow: 'Workflow',
    tickets: 'Review Tickets',
    projects: 'Projects',
    standards: 'Standards',
    analysis: 'Analysis',
    dependencies: 'Dependencies',
    performance: 'Performance',
    security: 'Security',
    collaboration: 'Collaboration',
    team: 'Team',
    reports: 'Reports',
    settings: 'Settings',
  },
  settings: {
    tabs: {
      general: 'General',
      notify: 'Notifications',
      git: 'Git Integration'
    },
    general: {
      title: 'Basic Settings',
      systemName: 'System Name',
      language: 'Language',
      autoAssign: 'Auto Assign Reviewer',
      maxReviewers: 'Max Reviewers',
      reviewTimeout: 'Review Timeout (Hours)',
      saveBtn: 'Save Settings'
    },
    notify: {
      title: 'Notification Preferences',
      email: 'Email Notifications',
      browser: 'Browser Push',
      onAssign: 'Notify on Assignment',
      onComment: 'Notify on Comments',
      saveBtn: 'Save Settings'
    },
    git: {
      title: 'GitLab Configuration',
      url: 'GitLab URL',
      token: 'Access Token',
      autoPull: 'Auto Pull MR',
      defaultBranch: 'Default Branch',
      testBtn: 'Test Connection',
      saveBtn: 'Save Settings',
      urlPlaceholder: 'https://gitlab.example.com',
      tokenPlaceholder: 'glpat-xxxx'
    },
    messages: {
      saveSuccess: 'Settings saved successfully',
      testTesting: 'Testing connection...',
      testSuccess: 'Connection successful'
    }
  },
  reports: {
    title: 'Data Insights',
    dateRange: {
      to: 'To',
      start: 'Start Date',
      end: 'End Date'
    },
    overview: {
      totalReviews: 'Total Reviews',
      completed: 'Completed',
      totalIssues: 'Issues Found',
      avgScore: 'Avg Score'
    },
    ranking: {
      title: 'Reviewer Contribution Rankings',
      reviewer: 'Reviewer',
      reviews: 'Reviews',
      issues: 'Issues Found',
      avgScore: 'Avg Score',
      empty: 'No review data'
    },
    issues: {
      title: 'Issues Distribution',
      empty: 'No issue distribution data'
    }
  },
  team: {
    title: 'Team Collaboration',
    tabs: {
      members: 'Members',
      owners: 'Code Owners'
    },
    members: {
      member: 'Member',
      commits: 'Commits',
      reviews: 'Reviews',
      pending: 'Pending',
      issueRate: 'Issue Rate',
      empty: 'No team member data',
      invite: 'Invite Member'
    },
    owners: {
      empty: 'No Code Owner configuration',
      add: 'Add Configuration'
    }
  }
}
