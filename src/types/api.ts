// 用户登录相关类型
export interface LoginRequest {
  email: string;
  password: string;
  id?: number;
}

// 登录响应格式
export interface LoginResponse {
  message: string;
}

// 用户注册相关类型
export interface RegisterRequest {
  email: string;
  password: string;
  id?: number;
}

// 注册响应格式
export interface RegisterResponse {
  message: string;
}

// 验证码激活请求
export interface ActivateRequest {
  code: string;
}

// 激活响应格式
export interface ActivateResponse {
  message: string;
}

// 用户地址信息类型
export interface UserAddress {
  city: string;
  contact_phone: string;
  country: string;
  created_at: number;
  detail: string;
  first_name: string;
  id: number;
  is_default: boolean;
  last_name: string;
  province: string;
  updated_at: number;
  user_id: number;
  zip_code: string;
}

// 用户信息类型
export interface UserProfile {
  avatar: string;
  default_address?: UserAddress; // 可选，因为API可能不返回
  email: string;
  id: number;
  name: string;
}

// API通用响应格式
export interface ApiResponse<T> {
  code: number;
  data: T;
}

// 用户更新请求类型（只包含可修改的字段）
export interface UserProfileUpdate {
  name?: string;
  avatar?: string;
  email?: string;
  default_address?: Partial<UserAddress>;
}

// 图片上传相关类型
export interface ImageUploadRequest {
  image_type: string;
}

export interface ImageUploadResponse {
  image_id: string;
  upload_url: string;
}

// 错误响应类型
export interface ApiError {
  code: number;
  data?: string;	
  err_msg: string;
}
