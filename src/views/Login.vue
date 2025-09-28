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
            <input type="email" v-model="loginForm.email" class="form-input" placeholder="Enter your email address" />
          </div>
          <div class="form-group">
            <div class="form-label">PASSWORD</div>
            <input type="password" v-model="loginForm.password" class="form-input" placeholder="Must be more than 8 characters with letters and numbers" />
          </div>
          <div class="form-group form-checkbox">
            <label class="checkbox-container">
              <input type="checkbox" v-model="loginForm.remember" />
              <span class="checkbox-text">Remember me</span>
            </label>
            <span class="forgot">FORGOT PASSWORD?</span>
          </div>
          <div class="form-group">
            <button class="sign-in-button" @click="onLogin" :disabled="loading">
              {{ loading ? 'SIGNING IN...' : 'SIGN IN' }}
            </button>
            <button class="back-button" @click="onBack" :disabled="loading">BACK</button>
          </div>
        </div>
        
        <div v-if="activeTab === 'register'" class="form-container">
          <!-- 步骤1: 输入邮箱和密码 -->
          <div v-if="registerStep === 'input'">
            <div class="form-group">
              <div class="form-label">EMAIL ADDRESS</div>
              <input type="email" v-model="registerForm.email" class="form-input" placeholder="Enter your email address" />
            </div>
            <div class="form-group">
              <div class="form-label">PASSWORD</div>
              <input type="password" v-model="registerForm.password" class="form-input" placeholder="Must be more than 8 characters with letters and numbers" />
            </div>
            <div class="form-group">
              <button class="sign-in-button" @click="onRegister" :disabled="loading">
                {{ loading ? 'REGISTERING...' : 'REGISTER' }}
              </button>
              <button class="back-button" @click="onBack" :disabled="loading">BACK</button>
            </div>
          </div>
          
          <!-- 步骤2: 输入验证码 -->
          <div v-if="registerStep === 'verification'">
            <div class="verification-info">
              <p>A verification code has been sent to:</p>
              <p class="email-display">{{ registerForm.email }}</p>
              <p>Please check your email and enter the verification code below.</p>
            </div>
            <div class="form-group">
              <div class="form-label">VERIFICATION CODE</div>
              <input type="text" v-model="registerForm.verificationCode" class="form-input" placeholder="Enter 6-digit verification code" maxlength="6" />
            </div>
            <div class="form-group">
              <button class="sign-in-button" @click="onActivate" :disabled="loading">
                {{ loading ? 'ACTIVATING...' : 'ACTIVATE ACCOUNT' }}
              </button>
              <button class="back-button" @click="resetRegister" :disabled="loading">START OVER</button>
            </div>
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
import { login, register, activateAccount } from '../api/auth'
import { isValidEmail, getPasswordError } from '../utils'
import type { LoginRequest, RegisterRequest, ActivateRequest } from '../types/api'

const router = useRouter()
const loading = ref(false)
const activeTab = ref('login')

// 注册流程状态：'input' -> 'verification' -> 'completed'
const registerStep = ref('input')

const loginForm = ref({
  email: '',
  password: '',
  remember: false
})

const registerForm = ref({
  email: '',
  password: '',
  verificationCode: ''
})

const onLogin = async () => {
  if (!loginForm.value.email || !loginForm.value.password) {
    ElMessage.error('Please enter email and password')
    return
  }
  
  if (!isValidEmail(loginForm.value.email)) {
    ElMessage.error('Please enter a valid email address')
    return
  }
  
  // 使用更详细的密码验证
  const passwordError = getPasswordError(loginForm.value.password)
  if (passwordError) {
    ElMessage.error(passwordError)
    return
  }
  
  loading.value = true
  
  try {
    const loginData: LoginRequest = {
      email: loginForm.value.email,
      password: loginForm.value.password,
      id: 0
    }
    
    const response = await login(loginData)
    
    // 请求成功就说明登录成功
    if (response && response.message) {
      ElMessage.success(response.message)
      
      // 登录成功后跳转到home页面
      router.push('/home')
    } else {
      ElMessage.error('Login failed: Invalid response')
    }
  } catch (error: any) {
    console.error('Login error:', error)
    ElMessage.error(error.err_msg || error.message || 'Login failed. Please try again.')
  } finally {
    loading.value = false
  }
}

// 注册函数
const onRegister = async () => {
  if (!registerForm.value.email || !registerForm.value.password) {
    ElMessage.error('Please enter email and password')
    return
  }
  
  if (!isValidEmail(registerForm.value.email)) {
    ElMessage.error('Please enter a valid email address')
    return
  }
  
  const passwordError = getPasswordError(registerForm.value.password)
  if (passwordError) {
    ElMessage.error(passwordError)
    return
  }
  
  loading.value = true
  
  try {
    const registerData: RegisterRequest = {
      email: registerForm.value.email,
      password: registerForm.value.password,
      id: 0
    }
    
    const response = await register(registerData)
    
    if (response && response.message) {
      ElMessage.success(response.message)
      registerStep.value = 'verification'
    } else {
      ElMessage.error('Registration failed: Invalid response')
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    ElMessage.error(error.err_msg || error.message || 'Registration failed. Please try again.')
  } finally {
    loading.value = false
  }
}

// 激活账户函数
const onActivate = async () => {
  if (!registerForm.value.verificationCode) {
    ElMessage.error('Please enter the verification code')
    return
  }
  
  if (registerForm.value.verificationCode.length !== 6) {
    ElMessage.error('Verification code must be 6 digits')
    return
  }
  
  loading.value = true
  
  try {
    const activateData: ActivateRequest = {
      code: registerForm.value.verificationCode
    }
    
    const response = await activateAccount(activateData)
    
    if (response && response.message) {
      ElMessage.success(response.message)
      
      // 激活成功后重置表单并切换到登录页
      resetRegister()
      activeTab.value = 'login'
    } else {
      ElMessage.error('Activation failed: Invalid response')
    }
  } catch (error: any) {
    console.error('Activation error:', error)
    ElMessage.error(error.err_msg || error.message || 'Activation failed. Please try again.')
    
    // 激活失败，返回到初始状态
    resetRegister()
  } finally {
    loading.value = false
  }
}

// 重置注册状态
const resetRegister = () => {
  registerStep.value = 'input'
  registerForm.value = {
    email: '',
    password: '',
    verificationCode: ''
  }
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

.sign-in-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
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

.back-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
  opacity: 0.6;
}

.verification-info {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid var(--primary-color);
}

.verification-info p {
  margin: 8px 0;
  color: var(--text-color);
  font-size: 14px;
  line-height: 1.5;
}

.verification-info .email-display {
  font-weight: 600;
  color: var(--primary-color);
  font-size: 16px;
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
