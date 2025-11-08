<template>
  <div class="travel-edit">
    <div class="content-wrapper">
          <!-- 헤더 -->
    <header class="edit-header">
      <div class="header-left">
        <button class="back-btn" @click="goBack">←</button>
        <h1>여행 루트 다시 그리기</h1>
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
          <label>여행 루트 제목</label>
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
              <span>{{ durationText }}</span> <!-- ✅ computed로 표시 -->
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

        <!-- ✅ 드래그 가능한 일정 리스트 -->
        <draggable v-model="day.plans" handle=".drag-handle" animation="200" class="plan-list">
          <template #item="{ element: plan, index: i }">
            <div class="plan-item">
              <div class="plan-header">
                <span class="drag-handle">⋮⋮</span>
                <button class="delete-btn" @click="removePlan(index, i)">삭제</button>
              </div>

              <input
                v-model="plan.place_name"
                placeholder="장소명 (예: 제주 공항 도착)"
              />
              <input
                v-model="plan.address_name"
                placeholder="주소 (예: 제주시 공항로 2)"
              />
              <input
                v-model="plan.category_group_name"
                placeholder="카테고리 (예: 관광명소, 음식점 등)"
              />
              <input
                v-model="plan.place_url"
                placeholder="URL (예: https://place.map.kakao.com/...)"
              />
            </div>
          </template>
        </draggable>

        <!-- ✅ 장소 추가 버튼 -->
        <button class="add-btn" @click="addPlan(index)">+ 장소 추가</button>
      </div>
    </section>

    <div class="load-more" v-if="travel.days.length > visibleCount">
      <button @click="toggleMore">
        {{ showAll ? '접기' : `더 보기 (${travel.days.length - visibleCount}일 남음)` }}
      </button>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import draggable from "vuedraggable";

const router = useRouter();

// ✅ 여행 데이터
const travel = ref({
  title: "제주도 힐링 여행",
  region: "제주도",
  daysCount: 2, // ← 숫자로 명시 (기본 2일)
  days: [
    {
      date: "2024.12.15 (일)",
      plans: [
        {
          place_name: "제주 공항 도착",
          address_name: "제주국제공항",
          category_group_name: "교통시설",
          place_url: "https://place.map.kakao.com/12345",
        },
        {
          place_name: "점심 식사",
          address_name: "흑돼지 거리",
          category_group_name: "음식점",
          place_url: "https://place.map.kakao.com/67890",
        },
      ],
    },
    {
      date: "2024.12.16 (월)",
      plans: [
        {
          place_name: "호텔 조식",
          address_name: "서귀포 호텔",
          category_group_name: "숙박",
          place_url: "https://place.map.kakao.com/22222",
        },
        {
          place_name: "한라산 등반",
          address_name: "한라산 국립공원",
          category_group_name: "자연명소",
          place_url: "https://place.map.kakao.com/33333",
        },
      ],
    },
  ],
});

// ✅ 문자열 자동 변환 (정상 출력)
const durationText = computed(() => {
  const count = travel.value.daysCount || 0;
  const nights = count > 0 ? count - 1 : 0;
  return `${nights}박 ${count}일`;
});

// ✅ + 버튼: Day 추가
function increaseDays() {
  travel.value.daysCount++;
  const newDate = `2024.12.${15 + travel.value.days.length} (추가일)`;
  travel.value.days.push({
    date: newDate,
    plans: [],
  });
}

// ✅ - 버튼: Day 삭제
function decreaseDays() {
  if (travel.value.daysCount > 1) {
    travel.value.daysCount--;
    travel.value.days.pop();
  }
}

// ✅ 일정 추가/삭제
function addPlan(dayIndex) {
  travel.value.days[dayIndex].plans.push({
    place_name: "",
    address_name: "",
    category_group_name: "",
    place_url: "",
  });
}

function removePlan(dayIndex, planIndex) {
  travel.value.days[dayIndex].plans.splice(planIndex, 1);
}

function goBack() {
  router.back();
}

function saveEdit() {
  alert("수정 완료!");
  router.push(`/mypage/travel/1`);
}

const themes = ["자연", "인문(문화/예술/역사)", "레포츠", "쇼핑"];
const selectedThemes = ref(["자연"]);

const showAll = ref(false);
const visibleCount = ref(3);

const visibleDays = computed(() =>
  showAll.value
    ? travel.value.days
    : travel.value.days.slice(0, visibleCount.value)
);

function toggleMore() {
  showAll.value = !showAll.value;
}
</script>


<style scoped>
.travel-edit {
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(148deg, #eff6ff 0%, white 50%, #f0fdf4 100%);
  display: flex;
  justify-content: center; 
  padding: 60px 0 100px;
}


.travel-edit > .content-wrapper {
  width: 1100px; 
  display: flex;
  flex-direction: column;
  gap: 32px;
}


/* 헤더 */
.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.9);
  border: 0.8px solid rgba(229, 231, 235, 0.6);
  padding: 18px 32px;
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  align-items: center;
}
.header-left h1 {
  margin: 0;
  margin-left: 10px;
  font-size: 20px;
  font-weight: 700;
  color: #101828;
  line-height: 1.2;
}
.back-btn {
  border: none;
  background: none;
  font-size: 22px;
  color: #3b82f6;
  cursor: pointer;
  transition: color 0.2s;
  flex-shrink: 0;
}
.back-btn:hover {
  color: #2563eb;
}
.header-right {
  display: flex;
  gap: 8px;
}
.btn-cancel {
  border: 0.8px solid #d1d5db;
  background: white;
  color: #4b5563;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-cancel:hover {
  background: #f9fafb;
}
.btn-save {
  background: #2563eb;
  color: white;
  border: none;
  font-size: 14px;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-save:hover {
  background: #1d4ed8;
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
  gap: 28px;
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
.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.drag-handle {
  cursor: grab;
  font-size: 16px;
  color: #9ca3af;
  user-select: none;
}
.drag-handle:active {
  cursor: grabbing;
}
.plan-item input {
  font-size: 13px;
}
.delete-btn {
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
  width: 100%;
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
