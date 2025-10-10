<template>
  <div class="orders-page">
    <div class="page-header">
      <h1 class="page-title">My Orders</h1>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <p>Loading orders...</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <el-icon class="error-icon">
        <Warning />
      </el-icon>
      <p>{{ error }}</p>
      <el-button @click="loadOrders" type="primary">Try Again</el-button>
    </div>

    <!-- 空订单状态 -->
    <div v-else-if="orders.length === 0" class="empty-orders">
      <el-icon class="empty-icon">
        <Document />
      </el-icon>
      <h3>No orders found</h3>
      <p>You haven't placed any orders yet.</p>
      <el-button type="primary" @click="$router.push('/customer/home')">
        Start Shopping
      </el-button>
    </div>

    <!-- 订单列表 -->
    <div v-else class="orders-content">
      <div class="orders-list">
        <div
          v-for="order in orders"
          :key="order.id"
          class="order-card"
        >
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">Order #{{ order.order_no }}</span>
              <span class="order-date">{{ formatDate(order.created_at) }}</span>
            </div>
            <div class="order-status">
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <!-- 订单商品列表 -->
          <div class="order-items">
            <div
              v-for="item in order.items"
              :key="item.id"
              class="order-item"
            >
              <div class="item-image">
                <img 
                  :src="getProductImageUrl(item.product_info.pic_info)" 
                  :alt="item.product_info.name"
                  @error="handleImageError"
                />
              </div>
              <div class="item-details">
                <h4 class="item-name">{{ item.product_info.name }}</h4>
                <p class="item-category">{{ item.product_info.category }}</p>
                <div class="item-price-qty">
                  <span class="item-price">${{ formatPrice(item.product_info.price) }}</span>
                  <span class="item-qty">× {{ item.quantity }}</span>
                </div>
              </div>
              <div class="item-total">
                ${{ formatPrice(item.total_price) }}
              </div>
            </div>
          </div>

          <!-- 订单总计 -->
          <div class="order-footer">
            <div class="order-total">
              <span class="total-label">Total: </span>
              <span class="total-amount">${{ formatPrice(order.total_amount) }}</span>
            </div>
            <div class="order-actions">
              <el-button size="small" @click="viewOrderDetail(order.id)">
                View Details
              </el-button>
              <el-button 
                v-if="order.status === 'pending'"
                type="danger" 
                size="small" 
                @click="cancelOrder(order.id)"
              >
                Cancel
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Loading, Warning, Document } from '@element-plus/icons-vue'

// 订单接口类型定义
interface OrderItem {
  id: number
  product_info: {
    id: number
    name: string
    category: string
    price: number
    pic_info: string
  }
  quantity: number
  total_price: number
}

interface Order {
  id: number
  order_no: string
  status: string
  total_amount: number
  created_at: string
  items: OrderItem[]
}

