/**
 * API 端点配置文件
 * 集中管理所有 API 路径，避免路径错误
 */

// 基础服务路径
export const SERVICE_PATHS = {
  USER_MS: '/user-ms/v1/customer',
  // 后续可以添加其他微服务路径
  // PRODUCT_MS: '/product-ms/v1',
  // ORDER_MS: '/order-ms/v1',
} as const;

// 用户服务相关端点
export const USER_ENDPOINTS = {
  // 用户认证
  LOGIN: `${SERVICE_PATHS.USER_MS}/login`,
  LOGOUT: `${SERVICE_PATHS.USER_MS}/logout`,
  
  // 用户注册和激活
  REGISTER: `${SERVICE_PATHS.USER_MS}/users`,
  ACTIVATE: `${SERVICE_PATHS.USER_MS}/users/activate`,
  
  // 用户信息管理
  PROFILE: `${SERVICE_PATHS.USER_MS}/profile`,
  
  // 密码管理
  CHANGE_PASSWORD: `${SERVICE_PATHS.USER_MS}/password`,
  RESET_PASSWORD: `${SERVICE_PATHS.USER_MS}/password/reset`,
} as const;

// 导出所有端点供使用
export const API_ENDPOINTS = {
  USER: USER_ENDPOINTS,
  // 后续可以添加其他服务的端点
  // PRODUCT: PRODUCT_ENDPOINTS,
  // ORDER: ORDER_ENDPOINTS,
} as const;
