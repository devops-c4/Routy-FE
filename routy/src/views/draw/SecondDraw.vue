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
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const startDate = ref('')
const endDate = ref('')

// localStorage에서 지역 정보 가져오기
const selectedRegion = JSON.parse(localStorage.getItem('selectedRegion') || '{}')

const goPrev = () => {
  router.push('/draw/first')
}

// Plan 생성하지 않고 localStorage에 저장만
const goNext = () => {
  if (!startDate.value || !endDate.value) {
    alert('날짜를 모두 선택해주세요!')
    return
  }

  if (new Date(endDate.value) < new Date(startDate.value)) {
    alert('종료일은 시작일보다 늦어야 합니다!')
    return
  }

  // 날짜 정보를 localStorage에 저장
  const dateInfo = {
    startDate: startDate.value,
    endDate: endDate.value,
    nights: calculateNights(startDate.value, endDate.value),
    days: calculateDays(startDate.value, endDate.value)
  }
  
  localStorage.setItem('planDates', JSON.stringify(dateInfo))
  
  console.log('날짜 정보 저장:', dateInfo)
  
  // ThirdDraw로 이동
  router.push('/draw/third')
}

const calculateNights = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return Math.floor((endDate - startDate) / (1000 * 60 * 60 * 24))
}

const calculateDays = (start, end) => {
  return calculateNights(start, end) + 1
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

