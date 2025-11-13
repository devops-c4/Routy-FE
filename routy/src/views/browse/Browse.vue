<template>
  <div class="browse-container">
    <section class="main-section">
      <h1 class="main-title">✈️실시간 인기 여행 일정✨</h1>
      <p class="main-subtitle">다른 여행자들이 공유한 일정을 확인하세요</p>

      <!-- 필터 탭 -->
      <div class="filter-tabs">
        <div class="sort-buttons">
          <button
            class="tab-btn"
            :class="{ active: sortType === 'latest' }"
            @click="changeSort('latest')"
          >
            최신순
          </button>
          <button
            class="tab-btn"
            :class="{ active: sortType === 'bookmark' }"
            @click="changeSort('bookmark')"
          >
            북마크순
          </button>
          <button
            class="tab-btn"
            :class="{ active: sortType === 'view' }"
            @click="changeSort('view')"
          >
            조회순
          </button>
        </div>

        <div class="filter-dropdowns">
          <select class="filter-select" v-model="selectedRegion" @change="applyFilter">
            <option value="">지역</option>
            <option 
              v-for="region in regions" 
              :key="region.regionId" 
              :value="region.regionId"
            >
              {{ region.regionName }}
            </option>
          </select>

          <select class="filter-select" v-model="selectedDays" @change="applyFilter">
            <option value="">일정</option>
            <option value="1">1일</option>
            <option value="2">2일</option>
            <option value="3">3일</option>
            <option value="4">4일</option>
            <option value="5">5일 이상</option>
          </select>

          <span class="result-count">총 {{ routes.length }}개의 여행 일정</span>
        </div>
      </div>


      <!-- 카드 리스트 -->
      <div class="card-grid">
        <TravelCard
          v-for="(route, idx) in routes"
          :key="route.planId || idx"
          :city="route.destination"
          :date="`${route.startDate} ~ ${route.endDate}`"
          :title="route.title"
          :user="route.userNickname"
          :days="`${route.days}일`"
          :places="route.placeCount"
          :likes="route.likeCount"
          :views="route.viewCount"
          :shares="route.bookmarkCount"
          @click="openModal(route)"
        />
      </div>
      <div v-if="loading" class="loading-text">불러오는 중...</div>
    </section> 

    <!-- 모달 -->
    <TravelDetailModal
      v-if="selectedRoute"
      :route="selectedRoute"
      @updateRoute="updateRoute"
      @close="closeModal"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import TravelCard from '@/views/browse/BrowseTravelCard.vue'
import TravelDetailModal from '@/views/browse/BrowseTravelModal.vue'

const selectedRoute = ref(null)
const regions = ref([])
const selectedRegion = ref('')
const selectedDays = ref('')
const routes = ref([])
const page = ref(0)
const size = 9
const hasMore = ref(true)
const loading = ref(false)
const sortType = ref('latest') 

const applyFilter = () => {
  page.value = 0
  fetchPublicPlans(false)
}

//  1. 지역 목록 불러오기
const fetchRegions = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/plans/regions')
    regions.value = response.data
  } catch (error) {
    console.error('지역 목록 불러오기 실패:', error)
  }
}

// 2. 공개 일정 목록 불러오기 (페이지 단위)
const fetchPublicPlans = async (append = false) => {
  if (loading.value) return
  loading.value = true
  try {
    const res = await axios.get('http://localhost:8080/api/plans/public', {
      params: {
        page: page.value,
        size,
        sort: sortType.value,
        regionId: selectedRegion.value,
        days: selectedDays.value,
      },
    })
    const data = res.data.content || res.data
    if (append) routes.value.push(...data)
    else routes.value = data
    hasMore.value = data.length === size
  } catch (err) {
    console.error('공개 일정 목록 불러오기 실패:', err)
  } finally {
    loading.value = false
  }
}

// 3. 더 보기 버튼
const loadMore = () => {
  page.value++
  fetchPublicPlans(true)
}

// 접기
const collapseList = () => {
  page.value = 0
  fetchPublicPlans(false)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

//  마운트 시 실행
onMounted(() => {
  fetchRegions()
  fetchPublicPlans()
})

// 모달
const openModal = async (route) => {
  selectedRoute.value = null
  try {
    // ✅ 최신 데이터로 다시 요청
    const res = await axios.get(`http://localhost:8080/api/plans/public/${route.planId}`)
    selectedRoute.value = res.data
    document.body.style.overflow = 'hidden'

    // ✅ 조회수 증가 요청 (작성자 제외)
    await axios.post(`http://localhost:8080/api/plans/${route.planId}/view`)

    // ✅ 부모 리스트에서 해당 카드 카운트도 즉시 반영
    const target = routes.value.find(r => r.planId === route.planId)
    if (target) target.viewCount++
  } catch (error) {
    console.error('상세 일정 불러오기 실패:', error)
  }
}

const closeModal = () => {
  selectedRoute.value = null
  document.body.style.overflow = ''
}

// 정렬 변경
const changeSort = (type) => {
  if (sortType.value === type) return
  sortType.value = type
  page.value = 0
  fetchPublicPlans(false)
}

const updateRoute = (updated) => {
  const target = routes.value.find(r => r.planId === updated.planId)
  if (target) {
    target.likeCount = updated.likeCount
    target.bookmarkCount = updated.bookmarkCount
  }

  //모달 내부도 즉시 반영되게 selectedRoute도 갱신
  if (selectedRoute.value && selectedRoute.value.planId === updated.planId) {
    selectedRoute.value.likeCount = updated.likeCount
    selectedRoute.value.bookmarkCount = updated.bookmarkCount
  }
}

</script>


<style scoped>
.browse-container {
  width: 100%;
  min-height: 100vh;
}

.main-section {
  max-width: 1200px;
  margin: 0 auto;
  padding: 60px 24px 80px;
}

.main-title {
  font-size: 26px;
  font-weight: 700;
  text-align: center;
  margin: 0 0 8px 0;
  color: #1f2937;
}

.main-subtitle {
  font-size: 16px;
  color: #6b7280;
  text-align: center;
  margin: 0 0 40px 0;
}

.filter-tabs {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 40px;
  gap: 16px;
  flex-wrap: wrap;
}

.tab-btn {
  background: white;
  border: 1px solid #e5e7eb;
  padding: 10px 24px;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  border-color: #4f46e5;
  color: #4f46e5;
}

.tab-btn.active {
  background: #1f2937;
  color: white;
  border-color: #1f2937;
}

.filter-dropdowns {
  display: flex;
  gap: 12px;
  align-items: center;
  flex: 1;
  justify-content: flex-end;
}

.filter-select {
  padding: 10px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #6b7280;
  background: white;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-select:hover {
  border-color: #4f46e5;
}

.result-count {
  font-size: 14px;
  color: #4f46e5;
  font-weight: 600;
  white-space: nowrap;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 28px;
}

/* ✅ 공용 버튼 스타일 (media query 밖으로 이동) */
.btn-green:hover {
  background: #059669;
}

.btn-blue:hover {
  background: #2563eb;
}

.loading-text {
  text-align: center;
  color: #6b7280;
  margin-top: 20px;
}

/* 반응형 조정 */
@media (max-width: 768px) {
  .filter-tabs {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-dropdowns {
    justify-content: space-between;
  }

  .card-grid {
    grid-template-columns: 1fr;
  }
}

</style>