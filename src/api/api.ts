import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiError } from '../types/api';
import { userManager, signIn } from '../auth/zitadel';

// API 路径配置已移动到 /src/config/api-endpoints.ts

// 创建 axios 实例
const createApiInstance = (): AxiosInstance => {
  // 从环境变量读取后端 API 地址
  const baseURL = import.meta.env.VITE_API_BASE_URL as string;

  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // 不再使用 cookie 认证，改用 Bearer token
  });

  // 请求拦截器 — 从 UserManager 获取最新 access_token
  instance.interceptors.request.use(
    async (config) => {
      try {
        const user = await userManager.getUser();
        if (user && !user.expired) {
          config.headers.Authorization = `Bearer ${user.access_token}`;
        }
      } catch (e) {
        console.warn('[API] Failed to get user token:', e);
      }
      
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        url: `${config.baseURL || ''}${config.url || ''}`,
        hasAuth: !!config.headers.Authorization,
      });
      
      return config;
    },
    (error) => {
      console.error('Request Error:', error);
      return Promise.reject(error);
    }
  );

  // 响应拦截器
  instance.interceptors.response.use(
    (response: AxiosResponse) => {
      console.log('API Response:', {
        status: response.status,
        url: response.config.url,
        data: response.data,
      });
      
      return response;
    },
    (error) => {
      console.error('Response Error:', error);
      
      // 处理常见错误
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            // 只在需要认证的页面触发登录，商品详情等公开页面静默忽略
            if (window.location.pathname.match(/\/(cart|checkout|orders|profile|my-reviews)/)) {
              signIn(window.location.pathname);
            }
            break;
          case 403:
            console.error('访问被拒绝');
            break;
          case 404:
            console.error('请求的资源不存在');
            break;
          case 500:
            console.error('服务器内部错误');
            break;
          default:
            console.error(`请求失败: ${status}`);
        }
        
        return Promise.reject({
          code: status,
          data: data?.data || null,
          err_msg: data?.err_msg || error.message || '请求失败',
        } as ApiError);
      } else if (error.request) {
        // 网络错误
        return Promise.reject({
          code: -1,
          data: 'NETWORK_ERROR',
          err_msg: '网络连接失败，请检查网络设置',
        } as ApiError);
      } else {
        return Promise.reject({
          code: -2,
          data: 'UNKNOWN_ERROR',
          err_msg: error.message || '未知错误',
        } as ApiError);
      }
    }
  );

  return instance;
};

// 导出 API 实例
export const apiClient = createApiInstance();

// 通用请求方法
export const request = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.get(url, config).then(res => res.data),
  
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.post(url, data, config).then(res => res.data),
  
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.put(url, data, config).then(res => res.data),
  
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.delete(url, config).then(res => res.data),
  
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> =>
    apiClient.patch(url, data, config).then(res => res.data),
};

export default apiClient;
