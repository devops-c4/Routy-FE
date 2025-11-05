<template>
  <div class="step-container">
    <div class="step-content full-layout">
      <!-- 상단 헤더 -->
      <header class="top-bar">
        <div class="back-btn" @click="goPrev">← 이전</div>
        <div class="arrive-time">비행기 도착: 09:00</div>
      </header>

      <div class="main-layout">
        <!-- 왼쪽 사이드바 -->
        <aside class="left-panel">
          <div class="left-actions">
            <div class="action-row">
              <button class="left-btn">숙소 선택</button>
              <button class="left-btn">자동 정렬</button>
            </div>
            <button class="end-btn">일정 종료</button>
          </div>

          <div class="info-box blue">
            <span>시작 시간:</span>
            <strong>09:00</strong>
          </div>
          <div class="info-box gray">
            뭐든 맘껏 돌아보고 맘껏 드셔봐요~
          </div>

          <div class="empty-guide">
            오른쪽에서 장소를 추가해주세요
          </div>

          <div class="day-control">
            <div class="day-buttons">
              <button class="day-btn gray">어제</button>
              <span class="day-label">1일차</span>
              <button class="day-btn gray">내일</button>
            </div>

            <div class="day-numbers">
              <button class="day-number active">1</button>
              <button class="day-number">2</button>
              <button class="day-number">3</button>
            </div>
          </div>
        </aside>

        <!-- 중앙 지도 -->
        <section class="map-section">
          <div class="map-box">
            <div class="map-header">
              <div class="map-title">📍 추천 장소 지도</div>
              <div class="map-legend">
                <span><i class="dot orange"></i> 맛집</span>
                <span><i class="dot yellow"></i> 카페</span>
                <span><i class="dot blue"></i> 관광지</span>
              </div>
            </div>

            <div class="map-canvas">
              <!-- 예시: 장소 마커 -->
              <div v-for="(marker, i) in markers" :key="i" class="marker" :style="marker.style">
                {{ marker.icon }}
              </div>
            </div>
          </div>
        </section>

        <!-- 오른쪽 검색/리스트 -->
        <aside class="right-panel">
          <div class="search-header">검색</div>
          <div class="filter-bar">
            <button class="filter-btn active">맛집</button>
            <button class="filter-btn">카페</button>
            <button class="filter-btn">관광지</button>
          </div>

          <div class="place-list">
            <div
              v-for="(p, i) in places"
              :key="i"
              class="place-card"
            >
              <div class="place-info">
                <div class="place-name">{{ p.name }}</div>
                <div class="place-address">{{ p.address }}</div>
                <div class="place-meta">
                  <span>★ {{ p.rating }}</span>
                  <span>🚗 약 {{ p.time }}</span>
                </div>
              </div>
              <button class="add-btn">추가</button>
            </div>
          </div>

          <div class="save-section">
            <button class="save-btn">일정 저장</button>
          </div>
        </aside>
      </div>

      <!-- 숙소 모달 -->
      <div v-if="showModal" class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>숙소를 먼저 도착하시나요?</h3>
            <p>첫날 일정에 숙소를 포함하시겠습니까?</p>
          </div>
          <div class="modal-actions">
            <button class="modal-btn cancel" @click="showModal = false">아니요</button>
            <button class="modal-btn confirm" @click="confirmStay">예</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import '@/assets/css/draw.css'
import '@/assets/css/step-common.css'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showModal = ref(true)

const goPrev = () => router.push('/draw/third')
const confirmStay = () => {
  showModal.value = false
  alert('숙소가 첫 일정에 포함되었습니다!')
}

// 나중에 수정
const markers = [
  { icon: '🍽️', style: { top: '20%', left: '15%' } },
  { icon: '☕', style: { top: '40%', left: '50%' } },
  { icon: '🏛️', style: { top: '60%', left: '30%' } },
]

const places = [
  { name: '올레국수', address: '제주시 관덕로 14길 17', rating: 4.7, time: '45분' },
  { name: '흑돼지 맛집', address: '애월읍 하귀2리 56', rating: 4.8, time: '60분' },
  { name: '해녀의 집', address: '구좌읍 해녀박물관길 26', rating: 4.6, time: '60분' },
]
</script>

<style scoped>
.full-layout {
  
  max-width: 1520px;
  /* background: white; */
  border-radius: 14px;
  overflow: hidden;
}

