<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import apiClient from '@/utils/axios'
import TravelReviewModal from '@/views/mypage/TravelReviewModal.vue'

const route = useRoute()
const router = useRouter()
const showReviewModal = ref(false)

// 현재 여행 ID & 사용자 ID (로그인 후엔 토큰에서 가져오게 됨)
const planId = Number(route.params.id)


// 여행 상세 데이터
const travel = ref(null)

// Day별 확장 상태
const expandedDays = ref([])
const showAll = ref(false)
const visibleCount = ref(3)

// 삭제 버튼 클릭 할 경우
const deletePlan = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return

  try {
    await apiClient.patch(`/api/plans/${planId}/delete`)
    alert('삭제되었습니다.')
    router.push('/mypage')  
  } catch (err) {
    console.error(err)
    alert('삭제 중 오류가 발생했습니다.')
  }
}

// 백엔드 연동
onMounted(async () => {
  try {
    const res = await apiClient.get(`/api/plans/${planId}`)
    travel.value = res.data
    expandedDays.value = (travel.value?.dayList || []).map(() => false)
  } catch (err) {
    console.error('❌ 여행 데이터를 불러오는 중 오류 발생:', err)
  }
})



// 페이지 이동
function goToEditPage() {
  router.push(`/mypage/travel/${planId}/edit`)
}

// 일정 접기/펼치기
function toggleDayPlans(index) {
  expandedDays.value[index] = !expandedDays.value[index]
}

// 표시할 일자
function shownPlans(day, index) {
  if (expandedDays.value[index]) return day.activities
  return day.activities.slice(0, 3)
}

// 전체 보기
function toggleMore() {
  showAll.value = !showAll.value
  visibleCount.value = showAll.value ? travel.value.dayList.length : 3
}
</script>

<template>
  <div v-if="travel" class="travel-detail">
    <div class="content-wrapper">
      <!-- 상단 헤더 -->
      <header class="header">
        <div class="header-left">
          <button class="back-btn" @click="router.push('/mypage')">←</button>
          <div class="title-block">
            <h1>{{ travel.title }}</h1>
            <p>{{ travel.startDate }} - {{ travel.endDate }}</p>
          </div>
        </div>
        <div class="header-right">
          <button class="btn btn-outline-blue" @click="goToEditPage">수정</button>
          <button class="btn delete" @click="deletePlan">삭제</button>
        </div>
      </header>

      <!-- 여행 정보 카드 -->
      <section class="info-card">
        <div class="info-header">
          <div class="tag theme">
            <i class="fa fa-plane"></i>
            <span>{{ travel.theme }} 여행</span>
          </div>
          <div class="tag status">{{ travel.status }}</div>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <div class="icon-wrap"><i class="fa fa-map-marker-alt"></i></div>
            <div class="text">
              <p class="label">여행지</p>
              <p class="value">{{ travel.destination }}</p>
            </div>
          </div>
          <div class="info-item">
            <div class="icon-wrap"><i class="fa fa-leaf"></i></div>
            <div class="text">
              <p class="label">테마</p>
              <p class="value">{{ travel.theme }}</p>
            </div>
          </div>
          <div class="info-item">
            <div class="icon-wrap"><i class="fa fa-calendar-alt"></i></div>
            <div class="text">
              <p class="label">기간</p>
              <p class="value">{{ travel.days }}일 ({{ travel.nights }}박)</p>
            </div>
          </div>
        </div>

        <div class="info-footer">
          <p class="date">{{ travel.startDate }} ~ {{ travel.endDate }}</p>
          <button 
            v-if="travel.reviewWritable" 
            class="btn btn-green" 
            @click="showReviewModal = true"
          >
            리뷰 작성하기
          </button>
        </div>
      </section>

      <!-- 일정 카드 리스트 -->
      <section class="days-wrap">
        <div
          v-for="(day, index) in travel.dayList.slice(0, visibleCount)"
          :key="day.dayId"
          class="day-card"
        >
          <div class="day-header">
            <div class="circle">{{ day.dayNo }}</div>
            <div class="day-title">
              <h3>Day {{ day.dayNo }}</h3>
              <p>{{ day.date }}</p>
            </div>
          </div>

          <div class="plans">
            <div
              v-for="(plan, i) in shownPlans(day, index)"
              :key="i"
              class="plan"
            >
              <div class="plan-title">{{ plan.title }}</div>
              <div class="plan-address">
                <i class="fa fa-map-marker-alt"></i>
                {{ plan.place }}
              </div>
              <div class="plan-category">
                <i class="fa fa-tag"></i>
                {{ plan.tag }}
              </div>
              <div class="plan-link" v-if="plan.url">
                <a :href="plan.url" target="_blank">자세히 보기</a>
              </div>
            </div>

            <div
              v-if="day.activities.length > 3"
              class="more-activities"
              @click="toggleDayPlans(index)"
            >
              <span v-if="!expandedDays[index]">+{{ day.activities.length - 3 }}개 활동 더 보기</span>
              <span v-else>접기</span>
            </div>
          </div>
        </div>

        <div class="load-more" v-if="travel.dayList.length > 3">
          <button
            class="btn btn-outline-blue"
            @click="toggleMore"
          >
            {{ showAll ? '접기' : `더 보기 (${travel.dayList.length - visibleCount}일 남음)` }}
          </button>
        </div>
      </section>
    </div>
  </div>

  <TravelReviewModal
    v-if="showReviewModal"
    @close="showReviewModal = false"
  />
