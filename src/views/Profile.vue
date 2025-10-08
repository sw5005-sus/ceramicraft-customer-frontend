<template>
  <div class="profile-page">
    <!-- 加载状态 -->
        <!-- 加载状态 -->
    <div v-if="loading || addressLoading" class="loading-container">
      <el-icon class="loading-icon">
        <Loading />
      </el-icon>
      <p>{{ loading ? 'Loading profile...' : 'Loading addresses...' }}</p>
    </div>

    <!-- 错误状态 -->
    <div v-else-if="error" class="error-container">
      <p>{{ error }}</p>
      <el-button @click="loadUserProfile" type="primary">Retry</el-button>
    </div>

    <!-- 用户信息 -->
    <div v-else-if="userProfile" class="profile-container">
      <!-- 顶部个人信息卡片 -->
      <div class="profile-header-card">
        <h1 class="page-title">My Profile</h1>
        
        <div class="user-info-card">
          <div class="avatar-section">
            <div class="avatar-container" @click="triggerFileUpload">
              <img 
                v-if="userProfile.avatar && userProfile.avatar.trim()" 
                :src="getAvatarUrl(userProfile.avatar)" 
                alt="User Avatar" 
                class="user-avatar" 
              />
              <div v-else class="default-avatar">
                <el-icon size="40">
                  <User />
                </el-icon>
              </div>
              
              <!-- 上传遮罩层 -->
              <div class="avatar-upload-overlay" :class="{ 'uploading': uploadingImage }">
                <el-icon v-if="!uploadingImage" size="24">
                  <Camera />
                </el-icon>
                <div v-else class="upload-loading">
                  <el-icon class="is-loading" size="24">
                    <Loading />
                  </el-icon>
                </div>
              </div>
            </div>
            
            <!-- 隐藏的文件输入 -->
            <input
              ref="fileInputRef"
              type="file"
              accept="image/*"
              style="display: none"
              @change="handleAvatarUpload"
            />
          </div>
          
          <div class="user-details">
            <!-- 姓名编辑区域 -->
            <div v-if="editingName" class="name-edit-container">
              <el-input 
                ref="nameInputRef"
                v-model="editName" 
                placeholder="Enter your name"
                class="name-input"
                @keyup.enter="saveName"
                @keyup.esc="cancelEditName"
                @blur="saveName"
                size="default"
              />
            </div>
            <div v-else class="user-name-section">
              <h2 class="user-name" 
                 :class="{ 'placeholder-name': !userProfile.name || !userProfile.name.trim() }"
                 @click="startEditName">
                {{ userProfile.name && userProfile.name.trim() ? userProfile.name : 'Click to set your name' }}
                <span class="user-id">ID: {{ userProfile.id }}</span>
              </h2>
            </div>
            
            <!-- 邮箱显示区域（不可编辑） -->
            <p class="user-email">
              {{ userProfile.email }}
            </p>
          </div>
        </div>
      </div>

      <!-- 支付账户信息 -->
      <div class="payment-account-section">
        <div class="section-header">
          <h3 class="section-title">Payment Account</h3>
          <el-button 
            @click="loadPayAccount" 
            :loading="payAccountLoading" 
            type="text" 
            size="small"
            class="refresh-btn"
          >
            <el-icon><Refresh /></el-icon>
            Refresh
          </el-button>
        </div>

        <!-- 支付账户加载状态 -->
        <div v-if="payAccountLoading && !payAccount" class="payment-loading">
          <el-icon class="loading-icon">
            <Loading />
          </el-icon>
          <span>Loading payment account...</span>
        </div>

        <!-- 支付账户错误状态 -->
        <div v-else-if="payAccountError && !payAccount" class="payment-error">
          <el-icon class="error-icon">
            <Warning />
          </el-icon>
          <div class="error-content">
            <div class="error-message">{{ payAccountError }}</div>
            <div class="error-hint" v-if="payAccountError.includes('unavailable')">
              The payment service is being set up. This feature will be available soon.
            </div>
          </div>
          <el-button @click="loadPayAccount" type="text" size="small">
            Try Again
          </el-button>
        </div>

        <!-- 支付账户信息展示 -->
        <div v-else-if="payAccount" class="payment-account-card">
          <div class="account-info-grid">
            <div class="account-item">
              <div class="account-label">Account Number</div>
              <div class="account-value">{{ payAccount.account_no }}</div>
            </div>
            <div class="account-item">
              <div class="account-label">Current Balance</div>
              <div class="account-value balance-value">{{ formatBalance(payAccount.balance) }}</div>
            </div>
            <div class="account-item">
              <div class="account-label">Last Updated</div>
              <div class="account-value">{{ formatDate(payAccount.updated_at) }}</div>
            </div>
          </div>
          
          <div class="account-actions">
            <el-button type="primary" size="default" @click="showTopUpDialog = true">
              Top Up
            </el-button>
            <el-button size="default" class="transaction-history-btn">
              Transaction History
            </el-button>
          </div>
        </div>

        <!-- 暂无支付账户 -->
        <div v-else class="no-payment-account">
          <el-icon class="no-account-icon">
            <CreditCard />
          </el-icon>
          <p class="no-account-text">No payment account found</p>
          <el-button @click="loadPayAccount" type="primary" size="default">
            <el-icon><Refresh /></el-icon>
            Check Again
          </el-button>
        </div>
      </div>

      <!-- 地址管理 -->
      <div class="addresses-section">
        <div class="section-header">
          <h3 class="section-title">My Addresses</h3>
        </div>

        <!-- 有地址的情况 -->
        <div v-if="userAddresses.length > 0" class="address-grid">
          <!-- 地址列表 -->
          <div v-for="address in userAddresses" :key="address.id" class="address-card" :class="{ 'default-address': address.is_default }">
            <div class="address-header">
              <div class="address-name-header">
                <strong>{{ address.first_name }} {{ address.last_name }}</strong>
                <div v-if="address.is_default" class="default-badge-inline">Default</div>
              </div>
              <div class="address-actions">
                <el-button type="text" size="small" @click="editAddress(address)">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="text" size="small" @click="deleteAddress(address)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="address-content">
              <div class="address-phone" v-if="address.contact_phone">
                <span>{{ address.contact_phone }}</span>
              </div>
              <div class="address-detail" v-if="address.detail">
                <p>{{ address.detail }}</p>
              </div>
              <div class="address-location">
                <p>{{ [address.city, address.province, address.zip_code].filter(Boolean).join(', ') }}</p>
                <p v-if="address.country">{{ address.country }}</p>
              </div>
            </div>
          </div>

          <!-- 添加新地址按钮 -->
          <div class="add-address-card">
            <el-button type="primary" plain class="add-address-btn" @click="openAddressForm">
              <el-icon><Plus /></el-icon>
              <span>Add Address</span>
            </el-button>
          </div>
        </div>

        <!-- 没有默认地址的情况 -->
        <div v-else class="no-address-container">
          <div class="no-address-content">
            <el-icon size="48" class="no-address-icon">
              <House />
            </el-icon>
            <h4 class="no-address-title">No address found</h4>
            <p class="no-address-desc">Add your shipping address to make checkout faster</p>
            <el-button type="primary" size="large" @click="openAddressForm" class="add-first-address-btn">
              <el-icon><Plus /></el-icon>
              Add Address
            </el-button>
          </div>
        </div>
      </div>

      <!-- 地址表单弹窗 -->
      <AddressFormDialog 
        v-model:visible="showAddressForm"
        :is-edit-mode="isEditMode"
        :loading="updating"
        :address-data="editingAddress"
        @save="handleAddressSave"
        @close="handleAddressDialogClose"
      />

      <!-- Top-up充值弹窗 -->
      <el-dialog
        v-model="showTopUpDialog"
        title="Top Up Account"
        width="400px"
        :close-on-click-modal="false"
        :close-on-press-escape="false"
      >
        <el-form 
          ref="topUpFormRef"
          :model="topUpForm" 
          :rules="topUpRules"
          label-width="120px"
          @submit.prevent="handleTopUp"
        >
          <el-form-item label="Redeem Code" prop="redeemCode">
            <el-input
              v-model="topUpForm.redeemCode"
              placeholder="Enter your redeem code"
              :maxlength="20"
              clearable
              :disabled="topUpLoading"
            />
          </el-form-item>
          
          <div class="top-up-info">
            <p class="info-text">
              <el-icon><InfoFilled /></el-icon>
              Enter a valid redeem code to add funds to your account.
            </p>
          </div>
        </el-form>

        <template #footer>
          <div class="dialog-footer">
            <el-button @click="handleTopUpCancel" :disabled="topUpLoading">
              Cancel
            </el-button>
            <el-button 
              type="primary" 
              @click="handleTopUp"
              :loading="topUpLoading"
            >
              {{ topUpLoading ? 'Processing...' : 'Top Up' }}
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <el-button @click="loadUserProfile" :loading="loading" type="default">
          Refresh Profile
        </el-button>
        <el-button @click="handleLogout" type="danger">
          LOGOUT
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage, ElButton, ElIcon, ElInput } from 'element-plus'
import { Loading, User, Edit, House, Delete, Plus, Camera, Refresh, Warning, CreditCard, InfoFilled } from '@element-plus/icons-vue'
import { logout } from '../api/auth'
import { createUserAddress, updateUserAddress, deleteUserAddress } from '../api/address'
import { useUserProfile } from '../composables/useUserProfile'
import { useImageUpload } from '../composables/useImageUpload'
import { usePaymentAccount } from '../composables/usePaymentAccount'
import { getAvatarUrl } from '../utils/image'
import AddressFormDialog from '../components/AddressFormDialog.vue'
import type { UserAddress } from '../types/api'
import type { AddressFormData } from '../components/AddressFormDialog.vue'

