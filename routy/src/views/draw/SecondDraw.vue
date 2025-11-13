<template>
  <div class="step-container">
    <div class="step-content">
      <div class="step-top">
        <div class="step-number">단계 2 / 4</div>
        <button class="cancel-btn">취소</button>
      </div>

      <div class="progress-bar">
        <div class="progress-fill step2"></div>
      </div>

      <div class="card">
        <h3 class="card-title">언제 여행하시나요?</h3>
        <p class="card-subtitle">여행 시작일과 종료일을 선택해주세요</p>

        <div class="date-grid">
          <!-- 시작일 -->
          <div class="date-input">
            <label for="start">시작일</label>
            <input
              id="start"
              type="date"
              v-model="startDate"
              :min="today"
              @change="handleStartChange"
            />
          </div>

          <span class="tilde">~</span>

          <!-- 종료일 -->
          <div class="date-input">
            <label for="end">종료일</label>
            <input
              id="end"
              type="date"
              v-model="endDate"
              :min="startDate || today"
            />
          </div>
        </div>

        <div v-if="startDate && endDate" class="date-summary">
          <p>{{ formattedPeriod }}</p>
          <p class="days">총 {{ totalDays }}일</p>
        </div>
      </div>

      <div class="button-group">
        <button class="prev-btn" @click="goPrev">이전</button>
        <button
          class="next-btn"
          :disabled="!startDate || !endDate"
          @click="goNext"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/draw.css'
import '@/assets/css/step-common.css';
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import apiClient from '@/utils/axios';

const router = useRouter();
const route = useRoute();

const startDate = ref('');
const endDate = ref('');

// 오늘 날짜를 YYYY-MM-DD 형식으로 계산
const today = new Date().toISOString().split('T')[0];

// 시작일 변경 시 종료일이 이전 날짜면 자동 초기화
const handleStartChange = () => {
  if (endDate.value && endDate.value < startDate.value) {
    endDate.value = '';
  }
};

// 1단계에서 넘어온 지역 정보
const regionId = route.query.regionId;
const regionName = route.query.regionName;

// 이전 단계 이동
const goPrev = () => {
  router.push({
    path: '/draw/first',
    query: {
      city: regionName  // 돌아가도 이전에 선택한 것은 여전히 선택한 채로 넘어가도록 변경
    }
  });
};

// 다음 단계 (일정 생성 후 이동)
const goNext = async () => {
  if (!startDate.value || !endDate.value) {
    alert('시작일과 종료일을 모두 선택해주세요!');
    return;
  }

  try {
    const payload = {
      planTitle: `${regionName} 여행 일정`,
      startDate: startDate.value,
      endDate: endDate.value,

      regionId: regionId,
      // userId는 백엔드에서 SecurityContext로 자동 추출
    };

    const res = await apiClient.post('/api/plans', payload);
    const planId = res.data.planId;

    await apiClient.post(`/api/plans/${planId}/durations`, { totalDays: totalDays.value });

    const query = {
      planId,
      totalDays: totalDays.value
    };
    

    router.push({
      path: '/draw/third',
      query: query
    });

    console.log('일정 생성 성공:', res.data);
  } catch (err) {
    console.error('일정 생성 실패:', err);
    alert('일정 저장 중 오류가 발생했습니다!');
  }
};

// 기간 텍스트
const formattedPeriod = computed(() => {
  if (!startDate.value || !endDate.value) return '';
  const s = new Date(startDate.value);
  const e = new Date(endDate.value);
  return `${s.getMonth() + 1}월 ${s.getDate()}일 - ${e.getMonth() + 1}월 ${e.getDate()}일`;
});

// 총 일수 계산
const totalDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0;
  const diff = new Date(endDate.value) - new Date(startDate.value);
  return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
});
</script>



<style scoped>
.card {
  background: white;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 32px;
  display: flex;
  flex-direction: column;
  align-items: center; /* 중앙 정렬 */
  text-align: center; /* 텍스트도 가운데 */
  gap: 16px;
}

/* 제목 중앙 */
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0A0A0A;
}

/* 부제목 중앙 */
.card-subtitle {
  color: #4A5565;
  font-size: 15px;
}

/* 날짜 선택 그리드 */
.date-grid {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 16px;
  margin-top: 24px;
}

.date-input label {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
  color: #4A5565;
  text-align: left;
}

.date-input input {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 12px;
}

.date-summary {
  text-align: center;
  color: #364153;
  margin-top: 16px;
}

.days {
  color: #155DFC;
  font-weight: 500;
}
</style>
