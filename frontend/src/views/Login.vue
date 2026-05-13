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
          <span class="logo-icon-wrap">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9.4 16.6L4.8 12L9.4 7.4L8 6L2 12L8 18L9.4 16.6ZM14.6 16.6L19.2 12L14.6 7.4L16 6L22 12L16 18L14.6 16.6Z" fill="#58a6ff"/>
            </svg>
          </span>
          <span class="logo-text">ASMS <span class="logo-sub">Code Review</span></span>
        </h1>
        <h2 class="login-title">Sign in</h2>
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
            登 录
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
  width: 400px;
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: 40px;
}

.login-header {
  margin-bottom: 32px;
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 24px;
}
.logo-sub { color: var(--color-text-secondary); font-weight: 400; }

.login-title {
  font-size: 24px;
  font-weight: 600;
  color: var(--color-text);
  margin-bottom: 8px;
}

.login-subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.login-form {
  margin-top: 24px;
}

:deep(.el-form-item) {
  margin-bottom: 16px;
}

:deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid var(--color-border) !important;
  border-radius: 6px;
  padding: 8px 12px;
  background: var(--color-bg) !important;
  transition: border-color 0.15s;
}

:deep(.el-input__wrapper:hover) {
  border-color: var(--color-border-hover) !important;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: var(--color-accent) !important;
  box-shadow: 0 0 0 3px rgba(88, 166, 255, 0.15) !important;
}

:deep(.el-input__inner) {
  color: var(--color-text) !important;
}

:deep(.el-input__inner::placeholder) {
  color: var(--color-text-tertiary) !important;
}

.login-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 24px;
}

.login-btn {
  background: var(--color-accent);
  border: none;
  border-radius: 8px;
  padding: 0 24px;
  font-weight: 600;
  height: 40px;
  color: #ffffff;
  transition: all 0.2s;
}

.login-btn:hover {
  background: #3b82f6;
  color: #ffffff;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(74, 140, 246, 0.3);
}
</style>
