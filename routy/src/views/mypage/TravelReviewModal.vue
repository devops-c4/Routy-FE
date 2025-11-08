<template>
  <div class="overlay" @click.self="closeModal">
    <div class="review-modal">
      <!-- 헤더 -->
      <div class="modal-header">
        <h2>{{ travel.title }}</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- 리뷰 작성 -->
      <div class="section">
        <label>리뷰 작성</label>
        <textarea v-model="review" placeholder="여행에 대한 간략한 후기를 작성해주세요"></textarea>
      </div>

      <!-- 사진 추가 -->
      <div class="section">
        <div class="photo-header">
          <span>사진 추가 (최대 8장)</span>
          <span>{{ photos.length }}/8</span>
        </div>
        <input type="file" multiple accept="image/*" @change="onFileChange" />
        <div class="photo-preview">
          <div v-if="!photos.length" class="photo-placeholder">
            <p>여행 사진을 추가해주세요</p>
            <small>최대 8장까지 업로드 가능합니다</small>
          </div>
          <div v-else class="photo-list">
            <img v-for="(img, i) in photos" :key="i" :src="img" />
          </div>
        </div>
      </div>

      <!-- 별점 평가 -->
      <div class="section">
        <label>별점 평가 (5점 만점)</label>
        <div class="stars">
          <span
            v-for="i in 5"
            :key="i"
            class="star"
            @mousemove="handleStarHover($event, i)"
            @mouseleave="hoverRating = 0"
            @click="confirmRating(i)"
            :style="getStarStyle(i)"
          >★</span>
          <span class="score">{{ displayRating.toFixed(1) }}/5점</span>
        </div>
      </div>

      <!-- 버튼 영역 -->
      <div class="modal-footer">
        <button class="btn-cancel" @click="closeModal">닫기</button>
        <button class="btn-submit" :disabled="!review" @click="submitReview">
          리뷰 등록하기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const emit = defineEmits(['close'])

const travel = ref({
  title: '제주도 힐링 여행',
})

const review = ref('')
const photos = ref([])
const rating = ref(0)
const hoverRating = ref(0)

const displayRating = computed(() => hoverRating.value || rating.value)

/* ✅ 별 위 마우스 움직임 감지 (정확한 반점 계산) */
function handleStarHover(e, index) {
  const rect = e.target.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const ratio = offsetX / rect.width
  const value = index - 1 + (ratio <= 0.5 ? 0.5 : 1) // 0.5 또는 1점 단위
  hoverRating.value = Math.min(5, Math.max(0.5, value))
}

/* ✅ 클릭 시 확정 */
function confirmRating() {
  rating.value = hoverRating.value
}

/* ✅ 별의 색상 채우기 */
function getStarStyle(index) {
  const filled = displayRating.value - (index - 1)
  let gradient = ''
  if (filled >= 1) gradient = '#facc15'
  else if (filled > 0) {
    gradient = `linear-gradient(90deg, #facc15 ${filled * 100}%, #d1d5db ${filled * 100}%)`
  } else gradient = '#d1d5db'

  return {
    background: gradient,
    WebkitBackgroundClip: 'text',
    color: 'transparent',
  }
}

/* ====== 사진 업로드 ====== */
function onFileChange(e) {
  const files = Array.from(e.target.files).slice(0, 8)
  photos.value = []
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = (ev) => photos.value.push(ev.target.result)
    reader.readAsDataURL(file)
  })
}

/* ====== 닫기 & 등록 ====== */
function closeModal() {
  emit('close')
}
function submitReview() {
  alert(`리뷰 등록 완료!\n별점: ${rating.value.toFixed(1)}점`)
}
</script>

<style scoped>
/* ====== 전체 레이아웃 ====== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.review-modal {
  width: 460px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  padding: 20px;
  position: relative;
  max-height: 85vh;
  overflow-y: auto;
}

/* ====== 헤더 ====== */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #eee;
  padding-bottom: 12px;
}
.modal-header h2 {
  font-size: 18px;
  font-weight: 700;
}
.close-btn {
  border: none;
  background: none;
  font-size: 20px;
  cursor: pointer;
}

/* ====== 공통 섹션 ====== */
.section {
  margin-top: 20px;
}
.section label {
  font-size: 14px;
  font-weight: 600;
  display: block;
  margin-bottom: 8px;
}

/* ====== 텍스트박스 ====== */
textarea {
  width: 100%;
  height: 100px;
  border-radius: 8px;
  border: 1px solid #ddd;
  padding: 10px;
  resize: none;
  font-family: inherit;
}

/* ====== 사진 업로드 ====== */
.photo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}
input[type="file"] {
  display: block;
  margin-top: 8px;
}
.photo-preview {
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 10px;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
}
.photo-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
}
.photo-list img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}
.photo-placeholder p {
  color: #666;
}
.photo-placeholder small {
  color: #aaa;
}

/* ====== 별점 평가 ====== */
.stars {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 26px;
  cursor: pointer;
  user-select: none;
}
.star {
  transition: transform 0.15s ease;
}
.star:hover {
  transform: scale(1.1);
}
.score {
  margin-left: 8px;
  font-size: 14px;
  color: #555;
  font-weight: 500;
}

/* ====== 버튼 ====== */
.modal-footer {
  display: flex;
  gap: 10px;
  margin-top: 24px;
}
.btn-cancel,
.btn-submit {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}
.btn-cancel {
  background: #fff;
  border: 1px solid #ccc;
}
.btn-submit {
  background: #3B82F6;
  color: white;
  border: none;
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