const router = useRouter()

// 使用用户资料 composable
const { userProfile, userAddresses, loading, updating, addressLoading, error, loadUserProfile, loadUserAddresses, updateProfile } = useUserProfile()

// 使用图片上传 composable
const { uploading: uploadingImage, uploadAvatar, handleFileSelect } = useImageUpload()

// 使用支付账户 composable
const { payAccount, loading: payAccountLoading, error: payAccountError, topUpLoading, loadPayAccount, formatBalance, formatDate, performTopUp } = usePaymentAccount()

// 编辑状态
const editingName = ref(false)
const editName = ref('')

// 地址表单状态
const showAddressForm = ref(false)
const editingAddress = ref<UserAddress | null>(null) // 正在编辑的地址
const isEditMode = ref(false) // 是否为编辑模式

// Top-up弹窗状态
const showTopUpDialog = ref(false)
const topUpForm = ref({
  redeemCode: ''
})
const topUpFormRef = ref()

// Top-up表单验证规则
const topUpRules = {
  redeemCode: [
    { required: true, message: 'Please enter redeem code', trigger: 'blur' },
    { min: 1, max: 20, message: 'Redeem code length should be 1-20 characters', trigger: 'blur' }
  ]
}

// 文件上传引用
const fileInputRef = ref<HTMLInputElement>()

