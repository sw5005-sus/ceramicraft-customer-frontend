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
          :key="order.order_no"
          class="order-card"
        >
          <!-- 订单头部 -->
          <div class="order-header">
            <div class="order-info">
              <span class="order-number">Order #{{ order.order_no }}</span>
              <span class="order-date">{{ formatDate(order.create_time) }}</span>
            </div>
            <div class="order-status">
              <span class="status-badge" :class="getStatusClass(order.status)">
                {{ getStatusText(order.status) }}
              </span>
            </div>
          </div>

          <!-- 订单信息 -->
          <div class="order-details">
            <div class="order-info-row">
              <span class="info-label">Receiver:</span>
              <span class="info-value">{{ order.receiver_first_name }} {{ order.receiver_last_name }}</span>
            </div>
            <div class="order-info-row">
              <span class="info-label">Phone:</span>
              <span class="info-value">{{ order.receiver_phone }}</span>
            </div>
          </div>

          <!-- 订单总计 -->
          <div class="order-footer">
            <div class="order-total">
              <span class="total-label">Total: </span>
              <span class="total-amount">{{ formatCurrency(order.total_amount) }}</span>
            </div>
            <div class="order-actions">
              <el-button size="small" @click="viewOrderDetail(order.order_no)">
                View Details
              </el-button>
              <el-button 
                v-if="order.status === 'Shipped'"
                type="primary" 
                size="small" 
                @click="confirmDeliveryOrder(order.order_no)"
              >
                Confirm Receive
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
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Loading, Warning, Document } from '@element-plus/icons-vue'
import { getOrderList, confirmDelivery, type Order, type OrderListRequest } from '../api/order'

const router = useRouter()

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
    const params: OrderListRequest = {
      limit: 20,
      offset: 0
    }
    
    const response = await getOrderList(params)
    orders.value = response.orders
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to load orders'
    console.error('Failed to load orders:', err)
  } finally {
    loading.value = false
  }
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
    case 'Paid':
      return 'status-paid'
    case 'Shipped':
      return 'status-shipped'
    case 'Delivered':
      return 'status-delivered'
    default:
      return 'status-unknown'
  }
}

/**
 * 获取订单状态文本
 */
const getStatusText = (status: string) => {
  switch (status) {
    case 'Paid':
      return 'Paid'
    case 'Shipped':
      return 'Shipped'
    case 'Delivered':
      return 'Delivered'
    default:
      return status || 'Unknown'
  }
}

/**
 * 查看订单详情
 */
const viewOrderDetail = (orderNo: string) => {
  router.push(`/customer/orders/${orderNo}`)
}

/**
 * 确认收货
 */
const confirmDeliveryOrder = async (orderNo: string) => {
  try {
    await confirmDelivery(orderNo)
    ElMessage.success('Delivery confirmed successfully')
    // 重新加载订单列表
    await loadOrders()
  } catch (error) {
    console.error('Failed to confirm delivery:', error)
    ElMessage.error('Failed to confirm delivery')
  }
}

// 组件挂载时加载订单
onMounted(() => {
  loadOrders()
})
</script>

<style scoped>
.orders-page {
  max-width: 900px;
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
  gap: 16px;
}

.order-card {
  background: white;
  border: 1px solid #e1e8ed;
  border-radius: 12px;
  padding: 20px;
  transition: box-shadow 0.2s;
  max-width: 100%;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* 订单头部 */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f1f5f9;
  gap: 16px;
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

.status-paid {
  background: #dbeafe;
  color: #2563eb;
}

.status-shipped {
  background: #f0f9ff;
  color: #0369a1;
}

.status-delivered {
  background: #dcfce7;
  color: #16a34a;
}

.status-unknown {
  background: #f3f4f6;
  color: #6b7280;
}

/* 订单详情 */
.order-details {
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.order-info-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.order-info-row:last-child {
  margin-bottom: 0;
}

.info-label {
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
  flex-shrink: 0;
}

.info-value {
  font-size: 13px;
  color: #1a1a1a;
  text-align: right;
  flex: 1;
  margin-left: 12px;
}

/* 订单底部 */
.order-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #f1f5f9;
  gap: 16px;
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
  gap: 8px;
  flex-shrink: 0;
}

.order-actions .el-button {
  min-width: 70px;
  font-size: 13px;
  padding: 6px 12px;
}

.order-actions .el-button:not(.el-button--primary) {
  background: #ffffff;
  border-color: #c75d35;
  color: #c75d35;
}

.order-actions .el-button:not(.el-button--primary):hover {
  background: #c75d35;
  color: white;
}

.order-actions .el-button--primary {
  background: #c75d35;
  border-color: #c75d35;
}

.order-actions .el-button--primary:hover {
  background: #a84a2a;
  border-color: #a84a2a;
}

/* 中等屏幕响应式设计 */
@media (max-width: 1024px) {
  .orders-page {
    max-width: 800px;
    padding: 20px;
  }
}

@media (max-width: 900px) {
  .orders-page {
    max-width: 100%;
    padding: 16px;
  }
  
  .order-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .order-footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
  
  .order-actions {
    justify-content: flex-end;
  }
}

/* 小屏幕响应式设计 */
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

  .order-details {
    padding: 12px;
  }

  .order-info-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .info-label {
    min-width: auto;
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
