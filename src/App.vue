<template>
  <component :is="layoutComponent">
    <router-view />
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppLayout from './layouts/AppLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'

const route = useRoute()
const layoutComponent = computed(() => {
  if (route.meta.layout === 'none') {
    return 'div'
  }
  if (route.path.startsWith('/auth')) {
    return AuthLayout
  }
  return AppLayout
})
</script>