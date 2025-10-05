<template>
  <div class="product-detail-page">
    <!-- 返回按钮 -->
    <div class="breadcrumb">
      <button class="back-btn" @click="goBack">
        <span class="back-icon">←</span>
        <span>Back</span>
      </button>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <p>Loading product details...</p>
    </div>

    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchProductDetail">Retry</button>
    </div>

    <!-- 商品详情内容 -->
    <div v-if="!loading && !error && product" class="product-detail-content">
      <div class="product-detail-container">
        <!-- 左侧：商品图片 -->
        <div class="product-images">
          <div class="main-image">
            <img :src="getProductImage(product)" :alt="product.name" />
            <span v-if="isOutOfStock(product)" class="out-of-stock-overlay">OUT OF STOCK</span>
          </div>
          
          <!-- 缩略图 -->
          <div class="thumbnail-images">
            <div class="thumbnail-item active">
              <img :src="getProductImage(product)" :alt="product.name" />
            </div>
            <!-- 可以添加更多缩略图 -->
          </div>
        </div>

        <!-- 右侧：商品信息 -->
        <div class="product-info">
          <div class="product-meta">
            <span class="artist-name">{{ product.category.toUpperCase() }}</span>
          </div>
          
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-price">
            <span class="price">¥{{ formatPrice(product.price) }}</span>
          </div>

          <!-- 数量选择 -->
          <div class="quantity-section">
            <label class="quantity-label">Quantity</label>
            <div class="quantity-controls">
              <button 
                class="quantity-btn" 
                @click="decreaseQuantity"
                :disabled="quantity <= 1"
              >-</button>
              <input 
                v-model.number="quantity" 
                class="quantity-input" 
                type="text" 
                inputmode="numeric"
                readonly
              />
              <button 
                class="quantity-btn" 
                @click="increaseQuantity"
                :disabled="quantity >= product.stock"
              >+</button>
            </div>
          </div>

          <!-- 操作按钮 -->
          <div class="action-buttons">
            <button 
              class="add-to-cart-btn"
              :disabled="isOutOfStock(product)"
              @click="addToCart"
            >
              {{ isLoggedIn() ? 'ADD TO CART' : 'LOGIN TO ADD TO CART' }}
            </button>
            <button 
              class="buy-now-btn"
              :disabled="isOutOfStock(product)"
              @click="buyNow"
            >
              {{ isLoggedIn() ? 'BUY NOW' : 'LOGIN TO BUY NOW' }}
            </button>
          </div>

          <!-- 商品描述 -->
          <div class="product-description">
            <h3>Description</h3>
            <p>{{ product.desc || 'This elegant piece is meticulously crafted from high-quality materials, ensuring exceptional quality and artistry.' }}</p>
          </div>

          <!-- 商品详细信息 -->
          <div class="product-details">
            <h3>Details</h3>
            <ul>
              <li v-if="product.material"><strong>Materials:</strong> {{ product.material }}</li>
              <li v-if="product.dimensions"><strong>Dimensions:</strong> {{ product.dimensions }}</li>
              <li v-if="product.weight"><strong>Weight:</strong> {{ product.weight }}</li>
              <li v-if="product.capacity"><strong>Capacity:</strong> {{ product.capacity }}</li>
              <li><strong>Category:</strong> {{ product.category }}</li>
              <li><strong>Stock:</strong> {{ product.stock }} available</li>
              <li v-if="product.care_instructions"><strong>Care:</strong> {{ product.care_instructions }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 商品详情页面
 * @description 显示单个商品的详细信息，包括图片、描述、价格等
 */

import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getProductDetail } from '../api/product'
import type { Product } from '../api/product'
import { S3_CONFIG } from '../config/api-endpoints'

// 默认图片
import defaultImg from '../assets/defaultimg.png'

// 路由相关
const route = useRoute()
const router = useRouter()

// 响应式数据
const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const quantity = ref(1)

