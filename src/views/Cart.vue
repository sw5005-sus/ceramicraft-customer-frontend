<template>
  <div class="cart-page">
    <!-- 返回按钮 -->
    <div class="page-navigation">
      <BackButton text="Continue Shopping" to="/customer/home" />
    </div>

    <!-- 页面标题 -->
    <div class="page-header">
      <h1 class="page-title">Shopping Cart</h1>
      <div class="cart-summary" v-if="!isEmpty">
        <span class="item-count">{{ totalItems }} {{ totalItems === 1 ? 'item' : 'items' }}</span>
        <span class="selected-count" v-if="selectedItemCount > 0">
          ({{ selectedItemCount }} selected)
        </span>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading && isEmpty" class="loading-container">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <p>Loading cart...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error && isEmpty" class="error-container">
      <el-icon class="error-icon">
        <Warning />
      </el-icon>
      <p>{{ error }}</p>
      <el-button @click="loadCart" type="primary">Try Again</el-button>
    </div>

    <!-- 空购物车状态 -->
    <div v-else-if="isEmpty" class="empty-cart">
      <el-icon class="empty-icon">
        <ShoppingCart />
      </el-icon>
      <h3>Your cart is empty</h3>
      <p>Add some products to get started</p>
      <el-button type="primary" @click="$router.push('/')">
        Continue Shopping
      </el-button>
    </div>

    <!-- 购物车内容 -->
    <div v-else class="cart-content">
      <!-- 购物车操作栏 -->
      <div class="cart-actions">
        <div class="select-actions">
          <el-checkbox 
            :model-value="selectedItemCount === totalItems && totalItems > 0"
            :indeterminate="selectedItemCount > 0 && selectedItemCount < totalItems"
            @change="handleSelectAll"
          >
            Select All ({{ totalItems }})
          </el-checkbox>
        </div>
        
        <div class="cart-tools">
          <el-button @click="loadCart" :loading="loading" type="text" size="small">
            <el-icon><Refresh /></el-icon>
            Refresh
          </el-button>
          <el-button 
            @click="handleClearCart" 
            type="text" 
            size="small"
            class="clear-btn"
            :disabled="isEmpty"
          >
            <el-icon><Delete /></el-icon>
            Clear Cart
          </el-button>
        </div>
      </div>

      <!-- 购物车商品列表 -->
      <div class="cart-items">
        <div 
          v-for="item in cartItems" 
          :key="item.id" 
          class="cart-item"
          :class="{ 'selected': item.selected }"
        >
          <!-- 选择框 -->
          <div class="item-checkbox">
            <el-checkbox 
              :model-value="item.selected"
              @change="(checked: boolean) => toggleItemSelection(item.id, checked)"
            />
          </div>

          <!-- 商品图片 -->
          <div class="item-image">
            <img 
              :src="getProductImageUrl(item.product_info.pic_info)" 
              :alt="item.product_info.name"
              @error="handleImageError"
            />
          </div>

          <!-- 商品信息 -->
          <div class="item-info">
            <h4 class="item-name">{{ item.product_info.name }}</h4>
            <p class="item-category">{{ item.product_info.category }}</p>
            <p class="item-price">{{ formatPrice(item.product_info.price) }}</p>
          </div>

          <!-- 数量控制 -->
          <div class="item-quantity">
            <el-input-number
              :model-value="item.quantity"
              @change="(value: number | undefined) => updateItemQuantity(item.id, value || 1)"
              :min="1"
              :max="99"
              size="small"
              class="quantity-input"
            />
          </div>

          <!-- 小计 -->
          <div class="item-subtotal">
            <span class="subtotal-price">
              {{ formatPrice(item.total_price) }}
            </span>
          </div>

          <!-- 删除按钮 -->
          <div class="item-actions">
            <el-button 
              @click="removeItemFromCart(item.id)"
              type="text" 
              size="small"
              class="remove-btn"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 购物车底部汇总 -->
      <div class="cart-footer">
        <div class="cart-summary-section">
          <div class="summary-item">
            <span class="summary-label">Selected Items:</span>
            <span class="summary-value">{{ selectedItemCount }}</span>
          </div>
          <div class="summary-item total">
            <span class="summary-label">Total:</span>
            <span class="summary-value">{{ formatPrice(selectedPrice) }}</span>
          </div>
        </div>

        <div class="checkout-section">
          <el-button 
            type="primary" 
            size="large"
            :disabled="selectedItemCount === 0"
            @click="handleCheckout"
          >
            Checkout ({{ selectedItemCount }})
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ElMessageBox, ElMessage } from 'element-plus'
import { Loading, Warning, ShoppingCart, Refresh, Delete } from '@element-plus/icons-vue'
import { useCart } from '../composables/useCart'
import BackButton from '../components/BackButton.vue'
// import { useRouter } from 'vue-router'
// const router = useRouter()

// 使用购物车 composable
const {
  cartItems,
  loading,
  error,
  selectedItemCount,
  selectedPrice,
  totalItems,
  isEmpty,
  loadCart,
  updateItemQuantity,
  removeItemFromCart,
  toggleItemSelection,
  selectAllItems,
  unselectAllItems,
  clearCartItems,
  formatPrice
} = useCart()

/**
 * 获取商品图片URL
 */
