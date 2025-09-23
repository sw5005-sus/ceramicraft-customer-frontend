<template>
  <div class="app-layout">
    <!-- 主应用布局，包含头部和底部 -->
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
/**
 * 主应用布局组件
 * @description 提供带有头部导航和底部信息的主应用布局
 */

import Header from '../components/Header.vue'
import Footer from '../components/Footer.vue'
</script>

<style scoped>
.app-layout {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
  overflow-x: hidden;
  overflow-y: hidden;
  position: relative;
}

.main-content {
  width: 100%;
  background: #fff;
  margin: 0;
  padding: 0;
  height: 100%;
  padding-top: 50px;
  padding-bottom: 50px;
  box-sizing: border-box;
  overflow-y: auto;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  scroll-behavior: auto; /* 禁用平滑滚动 */
  overscroll-behavior: none; /* 防止过度滚动 */
}

.main-content::-webkit-scrollbar {
  display: none; /* Chrome, Safari and Opera */
}
</style>