// 响应式数据
const orders = ref<Order[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

/**
 * 加载订单列表
 */
const loadOrders = async () => {
  loading.value = true
  error.value = null

  try {
    // TODO: 调用订单API
    // const response = await getOrders()
    // orders.value = response.data
    
    // 临时模拟数据
    await new Promise(resolve => setTimeout(resolve, 1000))
    orders.value = [
      {
        id: 1,
        order_no: 'ORD202410080001',
        status: 'completed',
        total_amount: 35425,
        created_at: '2024-10-08T10:30:00Z',
        items: [
          {
            id: 1,
            product_info: {
              id: 1,
              name: 'Elegant Ceramic Vase',
              category: 'Vases',
              price: 32500,
              pic_info: 'headImage.png'
            },
            quantity: 1,
            total_price: 32500
          }
        ]
      },
      {
        id: 2,
        order_no: 'ORD202410070001',
        status: 'pending',
        total_amount: 15800,
        created_at: '2024-10-07T15:20:00Z',
        items: [
          {
            id: 2,
            product_info: {
              id: 2,
              name: 'Modern Tea Set',
              category: 'Tea Sets',
              price: 15800,
              pic_info: 'headImage.png'
            },
            quantity: 1,
            total_price: 15800
          }
        ]
      }
    ]
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load orders'
    console.error('Failed to load orders:', err)
  } finally {
    loading.value = false
  }
}

/**
 * 获取商品图片URL
 */
const getProductImageUrl = (picInfo: string) => {
  if (!picInfo) return '/src/assets/defaultimg.png'
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
 * 格式化价格
 */
const formatPrice = (price: number) => {
  return (price / 100).toFixed(2)
}

/**
 * 格式化日期
 */
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * 获取订单状态样式类
 */
const getStatusClass = (status: string) => {
  switch (status) {
    case 'pending':
      return 'status-pending'
    case 'processing':
      return 'status-processing'
    case 'shipped':
      return 'status-shipped'
    case 'completed':
      return 'status-completed'
    case 'cancelled':
      return 'status-cancelled'
    default:
      return 'status-unknown'
  }
}

/**
 * 获取订单状态文本
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'processing':
      return 'Processing'
    case 'shipped':
      return 'Shipped'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return 'Unknown'
  }
}

/**
 * 查看订单详情
 */
const viewOrderDetail = (orderId: number) => {
  // TODO: 跳转到订单详情页面
  console.log('View order detail:', orderId)
  ElMessage.info('Order detail page coming soon!')
}

/**
 * 取消订单
 */
const cancelOrder = async (orderId: number) => {
  try {
    // TODO: 调用取消订单API
    console.log('Cancel order:', orderId)
    ElMessage.success('Order cancelled successfully')
    // 重新加载订单列表
    await loadOrders()
  } catch (error) {
    console.error('Failed to cancel order:', error)
    ElMessage.error('Failed to cancel order')
  }
}

// 组件挂载时加载订单
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  min-height: calc(100vh - 100px);
}

.page-header {
  margin-bottom: 32px;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0;
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

/* 空订单状态 */
.empty-orders {
  text-align: center;
  padding: 80px 20px;
}

.empty-icon {
  font-size: 64px;
  color: #d1d5db;
  margin-bottom: 24px;
}

.empty-orders h3 {
  font-size: 20px;
  color: #374151;
  margin: 0 0 8px 0;
}

.empty-orders p {
  color: #6b7280;
  margin: 0 0 32px 0;
}

.empty-orders .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

.empty-orders .el-button--primary:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

/* 订单列表 */
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.order-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 24px;
  transition: box-shadow 0.2s;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f1f5f9;
}

.order-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.order-number {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
}

.order-date {
  font-size: 14px;
  color: #6b7280;
}

/* 状态标签 */
.status-badge {
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
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
  background: #f0f9ff;
  color: #0369a1;
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

/* 订单商品列表 */
.order-items {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
}

.order-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.item-image {
  width: 60px;
  height: 60px;
  border-radius: 6px;
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
  margin: 0 0 4px 0;
}

.item-category {
  font-size: 14px;
  color: #6b7280;
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
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  text-align: right;
}

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #f1f5f9;
}

.order-total {
  font-size: 18px;
}

.total-label {
  color: #6b7280;
}

.total-amount {
  font-weight: 700;
  color: #c75d35;
}

.order-actions {
  display: flex;
  gap: 12px;
}

.order-actions .el-button {
  min-width: 80px;
}

.order-actions .el-button:not(.el-button--danger) {
  background: #ffffff;
  border-color: #c75d35;
  color: #c75d35;
}

.order-actions .el-button:not(.el-button--danger):hover {
  background: #c75d35;
  color: white;
}

.order-actions .el-button--danger {
  background: #dc2626;
  border-color: #dc2626;
}

.order-actions .el-button--danger:hover {
  background: #b91c1c;
  border-color: #b91c1c;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .orders-page {
    padding: 16px;
  }

  .order-card {
    padding: 16px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
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

  .order-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }

  .order-actions {
    width: 100%;
    justify-content: flex-end;
  }
}
</style>
