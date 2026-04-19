import { ref } from 'vue'
import {
  semanticSearch,
  streamRagSearch,
  streamIntent,
  getSearchHistory,
  getHotSearches,
  type ProductSearchItem,
  type SSECallbacks,
} from '../api/search-agent'
import { getProductList } from '../api/product'
import type { Product } from '../api/product'

export function useAiSearch() {
  const aiProducts = ref<ProductSearchItem[]>([])
  const aiRecommendation = ref('')
  const aiRecommendationLoading = ref(false)
  const intentResult = ref<Record<string, unknown> | null>(null)
  const searchHistory = ref<string[]>([])
  const hotSearches = ref<string[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  let ragController: AbortController | null = null
  let intentController: AbortController | null = null

  function cancelStreams() {
    ragController?.abort()
    intentController?.abort()
    ragController = null
    intentController = null
  }

  async function doSearch(query: string, fallbackProducts: (p: Product[]) => void) {
    if (!query.trim()) return
    cancelStreams()
    loading.value = true
    error.value = null
    aiRecommendation.value = ''
    aiRecommendationLoading.value = true
    intentResult.value = null

    // 1. Fast semantic search (200ms) — with fallback to product-ms
    try {
      const result = await semanticSearch(query, 10)
      if (result.code === 200) {
        aiProducts.value = result.products
      } else {
        throw new Error(result.hint)
      }
    } catch {
      // Fallback to original product-ms
      try {
        const fallback = await getProductList({ keyword: query })
        fallbackProducts(fallback.list)
        aiProducts.value = []
      } catch (e2) {
        error.value = e2 instanceof Error ? e2.message : 'Search failed'
      }
    } finally {
      loading.value = false
    }

    // 2. Streaming RAG recommendation (typewriter effect)
    const ragCallbacks: SSECallbacks = {
      onToken(token) {
        aiRecommendation.value += token
      },
      onComplete() {
        aiRecommendationLoading.value = false
      },
      onError() {
        aiRecommendationLoading.value = false
      },
    }
    ragController = await streamRagSearch(query, 5, ragCallbacks)

    // 3. Streaming intent parsing
    let intentBuffer = ''
    const intentCallbacks: SSECallbacks = {
      onToken(token) {
        intentBuffer += token
      },
      onComplete() {
        try {
          intentResult.value = JSON.parse(intentBuffer)
        } catch {
          intentResult.value = null
        }
      },
      onError() {
        intentResult.value = null
      },
    }
    intentController = await streamIntent(query, intentCallbacks)
  }

  async function loadSearchContext() {
    try {
      const [historyRes, hotRes] = await Promise.allSettled([
        getSearchHistory(10),
        getHotSearches(10),
      ])
      if (historyRes.status === 'fulfilled') {
        searchHistory.value = historyRes.value.history || []
      }
      if (hotRes.status === 'fulfilled') {
        hotSearches.value = hotRes.value.hotSearches || []
      }
    } catch {
      // Non-critical, ignore
    }
  }

  return {
    aiProducts,
    aiRecommendation,
    aiRecommendationLoading,
    intentResult,
    searchHistory,
    hotSearches,
    loading,
    error,
    doSearch,
    loadSearchContext,
    cancelStreams,
  }
}
