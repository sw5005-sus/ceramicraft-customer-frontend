<template>
  <div class="product-detail-page">
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
            <div 
              v-for="(image, index) in getAllImages(product.pic_info)" 
              :key="index"
              class="thumbnail-item"
              :class="{ active: index === activeImageIndex }"
              @click="setActiveImage(index)"
            >
              <img :src="getImageUrl(image)" :alt="`${product.name} ${index + 1}`" />
            </div>
          </div>
        </div>

        <!-- 右侧：商品信息 -->
        <div class="product-info">
          <div class="product-meta">
            <span class="artist-name">{{ product.category.toUpperCase() }}</span>
          </div>
          
          <h1 class="product-title">{{ product.name }}</h1>
          
          <div class="product-price">
            <span class="price">${{ formatPrice(product.price) }}</span>
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
              :disabled="isOutOfStock(product) || addingToCart"
              @click="addToCart"
            >
              {{ addingToCart ? 'ADDING...' : (isLoggedIn() ? 'ADD TO CART' : 'LOGIN TO ADD TO CART') }}
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

      <!-- Similar Products -->
      <div v-if="similarProducts.length > 0" class="similar-products-section">
        <h2 class="similar-title">You May Also Like</h2>
        <div class="similar-products-grid">
          <div
            v-for="item in similarProducts"
            :key="item.id"
            class="similar-product-card"
            @click="$router.push({ name: 'ProductDetail', params: { id: item.id.toString() } })"
          >
            <div class="similar-img-box">
              <img :src="getSimilarImage(item)" :alt="item.name" />
            </div>
            <div class="similar-info">
              <div class="similar-name">{{ item.name }}</div>
              <div class="similar-price">${{ formatPrice(item.price) }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 商品评论区域（仅登录用户可见） -->
      <div v-if="authState.isAuthenticated" class="product-comments-section">
        <!-- 评论标题和统计信息 -->
        <div class="comments-header">
          <h2>Customer Reviews</h2>
          <div v-if="!commentsLoading && !commentsError" class="comments-summary-inline">
            <span class="comments-count">{{ comments?.length || 0 }} review{{ (comments?.length || 0) !== 1 ? 's' : '' }}</span>
            <div v-if="averageRating > 0" class="average-rating-inline">
              <div class="stars">
                <span v-for="star in 5" :key="star" class="star" :class="{ filled: star <= Math.round(averageRating) }">★</span>
              </div>
              <span class="rating-text">{{ averageRating.toFixed(1) }} out of 5</span>
            </div>
          </div>
        </div>
        
        <!-- 加载评论状态 -->
        <div v-if="commentsLoading" class="comments-loading">
          <p>Loading reviews...</p>
        </div>

        <!-- 评论错误状态 -->
        <div v-if="commentsError" class="comments-error">
          <p>{{ commentsError }}</p>
          <button @click="fetchProductComments">Retry</button>
        </div>

        <!-- 评论列表 -->
        <div v-if="!commentsLoading && !commentsError" class="comments-content">

          <!-- 置顶评论 -->
          <div v-if="pinnedReview" class="pinned-review">
            <div class="pinned-label">Pinned Review</div>
            <div class="comment-item minimal pinned">
              <div class="comment-header minimal">
                <div class="author-rating-row">
                  <span class="comment-author">{{ getCommentAuthor(pinnedReview) }}</span>
                  <el-rate
                    v-model="pinnedReview.stars"
                    :max="5"
                    disabled
                    size="small"
                    :colors="['#c75d35','#c75d35','#c75d35']"
                    class="comment-stars"
                  />
                </div>
                <span class="comment-date">{{ formatDate(pinnedReview.created_at) }}</span>
              </div>
              <div class="comment-content minimal">
                <span>{{ pinnedReview.content }}</span>
                <div v-if="pinnedReview.pic_info && pinnedReview.pic_info.length > 0 && pinnedReview.pic_info[0]" class="comment-images minimal">
                  <img 
                    v-for="(pic, index) in pinnedReview.pic_info.filter(p => p && p.trim())" 
                    :key="index"
                    :src="`${S3_CONFIG.BASE_URL}${pic}`" 
                    :alt="`评论图片${index + 1}`"
                    class="comment-image"
                  />
                </div>
              </div>
              <div class="comment-likes minimal" @click="handleLike(pinnedReview)">
                <svg
                  class="comment-likes-icon"
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  :fill="pinnedReview.current_user_liked ? '#c75d35' : 'none'"
                  :stroke="pinnedReview.current_user_liked ? 'none' : '#c75d35'"
                  :stroke-width="pinnedReview.current_user_liked ? 0 : 2"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                <span class="comment-likes-count">{{ pinnedReview.likes }}</span>
              </div>
            </div>
          </div>

          <!-- 评论列表 -->
            <div v-if="comments && comments.length > 0" class="comments-list">
              <div v-for="comment in comments.filter(c => !c.parent_id || c.parent_id === '')" :key="comment.id" class="comment-thread">
                <!-- 顶级评论 -->
                <div class="comment-item minimal">
                  <div class="comment-header minimal">
                    <div class="author-rating-row">
                      <span class="comment-author">{{ getCommentAuthor(comment) }}</span>
                      <el-rate
                        v-model="comment.stars"
                        :max="5"
                        disabled
                        size="small"
                        :colors="['#c75d35','#c75d35','#c75d35']"
                        class="comment-stars"
                      />
                    </div>
                    <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
                  </div>
                  <div class="comment-content minimal">
                    <span>{{ comment.content }}</span>
                    <div v-if="comment.pic_info && comment.pic_info.length > 0 && comment.pic_info[0]" class="comment-images minimal">
                      <img 
                        v-for="(pic, index) in comment.pic_info.filter(p => p && p.trim())" 
                        :key="index"
                        :src="`${S3_CONFIG.BASE_URL}${pic}`" 
                        :alt="`评论图片${index + 1}`"
                        class="comment-image"
                      />
                    </div>
                  </div>
                  <div class="comment-likes minimal" @click="handleLike(comment)">
                    <svg
                      class="comment-likes-icon"
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      :fill="comment.current_user_liked ? '#c75d35' : 'none'"
                      :stroke="comment.current_user_liked ? 'none' : '#c75d35'"
                      :stroke-width="comment.current_user_liked ? 0 : 2"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                    </svg>
                    <span class="comment-likes-count">{{ comment.likes }}</span>
                  </div>
                </div>
                <!-- 回复评论 -->
                <div v-for="reply in comments.filter(c => c.parent_id === comment.id)" :key="reply.id" class="comment-reply">
                  <div class="comment-item minimal reply">
                    <div class="comment-header minimal">
                      <div class="author-rating-row">
                        <span class="comment-author">{{ getCommentAuthor(reply) }}</span>
                        <el-rate
                          v-model="reply.stars"
                          :max="5"
                          disabled
                          size="small"
                          :colors="['#c75d35','#c75d35','#c75d35']"
                          class="comment-stars"
                        />
                      </div>
                      <span class="comment-date">{{ formatDate(reply.created_at) }}</span>
                    </div>
                    <div class="comment-content minimal">
                      <span>{{ reply.content }}</span>
                      <div v-if="reply.pic_info && reply.pic_info.length > 0 && reply.pic_info[0]" class="comment-images minimal">
                        <img 
                          v-for="(pic, index) in reply.pic_info.filter(p => p && p.trim())" 
                          :key="index"
                          :src="`${S3_CONFIG.BASE_URL}${pic}`" 
                          :alt="`评论图片${index + 1}`"
                          class="comment-image"
                        />
                      </div>
                    </div>
                    <div class="comment-likes minimal" @click="handleLike(reply)">
                      <svg
                        class="comment-likes-icon"
                        viewBox="0 0 24 24"
                        width="18"
                        height="18"
                        :fill="reply.current_user_liked ? '#c75d35' : 'none'"
                        :stroke="reply.current_user_liked ? 'none' : '#c75d35'"
                        :stroke-width="reply.current_user_liked ? 0 : 2"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      <span class="comment-likes-count">{{ reply.likes }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          <!-- 无评论状态 -->
          <div v-else class="no-comments">
            <p>No reviews yet. Be the first to review this product!</p>
          </div>
        </div>
      </div>

      <!-- 未登录用户提示：引导登录查看评论 -->
      <div v-else class="product-comments-section">
        <div class="comments-header">
          <h2>Customer Reviews</h2>
        </div>
        <div class="reviews-signin-hint">
          <p>Sign in to view customer reviews.</p>
          <button type="button" class="reviews-signin-button" @click="handleSignInForReviews">
            Sign in
          </button>
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

import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getProductDetail } from '../api/product'
import { addToCart as addToCartAPI } from '../api/cart'
import { getProductComments, likeComment } from '../api/comment'
import type { Product } from '../api/product'
import type { Comment } from '../api/comment'
import { S3_CONFIG } from '../config/api-endpoints'
import { useCheckout } from '../composables/useCheckout'
import { authState } from '../auth/authState'
import { signIn } from '../auth/zitadel'
import { findSimilarProducts, type ProductSearchItem } from '../api/search-agent'

// 默认图片
import defaultImg from '../assets/defaultimg.png'

// 路由相关
const route = useRoute()
const router = useRouter()

// 使用结账 composable
const { setCheckoutData } = useCheckout()

// 响应式数据
const product = ref<Product | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)
const quantity = ref(1)
const addingToCart = ref(false)

