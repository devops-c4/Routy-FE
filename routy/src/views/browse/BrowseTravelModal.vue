<template>
  <div class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content">
      <!-- 닫기 버튼 -->
      <button class="close-btn" @click="$emit('close')">×</button>

      <!-- 헤더 -->
      <div class="modal-header">
        <div class="title-wrapper">
          <h2 class="title">{{ route.title }}</h2>
          <span class="badge-public">공개</span>
        </div>
        <div class="meta-info">
          <span class="meta-item">
            <span class="meta-icon">👤</span>
            {{ route.username }}
          </span>
          <span class="meta-item">
            <span class="meta-icon">📅</span>
            {{ route.days }}일
          </span>
          <span class="meta-item">
            <span class="meta-icon">📍</span>
            {{ route.destination }}
          </span>
        </div>
      </div>

      <!-- 통계 -->
      <div class="stats-bar">
        <div class="stat-item">
          <button @click="toggleLike" class="like-btn">
            ❤️좋아요 {{ likeCount }}
          </button>
        </div>
        <div class="stat-item">
          <span class="stat-icon">👁️</span>
          <span class="stat-label">조회수</span>
          <span class="stat-value">{{ viewCount }}</span>
        </div>
        <div class="stat-item">
          <button @click="toggleBookmark" class="like-btn">
            🔖 북마크 {{ bookmarkCount }}
          </button>
        </div>
      </div>

      <!-- 여행 후기 -->
      <div class="review-section" v-if="route.review">
        <div class="review-header">
          <div class="user-info">
            <div class="user-avatar">
              <span>👤</span>
            </div>
            <div class="user-details">
              <div class="user-name">{{ route.review.username }}님의 여행 후기</div>
              <div class="review-date">{{ route.review.createdAt }}</div>
            </div>
          </div>
          <div class="rating">
            <span v-for="n in 5" :key="n" class="star">⭐</span>
          </div>
        </div>

        <div v-if="route.review.images?.length" class="review-images">
          <img
            v-for="(img, idx) in route.review.images"
            :key="idx"
            :src="img"
            :alt="`여행 사진 ${idx + 1}`"
            class="review-image"
          />
        </div>

        <div class="review-text">
          {{ route.review.content }}
        </div>
      </div>

      <!-- 상세 일정 -->
      <div class="itinerary-section" v-if="route.dayList?.length">
        <h3 class="section-title">상세 일정</h3>

        <!-- Day 탭 -->
        <div class="day-tabs">
          <button
            v-for="day in route.dayList"
            :key="day.dayNo"
            class="day-tab"
            :class="{ active: selectedDay === day.dayNo }"
            @click="selectedDay = day.dayNo"
          >
            Day {{ day.dayNo }}
            <span class="place-count">{{ day.activities?.length || 0 }}</span>
          </button>
        </div>

        <!-- 장소 목록 -->
        <div class="places-list" v-if="selectedDayActivities?.length">
          <div
            v-for="(activity, idx) in selectedDayActivities"
            :key="activity.travelId"
            class="place-item"
          >
            <div class="place-number">
              <span class="number">{{ idx + 1 }}</span>
              <div
                v-if="idx < selectedDayActivities.length - 1"
                class="connector"
              ></div>
            </div>

            <div class="place-details">
              <div class="place-header">
                <div class="place-name-wrapper">
                  <span class="place-name">{{ activity.placeName }}</span>
                  <span class="place-tag">{{ activity.tag }}</span>
                </div>
              </div>

              <div class="place-address">
                <span class="address-icon">📍</span>
                {{ activity.addressName }}
              </div>

              <!-- ✨ 더 보기 버튼 -->
              <div class="place-footer">
                <a
                  :href="activity.placeUrl"
                  target="_blank"
                  class="btn-more"
                >
                  더 보기 →
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Day에 활동이 없을 때 -->
        <div v-else class="no-activities">
          등록된 일정이 없습니다.
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="modal-footer">
        <div class="footer-date">{{ route.createdAt }} 생성</div>
        <div class="footer-actions">
          <button class="btn-import" @click="importToMyPlans">
            <span class="btn-icon"></span>
            나의 일정으로 불러오기
          </button>
          <button class="btn-close" @click="$emit('close')">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue' 
