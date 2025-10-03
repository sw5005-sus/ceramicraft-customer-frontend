import { request } from './api';
import { API_ENDPOINTS } from '../config/api-endpoints';

// 商品列表查询参数接口
export interface ProductListParams {
  keyword?: string;
  category?: string;
  offset?: number;
  order_by?: number;
  status?: string;
}

// 商品信息接口
export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  desc: string;
  stock: number;
  pic_info: string;
  status: number;
}

// API 响应数据结构
export interface ProductListData {
  list: Product[];
  total: number;
}

// 商品列表响应接口（包含标准 API 响应格式）
export interface ProductListResponse {
  code: number;
  err_msg: string;
  data: ProductListData;
}

/**
 * 获取商品列表
 * @param params 查询参数，所有参数都是可选的
 * @returns Promise<ProductListData> 返回商品列表数据
 */
export const getProductList = async (params: ProductListParams = {}): Promise<ProductListData> => {
  try {
    // 构建查询参数，只添加有值的参数
    const queryParams = new URLSearchParams();
    
    if (params.keyword) {
      queryParams.append('keyword', params.keyword);
    }
    if (params.category) {
      queryParams.append('category', params.category);
    }
    if (params.offset !== undefined) {
      queryParams.append('offset', params.offset.toString());
    }
    if (params.order_by !== undefined) {
      queryParams.append('order_by', params.order_by.toString());
    }
    if (params.status) {
      queryParams.append('status', params.status);
    }
    
    // 构建完整的 URL
    const url = queryParams.toString() 
      ? `${API_ENDPOINTS.PRODUCT.LIST}?${queryParams.toString()}`
      : API_ENDPOINTS.PRODUCT.LIST;
    
    console.log('Fetching products with URL:', url);
    
    const response = await request.get<ProductListResponse>(url);
    
    // 检查响应状态
    if (response.code !== 200) {
      throw new Error(response.err_msg || '获取商品列表失败');
    }
    
    return response.data;
  } catch (error) {
    console.error('Failed to fetch product list:', error);
    throw error;
  }
};

/**
 * 搜索商品
 * @param keyword 搜索关键词
 * @param otherParams 其他查询参数
 * @returns Promise<ProductListData>
 */
export const searchProducts = async (
  keyword: string, 
  otherParams: Omit<ProductListParams, 'keyword'> = {}
): Promise<ProductListData> => {
  return getProductList({ keyword, ...otherParams });
};

/**
 * 根据分类获取商品
 * @param category 商品分类
 * @param otherParams 其他查询参数
 * @returns Promise<ProductListData>
 */
export const getProductsByCategory = async (
  category: string,
  otherParams: Omit<ProductListParams, 'category'> = {}
): Promise<ProductListData> => {
  return getProductList({ category, ...otherParams });
};

/**
 * 获取排序后的商品列表
 * @param orderBy 排序方式
 * @param otherParams 其他查询参数
 * @returns Promise<ProductListData>
 */
export const getSortedProducts = async (
  orderBy: number,
  otherParams: Omit<ProductListParams, 'order_by'> = {}
): Promise<ProductListData> => {
  return getProductList({ order_by: orderBy, ...otherParams });
};
