<template>
  <div class="travel-card">
    <!-- 지도 이미지 영역 -->
    <div class="map-image">

      <!-- 리뷰 썸네일이 있을 때 -->
      <div v-if="reviewImages && reviewImages.length > 0" class="thumb-img-wrapper">
        <div class="thumb-bg" :style="{ backgroundImage: `url('${props.reviewImages[0]}')` }"></div>
        <span class="pin"></span>
      </div>

      <!-- 기본 SVG -->
      <!-- <svg v-else class="map-icon" viewBox="0 0 24 24" fill="none">
        <path d="M9 20L3 ..." stroke="currentColor" stroke-width="2"/>
      </svg> -->

    </div>

    <!-- 카드 내용 -->
    <div class="card-content">
      <div class="card-header">
        <span class="city-badge">{{ city }}</span>
        <span class="date">{{ date }}</span>
      </div>

      <h3 class="title">{{ title }}</h3>

      <div class="info-row">
        <div class="info-item">
          <span class="info-icon">👤</span>
          <span class="info-text">{{ user }}</span>
        </div>
        <div class="info-item">
          <img src="@/assets/images/icons/calendar.svg" class="icon" />
          <span class="info-text">{{ days }}</span>
        </div>
        <div class="info-item">
         <img src="@/assets/images/icons/location.svg" class="icon" />
          <span class="info-text">
          {{ destination }}
          <span class="sub-info">{{ places }}개 일정</span>
          </span>
        </div>
      </div>

      <div class="stats-divider"></div>

      <div class="stats-row">
        <div class="stat-group">
          <img src="@/assets/images/icons/heart.svg" class="icon" />
          <span class="stat-value">{{ formatNumber(likes) }}</span>
        </div>
        <div class="stat-group">
          <img src="@/assets/images/icons/view.svg" class="icon" />
          <span class="stat-value">{{ formatNumber(views) }}</span>
        </div>
        <div class="stat-group">
          <img src="@/assets/images/icons/bookmark.svg" class="icon" />
          <span class="stat-value">{{ formatNumber(shares) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  city: String,
  date: String,
  title: String,
  user: String,
  days: [String, Number],
  places: Number,
  likes: Number,
  views: Number,
  shares: Number,
  destination: String,
  reviewImages: {
    type: Array,
    default: () => [],
  }
});


const formatNumber = (num) => {
  if (num >= 1000) {
    return (num / 1000).toFixed(1).replace('.0', '') + 'k';
  }
  return num.toString();
};
</script>

<style scoped>
.travel-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  border: 1px solid #f3f4f6;
}

.travel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #e5e7eb;
}

/* 지도 이미지 영역 */
.map-image {
  width: 100%;
  height: 180px;
  background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 50%, #e9d5ff 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.thumb-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2; 
}

/* 리뷰 이미지 없을 때만 보이는 기본 아이콘 */
.map-icon {
  width: 80px;
  height: 80px;
  color: #93c5fd;
  opacity: 0.5;
  z-index: 1;
}

/* 카드 내용 */
.card-content {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.city-badge {
  background: #eff6ff;
  color: #1e40af;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.01em;
}

.date {
  color: #9ca3af;
  font-size: 12px;
  font-weight: 500;
}

.title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 14px 0;
  line-height: 1.4;
  color: #111827;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  min-height: 44px;
}

/* 정보 행 */
.info-row {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: #6b7280;
}

.info-icon {
  font-size: 14px;
  line-height: 1;
}

.info-text {
  font-weight: 500;
}

/* 구분선 */
.stats-divider {
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #e5e7eb 50%, transparent 100%);
  margin: 14px 0;
}

/* 통계 행 */
.stats-row {
  display: flex;
  justify-content: space-around;
  align-items: center;
}

.stat-group {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.stat-icon {
  font-size: 22px;
  line-height: 1;
  filter: grayscale(0.2);
  transition: all 0.2s;
}

.travel-card:hover .stat-icon {
  filter: grayscale(0);
  transform: scale(1.1);
}

.stat-icon.heart {
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

.stat-value {
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  letter-spacing: -0.02em;
}

/* 반응형 */
@media (max-width: 480px) {
  .card-content {
    padding: 16px;
  }

  .title {
    font-size: 15px;
    min-height: 42px;
  }

  .info-row {
    gap: 8px;
  }

  .info-item {
    font-size: 12px;
  }

  .stat-icon {
    font-size: 20px;
  }

  .stat-value {
    font-size: 13px;
  }
}

/* 다크모드 대응 (선택사항) */
@media (prefers-color-scheme: dark) {
  .travel-card {
    background: #1f2937;
    border-color: #374151;
  }

  .map-image {
    background: linear-gradient(135deg, #1e3a8a 0%, #4338ca 50%, #6b21a8 100%);
  }

  .map-icon {
    color: #3b82f6;
  }

  .city-badge {
    background: #1e3a8a;
    color: #93c5fd;
  }

  .title {
    color: #f9fafb;
  }

  .info-text {
    color: #9ca3af;
  }

  .stats-divider {
    background: linear-gradient(90deg, transparent 0%, #374151 50%, transparent 100%);
  }

  .stat-value {
    color: #d1d5db;
  }
}

.sub-info {
  color: #6b7280; /* 회색톤으로 살짝 덜 강조 */
  font-size: 0.9em;
  margin-left: 4px;
}
</style>