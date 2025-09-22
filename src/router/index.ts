/**
 * @file 路由配置文件
 * @description 定义应用的路由结构，包括主应用路由和认证路由
 */

import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import AppLayout from '../layouts/AppLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'

/** 路由配置数组 */
const routes: Array<RouteRecordRaw> = [
  // 主应用路由 - 需要认证的页面
  {
    path: '/',
    component: AppLayout,
    children: [
      {
        path: '',
        redirect: '/home'
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('../views/Home.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'shop',
        name: 'Shop',
        component: () => import('../views/Shop.vue'),
        meta: { requiresAuth: true }
      },
      {
        path: 'product/:id',
        name: 'ProductDetail',
        component: () => import('../views/ProductDetail.vue'),
        meta: { requiresAuth: true }
      }
    ]
  },
  // 购物车和个人中心页面（不使用AppLayout，无头部底部）
  {
    path: '/cart',
    name: 'Cart',
    component: () => import('../views/Cart.vue'),
    meta: { layout: 'none', requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'Profile',
    component: () => import('../views/Profile.vue'),
    meta: { layout: 'none', requiresAuth: true }
  },
  
  // 认证路由 - 登录注册等页面
  {
    path: '/auth',
    component: AuthLayout,
    children: [
      {
        path: 'login',
        name: 'Login',
        component: () => import('../views/Login.vue')
      }
    ]
  },
  // 兼容旧/login路径
  {
    path: '/login',
    redirect: '/auth/login'
  },
  // 404重定向
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

/** 创建路由实例 */
const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 全局路由前置守卫
 * @description 处理路由跳转前的逻辑，如权限验证和重定向
 */
router.beforeEach((to, _from, next) => {
  // 简单的认证状态检查（可以后续扩展为真实的认证逻辑）
  const isAuthenticated = localStorage.getItem('userToken')
  // 访问根路径时，根据登录状态跳转
  if (to.path === '/') {
    if (isAuthenticated) {
      return next('/home')
    } else {
      return next('/auth/login')
    }
  }
  // 如果访问需要认证的页面但未登录，重定向到登录页面
  if (to.meta?.requiresAuth && !isAuthenticated) {
    return next('/auth/login')
  }
  // 如果已登录但访问登录页面，重定向到首页
  if (isAuthenticated && to.path === '/auth/login') {
    return next('/home')
  }
  // 其他情况正常跳转
  return next()
})

export default router
