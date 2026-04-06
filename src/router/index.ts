/**
 * @file 路由配置文件
 * @description 定义应用的路由结构，统一管理客户端和商户端路由
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import { authState } from '../auth/authState'
import { signIn } from '../auth/zitadel'

// 路由前缀常量
const CUSTOMER_PREFIX = '/customer'

/** 路由配置数组 */
const routes: Array<RouteRecordRaw> = [
  // 根路径重定向到客户端首页
  {
    path: '/',
    redirect: `${CUSTOMER_PREFIX}/home`
  },
  
  // 客户端路由 - 统一使用前缀
  {
    path: CUSTOMER_PREFIX,
    children: [
      // OIDC 回调路由（不使用 AppLayout，独立页面）
      {
        path: 'auth/callback',
        name: 'AuthCallback',
        component: () => import('../views/AuthCallback.vue'),
      },
      // 使用 AppLayout 的页面
      {
        path: '',
        component: AppLayout,
        children: [
          {
            path: '',
            redirect: 'home'
          },
          {
            path: 'home',
            name: 'CustomerHome',
            component: () => import('../views/Home.vue')
          },
          {
            path: 'product/:id',
            name: 'ProductDetail',
            component: () => import('../views/ProductDetail.vue')
          },
          {
            path: 'login',
            name: 'CustomerLogin',
            // 登录页已废弃 — 直接触发 Zitadel 登录跳转
            beforeEnter: (_to, _from, next) => {
              if (authState.isAuthenticated) {
                next({ name: 'CustomerHome' })
              } else {
                signIn(`${CUSTOMER_PREFIX}/home`)
                // 阻止导航，等待 Zitadel 重定向
                next(false)
              }
            },
            component: () => import('../views/AuthCallback.vue'),
          },
          {
            path: 'profile',
            name: 'CustomerProfile',
            component: () => import('../views/Profile.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'cart',
            name: 'CustomerCart',
            component: () => import('../views/Cart.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'checkout',
            name: 'CustomerCheckout',
            component: () => import('../views/Checkout.vue'),
            meta: { requiresAuth: true }
          },
          {
            path: 'orders',
            name: 'CustomerOrders',
            component: () => import('../views/Orders.vue'),
            meta: { requiresAuth: true }
          },
            {
              path: 'orders/:orderNo',
              name: 'OrderDetail',
              component: () => import('../views/OrderDetail.vue'),
              meta: { requiresAuth: true }
            },
            {
              path: 'my-reviews',
              name: 'MyReviews',
              component: () => import('../views/MyReviews.vue'),
              meta: { requiresAuth: true }
            }
        ]
      }
    ]
  },
  
  // 兼容旧路由（用于平滑迁移）
  {
    path: '/home',
    redirect: `${CUSTOMER_PREFIX}/home`
  },
  {
    path: '/cart',
    redirect: `${CUSTOMER_PREFIX}/cart`
  },
  {
    path: '/checkout',
    redirect: `${CUSTOMER_PREFIX}/checkout`
  },
  {
    path: '/profile',
    redirect: `${CUSTOMER_PREFIX}/profile`
  },
  {
    path: '/auth/login',
    redirect: `${CUSTOMER_PREFIX}/login`
  },
  {
    path: '/login',
    redirect: `${CUSTOMER_PREFIX}/login`
  },
  
  // 404 处理
  {
    path: '/:pathMatch(.*)*',
    redirect: `${CUSTOMER_PREFIX}/home`
  }
]

/** 创建路由实例 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局路由前置守卫
 * @description 使用 Zitadel OIDC 认证状态进行路由保护
 */
router.beforeEach(async (to, _from, next) => {
  // 回调路由不需要鉴权
  if (to.name === 'AuthCallback') {
    return next()
  }

  // 如果访问需要认证的页面但未登录，跳转到 Zitadel 登录页
  if (to.meta?.requiresAuth && !authState.isAuthenticated) {
    await signIn(to.fullPath)
    return next(false) // 阻止当前导航，等待 Zitadel 重定向
  }

  // 其他情况正常跳转
  return next()
})

export default router
