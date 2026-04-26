<template>
  <div v-if="errorMessage" class="intent-panel intent-panel--error" role="status">
    <span class="intent-panel__label">🤖 AI:</span>
    <span class="intent-panel__error-text">{{ errorMessage }}</span>
  </div>

  <div v-else-if="badges.length > 0" class="intent-panel" role="status" aria-live="polite">
    <div class="intent-panel__header">
      <span class="intent-panel__label">🤖 AI understood</span>
      <span v-if="confidencePercent !== null" class="intent-panel__confidence">
        confidence {{ confidencePercent }}%
      </span>
      <button
        v-if="showToggle"
        type="button"
        class="intent-panel__toggle"
        :aria-expanded="expanded"
        @click="expanded = !expanded"
      >
        {{ expanded ? 'Hide JSON' : 'View JSON' }}
      </button>
    </div>

    <div class="intent-panel__badges">
      <span
        v-for="badge in badges"
        :key="badge.key"
        class="intent-badge"
        :class="{ 'intent-badge--keyword': badge.key === 'keywords' }"
      >
        <span class="intent-badge__label">{{ badge.label }}</span>
        <span class="intent-badge__value">{{ badge.value }}</span>
      </span>
    </div>

    <pre v-if="expanded" class="intent-panel__raw">{{ rawJson }}</pre>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { isIntentError, type SearchIntentResult } from '../api/search-agent'

interface Props {
  intent: SearchIntentResult | null
  showToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showToggle: true,
})

const expanded = ref(false)

interface Badge {
  key: string
  label: string
  value: string
}

const errorMessage = computed(() =>
  isIntentError(props.intent) ? props.intent.error : null,
)

const confidencePercent = computed(() => {
  const intent = props.intent
  if (!intent || isIntentError(intent)) return null
  if (typeof intent.confidence !== 'number') return null
  return Math.round(intent.confidence * 100)
})

const badges = computed<Badge[]>(() => {
  const intent = props.intent
  if (!intent || isIntentError(intent)) return []

  const items: Badge[] = []

  if (intent.category) items.push({ key: 'category', label: 'Category', value: intent.category })
  if (intent.material) items.push({ key: 'material', label: 'Material', value: intent.material })
  if (intent.style) items.push({ key: 'style', label: 'Style', value: intent.style })
  if (intent.occasion) items.push({ key: 'occasion', label: 'Occasion', value: intent.occasion })

  const priceLabel = formatPriceRange(intent.priceRange)
  if (priceLabel) items.push({ key: 'price', label: 'Price', value: priceLabel })

  if (intent.keywords?.length) {
    items.push({ key: 'keywords', label: 'Keywords', value: intent.keywords.join(' · ') })
  }

  return items
})

const rawJson = computed(() =>
  props.intent ? JSON.stringify(props.intent, null, 2) : '',
)

function formatPriceRange(
  range: { min: number | null; max: number | null } | null | undefined,
): string | null {
  if (!range) return null
  const { min, max } = range
  if (min != null && max != null) return `$${min} – $${max}`
  if (min != null) return `≥ $${min}`
  if (max != null) return `≤ $${max}`
  return null
}
</script>

<style scoped>
.intent-panel {
  background: linear-gradient(135deg, #fdf6f0, #fff9f5);
  border: 1px solid #f0ddd0;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 20px;
}

.intent-panel--error {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #fff5f2;
  border-color: #f2c7b8;
}

.intent-panel__header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.intent-panel__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #c75d35;
  flex-shrink: 0;
}

.intent-panel__confidence {
  font-size: 0.75rem;
  color: #888;
  font-variant-numeric: tabular-nums;
}

.intent-panel__error-text {
  font-size: 0.9rem;
  color: #a64d2a;
}

.intent-panel__toggle {
  margin-left: auto;
  background: transparent;
  border: 1px solid #e0d0c2;
  color: #a64d2a;
  font-size: 0.75rem;
  padding: 2px 10px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.intent-panel__toggle:hover {
  background: #faefe6;
  border-color: #c75d35;
}

.intent-panel__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.intent-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 12px;
  background: #fff;
  border: 1px solid #ead8c8;
  border-radius: 16px;
  font-size: 0.85rem;
  color: #444;
  max-width: 100%;
}

.intent-badge--keyword {
  background: #fffaf3;
}

.intent-badge__label {
  color: #a64d2a;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.4px;
}

.intent-badge__value {
  color: #333;
  overflow: hidden;
  text-overflow: ellipsis;
}

.intent-panel__raw {
  margin: 10px 0 0;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid #ead8c8;
  border-radius: 6px;
  font-size: 0.8rem;
  color: #555;
  overflow-x: auto;
  max-height: 240px;
  overflow-y: auto;
}

@media (max-width: 768px) {
  .intent-panel__header {
    flex-wrap: wrap;
    gap: 8px;
  }
  .intent-panel__toggle {
    margin-left: 0;
  }
}
</style>
