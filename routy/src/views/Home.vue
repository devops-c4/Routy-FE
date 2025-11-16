<template>
  <div class="main-container">
    <main class="main-section">
      <img :src="mainLogo" alt="main logo"
           style="width: 240px; height: auto; margin-bottom: -50px;" />
      <h2 class="main-title">루티와 함께라면, 여행 루트가 더 쉬워져요</h2>

      <!-- 검색창 -->
      <div class="search-box">
        <div class="search-input">
          <input
            v-model="keyword"
            type="text"
            placeholder="국내 도시, 지역을 검색해보세요"
            @keyup.enter="goSearch"
          />
        </div>
        <button class="search-btn" @click="goSearch">검색</button>
      </div>

      <!-- 인기 여행지 -->
      <div class="popular">
        <span class="label">인기 여행지:</span>
        <div class="tags">
          <span
            v-for="city in popularCities"
            :key="city"
            @click="goSearch(city)"
            class="tag"
          >
            {{ city }}
          </span>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import mainLogo from "@/assets/images/icons/home-logo.png";

const router = useRouter();
const keyword = ref("");
const popularCities = ["서울", "부산", "제주", "경주", "강릉", "전주"];

const goSearch = (city) => {
  const targetCity = typeof city === "string" ? city : keyword.value;
  if (!targetCity) return;
  router.push({ path: "/draw/first", query: { city: targetCity } });
};
</script>

<style>
/* 💡 Scoped가 없으므로 전역에 적용됩니다. */
html, body {
  margin: 0;
  padding: 0;
  overflow-x: hidden;
}

*, *::before, *::after {
  box-sizing: border-box;
}
</style>

<style scoped>
/* 메인 컨테이너 */
/* 메인 컨테이너 */
.main-container {
  width: 100%;
  min-height: 870px;
  background: linear-gradient(135deg, #eff6ff 0%, white 50%, #f0fdf4 100%);
  font-family: Inter, sans-serif;
  color: #101828;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  /* 💡 혹시 모를 오버플로우를 컨테이너 레벨에서 숨김 */
  overflow-x: hidden;
}

/* 검색창 */
.search-box {
  width: 100%;
  max-width: 768px;
  margin: 0 auto;
  background: white;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
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

.search-input {
  flex: 1; /* 남은 공간 전부 차지 */
  min-width: 0; /* flex 아이템이 축소될 수 있게 */
}

.search-input input {
  width: 100%;
  border: none;
  outline: none;
  font-size: 18px;
  color: #101828; /* 입력 텍스트 진한 색으로 */
  padding: 12px 16px;
}

.search-input input::placeholder {
  color: #99a1af; /* placeholder만 회색 */
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
  flex-shrink: 0; /* 버튼이 줄어들지 않게 */
  transition: 0.2s;
}

.search-btn:hover {
  background: #1348d4;
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

.tag {
  background: white;
  border: 1px solid #d1d5dc;
  border-radius: 9999px;
  padding: 8px 16px;
  color: #0a0a0a;
  cursor: pointer;
  transition: 0.2s;
}

.tag:hover {
  background: #eff6ff;
  border-color: #155dfc;
}
</style>