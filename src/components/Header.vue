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
  <el-icon class="action-icon" @click="goProfile" title="个人中心"><User /></el-icon>
        <div class="cart-icon" @click="goCart">
          <el-icon class="action-icon"><ShoppingCart /></el-icon>
          <span class="cart-count">0</span>
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

import { User, ShoppingCart } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()

// 跳转到个人中心
const goProfile = () => {
  router.push('/profile')
}
// 跳转到购物车
const goCart = () => {
  router.push('/cart')
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
  position: relative;
}

.cart-count {
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: #c75d35;
  color: white;
  font-size: 10px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
