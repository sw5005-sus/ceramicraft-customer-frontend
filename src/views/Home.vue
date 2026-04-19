<template>
  <div class="products-page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <!-- 搜索输入框 -->
      <div class="search-input-container">
        <input
          v-model="searchKeyword"
          @keyup.enter="handleSearch"
          @focus="onSearchFocus"
          @blur="onSearchBlur"
          class="search-input"
          placeholder="Search ceramics with AI..."
        />

        <!-- AI Search Panel (history + hot) -->
        <div v-show="showSearchPanel && (searchHistory.length > 0 || hotSearches.length > 0)" class="search-panel">
          <div v-if="searchHistory.length > 0" class="search-panel-section">
            <div class="search-panel-title">Recent Searches</div>
            <div class="search-tags">
              <span v-for="tag in searchHistory" :key="tag" class="search-tag" @mousedown.prevent="applySearchTag(tag)">{{ tag }}</span>
            </div>
          </div>
          <div v-if="hotSearches.length > 0" class="search-panel-section">
            <div class="search-panel-title">Trending</div>
            <div class="search-tags">
              <span v-for="tag in hotSearches" :key="tag" class="search-tag hot" @mousedown.prevent="applySearchTag(tag)">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 右侧控制区域 -->
      <div class="controls-section">
        <!-- Filter 按钮 -->
        <button class="filter-btn" @click="toggleCategoryDropdown">
          <span class="filter-icon">☰</span>
          <span>Filter</span>
          
          <!-- Filter 下拉菜单 -->
          <div v-show="showCategoryDropdown" class="filter-dropdown" @click.stop>
            <div class="filter-section">
              <div 
                v-for="category in categories" 
                :key="category.value"
                class="filter-item"
                :class="{ active: selectedCategory === category.value }"
                @click="selectCategory(category.value)"
              >
                {{ category.label }}
              </div>
            </div>
          </div>
        </button>
        
        <!-- Sort by 下拉选择 -->
        <div class="sort-container">
          <label>Sort by:</label>
          <div class="sort-dropdown-wrapper">
            <button class="sort-btn" @click="toggleSortDropdown">
              {{ selectedSortText }}
              <span class="dropdown-arrow" :class="{ rotated: showSortDropdown }">▼</span>
            </button>
            
            <!-- Sort 下拉菜单 -->
            <div v-show="showSortDropdown" class="sort-dropdown" @click.stop>
              <div 
                v-for="option in sortOptions" 
                :key="option.value"
                class="sort-item"
                :class="{ active: sortOrder === option.value }"
                @click="selectSort(option.value)"
              >
                {{ option.label }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Suggested for You carousel -->
    <div v-if="currentSuggestion" class="suggestion-bar" @click="applySuggestion">
      <span class="suggestion-label">Suggested for You:</span>
      <span class="suggestion-content" :class="{ fading: suggestionFading }">
        <span class="suggestion-keyword">{{ currentSuggestion.keyword }}</span>
      </span>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <p>Loading products...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchProducts">Retry</button>
    </div>
    
    <!-- AI Recommendation (typewriter effect) -->
    <div v-if="aiRecommendation || aiRecommendationLoading" class="ai-recommendation">
      <div class="ai-recommendation-header">
        <span class="ai-icon">&#x2728;</span>
        <span>AI Recommendation</span>
        <span v-if="aiRecommendationLoading" class="ai-typing">thinking...</span>
      </div>
      <div class="ai-recommendation-text">{{ aiRecommendation }}</div>
    </div>

    <!-- 商品列表 -->
    <div v-if="!loading && !aiLoading && !error" class="products-list">
      <div
        v-for="(item, index) in (aiProducts.length > 0 ? aiProducts : products)"
        :key="item.id || index"
        class="product-card"
        style="cursor:pointer;"
        @click="item.id && goToProductDetail(item.id)"
      >
        <div class="product-img-box">
          <img :src="getProductImage(item)" :alt="item.name" />
          <span v-if="isOutOfStock(item)" class="out-of-stock">OUT OF STOCK</span>
        </div>
        <div class="product-info">
          <div class="product-artist">{{ item.category }}</div>
          <div class="product-title">{{ item.name }}</div>
          <div class="product-price">${{ formatPrice(item.price) }}</div>
          <div class="product-stock">Stock: {{ item.stock }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 产品列表页面
 * @description 显示所有陶瓷产品的列表页面
 */

import { ref, onMounted, onUnmounted, nextTick, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { getProductList } from '../api/product'
import type { Product, ProductListParams } from '../api/product'
import { S3_CONFIG } from '../config/api-endpoints'
import { useAiSearch } from '../composables/useAiSearch'

// 默认图片
import defaultImg from '../assets/defaultimg.png'

// 路由
const router = useRouter()

// 响应式数据
const products = ref<Product[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const total = ref(0)
const searchKeyword = ref('')
const sortOrder = ref('0') // 默认选择0-按更新时间降序
const selectedCategory = ref('')
const showCategoryDropdown = ref(false)
const showSortDropdown = ref(false)
const showSearchPanel = ref(false)

// AI Search
const {
  aiProducts,
  aiRecommendation,
  aiRecommendationLoading,
  searchHistory,
  hotSearches,
  suggestions,
  loading: aiLoading,
  doSearch: doAiSearch,
  loadSearchContext,
  loadSuggestions,
  cancelStreams,
} = useAiSearch()

// Suggestions carousel
const currentSuggestionIndex = ref(0)
const suggestionFading = ref(false)
let suggestionTimer: ReturnType<typeof setInterval> | null = null

const currentSuggestion = computed(() =>
  suggestions.value.length > 0 ? suggestions.value[currentSuggestionIndex.value] : null
)

function startSuggestionCarousel() {
  stopSuggestionCarousel()
  if (suggestions.value.length <= 1) return
  suggestionTimer = setInterval(() => {
    suggestionFading.value = true
    setTimeout(() => {
      currentSuggestionIndex.value = (currentSuggestionIndex.value + 1) % suggestions.value.length
      suggestionFading.value = false
    }, 400)
  }, 3500)
}

function stopSuggestionCarousel() {
  if (suggestionTimer) {
    clearInterval(suggestionTimer)
    suggestionTimer = null
  }
}

watch(suggestions, (val) => {
  if (val.length > 0) {
    currentSuggestionIndex.value = 0
    startSuggestionCarousel()
  }
})

const applySuggestion = () => {
  if (currentSuggestion.value) {
    searchKeyword.value = currentSuggestion.value.keyword
    handleSearch()
  }
}

// 分类选项
const categories = ref([
  { value: '', label: 'All Products' },
  { value: '餐具', label: 'Tableware' },
  { value: '家居装饰', label: 'Home Decoration' },
  { value: '容器', label: 'Containers' }
])

// 排序选项
const sortOptions = ref([
  { value: '0', label: 'Newest First' },
  { value: '1', label: 'Oldest First' }
])

// 获取当前选中的排序文本
const selectedSortText = computed(() => {
  const option = sortOptions.value.find(opt => opt.value === sortOrder.value)
  return option ? option.label : 'Newest First'
})

// 获取商品列表
const fetchProducts = async () => {
  loading.value = true
  error.value = null
  
  try {
    const params: ProductListParams = {}
    
    // 添加搜索关键词
    if (searchKeyword.value.trim()) {
      params.keyword = searchKeyword.value.trim()
    }
    
    // 添加分类筛选
    if (selectedCategory.value) {
      params.category = selectedCategory.value
    }
    
    // 添加排序参数
    params.order_by = parseInt(sortOrder.value)
    
    console.log('Request parameters:', params)
    const result = await getProductList(params)
    products.value = result.list
    total.value = result.total
    console.log('Products fetched successfully:', result)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Failed to fetch products'
    console.error('Failed to fetch products:', err)
  } finally {
    loading.value = false
  }
}

// 搜索处理
const handleSearch = () => {
  if (searchKeyword.value.trim()) {
    doAiSearch(searchKeyword.value.trim(), (fallbackList) => {
      products.value = fallbackList
    })
  } else {
    aiProducts.value = []
    aiRecommendation.value = ''
    fetchProducts()
  }
  showSearchPanel.value = false
}

const onSearchFocus = () => {
  showSearchPanel.value = true
}

const onSearchBlur = () => {
  setTimeout(() => { showSearchPanel.value = false }, 200)
}

const applySearchTag = (keyword: string) => {
  searchKeyword.value = keyword
  handleSearch()
}

// 排序下拉菜单切换
const toggleSortDropdown = () => {
  showSortDropdown.value = !showSortDropdown.value
  
  if (showSortDropdown.value) {
    nextTick(() => {
      positionSortDropdown()
    })
  }
}

// 选择排序选项
const selectSort = (value: string) => {
  sortOrder.value = value
  showSortDropdown.value = false
  fetchProducts()
}

// 动态设置Sort下拉菜单位置
const positionSortDropdown = () => {
  const sortBtn = document.querySelector('.sort-btn') as HTMLElement
  const dropdown = document.querySelector('.sort-dropdown') as HTMLElement
  
  if (sortBtn && dropdown) {
    const rect = sortBtn.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 100 // 估计的下拉菜单高度
    
    // 检查是否有足够空间在下方显示
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    
    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      // 在下方显示
      dropdown.style.top = `${rect.bottom + 4}px`
      dropdown.style.bottom = 'auto'
      dropdown.style.maxHeight = `${Math.min(dropdownHeight, spaceBelow - 10)}px`
    } else {
      // 在上方显示
      dropdown.style.top = 'auto'
      dropdown.style.bottom = `${viewportHeight - rect.top + 4}px`
      dropdown.style.maxHeight = `${Math.min(dropdownHeight, spaceAbove - 10)}px`
    }
    
    dropdown.style.left = `${rect.left}px`
    dropdown.style.width = `${rect.width}px`
  }
}

// 检查商品是否缺货
const isOutOfStock = (product: Product) => {
  return product.stock <= 0 || product.status !== 1
}

// 获取商品图片，如果没有则使用默认图片
const getProductImage = (product: Product) => {
  if (product.pic_info && product.pic_info.trim()) {
    // 解析 pic_info 获取第一个图片
    const firstImage = getFirstImage(product.pic_info)
    if (firstImage) {
      // 如果已经是完整的URL，直接返回
      if (firstImage.startsWith('http://') || firstImage.startsWith('https://')) {
        return firstImage
      }
      // 否则拼接S3基础URL
      return `${S3_CONFIG.BASE_URL}${firstImage}`
    }
  }
  return defaultImg
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

// 获取第一个图片
const getFirstImage = (picInfo: string): string => {
  const images = parsePicInfo(picInfo);
  console.log('getFirstImage: parsed images:', images);
  const first = images.length > 0 ? images[0] : '';
  console.log('getFirstImage: first image:', first);
  return first;
}

// 格式化价格，将分转换为元并保留两位小数
const formatPrice = (price: number) => {
  return (price / 100).toFixed(2)
}

// 跳转到商品详情页
const goToProductDetail = (productId: number | undefined) => {
  if (productId) {
    router.push({ name: 'ProductDetail', params: { id: productId.toString() } })
  }
}

// 切换分类下拉菜单显示
const toggleCategoryDropdown = () => {
  showCategoryDropdown.value = !showCategoryDropdown.value
  
  if (showCategoryDropdown.value) {
    // 等待DOM更新后设置下拉菜单位置
    nextTick(() => {
      positionFilterDropdown()
    })
  }
}

// 动态设置Filter下拉菜单位置
const positionFilterDropdown = () => {
  const filterBtn = document.querySelector('.filter-btn') as HTMLElement
  const dropdown = document.querySelector('.filter-dropdown') as HTMLElement
  
  if (filterBtn && dropdown) {
    const rect = filterBtn.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const dropdownHeight = 250 // 估计的下拉菜单高度
    
    // 检查是否有足够空间在下方显示
    const spaceBelow = viewportHeight - rect.bottom
    const spaceAbove = rect.top
    
    if (spaceBelow >= dropdownHeight || spaceBelow >= spaceAbove) {
      // 在下方显示
      dropdown.style.top = `${rect.bottom + 4}px`
      dropdown.style.bottom = 'auto'
      dropdown.style.maxHeight = `${Math.min(dropdownHeight, spaceBelow - 10)}px`
    } else {
      // 在上方显示
      dropdown.style.top = 'auto'
      dropdown.style.bottom = `${viewportHeight - rect.top + 4}px`
      dropdown.style.maxHeight = `${Math.min(dropdownHeight, spaceAbove - 10)}px`
    }
    
    dropdown.style.left = `${rect.left}px`
    dropdown.style.width = `${Math.max(rect.width, 200)}px`
  }
}

// 选择分类
const selectCategory = (categoryValue: string) => {
  selectedCategory.value = categoryValue
  showCategoryDropdown.value = false
  fetchProducts()
}



// 点击外部区域关闭下拉菜单
const handleClickOutside = (event: Event) => {
  const target = event.target as HTMLElement
  const filterBtn = document.querySelector('.filter-btn')
  const sortBtn = document.querySelector('.sort-btn')
  
  // 确保点击的不是Filter按钮或下拉菜单内部元素
  if (filterBtn && !filterBtn.contains(target) && showCategoryDropdown.value) {
    showCategoryDropdown.value = false
  }
  
  // 确保点击的不是Sort按钮或下拉菜单内部元素
  if (sortBtn && !sortBtn.contains(target) && showSortDropdown.value) {
    showSortDropdown.value = false
  }
}

// 窗口大小改变时重新定位下拉菜单
const handleResize = () => {
  if (showCategoryDropdown.value) {
    positionFilterDropdown()
  }
  if (showSortDropdown.value) {
    positionSortDropdown()
  }
}

// 组件挂载时获取商品列表和添加事件监听
onMounted(() => {
  fetchProducts()
  loadSearchContext()
  loadSuggestions()
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
  cancelStreams()
  stopSuggestionCarousel()
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('scroll', handleResize)
})
</script>

<style scoped>
.products-page {
  max-width: 1200px;
  margin: 0 auto;
}
h1 {
  color: #222;
  font-size: 2.2rem;
  margin-bottom: 16px; /* 减少底部间距 */
  font-weight: 700;
  text-align: left;
}
/* 搜索区域 */
.search-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
  position: relative;
  z-index: 50;
  gap: 20px;
}

/* 搜索输入框容器 */
.search-input-container {
  flex: 1;
  max-width: 500px;
  position: relative;
}

/* 搜索输入框 */
.search-input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  outline: none;
  transition: border-color 0.2s;
  background: #fff;
}

.search-input:focus {
  border-color: #c75d35;
  box-shadow: 0 0 0 2px rgba(199, 93, 53, 0.1);
}

.search-input::placeholder {
  color: #999;
}

/* 右侧控制区域 */
.controls-section {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

/* Filter 按钮 */
.filter-btn {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  transition: all 0.2s;
  user-select: none;
}

.filter-btn:hover {
  border-color: #c75d35;
  color: #c75d35;
}

.filter-icon {
  font-size: 1rem;
  font-weight: bold;
}

/* Filter 下拉菜单 */
.filter-dropdown {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  min-width: 200px;
  margin-top: 8px;
}

.filter-section {
  padding: 8px 0;
}

.filter-section h4 {
  margin: 0 0 8px 0;
  padding: 8px 12px;
  font-size: 0.85rem;
  font-weight: 500;
  color: #666;
  text-align: left;
  letter-spacing: 0.3px;
  border-bottom: 1px solid #f0f0f0;
}

.filter-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  transition: background-color 0.2s;
  text-align: left;
}

.filter-item:hover {
  background: #f8f8f8;
}

.filter-item.active {
  color: #c75d35;
  font-weight: 500;
}

/* Sort 容器 */
.sort-container {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-container label {
  font-size: 0.9rem;
  color: #666;
  white-space: nowrap;
}

/* Sort 下拉按钮容器 */
.sort-dropdown-wrapper {
  position: relative;
}

/* Sort 按钮 */
.sort-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 0.9rem;
  background: #fff;
  cursor: pointer;
  outline: none;
  transition: all 0.2s;
  min-width: 140px;
  user-select: none;
}

.sort-btn:hover {
  border-color: #c75d35;
  color: #c75d35;
}

.sort-btn .dropdown-arrow {
  font-size: 0.8rem;
  color: #666;
  transition: transform 0.2s;
}

.sort-btn .dropdown-arrow.rotated {
  transform: rotate(180deg);
}

/* Sort 下拉菜单 */
.sort-dropdown {
  position: fixed;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 9999;
  margin-top: 4px;
}

.sort-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9rem;
  color: #333;
  transition: background-color 0.2s;
  text-align: left;
}

.sort-item:hover {
  background: #f8f8f8;
}

.sort-item.active {
  color: #c75d35;
  font-weight: 500;
}
.products-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px 16px; /* 减少行间距和列间距 */
  margin-bottom: 24px; /* 减少底部间距 */
}
.product-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0 0 20px 0; /* 增加底部padding以平衡布局 */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}
.product-img-box {
  width: 100%;
  aspect-ratio: 1/1;
  background: #f7f7f7;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-img-box img {
  width: 90%;
  height: 90%;
  object-fit: cover;
}
.out-of-stock {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #444;
  color: #fff;
  font-size: 0.85rem;
  padding: 2px 10px;
  border-radius: 4px;
  z-index: 2;
}
.product-info {
  width: 100%;
  padding: 16px 24px 0 24px;
  text-align: left;
  flex-grow: 1;
  box-sizing: border-box;


}
.product-artist {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 6px;
  margin-left: 0;
  margin-right: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 8px;
  margin-left: 0;
  margin-right: 0;
  color: #222;
  line-height: 1.3;
}
.product-price {
  color: #c75d35;
  font-weight: 700;
  font-size: 1.2rem;
  margin-bottom: 4px;
  margin-left: 0;
  margin-right: 0;
}