import apiClient from '@/utils/axios'
import { useRouter } from 'vue-router'

const router = useRouter()

// 부모로부터 전달받는 여행 데이터(route)
const props = defineProps({
  route: Object
})
const emit = defineEmits(['updateRoute', 'close'])

// 상태 관리
const likeCount = ref(0)
const bookmarkCount = ref(0)
const viewCount = ref(0)
const isLiked = ref(false)
const selectedDay = ref(1)

// props.route가 바뀔 때마다 내부 데이터 갱신
watch(
  () => props.route,
  (newVal) => {
    if (newVal) {
      likeCount.value = newVal.likeCount || 0
      bookmarkCount.value = newVal.bookmarkCount || 0
      viewCount.value = newVal.viewCount || 0
    }
  },
  { immediate: true, deep: true }
)

// ✅ 좋아요 토글
const toggleLike = async () => {
  try {
    const res = await apiClient.post(`/api/plans/${props.route.planId}/like`)
    likeCount.value = res.data.likeCount
    isLiked.value = !isLiked.value

    // 부모에도 반영
    emit('updateRoute', {
      planId: props.route.planId,
      likeCount: likeCount.value,
      bookmarkCount: bookmarkCount.value
    })
  } catch (err) {
    console.error('좋아요 요청 실패:', err)
  }
}

// ✅ Day별 활동
const selectedDayActivities = computed(() => {
  const day = props.route.dayList?.find(d => d.dayNo === selectedDay.value)
  return day ? day.activities : []
})

// ✅ 조회수 증가
onMounted(async () => {
  try {
    viewCount.value++ // 즉시 반영
    await apiClient.post(`/api/plans/${props.route.planId}/view`)
  } catch (err) {
    console.error('조회수 증가 실패:', err)
  }
})

// ✅ 북마크 토글
const toggleBookmark = async () => {
  try {
    const res = await apiClient.post(`/api/plans/${props.route.planId}/bookmark`)
    bookmarkCount.value = res.data.bookmarkCount

    // 부모에도 반영
    emit('updateRoute', {
      planId: props.route.planId,
      likeCount: likeCount.value,
      bookmarkCount: bookmarkCount.value
    })
  } catch (err) {
    console.error('북마크 요청 실패:', err)
  }
}

