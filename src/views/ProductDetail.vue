<template>
  <div class="product-detail-page">
    <div class="product-detail-container">
      <img class="product-img" :src="product.img" alt="product" />
      <div class="product-info">
        <h2 class="product-title">{{ product.title }}</h2>
        <div class="product-artist">by {{ product.artist }}</div>
        <div class="product-price">${{ product.price }}</div>
        <div class="product-desc">{{ product.desc }}</div>
        <button class="add-cart-btn" :disabled="product.outOfStock">
          {{ product.outOfStock ? 'OUT OF STOCK' : 'ADD TO CART' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref } from 'vue'
import defaultImg from '../assets/defaultimg.png'

const route = useRoute()
const id = Number(route.params.id)

// 假数据，实际可用API获取
const products = [
  { id: 1, img: defaultImg, artist: 'KIM JOO GOH', title: 'A BOTTLE OF TREATS', price: 129, outOfStock: true, desc: '精美陶艺瓶，独特手工制作。' },
  { id: 2, img: defaultImg, artist: 'TROY LEE', title: 'A FLORAL INTERPRETATION', price: 89, outOfStock: false, desc: '花卉主题陶瓷花瓶，优雅大方。' },
  { id: 3, img: defaultImg, artist: 'TROY LEE', title: 'A STUDY OF FORM', price: 149, outOfStock: true, desc: '极简风格陶瓷盘，适合现代家居。' },
  { id: 4, img: defaultImg, artist: 'HAIROL MD H', title: 'BERDIRI TEGAP', price: 115, outOfStock: false, desc: '雕塑感花瓶，造型独特。' },
  { id: 5, img: defaultImg, artist: 'SARAH WONG', title: 'CERAMIC PLATE SET', price: 75, outOfStock: false, desc: '实用陶瓷餐盘套装。' },
  { id: 6, img: defaultImg, artist: 'MIRA NAKASHIMA', title: 'CEREMONIAL TEA SET', price: 199, outOfStock: false, desc: '日式茶具套装，品味生活。' },
  { id: 7, img: defaultImg, artist: 'AHMAD ZAKI', title: 'CONTEMPORARY VASE', price: 110, outOfStock: true, desc: '现代风格陶瓷花瓶。' },
  { id: 8, img: defaultImg, artist: 'CHEN WEI', title: 'ESSENCE BOWL', price: 65, outOfStock: false, desc: '极简陶瓷碗，适合多种用途。' },
]

const product = ref(products.find(p => p.id === id) || products[0])
</script>

<style scoped>
.product-detail-page {
  padding: 40px 0 56px 0;
  min-height: 60vh;
  display: flex;
  justify-content: center;
}
.product-detail-container {
  display: flex;
  gap: 48px;
  max-width: 900px;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  padding: 32px 40px;
  align-items: center;
}
.product-img {
  width: 320px;
  height: 320px;
  object-fit: cover;
  border-radius: 8px;
  background: #f7f7f7;
}
.product-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 18px;
}
.product-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0;
}
.product-artist {
  color: #888;
  font-size: 1rem;
}
.product-price {
  color: #c75d35;
  font-size: 1.3rem;
  font-weight: 700;
}
.product-desc {
  color: #444;
  font-size: 1.1rem;
  margin-bottom: 12px;
}
.add-cart-btn {
  padding: 10px 32px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.add-cart-btn:disabled {
  background: #aaa;
  cursor: not-allowed;
}
.add-cart-btn:not(:disabled):hover {
  background: #c75d35;
}
</style>