// 输入框引用
const nameInputRef = ref()



/**
 * 开始编辑姓名
 */
const startEditName = () => {
  editName.value = userProfile.value?.name || ''
  editingName.value = true
  nextTick(() => {
    nameInputRef.value?.focus()
  })
}

/**
 * 保存姓名
 */
const saveName = async () => {
  const trimmedName = editName.value.trim()
  if (trimmedName !== (userProfile.value?.name || '')) {
    await updateProfile({ name: trimmedName })
  }
  editingName.value = false
}

/**
 * 取消编辑姓名
 */
const cancelEditName = () => {
  editingName.value = false
  editName.value = ''
}



/**
 * 打开地址表单
 */
const openAddressForm = () => {
  showAddressForm.value = true
}

/**
 * 编辑地址
 */
const editAddress = (address: UserAddress) => {
  editingAddress.value = address
  isEditMode.value = true
  showAddressForm.value = true
}

/**
 * 关闭地址表单
 */
const closeAddressForm = () => {
  showAddressForm.value = false
  isEditMode.value = false
  editingAddress.value = null
}

/**
 * 处理地址保存
 */
const handleAddressSave = async (formData: AddressFormData) => {
  try {
    if (isEditMode.value && editingAddress.value) {
      // 编辑模式：更新现有地址
      const updateData = {
        id: editingAddress.value.id,
        user_id: editingAddress.value.user_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        contact_phone: formData.contact_phone,
        detail: formData.detail,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        zip_code: formData.zip_code,
        is_default: editingAddress.value.is_default
      }
      
      console.log('Updating address data:', updateData)
      
      const updatedAddress = await updateUserAddress(editingAddress.value.id, updateData)
      console.log('Address updated successfully:', updatedAddress)
      
      ElMessage.success('Address updated successfully')
    } else {
      // 新增模式：创建新地址
      const isFirstAddress = userAddresses.value.length === 0
      const addressData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        contact_phone: formData.contact_phone,
        detail: formData.detail,
        city: formData.city,
        province: formData.province,
        country: formData.country,
        zip_code: formData.zip_code,
        is_default: isFirstAddress
      }
      
      console.log('Creating address data:', addressData)
      
      const newAddress = await createUserAddress(addressData)
      console.log('Address created successfully:', newAddress)
      
      ElMessage.success('Address created successfully')
    }
    
    // 刷新地址列表以获取最新的地址信息
    await loadUserAddresses()
    
    // 关闭对话框
    showAddressForm.value = false
    closeAddressForm()
  } catch (error) {
    console.error('Failed to save address:', error)
    ElMessage.error('Failed to save address')
  }
}

