<template>
  <div class="browse-container">
    <!-- 메인 섹션 -->
    <section class="main-section">
      <h1 class="main-title">✈️실시간 인기 여행 일정✨</h1>
      <p class="main-subtitle">다른 여행자들이 공유한 일정을 확인하세요</p>

      <!-- 필터 탭 -->
      <div class="filter-tabs">
        <button class="tab-btn active">최신순</button>
        <button class="tab-btn">북마크순</button>
        <button class="tab-btn">조회순</button>
        
        <div class="filter-dropdowns">
          <select class="filter-select">
            <option value="">지역</option>
            <option 
              v-for="region in regions" 
              :key="region.regionId" 
              :value="region.regionId"
            >
              {{ region.regionName }}
            </option>
          </select>
          <select class="filter-select">
            <option value="">일정</option>
            <option value="1">1일</option>
            <option value="2">2일</option>
            <option value="3">3일</option>
            <option value="4">4일</option>
            <option value="5">5일 이상</option>
          </select>
          <span class="result-count">총 {{ routes.length }}개의 여행 일정</span>
        </div>
      </div>

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
          :places="route.places"
          :likes="route.likes"
          :views="route.views"
          :shares="route.shares"
          @click="openModal(route)"
        />
      </div>
    </section>

    <!-- 모달 -->
    <TravelDetailModal
      v-if="selectedRoute"
      :route="selectedRoute"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import TravelCard from "@/views/browse/BrowseTravelCard.vue";
import TravelDetailModal from "@/views/browse/BrowseTravelModal.vue";

const selectedRoute = ref(null);
const regions = ref([]);

// API에서 지역 목록 가져오기
const fetchRegions = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/regions');
    regions.value = response.data;
    console.log('지역 목록:', regions.value);
  } catch (error) {
    console.error('지역 목록을 불러오는데 실패했습니다:', error);
  }
};

onMounted(() => {
  fetchRegions();
});

const routes = [
  {
    city: "제주도",
    date: "11월 2일",
    title: "제주도 힐링 3박4일 완벽 가이드",
    user: "여행러버",
    days: "4일",
    places: 13,
    likes: 1245,
    views: 8932,
    shares: 456,
    isPublic: true,
    transport: "자차",
    createdAt: "2025년 11월 2일",
    review: {
      text: "제주도 여행 정말 최고였어요! 🌊 성산일출봉에서 본 일출은 정말 장관이었고, 애월 카페거리의 감성 카페들도 너무 예뻤어요. 특히 오션뷰 카페에서 마신 커피 한 잔이 아직도 생각나네요 ☕️\n\n한림공원은 가족들과 함께 가기 좋았고, 용암동굴도 신기했어요! 렌터카로 이동해서 자유롭게 여행할 수 있었던 점이 가장 좋았습니다. 다음에 또 가고 싶어요! 💙",
      images: [
        "https://placehold.co/97x97",
        "https://placehold.co/97x97",
        "https://placehold.co/97x97",
        "https://placehold.co/97x97"
      ]
    },
    itinerary: [
      {
        day: 1,
        places: [
          {
            emoji: "🏛️",
            name: "성산일출봉",
            rating: 4.7,
            time: "06:00 - 08:00",
            address: "제주특별자치도 서귀포시 성산읍 성산리",
            description: "유네스코 세계자연유산으로 지정된 제주의 대표 관광지. 일출을 보기 위해 많은 관광객이 찾는 명소입니다.",
            duration: "90분",
            tip: "일출 시간에 맞춰 일찍 도착하는 것을 추천합니다"
          },
          {
            emoji: "☕",
            name: "제주 감성 카페",
            rating: 4.5,
            time: "10:00 - 11:30",
            address: "제주특별자치도 제주시 애월읍",
            description: "오션뷰가 멋진 감성 카페. 신선한 베이커리와 맛있는 커피를 즐길 수 있습니다.",
            duration: "60분"
          },
          {
            emoji: "🏛️",
            name: "한림공원",
            rating: 4.6,
            time: "13:00 - 15:30",
            address: "제주특별자치도 제주시 한림읍",
            description: "다양한 테마정원과 용암동굴을 함께 즐길 수 있는 복합 관광지",
            duration: "120분"
          },
          {
            emoji: "🍽️",
            name: "제주 흑돼지 맛집",
            rating: 4.8,
            time: "18:00 - 19:30",
            address: "제주특별자치도 제주시 제주대학로",
            description: "제주 특산물인 흑돼지 구이를 맛볼 수 있는 현지 맛집. 신선한 고기와 푸짐한 반찬이 일품입니다.",
            duration: "90분",
            tip: "저녁 식사 시간에는 대기가 있을 수 있으니 예약 추천"
          }
        ]
      }
    ]
  },
  {
    city: "부산",
    date: "11월 1일",
    title: "부산 감성 여행 (해운대+광안리)",
    user: "부산토박이",
    days: "3일",
    places: 7,
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
    places: 9,
    likes: 1876,
    views: 15234,
    shares: 721,
  },
];

const openModal = (route) => {
  selectedRoute.value = route;
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  selectedRoute.value = null;
  document.body.style.overflow = '';
};
</script>

<style scoped>
.browse-container {
  width: 100%;
  min-height: 100vh;
}

.main-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px 80px;
}

.main-title {
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.main-subtitle {
  font-size: 16px;
  color: #6b7280;
  text-align: center;
  margin: 0 0 40px 0;
}

.filter-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 16px;
  flex-wrap: wrap;
}

.tab-btn {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}

.tab-btn.active {
  background: #1f2937;
  color: white;
  border-color: #1f2937;
}

.filter-dropdowns {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: #4f46e5;
}

.result-count {
  font-size: 14px;
  color: #4f46e5;
  font-weight: 600;
  white-space: nowrap;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 28px;
}

@media (max-width: 768px) {
  .filter-tabs {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-dropdowns {
    justify-content: space-between;
  }
  
  .card-grid {
    grid-template-columns: 1fr;
  }
}
</style>