</template>

<style scoped>
.travel-detail {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(148deg, #eff6ff 0%, white 50%, #f0fdf4 100%);
  display: flex;
  justify-content: center; /* ✅ 중앙 정렬 */
  padding: 60px 0 100px;
}

/* ✅ 중앙 콘텐츠 박스 추가 */
.travel-detail > .content-wrapper {
  width: 1120px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 헤더 */
.header {
  height: 72px;
  background: rgba(255, 255, 255, 0.8);
  border-bottom: 0.8px solid rgba(229, 231, 235, 0.5);
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
  margin-bottom: 12px;
}
.header-left { display: flex; align-items: center; }
.header-right { display: flex; gap: 8px; }

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
  background: #fff;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.05);
  border-radius: 16px;
  padding: 28px 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid rgba(229, 231, 235, 0.5);
}

/* 상단 테마 태그 */
.info-header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.tag.theme {
  background: #3b82f6;
  color: white;
  border-radius: 9999px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 500;
}
.tag.theme i { font-size: 16px; }
.tag.status {
  background: #10b981;
  color: white;
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 8px;
}

.info-grid {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 40px; 
  border-radius: 12px;
  margin-bottom: 4px;
}


.info-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px; 
  text-align: left;
}

.icon-wrap {
  width: 46px; 
  height: 46px;
  border-radius: 50%;
  background: #e0f2fe;
  display: flex;
  justify-content: center;
  align-items: center;
}


.icon-wrap i {
  color: #3b82f6;
  font-size: 20px;
}


.text {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}

.text .label {
  font-size: 13px;
  color: #6a7282;
  margin: 0;
}

.text .value {
  font-size: 15px;
  font-weight: 600;
  color: #101828;
  margin: 0;
}


.info-footer {
  border-top: 1px solid #e5e7eb;
  padding-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.date {
  font-size: 14px;
  color: #6a7282;
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
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
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
  margin-right: 4px;
}
.day-header h3 { font-size: 16px; margin: 0; }
.day-header p { font-size: 14px; color: rgba(255,255,255,0.8); margin: 0; }

.plans {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  transition: all 0.3s ease-in-out;
}
.plan {
  background: #f9fafb;
  border-radius: 10px;
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}
.plan:hover { background: #f1f5f9; }
.plan .time { font-size: 12px; color: #3b82f6; }
.plan-title {
  color: #101828;
  font-size: 14px;
  font-weight: 600;
}
.plan-address,
.plan-category {
  color: #6a7282;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.plan-link { margin-top: 4px; }
.plan-link a {
  font-size: 12px;
  color: #3b82f6;
  text-decoration: none;
}
.plan-link a:hover { text-decoration: underline; }
.plan .location { font-size: 12px; color: #4a5565; }

/* ✅ “+1개 장소 더 보기” */
.more-activities {
  margin-top: 10px;
  text-align: center;
  color: #3b82f6;
  font-size: 13px;
  padding: 10px 0;
  border-top: 1px solid rgba(59,130,246,0.15);
  background: rgba(59,130,246,0.05);
  cursor: pointer;
  border-bottom-left-radius: 14px;
  border-bottom-right-radius: 14px;
  transition: background 0.2s, color 0.2s;
}
.more-activities:hover {
  background: rgba(59,130,246,0.1);
  color: #2563eb;
}
.more-activities span {
  display: inline-block;
  font-weight: 500;
  letter-spacing: 0.2px;
}

/* 전체 더 보기 버튼 */
.load-more {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 16px;
}
.load-more button {
  border-radius: 8px;
  padding: 8px 16px;
  border: 1px solid #3b82f6;
  background: white;
  color: #3b82f6;
  cursor: pointer;
  font-size: 14px;
}
.load-more button:hover { background: #eff6ff; }

/* 제목과 뒤로가기 */
.back-btn {
  border: none;
  background: none;
  font-size: 20px;
  color: #3b82f6;
  cursor: pointer;
  flex-shrink: 0; 
  transition: color 0.2s;
}
.back-btn:hover { color: #2563eb; }
.title-block {
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-left: 10px;
}
.title-block h1 {
  font-size: 18px;
  font-weight: 700;
  color: #101828;
  margin: 0;
}
.title-block p {
  font-size: 14px;
  color: #6a7282;
  margin: 2px 0 0;
}

.btn.delete {
  color: #ff4d4f; /* 빨간 글씨 */
  border: 1.5px solid #ff4d4f; /* 빨간 테두리 */
  background-color: transparent; /* 배경 투명 */
  border-radius: 6px;
  padding: 6px 14px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease-in-out;
}

/* hover 시 색 반전 효과 */
.btn.delete:hover {
  background-color: #ff4d4f;
  color: white;
}

</style>
