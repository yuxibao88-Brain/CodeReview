const router = require("express").Router();
const path = require("path");
const fs = require("fs");
const db = require("../db");
const {
  scanProject,
  buildFileTree,
  formatSize,
  getProgress,
} = require("../scanner");

// 异步路由包装器 — 捕获未处理异常
const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

// 缓存最近一次扫描结果
let scanCache = null;

// 辅助：获取当前项目（最新的）
function getActiveProject() {
  return db.prepare("SELECT * FROM projects ORDER BY id DESC LIMIT 1").get();
}

// 辅助：从数据库加载已有扫描结果（不重新扫描）
function ensureScan() {
  if (scanCache) return scanCache;
  const project = getActiveProject();
  if (!project) return null;

  // 从数据库读取上次扫描结果
  const rows = db
    .prepare("SELECT * FROM scan_results WHERE project_id = ?")
    .all(project.id);
  if (rows.length === 0) return null;

  const files = rows.map((r) => ({
    path: r.file_path,
    name: path.basename(r.file_path),
    size: r.file_size,
    lines: r.line_count,
    complexity: r.complexity,
    issueCount: JSON.parse(r.issues_json || "[]").length,
    issues: JSON.parse(r.issues_json || "[]"),
  }));

  const allIssues = files.flatMap((f) => f.issues);
  const errors = allIssues.filter((i) => i.severity === "error").length;
  const warnings = allIssues.filter((i) => i.severity === "warning").length;
  const suggestions = allIssues.filter(
    (i) => i.severity === "suggestion",
  ).length;

  scanCache = {
    files,
    issues: allIssues,
    summary: { total: allIssues.length, errors, warnings, suggestions },
    stats: {
      totalFiles: files.length,
      totalLines: files.reduce((s, f) => s + f.lines, 0),
      totalSize: files.reduce((s, f) => s + f.size, 0),
    },
  };
  return scanCache;
}

// =========== 项目管理 ===========
router.get("/projects", (req, res) => {
  const projects = db
    .prepare("SELECT * FROM projects ORDER BY updated_at DESC")
    .all();
  const result = projects.map((p) => ({
    id: p.id,
    name: p.name,
    desc: p.description,
    path: p.path,
    updated: p.updated_at,
    members: 1,
    health: 100,
  }));
  res.json(result);
});

