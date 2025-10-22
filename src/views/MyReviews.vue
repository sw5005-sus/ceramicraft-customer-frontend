
<template>
  <div class="my-reviews">
    <div class="product-comments-section">
      <div class="comments-header">
        <h2>My Reviews</h2>
        <span class="comments-count">{{ reviews.length }} review{{ reviews.length !== 1 ? 's' : '' }}</span>
      </div>
      <div v-if="loading" class="comments-loading"><p>Loading reviews...</p></div>
      <div v-else-if="error" class="comments-error"><p>{{ error }}</p></div>
      <div v-else>
        <div v-if="reviews.length > 0" class="comments-list">
          <div v-for="comment in reviews" :key="comment.id" class="comment-item minimal" @click="goToProduct(comment.product_id)">
            <div class="comment-header minimal">
              <div class="author-rating-row">
                <span class="comment-author">{{ comment.is_anonymous ? 'Anonymous' : `User ${comment.user_id}` }}</span>
                <el-rate v-model="comment.stars" :max="5" disabled size="small" :colors="['#c75d35','#c75d35','#c75d35']" class="comment-stars" />
              </div>
              <span class="comment-date">{{ formatDate(comment.created_at) }}</span>
            </div>
            <div class="comment-content minimal">
              <span>{{ comment.content }}</span>
              <div v-if="comment.pic_info && comment.pic_info.length > 0 && comment.pic_info[0]" class="comment-images minimal">
                <img v-for="(pic, index) in comment.pic_info.filter((p: string) => p && p.trim())" :key="index" :src="getImageUrl(pic)" :alt="`评论图片${index + 1}`" class="comment-image" />
              </div>
            </div>
            <div class="comment-likes minimal" @click.stop="handleLike(comment)">
              <svg class="comment-likes-icon" viewBox="0 0 24 24" width="18" height="18" :fill="comment.current_user_liked ? '#c75d35' : 'none'" :stroke="comment.current_user_liked ? 'none' : '#c75d35'" :stroke-width="comment.current_user_liked ? 0 : 2" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 1.01 4.5 2.09C13.09 4.01 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              <span class="comment-likes-count">{{ comment.likes }}</span>
            </div>
          </div>
        </div>
        <div v-else class="no-comments"><p>No reviews yet.</p></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUserComments, likeComment } from '../api/comment'
import type { Comment } from '../api/comment'
import { S3_CONFIG } from '../config/api-endpoints'

const router = useRouter()
const reviews = ref<Comment[]>([])
const loading = ref(false)
const error = ref('')

const getImageUrl = (pic: string) => {
  if (!pic) return ''
  if (pic.startsWith('http://') || pic.startsWith('https://')) return pic
  return `${S3_CONFIG.BASE_URL}${pic}`
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const handleLike = async (comment: Comment) => {
  try {
    const success = await likeComment(comment.id)
    if (success) {
      comment.current_user_liked = !comment.current_user_liked
      comment.likes += comment.current_user_liked ? 1 : -1
    }
  } catch (error) {
    console.error('Failed to like comment:', error)
  }
}

const goToProduct = (productId: number) => {
  router.push({ name: 'ProductDetail', params: { id: productId } })
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getUserComments()
    if (res.status === 0) {
      reviews.value = res.data
    } else {
      error.value = res.msg || 'Failed to fetch reviews'
    }
  } catch (e: unknown) {
    error.value = (e instanceof Error ? e.message : 'Failed to fetch reviews')
  } finally {
    loading.value = false
  }
})
</script>


<style scoped>
.my-reviews {
  padding: 32px;
  margin-top: 70px;
  max-width: 900px;
  margin-left: auto;
  margin-right: auto;
}
/* 复用 ProductDetail 评论区样式 */
.product-comments-section {
  margin-top: 0;
  padding-top: 0;
  border-top: none;
}
.comments-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 16px;
}
.comments-header h2 {
  font-size: 1.8rem;
  font-weight: 600;
  color: #333;
  margin: 0;
}
.comments-count {
  font-size: 1rem;
  font-weight: 500;
  color: #666;
  margin: 0;
}
.comments-loading, .comments-error {
  text-align: center;
  padding: 40px 20px;
}
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}
.comment-item.minimal {
  padding: 16px 20px;
  border-radius: 8px;
  border: 1px solid #f1f5f9;
  background: #fff;
  box-shadow: none;
}
.comment-header.minimal {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  gap: 12px;
}
.author-rating-row {
  display: flex;
  align-items: center;
  gap: 8px;
}
.comment-author {
  font-weight: 600;
  color: #333;
  font-size: 1rem;
}
.comment-stars {
  margin-left: 0;
  font-size: 1rem;
}
.comment-date {
  font-size: 0.85rem;
  color: #888;
}
.comment-content.minimal {
  color: #555;
  line-height: 1.6;
  font-size: 0.98rem;
  margin-bottom: 4px;
}
.comment-images.minimal {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}
.comment-image {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #e1e8ed;
}
.comment-likes.minimal {
  margin-top: 8px;
  font-size: 0.95rem;
  color: #c75d35;
  display: flex;
  align-items: center;
  gap: 4px;
  user-select: none;
}
.no-comments {
  text-align: center;
  padding: 60px 20px;
  background: #f9f9f9;
  border-radius: 8px;
}
.no-comments p {
  font-size: 1.1rem;
  color: #666;
  margin: 0;
}
</style>
