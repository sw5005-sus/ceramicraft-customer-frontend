<template>
  <div class="checkout-page">
    <h1 class="checkout-title">Checkout</h1>
    
    <div class="checkout-container">
      <!-- 左侧：结账表单 -->
      <div class="checkout-form">
        <!-- Contact Information -->
        <div class="form-section">
          <h2 class="section-title">Contact Information</h2>
          <div class="form-group">
            <label for="email">Email Address</label>
            <el-input
              id="email"
              v-model="checkoutForm.email"
              placeholder="your@email.com"
              type="email"
            />
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="form-section">
          <div class="section-title-with-dropdown">
            <h2 class="section-title">Shipping Address</h2>
            <div class="address-dropdown-container" v-if="userAddresses.length > 0">
              <el-button 
                @click="toggleAddressDropdown" 
                type="text" 
                class="address-dropdown-trigger"
              >
                Select from saved addresses
                <el-icon><ArrowDown /></el-icon>
              </el-button>
              
              <!-- 地址下拉菜单 -->
              <div v-if="showAddressDropdown" class="address-dropdown">
                <div 
                  v-for="address in userAddresses" 
                  :key="address.id" 
                  class="address-option"
                  :class="{ 'selected': selectedAddressId === address.id }"
                  @click="selectAddress(address.id)"
                >
                  <div class="address-option-header">
                    <strong>{{ address.first_name }} {{ address.last_name }}</strong>
                    <span v-if="address.is_default" class="default-badge">Default</span>
                  </div>
                  <div class="address-option-detail">
                    {{ address.detail }}
                  </div>
                  <div class="address-option-location">
                    {{ [address.city, address.province, address.zip_code].filter(Boolean).join(', ') }}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label for="firstName">First Name</label>
              <el-input
                id="firstName"
                v-model="checkoutForm.firstName"
                placeholder="First Name"
              />
            </div>
            <div class="form-group">
              <label for="lastName">Last Name</label>
              <el-input
                id="lastName"
                v-model="checkoutForm.lastName"
                placeholder="Last Name"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <el-input
              id="address"
              v-model="checkoutForm.address"
              placeholder="Address"
            />
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="city">City</label>
              <el-input
                id="city"
                v-model="checkoutForm.city"
                placeholder="City"
              />
            </div>
            <div class="form-group">
              <label for="zipCode">Zip Code</label>
              <el-input
                id="zipCode"
                v-model="checkoutForm.zipCode"
                placeholder="Zip Code"
              />
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label for="state">State/Province</label>
              <el-input
                id="state"
                v-model="checkoutForm.state"
                placeholder="State/Province"
              />
            </div>
            <div class="form-group">
              <label for="country">Country</label>
              <el-input
                id="country"
                v-model="checkoutForm.country"
                placeholder="Enter Country"
                style="width: 100%"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="phone">Phone Number</label>
            <el-input
              id="phone"
              v-model="checkoutForm.phone"
              placeholder="Phone Number"
            />
          </div>
        </div>

        <!-- Order Notes -->
        <div class="form-section">
          <h2 class="section-title">Order Notes (Optional)</h2>
          <div class="form-group">
            <el-input
              v-model="checkoutForm.orderNotes"
              type="textarea"
              :rows="4"
              placeholder="Special instructions for your order"
            />
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="form-actions">
          <el-button @click="returnToCart" size="large" class="return-to-cart-btn">
            Return to cart
          </el-button>
          <el-button 
            type="primary" 
            @click="placeOrder"
            :loading="orderLoading"
            size="large"
          >
            Place Order
          </el-button>
        </div>
      </div>

      <!-- 右侧：订单摘要 -->
      <div class="order-summary">
        <div class="summary-card">
          <h2 class="summary-title">Your Order</h2>
          
          <!-- 商品列表 -->
          <div class="order-items">
            <div v-for="item in checkoutItems" :key="item.id" class="order-item">
              <div class="item-image">
                <img 
                  :src="getProductImageUrl(item.product_info.pic_info)" 
                  :alt="item.product_info.name"
                  @error="handleImageError"
                />
              </div>
              <div class="item-details">
                <div class="item-name">{{ item.product_info.name }}</div>
                <div class="item-qty">Qty: {{ item.quantity }}</div>
              </div>
              <div class="item-price">${{ checkoutFormatPrice(item.total_price) }}</div>
            </div>
          </div>

          <!-- 积分余额 -->
          <div class="points-section">
            <div class="points-balance">
              <span class="points-label">Current Balance: {{ payAccount ? formatBalance(payAccount.balance) : '0 points' }}</span>
              <div class="points-card">
                <span class="card-info">Account Number: {{ payAccount ? payAccount.account_no : '8888 **** 1234' }}</span>
                <el-button 
                  type="primary" 
                  plain 
                  size="small" 
                  @click="topUp"
                  class="top-up-button"
                >
                  Top up
                </el-button>
              </div>
            </div>
          </div>

          <!-- 订单详情 -->
          <div class="order-details">
            <h3 class="details-title">Order Details</h3>
            <div class="detail-line">
              <span>Products:</span>
              <span>${{ checkoutFormatPrice(productPrice) }}</span>
            </div>
            <div class="detail-line">
              <span>Shipping:</span>
              <span>${{ checkoutFormatPrice(checkoutShippingPrice) }}</span>
            </div>
            <div class="detail-line">
              <span>Tax:</span>
              <span>${{ checkoutFormatPrice(checkoutTax) }}</span>
            </div>
            <div class="detail-line total-line">
              <span>Total:</span>
              <span>${{ checkoutFormatPrice(checkoutTotalPrice) }}</span>
            </div>
            
            <div class="payment-note">
              <p>No fees for point card payment</p>
              <p>1 Point = 1 SGD</p>
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
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { InfoFilled, ArrowDown } from '@element-plus/icons-vue'
import { useCheckout } from '../composables/useCheckout'
import { usePaymentAccount } from '../composables/usePaymentAccount'
import { useUserProfile } from '../composables/useUserProfile'
import { createOrder } from '../api/order'
import type { OrderItem, CreateOrderRequest } from '../api/order'
import { removeFromCart } from '../api/cart'
import { S3_CONFIG } from '../config/api-endpoints'
import defaultImg from '../assets/defaultimg.png'