const getProductImageUrl = (picInfo: string) => {
  if (!picInfo) return '/src/assets/defaultimg.png'
  // 假设图片存储在某个CDN或者静态资源目录
  return `/public/img/${picInfo}`
}

/**
 * 处理图片加载错误
 */
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  img.src = '/src/assets/defaultimg.png'
}

/**
 * 处理全选/取消全选
 */
const handleSelectAll = async (checked: boolean) => {
  if (checked) {
    await selectAllItems()
  } else {
    await unselectAllItems()
  }
}

/**
 * 处理清空购物车
 */
const handleClearCart = () => {
  ElMessageBox.confirm(
    'Are you sure you want to clear all items from your cart?',
    'Clear Cart',
    {
      confirmButtonText: 'Clear',
      cancelButtonText: 'Cancel',
      type: 'warning',
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    await clearCartItems()
  }).catch(() => {
    // 用户取消，无需处理
  })
}

/**
 * 处理结账
 */
const handleCheckout = () => {
  if (selectedItemCount.value === 0) {
    ElMessage.warning('Please select at least one item to checkout')
    return
  }
  
  // TODO: 跳转到结账页面
  ElMessage.info('Checkout feature coming soon!')
}
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 100px); /* 减去header和footer的高度 */
}

/* 页面导航 */
.page-navigation {
  margin-bottom: 24px;
}

/* 页面标题 */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e1e8ed;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
}

.cart-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #6b7280;
  font-size: 14px;
}

.item-count {
  font-weight: 500;
}

.selected-count {
  color: #c75d35;
  font-weight: 500;
}

/* 加载和错误状态 */
.loading-container,
.error-container {
  text-align: center;
  padding: 80px 20px;
  color: #6b7280;
}

.loading-container .loading-icon,
.error-container .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-container {
  color: #dc2626;
}

/* 空购物车状态 */
.empty-cart {
  text-align: center;
  padding: 80px 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.empty-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-cart h3 {
  font-size: 20px;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-cart p {
  color: #6b7280;
  margin: 0 0 32px 0;
}

/* 购物车内容 */
.cart-content {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

/* 购物车操作栏 */
.cart-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
  background: #f8f9fa;
}

.select-actions {
  display: flex;
  align-items: center;
}

.cart-tools {
  display: flex;
  align-items: center;
  gap: 12px;
}

.clear-btn {
  color: #dc2626 !important;
}

.clear-btn:hover {
  color: #b91c1c !important;
}

/* 购物车商品列表 */
.cart-items {
  padding: 0;
}

.cart-item {
  display: grid;
  grid-template-columns: auto 80px 1fr auto auto auto;
  align-items: center;
  gap: 20px;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.cart-item:hover {
  background: #f8f9fa;
}

.cart-item.selected {
  background: #fef3e2;
  border-left: 4px solid #c75d35;
}

.cart-item:last-child {
  border-bottom: none;
}

/* 选择框 */
.item-checkbox {
  display: flex;
  align-items: center;
}

/* 商品图片 */
.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e8ed;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 商品信息 */
.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  line-height: 1.4;
}

.item-category {
  font-size: 12px;
  color: #9ca3af;
  margin: 0 0 4px 0;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
  display: inline-block;
}

.item-price {
  font-size: 14px;
  color: #6b7280;
  margin: 0;
  font-weight: 500;
}

/* 数量控制 */
.item-quantity {
  display: flex;
  align-items: center;
}

.quantity-input {
  width: 100px;
}

/* 小计 */
.item-subtotal {
  text-align: right;
  min-width: 80px;
}

.subtotal-price {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 操作按钮 */
.item-actions {
  display: flex;
  align-items: center;
}

.remove-btn {
  color: #dc2626 !important;
  padding: 8px !important;
}

.remove-btn:hover {
  color: #b91c1c !important;
  background: #fef2f2 !important;
}

/* 购物车底部汇总 */
.cart-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  background: #f8f9fa;
  border-top: 1px solid #e1e8ed;
}

.cart-summary-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  font-size: 14px;
}

.summary-item.total {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  padding-top: 8px;
  border-top: 1px solid #e1e8ed;
}

.summary-label {
  color: #6b7280;
}

.summary-value {
  font-weight: 500;
  min-width: 80px;
  text-align: right;
}

.checkout-section .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
}

.checkout-section .el-button--primary:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

.checkout-section .el-button--primary:disabled {
  background: #d1d5db !important;
  border-color: #d1d5db !important;
  color: #9ca3af !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-page {
    padding: 16px;
  }

  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .cart-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .cart-item {
    grid-template-columns: auto 60px 1fr;
    gap: 12px;
    padding: 16px;
  }

  .item-image {
    width: 60px;
    height: 60px;
  }

  .item-quantity,
  .item-subtotal,
  .item-actions {
    grid-column: 1 / -1;
    justify-self: start;
    margin-top: 12px;
  }

  .item-subtotal {
    text-align: left;
  }

  .cart-footer {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }

  .cart-summary-section {
    order: 2;
  }

  .checkout-section {
    order: 1;
  }

  .checkout-section .el-button {
    width: 100%;
  }
}

/* Element Plus 样式重写 */
:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #374151;
}

:deep(.el-input-number) {
  width: 100px;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
}
</style>
