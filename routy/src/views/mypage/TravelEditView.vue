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
              <input v-model="travel.region" placeholder="여행지를 입력하세요"  
               :readonly="placeLocked" class="readonly-input" />
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
            <button class="day-delete-btn" @click="removeDay(index)">삭제</button>
          </div>

          <!-- 드래그 가능한 일정 리스트 -->
          <draggable
            v-model="day.plans"
            handle=".drag-handle"
            animation="200"
            class="plan-list"
            :group="{ name: 'plans-by-day', pull: true, put: true }"
            @change="onPlanChange"
          >
            <template #item="{ element: plan, index: i }">
              <div class="plan-item">
                <div class="plan-header">
                  <span class="drag-handle">⋮⋮</span>
                  <button class="delete-btn" @click="removePlan(index, i)">삭제</button>
                </div>

                <input v-model="plan.place_name" placeholder="장소명" 
                  :readonly="placeLocked"
                  :class="{ 'readonly-input': placeLocked }"/>
                
                <input v-model="plan.address_name" placeholder="주소" 
                  :readonly="placeLocked"
                  :class="{ 'readonly-input': placeLocked }"/>
                
                <input
                  v-model="plan.category_group_name"
                  placeholder="카테고리"
                  :readonly="placeLocked"
                  :class="{ 'readonly-input': placeLocked }"
                />
                
                <input
                  v-model="plan.place_url"
                  placeholder="URL"
                  :readonly="placeLocked"
                  :class="{ 'readonly-input': placeLocked }"
                />

                <!-- 시간 입력 필드 추가 -->
                <div class="time-inputs">
                  <div class="time-input-group">
                    <label>시작 시간</label>
                    <input 
                      type="time" 
                      v-model="plan.start_time"
                      class="time-input"
                      placeholder="시작 시간"
                    />
                  </div>
                  <div class="time-input-group">
                    <label>종료 시간</label>
                    <input 
                      type="time" 
                      v-model="plan.end_time"
                      class="time-input"
                      placeholder="종료 시간"
                    />
                  </div>
                </div>
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

const router = useRouter();
const route = useRoute();
const planId = route.params.id;

const loading = ref(true);
const placeLocked = ref(true);

const travel = ref({
  title: "",
  region: "",
  daysCount: 0,
  days: [],
});

const selectedThemes = ref([]);
const themeOptions = ref([]);
const showAll = ref(false);
const visibleCount = ref(3);

const durationText = computed(() => {
  const count = travel.value.daysCount || 0;
  const nights = count > 0 ? count - 1 : 0;
  return `${nights}박 ${count}일`;
});

const themeOptionsToShow = computed(() => {
  if (themeOptions.value && themeOptions.value.length > 0) {
    return themeOptions.value.map((t) => t.name ?? t);
  }
  return ["자연", "인문(문화/예술/역사)", "레포츠", "쇼핑"];
});

const visibleDays = computed(() =>
  showAll.value ? travel.value.days : travel.value.days.slice(0, visibleCount.value)
);

const toDisplayDate = (str) => {
  if (!str) return "";
  return str.replaceAll("-", ".");
};

// 1) 수정화면 데이터 불러오기
const fetchPlanEdit = async () => {
  loading.value = true;
  try {
    const { data } = await apiClient.get(`/api/plans/${planId}/edit`);

    travel.value.title = data.title;
    travel.value.region = data.destination;
    travel.value.daysCount = data.dayList?.length || data.days || 0;

    selectedThemes.value = data.selectedThemes || [];
    themeOptions.value = data.themeOptions || [];

    travel.value.days = (data.dayList || []).map((day) => ({
      dayId: day.dayId,
      dayNo: day.dayNo,
      date: day.date,
      displayDate: toDisplayDate(day.date),
      plans: (day.activities || []).map((act) => ({
        travelId: act.travelId,
        place_name: act.placeName || act.title || "",
        address_name: act.addressName || act.place || "",
        category_group_name: act.categoryGroupName || act.tag || "",
        place_url: act.placeUrl || "",
        title: act.title || act.placeName || "",
        // ✅ 시간 데이터 추가
        start_time: act.startTime || "",
        end_time: act.endTime || "",
      })),
      startTime: day.startTime || null,
      endTime: day.endTime || null,
    }));
  } catch (e) {
    console.error("❌ 일정 수정 데이터 불러오기 실패:", e);
  } finally {
    loading.value = false;
  }
};

