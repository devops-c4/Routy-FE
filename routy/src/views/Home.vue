<template>
  <div class="main-container">
    <!-- 메인 섹션 -->
    <main class="main-section">
      <!-- 메인 로고 -->
      <img :src="mainLogo" alt="main logo" style="width: 240px; height: auto; margin-bottom: -50px;" />
      <h2 class="main-title">루티와 함께라면, 여행 루트가 더 쉬워져요</h2>

      <!-- 검색창 -->
      <div class="search-box">
        <div class="search-input">
          <input type="text" placeholder="국내 도시, 지역 또는 여행지를 검색하세요" />
        </div>
        <button class="search-btn">검색</button>
      </div>

      <!-- 인기 여행지 -->
      <div class="popular">
        <span class="label">인기 여행지:</span>
        <div class="tags">
          <span>서울</span>
          <span>부산</span>
          <span>제주</span>
          <span>경주</span>
          <span>강릉</span>
          <span>전주</span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import mainLogo from '/images/icons/main-logo.png'
<<<<<<< HEAD
=======
import "@/assets/css/home.css"; 
>>>>>>> 9ae43b7544f029e2e938033a05a61b5a3cc78724
</script>

<style scoped>
.main-container {
  position: relative;
  width: 100%;
  min-height: 955px;
  background: linear-gradient(135deg, #eff6ff 0%, white 50%, #f0fdf4 100%);
  font-family: Inter, sans-serif;
  color: #101828;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 메인 섹션 */
.main-section {
  width: 100%;
  text-align: center;
  margin-top: 60px;
}

.main-title {
  font-size: 24px;
  margin-top: -20px;
  margin-bottom: 40px;
  color: #101828;
}

/* 검색창 */
.search-box {
  width: 768px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}

.search-input input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 18px;
  color: #99a1af;
  padding: 12px 16px;
}

.search-btn {
  background: #155dfc;
  color: white;
  font-weight: 500;
  font-size: 14px;
  border: none;
  border-radius: 9999px;
  padding: 14px 40px;
  cursor: pointer;
}

/* 인기 여행지 */
.popular {
  margin-top: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  color: #4a5565;
  font-size: 14px;
}

.tags {
  display: flex;
  gap: 8px;
}

.tags span {
  background: white;
  border: 1px solid #d1d5dc;
  border-radius: 9999px;
  padding: 8px 16px;
  color: #0a0a0a;
}
</style>