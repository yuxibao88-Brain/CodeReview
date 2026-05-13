<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/stores/user";
import { ElMessage } from "element-plus";

const router = useRouter();
const userStore = useUserStore();

const form = ref({
  username: "",
  password: "",
  remember: false,
});
const loading = ref(false);

const handleLogin = async () => {
  if (!form.value.username || !form.value.password) {
    ElMessage.warning("请输入用户名和密码");
    return;
  }
  loading.value = true;
  try {
    await userStore.login(form.value);
    ElMessage.success("登录成功");
    router.push("/dashboard");
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <div class="login-header">
        <h1 class="login-logo">
          <span class="logo-blue">ASMS</span>
          <span style="color: #5f6368; margin-left: 8px; font-weight: 400"
            >Code Review</span
          >
        </h1>
        <h2 class="login-title">登录</h2>
        <p class="login-subtitle">使用您的管理账号继续</p>
      </div>

      <el-form :model="form" @submit.prevent="handleLogin" class="login-form">
        <el-form-item>
          <el-input
            v-model="form.username"
            placeholder="邮箱或手机号"
            size="large"
          />
        </el-form-item>
        <el-form-item>
          <el-input
            v-model="form.password"
            type="password"
            placeholder="输入密码"
            size="large"
            show-password
          />
        </el-form-item>

        <div class="login-actions">
          <el-link type="primary" :underline="false">忘记密码？</el-link>
          <el-button
            type="primary"
            size="large"
            :loading="loading"
            class="login-btn"
            native-type="submit"
          >
            下一步
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
}

.login-card {
  width: 420px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 16px;
  padding: 48px 40px;
  box-sizing: border-box;
  box-shadow: var(--shadow-md);
  transition: box-shadow 0.2s;
}

.login-card:hover {
  box-shadow: var(--shadow-lg);
}

.login-header {
  text-align: center;
  margin-bottom: 32px;
}

.login-logo {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 16px;
  letter-spacing: -0.02em;
}
.logo-blue { color: var(--color-accent); }
.logo-red { color: var(--color-danger); }
.logo-yellow { color: var(--color-warning); }
.logo-green { color: var(--color-success); }

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
  letter-spacing: -0.02em;
}

.login-subtitle {
  font-size: 15px;
  color: var(--color-text-secondary);
  font-weight: 400;
}

.login-form {
  margin-top: 32px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 8px;
  padding: 10px 14px;
  background: var(--color-bg-card) !important;
  transition: all 0.2s ease;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--color-border-hover) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border: 1px solid var(--color-accent) !important;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
}

.login-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 32px;
}

.login-btn {
  background-color: var(--color-accent);
  border-color: var(--color-accent);
  border-radius: 8px;
  padding: 0 28px;
  font-weight: 600;
  height: 40px;
  transition: all 0.2s ease;
}

.login-btn:hover {
  background-color: #2563eb;
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}
</style>
