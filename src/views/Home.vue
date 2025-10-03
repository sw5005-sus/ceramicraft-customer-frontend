<template>
  <div class="products-page">
    <!-- 搜索区域 -->
    <div class="search-section">
      <!-- 搜索输入框 -->
      <div class="search-input-container">
        <input 
          v-model="searchKeyword" 
          @keyup.enter="handleSearch"
          class="search-input" 
          placeholder="Enter product name" 
        />
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
    
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-state">
      <p>Loading products...</p>
    </div>
    
    <!-- 错误状态 -->
    <div v-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="fetchProducts">Retry</button>
    </div>
    
    <!-- 商品列表 -->
    <div v-if="!loading && !error" class="products-list">
      <div 
        v-for="(item, index) in products" 
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
          <div class="product-price">¥{{ item.price }}</div>
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

import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getProductList } from '../api/product'
import type { Product, ProductListParams } from '../api/product'

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
  fetchProducts()
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
  return product.pic_info || defaultImg
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
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('resize', handleResize)
  window.addEventListener('scroll', handleResize)
})

// 组件卸载时移除事件监听
onUnmounted(() => {
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

/* 商品信息样式调整 */
.product-stock {
  font-size: 0.85rem;
  color: #666;
  margin-top: 4px;
  margin-left: 0;
  margin-right: 0;
}
</style>
