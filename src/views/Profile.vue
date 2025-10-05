<template>
  <div class="profile-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-icon class="is-loading">
        <Loading />
      </el-icon>
      <span>Loading profile...</span>
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
            <div v-if="editingName" class="name-edit-container">
              <el-input 
                v-model="editName" 
                placeholder="Enter your name"
                class="name-input"
                @keyup.enter="saveName"
                @keyup.esc="cancelEditName"
                size="large"
              />
              <div class="name-edit-actions">
                <el-button size="small" type="primary" @click="saveName" :loading="updating">Save</el-button>
                <el-button size="small" @click="cancelEditName">Cancel</el-button>
              </div>
            </div>
            <h2 v-else 
               class="user-name" 
               :class="{ 'placeholder-name': !userProfile.name || !userProfile.name.trim() }"
               @click="startEditName">
              {{ userProfile.name && userProfile.name.trim() ? userProfile.name : 'Click to set your name' }}
            </h2>
            <p class="user-member-type">Premium Member</p>
          </div>
        </div>
      </div>

      <!-- 客户详情 -->
      <div class="details-section">
        <h3 class="section-title">Customer Details</h3>
        
        <div class="detail-row">
          <label class="detail-label">Full Name</label>
          <div class="detail-value-container">
            <span class="detail-value">{{ userProfile.name || '' }}</span>
            <el-button type="text" class="edit-btn" @click="startEditName">
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>

        <div class="detail-row">
          <label class="detail-label">Email</label>
          <div class="detail-value-container">
            <span class="detail-value">{{ userProfile.email }}</span>
            <div class="verification-badge">
              <el-icon size="20"><Check /></el-icon>
            </div>
          </div>
        </div>

        <div class="detail-row">
          <label class="detail-label">Default Address</label>
          <div class="detail-value-container">
            <span class="detail-value">
              {{ userProfile.default_address ? formatAddress(userProfile.default_address) : '' }}
            </span>
            <el-button type="text" class="edit-btn">
              <el-icon><Edit /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 地址管理 -->
      <div class="addresses-section" v-if="userProfile.default_address">
        <div class="section-header">
          <h3 class="section-title">My Addresses</h3>
        </div>

        <div class="address-grid">
          <!-- 默认地址 -->
          <div class="address-card default-address">
            <div class="address-header">
              <div class="address-type">
                <el-icon><House /></el-icon>
                <span>Home</span>
              </div>
              <div class="address-actions">
                <el-button type="text" size="small">
                  <el-icon><Edit /></el-icon>
                </el-button>
                <el-button type="text" size="small">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
            </div>
            <div class="address-content">
              <p class="address-line" v-if="userProfile.default_address.detail">
                {{ userProfile.default_address.detail }}
              </p>
              <p class="address-line" v-if="userProfile.default_address.city || userProfile.default_address.province || userProfile.default_address.zip_code">
                {{ [userProfile.default_address.city, userProfile.default_address.province, userProfile.default_address.zip_code].filter(Boolean).join(', ') }}
              </p>
              <p class="address-line" v-if="userProfile.default_address.country">
                {{ userProfile.default_address.country }}
              </p>
              <div class="default-badge">Default Address</div>
            </div>
          </div>

          <!-- 添加新地址按钮 -->
          <div class="add-address-card">
            <el-button type="primary" plain class="add-address-btn">
              <el-icon><Plus /></el-icon>
              <span>Add New Address</span>
            </el-button>
          </div>
        </div>
      </div>

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
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox, ElMessage, ElButton, ElIcon, ElInput } from 'element-plus'
import { Loading, User, Edit, Check, House, Delete, Plus, Camera } from '@element-plus/icons-vue'
import { logout } from '../api/auth'
import { useUserProfile } from '../composables/useUserProfile'
import { useImageUpload } from '../composables/useImageUpload'
import { getAvatarUrl } from '../utils/image'
import type { UserAddress } from '../types/api'

const router = useRouter()

// 使用用户资料 composable
const { userProfile, loading, updating, error, loadUserProfile, updateProfile } = useUserProfile()

// 使用图片上传 composable
const { uploading: uploadingImage, uploadAvatar, handleFileSelect } = useImageUpload()

// 编辑状态
const editingName = ref(false)
const editName = ref('')

// 文件上传引用
const fileInputRef = ref<HTMLInputElement>()

/**
 * 格式化地址显示
 */
const formatAddress = (address: UserAddress): string => {
  if (!address) return ''
  
  const parts = [
    address.detail?.trim(),
    address.city?.trim(),
    address.province?.trim(),
    address.zip_code?.trim(),
    address.country?.trim()
  ].filter(part => part && part.length > 0)
  
  return parts.join(', ')
}

/**
 * 开始编辑姓名
 */
const startEditName = () => {
  editName.value = userProfile.value?.name || ''
  editingName.value = true
}

/**
 * 保存姓名
 */
const saveName = async () => {
  const trimmedName = editName.value.trim()
  await updateProfile({ name: trimmedName })
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
  background: #f5f5f5;
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
  transition: transform 0.2s;
}

.avatar-container:hover {
  transform: scale(1.05);
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

.user-name {
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
  cursor: pointer;
  transition: color 0.2s;
}

.user-name.placeholder-name {
  color: #8c9197;
  font-style: italic;
  font-weight: 400;
}

.user-name.placeholder-name:hover {
  color: #1976d2;
}

.name-edit-container {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 300px;
}

.name-input {
  font-size: 20px;
  font-weight: 600;
}

.name-edit-actions {
  display: flex;
  gap: 8px;
}

.user-member-type {
  color: #8c9197;
  font-size: 14px;
  margin: 0;
}

/* Details Section */
.details-section {
  background: white;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 24px 0;
}

.detail-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 0;
  border-bottom: 1px solid #f0f2f5;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-size: 14px;
  color: #8c9197;
  font-weight: 500;
  min-width: 120px;
}

.detail-value-container {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-grow: 1;
  justify-content: flex-end;
}

.detail-value {
  color: #1a1a1a;
  font-size: 14px;
  text-align: right;
  min-height: 20px;
}

.detail-value:empty::after {
  content: '-';
  color: #d1d5db;
  font-style: italic;
}

.edit-btn {
  color: #666;
  padding: 4px;
}

.edit-btn:hover {
  color: #1976d2;
}

.verification-badge {
  color: #4caf50;
  background: #f1f8e9;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
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
}

.default-address {
  border-color: #1976d2;
  background: #f3f8ff;
}

.address-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.address-type {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1a1a1a;
  font-weight: 500;
}

.address-actions {
  display: flex;
  gap: 4px;
}

.address-content {
  position: relative;
}

.address-line {
  margin: 0 0 4px 0;
  color: #5f6368;
  font-size: 14px;
  line-height: 1.4;
}

.default-badge {
  background: #ff6b35;
  color: white;
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
  margin-top: 8px;
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
}

.add-address-card:hover {
  border-color: #1976d2;
  background: #f3f8ff;
}

.add-address-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  border: none;
  background: none;
  color: #1976d2;
  font-size: 14px;
}

.add-address-btn span {
  color: #1976d2;
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
</style>
