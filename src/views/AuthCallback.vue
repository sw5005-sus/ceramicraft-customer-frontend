<template>
  <div class="auth-callback">
    <div v-if="error" class="error-container">
      <h2>Authentication Error</h2>
      <p>{{ error }}</p>
      <el-button type="primary" @click="goHome">Back to Home</el-button>
    </div>
    <div v-else class="loading-container">
      <el-icon class="is-loading" :size="48"><Loading /></el-icon>
      <p>{{ statusText }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { Loading } from '@element-plus/icons-vue'
import { handleCallback, silentRenew } from '../auth/zitadel'
import { request } from '../api/api'
import { API_ENDPOINTS } from '../config/api-endpoints'

const router = useRouter()
const error = ref<string | null>(null)
const statusText = ref('Signing you in...')

const goHome = () => {
  router.push('/customer/home')
}

/**
 * 检查 JWT 中是否已存在 local_userid（Zitadel metadata）
 * Zitadel 在 scope 包含 urn:zitadel:iam:user:metadata 时，
 * 会将 metadata 以 base64 编码放入 id_token / access_token 的 claim 中：
 *   "urn:zitadel:iam:user:metadata": { "local_userid": "<base64>" }
 */
const hasLocalUserId = (user: import('oidc-client-ts').User): boolean => {
  try {
    // 优先从 id_token 的 profile claim 中检查
    const metadata = user.profile?.['urn:zitadel:iam:user:metadata'] as
      | Record<string, string>
      | undefined

    if (metadata && metadata.local_userid) {
      console.log('[Auth] Found local_userid in id_token metadata')
      return true
    }

    // 如果 profile 里没有，尝试解码 access_token（JWT 格式）
    const parts = user.access_token.split('.')
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]))
      const atMetadata = payload['urn:zitadel:iam:user:metadata'] as
        | Record<string, string>
        | undefined
      if (atMetadata && atMetadata.local_userid) {
        console.log('[Auth] Found local_userid in access_token metadata')
        return true
      }
    }
  } catch (e) {
    console.warn('[Auth] Failed to parse token metadata:', e)
  }
  return false
}

onMounted(async () => {
  try {
    // 1. 完成 OIDC 登录回调，获取 access_token
    const user = await handleCallback()
    console.log('[Auth] OIDC callback completed')

    // 2. 检查 JWT 中是否已包含 local_userid
    //    有 → 跳过 oauth-callback（已注册用户，无需重复调用）
    //    无 → 调用 oauth-callback 注册用户并写入 metadata，然后刷新 JWT
    if (!hasLocalUserId(user)) {
      statusText.value = 'Setting up your account...'
      try {
        await request.post(API_ENDPOINTS.USER.OAUTH_CALLBACK, null, {
          headers: {
            Authorization: `Bearer ${user.access_token}`,
          },
        })
        console.log('[Auth] Backend oauth-callback succeeded')
      } catch (err) {
        console.warn('[Auth] Backend oauth-callback failed (user may already exist):', err)
      }

      // 静默刷新 JWT，获取包含最新 metadata 的新 token
      statusText.value = 'Refreshing session...'
      await silentRenew()
      console.log('[Auth] Token refreshed with updated metadata')
    } else {
      console.log('[Auth] local_userid already present, skipping oauth-callback')
    }

    // 3. 跳转到首页
    router.replace('/customer/home')
  } catch (err) {
    console.error('[Auth] Callback error:', err)
    error.value = 'Login failed. Please try again.'
  }
})
</script>

<style scoped>
.auth-callback {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
.loading-container,
.error-container {
  text-align: center;
}
.loading-container p,
.error-container p {
  margin-top: 16px;
  font-size: 16px;
  color: #666;
}
.error-container h2 {
  color: #f56c6c;
  margin-bottom: 12px;
}
</style>