// 获取商品详情
const fetchProductDetail = async () => {
  const productId = route.params.id as string
  if (!productId) {
    error.value = 'Product ID is required'
    return
  }

  loading.value = true
  error.value = null

  try {
    const result = await getProductDetail(productId)
    product.value = result
    console.log('Product detail fetched successfully:', result)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch product details'
    console.error('Failed to fetch product details:', err)
  } finally {
    loading.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

// 检查商品是否缺货
const isOutOfStock = (product: Product) => {
  return product.stock <= 0 || product.status !== 1
}

// 获取商品图片
const getProductImage = (product: Product) => {
  if (product.pic_info && product.pic_info.trim()) {
    // 如果pic_info已经是完整的URL，直接返回
    if (product.pic_info.startsWith('http://') || product.pic_info.startsWith('https://')) {
      return product.pic_info
    }
    // 否则拼接S3基础URL
    return `${S3_CONFIG.BASE_URL}${product.pic_info}`
  }
  return defaultImg
}

// 格式化价格，将分转换为元并保留两位小数
const formatPrice = (price: number) => {
  return (price / 100).toFixed(2)
}

// 检查登录状态
const isLoggedIn = () => {
  return !!localStorage.getItem('userToken')
}

// 数量控制
const increaseQuantity = () => {
  if (product.value && quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decreaseQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

// 添加到购物车
const addToCart = () => {
  if (!product.value) return
  
  // 检查登录状态
  if (!isLoggedIn()) {
    // 未登录，跳转到登录页
    router.push({ name: 'CustomerLogin' })
    return
  }
  
  // TODO: 实现添加到购物车逻辑
  console.log(`Adding ${quantity.value} of product ${product.value.id} to cart`)
  
  // 这里可以添加成功提示
  alert(`Added ${quantity.value} item(s) to cart!`)
}

// 立即购买
const buyNow = () => {
  if (!product.value) return
  
  // 检查登录状态
  if (!isLoggedIn()) {
    // 未登录，跳转到登录页
    router.push({ name: 'CustomerLogin' })
    return
  }
  
  // TODO: 实现立即购买逻辑
  console.log(`Buy now ${quantity.value} of product ${product.value.id}`)
  
  // 这里可以跳转到结账页面
  alert(`Proceeding to checkout with ${quantity.value} item(s)`)
}

// 组件挂载时获取商品详情
onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 面包屑导航 */
.breadcrumb {
  margin-bottom: 30px;
}

.back-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  font-size: 14px;
  padding: 8px 0;
  transition: color 0.2s;
}

.back-btn:hover {
  color: #c75d35;
}

.back-icon {
  font-size: 16px;
  font-weight: bold;
}

/* 加载和错误状态 */
.loading-state, .error-state {
  text-align: center;
  padding: 60px 20px;
}

.loading-state p {
  font-size: 1.1rem;
  color: #666;
}

.error-state p {
  color: #e74c3c;
  margin-bottom: 16px;
  font-size: 1.1rem;
}

.error-state button {
  background: #c75d35;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}

.error-state button:hover {
  background: #a64d2a;
}

/* 商品详情内容 */
.product-detail-container {
  display: grid;
  grid-template-columns: minmax(400px, 1fr) minmax(400px, 1fr);
  gap: 60px;
  align-items: start;
}

/* 左侧图片区域 */
.product-images {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.main-image {
  position: relative;
  aspect-ratio: 1;
  background: #f7f7f7;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.out-of-stock-overlay {
  position: absolute;
  top: 20px;
  left: 20px;
  background: #444;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 4px;
  z-index: 2;
}

/* 缩略图 */
.thumbnail-images {
  display: flex;
  gap: 12px;
}

.thumbnail-item {
  width: 80px;
  height: 80px;
  background: #f7f7f7;
  border-radius: 4px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: border-color 0.2s;
}

.thumbnail-item.active {
  border-color: #c75d35;
}

.thumbnail-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 右侧商品信息 */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.product-meta {
  font-size: 0.85rem;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.artist-name {
  color: #c75d35;
  font-weight: 500;
}

.product-title {
  font-size: 2rem;
  font-weight: 600;
  color: #222;
  margin: 0;
  line-height: 1.2;
}

.product-price {
  font-size: 1.5rem;
  font-weight: 700;
  color: #c75d35;
}

/* 数量选择 */
.quantity-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quantity-label {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.quantity-controls {
  display: flex;
  align-items: stretch;
  gap: 0;
  width: fit-content;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-btn {
  width: 40px;
  height: 40px;
  border: none;
  background: #fff;
  cursor: pointer;
  font-size: 1.2rem;
  font-weight: 500;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: 1px solid #ddd;
}

.quantity-btn:last-child {
  border-right: none;
  border-left: 1px solid #ddd;
}

.quantity-btn:hover:not(:disabled) {
  background: #f8f8f8;
}

.quantity-btn:disabled {
  color: #ccc;
  cursor: not-allowed;
  background: #f9f9f9;
}

.quantity-input {
  width: 60px;
  height: 40px;
  text-align: center;
  border: none;
  outline: none;
  font-size: 1rem;
  font-weight: 500;
  background: #fff;
  cursor: default;
}

.quantity-input:focus {
  background: #fafafa;
}

/* 隐藏数字输入框的上下按钮 */
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  appearance: none;
  margin: 0;
}

.quantity-input[type=number] {
  -moz-appearance: textfield;
  appearance: textfield;
}

.quantity-controls:focus-within {
  border-color: #c75d35;
  box-shadow: 0 0 0 2px rgba(199, 93, 53, 0.1);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  gap: 16px;
  margin-top: 8px;
}

.add-to-cart-btn, .buy-now-btn {
  padding: 14px 32px;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s;
  flex: 1;
}

.add-to-cart-btn {
  background: #c75d35;
  color: white;
}

.add-to-cart-btn:hover:not(:disabled) {
  background: #a64d2a;
}

.buy-now-btn {
  background: white;
  color: #333;
  border: 1px solid #ddd;
}

.buy-now-btn:hover:not(:disabled) {
  border-color: #c75d35;
  color: #c75d35;
}

.add-to-cart-btn:disabled,
.buy-now-btn:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
  border-color: #eee;
}

/* 商品信息区块 */
.product-description,
.product-details {
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.product-description h3,
.product-details h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  margin: 0 0 12px 0;
}

.product-description p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.product-details ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.product-details li {
  color: #666;
  line-height: 1.6;
  margin-bottom: 4px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .product-detail-container {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  
  .product-title {
    font-size: 1.6rem;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .thumbnail-images {
    justify-content: center;
  }
}
</style>
