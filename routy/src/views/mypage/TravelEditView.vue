<template>
  <div class="travel-edit">
    <!-- 헤더 -->
    <header class="edit-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">←</button>
        <h1>일정 수정</h1>
      </div>
      <div class="header-right">
        <button class="btn-cancel" @click="goBack">취소</button>
        <button class="btn-save" @click="saveEdit">저장</button>
      </div>
    </header>

    <!-- 여행 기본 정보 -->
    <section class="info-section">
      <div class="info-box">
        <div class="form-group">
          <label>여행 제목</label>
          <input v-model="travel.title" placeholder="여행 제목을 입력하세요" />
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label>여행지</label>
            <input v-model="travel.region" placeholder="여행지를 입력하세요" />
          </div>
          <div class="form-group half">
            <label>기간</label>
            <div class="duration-box">
              <button @click="decreaseDays">-</button>
              <span>{{ travel.duration }}</span>
              <button @click="increaseDays">+</button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label>테마 선택 (복수 선택 가능)</label>
          <div class="theme-list">
            <label v-for="theme in themes" :key="theme" class="theme-item">
              <input type="checkbox" v-model="selectedThemes" :value="theme" />
              {{ theme }}
            </label>
          </div>
        </div>
      </div>
    </section>

    <!-- 일정 카드 -->
    <section class="days-wrap">
      <div v-for="(day, index) in visibleDays" :key="index" class="day-card">
        <div class="day-header">
          <div class="day-circle">{{ index + 1 }}</div>
          <div>
            <h3>Day {{ index + 1 }}</h3>
            <p>{{ day.date }}</p>
          </div>
        </div>

        <div class="plan-list">
          <div v-for="(plan, i) in day.plans" :key="i" class="plan-item">
            <input v-model="plan.title" placeholder="활동 제목" />
            <input v-model="plan.location" placeholder="장소 입력" />
            <button class="delete-btn" @click="removePlan(index, i)">삭제</button>
          </div>
          <button class="add-btn" @click="addPlan(index)">+ 활동 추가</button>
        </div>
      </div>
    </section>

    <div class="load-more" v-if="travel.days.length > visibleCount">
      <button @click="toggleMore">
        {{ showAll ? '접기' : `더 보기 (${travel.days.length - visibleCount}일 남음)` }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'   // ✅ computed 추가!
import { useRouter } from 'vue-router'

const router = useRouter()

const travel = ref({
  title: '제주도 힐링 여행',
  region: '제주도',
  duration: '3박 4일',
  days: [
    {
      date: '2024.12.15 (일)',
      plans: [
        { title: '제주 공항 도착', location: '제주국제공항' },
        { title: '점심 식사', location: '흑돼지 거리' },
        { title: '성산일출봉', location: '서귀포시 성산읍' },
      ],
    },
    {
      date: '2024.12.16 (월)',
      plans: [
        { title: '호텔 조식', location: '서귀포 호텔' },
        { title: '한라산 등반', location: '한라산 국립공원' },
      ],
    },
    {
      date: '2024.12.17 (화)',
      plans: [
        { title: '우도 여행', location: '우도' },
        { title: '땅콩 아이스크림', location: '우도 해변' },
      ],
    },
    {
      date: '2024.12.18 (수)',
      plans: [
        { title: '기념품 쇼핑', location: '용문시장' },
      ],
    },
  ],
})

const themes = ['자연', '인문(문화/예술/역사)', '레포츠', '쇼핑']
const selectedThemes = ref(['자연'])

function addPlan(dayIndex) {
  travel.value.days[dayIndex].plans.push({ title: '', location: '' })
}

function removePlan(dayIndex, planIndex) {
  travel.value.days[dayIndex].plans.splice(planIndex, 1)
}

function increaseDays() {
  travel.value.duration = '4박 5일'
}

function decreaseDays() {
  travel.value.duration = '2박 3일'
}

function goBack() {
  router.back()
}

function saveEdit() {
  alert('수정 완료!')
  router.push(`/mypage/travel/1`)
}

const showAll = ref(false)
const visibleCount = ref(3)

const visibleDays = computed(() => {
  return showAll.value ? travel.value.days : travel.value.days.slice(0, visibleCount.value)
})

function toggleMore() {
  showAll.value = !showAll.value
}
</script>


<style scoped>
.travel-edit {
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 0 80px;
  background: linear-gradient(135deg, rgba(219, 234, 254, 0.4), white 50%, rgba(209, 250, 229, 0.4));
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 헤더 */
.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 24px;
  border-radius: 12px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
}
.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}
.back-btn {
  border: none;
  background: transparent;
  font-size: 20px;
  cursor: pointer;
}
.header-right {
  display: flex;
  gap: 8px;
}
.btn-cancel {
  border: 1px solid #ccc;
  background: white;
  color: #555;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
}
.btn-save {
  background: #2563eb;
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 6px;
  cursor: pointer;
}

/* 기본 정보 */
.info-section {
  background: transparent;
}
.info-box {
  background: white;
  border-radius: 12px;
  padding: 32px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.05);
}
.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}
label {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 6px;
  color: #333;
}
input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}
.form-row {
  display: flex;
  gap: 24px;
}
.half {
  flex: 1;
}
.duration-box {
  display: flex;
  align-items: center;
  gap: 10px;
}
.duration-box button {
  background: white;
  border: 1px solid #ccc;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  cursor: pointer;
}
.theme-list {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
}
.theme-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #333;
}

/* 일정 카드 */
.days-wrap {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 28px;
}
.day-card {
  background: white;
  border: 1px solid #dbeafe;
  border-radius: 14px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}
.day-header {
  background: #3b82f6;
  color: white;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.day-circle {
  background: rgba(255, 255, 255, 0.25);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  text-align: center;
  line-height: 36px;
  font-weight: 600;
}
.plan-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.plan-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  background: #f9fafb;
  padding: 10px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}
.plan-item input {
  font-size: 13px;
}
.delete-btn {
  align-self: flex-end;
  font-size: 12px;
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
}
.add-btn {
  border: 1px solid #3b82f6;
  color: #3b82f6;
  background: white;
  padding: 8px;
  border-radius: 6px;
  cursor: pointer;
}
.add-btn:hover {
  background: #eff6ff;
}

/* 하단 더보기 */
.load-more {
  text-align: center;
  margin-top: 16px;
}
.load-more button {
  border: 1px solid #3b82f6;
  background: white;
  color: #3b82f6;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
}
.load-more button:hover {
  background: #eff6ff;
}
</style>
