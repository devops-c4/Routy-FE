<template>
  <div class="home-container">
    <!-- 메인 섹션 -->
    <section class="main-section">
      <h1 class="title">여행 루트 둘러보기</h1>
      <p class="subtitle">다른 사람의 루트 속에서, 당신의 다음 여행을 찾아보세요</p>

      <!-- 카드 리스트 -->
      <div class="card-grid">
        <TravelCard
          v-for="(route, idx) in routes"
          :key="idx"
          :city="route.city"
          :date="route.date"
          :title="route.title"
          :user="route.user"
          :days="route.days"
          :likes="route.likes"
          :views="route.views"
          :shares="route.shares"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import TravelCard from "@/components/Travelcard.vue";

const routes = [
  {
    city: "제주도",
    date: "11월 2일",
    title: "제주도 힐링 3박4일 완벽 가이드",
    user: "여행러버",
    days: "4일",
    likes: 1245,
    views: 8932,
    shares: 456,
  },
  {
    city: "부산",
    date: "11월 1일",
    title: "부산 감성 여행 (해운대+광안리)",
    user: "부산토박이",
    days: "3일",
    likes: 2103,
    views: 12847,
    shares: 892,
  },
  {
    city: "서울",
    date: "10월 31일",
    title: "서울 핫플 투어 2일",
    user: "서울러",
    days: "2일",
    likes: 1876,
    views: 15234,
    shares: 721,
  },
];
</script>

<style scoped>

body {
  margin: 0;
  color: #0a0a0a;
}

.home-container {
  width: 100%;
  min-height: 100vh;
}

/* 메인 섹션 */
.main-section {
  text-align: center;
  margin-top: 100px;
}

.title {
  font-size: 36px;
  font-weight: 600;
}

.subtitle {
  font-size: 18px;
  color: #4a5565;
  margin-top: 8px;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(380px, 1fr));
  gap: 32px;
  justify-content: center;
  margin: 60px auto;
  width: 80%;
}
</style>
