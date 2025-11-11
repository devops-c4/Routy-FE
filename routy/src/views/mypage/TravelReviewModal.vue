<template>
  <div class="overlay" @click.self="closeModal">
    <div class="review-modal">
      <!-- 헤더 -->
      <div class="modal-header">
        <h2>{{ travelTitle }}</h2>
        <button class="close-btn" @click="closeModal">×</button>
      </div>

      <!-- 리뷰 작성 -->
      <div class="section">
        <label>리뷰 작성</label>
        <textarea
          v-model="review"
          placeholder="여행에 대한 간략한 후기를 작성해주세요"
        ></textarea>
      </div>

      <!-- 사진 추가 -->
      <div class="section">
        <div class="photo-header">
          <span>사진 추가 (최대 8장)</span>
          <span>{{ previewImages?.length || 0 }}/8</span>
        </div>
        <input type="file" multiple accept="image/*" @change="onFileChange" />
        <div class="photo-preview">
          <div v-if="!previewImages?.length" class="photo-placeholder">
            <p>여행 사진을 추가해주세요</p>
            <small>최대 8장까지 업로드 가능합니다</small>
          </div>
          <div v-else class="photo-list">
            <div
              v-for="(img, i) in previewImages"
              :key="i"
              class="photo-item"
            >
              <img :src="img.url" />
              <button class="remove-btn" @click="removeNewFile(i)">×</button>
            </div>
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
    @click="confirmRating($event, i)"
    :style="getStarStyle(i)"
  >
    ★
  </span>
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
import { ref, computed, onMounted } from "vue";
import apiClient from "@/utils/axios";

// ====== props & emits ======
const { planId, title } = defineProps({
  planId: { type: Number, required: true },
  title: { type: String, default: "" },
});
const emit = defineEmits(["close", "saved"]);

// ====== 기본 상태 ======
const travelTitle = ref(title || "여행 리뷰");
const review = ref("");
const rating = ref(0)
const hoverRating = ref(0)
const isLocked = ref(false)
const displayRating = computed(() => {
  // 잠겨 있으면 확정 점수만 보여주고, 아니면 호버 중인 점수 보여줌
  return isLocked.value ? rating.value : (hoverRating.value || rating.value)
})

const previewImages = ref([]); // { url, existing: bool }
const newFiles = ref([]);
const reviewId = ref(null);

// ====== 서버에서 기존 리뷰 불러오기 ======
const fetchReviewForm = async () => {
  try {
    const { data } = await apiClient.get(
      `/api/plans/${planId}/reviews/form`
    );

    travelTitle.value = title || data.planTitle || "여행 리뷰";
    review.value = data.content || "";
    rating.value = data.rating || 0;
    reviewId.value = data.reviewId || null;

    previewImages.value = (data.files || []).map((f) => ({
      url: f.url,
      existing: true,
    }));
  } catch (e) {
    console.error("❌ 리뷰 폼 불러오기 실패:", e);
  }
};

// ====== 별점 ======
function handleStarHover(e, index) {
   if (isLocked.value) return
 const rect = e.target.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const ratio = offsetX / rect.width
  const value = index - 1 + (ratio <= 0.5 ? 0.5 : 1)
  hoverRating.value = Math.min(5, Math.max(0.5, value))
}
function confirmRating(e, index) {
  const rect = e.target.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const ratio = offsetX / rect.width
  const value = index - 1 + (ratio <= 0.5 ? 0.5 : 1)

  rating.value = Math.min(5, Math.max(0.5, value))
  hoverRating.value = 0
  isLocked.value = true 
}
function getStarStyle(index) {
  const filled = displayRating.value - (index - 1);
  if (filled >= 1) return { color: "#facc15" };
  if (filled > 0)
    return {
      background: `linear-gradient(90deg, #facc15 ${filled * 100}%, #d1d5db ${
        filled * 100
      }%)`,
      WebkitBackgroundClip: "text",
      color: "transparent",
    };
  return { color: "#d1d5db" };
}

// ====== 파일 업로드 ======
function onFileChange(e) {
  const files = Array.from(e.target.files);
  for (const file of files) {
    if (previewImages.value.length >= 8) break;
    const url = URL.createObjectURL(file);
    previewImages.value.push({ url, existing: false });
    newFiles.value.push(file);
  }
  e.target.value = "";
}

function removeNewFile(idx) {
  const target = previewImages.value[idx];
  previewImages.value.splice(idx, 1);
  if (!target.existing) {
    newFiles.value = newFiles.value.filter(
      (f) => `blob:${f.name}` !== target.url
    );
  }
}

// ====== 제출 ======
async function submitReview() {
  const formData = new FormData();
  if (reviewId.value) formData.append("reviewId", reviewId.value);
  formData.append("planId", planId);
  formData.append("content", review.value);
  formData.append("rating", Math.round((rating.value || 0) * 10) / 10);

  newFiles.value.forEach((file) => {
    formData.append("files", file);
  });

  try {
    await apiClient.post(`/api/plans/${planId}/reviews`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    alert("리뷰가 등록되었습니다!");
    emit("saved");
    emit("close");
  } catch (e) {
    console.error("❌ 리뷰 등록 실패:", e);
    alert("리뷰 등록 중 오류가 발생했습니다.");
  }
}

function closeModal() {
  emit("close");
}

onMounted(fetchReviewForm);
</script>

<style scoped>
/* ====== 전체 레이아웃 ====== */
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.review-modal {
  width: 460px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
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
.photo-item {
  position: relative;
}
.photo-item img {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}
.remove-btn {
  position: absolute;
  top: -4px;
  right: -4px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 12px;
  cursor: pointer;
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
  background: #3b82f6;
  color: white;
  border: none;
}
.btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