/**
 * 处理地址弹窗关闭
 */
const handleAddressDialogClose = () => {
  closeAddressForm()
}

/**
 * 删除地址
 */
const deleteAddress = (address: UserAddress) => {
  ElMessageBox.confirm(
    `Are you sure you want to delete this address?<br><strong>${address.first_name} ${address.last_name}</strong><br>${address.detail}`,
    'Delete Address',
    {
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      type: 'warning',
      dangerouslyUseHTMLString: true,
      confirmButtonClass: 'el-button--danger'
    }
  ).then(async () => {
    try {
      console.log('Deleting address:', address.id)
      
      await deleteUserAddress(address.id)
      
      ElMessage.success('Address deleted successfully')
      
      // 刷新地址列表
      await loadUserAddresses()
    } catch (error) {
      console.error('Failed to delete address:', error)
      ElMessage.error('Failed to delete address')
    }
  }).catch(() => {
    // 用户取消删除，无需处理
  })
}

/**
 * 触发文件选择
 */
const triggerFileUpload = () => {
  fileInputRef.value?.click()
}

/**
 * 处理头像上传
 */
const handleAvatarUpload = async (event: Event) => {
  const file = handleFileSelect(event)
  if (!file) return

  try {
    // 上传图片并获取image_id
    const imageId = await uploadAvatar(file)
    
    // 更新用户头像
    await updateProfile({ avatar: imageId })
    
  } catch (error) {
    console.error('Failed to update avatar:', error)
  }
}

/**
 * 处理Top-up充值
 */
const handleTopUp = async () => {
  if (!topUpFormRef.value) return
  
  try {
    // 验证表单
    const valid = await topUpFormRef.value.validate()
    if (!valid) return
    
    // 充值
    await performTopUp(topUpForm.value.redeemCode)
    
    // 充值成功后关闭弹窗并重置表单
    showTopUpDialog.value = false
    topUpForm.value.redeemCode = ''
    topUpFormRef.value.resetFields()
    
    // 重新加载支付账户信息
    await loadPayAccount()
    
  } catch (error) {
    // 错误已经在performTopUp中处理了
    console.error('Top-up failed:', error)
  }
}

