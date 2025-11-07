<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

// 현재 라우트 정보
const route = useRoute()
const travelId = Number(route.params.id)

// 더미 여행 데이터 (추후 백엔드 연동 예정)
const allTravels = ref([
  {
    id: 1,
    title: '부산 미식 투어',
    theme: '미식',
    region: '부산',
    transportation: 'KTX',
    startDate: '2024.11.20 (수)',
    endDate: '2024.11.22 (금)',
    duration: '2박 3일',
    status: '완료',
    color: 'red',
    days: [
      {
        day: 1,
        date: '2024.11.20 (수)',
        plans: [
          { time: '09:00', title: '부산 도착', location: '부산역' },
          { time: '12:00', title: '점심 식사', location: '광복동 시장' },
          { time: '15:00', title: '해운대 산책', location: '해운대 해수욕장' },
        ],
      },
      {
        day: 2,
        date: '2024.11.21 (목)',
        plans: [
          { time: '10:00', title: '감천문화마을', location: '감천문화마을' },
          { time: '14:00', title: '자갈치 시장', location: '중구' },
        ],
      },
    ],
  },
  {
    id: 2,
    title: '제주도 힐링 여행',
    theme: '힐링',
    region: '제주도',
    transportation: '비행기',
    startDate: '2024.12.15 (일)',
    endDate: '2024.12.18 (수)',
    duration: '3박 4일',
    status: '진행 예정',
    color: 'blue',
    days: [
      {
        day: 1,
        date: '2024.12.15 (일)',
        plans: [
          { time: '09:00', title: '제주 공항 도착', location: '제주국제공항' },
          { time: '11:00', title: '점심 식사', location: '흑돼지 거리' },
          { time: '14:00', title: '성산일출봉', location: '서귀포시 성산읍' },
          { time: '17:00', title: '숙소 체크인', location: '서귀포 호텔' },
        ],
      },
      {
        day: 2,
        date: '2024.12.16 (월)',
        plans: [
          { time: '08:00', title: '호텔 조식', location: '서귀포 호텔' },
          { time: '10:00', title: '한라산 등반', location: '한라산 국립공원' },
          { time: '15:00', title: '카페 투어', location: '애월 카페거리' },
          { time: '19:00', title: '저녁 식사', location: '애월 해안도로' },
        ],
      },
      {
        day: 3,
        date: '2024.12.17 (화)',
        plans: [
          { time: '09:00', title: '우도 여행', location: '우도' },
          { time: '12:00', title: '땅콩 아이스크림', location: '우도 해변' },
          { time: '15:00', title: '협재 해수욕장', location: '제주시 한림읍' },
        ],
      },
      {
        day: 4,
        date: '2024.12.18 (수)',
        plans: [
          { time: '09:00', title: '호텔 체크아웃', location: '서귀포 호텔' },
          { time: '10:00', title: '기념품 쇼핑', location: '용문시장' },
          { time: '13:00', title: '공항 이동', location: '제주국제공항' },
        ],
      },
    ],
  },
])

// 선택된 여행 데이터
const travel = computed(() => allTravels.value.find(t => t.id === travelId))

// Day별 확장 상태
const expandedDays = ref([])
const showAll = ref(false)
const visibleCount = ref(3)

const visibleDays = computed(() => {
  if (!travel.value) return []
  return travel.value.days.slice(0, visibleCount.value)
})

function toggleMore() {
  showAll.value = !showAll.value
  visibleCount.value = showAll.value ? travel.value.days.length : 3
}

function toggleDayPlans(index) {
  expandedDays.value[index] = !expandedDays.value[index]
}

function shownPlans(day) {
  const index = travel.value.days.findIndex(d => d.day === day.day)
  if (expandedDays.value[index]) return day.plans
  return day.plans.slice(0, 3)
}
</script>

