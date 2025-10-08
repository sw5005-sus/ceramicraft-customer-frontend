import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { 
  getCart, 
  addToCart, 
  updateCartItem, 
  removeFromCart, 
  toggleCartItemSelection,
  clearCart
} from '../api/cart'
import type { CartData, CartItem } from '../types/api'

/**
 * 购物车管理 Composable
 */
export const useCart = () => {
  // 状态管理
  const cartData = ref<CartData | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 计算属性
  const cartItems = computed(() => cartData.value?.cart_items || [])
  const selectedItemCount = computed(() => cartData.value?.selected_item_count || 0)
  const selectedPrice = computed(() => cartData.value?.selected_price || 0)
  const totalItems = computed(() => cartItems.value.length)
  const isEmpty = computed(() => totalItems.value === 0)

  /**
   * 加载购物车数据
   */
  const loadCart = async () => {
    if (loading.value) return

    loading.value = true
    error.value = null

    try {
      const data = await getCart()
      cartData.value = data
      console.log('Cart loaded:', data)
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to load cart'
      error.value = errorMessage
      console.error('Failed to load cart:', err)
      
      // 只在非认证错误时显示错误消息
      if (!errorMessage.includes('401') && !errorMessage.includes('unauthorized')) {
        ElMessage.error(errorMessage)
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * 添加商品到购物车
   */
  const addItemToCart = async (productId: number, quantity: number = 1) => {
    try {
      await addToCart(productId, quantity)
      ElMessage.success('Item added to cart')
      await loadCart() // 重新加载购物车
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to add item to cart'
      console.error('Failed to add item to cart:', err)
      ElMessage.error(errorMessage)
      throw err
    }
  }

  /**
   * 更新购物车商品数量
   */
  const updateItemQuantity = async (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      await removeItemFromCart(itemId)
      return
    }

    try {
      await updateCartItem(itemId, quantity)
      await loadCart() // 重新加载购物车
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to update item quantity'
      console.error('Failed to update item quantity:', err)
      ElMessage.error(errorMessage)
      throw err
    }
  }

  /**
   * 从购物车删除商品
   */
  const removeItemFromCart = async (itemId: number) => {
    try {
      await removeFromCart(itemId)
      ElMessage.success('Item removed from cart')
      await loadCart() // 重新加载购物车
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to remove item from cart'
      console.error('Failed to remove item from cart:', err)
      ElMessage.error(errorMessage)
      throw err
    }
  }

  /**
   * 切换商品选择状态
   */
  const toggleItemSelection = async (itemId: number, selected: boolean) => {
    try {
      await toggleCartItemSelection(itemId, selected)
      await loadCart() // 重新加载购物车
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to toggle item selection'
      console.error('Failed to toggle item selection:', err)
      ElMessage.error(errorMessage)
      throw err
    }
  }

  /**
   * 选择所有商品
   */
  const selectAllItems = async () => {
    try {
      const promises = cartItems.value.map(item => 
        toggleCartItemSelection(item.id, true)
      )
      await Promise.all(promises)
      await loadCart() // 重新加载购物车
    } catch (err: unknown) {
      console.error('Failed to select all items:', err)
      ElMessage.error('Failed to select all items')
    }
  }

  /**
   * 取消选择所有商品
   */
  const unselectAllItems = async () => {
    try {
      const promises = cartItems.value.map(item => 
        toggleCartItemSelection(item.id, false)
      )
      await Promise.all(promises)
      await loadCart() // 重新加载购物车
    } catch (err: unknown) {
      console.error('Failed to unselect all items:', err)
      ElMessage.error('Failed to unselect all items')
    }
  }

  /**
   * 清空购物车
   */
  const clearCartItems = async () => {
    try {
      await clearCart()
      ElMessage.success('Cart cleared')
      await loadCart() // 重新加载购物车
    } catch (err: unknown) {
      const errorMessage = (err as Error)?.message || 'Failed to clear cart'
      console.error('Failed to clear cart:', err)
      ElMessage.error(errorMessage)
      throw err
    }
  }

  /**
   * 格式化价格显示
   */
  const formatPrice = (price: number): string => {
    return `¥${price.toFixed(2)}`
  }

  /**
   * 计算商品小计
   */
  const calculateItemSubtotal = (item: CartItem): number => {
    return item.product_price * item.quantity
  }

  // 组件挂载时自动加载
  onMounted(() => {
    loadCart()
  })

  return {
    // 状态
    cartData,
    cartItems,
    loading,
    error,
    
    // 计算属性
    selectedItemCount,
    selectedPrice,
    totalItems,
    isEmpty,
    
    // 方法
    loadCart,
    addItemToCart,
    updateItemQuantity,
    removeItemFromCart,
    toggleItemSelection,
    selectAllItems,
    unselectAllItems,
    clearCartItems,
    formatPrice,
    calculateItemSubtotal
  }
}
