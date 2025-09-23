<template>
  <div class="login-container">
    <div class="login-left">
      <img src="/img/headImage.png" alt="Ceramic Vase" class="head-image" />
    </div>
    <div class="login-right">    
      <div class="login-tabs">
        <div class="tab-header">
          <div :class="['tab-item', activeTab === 'login' ? 'active' : '']" @click="activeTab = 'login'">Login</div>
          <div :class="['tab-item', activeTab === 'register' ? 'active' : '']" @click="activeTab = 'register'">Register</div>
        </div>
        
        <div v-if="activeTab === 'login'" class="form-container">
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
            <button class="back-button" @click="onBack">BACK</button>
          </div>
        </div>
        
        <div v-if="activeTab === 'register'" class="form-container">
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
            <button class="back-button" @click="onBack">BACK</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const router = useRouter()
const activeTab = ref('login')
const loginForm = ref({
  email: '',
  password: '',
  remember: false
})

const registerForm = ref({
  email: '',
  password: '',
  confirmPassword: ''
})


const showConfirmPassword = ref(false)

const checkPasswordInput = () => {
  showConfirmPassword.value = registerForm.value.password.length > 0
}


const onLogin = () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    ElMessage.error('Please enter email and password')
    return
  }
  
  console.log('Login:', loginForm.value)
  localStorage.setItem('userToken', 'mock-token-' + Date.now())
  
  // 触发自定义事件通知登录状态变化
  window.dispatchEvent(new CustomEvent('loginStatusChanged'))
  
  // 登录成功后跳转到home页面
  router.push('/home')
}

const onRegister = () => {
  if (!registerForm.value.email || !registerForm.value.password) {
    ElMessage.error('Please complete all required fields')
    return
  }

  if (showConfirmPassword.value && registerForm.value.password !== registerForm.value.confirmPassword) {
    ElMessage.error('Passwords do not match')
    return
  }
  
  console.log('Register:', registerForm.value)
}

const onBack = () => {
  router.back()
}
</script>

<style scoped>
.login-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  margin: 0;
  padding: 0;
  overflow: hidden;
  position: fixed;
  top: 0;
  left: 0;
}

.login-left {
  width: auto;
  overflow: hidden;
  background-color: #f5e1d0;
  display: flex;
  justify-content: center;
  align-items: center;
}

.head-image {
  height: 90vh;
  width: auto;
  object-fit: cover;
  display: block;
}

.login-right {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 120px 20px;
  background-color: #fff;
  overflow: hidden;
  height: 100vh;
  box-sizing: border-box;
}

.login-tabs {
  width: 90%;
  max-width: 400px;
}

.tab-header {
  display: flex;
  margin-bottom: 30px;
  border-bottom: 1px solid #ddd;
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

.form-container {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  max-height: 400px;
  overflow: hidden;
}
.form-group {
  margin-bottom: 20px;
}


.form-group:last-child {
  margin-top: auto;
  padding-top: 20px;
}

.form-label {
  margin-bottom: 8px;
  color: var(--text-color);
  font-size: 12px;
  font-weight: 500;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 0;
  font-size: 14px;
  background-color: #fff;
  color: var(--text-color);
  transition: border-color 0.3s;
  outline: none;
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
  box-sizing: border-box;
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

.back-button {
  width: 100%;
  box-sizing: border-box;
  padding: 14px;
  background-color: #999;
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

.back-button:hover {
  background-color: #777;
}

@media (max-width: 768px) {
  .login-container { flex-direction: column; }
  .login-left { width: 100%; height: 40vh; }
  .head-image { height: 40vh; width: 100%; }
  .login-right { height: 60vh; padding: 20px; }
  .form-container { max-height: 350px; }
  .login-tabs { width: 85%; }
}

@media (max-width: 480px) {
  .login-left { height: 35vh; }
  .head-image { height: 35vh; }
  .login-right { height: 65vh; }
  .form-container { max-height: 300px; }
  .login-tabs { width: 90%; }
}
</style>