<template>
  <div v-if="travel" class="travel-detail">
    <!-- 상단 헤더 -->
    <header class="header">
      <div class="header-left">
        <h1>{{ travel.title }}</h1>
        <p>{{ travel.startDate }} - {{ travel.endDate }}</p>
      </div>
      <div class="header-right">
        <button class="btn btn-outline-blue">수정</button>
        <button class="btn btn-outline-red">삭제</button>
      </div>
    </header>

    <!-- 여행 정보 카드 -->
    <section class="info-card">
      <div class="info-top">
        <span class="tag blue">{{ travel.theme }} 여행</span>
        <span
          class="tag green"
          v-if="travel.status"
        >
          {{ travel.status }}
        </span>
      </div>
      <div class="info-grid">
        <div class="info-item">
          <div class="label">여행지</div>
          <div class="value">{{ travel.region }}</div>
        </div>
        <div class="info-item">
          <div class="label">기간</div>
          <div class="value">{{ travel.duration }}</div>
        </div>
      </div>
      <div class="info-footer">
        <p>{{ travel.startDate }} ~ {{ travel.endDate }}</p>
        <button class="btn btn-green">리뷰 작성하기</button>
      </div>
    </section>

    <!-- 일정 카드 리스트 -->
    <section class="days-wrap">
      <div
        v-for="(day, index) in visibleDays"
        :key="day.day"
        class="day-card"
      >
        <div class="day-header" :class="travel.color">
          <div class="circle">{{ day.day }}</div>
          <div class="day-title">
            <h3>Day {{ day.day }}</h3>
            <p>{{ day.date }}</p>
          </div>
        </div>

        <div class="plans">
          <div
            v-for="(plan, i) in shownPlans(day)"
            :key="i"
            class="plan"
          >
            <div class="time">{{ plan.time }}</div>
            <div class="content">
              <p class="title">{{ plan.title }}</p>
              <p class="location">{{ plan.location }}</p>
            </div>
          </div>

          <div
            v-if="day.plans.length > 3"
            class="more-activities"
            @click="toggleDayPlans(index)"
          >
            <span v-if="!expandedDays[index]">+{{ day.plans.length - 3 }}개 활동 더 보기</span>
            <span v-else>접기</span>
          </div>
        </div>
      </div>

      <!-- 전체 더 보기 버튼 -->
      <div class="load-more" v-if="travel.days.length > 3">
        <button
          class="btn btn-outline-blue"
          @click="toggleMore"
        >
          {{ showAll ? '접기' : `더 보기 (${travel.days.length - visibleCount}일 남음)` }}
        </button>
      </div>
    </section>
  </div>
</template>

<style scoped>
.travel-detail {
  max-width: 1120px;              
  margin: 0 auto;
  padding: 40px 32px 100px; 
  background: linear-gradient(135deg,
    rgba(219,234,254,0.4) 0%,
    white 50%,
    rgba(209,250,229,0.4) 100%);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 32px; 
}


/* 헤더 */
.header {
  height: 72px; /* ✅ 살짝 낮춤 (기존 80px → 72px) */
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 0.8px solid rgba(229, 231, 235, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px; /* ✅ 위아래 여백 살짝 줄임 */
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  margin-bottom: 12px; /* ✅ 기존 여백 줄이기 */
}
.header-left h1 { font-size: 18px; color: #101828; margin: 0; }
.header-left p { font-size: 14px; color: #6a7282; margin: 2px 0 0; }
.header-right { display: flex; gap: 8px; }

/* 버튼 */
.btn {
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}
.btn-outline-blue { border: 0.8px solid #3b82f6; color: #3b82f6; background: white; }
.btn-outline-red { border: 0.8px solid #fb2c36; color: #fb2c36; background: white; }
.btn-green { background: #10b981; color: white; border: none; }

/* 여행 정보 카드 */
.info-card {
  background: rgba(255,255,255,0.95);
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
  border-radius: 14px;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border: 0.8px solid rgba(96,165,250,0.2);
}
.info-top { display: flex; align-items: center; gap: 12px; }
.tag { font-size: 12px; border-radius: 8px; padding: 4px 10px; color: white; }
.tag.blue { background: #3b82f6; }
.tag.green { background: #10b981; }
.info-grid { display: flex; justify-content: space-between; }
.label { font-size: 14px; color: #6a7282; }
.value { font-size: 16px; color: #101828; }
.info-footer {
  border-top: 0.8px solid #e5e7eb;
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 일정 카드 */
.days-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); 
  gap: 24px 28px;
}
.day-card {
  background: rgba(255,255,255,0.9);
  border-radius: 14px;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
  border: 0.8px solid rgba(96,165,250,0.2);
  overflow: hidden;
}
.day-header {
  background: #3b82f6;
  color: white;
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.circle {
  width: 42px;
  height: 42px;
  background: rgba(255,255,255,0.25);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
  color: white;
  margin-right: 4px; /* 숫자랑 타이틀 간격 조금 */
}
.day-header h3 { font-size: 16px; margin: 0; }
.day-header p { font-size: 14px; color: rgba(255,255,255,0.8); margin: 0; }

/* 일정 내용 */
.plans {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.plan .time { font-size: 12px; color: #3b82f6; }
.plan .title { font-size: 14px; color: #101828; }
.plan .location { font-size: 12px; color: #4a5565; }

/* 더 보기 */
.more-activities {
  margin-top: 8px;
  text-align: center;
  color: #3b82f6;
  font-size: 12px;
  cursor: pointer;
}
.load-more {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 8px;
}
</style>
