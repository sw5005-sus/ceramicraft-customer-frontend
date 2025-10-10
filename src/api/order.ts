/**
 * 订单相关 API 函数
 */
import { request } from './api'

// 订单项接口
export interface OrderItem {
  price: number
  product_id: number
  product_name: string
  quantity: number
}

// 创建订单请求接口
export interface CreateOrderRequest {
  order_item_list: OrderItem[]
  receiver_address: string
  receiver_country: string
  receiver_first_name: string
  receiver_last_name: string
  receiver_phone: string
  receiver_zip_code: number
  remark?: string
}

// 创建订单响应接口
export interface CreateOrderResponse {
  status: number
  data: string // 订单号
  msg: string
  error: string
}

/**
 * 创建订单
 */
export const createOrder = async (orderData: CreateOrderRequest): Promise<string> => {
  try {
    console.log('Creating order with data:', orderData)
    
    const response = await request.post<CreateOrderResponse>('/order-ms/v1/customer/create', orderData)
    
    console.log('Order created successfully:', response)
    
    if (response.status === 0) {
      return response.data // 返回订单号
    } else {
      throw new Error(response.msg || response.error || 'Failed to create order')
    }
  } catch (error) {
    console.error('Create order API error:', error)
    throw error
  }
}
