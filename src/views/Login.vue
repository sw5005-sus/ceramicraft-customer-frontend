<template>
  <div class="login-container">
    <div class="login-redirect">
      <el-icon class="is-loading" :size="48"><Loading /></el-icon>
      <p>Redirecting to login...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 登录页面（已废弃）
 * 用户到达此页面时会被路由守卫自动重定向到 Zitadel 登录页
 * 此组件仅作为过渡状态显示
 */
import { onMounted } from 'vue'
import { Loading } from '@element-plus/icons-vue'
import { signIn } from '../auth/zitadel'

onMounted(() => {
  signIn('/customer/home')
})
</script>

<style scoped>
.login-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.login-redirect {
  text-align: center;
}
.login-redirect p {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
}
</style>
