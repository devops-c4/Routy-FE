<template>
  <div class="step-container">
    <div class="step-content">
      <!-- 상단 단계 -->
      <div class="step-top">
        <div class="step-number">단계 1 / 4</div>
        <button class="cancel-btn">취소</button>
      </div>

      <!-- 진행바 -->
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>

      <!-- 메인 카드 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">어디로 여행 가시나요?</h3>
          <p class="card-subtitle">여행할 지역을 선택해주세요</p>
        </div>

        <!-- 본문: 왼쪽(지역 선택) + 오른쪽(지도 영역) -->
        <div class="card-body">
          <div class="left-column">
            <h4 class="section-title">지역 선택</h4>
            <div class="city-grid">
              <div
                v-for="(city, i) in cities"
                :key="i"
                class="city-card"
                :class="{ selected: selectedCity === city }"
                @click="selectCity(city)"
              >
                {{ city }}
              </div>
            </div>
          </div>

          <div class="right-column">
            <!-- 지도 영역 placeholder -->
            <div class="map-box">
              <span>🗺️ 대한민국 지도 영역</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="button-group">
        <button class="prev-btn" disabled>이전</button>
        <button class="next-btn" :disabled="!selectedCity" @click="goNext">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import "@/assets/css/draw.css";
import "@/assets/css/step-common.css";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter();
const route = useRoute();
const cities = [
  "서울", "부산", "제주도", "강릉", "경주", "여수", "전주", "속초", "대구", "인천", "대전", "광주",
];
const selectedCity = ref(null);

// Home에서 넘어온 도시 자동 선택
onMounted(() => {
  if (route.query.city) {
    const matched = cities.find(c => route.query.city.includes(c));
    if (matched) selectedCity.value = matched;
  }
});

const selectCity = (city) => (selectedCity.value = city);
const goNext = () => router.push("/draw/second");
</script>


<style scoped>
/* 카드 헤더 */
.card-header {
  text-align: center;
  margin-bottom: 24px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0A0A0A;
}

.card-subtitle {
  color: #4A5565;
  font-size: 15px;
}

/* 카드 본문: 왼쪽(버튼) + 오른쪽(지도) */
.card-body {
  margin-top: -50px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 48px;
}

/* 왼쪽 컬럼 */
.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #4A5565;
}

/* 도시 버튼 그리드 */
.city-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr)); /* 3열 고정 */
  gap: 16px 24px; /* 세로 16px, 가로 24px 간격 */
  justify-content: center;
  width: 100%;
  max-width: 600px; /* 너무 넓어지지 않게 고정 */
  margin: 0 auto; /* 중앙 정렬 */
}

.city-card {
  height: 80px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  font-size: 16px;
  font-weight: 500;
  width: 100%; /* grid 폭에 맞춰 자동 조정 */
}
.city-card.selected {
  background: #EFF6FF;
  border: 2px solid #155DFC;
  box-shadow: 0px 0px 0px 2px #155DFC;
}


/* 오른쪽 지도 영역 */
.right-column {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.map-box {
  margin-top: 70px;
  width: 100%;
  height: 350px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: linear-gradient(135deg, #EFF6FF 0%, white 50%, #F0FDF4 100%);
  display: flex;
  justify-content: center;
  align-items: center;
  color: #4A5565;
  font-size: 14px;
}

/* 반응형 처리 */
@media (max-width: 900px) {
  .card-body {
    flex-direction: column;
    align-items: center;
  }
  .right-column {
    width: 100%;
  }
  .map-box {
    height: 250px;
  }
}
</style>
