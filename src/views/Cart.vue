<template>
  <div class="cart-page">

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
      </div>

      <!-- 购物车商品列表 -->
      <div class="cart-items">
        <!-- 表头 -->
        <div class="cart-header">
          <div class="header-checkbox"></div>
          <div class="header-product">Product name</div>
          <div class="header-price">Price</div>
          <div class="header-qty">Qty</div>
          <div class="header-total">Total</div>
          <div class="header-actions"></div>
        </div>

        <!-- 商品项 -->
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

          <!-- 商品信息（图片+名称） -->
          <div class="item-product">
            <div class="product-image" v-if="getProductImageUrl(item.product_info.pic_info)">
              <img 
                :src="getProductImageUrl(item.product_info.pic_info)" 
                :alt="item.product_info.name"
                @error="handleImageError"
              />
            </div>
            <div class="product-info">
              <h4 class="product-name">{{ item.product_info.name }}</h4>
              <button class="remove-link" @click="removeItemFromCart(item.id)">
                <el-icon><Delete /></el-icon>
                Remove
              </button>
            </div>
          </div>

          <!-- 单价 -->
          <div class="item-price">
            {{ formatPrice(item.product_info.price) }}
          </div>

          <!-- 数量控制 -->
          <div class="item-quantity">
            <div class="quantity-controls">
              <button 
                class="qty-btn" 
                @click="updateItemQuantity(item.id, item.quantity - 1)"
                :disabled="item.quantity <= 1"
              >
                -
              </button>
              <span class="qty-display">{{ item.quantity }}</span>
              <button 
                class="qty-btn" 
                @click="updateItemQuantity(item.id, item.quantity + 1)"
                :disabled="item.quantity >= 99"
              >
                +
              </button>
            </div>
          </div>

          <!-- 小计 -->
          <div class="item-total">
            {{ formatPrice(item.total_price) }}
          </div>

          <!-- 占位符（对应删除按钮列） -->
          <div class="item-actions"></div>
        </div>
      </div>

      <!-- 购物车底部汇总 -->
      <div class="cart-footer">
        <div class="footer-content">
          <!-- 左侧价格汇总区域 -->
          <div class="cart-summary-section">
            <div class="summary-item">
              <span class="summary-label">Selected Items:</span>
              <span class="summary-value">{{ selectedItemCount }}</span>
            </div>
            
            <!-- 价格详情 - 始终显示，如果没有估算数据则显示基础信息 -->
            <div class="price-details">
              <div v-if="priceEstimate" class="price-breakdown">
                <div class="summary-item">
                  <span class="summary-label">Product Price:</span>
                  <span class="summary-value">{{ formatPrice(priceEstimate.product_price) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Shipping Price:</span>
                  <span class="summary-value">{{ formatPrice(priceEstimate.shipping_price) }}</span>
                </div>
                <div class="summary-item">
                  <span class="summary-label">Tax:</span>
                  <span class="summary-value">{{ formatPrice(priceEstimate.tax) }}</span>
                </div>
              </div>
              <div v-else class="price-fallback">
                <div class="summary-item">
                  <span class="summary-label">Subtotal (selected items):</span>
                  <span class="summary-value">{{ formatPrice(selectedPrice) }}</span>
                </div>
              </div>
            </div>
            
            <div class="summary-item total">
              <span class="summary-label">Total:</span>
              <span class="summary-value">
                {{ priceEstimate ? formatPrice(priceEstimate.total) : formatPrice(selectedPrice) }}
              </span>
            </div>

            <div class="checkout-section">
              <el-button 
                type="primary" 
                size="large"
                :disabled="selectedItemCount === 0"
                @click="handleCheckout"
              >
                Checkout
              </el-button>
            </div>
          </div>

          <!-- 右侧用户账户信息区域 -->
          <div class="account-info-section">
            <div class="account-header">
              <h4 class="account-title">Payment Account</h4>
              <el-button 
                v-if="payAccount"
                type="primary" 
                plain
                size="small" 
                @click="showTopUpDialog = true"
                class="top-up-btn"
              >
                Top Up
              </el-button>
            </div>
            
            <!-- 支付账户加载状态 -->
            <div v-if="payAccountLoading && !payAccount" class="payment-loading">
              <el-icon class="loading-icon">
                <Loading />
              </el-icon>
              <span>Loading...</span>
            </div>

            <!-- 支付账户错误状态 -->
            <div v-else-if="payAccountError && !payAccount" class="payment-error">
              <el-icon class="error-icon">
                <Warning />
              </el-icon>
              <div class="error-content">
                <div class="error-message">Service unavailable</div>
              </div>
            </div>

            <!-- 支付账户信息展示 -->
            <div v-else-if="payAccount" class="payment-account-card">
              <div class="account-item">
                <div class="account-label">Account Number</div>
                <div class="account-value">{{ payAccount.account_no }}</div>
              </div>
              <div class="account-item">
                <div class="account-label">Current Balance</div>
                <div class="account-value balance-value">{{ formatBalance(payAccount.balance) }}</div>
              </div>
              <div class="account-item">
                <div class="account-label">Last Updated</div>
                <div class="account-value">{{ formatDate(payAccount.updated_at) }}</div>
              </div>
            </div>

            <!-- 暂无支付账户 -->
            <div v-else class="no-payment-account">
              <el-icon class="no-account-icon">
                <CreditCard />
              </el-icon>
              <p class="no-account-text">No payment account found</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Top-up充值弹窗 -->
    <el-dialog
      v-model="showTopUpDialog"
      title="Top Up Account"
      width="400px"
      :close-on-click-modal="false"
      :close-on-press-escape="false"
    >
      <el-form 
        ref="topUpFormRef"
        :model="topUpForm" 
        :rules="topUpRules"
        label-width="120px"
        @submit.prevent="handleTopUp"
      >
        <el-form-item label="Redeem Code" prop="redeemCode">
          <el-input
            v-model="topUpForm.redeemCode"
            placeholder="Enter your redeem code"
            :maxlength="20"
            clearable
            :disabled="topUpLoading"
          />
        </el-form-item>
        
        <div class="top-up-info">
          <p class="info-text">
            <el-icon><InfoFilled /></el-icon>
            Enter a valid redeem code to add funds to your account.
          </p>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleTopUpCancel" :disabled="topUpLoading">
            Cancel
          </el-button>
          <el-button 
            type="primary" 
            @click="handleTopUp"
            :loading="topUpLoading"
          >
            {{ topUpLoading ? 'Processing...' : 'Top Up' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Warning, ShoppingCart, Delete, CreditCard, InfoFilled } from '@element-plus/icons-vue'
import { useCart } from '../composables/useCart'
import { usePaymentAccount } from '../composables/usePaymentAccount'
import { useCheckout } from '../composables/useCheckout'
import { useRouter } from 'vue-router'
import { S3_CONFIG } from '../config/api-endpoints'

const router = useRouter()
const { setCheckoutData } = useCheckout()

// 使用购物车 composable
const {
  cartItems,
  priceEstimate,
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
  formatPrice
} = useCart()

// 使用支付账户 composable
const { 
  payAccount, 
  loading: payAccountLoading, 
  error: payAccountError, 
  topUpLoading,
  formatBalance, 
  formatDate,
  loadPayAccount,
  performTopUp
} = usePaymentAccount()

// Top-up弹窗状态
const showTopUpDialog = ref(false)
const topUpForm = ref({
  redeemCode: ''
})
const topUpFormRef = ref()

// Top-up表单验证规则
const topUpRules = {
  redeemCode: [
    { required: true, message: 'Please enter redeem code', trigger: 'blur' },
    { min: 1, max: 20, message: 'Redeem code length should be 1-20 characters', trigger: 'blur' }
  ]
}

/**
 * 获取商品图片URL
 */
const getProductImageUrl = (picInfo: string) => {
  if (!picInfo) return ''
  
  // 解析 pic_info 获取第一个图片
  const firstImage = getFirstImage(picInfo)
  if (firstImage) {
    // 如果已经是完整URL，直接返回
    if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
      return firstImage
    }
    // 否则拼接S3基础URL
    return `${S3_CONFIG.BASE_URL}${firstImage}`
  }
  return ''
}

/**
 * 解析 pic_info 字符串为数组
 */
const parsePicInfo = (picInfo: string): string[] => {
  console.log('parsePicInfo input:', picInfo);
  if (!picInfo) {
    console.log('parsePicInfo: empty input, returning []');
    return [];
  }
  
  try {
    // 尝试解析为 JSON 数组
    const parsed = JSON.parse(picInfo);
    console.log('parsePicInfo: JSON.parse result:', parsed);
    if (Array.isArray(parsed)) {
      const filtered = parsed.filter(item => typeof item === 'string');
      console.log('parsePicInfo: filtered array:', filtered);
      return filtered;
    } else {
      console.log('parsePicInfo: parsed is not array');
    }
  } catch (error) {
    console.log('parsePicInfo: JSON.parse failed:', error);
  }
  
  // 如果不是 JSON 数组格式，当作单个文件名
  console.log('parsePicInfo: treating as single filename:', [picInfo]);
  return [picInfo];
}

/**
 * 获取第一个图片
 */
const getFirstImage = (picInfo: string): string => {
  const images = parsePicInfo(picInfo);
  console.log('getFirstImage: parsed images:', images);
  const first = images.length > 0 ? images[0] : '';
  console.log('getFirstImage: first image:', first);
  return first;
}

/**
 * 处理图片加载错误
 */
const handleImageError = (event: Event) => {
  const img = event.target as HTMLImageElement
  // 图片加载失败时隐藏图片
  img.style.display = 'none'
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
 * 处理结账
 */
const handleCheckout = () => {
  if (selectedItemCount.value === 0) {
    ElMessage.warning('Please select at least one item to checkout')
    return
  }
  
  // 获取选中的商品（标记 fromCart=true，让 Checkout 下单后删除真实购物车条目）
  const selectedItems = cartItems.value
    .filter(item => item.selected)
    .map(item => ({ ...item, fromCart: true }))

  // 传递结账数据
  setCheckoutData(selectedItems, priceEstimate.value)
  
  // 跳转到结账页面
  router.push({ name: 'CustomerCheckout' })
}

/**
 * 处理Top-up充值
 */
const handleTopUp = async () => {
  if (!topUpFormRef.value) return
  
  try {
    // 验证表单
    const valid = await topUpFormRef.value.validate()
    if (!valid) return
    
    // 充值
    await performTopUp(topUpForm.value.redeemCode)
    
    // 充值成功后关闭弹窗并重置表单
    showTopUpDialog.value = false
    topUpForm.value.redeemCode = ''
    topUpFormRef.value.resetFields()
    
    // 重新加载支付账户信息
    await loadPayAccount()
    
  } catch (error) {
    // 错误已经在performTopUp中处理了
    console.error('Top-up failed:', error)
  }
}

/**
 * 取消Top-up充值
 */
const handleTopUpCancel = () => {
  showTopUpDialog.value = false
  topUpForm.value.redeemCode = ''
  if (topUpFormRef.value) {
    topUpFormRef.value.resetFields()
  }
}
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 100px); /* 减去header和footer的高度 */
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
  overflow: hidden;
}

/* 购物车操作栏 */
.cart-actions {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #e1e8ed;
}

.select-actions {
  display: flex;
  align-items: center;
}

/* 购物车商品列表 */
.cart-items {
  overflow: hidden;
}

/* 表头 */
.cart-header {
  display: grid;
  grid-template-columns: 60px 1fr 140px 140px 140px 60px;
  gap: 16px;
  padding: 16px 24px;
  border-bottom: 1px solid #e1e8ed;
  font-weight: 500;
  font-size: 14px;
  color: #6b7280;
  text-transform: uppercase;
  align-items: center;
}

.cart-header > div {
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-header .header-product {
  justify-content: flex-start;
}

.cart-item {
  display: grid;
  grid-template-columns: 60px 1fr 140px 140px 140px 60px;
  gap: 16px;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #f1f5f9;
  transition: all 0.2s;
}

.cart-item:hover {
  background: #f8f9fa;
}

.cart-item:last-child {
  border-bottom: none;
}

/* 选择框 */
.item-checkbox {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 商品信息区域 */
.item-product {
  display: flex;
  align-items: center;
  gap: 16px;
}

.product-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e8ed;
  flex-shrink: 0;
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.product-info {
  flex: 1;
  min-width: 0;
}

.product-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
  line-height: 1.4;
}

.remove-link {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #ef4444;
  font-size: 14px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;
}

.remove-link:hover {
  color: #dc2626;
}

/* 单价 */
.item-price {
  font-size: 16px;
  font-weight: 500;
  color: #1a1a1a;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 数量控制 */
.item-quantity {
  display: flex;
  justify-content: center;
}

.quantity-controls {
  display: flex;
  align-items: center;
  border: 1px solid #e1e8ed;
  border-radius: 4px;
  overflow: hidden;
}

.qty-btn {
  width: 32px;
  height: 32px;
  border: none;
  background: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: #6b7280;
  transition: all 0.2s;
}

.qty-btn:hover:not(:disabled) {
  background: #f3f4f6;
  color: #1a1a1a;
}

.qty-btn:disabled {
  color: #d1d5db;
  cursor: not-allowed;
}

.qty-display {
  min-width: 40px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 500;
  color: #1a1a1a;
  border-left: 1px solid #e1e8ed;
  border-right: 1px solid #e1e8ed;
}

/* 小计 */
.item-total {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 操作列占位符 */
.item-actions {
  width: 60px;
}

/* 购物车底部汇总 */
.cart-footer {
  padding: 24px;
  border-top: 1px solid #e1e8ed;
}

.footer-content {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.cart-summary-section {
  flex: 3;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.account-info-section {
  flex: 1;
  padding: 20px;
  min-height: 200px;
}

.price-details {
  padding: 12px 0;
  border-top: 1px solid #f1f5f9;
  border-bottom: 1px solid #f1f5f9;
  margin: 8px 0;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 24px;
  font-size: 14px;
  padding: 2px 0;
}

.summary-item.total {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  padding-top: 8px;
}

.summary-label {
  color: #6b7280;
}

.summary-value {
  font-weight: 500;
  min-width: 80px;
  text-align: right;
}

.checkout-section {
  width: 100%;
  margin-top: 16px;
}

.checkout-section .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
  padding: 12px 32px;
  font-size: 16px;
  font-weight: 500;
  width: 100%;
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

/* 账户信息区域样式 */
.account-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.account-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}

.top-up-btn {
  background: transparent !important;
  border-color: #c75d35 !important;
  color: #c75d35 !important;
  font-size: 12px;
  padding: 4px 12px;
  height: 28px;
}

.top-up-btn:hover {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
  color: white !important;
}

.top-up-btn .el-icon {
  font-size: 12px;
}

.payment-loading,
.payment-error {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border-radius: 6px;
  font-size: 14px;
}

.payment-loading {
  background: #f0f9ff;
  color: #0369a1;
}

.payment-error {
  background: #fef2f2;
  color: #dc2626;
}

.loading-icon,
.error-icon {
  font-size: 16px;
}

.error-content {
  flex: 1;
}

.error-message {
  font-weight: 500;
}

.payment-account-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.account-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.account-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 600;
}

.balance-value {
  font-size: 16px;
  color: #c75d35;
  font-weight: 700;
}

.no-payment-account {
  text-align: center;
  padding: 20px;
  color: #6b7280;
}

.no-account-icon {
  font-size: 32px;
  color: #9ca3af;
  margin-bottom: 12px;
}

.no-account-text {
  margin: 0;
  font-size: 14px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .cart-page {
    padding: 16px;
  }

  .footer-content {
    flex-direction: column;
    gap: 20px;
  }

  .account-info-section {
    order: -1; /* 在移动端将账户信息移到上方 */
  }



  .cart-actions {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .cart-header {
    display: none; /* 隐藏表头 */
  }

  .cart-item {
    grid-template-columns: 1fr;
    gap: 16px;
    padding: 20px 16px;
  }

  .item-checkbox {
    position: absolute;
    top: 20px;
    right: 16px;
  }

  .item-product {
    margin-bottom: 12px;
  }

  .product-image {
    width: 60px;
    height: 60px;
  }

  .item-price,
  .item-quantity,
  .item-total {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f1f5f9;
  }

  .item-price::before {
    content: "Price: ";
    color: #6b7280;
    font-weight: 500;
  }

  .item-quantity::before {
    content: "Quantity: ";
    color: #6b7280;
    font-weight: 500;
  }

  .item-total::before {
    content: "Total: ";
    color: #6b7280;
    font-weight: 500;
  }

  .item-actions {
    display: none;
  }

  .cart-footer {
    /* 移动端保持相同的纵向布局 */
    gap: 16px;
    padding: 20px 16px;
  }
}

/* Element Plus 样式重写 */
:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #374151;
}

/* 自定义复选框橘色主题 */
:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #c75d35 !important;
  border-color: #c75d35 !important;
}

:deep(.el-checkbox__input.is-checked + .el-checkbox__label) {
  color: #c75d35;
}

:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner) {
  background-color: #c75d35 !important;
  border-color: #c75d35 !important;
}

:deep(.el-checkbox__input.is-indeterminate .el-checkbox__inner::before) {
  background-color: #fff !important;
}

:deep(.el-checkbox__input:not(.is-disabled):hover .el-checkbox__inner) {
  border-color: #c75d35;
}

:deep(.el-checkbox__input.is-focus .el-checkbox__inner) {
  border-color: #c75d35;
}

/* Top-up弹窗样式 */
.top-up-info {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 6px;
}

.info-text {
  margin: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-text .el-icon {
  font-size: 16px;
  color: #c75d35;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Top-up弹窗表单样式 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
}

:deep(.el-dialog__body) {
  padding: 0 24px 20px;
}

/* Top-up弹窗关闭按钮悬浮样式 */
:deep(.el-dialog__headerbtn) {
  color: #909399;
}

:deep(.el-dialog__headerbtn:hover) {
  color: #c75d35 !important;
}

:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #c75d35 !important;
}

:deep(.el-dialog .el-icon:hover) {
  color: #c75d35 !important;
}

/* 更具体的选择器覆盖Element Plus默认样式 */
:deep(.el-dialog__header .el-dialog__headerbtn:hover) {
  color: #c75d35 !important;
}

:deep(.el-dialog__header .el-dialog__headerbtn:hover svg) {
  color: #c75d35 !important;
}

/* Top-up弹窗按钮样式 */
.dialog-footer .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

.dialog-footer .el-button--primary:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

/* Cancel按钮样式 */
.dialog-footer .el-button:not(.el-button--primary) {
  background: #ffffff !important;
  border-color: #dcdfe6 !important;
  color: #606266 !important;
}

.dialog-footer .el-button:not(.el-button--primary):hover {
  background: #f5f7fa !important;
  border-color: #c0c4cc !important;
  color: #606266 !important;
}

/* Top-up弹窗输入框样式 */
:deep(.el-input__wrapper.is-focus) {
  border-color: #c75d35 !important;
  box-shadow: 0 0 0 2px rgba(199, 93, 53, 0.2) !important;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
}
</style>
