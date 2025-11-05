<template>
  <div class="main-container">
    <Header />

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
import "@/assets/css/home.css"; 
</script>