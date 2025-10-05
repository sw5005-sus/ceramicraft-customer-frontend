import { ref, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { getUserProfile, updateUserProfile } from '../api/user';
import type { UserProfile, UserProfileUpdate } from '../types/api';

export const useUserProfile = () => {
  const userProfile = ref<UserProfile | null>(null);
  const loading = ref(false);
  const updating = ref(false);
  const error = ref<string | null>(null);

  /**
   * 加载用户资料信息
   */
  const loadUserProfile = async () => {
    try {
      loading.value = true;
      error.value = null;
      
      console.log('Starting to load user profile...');
      const data = await getUserProfile();
      console.log('User profile loaded successfully:', data);
      userProfile.value = data;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load user profile';
      error.value = errorMessage;
      ElMessage.error('Failed to load user profile');
      console.error('Load user profile error:', err);
    } finally {
      loading.value = false;
    }
  };

  /**
   * 更新用户资料信息
   */
  const updateProfile = async (profileData: UserProfileUpdate) => {
    if (!userProfile.value) {
      ElMessage.error('No user profile to update');
      return;
    }

    try {
      updating.value = true;
      error.value = null;
      
      // 合并当前用户信息和要更新的字段，发送完整的用户信息
      const fullProfileData = {
        ...userProfile.value,
        ...profileData
      };
      
      console.log('Starting to update user profile...', fullProfileData);
      const data = await updateUserProfile(fullProfileData);
      console.log('User profile updated successfully:', data);
      
      userProfile.value = data;
      ElMessage.success('Profile updated successfully');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user profile';
      error.value = errorMessage;
      ElMessage.error('Failed to update user profile');
      console.error('Update user profile error:', err);
    } finally {
      updating.value = false;
    }
  };

  /**
   * 组件挂载时自动加载用户资料
   */
  onMounted(() => {
    loadUserProfile();
  });

  return {
    userProfile,
    loading,
    updating,
    error,
    loadUserProfile,
    updateProfile,
  };
};
