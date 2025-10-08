<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <div class="logo-image">
          <img src="/img/logo.png" alt="CERAMIC-CRAFT Logo" />
        </div>
        <span>CERAMIC-CRAFT</span>
      </div>
      <div class="actions">
        <div class="user-status">
          <el-icon class="action-icon" @click="goProfile" :title="isLoggedIn ? 'Profile' : 'Login'">
            <User />
          </el-icon>
          <span v-if="!isLoggedIn" class="login-status">Not Logged In</span>
        </div>
        <div class="cart-icon" @click="goCart">
          <el-icon class="action-icon"><ShoppingCart /></el-icon>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
/**
 * 头部导航组件
 * @description 包含品牌logo、导航菜单和用户操作区域的头部组件
 */

import { ref, onMounted, onUnmounted } from 'vue'
import { User, ShoppingCart } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 登录状态
const isLoggedIn = ref(!!localStorage.getItem('userToken'))

// 监听localStorage变化的函数
const handleStorageChange = () => {
  isLoggedIn.value = !!localStorage.getItem('userToken')
}

// 监听登录状态变化的自定义事件
const handleLoginStatusChange = () => {
  isLoggedIn.value = !!localStorage.getItem('userToken')
}

onMounted(() => {
  // 监听localStorage变化
  window.addEventListener('storage', handleStorageChange)
  // 监听自定义登录状态变化事件
  window.addEventListener('loginStatusChanged', handleLoginStatusChange)
})

onUnmounted(() => {
  window.removeEventListener('storage', handleStorageChange)
  window.removeEventListener('loginStatusChanged', handleLoginStatusChange)
})

// 跳转到个人中心或登录页
const goProfile = () => {
  if (isLoggedIn.value) {
    router.push({ name: 'CustomerProfile' })
  } else {
    router.push({ name: 'CustomerLogin' })
  }
}

// 跳转到购物车
const goCart = () => {
  if (isLoggedIn.value) {
    router.push({ name: 'CustomerCart' })
  } else {
    router.push({ name: 'CustomerLogin' })
  }
}
</script>

<style scoped>
.header {
  display: flex;
  justify-content: center;
  height: 70px;
  border-bottom: 1px solid #eee;
  background: #fff;
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  z-index: 100;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1200px;
  padding: 0;
  margin: 0 15px; /* 减小两侧间距 */
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 180px; /* 设置最小宽度，与右侧操作区域保持平衡 */
}

.logo-image {
  width: 40px;
  height: 40px;
  border-radius: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo-image img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.logo span {
  font-weight: 600;
  font-size: 20px;
  letter-spacing: 0.5px;
}

.actions {
  display: flex;
  align-items: center;
  gap: 24px;
  height: 100%; /* 确保高度一致 */
  min-width: 180px; /* 设置最小宽度，与左侧logo区域保持平衡 */
  justify-content: flex-end; /* 确保右对齐 */
}

.user-status {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
}

.login-status {
  font-size: 12px;
  color: #999;
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #f5f5f5;
  color: #666;
  padding: 2px 4px;
  border-radius: 2px;
  white-space: nowrap;
  font-size: 10px;
}

.action-icon {
  font-size: 20px;
  cursor: pointer;
  color: #333;
  display: flex; /* 使用flex布局确保图标垂直居中 */
  align-items: center;
  justify-content: center;
  height: 24px; /* 固定高度 */
}

.cart-icon {
  cursor: pointer;
}
</style>
