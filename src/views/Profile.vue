<template>
  <div class="profile-page">
    <h2>Profile</h2>
    <p>This is the user profile page content.</p>
    <button class="logout-btn" @click="handleLogout">LOGOUT</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage } from 'element-plus'
import { logout } from '../api/auth'

const router = useRouter()

/**
 * 处理退出登录
 */
const handleLogout = () => {
  ElMessageBox.confirm('Are you sure you want to logout?', 'Confirmation', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(async () => {
    try {
      // 调用退出登录API
      await logout()
      ElMessage.success('Logout successful')
      // 跳转到登录页面
      router.push({ name: 'CustomerLogin' })
    } catch (error) {
      // API调用失败，但本地状态已经清除，仍然跳转到登录页
      console.error('Logout API failed:', error)
      ElMessage.warning('Logout request failed, but local login state has been cleared')
      router.push({ name: 'CustomerLogin' })
    }
  }).catch(() => {
    // 用户取消，无需处理
  })
}
</script>

<style scoped>
.profile-page {
  padding: 40px 0;
  text-align: center;
}

.logout-btn {
  padding: 12px 32px;
  background: #dc3545;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 20px;
}

.logout-btn:hover {
  background: #c82333;
}
</style>
