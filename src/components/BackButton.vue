<template>
  <button 
    class="back-button"
    @click="handleBack"
    :disabled="disabled"
  >
    <el-icon class="back-icon">
      <ArrowLeft />
    </el-icon>
    <span class="back-text">{{ text }}</span>
  </button>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

interface Props {
  text?: string
  to?: string | object
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  text: 'Back',
  disabled: false
})

const router = useRouter()

const handleBack = () => {
  if (props.disabled) return
  
  if (props.to) {
    // 如果指定了目标路径，导航到该路径
    router.push(props.to)
  } else {
    // 否则返回上一页
    router.back()
  }
}
</script>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: transparent;
  border: 1px solid #e1e8ed;
  border-radius: 8px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.back-button:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #c75d35;
  color: #c75d35;
}

.back-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.back-icon {
  font-size: 16px;
  transition: transform 0.2s ease;
}

.back-button:hover:not(:disabled) .back-icon {
  transform: translateX(-2px);
}

.back-text {
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .back-button {
    padding: 6px 12px;
    font-size: 13px;
  }
  
  .back-icon {
    font-size: 14px;
  }
}
</style>
