<template>
  <footer class="footer">
    <div class="footer-content">
      <div class="footer-left">
        <a href="#" class="social-icon">Privacy Policy</a>
        <a href="#" class="social-icon">Terms of Use</a>
      </div>
      <div class="footer-right">
        <a href="https://cerami-craft.atlassian.net/jira/software/projects/KAN/boards/1" target="_blank" class="social-icon" title="Jira">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11.571 11.513H0a5.218 5.218 0 0 0 5.232 5.215h2.13v2.057A4.17 4.17 0 0 0 11.571 23V11.513zm6.213-6.19H6.157a5.218 5.218 0 0 0 5.231 5.214h2.131V12.6a4.169 4.169 0 0 0 4.209 4.214V5.323zm6.209-5.323H12.367a5.218 5.218 0 0 0 5.231 5.214h2.131V7.271A4.169 4.169 0 0 0 23.993 11.485V0z"/>
          </svg>
        </a>
        <a href="https://cerami-craft.atlassian.net/wiki/spaces/swe5006gro/overview?homepageId=65975" target="_blank" class="social-icon" title="Confluence">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path fill="currentColor" d="M.87 16.089c-.16.3-.27.634-.27 1.01c0 1.18.956 2.134 2.135 2.134c.376 0 .71-.11 1.01-.27L12.666 12l-8.93-6.962c-.3-.16-.634-.27-1.01-.27C1.546 4.768.59 5.724.59 6.903c0 .376.11.71.27 1.01L8.823 12L.87 16.089zm22.26-8.186c.16-.3.27-.634.27-1.01c0-1.18-.956-2.134-2.135-2.134c-.376 0-.71.11-1.01.27L11.334 12l8.93 6.962c.3.16.634.27 1.01.27c1.18 0 2.135-.956 2.135-2.134c0-.376-.11-.71-.27-1.01L15.177 12l7.953-4.097z"/>
          </svg>
        </a>
        <a href="https://github.com/NUS-ISS-Agile-Team" target="_blank" class="social-icon" title="GitHub">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"/>
          </svg>
        </a>
      </div>
    </div>
  </footer>
  
  <!-- 浮动 cookie 提示 -->
  <div class="cookie-notice-popup" v-if="showCookieNotice">
    <div class="cookie-content">
      <div class="cookie-text">
        Our site uses cookies. Learn more about our use of cookies: 
        <router-link to="/cookie-policy" class="cookie-link">cookie policy</router-link>
      </div>
      <button class="cookie-button" @click="acceptCookies">I Accept</button>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 底部组件
 * @description 包含站点链接、语言切换、社交媒体链接和Cookie提示的底部组件
 */

import { ref, onMounted } from 'vue'

/** 是否显示Cookie提示 */
const showCookieNotice = ref(false)

/**
 * 组件挂载时执行
 * @description 检查用户是否已接受Cookie，决定是否显示Cookie提示
 */
onMounted(() => {
  // 检查是否已接受 cookies
  const cookiesAccepted = localStorage.getItem('cookiesAccepted') === 'true'
  showCookieNotice.value = !cookiesAccepted

  // 页面加载时，如果需要显示 cookie 提示，延迟 1 秒后显示，提升用户体验
  if (!cookiesAccepted) {
    setTimeout(() => {
      showCookieNotice.value = true
    }, 1000)
  }
})

/**
 * 接受Cookie处理
 * @description 保存用户接受Cookie的状态并隐藏提示
 */
function acceptCookies() {
  localStorage.setItem('cookiesAccepted', 'true')
  showCookieNotice.value = false
}
</script>

<style scoped>
.footer {
  background: #222;
  color: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  margin-top: 0;
  flex-shrink: 0;
  position: fixed;
  left: 0;
  bottom: 0;
  width: 100vw;
  z-index: 100;
  height: 48px;
}

.footer-content {
  display: flex;
  width: 100%;
  max-width: 1200px;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 100%;
  min-height: 0;
}

.footer-left {
  display: flex;
  gap: 15px;
}

.footer-right {
  display: flex;
  gap: 15px;
}

.social-icon {
  color: #fff;
  font-size: 16px;
}

.cookie-notice-popup {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.85);
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.cookie-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1200px;
  margin: 0 auto;
  padding: 15px 20px;
}

.cookie-text {
  font-size: 13px;
  color: #fff;
}

.cookie-link {
  color: #fff;
  text-decoration: underline;
}

.cookie-button {
  background: #c75d35;
  color: white;
  border: none;
  padding: 8px 20px;
  margin-left: 20px;
  border-radius: 2px;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  transition: background-color 0.3s;
}

.cookie-button:hover {
  background-color: #d26b42;
}
</style>