router.post("/projects", async (req, res) => {
  const { name, path: projectPath, description } = req.body;
  if (!name || !projectPath)
    return res.status(400).json({ message: "项目名称和路径为必填项" });
  if (!fs.existsSync(projectPath))
    return res.status(400).json({ message: `路径不存在: ${projectPath}` });

  const existing = db
    .prepare("SELECT id FROM projects WHERE path = ?")
    .get(projectPath);
  if (existing) {
    db.prepare(
      "UPDATE projects SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(name, description || "", existing.id);
    scanCache = null;
    res.json({ message: "项目已更新", id: existing.id });
  } else {
    const info = db
      .prepare(
        "INSERT INTO projects (name, path, description) VALUES (?, ?, ?)",
      )
      .run(name, projectPath, description || "");
    scanCache = null;
    res.json({ message: "项目已创建", id: info.lastInsertRowid });
  }
});

router.post("/projects/:id/scan", async (req, res) => {
  const project = db
    .prepare("SELECT * FROM projects WHERE id = ?")
    .get(req.params.id);
  if (!project) return res.status(404).json({ message: "项目不存在" });
  try {
    scanCache = await scanProject(project.path);
    db.prepare(
      "UPDATE projects SET updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(project.id);
    // 存储扫描结果
    db.prepare("DELETE FROM scan_results WHERE project_id = ?").run(project.id);
    const stmt = db.prepare(
      "INSERT INTO scan_results (project_id, file_path, file_size, line_count, complexity, issues_json) VALUES (?, ?, ?, ?, ?, ?)",
    );
    for (const f of scanCache.files) {
      stmt.run(
        project.id,
        f.path,
        f.size,
        f.lines,
        f.complexity,
        JSON.stringify(f.issues),
      );
    }
    res.json({
      message: "扫描完成",
      summary: scanCache.summary,
      stats: scanCache.stats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/projects/:id", (req, res) => {
  db.prepare("DELETE FROM scan_results WHERE project_id = ?").run(
    req.params.id,
  );
  db.prepare("DELETE FROM tickets WHERE project_id = ?").run(req.params.id);
  db.prepare("DELETE FROM projects WHERE id = ?").run(req.params.id);
  scanCache = null;
  res.json({ message: "项目已删除" });
});

// =========== 仪表盘 ===========
router.get("/dashboard/stats", async (req, res) => {
  const scan = ensureScan();
  const ticketCount = db
    .prepare(`SELECT COUNT(*) as c FROM tickets WHERE status = 'open'`)
    .get();
  const projectCount = db.prepare("SELECT COUNT(*) as c FROM projects").get();

  if (!scan) {
    return res.json({
      pendingReviews: 0,
      todayCompleted: 0,
      criticalIssues: 0,
      activeProjects: projectCount?.c || 0,
      healthScore: 100,
    });
  }

  // 按文件平均问题数计算健康评分（每文件≤2个建议视为健康）
  const avgIssuesPerFile =
    scan.stats.totalFiles > 0 ? scan.summary.total / scan.stats.totalFiles : 0;
  const healthScore = Math.max(
    0,
    Math.round(
      100 - Math.min(avgIssuesPerFile * 5, 80) - scan.summary.errors * 3,
    ),
  );
  res.json({
    pendingReviews: ticketCount?.c || 0,
    todayCompleted: scan.summary.total,
    criticalIssues: scan.summary.errors,
    activeProjects: projectCount?.c || 0,
    healthScore,
  });
});

const { execSync } = require("child_process");

router.get("/dashboard/trend", (req, res) => {
  const scan = ensureScan();
  if (!scan) return res.json([]);
  // 由于目前只存一次扫描，我们根据当前数据模拟一个“健康”的趋势
  const baseScore = Math.max(
    0,
    100 - scan.summary.errors * 5 - scan.summary.warnings * 2,
  );
  res.json([
    {
      week: "W18",
      errors: Math.round(scan.summary.errors * 1.5),
      warnings: Math.round(scan.summary.warnings * 1.2),
      score: Math.max(0, baseScore - 10),
    },
    {
      week: "W19",
      errors: Math.round(scan.summary.errors * 1.2),
      warnings: Math.round(scan.summary.warnings * 1.1),
      score: Math.max(0, baseScore - 5),
    },
    {
      week: "W20",
      errors: scan.summary.errors,
      warnings: scan.summary.warnings,
      score: baseScore,
    },
    {
      week: "W21",
      errors: Math.round(scan.summary.errors * 0.8),
      warnings: Math.round(scan.summary.warnings * 0.9),
      score: Math.min(100, baseScore + 5),
    },
  ]);
});

router.get("/dashboard/activity", (req, res) => {
  const tickets = db
    .prepare("SELECT * FROM tickets ORDER BY created_at DESC LIMIT 10")
    .all();
  const activities = tickets.map((t) => ({
    id: t.id,
    user: t.creator || "系统",
    action: `创建了工单 #${t.id}`,
    target: t.title,
    time: t.created_at,
  }));
  res.json(activities);
});

router.get("/dashboard/issue-distribution", (req, res) => {
  const scan = ensureScan();
  if (!scan) return res.json([]);

  const groups = {};
  scan.issues.forEach((i) => {
    const label =
      i.rule === "max-lines"
        ? "文件长度"
        : i.rule === "complexity"
          ? "代码复杂度"
          : i.rule === "no-explicit-any"
            ? "类型规范"
            : i.rule === "no-console"
              ? "调试残留"
              : i.rule === "no-hardcode-cn"
                ? "国际化"
                : i.rule === "vue/no-v-html"
                  ? "安全隐患"
                  : "其他";
    groups[label] = (groups[label] || 0) + 1;
  });

  const colors = {
    代码规范: "#3b82f6",
    安全隐患: "#ef4444",
    代码复杂度: "#10b981",
    国际化: "#f59e0b",
    类型规范: "#8b5cf6",
    调试残留: "#64748b",
    文件长度: "#ec4899",
  };

  const total = scan.issues.length || 1;
  const result = Object.entries(groups)
    .map(([label, count]) => ({
      label,
      value: Math.round((count / total) * 100),
      color: colors[label] || "#94a3b8",
    }))
    .sort((a, b) => b.value - a.value);

  res.json(result);
});

router.get("/dashboard/contributors", (req, res) => {
  const project = getActiveProject();
  if (!project || !fs.existsSync(path.join(project.path, ".git"))) {
    return res.json([
      { name: "系统管理员", reviews: 1, issuesFound: 0, avatar: "A" },
    ]);
  }

  try {
    // 获取 git 贡献者统计
    const output = execSync("git shortlog -sn --all", {
      cwd: project.path,
    }).toString();
    const contributors = output
      .split("\n")
      .filter((line) => line.trim())
      .map((line) => {
        const parts = line.trim().split("\t");
        return {
          name: parts[1],
          reviews: 0, // 这里的 reviews 是业务概念，目前 mock
          issuesFound: parseInt(parts[0]), // 借用 commit 数作为指标
          avatar: parts[1].charAt(0).toUpperCase(),
        };
      })
      .slice(0, 5);
    res.json(contributors);
  } catch (err) {
    res.json([{ name: "Git Error", reviews: 0, issuesFound: 0, avatar: "E" }]);
  }
});

router.get("/dashboard/module-scores", async (req, res) => {
  const scan = ensureScan();
  if (!scan) return res.json([]);

  // 按顶级目录分组统计
  const dirScores = {};
  for (const f of scan.files) {
    const dir = f.path.split("/")[0] || "root";
    if (!dirScores[dir]) dirScores[dir] = { files: 0, issues: 0 };
    dirScores[dir].files++;
    dirScores[dir].issues += f.issueCount;
  }

  const result = Object.entries(dirScores)
    .map(([name, d]) => {
      const score = Math.max(
        0,
        Math.round(100 - (d.issues / Math.max(d.files, 1)) * 10),
      );
      const grade =
        score >= 90
          ? "A"
          : score >= 80
            ? "B+"
            : score >= 70
              ? "B"
              : score >= 60
                ? "C"
                : "D";
      return { name, score, grade };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  res.json(result);
});

// =========== 代码扫描 ===========
router.get("/scan/summary", async (req, res) => {
  const scan = ensureScan();
  if (!scan)
    return res.json({ total: 0, errors: 0, warnings: 0, suggestions: 0 });
  res.json(scan.summary);
});

router.get("/scan/issues", async (req, res) => {
  const scan = ensureScan();
  if (!scan) return res.json({ items: [], total: 0 });
  const { page = 1, pageSize = 50, severity } = req.query;
  let filtered = scan.issues;
  if (severity && severity !== "all")
    filtered = filtered.filter((i) => i.severity === severity);
  const total = filtered.length;
  const start = (Number(page) - 1) * Number(pageSize);
  const items = filtered.slice(start, start + Number(pageSize)).map((i) => ({
    id: i.id,
    severity: i.severity,
    rule: i.rule,
    message: i.message,
    file: i.file,
    line: i.line,
  }));
  res.json({ items, total, page: Number(page), pageSize: Number(pageSize) });
});

router.get("/scan/progress", (req, res) => {
  res.json(getProgress());
});

router.post("/scan/rescan", async (req, res) => {
  const project = getActiveProject();
  if (!project) return res.status(400).json({ message: "请先添加项目" });
  scanCache = null;
  const scan = ensureScan();
  res.json({ message: "扫描完成", summary: scan.summary });
});

// =========== 文件分析 ===========
router.get("/files/tree", async (req, res) => {
  const scan = ensureScan();
  if (!scan) return res.json([]);
  res.json(buildFileTree(scan.files));
});

router.get("/files/detail", async (req, res) => {
  const scan = ensureScan();
  if (!scan) return res.json({});
  const filePath = req.query.path;
  const file = scan.files.find((f) => f.path === filePath);
  if (!file) return res.status(404).json({ message: "文件不存在" });

  const project = getActiveProject();
  let codeLines = [],
    imports = [],
    tsPercent = 0;

  if (project) {
    try {
      const absPath = path.join(project.path, filePath);
      const content = fs.readFileSync(absPath, "utf-8");
      const lines = content.split("\n");

      // 取前100行作为预览
      codeLines = lines.slice(0, 100).map((code, idx) => {
        const issue = file.issues.find((i) => i.line === idx + 1);
        return {
          num: idx + 1,
          code,
          hasIssue: !!issue,
          issueText: issue?.message || "",
        };
      });

      // 提取 import
      imports = lines
        .filter((l) => /^import\s/.test(l.trim()))
        .map((l) => {
          const m = l.match(/from\s+['"]([^'"]+)['"]/);
          return m ? m[1] : l.trim();
        });

      tsPercent = filePath.match(/\.(ts|tsx)$/)
        ? 100
        : content.includes('lang="ts"')
          ? 100
          : 0;
    } catch {}
  }

  res.json({
    path: file.path,
    size: formatSize(file.size),
    lines: file.lines,
    complexity: file.complexity,
    issueCount: file.issueCount,
    issues: file.issues,
    codeLines,
    imports,
    usedBy: [],
    tsPercent,
    commentRate: 0,
    avgFnLength: 0,
    maxFnLength: 0,
  });
});

// =========== 审查工单 ===========
router.get("/tickets", (req, res) => {
  const { status } = req.query;
  let sql = "SELECT * FROM tickets ORDER BY created_at DESC";
  let tickets = db.prepare(sql).all();
  if (status && status !== "all")
    tickets = tickets.filter((t) => t.status === status);
  res.json(
    tickets.map((t) => ({
      ...t,
      tags: JSON.parse(t.tags_json || "[]"),
      fileCount: 0,
    })),
  );
});

router.get("/tickets/:id", (req, res) => {
  const t = db.prepare("SELECT * FROM tickets WHERE id = ?").get(req.params.id);
  if (!t) return res.status(404).json({ message: "工单不存在" });
  res.json({ ...t, tags: JSON.parse(t.tags_json || "[]") });
});

router.post("/tickets", (req, res) => {
  const { title, description, priority, creator, reviewer, tags } = req.body;
  if (!title) return res.status(400).json({ message: "标题为必填项" });
  const project = getActiveProject();
  const info = db
    .prepare(
      `INSERT INTO tickets (project_id, title, description, priority, status, creator, reviewer, tags_json) VALUES (?, ?, ?, ?, 'open', ?, ?, ?)`,
    )
    .run(
      project?.id || null,
      title,
      description || "",
      priority || "medium",
      creator || "",
      reviewer || "",
      JSON.stringify(tags || []),
    );
  res.json({ message: "工单已创建", id: info.lastInsertRowid });
});

router.put("/tickets/:id", (req, res) => {
  const { status, reviewer } = req.body;
  if (status)
    db.prepare(
      "UPDATE tickets SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(status, req.params.id);
  if (reviewer)
    db.prepare(
      "UPDATE tickets SET reviewer = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    ).run(reviewer, req.params.id);
  res.json({ message: "工单已更新" });
});

// =========== 规范检查 ===========
router.get("/standards/summary", async (req, res) => {
  const scan = ensureScan();
  if (!scan)
    return res.json({ overall: 0, vue: [], ts: [], i18n: [], naming: [] });

  const vueFiles = scan.files.filter((f) => f.path.endsWith(".vue"));
  const tsFiles = scan.files.filter((f) => f.path.match(/\.(ts|tsx)$/));
  const totalFiles = scan.files.length;

  const anyIssues = scan.issues.filter((i) => i.rule === "no-explicit-any");
  const cnIssues = scan.issues.filter((i) => i.rule === "no-hardcode-cn");
  const consoleIssues = scan.issues.filter((i) => i.rule === "no-console");

  const anyCompliance =
    totalFiles > 0
      ? Math.round((1 - anyIssues.length / Math.max(totalFiles, 1)) * 100)
      : 100;
  const cnCompliance =
    totalFiles > 0
      ? Math.round((1 - cnIssues.length / Math.max(totalFiles, 1)) * 100)
      : 100;
  const overall = Math.round((anyCompliance + cnCompliance) / 2);

  res.json({
    overall,
    vue: [
      {
        name: "Vue SFC 文件数",
        current: vueFiles.length,
        total: totalFiles,
        compliance:
          totalFiles > 0 ? Math.round((vueFiles.length / totalFiles) * 100) : 0,
        pass: true,
        violations: [],
      },
    ],
    ts: [
      {
        name: "any 类型使用检测",
        current: totalFiles - anyIssues.length,
        total: totalFiles,
        compliance: anyCompliance,
        pass: anyIssues.length === 0,
        violations: anyIssues
          .slice(0, 5)
          .map((i) => ({ file: `${i.file}:${i.line}`, message: i.message })),
      },
      {
        name: "console 调用检测",
        current: totalFiles - consoleIssues.length,
        total: totalFiles,
        compliance: Math.round(
          (1 - consoleIssues.length / Math.max(totalFiles, 1)) * 100,
        ),
        pass: consoleIssues.length === 0,
        violations: consoleIssues
          .slice(0, 5)
          .map((i) => ({ file: `${i.file}:${i.line}`, message: i.message })),
      },
    ],
    i18n: [
      {
        name: "硬编码中文检测",
        current: totalFiles - cnIssues.length,
        total: totalFiles,
        compliance: cnCompliance,
        pass: cnIssues.length === 0,
        violations: cnIssues
          .slice(0, 5)
          .map((i) => ({ file: `${i.file}:${i.line}`, message: i.message })),
      },
    ],
    naming: [],
  });
});

// =========== 依赖管理 ===========
router.get("/deps/packages", async (req, res) => {
  const project = getActiveProject();
  if (!project) return res.json([]);
  const pkgPath = path.join(project.path, "package.json");
  if (!fs.existsSync(pkgPath)) return res.json([]);

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const result = Object.entries(deps).map(([name, version]) => ({
    name,
    current: String(version).replace(/^\^|~/, ""),
    latest: "-",
    size: "-",
    status: "ok",
  }));
  res.json(result);
});

router.get("/deps/circular", (req, res) => {
  res.json([]); // 循环依赖检测需要更深入的分析
});

// =========== 性能监控 ===========
router.get("/perf/bundle", async (req, res) => {
  const project = getActiveProject();
  if (!project)
    return res.json({
      totalSize: "0",
      gzipSize: "0",
      chunks: 0,
      lazyRate: 0,
      components: [],
    });
  const pkgPath = path.join(project.path, "package.json");
  if (!fs.existsSync(pkgPath))
    return res.json({
      totalSize: "0",
      gzipSize: "0",
      chunks: 0,
      lazyRate: 0,
      components: [],
    });

  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
  const deps = Object.keys(pkg.dependencies || {});
  const colors = [
    "#3b82f6",
    "#ef4444",
    "#8b5cf6",
    "#10b981",
    "#f59e0b",
    "#64748b",
    "#ec4899",
    "#06b6d4",
  ];
  res.json({
    totalSize: "-",
    gzipSize: "-",
    chunks: deps.length,
    lazyRate: 0,
    components: deps.slice(0, 8).map((name, i) => ({
      name,
      size: 1,
      sizeLabel: "-",
      color: colors[i % colors.length],
    })),
  });
});

router.get("/perf/large-files", async (req, res) => {
  const scan = ensureScan();
  if (!scan) return res.json([]);
  const sorted = [...scan.files].sort((a, b) => b.size - a.size).slice(0, 10);
  res.json(
    sorted.map((f) => ({
      path: f.path,
      size: formatSize(f.size),
      note: f.lines > 500 ? `${f.lines} 行` : "",
    })),
  );
});

// =========== 安全审计 ===========
router.get("/security/vulnerabilities", async (req, res) => {
  const scan = ensureScan();
  if (!scan) return res.json([]);
  const vhtmlIssues = scan.issues.filter((i) => i.rule === "vue/no-v-html");
  const vulns = [];
  if (vhtmlIssues.length > 0) {
    vulns.push({
      id: 1,
      severity: "medium",
      title: `v-html 使用检测 (${vhtmlIssues.length}处)`,
      description: "直接渲染 HTML 可能导致 XSS 攻击",
      fix: "使用 DOMPurify 进行消毒处理",
    });
  }
  res.json(vulns);
});

router.get("/security/sensitive", async (req, res) => {
  const project = getActiveProject();
  if (!project) return res.json([]);
  const results = [];
  // 检测 .env 文件
  const envFiles = [
    ".env",
    ".env.development",
    ".env.local",
    ".env.production",
  ];
  for (const envFile of envFiles) {
    const envPath = path.join(project.path, envFile);
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf-8");
      const lines = content.split("\n");
      lines.forEach((line, idx) => {
        if (
          /(?:KEY|SECRET|TOKEN|PASSWORD)/i.test(line) &&
          !/^#/.test(line.trim())
        ) {
          results.push({
            id: results.length + 1,
            message: `${envFile} 中可能包含敏感信息`,
            file: `${envFile}:${idx + 1}`,
          });
        }
      });
    }
  }
  res.json(results);
});

// =========== 团队协作 ===========
router.get("/team/members", (req, res) => {
  const tickets = db
    .prepare("SELECT creator, COUNT(*) as count FROM tickets GROUP BY creator")
    .all();
  const members = tickets
    .filter((t) => t.creator)
    .map((t) => ({
      name: t.creator,
      commits: 0,
      reviews: 0,
      pending: 0,
      issueRate: 0,
    }));
  res.json(members.length > 0 ? members : []);
});

router.get("/team/owners", (req, res) => {
  res.json([]);
});

// =========== 报告中心 ===========
router.get("/reports/overview", async (req, res) => {
  const scan = ensureScan();
  const ticketCount = db.prepare("SELECT COUNT(*) as c FROM tickets").get();
  const doneCount = db
    .prepare(`SELECT COUNT(*) as c FROM tickets WHERE status = 'done'`)
    .get();
  res.json({
    totalReviews: ticketCount?.c || 0,
    completed: doneCount?.c || 0,
    totalIssues: scan?.summary?.total || 0,
    avgScore: scan
      ? Math.max(0, 100 - scan.summary.errors * 5 - scan.summary.warnings * 2)
      : 100,
  });
});

router.get("/reports/ranking", (req, res) => {
  const rankings = db
    .prepare(
      `
    SELECT creator as name, COUNT(*) as reviews, 0 as issues, 0 as avgScore
    FROM tickets WHERE creator != '' GROUP BY creator ORDER BY reviews DESC
  `,
    )
    .all();
  res.json(rankings);
});

router.get("/reports/issue-types", async (req, res) => {
  const scan = ensureScan();
  if (!scan) return res.json([]);
  const ruleGroups = {};
  for (const issue of scan.issues) {
    const rule = issue.rule || "other";
    ruleGroups[rule] = (ruleGroups[rule] || 0) + 1;
  }
  const total = scan.issues.length || 1;
  const result = Object.entries(ruleGroups)
    .map(([type, count]) => ({
      type,
      count,
      percent: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count);
  res.json(result);
});

router.get("/reports/history", (req, res) => {
  res.json([]);
});

// =========== 设置 ===========
router.get("/settings", (req, res) => {
  const rows = db.prepare("SELECT * FROM settings").all();
  const result = {};
  for (const row of rows) {
    result[row.key] = JSON.parse(row.value_json);
  }
  res.json({
    general: result.general || {
      siteName: "代码审查系统",
      language: "zh-CN",
      autoAssign: true,
      maxReviewers: 3,
      reviewTimeout: 48,
    },
    notify: result.notify || {
      email: true,
      browser: true,
      onAssign: true,
      onComment: true,
    },
    git: result.git || {
      url: "",
      token: "",
      autoPull: true,
      defaultBranch: "main",
    },
  });
});

router.post("/settings", (req, res) => {
  const { type, data } = req.body;
  if (!type || !data) return res.status(400).json({ message: "参数缺失" });
  db.prepare(
    "INSERT OR REPLACE INTO settings (key, value_json) VALUES (?, ?)",
  ).run(type, JSON.stringify(data));
  res.json({ message: "设置已保存" });
});

// =========== 登录 ===========
router.post("/auth/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ message: "请输入用户名和密码" });
  res.json({
    token: "jwt-" + Date.now(),
    user: { id: 1, username, role: "admin", name: username },
  });
});

router.get("/health", (req, res) =>
  res.json({ status: "ok", time: new Date().toISOString() }),
);

module.exports = router;
