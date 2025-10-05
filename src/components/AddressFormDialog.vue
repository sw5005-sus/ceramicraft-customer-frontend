<template>
  <el-dialog 
    :model-value="visible"
    @update:model-value="(val) => emit('update:visible', val)"
    :title="title" 
    width="600px"
    @close="handleClose"
  >
    <el-form :model="formData" label-width="120px" class="address-form">
      <div class="form-row">
        <el-form-item label="First Name" class="form-item-half">
          <el-input v-model="formData.first_name" placeholder="Enter first name" />
        </el-form-item>
        <el-form-item label="Last Name" class="form-item-half">
          <el-input v-model="formData.last_name" placeholder="Enter last name" />
        </el-form-item>
      </div>
      
      <el-form-item label="Phone Number">
        <el-input v-model="formData.contact_phone" placeholder="Enter phone number" />
      </el-form-item>
      
      <el-form-item label="Address Detail">
        <el-input 
          v-model="formData.detail" 
          type="textarea" 
          placeholder="Enter detailed address"
          :rows="3"
        />
      </el-form-item>
      
      <div class="form-row">
        <el-form-item label="City" class="form-item-half">
          <el-input v-model="formData.city" placeholder="Enter city" />
        </el-form-item>
        <el-form-item label="Province" class="form-item-half">
          <el-input v-model="formData.province" placeholder="Enter province" />
        </el-form-item>
      </div>
      
      <div class="form-row">
        <el-form-item label="Country" class="form-item-half">
          <el-input v-model="formData.country" placeholder="Enter country" />
        </el-form-item>
        <el-form-item label="Zip Code" class="form-item-half">
          <el-input v-model="formData.zip_code" placeholder="Enter zip code" />
        </el-form-item>
      </div>
    </el-form>
    
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">Cancel</el-button>
        <el-button type="primary" @click="handleSave" :loading="loading">
          {{ saveButtonText }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton, ElMessage } from 'element-plus'
import type { UserAddress } from '../types/api'

// Props
interface Props {
  visible: boolean
  isEditMode: boolean
  loading?: boolean
  addressData?: UserAddress | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  addressData: null
})

// Emits
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'save', data: AddressFormData): void
  (e: 'close'): void
}

const emit = defineEmits<Emits>()

// Form data interface
export interface AddressFormData {
  first_name: string
  last_name: string
  contact_phone: string
  detail: string
  city: string
  province: string
  country: string
  zip_code: string
}

// Form data
const formData = ref<AddressFormData>({
  first_name: '',
  last_name: '',
  contact_phone: '',
  detail: '',
  city: '',
  province: '',
  country: '',
  zip_code: ''
})

// Computed properties
const title = computed(() => props.isEditMode ? 'Edit Address' : 'Create Address')
const saveButtonText = computed(() => props.isEditMode ? 'Update Address' : 'Create Address')

// Watch for address data changes (for edit mode)
watch(() => props.addressData, (newData) => {
  if (newData && props.isEditMode) {
    formData.value = {
      first_name: newData.first_name,
      last_name: newData.last_name,
      contact_phone: newData.contact_phone,
      detail: newData.detail,
      city: newData.city,
      province: newData.province,
      country: newData.country,
      zip_code: newData.zip_code
    }
  }
}, { immediate: true })

// Watch for visible changes to reset form when closing
watch(() => props.visible, (newVisible) => {
  if (!newVisible && !props.isEditMode) {
    resetForm()
  }
})

// Methods
const resetForm = () => {
  formData.value = {
    first_name: '',
    last_name: '',
    contact_phone: '',
    detail: '',
    city: '',
    province: '',
    country: '',
    zip_code: ''
  }
}

const validateForm = (): boolean => {
  if (!formData.value.first_name.trim() || !formData.value.last_name.trim()) {
    ElMessage.error('First name and last name are required')
    return false
  }
  
  if (!formData.value.contact_phone.trim()) {
    ElMessage.error('Contact phone is required')
    return false
  }
  
  if (!formData.value.detail.trim()) {
    ElMessage.error('Address detail is required')
    return false
  }
  
  return true
}

const handleSave = () => {
  if (!validateForm()) return
  
  // Trim all string values
  const trimmedData: AddressFormData = {
    first_name: formData.value.first_name.trim(),
    last_name: formData.value.last_name.trim(),
    contact_phone: formData.value.contact_phone.trim(),
    detail: formData.value.detail.trim(),
    city: formData.value.city.trim(),
    province: formData.value.province.trim(),
    country: formData.value.country.trim(),
    zip_code: formData.value.zip_code.trim()
  }
  
  emit('save', trimmedData)
}

const handleClose = () => {
  emit('update:visible', false)
  emit('close')
  if (!props.isEditMode) {
    resetForm()
  }
}
</script>

<style scoped>
.address-form {
  padding: 20px 0;
}

.form-row {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
}

.form-row .el-form-item {
  flex: 1;
  margin-bottom: 0;
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

.dialog-footer .el-button--primary {
  background: #c75d35 !important;
  border-color: #c75d35 !important;
}

.dialog-footer .el-button--primary:hover {
  background: #a84a2a !important;
  border-color: #a84a2a !important;
}

/* 输入框选中高亮样式 */
.address-form :deep(.el-input__wrapper) {
  transition: all 0.3s;
}

.address-form :deep(.el-input__wrapper:focus-within) {
  border-color: #c75d35 !important;
  box-shadow: 0 0 0 1px #c75d35 !important;
}

.address-form :deep(.el-textarea__inner:focus) {
  border-color: #c75d35 !important;
  box-shadow: 0 0 0 1px #c75d35 !important;
}

.address-form :deep(.el-input.is-focus .el-input__wrapper) {
  border-color: #c75d35 !important;
  box-shadow: 0 0 0 1px #c75d35 !important;
}

.address-form :deep(.el-textarea.is-focus .el-textarea__inner) {
  border-color: #c75d35 !important;
  box-shadow: 0 0 0 1px #c75d35 !important;
}
</style>
