const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const PORT = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

// 路由
app.use("/api", require("./routes"));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.message);
  res.status(500).json({ message: err.message || "服务器内部错误" });
});

process.on("uncaughtException", (err) => {
  console.error("⚠️ Uncaught Exception:", err.message);
});
process.on("unhandledRejection", (err) => {
  console.error("⚠️ Unhandled Rejection:", err);
});

// 启动
app.listen(PORT, () => {
  console.log(`\n  🚀 Code Review API 已启动`);
  console.log(`  ➜ Local:   http://localhost:${PORT}`);
  console.log(`  ➜ API:     http://localhost:${PORT}/api\n`);
});
