# ASMS Code Review System

ASMS Code Review 平台是一个现代化、轻量级、高性能的代码自动审查与质量分析 SaaS 系统。
基于 Node.js (Express) 后端、SQLite 零配置数据库，以及 Vue 3 + Element Plus 的可视化前端构建。

## 🌟 核心特性

本系统实现了从代码接入、扫描分析到问题流转修复的完整闭环，主要包含 12 大核心功能模块：

1. **仪表盘 (Dashboard)**: 实时把控项目的健康脉搏，自动计算健康得分与隐患分布。
2. **项目概览 (Project Management)**: 零配置极速挂载本地项目，支持多项目的独立沙箱扫描。
3. **代码扫描 (Code Scanning)**: 毫秒级规则引擎，内置类型安全、生产遗留物、XSS 安全防御、复杂度等 6 大核心扫描规则。
4. **文件分析 (File Analysis)**: 可视化项目目录树与代码质量热力图。
5. **审查工单 (Code Review Tickets)**: 扫描发现的隐患可一键流转为工单，支持指派与闭环追踪。
6. **依赖管理 (Dependency Management)**: 可视化解析第三方依赖，洞察包体积与潜在的过期风险。
7. **性能监控 (Performance Profiling)**: 识别项目中的巨型文件与潜在首屏渲染阻塞点。
8. **安全审计 (Security Audit)**: 扫描明文暴露的敏感 Token 与常见高危漏洞。
9. **规范检查 (Linting)**: 量化项目符合团队约定规范（命名规则、最佳实践）的合规率。
10. **团队协作 (Team Collaboration)**: 洞察团队的研发效能，统计代码质量趋势与工单解决率。
11. **报告中心 (Report Center)**: 提供项目质量的周期性归档与演进趋势分析。
12. **系统设置 (Settings)**: 灵活配置扫描规则的开关、告警阈值及外部 Hook 推送。

## 🚀 架构设计亮点

- **零阻塞扫描引擎**: 突破 Node.js 单线程限制，解析海量文件时不阻塞 HTTP 事件循环，确保前端进度条与 API 秒级响应。
- **极速缓存**: 扫描结果实时持久化存入 SQLite，二次加载或查询可达 10ms 级极速响应。
- **超大规模适配**: 前端针对性设计分页加载与渲染优化，面对上万条代码隐患（Issue）亦可保持页面丝滑。
- **开箱即用**: 无需配置繁杂的 MySQL / Redis，安装依赖后一键启动。

## 🛠️ 快速开始

### 1. 启动后端引擎 (API)

```bash
cd backend
npm install
# 启动在 localhost:3000
npm start
```

### 2. 启动前端平台 (UI)

```bash
cd frontend
npm install
# 启动在 localhost:5173
npm run dev
```

### 3. 接入项目

1. 在浏览器打开 `http://localhost:5173/projects`
2. 点击 **添加项目**，输入你本地代码仓库的绝对路径（例如：`/Users/brain/code/my-project`）
3. 点击 **重新扫描** 即可自动开始全盘分析。
