<template>
  <div class="profile-page">
    <h2>个人中心</h2>
    <p>这里是个人信息页面内容。</p>
    <button class="logout-btn" @click="handleLogout">退出登录</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'

const router = useRouter()

/**
 * 处理退出登录
 */
const handleLogout = () => {
  ElMessageBox.confirm('确定要退出登录吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(() => {
    // 清除认证状态
    localStorage.removeItem('userToken')
    // 触发自定义事件通知登录状态变化
    window.dispatchEvent(new CustomEvent('loginStatusChanged'))
    // 跳转到登录页面
    router.push('/auth/login')
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