// 评论相关响应式数据
const comments = ref<Comment[]>([])
const commentsLoading = ref(false)
const commentsError = ref<string | null>(null)
const pinnedReview = ref<Comment | null>(null)

// 图片相关响应式数据
const activeImageIndex = ref(0)

// AI 相似商品
const similarProducts = ref<ProductSearchItem[]>([])

const loadSimilarProducts = async (productName: string) => {
  try {
    const result = await findSimilarProducts(productName, 4)
    if (result.code === 200) {
      similarProducts.value = result.products
    }
  } catch {
    // Non-critical, silently ignore
  }
}

const getSimilarImage = (item: ProductSearchItem) => {
  if (item.pic_info) {
    try {
      const images = JSON.parse(item.pic_info)
      if (Array.isArray(images) && images.length > 0) {
        const img = images[0]
        return img.startsWith('http') ? img : `${S3_CONFIG.BASE_URL}${img}`
      }
    } catch { /* ignore */ }
  }
  return defaultImg
}

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
    console.log('Product ID field:', result.id)
    console.log('All product fields:', Object.keys(result))
    loadSimilarProducts(result.name)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch product details'
    console.error('Failed to fetch product details:', err)
  } finally {
    loading.value = false
  }
}

// 在组件挂载后获取评论，不与商品详情绑定
// 匿名用户跳过 — reviews 接口需要 Bearer token，否则会 401
const initializeComments = async () => {
  if (!authState.isAuthenticated) return
  const productId = route.params.id as string
  if (productId) {
    await fetchProductComments()
  }
}