/* 加载和错误状态样式 */
.loading-state, .error-state {
  text-align: center;
  padding: 40px 20px;
  margin: 20px 0;
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

/* Suggestion Carousel */
.suggestion-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  margin-bottom: 20px;
  background: #f9f7f5;
  border: 1px solid #ede8e3;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.2s;
  overflow: hidden;
}
.suggestion-bar:hover {
  background: #f3eeea;
}
.suggestion-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #c75d35;
  white-space: nowrap;
  flex-shrink: 0;
}
.suggestion-content {
  display: inline-flex;
  gap: 4px;
  transition: opacity 0.4s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.suggestion-content.fading {
  opacity: 0;
}
.suggestion-keyword {
  font-size: 0.9rem;
  font-weight: 500;
  color: #333;
}
.suggestion-reason {
  font-size: 0.85rem;
  color: #888;
}

/* AI Search Panel */
.search-panel {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid #eee;
  border-radius: 0 0 8px 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  z-index: 100;
  padding: 12px 16px;
}
.search-panel-section { margin-bottom: 12px; }
.search-panel-section:last-child { margin-bottom: 0; }
.search-panel-title {
  font-size: 0.8rem;
  color: #999;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.search-tags { display: flex; flex-wrap: wrap; gap: 8px; }
.search-tag {
  padding: 4px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 16px;
  font-size: 0.85rem;
  color: #555;
  cursor: pointer;
  transition: all 0.2s;
}
.search-tag:hover { border-color: #c75d35; color: #c75d35; }
.search-tag.hot { border-color: #f0c040; color: #b8860b; }
.search-tag.hot:hover { background: #fff8e1; }

/* AI Recommendation */
.ai-recommendation {
  background: linear-gradient(135deg, #fdf6f0, #fff9f5);
  border: 1px solid #f0ddd0;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
}
.ai-recommendation-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: #c75d35;
  margin-bottom: 8px;
}
.ai-icon { font-size: 1.1rem; }
.ai-typing {
  font-weight: 400;
  font-size: 0.8rem;
  color: #999;
  animation: pulse 1.5s infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
.ai-recommendation-text {
  font-size: 0.95rem;
  color: #444;
  line-height: 1.6;
}

/* 商品信息样式调整 */
.product-stock {
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
  margin-left: 0;
  margin-right: 0;
}
</style>
