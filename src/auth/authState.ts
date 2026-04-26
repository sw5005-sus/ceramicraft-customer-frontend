/**
 * @file 响应式认证状态管理
 * @description 提供全局响应式的认证状态，替代 localStorage.getItem('userToken') 的检查方式
 */

import { reactive, readonly } from 'vue'
import { userManager } from './zitadel'
import { ensureLocalUserRegistered } from './ensureLocalUser'
import type { User } from 'oidc-client-ts'

let provisioningUser = false

/** 认证状态接口 */
interface AuthState {
  /** 是否已认证 */
  isAuthenticated: boolean
  /** 当前 access_token */
  accessToken: string | null
  /** OIDC 用户信息 */
  user: User | null
  /** 初始化是否完成 */
  isReady: boolean
}

/** 内部可变状态 */
const state = reactive<AuthState>({
  isAuthenticated: false,
  accessToken: null,
  user: null,
  isReady: false,
})

/**
 * 根据 User 对象更新状态
 */
const updateState = (user: User | null) => {
  if (user && !user.expired) {
    state.isAuthenticated = true
    state.accessToken = user.access_token
    state.user = user
  } else {
    state.isAuthenticated = false
    state.accessToken = null
    state.user = null
  }
}

/**
 * 初始化认证状态
 * 从 storage 恢复 session，并注册 UserManager 事件监听
 * 应在 app.mount() 之前调用
 */
export const initAuth = async (): Promise<void> => {
  try {
    // 从 storage 恢复已有 session
    let user = await userManager.getUser()
    if (user && !user.expired) {
      const provisioned = await ensureLocalUserRegistered(user)
      if (provisioned) user = provisioned
    }
    updateState(user)
  } catch (error) {
    console.warn('[Auth] Failed to restore session:', error)
    updateState(null)
  } finally {
    state.isReady = true
  }

  // 监听 token 加载（登录成功 / silent renew 成功）
  userManager.events.addUserLoaded(async (user: User) => {
    console.log('[Auth] User loaded')
    updateState(user)
    if (provisioningUser) return
    provisioningUser = true
    try {
      const provisioned = await ensureLocalUserRegistered(user)
      if (provisioned) updateState(provisioned)
    } finally {
      provisioningUser = false
    }
  })

  // 监听用户卸载（登出）
  userManager.events.addUserUnloaded(() => {
    console.log('[Auth] User unloaded')
    updateState(null)
  })

  // 监听 token 过期
  userManager.events.addAccessTokenExpired(() => {
    console.warn('[Auth] Access token expired')
    updateState(null)
  })

  // 监听静默刷新错误
  userManager.events.addSilentRenewError((error) => {
    console.error('[Auth] Silent renew error:', error)
  })
}

/** 导出只读的响应式状态 */
export const authState = readonly(state)