// 未登录用户点击「Sign in」进入 Zitadel 登录，登录后回到当前商品详情页
const handleSignInForReviews = async () => {
  await signIn(route.fullPath)
}

// 获取商品评论
const fetchProductComments = async () => {
  const productId = route.params.id as string
  if (!productId) {
    return
  }

  commentsLoading.value = true
  commentsError.value = null

  try {
    const result = await getProductComments(parseInt(productId))
    comments.value = result.comments
    pinnedReview.value = result.pinnedReview
    console.log('Product comments fetched successfully:', result)
  } catch (err) {
    commentsError.value = err instanceof Error ? err.message : 'Failed to fetch product comments'
    console.error('Failed to fetch product comments:', err)
  } finally {
    commentsLoading.value = false
  }
}

// 计算平均评分
const averageRating = computed(() => {
  if (!comments.value || comments.value.length === 0) return 0
  const totalRating = comments.value.reduce((sum, comment) => sum + comment.stars, 0)
  return totalRating / comments.value.length
})

// 检查商品是否缺货
const isOutOfStock = (product: Product) => {
  return product.stock <= 0 || product.status !== 1
}

// 获取商品图片
const getProductImage = (product: Product) => {
  if (product.pic_info && product.pic_info.trim()) {
    // 解析 pic_info 获取所有图片
    const images = getAllImages(product.pic_info)
    if (images.length > 0) {
      const activeImage = images[activeImageIndex.value] || images[0]
      // 如果已经是完整的URL，直接返回
      if (activeImage.startsWith('http://') || activeImage.startsWith('https://')) {
        return activeImage
      }
      // 否则拼接S3基础URL
      return `${S3_CONFIG.BASE_URL}${activeImage}`
    }
  }
  return defaultImg
}