/**
 * 取消Top-up充值
 */
const handleTopUpCancel = () => {
  showTopUpDialog.value = false
  topUpForm.value.redeemCode = ''
  if (topUpFormRef.value) {
    topUpFormRef.value.resetFields()
  }
}

/**
 * 处理退出登录
 */
const handleLogout = () => {
  ElMessageBox.confirm('Are you sure you want to logout?', 'Confirmation', {
    confirmButtonText: 'Confirm',
    cancelButtonText: 'Cancel',
    type: 'warning',
  }).then(async () => {
    try {
      // 调用退出登录API
      await logout()
      ElMessage.success('Logout successful')
      // 跳转到登录页面
      router.push({ name: 'CustomerLogin' })
    } catch (error) {
      // API调用失败，但本地状态已经清除，仍然跳转到登录页
      console.error('Logout API failed:', error)
      ElMessage.warning('Logout request failed, but local login state has been cleared')
      router.push({ name: 'CustomerLogin' })
    }
  }).catch(() => {
    // 用户取消，无需处理
  })
}
</script>

<style scoped>
.profile-page {
  max-width: 1000px;
  margin: 0 auto;
  padding: 24px;
  min-height: 100vh;
}

.loading-container {
  text-align: center;
  padding: 60px;
  color: #666;
  background: white;
  border-radius: 12px;
  margin: 40px 0;
}

.loading-container .el-icon {
  font-size: 2rem;
  margin-right: 10px;
}

.error-container {
  text-align: center;
  padding: 60px;
  color: #dc3545;
  background: white;
  border-radius: 12px;
  margin: 40px 0;
}

.error-container .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

.error-container .el-button--primary:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

.profile-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header Card */
.profile-header-card {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.page-title {
  font-size: 24px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 24px 0;
}

.user-info-card {
  display: flex;
  align-items: center;
  gap: 20px;
}

.avatar-section {
  flex-shrink: 0;
}

.avatar-container {
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
  border-radius: 50%;
  width: 86px;
  height: 86px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-container:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 25px rgba(199, 93, 53, 0.3);
  border-radius: 50%;
}

.avatar-upload-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
  color: white;
}

.avatar-container:hover .avatar-upload-overlay {
  opacity: 1;
}

.avatar-upload-overlay.uploading {
  opacity: 1;
  background: rgba(0, 0, 0, 0.8);
}

.upload-loading {
  display: flex;
  align-items: center;
  justify-content: center;
}

.user-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e1e8ed;
}

.default-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: #f0f2f5;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #8c9197;
  border: 3px solid #e1e8ed;
}

.user-details {
  flex-grow: 1;
}

.user-name-section {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.user-name.placeholder-name {
  color: #8c9197;
  font-style: italic;
  font-weight: 400;
}

.user-name.placeholder-name:hover {
  color: #d97706;
}

.user-id {
  font-size: 12px;
  font-weight: 400;
  color: #9ca3af;
  font-style: normal;
}

.name-edit-container {
  max-width: 300px;
}

.name-input {
  font-size: 18px;
  font-weight: 600;
}

.name-input :deep(.el-input__wrapper) {
  padding: 8px 12px;
  border: 1px solid #e1e8ed;
  border-radius: 6px;
  box-shadow: none;
  background: #fff;
}

.name-input :deep(.el-input__wrapper:hover) {
  border-color: #c75d35;
}

.name-input :deep(.el-input__wrapper.is-focus) {
  border-color: #c75d35;
  box-shadow: 0 0 0 2px rgba(199, 93, 53, 0.1);
}

.name-input :deep(.el-input__inner) {
  font-size: 18px;
  font-weight: 600;
  color: #222;
}

.user-email {
  color: #6b7280;
  font-size: 14px;
  margin: 0;
}



/* Payment Account Section */
.payment-account-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.payment-loading,
.payment-error {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 8px;
  color: #6b7280;
}

.payment-error {
  color: #dc2626;
}

.error-content {
  flex: 1;
}

.error-message {
  font-weight: 500;
  margin-bottom: 4px;
}

.error-hint {
  font-size: 12px;
  color: #6b7280;
  font-style: italic;
}

.loading-icon,
.error-icon {
  font-size: 16px;
}

.refresh-btn {
  color: #6b7280 !important;
  font-size: 14px !important;
}

.refresh-btn:hover {
  color: #c75d35 !important;
}

.payment-account-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  border: 1px solid #e1e8ed;
}