/// 2) 저장
const saveEdit = async () => {
  // 시간 유효성 검증
  for (const day of travel.value.days) {
    for (const plan of day.plans) {
      if (plan.start_time && plan.end_time) {
        if (plan.end_time <= plan.start_time) {
          alert(`${plan.place_name}의 종료 시간이 시작 시간보다 이릅니다. 시간을 확인해주세요.`);
          return;
        }
      }
    }
  }

  const payload = {
    planId: Number(planId),
    title: travel.value.title,
    destination: travel.value.region,
    nights: travel.value.daysCount > 0 ? travel.value.daysCount - 1 : 0,
    days: travel.value.daysCount,
    selectedThemes: selectedThemes.value,
    dayList: travel.value.days.map((d, dayIdx) => ({
      dayId: d.dayId,
      dayNo: dayIdx + 1,
      date: d.date,
      activities: d.plans.map((p, actIdx) => ({
        travelId: p.travelId,
        travelOrder: actIdx + 1,
        title: p.place_name,
        tag: p.category_group_name,
        placeName: p.place_name,
        addressName: p.address_name,
        categoryGroupName: p.category_group_name,
        placeUrl: p.place_url,
        // 시간 데이터 추가
        startTime: p.start_time || null,
        endTime: p.end_time || null,
      })),
    })),
  };

  // ✅ 전송 전 데이터 확인
  console.log("📤 전송할 데이터:", JSON.stringify(payload, null, 2));

  try {
    const response = await apiClient.put(`/api/plans/${planId}`, payload);
    console.log("✅ 저장 성공:", response.data);
    alert("수정 완료!");
    router.push(`/mypage/travel/${planId}`);
  } catch (e) {
    console.error("❌ 일정 저장 실패:", e);
    
    // ✅ 상세 에러 정보 출력
    if (e.response) {
      console.error("📛 응답 상태:", e.response.status);
      console.error("📛 응답 데이터:", e.response.data);
      console.error("📛 응답 헤더:", e.response.headers);
      
      // 에러 메시지 표시
      const errorMsg = e.response.data?.message || e.response.data?.error || JSON.stringify(e.response.data);
      alert(`저장 실패 (${e.response.status}): ${errorMsg}`);
    } else if (e.request) {
      console.error("📛 요청 전송됨, 응답 없음:", e.request);
      alert("서버로부터 응답이 없습니다. 네트워크를 확인해주세요.");
    } else {
      console.error("📛 요청 설정 중 오류:", e.message);
      alert(`요청 실패: ${e.message}`);
    }
  }
};

const increaseDays = () => {
  travel.value.daysCount++;
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
  const currentData = {
    planId: Number(planId),
    title: travel.value.title,
    destination: travel.value.region,
    daysCount: travel.value.daysCount,
    selectedThemes: selectedThemes.value,
    dayList: travel.value.days.map((d, dayIdx) => ({
      dayId: d.dayId,
      dayNo: dayIdx + 1,
      date: d.date,
      activities: d.plans.map((p, actIdx) => ({
        travelId: p.travelId,
        travelOrder: actIdx + 1,
        title: p.place_name,
        tag: p.category_group_name,
        placeName: p.place_name,
        addressName: p.address_name,
        categoryGroupName: p.category_group_name,
        placeUrl: p.place_url,
        latitude: p.latitude || 0,
        longitude: p.longitude || 0,
        categoryCode: p.category_code || "",
        startTime: p.start_time || null,
        endTime: p.end_time || null,
      })),
    })),
  }; 

  const targetDay = dayIndex + 1;

  // 🔥 키 이름 수정
  sessionStorage.setItem("editPlanData", JSON.stringify(currentData));
  sessionStorage.setItem("editTargetDay", String(targetDay));

  router.push({
    path: "/draw/final",
    query: {
      planId: currentData.planId,
      targetDay,
      from: "edit",
    },
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

const onPlanChange = () => {
  console.log("✅ 일정 순서 변경");
};

const removeDay = (dayIndex) => {
  if (travel.value.days.length <= 1) {
    alert("하루 이상은 남아 있어야 합니다!");
    return;
  }
  if (confirm(`Day ${dayIndex + 1} 일정을 삭제하시겠습니까?`)) {
    travel.value.days.splice(dayIndex, 1);
    travel.value.daysCount--;

    travel.value.days.forEach((d, idx) => {
      d.dayNo = idx + 1;
    });
  }
};

onMounted(() => {
  const historyState = window.history.state || {};

  console.log("historyState on edit page:", historyState);

  if (historyState.updatedData) {
    const data = historyState.updatedData;

    travel.value.title = data.title;
    travel.value.region = data.destination;
    travel.value.daysCount = data.dayList?.length || data.daysCount || 0;
    selectedThemes.value = data.selectedThemes || [];

    travel.value.days = (data.dayList || []).map((day) => ({
      dayId: day.dayId,
      dayNo: day.dayNo,
      date: day.date,
      displayDate: day.date ? day.date.replaceAll("-", ".") : "",
      plans: (day.activities || []).map((act) => ({
        travelId: act.travelId,
        place_name: act.placeName || act.title || "",
        address_name: act.addressName || act.place || "",
        category_group_name: act.categoryGroupName || act.tag || "",
        place_url: act.placeUrl || "",
        title: act.title || act.placeName || "",
        // 시간 데이터 추가
        start_time: act.startTime || "",
        end_time: act.endTime || "",
      })),
    }));
  } else {
    fetchPlanEdit();
  }
});
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

/* ✅ 시간 입력 스타일 추가 */
.time-inputs {
  display: flex;
  gap: 12px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
}

.time-input-group {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.time-input-group label {
  font-size: 12px;
  font-weight: 500;
  color: #6b7280;
  margin: 0;
}

.time-input {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  transition: border-color 0.2s;
}

.time-input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
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
.readonly-input {
  background: #f3f4f6;
  color: #6b7280;
  cursor: not-allowed;
}
.add-btn:disabled,
.delete-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.day-delete-btn {
  background: none;
  border: none;
  color: #fee2e2;
  font-weight: 600;
  cursor: pointer;
  margin-left: auto;
  font-size: 13px;
  transition: color 0.2s;
}
.day-delete-btn:hover {
  color: #ef4444;
}
</style>