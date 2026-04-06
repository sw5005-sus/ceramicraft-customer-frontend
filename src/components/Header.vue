<template>
  <header class="header">
    <div class="header-content">
      <div class="logo">
        <div class="logo-image">
          <img src="/img/logo.png" alt="CERAMIC-CRAFT Logo" />
        </div>
        <span>CERAMIC-CRAFT</span>
      </div>
      
      <!-- 导航标签 -->
      <div class="nav-tabs">
        <div 
          class="nav-tab" 
          :class="{ active: currentRoute === 'Home' }"
          @click="goToRoute('Home')"
        >
          Home
        </div>
        <div 
          class="nav-tab" 
          :class="{ active: currentRoute === 'Cart' }"
          @click="goToRoute('Cart')"
        >
          Cart
        </div>
        <div 
          class="nav-tab" 
          :class="{ active: currentRoute === 'Orders' }"
          @click="goToRoute('Orders')"
        >
          Orders
        </div>
          <div 
            class="nav-tab" 
            :class="{ active: currentRoute === 'MyReviews' }"
            @click="goToRoute('MyReviews')"
          >
            My Reviews
          </div>
      </div>
      
      <div class="actions">
        <div class="user-status">
          <el-icon class="action-icon" @click="goProfile" :title="isLoggedIn ? 'Profile' : 'Login'">
            <User />
          </el-icon>
          <span v-if="!isLoggedIn" class="login-status">Not Logged In</span>
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

import { computed } from 'vue'
import { User } from '@element-plus/icons-vue'
import { useRouter, useRoute } from 'vue-router'
import { authState } from '../auth/authState'
import { signIn } from '../auth/zitadel'

const router = useRouter()
const route = useRoute()

// 登录状态 — 使用 OIDC 响应式状态
const isLoggedIn = computed(() => authState.isAuthenticated)

// 当前路由状态
const currentRoute = computed(() => {
  if (route.name === 'CustomerHome' || route.name === 'Home') {
    return 'Home'
  } else if (route.name === 'CustomerCart' || route.name === 'Cart') {
    return 'Cart'
  } else if (route.name === 'CustomerOrders' || route.name === 'Orders') {
    return 'Orders'
    } else if (route.name === 'MyReviews') {
      return 'MyReviews'
  }
  return ''
})

// 跳转到个人中心或触发 Zitadel 登录
const goProfile = () => {
  if (isLoggedIn.value) {
    router.push({ name: 'CustomerProfile' })
  } else {
    signIn('/customer/profile')
  }
}

// 导航标签跳转函数
const goToRoute = (routeName: string) => {
  if (routeName === 'Home') {
    router.push({ name: 'CustomerHome' })
  } else if (routeName === 'Cart') {
    if (isLoggedIn.value) {
      router.push({ name: 'CustomerCart' })
    } else {
      signIn('/customer/cart')
    }
  } else if (routeName === 'Orders') {
    if (isLoggedIn.value) {
      router.push({ name: 'CustomerOrders' })
    } else {
      signIn('/customer/orders')
    }
    } else if (routeName === 'MyReviews') {
      if (isLoggedIn.value) {
        router.push({ name: 'MyReviews' })
      } else {
        signIn('/customer/my-reviews')
      }
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

/* 导航标签样式 */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 32px;
  flex: 1;
  justify-content: center;
}

.nav-tab {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 500;
  color: #666;
  transition: all 0.3s ease;
  position: relative;
}

.nav-tab:hover {
  color: #c75d35;
}

.nav-tab.active {
  color: #c75d35;
  font-weight: 600;
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
</style>
