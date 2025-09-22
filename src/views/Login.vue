<template>
  <div class="login-container">
    <div class="login-left">
      <img src="/img/headImage.png" alt="Ceramic Vase" class="head-image" />
    </div>
    <div class="login-right">
      <!-- 顶部标题和logo -->
      <div class="login-header">
        <div class="login-logo">
          <img src="/img/logo.png" alt="CERAMIC-CRAFT Logo" class="logo-image" />
          <span class="logo-text">CERAMIC-CRAFT</span>
        </div>
      </div>
      
      <div class="login-tabs">
        <div class="tab-header">
          <div :class="['tab-item', activeTab === 'login' ? 'active' : '']" @click="activeTab = 'login'">Login</div>
          <div :class="['tab-item', activeTab === 'register' ? 'active' : '']" @click="activeTab = 'register'">Register</div>
        </div>
        
        <div v-if="activeTab === 'login'" class="login-form form-container">
          <div class="form-group">
            <div class="form-label">EMAIL ADDRESS</div>
            <input type="email" v-model="loginForm.email" class="form-input" />
          </div>
          <div class="form-group">
            <div class="form-label">PASSWORD</div>
            <input type="password" v-model="loginForm.password" class="form-input" />
          </div>
          <div class="form-group form-checkbox">
            <label class="checkbox-container">
              <input type="checkbox" v-model="loginForm.remember" />
              <span class="checkbox-text">Remember me</span>
            </label>
            <span class="forgot">FORGOT PASSWORD?</span>
          </div>
          <div class="form-group">
            <button class="sign-in-button" @click="onLogin">SIGN IN</button>
          </div>
        </div>
        
        <div v-if="activeTab === 'register'" class="register-form form-container">
          <div class="form-group">
            <div class="form-label">NICKNAME</div>
            <input type="text" v-model="registerForm.nickname" class="form-input" />
          </div>
          <div class="form-group">
            <div class="form-label">EMAIL ADDRESS</div>
            <input type="email" v-model="registerForm.email" class="form-input" />
          </div>
          <div class="form-group">
            <div class="form-label">PASSWORD</div>
            <input type="password" v-model="registerForm.password" class="form-input" @input="checkPasswordInput" />
          </div>
          <div class="form-group" v-if="showConfirmPassword">
            <div class="form-label">CONFIRM PASSWORD</div>
            <input type="password" v-model="registerForm.confirmPassword" class="form-input" />
          </div>
          <div class="form-group">
            <button class="sign-in-button" @click="onRegister">REGISTER</button>
          </div>
        </div>
      </div>
      
      <!-- 底部政策链接和GitHub图标 -->
      <div class="login-footer">
        <!-- 移除了这些按钮，现在在Footer中显示 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * 用户登录注册页面
 * @description 提供用户登录和注册功能的表单页面
 */

import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

/** 路由实例 */
const router = useRouter()

/** 当前激活的标签页 */
const activeTab = ref('login')

/** 登录表单数据 */
const loginForm = ref({
  email: '',
  password: '',
  remember: false
})

/** 注册表单数据 */
const registerForm = ref({
  nickname: '',
  email: '',
  password: '',
  confirmPassword: ''
})

/** 是否显示确认密码字段 */
const showConfirmPassword = ref(false)

/**
 * 检查密码输入状态
 * @description 当密码字段有内容时才显示确认密码字段
 */
const checkPasswordInput = () => {
  showConfirmPassword.value = registerForm.value.password.length > 0
}

/**
 * 处理用户登录
 * @description 验证登录信息并跳转到首页
 */
const onLogin = () => {
  // 基本表单验证
  if (!loginForm.value.email || !loginForm.value.password) {
  ElMessage.error('Please enter email and password')
    return
  }

  // TODO: 接入后端 API 进行登录验证
  console.log('Login:', loginForm.value)
  
  // 模拟登录成功，设置认证状态
  localStorage.setItem('userToken', 'mock-token-' + Date.now())
  
  // 跳转到首页
  router.push('/')
}

/**
 * 处理用户注册
 * @description 验证注册信息并提交注册请求
 */
const onRegister = () => {
  // 基本字段验证
  if (!registerForm.value.nickname || !registerForm.value.email || !registerForm.value.password) {
  ElMessage.error('Please complete all required fields')
    return
  }

  // 密码一致性验证
  if (showConfirmPassword.value && registerForm.value.password !== registerForm.value.confirmPassword) {
  ElMessage.error('Passwords do not match')
    return
  }
  
  // TODO: 接入后端 API 进行用户注册
  console.log('Register:', registerForm.value)
}
</script>

<style scoped>
.login-container {
  display: flex;
  min-height: 100vh; /* 在无头部/底部的情况下，使用完整视口高度 */
  height: auto; /* 允许内容自动撑开高度 */
  background-color: #fff;
  width: 100%;
  margin: 0;
  padding: 0;
}