// ✅ 나의 일정으로 불러오기
const importToMyPlans = async () => {
  try {
    const res = await apiClient.post(`/api/plans/${props.route.planId}/copy`)
    alert('내 일정에 추가되었습니다!')
    router.push(`/mypage/travel/${res.data.newPlanId}`)
  } catch (err) {
    console.error('일정 복사 실패:', err)
    alert('복사에 실패했습니다.')
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px -4px rgba(0, 0, 0, 0.1);
  padding: 48px 24px 24px;
}

.close-btn {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 32px;
  height: 32px;
  font-size: 24px;
  background: transparent;
  border: none;
  cursor: pointer;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  background: #f3f4f6;
  color: #1f2937;
}

/* 헤더 */
.modal-header {
  margin-bottom: 24px;
}

.title-wrapper {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #0a0a0a;
  line-height: 1.2;
  margin: 0;
}

.badge-public {
  background: #030213;
  color: white;
  padding: 2px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 500;
  white-space: nowrap;
}

.meta-info {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 600;
  color: #4a5565;
}

.meta-icon {
  font-size: 16px;
}

/* 통계 바 */
.stats-bar {
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 24px;
  padding: 0 20px;
  height: 57px;
  background: linear-gradient(90deg, #eff6ff 0%, #faf5ff 50%, #fdf2f8 100%);
  border: 1px solid #dbeafe;
  border-radius: 14px;
  margin-bottom: 24px;
}

.stat-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-icon {
  font-size: 20px;
}

.stat-label {
  font-size: 14px;
  color: #0a0a0a;
}

.stat-value {
  font-size: 16px;
  font-weight: 700;
  color: #0a0a0a;
}

/* 여행 후기 */
.review-section {
  background: linear-gradient(135deg, white 0%, rgba(238, 245, 254, 0.3) 100%);
  border: 2px solid #dbeafe;
  border-radius: 14px;
  padding: 26px;
  margin-bottom: 24px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2b7fff 0%, #ad46ff 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-name {
  font-size: 16px;
  color: #101828;
}

.review-date {
  font-size: 12px;
  color: #6a7282;
}

.rating {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 20px;
}

.review-images {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.review-image {
  width: 92px;
  height: 92px;
  border-radius: 10px;
  object-fit: cover;
  background: #f3f4f6;
  box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.review-text {
  background: white;
  border-radius: 10px;
  padding: 16px;
  font-size: 16px;
  line-height: 1.6;
  color: #364153;
  white-space: pre-line;
}

/* 상세 일정 */
.itinerary-section {
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  color: #101828;
  margin: 0 0 16px 0;
}

.day-tabs {
  display: flex;
  gap: 0;
  background: #ececf0;
  border-radius: 14px;
  padding: 3px;
  margin-bottom: 24px;
}

.day-tab {
  flex: 1;
  padding: 8px 12px;
  background: transparent;
  border: none;
  border-radius: 14px;
  font-size: 14px;
  font-weight: 500;
  color: #0a0a0a;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.day-tab.active {
  background: white;
}

.place-count {
  background: #155dfc;
  color: white;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 500;
}

.places-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.place-item {
  display: flex;
  gap: 16px;
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 14px;
  padding: 20px;
}

.place-number {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.number {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #2b7fff 0%, #155dfc 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 16px;
  box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.1);
}

.connector {
  width: 2px;
  flex: 1;
  background: linear-gradient(180deg, #8ec5ff 0%, #dbeafe 100%);
}

.place-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.place-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.place-name-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

.place-emoji {
  font-size: 20px;
}

.place-name {
  font-size: 18px;
  color: #0a0a0a;
}

.place-time {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #2b7fff;
  color: white;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 14px;
}

.time-icon {
  font-size: 16px;
}

.place-address {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5565;
}

.address-icon {
  font-size: 16px;
  color: #2b7fff;
}

/* 하단 */
.modal-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.footer-date {
  font-size: 14px;
  color: #6a7282;
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.btn-import {
  background: linear-gradient(90deg, #155dfc 0%, #1447e6 100%);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  transition: all 0.2s;
}

.btn-import:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.15);
}

.btn-icon {
  font-size: 16px;
}

.btn-close {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #0a0a0a;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-close:hover {
  background: #f3f4f6;
}

@media (max-width: 640px) {
  .modal-content {
    padding: 40px 16px 16px;
  }

  .stats-bar {
    flex-wrap: wrap;
    height: auto;
    padding: 12px 16px;
  }

  .review-images {
    overflow-x: auto;
  }

  .footer-actions {
    flex-direction: column;
    width: 100%;
  }

  .btn-import,
  .btn-close {
    width: 100%;
    justify-content: center;
  }
}
.place-footer {
  text-align: right;
  margin-top: 6px;
}

.btn-more {
  display: inline-block;
  font-size: 14px;
  color: #0066ff;
  text-decoration: none;
  border: 1px solid #0066ff;
  border-radius: 6px;
  padding: 4px 10px;
  transition: all 0.2s;
}

.btn-more:hover {
  background-color: #0066ff;
  color: #fff;
}

.place-tag {
  display: inline-block;
  background-color: #2563eb; /* 파란색 */
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  border-radius: 20px;
  padding: 4px 10px;
  margin-left: 8px;
  vertical-align: middle;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
}
.like-btn {
  background: transparent;
  border: none;
  font-size: 18px;
  cursor: pointer;
  transition: transform 0.1s ease;
}
.like-btn.active {
  color: red;
  transform: scale(1.2);
}
.like-btn:hover {
  transform: scale(1.1);
}

</style>