// 获取单个图片的URL
const getImageUrl = (image: string) => {
  if (image.startsWith('http://') || image.startsWith('https://')) {
    return image
  }
  return `${S3_CONFIG.BASE_URL}${image}`
}

// 设置激活的图片
const setActiveImage = (index: number) => {
  activeImageIndex.value = index
}

// 解析 pic_info 字符串为数组
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

// 获取所有图片数组
const getAllImages = (picInfo: string): string[] => {
  return parsePicInfo(picInfo);
}

// 格式化价格，将分转换为元并保留两位小数
const formatPrice = (price: number) => {
  return (price / 100).toFixed(2)
}

// 检查登录状态 — 使用 OIDC 认证状态
const isLoggedIn = () => {
  return authState.isAuthenticated
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
const addToCart = async () => {
  if (!product.value) return
  
  // 检查登录状态
  if (!isLoggedIn()) {
    // 未登录，跳转到 Zitadel 登录
    signIn(route.fullPath)
    return
  }
  
  // 防止重复点击
  if (addingToCart.value) return
  
  addingToCart.value = true
  
  try {
    // 使用路由参数中的产品ID，而不是product对象中的ID
    const productId = route.params.id as string
    if (!productId) {
      throw new Error('Product ID is required')
    }
    
    await addToCartAPI(parseInt(productId), quantity.value)
    ElMessage.success(`Added ${quantity.value} item(s) to cart!`)
    console.log(`Successfully added ${quantity.value} of product ${productId} to cart`)
  } catch (error) {
    console.error('Failed to add to cart:', error)
    ElMessage.error('Failed to add item to cart')
  } finally {
    addingToCart.value = false
  }
}

// 立即购买
const buyNow = () => {
  if (!product.value) return

  // 检查登录状态
  if (!isLoggedIn()) {
    // 未登录，跳转到 Zitadel 登录
    signIn(route.fullPath)
    return
  }

  // Use the route param for product ID — the detail response does not include `id`.
  const productId = parseInt(route.params.id as string, 10)
  if (!Number.isFinite(productId) || productId <= 0) {
    ElMessage.error('Invalid product. Please refresh and try again.')
    return
  }

  // 创建结账商品项（临时条目，不对应真实 cart item）
  const checkoutItem = {
    id: Date.now(), // Local-only temp id; see fromCart flag below
    quantity: quantity.value,
    product_info: {
      id: productId,
      name: product.value.name,
      pic_info: product.value.pic_info,
      price: product.value.price
    },
    total_price: product.value.price * quantity.value,
    selected: true,
    fromCart: false
  }

  // 设置结账数据
  setCheckoutData([checkoutItem], null)

  // 跳转到结账页面
  router.push({ name: 'CustomerCheckout' })
}

// 格式化日期
const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// 处理点赞
const handleLike = async (comment: Comment) => {
  if (!isLoggedIn()) {
    ElMessage.info('请先登录后点赞');
    return;
  }
  if (comment.current_user_liked) return; // 已点赞不可重复
  const success = await likeComment(comment.id);
  if (success) {
    comment.likes += 1;
    comment.current_user_liked = true;
  } else {
    ElMessage.error('点赞失败，请稍后重试');
  }
}

// 获取评论作者名字
const getCommentAuthor = (comment: Comment) => {
  if (comment.user_id === 1 && comment.parent_id && comment.parent_id !== '') {
    return 'CeramiCraft Store';
  }
  return comment.is_anonymous ? 'Anonymous' : `User ${comment.user_id}`;
}

// 组件挂载时获取商品详情和评论
onMounted(async () => {
  await fetchProductDetail()
  await initializeComments()
})
</script>

<style scoped>
.product-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
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

/* Similar Products */
.similar-products-section {
  margin-top: 48px;
  padding-top: 32px;
  border-top: 1px solid #eee;
}
.similar-title {
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #222;
}
.similar-products-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}
.similar-product-card {
  cursor: pointer;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.2s, box-shadow 0.2s;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.similar-product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.similar-img-box {
  width: 100%;
  aspect-ratio: 1/1;
  background: #f7f7f7;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.similar-img-box img {
  width: 90%;
  height: 90%;
  object-fit: cover;
}
.similar-info {
  padding: 12px;
}
.similar-name {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.similar-price {
  font-size: 1rem;
  font-weight: 700;
  color: #c75d35;
}

/* 评论区域样式 */
.product-comments-section {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 2px solid #eee;
}

/* 评论标题和统计信息在同一行 */
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
}

.comments-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}

