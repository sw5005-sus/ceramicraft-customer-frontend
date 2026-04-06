/**
 * @file Zitadel OIDC 认证管理
 * @description 基于 oidc-client-ts 的 PKCE 授权码流配置
 */

import { UserManager, WebStorageStateStore, type User } from 'oidc-client-ts'

const CUSTOMER_PREFIX = '/customer'

/**
 * 创建 OIDC UserManager 单例
 * 使用 PKCE 授权码流（适用于 SPA / User Agent 应用）
 */
const createUserManager = (): UserManager => {
  const authority = import.meta.env.VITE_ZITADEL_AUTHORITY
  const clientId = import.meta.env.VITE_ZITADEL_CLIENT_ID

  if (!authority || !clientId) {
    throw new Error(
      '[Auth] Missing Zitadel configuration. Please set VITE_ZITADEL_AUTHORITY and VITE_ZITADEL_CLIENT_ID in your .env file.'
    )
  }

  return new UserManager({
    authority,
    client_id: clientId,
    redirect_uri: `${window.location.origin}${CUSTOMER_PREFIX}/auth/callback`,
    post_logout_redirect_uri: `${window.location.origin}${CUSTOMER_PREFIX}/home`,
    silent_redirect_uri: `${window.location.origin}/silent-renew.html`,
    response_type: 'code', // 授权码流
    scope: 'openid profile email urn:zitadel:iam:user:metadata',
    automaticSilentRenew: true,
    // PKCE 由 oidc-client-ts 自动处理（response_type: 'code' 时默认启用）
    userStore: new WebStorageStateStore({ store: window.localStorage }),
  })
}

/** UserManager 单例 */
export const userManager: UserManager = createUserManager()

/**
 * 发起登录 — 跳转到 Zitadel 登录页
 * @param returnUrl 登录成功后要返回的路径
 */
export const signIn = async (returnUrl?: string): Promise<void> => {
  await userManager.signinRedirect({
    state: { returnUrl: returnUrl || `${CUSTOMER_PREFIX}/home` },
  })
}

/**
 * 处理登录回调 — 在 /auth/callback 路由中调用
 * @returns 已认证的用户信息
 */
export const handleCallback = async (): Promise<User> => {
  const user = await userManager.signinRedirectCallback()
  return user
}

/**
 * 发起登出 — 跳转到 Zitadel 登出页
 */
export const signOut = async (): Promise<void> => {
  await userManager.signoutRedirect()
}

/**
 * 获取当前已认证用户
 * @returns 用户信息或 null
 */
export const getUser = async (): Promise<User | null> => {
  return await userManager.getUser()
}

/**
 * 静默刷新 token
 */
export const silentRenew = async (): Promise<User | null> => {
  try {
    return await userManager.signinSilent()
  } catch (error) {
    console.warn('[Auth] Silent renew failed:', error)
    return null
  }
}

