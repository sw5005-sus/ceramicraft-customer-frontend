<template>
  <div class="profile-page">
    <h2>个人中心</h2>
    <p>这里是个人信息页面内容。</p>
    <button class="logout-btn" @click="handleLogout">退出登录</button>
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
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      // 调用退出登录API
      await logout()
      ElMessage.success('退出登录成功')
      // 跳转到登录页面
      router.push('/auth/login')
    } catch (error) {
      // API调用失败，但本地状态已经清除，仍然跳转到登录页
      console.error('Logout API failed:', error)
      ElMessage.warning('退出登录请求失败，但已清除本地登录状态')
      router.push('/auth/login')
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
