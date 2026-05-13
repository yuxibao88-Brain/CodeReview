const fs = require('fs')
const path = require('path')
const { glob } = require('glob')

// 全局扫描进度
const progress = { scanning: false, current: 0, total: 0, currentFile: '' }

function getProgress() {
  return { ...progress }
}

/**
 * 扫描指定目录，返回文件树、问题列表、统计等
 */
async function scanProject(projectPath) {
  if (!fs.existsSync(projectPath)) {
    throw new Error(`路径不存在: ${projectPath}`)
  }

  progress.scanning = true
  progress.current = 0
  progress.currentFile = '正在收集文件列表...'

  const allFiles = await glob('**/*.{vue,ts,tsx,js,jsx,css,scss,json}', {
    cwd: projectPath,
    ignore: ['node_modules/**', 'dist/**', '.git/**', '*.min.*'],
    absolute: false,
  })

  progress.total = allFiles.length

  const issues = []
  const fileStats = []
  let totalLines = 0
  let totalSize = 0
  let issueId = 1

  for (let fi = 0; fi < allFiles.length; fi++) {
    const relPath = allFiles[fi]
    progress.current = fi + 1
    progress.currentFile = relPath

    // 每10个文件释放一次事件循环，让其他请求能响应
    if (fi % 10 === 0) await new Promise(resolve => setImmediate(resolve))

    const absPath = path.join(projectPath, relPath)
    let stat, content
    try {
      stat = fs.statSync(absPath)
      content = fs.readFileSync(absPath, 'utf-8')
    } catch { continue }

    const lines = content.split('\n')
    const lineCount = lines.length
    const fileSize = stat.size
    totalLines += lineCount
    totalSize += fileSize

    const complexityMatches = content.match(/\b(if|else|for|while|switch|catch)\b|&&|\|\|/g)
    const complexity = complexityMatches ? complexityMatches.length : 0

    const fileIssues = []

    if (lineCount > 500) {
      fileIssues.push({
        id: issueId++, severity: 'warning', rule: 'max-lines',
        message: `文件行数过多 (${lineCount} 行, 建议 ≤500)`,
        file: relPath, line: 1,
        codeLines: [{ num: 1, code: lines[0] || '', highlight: true }],
      })
    }

    if (complexity > 20) {
      fileIssues.push({
        id: issueId++, severity: 'warning', rule: 'complexity',
        message: `圈复杂度过高 (${complexity}, 建议 ≤20)`,
        file: relPath, line: 1,
        codeLines: [],
      })
    }

    if (relPath.match(/\.(ts|tsx|vue)$/)) {
      lines.forEach((line, idx) => {
        if (/:\s*any\b/.test(line) && !/\/\//.test(line.split(':')[0])) {
          fileIssues.push({
            id: issueId++, severity: 'suggestion', rule: 'no-explicit-any',
            message: '发现 any 类型，建议使用具体类型',
            file: relPath, line: idx + 1,
            codeLines: buildCodeContext(lines, idx),
          })
        }
      })
    }

    lines.forEach((line, idx) => {
      if (/console\.(log|warn|error|debug)\s*\(/.test(line) && !/\/\//.test(line.substring(0, line.indexOf('console')))) {
        fileIssues.push({
          id: issueId++, severity: 'suggestion', rule: 'no-console',
          message: '发现 console 调用，生产环境应移除',
          file: relPath, line: idx + 1,
          codeLines: buildCodeContext(lines, idx),
        })
      }
    })

    if (relPath.match(/\.(vue|ts|tsx|js|jsx)$/)) {
      lines.forEach((line, idx) => {
        if (/['"`].*[\u4e00-\u9fff].*['"`]/.test(line) && !/\/\/|\/\*|\*\/|<!--/.test(line)) {
          fileIssues.push({
            id: issueId++, severity: 'suggestion', rule: 'no-hardcode-cn',
            message: '发现硬编码中文字符串',
            file: relPath, line: idx + 1,
            codeLines: buildCodeContext(lines, idx),
          })
        }
      })
    }

    if (relPath.endsWith('.vue')) {
      lines.forEach((line, idx) => {
        if (/v-html/.test(line)) {
          fileIssues.push({
            id: issueId++, severity: 'error', rule: 'vue/no-v-html',
            message: 'v-html 可能导致 XSS 攻击',
            file: relPath, line: idx + 1,
            codeLines: buildCodeContext(lines, idx),
          })
        }
      })
    }

    issues.push(...fileIssues)
    fileStats.push({
      path: relPath, name: path.basename(relPath),
      size: fileSize, lines: lineCount, complexity,
      issueCount: fileIssues.length, issues: fileIssues,
    })
  }

  progress.scanning = false
  progress.currentFile = ''

  const errors = issues.filter(i => i.severity === 'error').length
  const warnings = issues.filter(i => i.severity === 'warning').length
  const suggestions = issues.filter(i => i.severity === 'suggestion').length

  return {
    files: fileStats, issues,
    summary: { total: issues.length, errors, warnings, suggestions },
    stats: { totalFiles: allFiles.length, totalLines, totalSize },
  }
}

function buildFileTree(fileStats) {
  const root = []
  const dirs = {}
  for (const f of fileStats) {
    const parts = f.path.split('/')
    let current = root
    let currentPath = ''
    for (let i = 0; i < parts.length - 1; i++) {
      currentPath += (currentPath ? '/' : '') + parts[i]
      if (!dirs[currentPath]) {
        const dirNode = { name: parts[i], type: 'dir', path: currentPath, children: [], issues: 0 }
        current.push(dirNode)
        dirs[currentPath] = dirNode
      }
      dirs[currentPath].issues += f.issueCount
      current = dirs[currentPath].children
    }
    current.push({
      name: parts[parts.length - 1], type: 'file', path: f.path,
      lines: f.lines, complexity: f.complexity, issues: f.issueCount, size: f.size,
    })
  }
  return root
}

function buildCodeContext(lines, targetIdx) {
  const result = []
  const start = Math.max(0, targetIdx - 1)
  const end = Math.min(lines.length - 1, targetIdx + 1)
  for (let i = start; i <= end; i++) {
    result.push({ num: i + 1, code: lines[i], highlight: i === targetIdx })
  }
  return result
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

module.exports = { scanProject, buildFileTree, formatSize, getProgress }
