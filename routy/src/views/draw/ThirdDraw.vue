<template>
  <div class="step-container">
    <div class="step-content">
      <!-- 상단 단계 -->
      <div class="step-top">
        <div class="step-number">단계 3 / 4</div>
        <button class="cancel-btn">취소</button>
      </div>

      <!-- 진행바 -->
      <div class="progress-bar">
        <div class="progress-fill step3"></div>
      </div>

      <!-- 카드 -->
      <div class="card">
        <h3 class="card-title">어떤 테마를 원하시나요?</h3>
        <p class="card-subtitle">원하는 테마를 모두 선택해주세요 (중복 선택 가능)</p>

        <div class="theme-grid">
          <div
            v-for="(theme, i) in themes"
            :key="i"
            class="theme-card"
            :class="{ selected: selectedThemes.includes(theme.name) }"
            @click="toggleTheme(theme.name)"
          >
            <div class="emoji">{{ theme.icon }}</div>
            <div class="label">{{ theme.name }}</div>
          </div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="button-group">
        <button class="prev-btn" @click="goPrev">이전</button>
        <button
          class="next-btn"
          :disabled="selectedThemes.length === 0"
          @click="goNext"
        >
          다음
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/step-common.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
// 나중에 수정
const themes = [
  { icon: '🍽️', name: '맛집' },
  { icon: '☕', name: '카페' },
  { icon: '🏛️', name: '관광지' },
  { icon: '🌳', name: '자연' },
  { icon: '🎡', name: '놀이' },
  { icon: '🏖️', name: '휴양' },
]

const selectedThemes = ref([])

const toggleTheme = (name) => {
  const index = selectedThemes.value.indexOf(name)
  if (index === -1) selectedThemes.value.push(name)
  else selectedThemes.value.splice(index, 1)
}

const goPrev = () => router.push('/draw/second')
const goNext = () => router.push('/draw/final')
</script>

<style scoped>
.card {
  align-items: center;
  text-align: center;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0a0a0a;
}

.card-subtitle {
  color: #4a5565;
  font-size: 15px;
  margin-bottom: 16px;
}

/* 테마 버튼 영역 */
.theme-grid {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 24px;
  margin-top: 16px;
}

.theme-card {
  width: 140px;
  height: 140px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.2s;
  font-size: 16px;
}

.theme-card .emoji {
  font-size: 28px;
  margin-bottom: 8px;
}

.theme-card.selected {
  background: #eff6ff;
  border: 2px solid #155dfc;
  box-shadow: 0 0 0 2px #155dfc;
}
</style>