<template>
  <div class="products-page">
    <div class="products-header">
      <input class="search-input" placeholder="Enter product name" />
      <div class="sort-box">
        <span>Sort by:</span>
        <select>
          <option>Featured</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>
    </div>
    <div class="products-list">
  <div v-for="item in products" :key="item.id" class="product-card" @click="goDetail(item.id)" style="cursor:pointer;">
        <div class="product-img-box">
          <img :src="item.img" alt="product" />
          <span v-if="item.outOfStock" class="out-of-stock">OUT OF STOCK</span>
        </div>
        <div class="product-info">
          <div class="product-artist">{{ item.artist }}</div>
          <div class="product-title">{{ item.title }}</div>
          <div class="product-price">${{ item.price }}</div>
        </div>
        <button v-if="!item.outOfStock" class="add-cart-btn">ADD TO CART</button>
      </div>
    </div>
    <div class="pagination">
      <button class="page-btn">1</button>
      <button class="page-btn active">2</button>
      <button class="page-btn">3</button>
      <span>...</span>
      <button class="page-btn">7</button>
    </div>
  </div>
</template>

<script setup lang="ts">
// 默认图片
import defaultImg from '../assets/defaultimg.png'
import { useRouter } from 'vue-router'

const products = [
  { id: 1, img: defaultImg, artist: 'KIM JOO GOH', title: 'A BOTTLE OF TREATS', price: 129, outOfStock: true },
  { id: 2, img: defaultImg, artist: 'TROY LEE', title: 'A FLORAL INTERPRETATION', price: 89, outOfStock: false },
  { id: 3, img: defaultImg, artist: 'TROY LEE', title: 'A STUDY OF FORM', price: 149, outOfStock: true },
  { id: 4, img: defaultImg, artist: 'HAIROL MD H', title: 'BERDIRI TEGAP', price: 115, outOfStock: false },
  { id: 5, img: defaultImg, artist: 'SARAH WONG', title: 'CERAMIC PLATE SET', price: 75, outOfStock: false },
  { id: 6, img: defaultImg, artist: 'MIRA NAKASHIMA', title: 'CEREMONIAL TEA SET', price: 199, outOfStock: false },
  { id: 7, img: defaultImg, artist: 'AHMAD ZAKI', title: 'CONTEMPORARY VASE', price: 110, outOfStock: true },
  { id: 8, img: defaultImg, artist: 'CHEN WEI', title: 'ESSENCE BOWL', price: 65, outOfStock: false },
]

const router = useRouter()
function goDetail(id:number) {
  router.push(`/product/${id}`)
}
</script>

<style scoped>
.products-page {
  padding: 20px 0 56px 0; /* 减少顶部padding从32px到20px */
  max-width: 1200px;
  margin: 0 auto;
}
h1 {
  color: #222;
  font-size: 2.2rem;
  margin-bottom: 16px; /* 减少底部间距 */
  font-weight: 700;
  text-align: left;
}
.products-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px; /* 增加与商品列表的间距 */
}
.search-input {
  width: 350px;
  padding: 8px 12px;
  font-size: 1rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}
.sort-box {
  display: flex;
  align-items: center;
  gap: 8px;
}
.products-list {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px 16px; /* 减少行间距和列间距 */
  margin-bottom: 24px; /* 减少底部间距 */
}
.product-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 0 0 16px 0; /* 减少底部padding */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}
.product-img-box {
  width: 100%;
  aspect-ratio: 1/1;
  background: #f7f7f7;
  border-radius: 8px 8px 0 0;
  overflow: hidden;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}
.product-img-box img {
  width: 90%;
  height: 90%;
  object-fit: cover;
}
.out-of-stock {
  position: absolute;
  top: 10px;
  left: 10px;
  background: #444;
  color: #fff;
  font-size: 0.85rem;
  padding: 2px 10px;
  border-radius: 4px;
  z-index: 2;
}
.product-info {
  width: 100%;
  padding: 10px 16px 0 16px; /* 减少顶部padding */
  text-align: left;
}
.product-artist {
  font-size: 0.85rem;
  color: #888;
  margin-bottom: 2px;
}
.product-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 4px;
  color: #222;
}
.product-price {
  color: #c75d35;
  font-weight: 700;
  font-size: 1.1rem;
}
.add-cart-btn {
  margin-top: 12px; /* 减少顶部间距 */
  padding: 6px 18px;
  background: #222;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background 0.2s;
}
.add-cart-btn:hover {
  background: #c75d35;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-bottom: 24px; /* 减少底部间距 */
}
.page-btn {
  border: 1px solid #ddd;
  background: #fff;
  color: #333;
  padding: 4px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
}
.page-btn.active {
  background: #c75d35;
  color: #fff;
  border: 1px solid #c75d35;
}
</style>
