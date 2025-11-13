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

const router = useRouter()

const startDate = ref('')
const endDate = ref('')

// 지역 정보 (1단계에서 저장한 값)
const selectedRegion = JSON.parse(localStorage.getItem('selectedRegion') || '{}')
const regionName = selectedRegion.regionName
const regionId = selectedRegion.regionId

// 총 날짜 (n일)
const totalDays = computed(() => {
  if (!startDate.value || !endDate.value) return 0
  const s = new Date(startDate.value)
  const e = new Date(endDate.value)
  return Math.floor((e - s) / (1000 * 60 * 60 * 24)) + 1
})

const goPrev = () => {
  router.push('/draw/first')
}

const goNext = async () => {
  if (!startDate.value || !endDate.value) {
    alert('날짜를 모두 선택해주세요!')
    return
  }

  if (new Date(endDate.value) < new Date(startDate.value)) {
    alert('종료일이 시작일보다 빠릅니다!')
    return
  }

  try {
    const payload = {
      planTitle: `${regionName} 여행 일정`,
      startDate: startDate.value,
      endDate: endDate.value,
      regionId: regionId
    };

    // Plan 생성
    const res = await apiClient.post('/api/plans', payload);
    const planId = res.data.planId;

    // Duration 저장
    await apiClient.post(`/api/plans/${planId}/durations`, { totalDays: totalDays.value });

    // localStorage에 날짜 저장
    localStorage.setItem('planDates', JSON.stringify({
      startDate: startDate.value,
      endDate: endDate.value,
      totalDays: totalDays.value
    }));

    // Third로 이동
    router.push({
      path: '/draw/third',
      query: { planId, totalDays: totalDays.value }
    });

  } catch (err) {
    console.error('일정 생성 실패:', err);
    alert('일정 저장 중 오류가 발생했습니다!');
  }
}

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
