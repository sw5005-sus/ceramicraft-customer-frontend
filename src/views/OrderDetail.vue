<template>
  <div class="order-detail-page">
    <!-- 返回按钮 -->
    <div class="back-button-container">
      <BackButton @click="goBack" />
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <p>Loading order details...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-icon class="error-icon">
        <Warning />
      </el-icon>
      <p>{{ error }}</p>
      <el-button @click="loadOrderDetail" type="primary">Try Again</el-button>
    </div>

    <!-- 订单详情内容 -->
    <div v-else-if="orderDetail" class="order-detail-content">
      <!-- 订单头部 -->
      <div class="order-header">
        <div class="order-info">
          <h1 class="page-title">Order Details</h1>
          <div class="order-meta">
            <span class="order-number">Order #{{ orderDetail.order_no }}</span>
            <span class="order-date">Placed on {{ formatDate(orderDetail.create_time) }}</span>
          </div>
        </div>
        <div class="order-status">
          <span class="status-badge" :class="getStatusClass(orderDetail.status_name)">
            {{ orderDetail.status_name }}
          </span>
        </div>
      </div>

      <!-- 配送信息 -->
      <div class="info-section">
        <h2 class="section-title">Shipping Information</h2>
        <div class="info-card">
          <div class="shipping-address">
            <h3>Shipping Address</h3>
            <div class="address-info">
              <p class="recipient-name">{{ orderDetail.receiver_first_name }} {{ orderDetail.receiver_last_name }}</p>
              <p class="address">{{ orderDetail.receiver_address }}</p>
              <p class="location">{{ orderDetail.receiver_country }} {{ orderDetail.receiver_zip_code }}</p>
              <p class="phone">{{ orderDetail.receiver_phone }}</p>
            </div>
          </div>
          
          <div class="delivery-details" v-if="orderDetail.logistics_no">
            <h3>Delivery Details</h3>
            <div class="delivery-info">
              <div class="info-row">
                <span class="label">Carrier:</span>
                <span class="value">Express Delivery</span>
              </div>
              <div class="info-row">
                <span class="label">Tracking Number:</span>
                <span class="value">{{ orderDetail.logistics_no }}</span>
              </div>
              <div class="info-row" v-if="orderDetail.delivery_time">
                <span class="label">Delivery Time:</span>
                <span class="value">{{ formatDate(orderDetail.delivery_time) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 订单商品 -->
      <div class="info-section">
        <h2 class="section-title">Items in Your Order</h2>
        <div class="items-card">
          <div
            v-for="item in orderDetail.order_items"
            :key="item.id"
            class="order-item"
          >
            <div class="item-image" v-if="getProductImageUrl(item.pic_info || '')">
              <img 
                :src="getProductImageUrl(item.pic_info || '')"
                :alt="item.product_name"
                @error="handleImageError"
              />
            </div>
            <div class="item-details">
              <h4 class="item-name">{{ item.product_name }}</h4>
              <div class="item-price-qty">
                <span class="item-price">{{ formatCurrency(item.price) }}</span>
                <span class="item-qty">× {{ item.quantity }}</span>
              </div>
            </div>
            <div class="item-total">
              {{ formatCurrency(item.total_price) }}
            </div>
          </div>
        </div>
      </div>

      <!-- 支付信息和订单汇总 -->
      <div class="bottom-section">
        <div class="payment-info">
          <h2 class="section-title">Payment Information</h2>
          <div class="info-card">
            <div class="payment-method">
              <h3>Payment Method</h3>
              <p>Point Card: •••• •••• •••• 1234</p>
            </div>
            <div class="billing-address">
              <h3>Billing Address</h3>
              <p>Same as shipping address</p>
            </div>
          </div>
        </div>

        <div class="order-summary">
          <h2 class="section-title">Order Summary</h2>
          <div class="summary-card">
            <div class="summary-row">
              <span class="label">Subtotal:</span>
              <span class="value">{{ formatCurrency(orderDetail.pay_amount - orderDetail.shipping_fee - orderDetail.tax) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Shipping:</span>
              <span class="value">{{ formatCurrency(orderDetail.shipping_fee) }}</span>
            </div>
            <div class="summary-row">
              <span class="label">Tax:</span>
              <span class="value">{{ formatCurrency(orderDetail.tax) }}</span>
            </div>
            <div class="summary-row total">
              <span class="label">Total:</span>
              <span class="value">{{ formatCurrency(orderDetail.total_amount) }}</span>
            </div>
            <div class="payment-note">
              <p>No fees for point card payment</p>
              <p>1 Point = 1 SGD</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Loading, Warning } from '@element-plus/icons-vue'
import { getOrderDetail, type OrderDetail } from '../api/order'
import BackButton from '../components/BackButton.vue'
import { S3_CONFIG } from '../config/api-endpoints'

const route = useRoute()
const router = useRouter()

// 响应式数据
const orderDetail = ref<OrderDetail | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

/**
 * 加载订单详情
 */
const loadOrderDetail = async () => {
  const orderNo = route.params.orderNo as string
  if (!orderNo) {
    error.value = 'Order number is required'
    return
  }

  loading.value = true
  error.value = null

  try {
    const detail = await getOrderDetail(orderNo)
    orderDetail.value = detail
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load order details'
    console.error('Failed to load order details:', err)
  } finally {
    loading.value = false
  }
}

/**
 * 返回订单列表
 */
const goBack = () => {
  router.push('/customer/orders')
}

/**
 * 获取商品图片URL
 */
const getProductImageUrl = (picInfo: string) => {
  if (!picInfo) return ''
  
  // 如果已经是完整URL，直接返回
  if (picInfo.startsWith('http://') || picInfo.startsWith('https://')) {
    return picInfo
  }
  
  // 否则拼接S3基础URL
  return `${S3_CONFIG.BASE_URL}${picInfo}`
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
 * 格式化价格（包含美元符号，负号在前）
 */
const formatCurrency = (price: number) => {
  const amount = (price / 100).toFixed(2)
  return amount.startsWith('-') ? `-$${amount.substring(1)}` : `$${amount}`
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * 获取订单状态样式类
 */
const getStatusClass = (status: string) => {
  switch (status) {
    case 'Shipped':
    case '已发货':
      return 'status-shipped'
    case 'Delivered':
    case '已完成':
      return 'status-completed'
    case 'Processing':
    case '处理中':
      return 'status-processing'
    case 'Pending':
    case '待支付':
      return 'status-pending'
    case 'Cancelled':
    case '已取消':
      return 'status-cancelled'
    default:
      return 'status-unknown'
  }
}

// 组件挂载时加载订单详情
onMounted(() => {
  loadOrderDetail()
})
</script>

<style scoped>
.order-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 100px);
}

.back-button-container {
  margin-bottom: 24px;
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

.error-container .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

.error-container .el-button--primary:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e1e8ed;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.order-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  font-size: 18px;
  font-weight: 500;
  color: #1a1a1a;
}

.order-date {
  font-size: 14px;
  color: #6b7280;
}

/* 状态标签 */
.status-badge {
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
}

.status-pending {
  background: #fef3e2;
  color: #d97706;
}

.status-processing {
  background: #dbeafe;
  color: #2563eb;
}

.status-shipped {
  background: #dcfce7;
  color: #16a34a;
}

.status-completed {
  background: #dcfce7;
  color: #16a34a;
}

.status-cancelled {
  background: #fef2f2;
  color: #dc2626;
}

.status-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

/* 信息区块 */
.info-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 16px 0;
}

.info-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 24px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.info-card h3 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 12px 0;
}

.address-info p {
  margin: 0 0 4px 0;
  color: #374151;
  line-height: 1.5;
}

.recipient-name {
  font-weight: 600;
}

.delivery-info .info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.delivery-info .info-row:last-child {
  margin-bottom: 0;
}

.delivery-info .label {
  color: #6b7280;
  font-weight: 500;
}

.delivery-info .value {
  color: #1a1a1a;
}

/* 商品列表 */
.items-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 24px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 0;
  border-bottom: 1px solid #f1f5f9;
}

.order-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.order-item:first-child {
  padding-top: 0;
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e1e8ed;
  flex-shrink: 0;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 8px 0;
}

.item-price-qty {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.item-price {
  color: #c75d35;
  font-weight: 500;
}

.item-qty {
  color: #6b7280;
}

.item-total {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: right;
}

/* 底部区块 */
.bottom-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
}

.summary-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 24px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 16px;
}

.summary-row:last-of-type {
  margin-bottom: 16px;
}

.summary-row.total {
  padding-top: 12px;
  border-top: 1px solid #e1e8ed;
  font-size: 18px;
  font-weight: 700;
}

.summary-row .label {
  color: #6b7280;
}

.summary-row .value {
  color: #1a1a1a;
}

.summary-row.total .value {
  color: #c75d35;
}

.payment-note {
  background: #f8f9fa;
  padding: 12px;
  border-radius: 8px;
  font-size: 12px;
  color: #6b7280;
}

.payment-note p {
  margin: 0 0 4px 0;
}

.payment-note p:last-child {
  margin-bottom: 0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .order-detail-page {
    padding: 16px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .info-card {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .bottom-section {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .order-item {
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .item-image {
    align-self: center;
  }

  .item-total {
    align-self: flex-end;
  }
}
</style>