const router = useRouter()
const { 
  checkoutItems, 
  productPrice, 
  shippingPrice: checkoutShippingPrice, 
  tax: checkoutTax, 
  totalPrice: checkoutTotalPrice,
  formatPrice: checkoutFormatPrice,
  clearCheckoutData
} = useCheckout()

const { 
  payAccount, 
  formatBalance,
  loadPayAccount,
  topUpLoading,
  performTopUp
} = usePaymentAccount()

const { 
  userProfile, 
  userAddresses,
  loadUserProfile,
  loadUserAddresses
} = useUserProfile()

// 表单数据
const checkoutForm = ref({
  email: '',
  firstName: '',
  lastName: '',
  address: '',
  city: '',
  zipCode: '',
  state: '',
  country: '',
  phone: '',
  orderNotes: ''
})

// 加载状态
const orderLoading = ref(false)

// 地址选择状态
const showAddressDropdown = ref(false)
const selectedAddressId = ref<number | null>(null)

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
 * 初始化用户信息到表单
 */
const initializeUserInfo = () => {
  if (userProfile.value) {
    // 初始化联系信息
    checkoutForm.value.email = userProfile.value.email || ''
    
    // 如果用户有姓名，分割为 firstName 和 lastName
    if (userProfile.value.name) {
      const nameParts = userProfile.value.name.trim().split(' ')
      checkoutForm.value.firstName = nameParts[0] || ''
      checkoutForm.value.lastName = nameParts.slice(1).join(' ') || ''
    }
  }
  
  // 初始化默认地址
  const defaultAddress = userAddresses.value.find(addr => addr.is_default)
  if (defaultAddress) {
    selectAddress(defaultAddress.id)
  }
}

/**
 * 选择地址
 */
const selectAddress = (addressId: number) => {
  const address = userAddresses.value.find(addr => addr.id === addressId)
  if (address) {
    selectedAddressId.value = addressId
    checkoutForm.value.firstName = address.first_name || ''
    checkoutForm.value.lastName = address.last_name || ''
    checkoutForm.value.address = address.detail || ''
    checkoutForm.value.city = address.city || ''
    checkoutForm.value.zipCode = address.zip_code || ''
    checkoutForm.value.state = address.province || ''
    checkoutForm.value.country = address.country || ''
    checkoutForm.value.phone = address.contact_phone || ''
    showAddressDropdown.value = false
  }
}

