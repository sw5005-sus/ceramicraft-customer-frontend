/**
 * @file 应用程序入口文件
 * @description Vue 3 应用初始化，配置路由、UI组件库、Zitadel OIDC 认证和全局样式
 */

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './style.css'
import App from './App.vue'
import router from './router'
import { initAuth } from './auth/authState'

// 引入 Font Awesome 图标库
import '@fortawesome/fontawesome-free/css/all.css'

// 初始化 OIDC 认证状态后再挂载应用
const app = createApp(App)
  .use(router)
  .use(ElementPlus)

initAuth().then(() => {
  app.mount('#app')
}).catch((err) => {
  console.error('[Auth] Failed to initialize:', err)
  // 即使认证初始化失败也要挂载应用（用户可以以未登录状态浏览）
  app.mount('#app')
})