.account-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.account-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.account-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.account-value {
  font-size: 14px;
  color: #1a1a1a;
  font-weight: 600;
}

.balance-value {
  font-size: 18px;
  color: #c75d35;
  font-weight: 700;
}

.account-actions {
  display: flex;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e1e8ed;
}

.account-actions .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

.account-actions .el-button--primary:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

/* Transaction History按钮样式 */
.account-actions .transaction-history-btn {
  background: #ffffff !important;
  border-color: #dcdfe6 !important;
  color: #606266 !important;
}

.account-actions .transaction-history-btn:hover {
  background: #f5f7fa !important;
  border-color: #c0c4cc !important;
  color: #606266 !important;
}

.no-payment-account {
  text-align: center;
  padding: 40px 20px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e1e8ed;
}

.no-account-icon {
  font-size: 48px;
  color: #9ca3af;
  margin-bottom: 16px;
}

.no-account-text {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 20px 0;
}

/* Addresses Section */
.addresses-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.address-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.address-card {
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  padding: 20px;
  background: #fafbfc;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.default-address {
  border-color: #d97706;
  background: #fef3e2;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.address-name-header {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #1a1a1a;
  font-weight: 600;
  font-size: 16px;
}

.address-actions {
  display: flex;
  gap: 0px;
  justify-content: flex-end;
}

.address-actions .el-button {
  color: #4a5568 !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  padding: 2px !important;
  min-width: 36px !important;
  height: 36px !important;
}

.address-actions .el-button:hover {
  color: #2d3748 !important;
}

.address-actions .el-button:last-child:hover {
  color: #dc2626 !important;
}

.address-actions .el-icon {
  font-size: 18px !important;
  font-weight: bold !important;
}

.address-content {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
}

.address-phone {
  color: #4b5563;
  font-size: 14px;
}

.address-detail {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.4;
}

.address-detail p {
  margin: 0;
}

.address-location {
  color: #4b5563;
  font-size: 14px;
  line-height: 1.4;
}

.address-location p {
  margin: 0 0 2px 0;
}

.address-line {
  margin: 0 0 4px 0;
  color: #5f6368;
  font-size: 14px;
  line-height: 1.4;
}

.default-badge {
  background: #c75d35;
  color: white;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
  margin-top: 8px;
}

.default-badge-inline {
  background: #c75d35;
  color: white;
  font-size: 10px;
  padding: 2px 6px;
  border-radius: 12px;
  font-weight: 500;
  display: inline-block;
  white-space: nowrap;
}

.add-address-card {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 40px 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafbfc;
  transition: all 0.2s;
  min-height: 150px;
  height: auto;
}

.add-address-card:hover {
  border-color: #c75d35;
  background: #faf6f3;
}

.add-address-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: 1px solid #c75d35 !important;
  background: none !important;
  color: #c75d35 !important;
  font-size: 14px;
}

.add-address-btn:hover {
  background: #c75d35 !important;
  color: white !important;
}

.add-address-btn span {
  color: inherit;
}

/* No Address State */
.no-address-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  background: #fafbfc;
  border: 2px dashed #d1d5db;
  border-radius: 12px;
}

.no-address-content {
  text-align: center;
  max-width: 400px;
  padding: 40px 20px;
}

