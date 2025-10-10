/**
 * @file 路由配置文件
 * @description 定义应用的路由结构，统一管理客户端和商户端路由
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'

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
            component: () => import('../views/Login.vue')
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
 * @description 处理路由跳转前的逻辑
 */
router.beforeEach((to, _from, next) => {
  // 简单的认证状态检查
  const isAuthenticated = localStorage.getItem('userToken')
  
  // 如果访问需要认证的页面但未登录，重定向到登录页面
  if (to.meta?.requiresAuth && !isAuthenticated) {
    return next(`${CUSTOMER_PREFIX}/login`)
  }

  // 其他情况正常跳转
  return next()
})

export default router
