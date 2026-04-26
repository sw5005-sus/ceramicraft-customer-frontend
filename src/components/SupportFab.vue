<template>
  <a
    :href="supportUrl"
    target="_blank"
    rel="noopener"
    class="support-fab"
    :aria-label="label"
    :title="label"
  >
    <svg
      class="support-fab__icon"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        fill="currentColor"
        d="M12 2a10 10 0 0 0-10 10v5a3 3 0 0 0 3 3h2v-8H4v0a8 8 0 0 1 16 0h-3v8h2a3 3 0 0 0 3-3v-5A10 10 0 0 0 12 2m-5 12h2v6H7zm8 0h2v6h-2z"
      />
    </svg>
    <span class="support-fab__text">{{ label }}</span>
  </a>
</template>

<script setup lang="ts">
/**
 * Floating button that opens the Customer Support portal in a new tab.
 * The support site shares the same Zitadel tenant, so SSO is handled by
 * Zitadel session cookie — no token forwarding required.
 */

interface Props {
  label?: string
}

withDefaults(defineProps<Props>(), {
  label: 'Support',
})

const supportUrl = import.meta.env.VITE_SUPPORT_URL ?? 'https://support.ntdoc.site'
</script>

<style scoped>
.support-fab {
  position: fixed;
  right: 24px;
  bottom: 72px; /* stay clear of the 48px footer */
  z-index: 999;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 18px;
  background: #c75d35;
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: 999px;
  box-shadow: 0 6px 16px rgba(199, 93, 53, 0.35);
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  cursor: pointer;
}

.support-fab:hover {
  background: #a64d2a;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(199, 93, 53, 0.45);
}

.support-fab:focus-visible {
  outline: 2px solid #fff;
  outline-offset: 2px;
}

.support-fab__icon {
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .support-fab {
    padding: 14px;
    bottom: 64px;
    right: 16px;
  }
  .support-fab__text {
    display: none;
  }
}
</style>