/**
 * 切换地址下拉菜单
 */
const toggleAddressDropdown = () => {
  showAddressDropdown.value = !showAddressDropdown.value
}

/**
 * 处理点击外部关闭下拉菜单
 */
const handleClickOutside = (event: MouseEvent) => {
  const target = event.target as HTMLElement
  if (!target.closest('.address-dropdown-container')) {
    showAddressDropdown.value = false
  }
}

/**
 * 获取商品图片URL
 */
const getProductImageUrl = (picInfo: string) => {
  if (picInfo && picInfo.trim()) {
    // 解析 pic_info 获取第一个图片
    const firstImage = getFirstImage(picInfo)
    if (firstImage) {
      // 如果pic_info已经是完整的URL，直接返回
      if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
        return firstImage
      }
      // 否则拼接S3基础URL
      return `${S3_CONFIG.BASE_URL}${firstImage}`
    }
  }
  return defaultImg
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
  img.src = defaultImg
}

/**
 * 返回购物车
 */
const returnToCart = () => {
  // 清除结账数据
  clearCheckoutData()
  router.push({ name: 'CustomerCart' })
}

/**
 * 充值 - 打开弹窗
 */
const topUp = () => {
  showTopUpDialog.value = true
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

/**
 * 下单
 */
const placeOrder = async () => {
  // 验证表单
  if (!validateForm()) {
    return
  }

  orderLoading.value = true
  
  try {
    // 构建订单项
    const orderItems: OrderItem[] = checkoutItems.value.map(item => ({
      product_id: item.product_info.id,
      product_name: item.product_info.name,
      price: item.product_info.price,
      quantity: item.quantity
    }))

    // 构建订单请求
    const orderRequest: CreateOrderRequest = {
      order_item_list: orderItems,
      receiver_address: checkoutForm.value.address,
      receiver_country: checkoutForm.value.country,
      receiver_first_name: checkoutForm.value.firstName,
      receiver_last_name: checkoutForm.value.lastName,
      receiver_phone: checkoutForm.value.phone,
      receiver_zip_code: parseInt(checkoutForm.value.zipCode),
      remark: checkoutForm.value.orderNotes || undefined
    }

    // 调用订单创建API
    const orderNumber = await createOrder(orderRequest)
    
    if (orderNumber) {
      ElMessage.success(`Order placed successfully! Order No: ${orderNumber}`)
      
      // 从购物车中删除已结账的商品
      try {
        const deletePromises = checkoutItems.value.map(item => 
          removeFromCart(item.id)
        )
        await Promise.all(deletePromises)
        console.log('Successfully removed checked out items from cart')
      } catch (error) {
        console.error('Failed to remove some items from cart:', error)
        // 即使删除购物车项失败，也不影响订单成功的流程
      }
      
      // 清除结账数据
      clearCheckoutData()
      
      // 跳转到订单页面
      router.push({ name: 'CustomerOrders' })
    }
    
  } catch (error) {
    console.error('创建订单失败:', error)
    ElMessage.error('Failed to place order. Please try again.')
  } finally {
    orderLoading.value = false
  }
}

/**
 * 表单验证
 */
const validateForm = () => {
  const required = ['email', 'firstName', 'lastName', 'address', 'city', 'zipCode', 'country', 'phone']
  
  for (const field of required) {
    if (!checkoutForm.value[field as keyof typeof checkoutForm.value]) {
      ElMessage.warning(`Please fill in ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
      return false
    }
  }
  
  // 验证邮箱格式 - 使用更安全的正则表达式避免 ReDoS 攻击
  // 限制邮箱长度并使用原子组避免回溯
  const email = checkoutForm.value.email
  if (email.length > 254) { // RFC 5321 规定的最大长度
    ElMessage.warning('Email address is too long')
    return false
  }
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  if (!emailRegex.test(email)) {
    ElMessage.warning('Please enter a valid email address')
    return false
  }
  
  return true
}

onMounted(async () => {
  // 检查是否有结账商品，如果没有则返回购物车
  if (checkoutItems.value.length === 0) {
    ElMessage.warning('No items selected for checkout')
    router.push({ name: 'CustomerCart' })
    return
  }
  
  // 并行加载用户数据和支付账户数据
  await Promise.all([
    loadPayAccount(),
    loadUserProfile(),
    loadUserAddresses()
  ])
  
  // 初始化用户信息到表单
  initializeUserInfo()
  
  // 添加点击外部关闭下拉菜单的事件监听
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  // 移除事件监听器
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 100px);
}

.checkout-title {
  font-size: 32px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 32px 0;
}

.checkout-container {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: 48px;
  align-items: start;
}

/* 左侧表单 */
.checkout-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.form-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-group label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

/* 地址选择下拉样式 */
.section-title-with-dropdown {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.address-dropdown-container {
  position: relative;
}

.address-dropdown-trigger {
  color: #c75d35 !important;
  font-size: 14px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.address-dropdown-trigger:hover {
  background: rgba(199, 93, 53, 0.1) !important;
}

.address-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  width: 320px;
  max-height: 400px;
  overflow-y: auto;
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 1000;
}

.address-option {
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  cursor: pointer;
  transition: background-color 0.2s;
}

.address-option:hover {
  background: #f8f9fa;
}

.address-option.selected {
  background: #fef3e2;
  border-left: 3px solid #c75d35;
}

.address-option:last-child {
  border-bottom: none;
}

.address-option-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.address-option-header strong {
  color: #1a1a1a;
  font-size: 14px;
}

.default-badge {
  background: #c75d35;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 500;
}

.address-option-detail {
  color: #6b7280;
  font-size: 13px;
  margin-bottom: 4px;
  line-height: 1.4;
}

.address-option-location {
  color: #9ca3af;
  font-size: 12px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-actions {
  display: flex;
  gap: 16px;
  padding-top: 16px;
}

.form-actions .el-button {
  flex: 1;
  height: 48px;
  font-size: 16px;
  font-weight: 500;
}

.form-actions .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

.form-actions .el-button--primary:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

/* 右侧订单摘要 */
.order-summary {
  position: sticky;
  top: 24px;
}

.summary-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
}

.summary-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 24px 0;
}

/* 商品列表 */
.order-items {
  margin-bottom: 24px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.order-item:last-child {
  border-bottom: none;
}

.item-image {
  position: relative;
  width: 64px;
  height: 64px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-name {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 4px;
}

.item-qty {
  font-size: 12px;
  color: #6b7280;
}

.item-price {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

/* 积分余额 */
.points-section {
  margin-bottom: 24px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.points-balance {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.points-label {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
}

.points-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-info {
  font-size: 12px;
  color: #6b7280;
}

.top-up-button {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
  color: white !important;
  font-size: 12px;
  padding: 4px 12px;
  height: 28px;
}

.top-up-button:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

/* 订单详情 */
.order-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.details-title {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.detail-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #6b7280;
}

.detail-line.total-line {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  padding-top: 8px;
  border-top: 1px solid #f1f5f9;
  margin-top: 8px;
}

.payment-note {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.payment-note p {
  font-size: 12px;
  color: #6b7280;
  margin: 0;
  line-height: 1.4;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .checkout-page {
    padding: 16px;
  }
  
  .checkout-container {
    grid-template-columns: 1fr;
    gap: 24px;
  }
  
  .order-summary {
    order: -1; /* 移动端将订单摘要移到顶部 */
    position: static;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
}

/* Element Plus 样式重写 */
:deep(.el-input__wrapper) {
  border-radius: 6px;
  padding: 12px;
}

:deep(.el-input__wrapper.is-focus) {
  border-color: #c75d35 !important;
  box-shadow: 0 0 0 2px rgba(199, 93, 53, 0.2) !important;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #c75d35 !important;
  box-shadow: 0 0 0 2px rgba(199, 93, 53, 0.2) !important;
}

:deep(.el-textarea__inner) {
  border-radius: 6px;
  padding: 12px;
}

:deep(.el-textarea__inner:focus) {
  border-color: #c75d35 !important;
  box-shadow: 0 0 0 2px rgba(199, 93, 53, 0.2) !important;
}

:deep(.el-radio__input.is-checked .el-radio__inner) {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

:deep(.el-radio__input.is-checked + .el-radio__label) {
  color: #c75d35;
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

/* Return to Cart按钮样式 - 与Cancel按钮一致 */
.return-to-cart-btn {
  background: #ffffff !important;
  border-color: #dcdfe6 !important;
  color: #606266 !important;
}

.return-to-cart-btn:hover {
  background: #f5f7fa !important;
  border-color: #c0c4cc !important;
  color: #606266 !important;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
}
</style>