.login-left {
  flex: none; /* 不使用flex拉伸 */
  width: auto; /* 宽度根据图片内容自动调整 */
  position: relative;
  background-color: #f5e1d0; /* 添加与花瓶背景相匹配的颜色 */
  display: flex;
  justify-content: center; /* 居中显示 */
  align-items: center;
  padding: 0;
  overflow: hidden;
}

.login-left .head-image {
  height: auto; /* 改为自适应高度 */
  max-height: 100vh; /* 最大高度为整个视口高度 */
  width: auto;
  object-fit: contain;
  margin: 0;
  display: block;
}

.login-right {
  flex: 1; /* 填充剩余空间 */
  display: flex;
  flex-direction: column;
  justify-content: space-between; /* 在顶部、中间和底部之间分配空间 */
  align-items: center;
  padding: 40px 0 20px; /* 调整上下内边距 */
  background-color: #fff;
  position: relative;
}

.login-header {
  width: 90%;
  max-width: 400px;
  display: flex;
  justify-content: flex-end; /* 靠右对齐 */
  margin-bottom: 20px;
}

.login-logo {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-image {
  width: 30px;
  height: 30px;
  object-fit: contain;
}

.logo-text {
  font-weight: 600;
  font-size: 18px;
  color: var(--text-color);
  letter-spacing: 0.5px;
}

.login-tabs {
  width: 90%;
  max-width: 400px;
  padding: 0;
  min-height: 340px; /* 稍微减小高度，为底部留出空间 */
}

.login-footer {
  width: 90%;
  max-width: 400px;
  display: flex;
  justify-content: flex-end; /* 靠右对齐 */
  margin-top: 20px;
  gap: 20px;
}

.policy-links {
  display: flex;
  align-items: center;
  gap: 15px;
}

.policy-link {
  font-size: 13px;
  color: var(--text-lightest);
  text-decoration: none;
  transition: color 0.3s;
}

.policy-link:hover {
  color: var(--primary-color);
}

.github-link {
  color: var(--text-color);
  font-size: 20px;
  display: flex;
  align-items: center;
  transition: color 0.3s;
}

.github-link:hover {
  color: var(--primary-color);
}

.tab-header {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #ddd;
  width: 100%; /* 确保宽度一致 */
}

.tab-item {
  padding: 10px 0;
  margin-right: 30px;
  cursor: pointer;
  position: relative;
  color: var(--text-lighter);
  font-size: 16px;
  font-weight: 500;
}

.tab-item.active {
  color: var(--text-color);
  font-weight: 600;
}

.tab-item.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: var(--primary-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  margin-bottom: 8px;
  color: var(--text-color);
  font-size: 12px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  box-sizing: border-box; /* 确保宽度包含内边距和边框 */
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 0;
  font-size: 14px;
  background-color: #fff;
  color: var(--text-color);
  transition: border-color 0.3s;
  outline: none; /* 移除默认的浏览器焦点样式 */
}

.form-input:focus {
  border-color: var(--primary-color);
}

.form-checkbox {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.checkbox-container {
  display: flex;
  align-items: center;
}

.checkbox-text {
  margin-left: 8px;
  font-size: 14px;
  color: var(--text-light);
}

/* 自定义复选框样式 */
.checkbox-container input[type="checkbox"] {
  accent-color: var(--primary-color);
  cursor: pointer;
}

.forgot {
  color: var(--text-lighter);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  text-transform: uppercase;
  transition: color 0.3s;
}

.forgot:hover {
  color: var(--primary-color);
}

.sign-in-button {
  width: 100%;
  box-sizing: border-box; /* 确保宽度包含内边距和边框 */
  padding: 14px;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 0;
  cursor: pointer;
  font-weight: 500;
  font-size: 16px;
  letter-spacing: 1px;
  transition: background-color 0.3s;
  margin-top: 10px;
}

.sign-in-button:hover {
  background-color: var(--primary-hover);
}

/* 添加表单容器样式 */
.form-container {
  min-height: 280px; /* 设置表单最小高度，让按钮位置相对固定 */
  display: flex;
  flex-direction: column;
}

/* 将按钮推到底部 */
.form-container .form-group:last-child {
  margin-top: auto;
  padding-top: 20px;
}

/* 响应式布局调整 */
@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }
  
  .login-left {
    width: 100%;
    height: 200px; /* 限制高度 */
    overflow: hidden;
  }
  
  .login-left .head-image {
    max-height: 200px;
  }
  
  .login-right {
    padding: 30px 0 20px;
  }
  
  .login-header, .login-tabs, .login-footer {
    width: 85%;
  }
}

@media (max-width: 480px) {
  .login-left {
    height: 150px;
  }
  
  .login-left .head-image {
    max-height: 150px;
  }
  
  .login-header, .login-tabs, .login-footer {
    width: 90%;
  }
  
  .login-footer {
    flex-direction: column;
    align-items: flex-end;
    gap: 10px;
  }
}
</style>
