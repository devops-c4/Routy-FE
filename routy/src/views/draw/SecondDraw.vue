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
          <div class="date-input">
            <label for="start">시작일</label>
            <input id="start" type="date" v-model="startDate" />
          </div>
          <span class="tilde">~</span>
          <div class="date-input">
            <label for="end">종료일</label>
            <input id="end" type="date" v-model="endDate" />
          </div>
        </div>

        <div v-if="startDate && endDate" class="date-summary">
          <p>{{ formattedPeriod }}</p>
          <p class="days">총 {{ totalDays }}일</p>
        </div>
      </div>

      <div class="button-group">
        <button class="prev-btn" @click="goPrev">이전</button>
        <button class="next-btn" :disabled="!startDate || !endDate" @click="goNext">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/step-common.css';
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const startDate = ref('');
const endDate = ref('');

const goPrev = () => router.push('/draw/first');
const goNext = () => router.push('/draw/third');

const formattedPeriod = computed(() => {
  const s = new Date(startDate.value), e = new Date(endDate.value);
  return `${s.getMonth() + 1}월 ${s.getDate()}일 - ${e.getMonth() + 1}월 ${e.getDate()}일`;
});

const totalDays = computed(() => {
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