/* 상단 바 */
.top-bar {
  /* background: white; */
  border-bottom: 1px solid rgba(0,0,0,0.1);
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
}
.back-btn { cursor: pointer; font-weight: 500; }
.arrive-time { color: #4A5565; font-size: 14px; }

/* 전체 레이아웃 */
.main-layout {
  display: flex;
  height: 860px;
}

/* 왼쪽 패널 */
.left-panel {
  width: 320px;
  border-right: 1px solid rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.left-actions { padding: 16px; border-bottom: 1px solid rgba(0,0,0,0.1); }
.action-row { display: flex; gap: 8px; margin-bottom: 12px; }
.left-btn {
  flex: 1;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  /* background: white; */
  height: 32px;
  cursor: pointer;
}
.end-btn {
  width: 100%;
  height: 32px;
  border-radius: 8px;
  background: #F54900;
  color: white;
  border: none;
}

.info-box {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}
/* .info-box.blue { background: #EFF6FF; } */
/* .info-box.gray { background: #F9FAFB; } */

.empty-guide {
  padding: 32px;
  color: #6A7282;
  text-align: center;
}

.day-control {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding: 16px;
}
.day-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}
.day-btn {
  width: 60px;
  height: 40px;
  border-radius: 4px;
  border: 1px solid rgba(0,0,0,0.1);
  /* background: white; */
  opacity: 0.3;
}
.day-label { font-weight: 500; }
.day-numbers {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
}
.day-number {
  width: 28px; height: 28px; border-radius: 4px;
  background: #F3F4F6; color: #4A5565; border: none;
}
.day-number.active {
  background: #155DFC; color: white;
}

/* 중앙 지도 */
.map-section { flex: 1; padding: 24px; }
.map-box {
  position: relative;
  background: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%);
  border-radius: 10px;
  height: 100%;
  overflow: hidden;
}
.map-header {
  position: absolute;
  top: 16px; left: 16px;
  background: white;
  border-radius: 10px;
  padding: 8px 16px;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
  display: flex; justify-content: space-between; align-items: center;
  width: calc(100% - 32px);
}
.map-legend { display: flex; gap: 12px; font-size: 14px; }
.dot {
  display: inline-block; width: 12px; height: 12px; border-radius: 50%;
}
.dot.orange { background: #FF6900; }
.dot.yellow { background: #FE9A00; }
.dot.blue { background: #2B7FFF; }

.map-canvas {
  width: 100%; height: 100%; position: relative;
}
.marker {
  position: absolute;
  width: 40px; height: 40px;
  border-radius: 50%;
  background: white;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
  display: flex; justify-content: center; align-items: center;
  font-size: 20px;
}

/* 오른쪽 패널 */
.right-panel {
  width: 384px;
  border-left: 1px solid rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}
.search-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  font-size: 16px;
}
.filter-bar {
  display: flex;
  background: #F9FAFB;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  padding: 12px 16px;
  gap: 8px;
}
.filter-btn {
  flex: 1;
  border-radius: 4px;
  border: 1px solid #D1D5DC;
  background: white;
  height: 40px;
}
.filter-btn.active {
  border-color: #155DFC;
  color: #155DFC;
  font-weight: 500;
}

.place-list {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.place-card {
  background: #F9FAFB;
  border-radius: 10px;
  border: 1px solid #E5E7EB;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.place-name { font-weight: 500; }
.place-address { font-size: 12px; color: #6A7282; margin-bottom: 4px; }
.place-meta { font-size: 12px; color: #4A5565; display: flex; gap: 12px; }
.add-btn {
  background: #155DFC;
  color: white;
  border-radius: 8px;
  border: none;
  padding: 6px 12px;
  font-size: 12px;
}

.save-section {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding: 16px;
}
.save-btn {
  width: 100%;
  height: 36px;
  background: #155DFC;
  border: none;
  border-radius: 8px;
  color: white;
  font-weight: 500;
}

/* 모달 */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex; justify-content: center; align-items: center;
}
.modal {
  width: 520px;
  background: white;
  border-radius: 10px;
  padding: 24px;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
}
.modal-header h3 {
  margin: 0; font-size: 18px; font-weight: 600;
}
.modal-header p {
  color: #717182; margin-top: 8px; font-size: 14px;
}
.modal-actions {
  margin-top: 24px;
  display: flex; justify-content: flex-end; gap: 8px;
}
.modal-btn {
  border-radius: 8px; padding: 8px 16px; font-weight: 500; cursor: pointer;
}
.modal-btn.cancel { background: white; border: 1px solid rgba(0,0,0,0.1); }
.modal-btn.confirm { background: #155DFC; color: white; border: none; }
</style>
