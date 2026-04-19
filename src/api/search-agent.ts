import apiClient from './api'
import { SEARCH_AGENT_ENDPOINTS } from '../config/api-endpoints'
import { userManager } from '../auth/zitadel'

// ===== Types =====

export interface ProductSearchItem {
  id: number
  name: string
  category: string
  price: number
  desc: string
  stock: number
  pic_info: string
  status: number
  material: string | null
  style: string | null
  origin: string | null
  occasion: string | null
  tags: string | null
  score: number
}

export interface SearchResponse {
  code: number
  query: string
  total: number
  products: ProductSearchItem[]
  recommendation: string | null
  hint: string
}

export interface SuggestionItem {
  keyword: string
  reason: string
  type: string
}

export interface SuggestionResponse {
  code: number
  userId: string | null
  suggestions: SuggestionItem[]
  source: string
}

// ===== REST APIs (via axios, auth auto-injected) =====

export const semanticSearch = (query: string, limit = 10): Promise<SearchResponse> =>
  apiClient.get(SEARCH_AGENT_ENDPOINTS.SEARCH, { params: { query, limit } }).then(r => r.data)

export const ragSearch = (query: string, limit = 5): Promise<SearchResponse> =>
  apiClient.get(SEARCH_AGENT_ENDPOINTS.RAG, { params: { query, limit } }).then(r => r.data)

export const findSimilarProducts = (productName: string, limit = 5): Promise<SearchResponse> =>
  apiClient.get(SEARCH_AGENT_ENDPOINTS.SIMILAR, { params: { productName, limit } }).then(r => r.data)

export const getSearchHistory = (limit = 10): Promise<{ history: string[] }> =>
  apiClient.get(SEARCH_AGENT_ENDPOINTS.HISTORY, { params: { limit } }).then(r => r.data)

export const clearSearchHistory = (): Promise<void> =>
  apiClient.delete(SEARCH_AGENT_ENDPOINTS.HISTORY).then(() => {})

export const getHotSearches = (limit = 10): Promise<{ hotSearches: string[] }> =>
  apiClient.get(SEARCH_AGENT_ENDPOINTS.HOT, { params: { limit } }).then(r => r.data)

export const getSuggestions = (limit = 8): Promise<SuggestionResponse> =>
  apiClient.get(SEARCH_AGENT_ENDPOINTS.SUGGESTIONS, { params: { limit } }).then(r => r.data)

// ===== SSE streaming via fetch (supports Authorization header) =====

async function getAuthToken(): Promise<string | null> {
  try {
    const user = await userManager.getUser()
    return user && !user.expired ? user.access_token : null
  } catch {
    return null
  }
}

export interface SSECallbacks {
  onToken: (token: string) => void
  onComplete?: () => void
  onError?: (error: string) => void
}

export async function streamSSE(url: string, callbacks: SSECallbacks): Promise<AbortController> {
  const controller = new AbortController()
  const token = await getAuthToken()
  const baseUrl = import.meta.env.VITE_API_BASE_URL as string
  const headers: Record<string, string> = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  fetch(`${baseUrl}${url}`, { headers, signal: controller.signal })
    .then(async (response) => {
      if (!response.ok) {
        callbacks.onError?.(`HTTP ${response.status}`)
        return
      }
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        for (const line of lines) {
          if (line.startsWith('event:complete') || line.includes('[DONE]')) {
            callbacks.onComplete?.()
            return
          }
          if (line.startsWith('event:error')) {
            continue
          }
          if (line.startsWith('data:')) {
            const data = line.slice(5)
            if (data && data !== '[DONE]') {
              callbacks.onToken(data)
            }
          }
        }
      }
      callbacks.onComplete?.()
    })
    .catch((err) => {
      if (err.name !== 'AbortError') {
        callbacks.onError?.(err.message)
      }
    })

  return controller
}

export function streamRagSearch(query: string, limit = 5, callbacks: SSECallbacks): Promise<AbortController> {
  return streamSSE(
    `${SEARCH_AGENT_ENDPOINTS.RAG_STREAM}?query=${encodeURIComponent(query)}&limit=${limit}`,
    callbacks
  )
}

export function streamIntent(query: string, callbacks: SSECallbacks): Promise<AbortController> {
  return streamSSE(
    `${SEARCH_AGENT_ENDPOINTS.INTENT_STREAM}?query=${encodeURIComponent(query)}`,
    callbacks
  )
}
