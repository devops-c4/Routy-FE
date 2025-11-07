<template>
  <!-- 반투명 배경 -->
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="modal">
      <!-- 상단 헤더 -->
      <header class="modal-header">
        <h2>{{ travelTitle }}</h2>
        <button class="close-btn" @click="$emit('close')">×</button>
      </header>

      <!-- 작성자 정보 -->
      <section class="review-user">
        <div class="avatar">여</div>
        <div class="info">
          <p class="name">여행러버</p>
          <p class="date">2025. 11. 4.</p>
        </div>
      </section>

      <!-- 리뷰 본문 -->
      <section class="review-content">
        <label>리뷰 작성</label>
        <textarea
          placeholder="여행에 대한 전반적인 후기를 작성해주세요"
          v-model="reviewText"
        ></textarea>
      </section>

      <!-- 사진 추가 -->
      <section class="photo-upload">
        <div class="photo-header">
          <label>사진 추가 (최대 8장)</label>
          <span>{{ images.length }}/8</span>
        </div>
        <div class="photo-box" @click="selectPhotos">
          <input
            type="file"
            multiple
            accept="image/*"
            ref="fileInput"
            @change="handleFiles"
            style="display: none"
          />
          <p>여행 사진을 추가해주세요</p>
          <small>최대 8장까지 업로드 가능합니다</small>
        </div>
        <div class="photo-preview" v-if="images.length">
          <img v-for="(img, idx) in images" :key="idx" :src="img" />
        </div>
      </section>

      <!-- 상세 일정 -->
      <section class="day-section">
        <div class="day-header">
          <label>상세 일정</label>
          <button class="btn-outline-blue" @click="addDay">Day 추가</button>
        </div>

        <div v-for="(day, idx) in days" :key="idx" class="day-card">
          <div class="day-title">
            <div class="day-circle">{{ idx + 1 }}</div>
            <h4>Day {{ idx + 1 }}</h4>
          </div>

          <div class="form-group">
            <label>날짜</label>
            <input type="date" v-model="day.date" />
          </div>

          <div class="form-group">
            <label>내용</label>
            <textarea
              placeholder="이 날 무엇을 했는지 작성해주세요"
              v-model="day.content"
            ></textarea>
          </div>
        </div>
      </section>

      <!-- 공개 범위 -->
      <section class="public-range">
        <label>공개 범위</label>
        <select v-model="visibility">
          <option>전체 공개</option>
          <option>친구 공개</option>
          <option>비공개</option>
        </select>
      </section>

      <!-- 하단 버튼 -->
      <footer class="footer">
        <button class="btn-outline-gray" @click="$emit('close')">닫기</button>
        <button class="btn-blue" @click="submitReview">리뷰 등록하기</button>
      </footer>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const props = defineProps({
  travelTitle: {
    type: String,
    default: '제주도 힐링 여행',
  },
})

const reviewText = ref('')
const images = ref([])
const days = ref([{ date: '', content: '' }])
const visibility = ref('전체 공개')
const fileInput = ref(null)

const selectPhotos = () => fileInput.value.click()
const handleFiles = e => {
  const files = Array.from(e.target.files)
  const urls = files.slice(0, 8 - images.value.length).map(f => URL.createObjectURL(f))
  images.value.push(...urls)
}

const addDay = () => days.value.push({ date: '', content: '' })

const submitReview = () => {
  alert('리뷰가 등록되었습니다!')
}
</script>

<style scoped>
/* 배경 */
.modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

/* 모달 */
.modal {
  width: 520px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: relative;
}

/* 헤더 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 0.8px solid rgba(0,0,0,0.1);
  padding-bottom: 8px;
}
.modal-header h2 { font-size: 18px; font-weight: 700; color: #0a0a0a; }
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: #0a0a0a;
  cursor: pointer;
}

/* 작성자 */
.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%);
  color: white;
  font-weight: 600;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}
.info p { margin: 0; font-size: 14px; }
.info .date { color: #6A7282; font-size: 12px; }

/* 리뷰 본문 */
.review-content textarea {
  width: 100%;
  min-height: 100px;
  padding: 8px 12px;
  border-radius: 8px;
  background: #f3f3f5;
  border: none;
  resize: none;
  font-size: 14px;
}

/* 사진 추가 */
.photo-upload { display: flex; flex-direction: column; gap: 8px; }
.photo-header {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}
.photo-box {
  border: 1.6px dashed #d1d5dc;
  border-radius: 10px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  color: #6A7282;
}
.photo-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.photo-preview img {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  object-fit: cover;
}

/* 일정 */
.day-section { display: flex; flex-direction: column; gap: 16px; }
.day-header { display: flex; justify-content: space-between; align-items: center; }
.day-card {
  border: 0.8px solid rgba(0,0,0,0.1);
  border-radius: 10px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.day-title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.day-circle {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  border-radius: 50%;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.form-group label { font-size: 14px; }
.form-group input, .form-group textarea {
  width: 100%;
  border-radius: 8px;
  border: 1px solid rgba(0,0,0,0.1);
  padding: 8px;
  font-size: 14px;
}
.form-group textarea {
  background: #f3f3f5;
  resize: none;
}

/* 공개 범위 */
.public-range {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 0.8px solid rgba(0,0,0,0.1);
  padding-top: 12px;
}
.public-range select {
  background: #f3f3f5;
  border: none;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 14px;
}

/* 하단 버튼 */
.footer {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 0.8px solid rgba(0,0,0,0.1);
  padding-top: 12px;
}
.btn-outline-gray {
  flex: 1;
  background: white;
  border: 0.8px solid #d1d5dc;
  border-radius: 8px;
  font-size: 14px;
  padding: 8px 0;
}
.btn-blue {
  flex: 1;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  padding: 8px 0;
}
</style>
