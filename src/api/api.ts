import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiError } from '../types/api';

// API 路径配置已移动到 /src/config/api-endpoints.ts

// 创建 axios 实例
const createApiInstance = (): AxiosInstance => {
  // 开发环境使用代理，生产环境直接访问后端
  const baseURL = import.meta.env.DEV 
    ? '/api'  // 开发环境使用 Vite 代理
    : 'http://47.129.72.211';  // 生产环境直接访问

  const instance = axios.create({
    baseURL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    // 允许携带凭据（cookies）
    withCredentials: true,
  });

  // 请求拦截器
  instance.interceptors.request.use(
    (config) => {
      // 添加认证 token
      const token = localStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      
      console.log('API Request:', {
        method: config.method?.toUpperCase(),
        baseURL: config.baseURL,
        url: config.url,
        fullUrl: `${config.baseURL || ''}${config.url || ''}`,
        data: config.data,
        headers: config.headers,
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
            // 未授权，清除 token 并跳转到登录页
            localStorage.removeItem('userToken');
            window.location.href = '/login';
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
