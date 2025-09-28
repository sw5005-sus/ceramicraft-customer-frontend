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

// 错误响应类型
export interface ApiError {
  code: number;
  data?: string;
  err_msg: string;
}
