/**
 * @file 认证 API（Zitadel OIDC）
 * @description 封装 Zitadel OIDC 登录/登出方法，保持接口兼容
 */

import { signIn, signOut } from '../auth/zitadel'
import { authState } from '../auth/authState'

/**
 * 发起登录 — 跳转到 Zitadel 登录页
 * @param returnUrl 登录成功后返回的路径
 */
export const login = async (returnUrl?: string): Promise<void> => {
  await signIn(returnUrl)
}

/**
 * 发起登出 — 跳转到 Zitadel 登出页
 */
export const logout = async (): Promise<void> => {
  await signOut()
}

/**
 * 检查用户是否已登录
 */
export const isAuthenticated = (): boolean => {
  return authState.isAuthenticated
}

/**
 * 获取当前 access_token
 */
export const getAuthToken = (): string | null => {
  return authState.accessToken
}
