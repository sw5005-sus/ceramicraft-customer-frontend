/**
 * @file Vite 构建配置文件
 * @description 配置 Vite 开发服务器和构建选项
 */

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()], // 启用 Vue 3 支持
  server: {
    port: 5173, // Port for `vite dev`
  },
  preview: {
    port: 4173, // Port for `vite preview`
    host: '0.0.0.0', // Listen on all network interfaces
  },
})