/* 内联评论统计样式 */
.comments-summary-inline {
  display: flex;
  align-items: center;
  gap: 20px;
}

.comments-summary-inline .comments-count {
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  margin: 0;
}

.average-rating-inline {
  display: flex;
  align-items: center;
  gap: 8px;
}

.average-rating-inline .stars {
  display: flex;
  gap: 2px;
}

.average-rating-inline .star {
  font-size: 1rem;
  color: #ddd;
  transition: color 0.2s;
}

.average-rating-inline .star.filled {
  color: #ffc107;
}

.average-rating-inline .rating-text {
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

/* 评论加载和错误状态 */
.comments-loading, .comments-error {
  text-align: center;
  padding: 40px 20px;
}

.comments-loading p {
  font-size: 1rem;
  color: #666;
}

.comments-error p {
  color: #e74c3c;
  margin-bottom: 16px;
  font-size: 1rem;
}

.comments-error button {
  background: #c75d35;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.comments-error button:hover {
  background: #a64d2a;
}

/* 未登录提示块（引导 Sign in 查看评论） */
.reviews-signin-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 32px 20px;
  color: #666;
  text-align: center;
  flex-wrap: wrap;
}

.reviews-signin-hint p {
  margin: 0;
  font-size: 1rem;
}

.reviews-signin-button {
  background: #c75d35;
  color: #fff;
  border: none;
  padding: 8px 20px;
  border-radius: 4px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.reviews-signin-button:hover {
  background: #a64d2a;
}



/* 评论列表 */
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.comment-item {
  padding: 24px;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: box-shadow 0.2s;

}
.comment-item.minimal {
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  background: #fff;
  box-shadow: none;
}
.comment-header.minimal {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
}
.author-rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.comment-author {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}
.comment-stars {
  margin-left: 0;
  font-size: 1rem;
}
.comment-date {
  font-size: 0.85rem;
  color: #888;
}
.comment-content.minimal {
  color: #555;
  line-height: 1.6;
  font-size: 0.98rem;
  margin-bottom: 4px;
}
.comment-images.minimal {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.comment-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e1e8ed;
}
.comment-likes.minimal {
  margin-top: 8px;
  font-size: 0.95rem;
  color: #c75d35;
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  user-select: none;
  transition: opacity 0.2s;
}
.comment-likes.minimal:active {
  opacity: 0.7;
}
.comment-actions.minimal {
  margin-top: 8px;
}
.like-btn {
  background: #fff;
  color: #c75d35;
  border: 1px solid #c75d35;
  border-radius: 16px;
  padding: 4px 16px;
  font-size: 0.95rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.like-btn:hover {
  background: #c75d35;
  color: #fff;
}
.like-btn.liked {
  background: #c75d35;
  color: #fff;
  border-color: #c75d35;
}

.comment-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
  flex-wrap: wrap;
  gap: 12px;
}

.comment-author {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}

.comment-rating .stars {
  gap: 1px;
}

.comment-rating .star {
  font-size: 1rem;
}

.comment-date {
  font-size: 0.85rem;
  color: #888;
}

.comment-content {
  color: #555;
  line-height: 1.6;
}

.comment-content p {
  margin: 0 0 12px 0;
}

.comment-images {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}

.comment-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e1e8ed;
}



/* 置顶评论 */
.pinned-review {
  margin-bottom: 30px;
  padding: 20px;
  background: #fff8f0;
  border: 2px solid #c75d35;
  border-radius: 12px;
}

.pinned-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: #c75d35;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.comment-item.pinned {
  border: none;
  background: transparent;
  padding: 0;
  margin: 0;
}

.comment-item.pinned:hover {
  box-shadow: none;
}

/* 评论线程 */
.comment-thread {
  margin-bottom: 32px;
}

/* 回复评论 */
.comment-reply {
  margin-left: 40px;
  margin-top: 16px;
  position: relative;
}

.comment-reply::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 20px;
  width: 20px;
  height: 1px;
  background: #ddd;
}

.comment-item.reply {
  border-left: 2px solid #ddd;
  padding-left: 16px;
  background: #fafafa;
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

  .comments-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }

  .comments-summary-inline {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .comment-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