.no-address-icon {
  color: #9ca3af;
  margin-bottom: 16px;
}

.no-address-title {
  color: #374151;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px 0;
}

.no-address-desc {
  color: #6b7280;
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.add-first-address-btn {
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

.add-first-address-btn:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

/* Address Form Dialog */
.address-dialog .el-dialog__header {
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.address-dialog .el-dialog__title {
  color: #1a1a1a;
  font-weight: 600;
}

.address-form {
  padding: 20px 0;
}

.form-row {
  display: flex;
  gap: 16px;
}

.form-item-half {
  flex: 1;
}

.form-item-half .el-form-item__label {
  width: 80px !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #e9ecef;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.action-buttons .el-button--danger {
  background-color: #c75d35;
  border-color: #c75d35;
  color: white;
}

.action-buttons .el-button--danger:hover {
  background-color: #b15530;
  border-color: #b15530;
}

.action-buttons .el-button--danger:active {
  background-color: #a04d2b;
  border-color: #a04d2b;
}

/* Responsive */
@media (max-width: 768px) {
  .profile-page {
    padding: 16px;
  }

  .profile-header-card,
  .details-section,
  .addresses-section,
  .action-buttons {
    padding: 20px;
  }

  .user-info-card {
    flex-direction: column;
    text-align: center;
  }

  .detail-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .detail-value-container {
    justify-content: flex-start;
  }

  .detail-value {
    text-align: left;
  }

  .address-grid {
    grid-template-columns: 1fr;
  }

  .action-buttons {
    flex-direction: column;
  }
}



.empty-address-state {
  text-align: center;
  padding: 60px 20px;
  color: #666;
  background: #fafafa;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
}

.empty-address-state h4 {
  color: #333;
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 500;
}

.empty-address-state p {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666;
}

.add-address-button {
  background: #ff6b35;
  border-color: #ff6b35;
  color: white;
}

.add-address-button:hover {
  background: #e55a2e;
  border-color: #e55a2e;
}

/* Top-up弹窗样式 */
.top-up-info {
  margin-top: 16px;
  padding: 12px 16px;
  border-radius: 6px;
}

.info-text {
  margin: 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.info-text .el-icon {
  font-size: 16px;
  color: #c75d35;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* Top-up弹窗表单样式 */
:deep(.el-dialog) {
  border-radius: 8px;
}

:deep(.el-dialog__header) {
  padding: 20px 24px 16px;
}

:deep(.el-dialog__body) {
  padding: 0 24px 20px;
}

/* Top-up弹窗关闭按钮悬浮样式 */
:deep(.el-dialog__headerbtn) {
  color: #909399;
}

:deep(.el-dialog__headerbtn:hover) {
  color: #c75d35 !important;
}

:deep(.el-dialog__headerbtn:hover .el-dialog__close) {
  color: #c75d35 !important;
}

:deep(.el-dialog .el-icon:hover) {
  color: #c75d35 !important;
}

/* 更具体的选择器覆盖Element Plus默认样式 */
:deep(.el-dialog__header .el-dialog__headerbtn:hover) {
  color: #c75d35 !important;
}

:deep(.el-dialog__header .el-dialog__headerbtn:hover svg) {
  color: #c75d35 !important;
}

/* Top-up弹窗按钮样式 */
.dialog-footer .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

.dialog-footer .el-button--primary:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

/* Cancel按钮样式 */
.dialog-footer .el-button:not(.el-button--primary) {
  background: #ffffff !important;
  border-color: #dcdfe6 !important;
  color: #606266 !important;
}

.dialog-footer .el-button:not(.el-button--primary):hover {
  background: #f5f7fa !important;
  border-color: #c0c4cc !important;
  color: #606266 !important;
}

/* Top-up弹窗输入框样式 */
:deep(.el-input__wrapper.is-focus) {
  border-color: #c75d35 !important;
  box-shadow: 0 0 0 2px #dc653a !important;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px 20px;
}
</style>
