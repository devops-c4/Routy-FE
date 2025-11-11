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
                <span>{{ durationText }}</span>
                <button @click="increaseDays">+</button>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>테마 선택 (복수 선택 가능)</label>
            <div class="theme-list">
              <!-- 백엔드에서 온 옵션이 있으면 그걸로, 없으면 기본 배열 -->
              <label
                v-for="theme in themeOptionsToShow"
                :key="theme"
                class="theme-item"
              >
                <input type="checkbox" v-model="selectedThemes" :value="theme" />
                {{ theme }}
              </label>
            </div>
          </div>
        </div>
      </section>

      <!-- 일정 카드 -->
      <section class="days-wrap" v-if="!loading">
        <div
          v-for="(day, index) in visibleDays"
          :key="day.dayId ?? index"
          class="day-card"
        >
          <div class="day-header">
            <div class="day-circle">{{ index + 1 }}</div>
            <div>
              <h3>Day {{ index + 1 }}</h3>
              <p>{{ day.displayDate }}</p>
            </div>
          </div>

          <!-- 드래그 가능한 일정 리스트 -->
          <draggable
            v-model="day.plans"
            handle=".drag-handle"
            animation="200"
            class="plan-list"
          >
            <template #item="{ element: plan, index: i }">
              <div class="plan-item">
                <div class="plan-header">
                  <span class="drag-handle">⋮⋮</span>
                  <button class="delete-btn" @click="removePlan(index, i)">삭제</button>
                </div>

                <input v-model="plan.place_name" placeholder="장소명 (예: 제주 공항 도착)" />
                <input v-model="plan.address_name" placeholder="주소 (예: 제주시 공항로 2)" />
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

          <!-- 장소 추가 -->
          <button class="add-btn" @click="addPlan(index)">+ 장소 추가</button>
        </div>
      </section>

      <div class="load-more" v-if="travel.days.length > visibleCount">
        <button @click="toggleMore">
          {{ showAll ? "접기" : `더 보기 (${travel.days.length - visibleCount}일 남음)` }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import draggable from "vuedraggable";
import apiClient from "@/utils/axios";

// 라우터 훅
const router = useRouter();
const route = useRoute();
const planId = route.params.id; // /mypage/travel/:id/edit 이니까 id

// 화면 로딩 상태
const loading = ref(true);

// 여행 데이터
const travel = ref({
  title: "",
  region: "",
  daysCount: 0,
  days: [], // [{ dayId, date, displayDate, plans: [...] }]
});

// 테마
const selectedThemes = ref([]);
const themeOptions = ref([]); // 백엔드가 내려주는 전체 옵션

// 더보기
const showAll = ref(false);
const visibleCount = ref(3);

// 기간 표시
const durationText = computed(() => {
  const count = travel.value.daysCount || 0;
  const nights = count > 0 ? count - 1 : 0;
  return `${nights}박 ${count}일`;
});

// 백엔드에서 오면 그걸 쓰고, 없으면 기본 세트
const themeOptionsToShow = computed(() => {
  if (themeOptions.value && themeOptions.value.length > 0) {
    return themeOptions.value.map((t) => t.name ?? t); // DTO가 {code,name} 이라서 name만 뽑음
  }
  return ["자연", "인문(문화/예술/역사)", "레포츠", "쇼핑"];
});

// 더보기용 day
const visibleDays = computed(() =>
  showAll.value ? travel.value.days : travel.value.days.slice(0, visibleCount.value)
);

// 날짜 포맷터 (YYYY-MM-DD → YYYY.MM.DD)
const toDisplayDate = (str) => {
  if (!str) return "";
  // "2024-12-15" → "2024.12.15"
  return str.replaceAll("-", ".");
};

// 1) 수정화면 데이터 불러오기
const fetchPlanEdit = async () => {
  loading.value = true;
  try {
    const { data } = await apiClient.get(`/api/plans/${planId}/edit`);

    // 상단 정보
    travel.value.title = data.title;
    travel.value.region = data.destination;
    travel.value.daysCount = data.dayList?.length || data.days || 0;

    // 테마
    selectedThemes.value = data.selectedThemes || [];
    themeOptions.value = data.themeOptions || [];

    // dayList → 화면 구조로 변환
    travel.value.days = (data.dayList || []).map((day) => ({
      dayId: day.dayId,
      dayNo: day.dayNo,
      date: day.date, // 저장용 원본
      displayDate: toDisplayDate(day.date),
      plans: (day.activities || []).map((act) => ({
        travelId: act.travelId,
        // UI에서 쓰는 이름셋
        place_name: act.placeName || act.title || "",
        address_name: act.addressName || act.place || "",
        category_group_name: act.categoryGroupName || act.tag || "",
        place_url: act.placeUrl || "",
        // 저장 때 필요
        title: act.title || act.placeName || "",
      })),
    }));
  } catch (e) {
    console.error("❌ 일정 수정 데이터 불러오기 실패:", e);
  } finally {
    loading.value = false;
  }
};

// 2) 저장
const saveEdit = async () => {
  // 프론트 구조 → PlanEditSaveRequestDTO 구조로 변환
  const payload = {
    planId: Number(planId),
    title: travel.value.title,
    destination: travel.value.region,
    // 기간은 지금 UI에서 날짜를 직접 바꾸는 부분이 없어서 생략 가능
    // nights/days 는 백엔드에서 굳이 안 써도 되지만 DTO에 있으니 맞춰줌
    nights: travel.value.daysCount > 0 ? travel.value.daysCount - 1 : 0,
    days: travel.value.daysCount,
    selectedThemes: selectedThemes.value,
    dayList: travel.value.days.map((d, dayIdx) => ({
      dayId: d.dayId,
      dayNo: dayIdx + 1,
      date: d.date, // 원본 그대로
      activities: d.plans.map((p, actIdx) => ({
        travelId: p.travelId,
        travelOrder: actIdx + 1,
        title: p.place_name, // 한 줄 제목
        tag: p.category_group_name,
        placeName: p.place_name,
        addressName: p.address_name,
        categoryGroupName: p.category_group_name,
        placeUrl: p.place_url,
      })),
    })),
  };

  try {
    await apiClient.put(`/api/plans/${planId}`, payload);
    alert("수정 완료!");
    router.push(`/mypage/travel/${planId}`);
  } catch (e) {
    console.error("❌ 일정 저장 실패:", e);
    alert("저장 중 오류가 발생했습니다. 콘솔을 확인해주세요.");
  }
};

// 버튼 동작들
const increaseDays = () => {
  travel.value.daysCount++;
  // 새 day 하나 추가
  travel.value.days.push({
    dayId: null,
    dayNo: travel.value.days.length + 1,
    date: "",
    displayDate: "",
    plans: [],
  });
};

const decreaseDays = () => {
  if (travel.value.daysCount > 1) {
    travel.value.daysCount--;
    travel.value.days.pop();
  }
};

const addPlan = (dayIndex) => {
  travel.value.days[dayIndex].plans.push({
    place_name: "",
    address_name: "",
    category_group_name: "",
    place_url: "",
  });
};

const removePlan = (dayIndex, planIndex) => {
  travel.value.days[dayIndex].plans.splice(planIndex, 1);
};

const toggleMore = () => {
  showAll.value = !showAll.value;
};

const goBack = () => {
  router.back();
};

// 최초 로딩
onMounted(fetchPlanEdit);
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
