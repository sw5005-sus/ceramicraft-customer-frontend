import { ref } from 'vue';
import { ElMessage } from 'element-plus';
import { getImageUploadUrl, uploadImageToUrl } from '../api/image';

export const useImageUpload = () => {
  const uploading = ref(false);
  const uploadProgress = ref(0);

  /**
   * 上传头像图片
   */
  const uploadAvatar = async (file: File): Promise<string> => {
    try {
      uploading.value = true;
      uploadProgress.value = 0;

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Please select a valid image file (JPG, PNG, or GIF)');
      }

      // 验证文件大小 (5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        throw new Error('Image file size should be less than 5MB');
      }

      uploadProgress.value = 20;

      // 获取文件扩展名
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      
      console.log('Getting upload URL for image type:', fileExtension);

      // 1. 获取上传URL
      const uploadInfo = await getImageUploadUrl(fileExtension);
      console.log('Got upload info:', uploadInfo);

      uploadProgress.value = 40;

      // 2. 上传图片到获取的URL
      await uploadImageToUrl(uploadInfo.upload_url, file);
      console.log('Image uploaded successfully');

      uploadProgress.value = 100;

      // 3. 返回image_id，这个应该是最终的头像URL
      return uploadInfo.image_id;

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      ElMessage.error(errorMessage);
      console.error('Upload avatar error:', error);
      throw error;
    } finally {
      uploading.value = false;
      uploadProgress.value = 0;
    }
  };

  /**
   * 处理文件选择
   */
  const handleFileSelect = (event: Event): File | null => {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    
    if (!file) {
      return null;
    }

    return file;
  };

  return {
    uploading,
    uploadProgress,
    uploadAvatar,
    handleFileSelect,
  };
};
