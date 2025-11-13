<template>
  <div class="step-container">
    <div class="step-content full-layout">
      <!-- 상단 헤더 -->
      <header class="top-bar">
        <div class="back-btn" @click="goPrev">← 이전</div>
        <div class="arrive-time">{{ startLocation.name }} 출발 ({{ startLocation.type }})</div>
      </header>

      <div class="main-layout" :class="{ 'blurred': showHotelModal }">
        <!-- 왼쪽 패널 -->
        <aside class="left-panel">
          <div class="left-actions">
            <button class="top-btn" @click="endDaySchedule">{{ selectedDay }} 일차 일정 종료</button>
              
              <div class = "middle-btns">
                <button 
                  class="left-btn" 
                  @click="drawRoute"
                  :disabled="isDayCompleted"
                  title=
"현재 선택한 장소들을 따라
경로를 지도에 그립니다."
                >경로 그리기</button>

                <button 
                  class="left-btn" 
                  @click="drawSort"
                  :disabled="isDayCompleted || isLoading"
                  title=
"고정된 일정을 제외한 일정을
최소의 이동시간이 되도록 재배치합니다.">            
                  <span v-if="isLoading">⏳ 정렬 중...</span>
                  <span v-else>자동 정렬</span>
                </button>
              </div>
            <!-- 로딩 스피너 -->
            <div v-if="isLoading" class="loading-overlay">
              <div class="spinner"></div>
              <p>자동 정렬 중입니다. 잠시만 기다려주세요...</p>
            </div>
          </div>

          <div class="empty-guide" v-if="selectedPlaces.length === 0">
            오른쪽에서 장소를 추가해주세요
          </div>

          <!-- 선택된 리스트 영역 -->
          <div v-else class="selected-list">
            <draggable
              :list="placesByDay[selectedDay] || []"
              item-key="title"
              animation="200"
              ghost-class="drag-ghost"
              handle=".drag-handle"
              :move="onDragMove"
              :disabled="isDayCompleted"
            >
              <template #item="{ element, index }">
                <div class="selected-card" :class="{ fixed: element.fixed, hotel: element.isHotel, completed: isDayCompleted }" @click="highlightPlace(element)">
                  <div class="drag-section">
                    <span class="day-badge-top">일정 {{ index + 1 }}</span>
                    <div class="drag-handle" :class="{ disabled: element.fixed || isDayCompleted }">⋮⋮</div>
                  </div>
                  
                  <div class="card-content">
                    <div class="card-header">
                      <div class="title-section">
                        <span class="card-title">{{ element.title }}</span>
                        <span v-if="element.isHotel" class="hotel-badge">숙소</span>
                      </div>
                      <div class="card-category">{{ getLastCategory(element.description || element.categoryGroupName) }}</div>
                    </div>
                    
                    <!-- 시간 입력 버튼 -->
                    <div class="time-toggle-section">
                      <button 
                        class="time-toggle-btn" 
                        @click.stop="toggleTimeInput(element)"
                        :disabled="isDayCompleted"
                      >
                        <span v-if="!element.showTimeInput">시간 입력</span>
                        <span v-else>접기</span>
                      </button>
                      
                      <!-- 시간 표시 (입력된 경우) -->
                      <div v-if="element.startTime && element.endTime && !element.showTimeInput" class="time-display">
                        {{ element.startTime }} ~ {{ element.endTime }}
                      </div>
                    </div>

                    <!-- 시간 입력 필드 (펼쳤을 때만 표시) -->
                    <div v-if="element.showTimeInput" class="time-input-container">
                      <div class="time-input-row">
                        <label class="time-label">시작</label>
                        <input 
                          type="time" 
                          v-model="element.startTime"
                          class="time-input"
                          :disabled="isDayCompleted"
                          @change="updatePlaceTime(element)"
                        />
                      </div>
                      <div class="time-input-row">
                        <label class="time-label">종료</label>
                        <input 
                          type="time" 
                          v-model="element.endTime"
                          class="time-input"
                          :disabled="isDayCompleted"
                          @change="updatePlaceTime(element)"
                        />
                      </div>
                    </div>
                    
                    <div class="card-actions">
                      <button class="action-btn fix-btn" :class="{ active: element.fixed }" @click="toggleFix(element)" :disabled="isDayCompleted">
                        고정
                      </button>
                      <button class="action-btn remove-btn" @click="removePlace(element)" :disabled="isDayCompleted">빼기</button>
                    </div>
                  </div>
                </div>
              </template>
            </draggable>
          </div>

          <!-- 일차 전환 -->
          <div class="day-control">
            <div class="day-buttons">
              <button class="day-btn gray" :disabled="selectedDay === 1" @click="goPrevDay">이전</button>
              <span class="day-label">{{ selectedDay }}일차</span>
              <button class="day-btn gray" :disabled="selectedDay === durations.length" @click="goNextDay">다음</button>
            </div>

            <div class="day-numbers">
              <button
                v-for="(d, i) in durations"
                :key="d.durationId"
                class="day-number"
                :class="{ active: selectedDay === d.day }"
                @click="selectDay(d.day)"
              >
                {{ d.day }}
              </button>
            </div>
          </div>
        </aside>

        <!-- 중앙 지도 -->
        <section class="map-section">
          <div class="map-box main-map">
            <div class="map-header">
              <div class="map-title">추천 장소 지도</div>
              <div class="map-legend">
                <span><i class="dot purple"></i> 맛집</span>
                <span><i class="dot brown"></i> 카페</span>
                <span><i class="dot green"></i> 관광지</span>
                <span><i class="dot yellow"></i> 숙소</span>
              </div>
            </div>
            <div class="map-canvas" ref="mapContainer"></div>
          </div>
        </section>

        <!-- 오른쪽 패널 -->
        <aside class="right-panel">
          <div class="search-header">검색          
            <button 
                class="hotel-btn"
                :class="{ active: showHotelModal }"
                @click="openHotelModal" 
                :disabled="isDayCompleted"
              >숙소 선택</button>
          </div>
        <!-- 테마 추천 섹션 -->
<div v-if="selectedTheme && themeRecommendations.length > 0" class="theme-section">
  <div class="section-header" @click="toggleTheme">
    <div class="header-left">
      <h3>{{ themeNames[selectedTheme] }} 추천 TOP {{ themeRecommendations.length }}</h3>
      <span class="badge">선택한 테마</span>
    </div>
    <button class="toggle-btn">
      {{ isThemeExpanded ? '▲' : '▼' }}
    </button>
  </div>
  
  <div v-if="isLoadingTheme" class="loading-theme">
    로딩 중...
  </div>
  
  <div v-show="isThemeExpanded && !isLoadingTheme" class="theme-place-list">
    <div 
      v-for="(place, index) in themeRecommendations" 
      :key="index"
      class="theme-place-card"
      @click="selectPlace(place)"
      :class="{ active: selectedPlace && selectedPlace.title === place.title }"
    >
      <div class="rank-badge">{{ index + 1 }}</div>
      <div class="place-icon">{{ getCategoryIcon(place.categoryCode) }}</div>
      <div class="theme-place-info">
        <h4 class="theme-place-name">{{ place.title }}</h4>
        <p class="theme-category">{{ place.categoryGroupName }}</p>
        <p class="theme-address">{{ place.addressName }}</p>
      </div>
      <button class="add-btn" @click.stop="addPlace(place)" :disabled="isDayCompleted">
        추가
      </button>
    </div>
  </div>
</div>

          <div class="filter-bar">
            <button
              class="filter-btn"
              :class="{ active: currentType === 'restaurants' }"
              @click="loadPlaces('restaurants')"
            >맛집</button>
            <button
              class="filter-btn"
              :class="{ active: currentType === 'cafes' }"
              @click="loadPlaces('cafes')"
            >카페</button>
            <button
              class="filter-btn"
              :class="{ active: currentType === 'attractions' }"
              @click="loadPlaces('attractions')"
            >관광지</button>
          </div>

          <div class="place-list" ref="placeListContainer">
            <div
              v-for="(p, i) in places"
              :key="i"
              :ref="el => { if (el) placeCardRefs[p.title] = el }"
              class="place-card"
              @click="selectPlace(p)"
              :class="{ active: selectedPlace && selectedPlace.title === p.title }"
            >
              <!-- 이미지 추가 -->
              <div class="place-image-wrapper">
                <img 
                  v-if="p.imageUrl"
                  :src="p.imageUrl"
                  :alt="p.title"
                  class="place-image"
                  @error="handleImageError($event, p)"
                />
                <div v-else class="place-image-placeholder">
                  <span class="placeholder-icon">{{ getCategoryIcon(p.categoryCode) }}</span>
                </div>
              </div>

              <div class="place-info">
                <div class="place-name">{{ p.title }}</div>
                <div class="place-address">{{ p.addressName }}</div>
                <div class="place-meta">
                  <span>{{ getLastCategory(p.description) }}</span>
                  <a :href="p.placeUrl" target="_blank" style="color:#155DFC; text-decoration:none;">상세보기</a>
                </div>
              </div>
              <button class="add-btn" @click="addPlace(p)" :disabled="isDayCompleted">추가</button>
            </div>
          </div>

          <div class="save-section">
            <button class="save-btn" @click="saveAllDaysPlaces">일정 저장</button>
          </div>
        </aside>
      </div>
    </div>
  </div>

  <!-- 숙소 모달 -->
  <div v-if="showHotelModal" class="hotel-modal-overlay">
    <div class="hotel-modal">
      <div class="hotel-header">
        <h3>숙소 선택</h3>
        <button class="close-btn" @click="closeHotelModal">✕</button>
      </div>

      <div class="hotel-body">
        <div class="hotel-list">
          <div
            v-for="(hotel, i) in hotels"
            :key="i"
            class="hotel-card"
            @click="focusHotelOnMap(hotel)"
          >
            <div class="hotel-info">
              <div class="hotel-name">{{ hotel.title }}</div>
              <div class="hotel-address">{{ hotel.addressName }}</div>
              <a
                :href="hotel.placeUrl"
                target="_blank"
                style="color:#155DFC; text-decoration:none;font-size:13px;"
              >지도보기</a>
            </div>
            <button class="add-btn" @click.stop="addHotel(hotel)">선택</button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 변경 모달 -->
  <div v-if="showSortModal" class="sort-modal-overlay">
    <div class="sort-modal">
      <div class="sort-header">
        <h3>정렬 미리보기</h3>
        <button class="close-btn" @click="cancelSortPreview">✕</button>
      </div>

      <!-- 🔹 본문 -->
      <div class="sort-body">
        <div class="curr-list">
          <div class="list-title">정렬 전</div>
          <div 
            v-for="(place, i) in placesByDay[selectedDay]" 
            :key="i" 
            class="sort-card"
            :class="{ 'fix-card': place.fixed, 'hovered': hoveredPlaceUrl === place.placeUrl && !place.fixed}"
              @mouseenter="hoveredPlaceUrl = place.placeUrl"
              @mouseleave="hoveredPlaceUrl = null">
            <div class="sort_info">
              <div class="sort-name">{{ place.title }}</div>
              <div class="sort-category">{{ place.description }}</div>
              <a 
                :href="place.placeUrl"
                target="_blank"
                style="color:#155DFC; text-decoration:none;font-size:13px;"
              >지도보기</a>
            </div>
          </div>
        </div>
        <div class="sort-list">
          <div class="list-title">정렬 후</div>
          <div
            v-for="(place, i) in previewSorted"
            :key="i"
            class="sort-card"
            :class="{ 'fix-card': place.fixed, 'hovered': hoveredPlaceUrl === place.placeUrl && !place.fixed}"
              @mouseenter="hoveredPlaceUrl = place.placeUrl"
              @mouseleave="hoveredPlaceUrl = null">
            <div class="sort_info">
              <div class="sort-name">{{ place.title }}</div>
              <div class="sort-category">{{ place.description }}</div>
              <a 
                :href="place.placeUrl"
                target="_blank"
                style="color:#155DFC; text-decoration:none;font-size:13px;"
              >지도보기</a>
            </div>
          </div>
        </div>
      </div>

      <!-- 버튼은 body 아래로 이동 -->
      <div class="sort-footer">
        <button class="sort-cancel-btn" @click="cancelSortPreview">취소</button>
        <button class="sort-btn" @click="applySortedPlaces">정렬 적용</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import apiClient from "@/utils/axios";
import draggable from "vuedraggable";


// 마커 이미지 import
import restaurantMarker from '@/assets/images/icons/markers/restaurant-marker.svg';
import cafeMarker from '@/assets/images/icons/markers/cafe-marker.svg';
import attractionMarker from '@/assets/images/icons/markers/attraction-marker.svg';
import restaurantSelect from '@/assets/images/icons/markers/restaurant-select.png';
import cafeSelect from '@/assets/images/icons/markers/cafe-select.png';
import attractionSelect from '@/assets/images/icons/markers/attraction-select.png';
import hotelSelect from '@/assets/images/icons/markers/hotel-select.png';

// 폴리라인 그리기
import { deletePoliLine, direction, sortDirection, isPolyLine } from '@/composables/Usedirection';

const route = useRoute();
const router = useRouter();

// === 테마 추천 관련 상태 ===
const selectedTheme = ref('');
const themeRecommendations = ref([]);
const isLoadingTheme = ref(false);
const isThemeExpanded = ref(true);

const themeNames = {
  restaurant: '맛집',
  cafe: '카페',
  tourist: '관광지'
};

const toggleTheme = () => {
  isThemeExpanded.value = !isThemeExpanded.value;
};

const historyState = window.history.state || {};

// 수정페이지에서 넘겨준 데이터
// sessionStorage에서 먼저 확인
let previousData = null;
let targetDay = null;

const sessionData = sessionStorage.getItem('editPlanData');
const sessionTargetDay = sessionStorage.getItem('editTargetDay');

if (sessionData && sessionTargetDay) {
  try {
    previousData = JSON.parse(sessionData);
    targetDay = Number(sessionTargetDay);
    console.log("sessionStorage에서 데이터 로드 성공");
  } catch (e) {
    console.error("sessionStorage 파싱 실패:", e);
  }
}
const showSortModal = ref(false);
const planIdFromQuery = route.query.planId ? Number(route.query.planId) : null;
const targetDayFromQuery = route.query.targetDay ? Number(route.query.targetDay) : null;

const planId = previousData?.planId ? Number(previousData.planId) : planIdFromQuery;
targetDay = targetDay || targetDayFromQuery;

selectedTheme.value = route.query.theme || localStorage.getItem('selectedTheme') || '';

console.log("👀 previousData 최종:", previousData);
console.log("👀 targetDay 최종:", targetDay);
console.log("👀 planId 최종:", planId);
console.log("👀 selectedTheme:", selectedTheme.value);

const hoveredPlaceUrl = ref(null);

// 지도 관련
const mapContainer = ref(null);
let map = null;
const placeMarkers = ref([]);
const searchResultMarkers = ref([]);
let mapInitialized = false;

// 리스트 스크롤 관련
const placeListContainer = ref(null);
const placeCardRefs = ref({});

// 시작 지점
const startLocation = ref({
  lat: 37.5665,
  lng: 126.9780,
  name: "서울",
  type: "출발지"
});

// 장소 관련
const currentType = ref("restaurants");
const places = ref([]);
const selectedPlace = ref(null);

// 일차 관련
const durations = ref([]);
const selectedDay = ref(1);

// 일차별 장소 데이터
const placesByDay = ref({});
const selectedPlaces = computed(() => placesByDay.value[selectedDay.value] || []);

// 일차별 종료 상태
const completedDays = ref(new Set());

// 검색 중복 방지
const isSearching = ref(false);
const lastSearchCoords = ref({ lat: null, lng: null, type: null });
let mapIdleTimeout = null;

// 테마별 추천 장소 로드
const loadThemeRecommendations = async () => {
  if (!selectedTheme.value) {
    console.log("선택된 테마 없음");
    return;
  }
  
  isLoadingTheme.value = true;
  
  try {
    const response = await apiClient.get('/api/kakao/theme-search', {
      params: {
        query: startLocation.value.name,
        theme: selectedTheme.value
      }
    });
    
    // 테마에 따른 categoryCode 강제 설정
    let forcedCategoryCode = 'AT4';
    
    if (selectedTheme.value === 'restaurant') {
      forcedCategoryCode = 'FD6';
    } else if (selectedTheme.value === 'cafe') {
      forcedCategoryCode = 'CE7';
    } else if (selectedTheme.value === 'tourist') {
      forcedCategoryCode = 'AT4';
    }
    
    const kakaoPlaces = response.data.documents || [];
    themeRecommendations.value = kakaoPlaces.map((place, index) => ({
      travelOrder: index + 1,
      estimatedTravelTime: 0,
      title: place.place_name,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
      categoryCode: forcedCategoryCode,
      categoryGroupName: place.category_group_name || themeNames[selectedTheme.value],
      addressName: place.road_address_name || place.address_name,
      placeUrl: place.place_url,
      description: place.category_name,
      imageUrl: null,
      planId,
      startTime: '',
      endTime: '',
      showTimeInput: false
    }));
    
    console.log(`테마 추천 ${themeRecommendations.value.length}개 로드 완료`);
    console.log(`강제 설정된 categoryCode: ${forcedCategoryCode}`);
    console.log(`첫 번째 장소:`, themeRecommendations.value[0]);
    
  } catch (error) {
    console.error('테마 추천 로딩 실패:', error);
    themeRecommendations.value = [];
  } finally {
    isLoadingTheme.value = false;
  }
};

// 시간 업데이트 함수
const updatePlaceTime = (place) => {
  console.log(`${place.title} 시간 업데이트:`, {
    startTime: place.startTime,
    endTime: place.endTime
  });
  
  if (place.startTime && place.endTime) {
    if (place.endTime <= place.startTime) {
      alert('종료 시간은 시작 시간보다 늦어야 합니다.');
      place.endTime = '';
    }
  }
};

// 시간 입력 토글
const toggleTimeInput = (place) => {
  place.showTimeInput = !place.showTimeInput;
};

// 이전 페이지로 이동
const goPrev = () => {
  router.push({
    path: '/draw/third',
    query: { planId, totalDays }
  });
};

// 카테고리 마지막 부분 추출 함수
const getLastCategory = (categoryString) => {
  if (!categoryString) return '기타';
  const parts = categoryString.split(' > ');
  return parts[parts.length - 1].trim();
};

// 검색 결과용 마커 이미지
const getSearchMarkerImageUrl = (type) => {
  const markerImages = {
    'restaurants': restaurantMarker,
    'cafes': cafeMarker,
    'attractions': attractionMarker,
  };
  return markerImages[type] || markerImages['attractions'];
};

// 선택된 장소용 마커 이미지
const getSelectedMarkerImageUrl = (type) => {
  const markerImages = {
    'restaurants': restaurantSelect,
    'cafes': cafeSelect,
    'attractions': attractionSelect,
    'hotel': hotelSelect
  };
  return markerImages[type] || markerImages['attractions'];
};

// 마커 이미지 캐싱
const markerImageCache = new Map();

const getMarkerImage = (imageUrl, size) => {
  const cacheKey = `${imageUrl}_${size.width}_${size.height}`;
  
  if (markerImageCache.has(cacheKey)) {
    return markerImageCache.get(cacheKey);
  }
  
  const markerImage = new kakao.maps.MarkerImage(imageUrl, new kakao.maps.Size(size.width, size.height));
  markerImageCache.set(cacheKey, markerImage);
  
  return markerImage;
};

// 검색 결과 마커 생성
const createSearchMarker = (place, placeType) => {
  if (!map) return null;
  
  const position = new kakao.maps.LatLng(place.latitude, place.longitude);
  const markerImageUrl = getSearchMarkerImageUrl(placeType);
  const markerImage = getMarkerImage(markerImageUrl, { width: 40, height: 40 });
  
  const newMarker = new kakao.maps.Marker({
    position: position,
    map: map,
    image: markerImage,
    title: place.title
  });
  
  newMarker._placeType = placeType;
  newMarker._origImage = markerImage;
  newMarker._imageUrl = markerImageUrl;

  kakao.maps.event.addListener(newMarker, 'click', function() {
    highlightPlace(place, true);
  });
  
  return newMarker;
};

// 선택된 장소 마커 생성
const createSelectedMarker = (place, placeType) => {
  if (!map) return null;
  
  const position = new kakao.maps.LatLng(place.latitude, place.longitude);
  const markerImageUrl = getSelectedMarkerImageUrl(placeType);
  const markerImage = getMarkerImage(markerImageUrl, { width: 60, height: 60 });
  
  const newMarker = new kakao.maps.Marker({
    position: position,
    map: map,
    image: markerImage,
    title: place.title,
    zIndex: 100
  });

  newMarker._placeType = placeType;
  newMarker._origImage = markerImage;
  newMarker._imageUrl = markerImageUrl;

  kakao.maps.event.addListener(newMarker, 'click', function() {
    highlightPlace(place, true);
  });
  
  return newMarker;
};

// 마커 강조 + 오버레이 표시
const highlightPlace = async (place, fromMarkerClick = false) => {

  selectedPlace.value = place;
  // 카테고리 판별 및 자동 전환
  let targetType = 'attractions'; // 기본값
  
  if (place.categoryCode === 'FD6') {
    targetType = 'restaurants';
  } else if (place.categoryCode === 'CE7') {
    targetType = 'cafes';
  } else if (place.categoryCode === 'AT4') {
    targetType = 'attractions';
  }
  
  // 현재 카테고리와 다르면 카테고리 전환
  if (currentType.value !== targetType) {
    currentType.value = targetType;
    // 해당 카테고리의 장소 검색
    await loadPlaces(targetType, place.latitude, place.longitude);
    // 검색 완료 후 약간의 지연을 주어 DOM 업데이트 대기
    await nextTick();
  }
  
  
  // 오른쪽 리스트에서 해당 장소 찾아서 스크롤
  if (placeCardRefs.value[place.title] && placeListContainer.value) {
    const element = placeCardRefs.value[place.title];
    const container = placeListContainer.value;
    
    const elementTop = element.offsetTop;
    const elementHeight = element.offsetHeight;
    const containerHeight = container.clientHeight;
    
    const scrollPosition = elementTop - (containerHeight / 2) + (elementHeight / 2);
    
    container.scrollTo({
      top: scrollPosition,
      behavior: 'smooth'
    });
  }
};

// 마커 제거
const clearAllMarkers = () => {
  placeMarkers.value.forEach(marker => {
    kakao.maps.event.removeListener(marker, 'click');
    marker.setMap(null);
  });
  placeMarkers.value = [];
};

const clearSearchResultMarkers = () => {
  searchResultMarkers.value.forEach(marker => {
    kakao.maps.event.removeListener(marker, 'click');
    marker.setMap(null);
  });
  searchResultMarkers.value = [];
};

// 검색 결과 마커 표시
const displaySearchResultMarkers = () => {
  clearSearchResultMarkers();
  
  const newMarkers = places.value.map(place => {
    let placeType;
    if (currentType.value === 'restaurants') {
      placeType = 'restaurants';
    } else if (currentType.value === 'cafes') {
      placeType = 'cafes';
    } else {
      placeType = 'attractions';
    }
    
    return createSearchMarker(place, placeType);
  }).filter(Boolean);
  
  searchResultMarkers.value = newMarkers;
  console.log(`검색 결과 마커 ${searchResultMarkers.value.length}개 표시`);
};

// 선택 상태 관리
const activeMarker = ref(null);
const activeMarkerAnimation = ref(null);

const animateMarkerBounce = (marker, height = 15, speed = 0.004) => {
  if (!marker) return;

  const startPos = marker.getPosition();
  let startTime = null;

  const step = (timestamp) => {
    if (!startTime) startTime = timestamp;
    const progress = timestamp - startTime;

    const delta = Math.sin(progress * speed) * height;
    marker.setPosition(new kakao.maps.LatLng(startPos.getLat() + delta * 0.00001, startPos.getLng()));

    // selectedPlace가 바뀌기 전까지 계속 반복
    if (activeMarker.value === marker) {
      activeMarkerAnimation.value = requestAnimationFrame(step);
    } else {
      marker.setPosition(startPos); // 선택 해제되면 원위치
    }
  };

  activeMarkerAnimation.value = requestAnimationFrame(step);
};

watch(selectedPlace, async (newPlace, oldPlace) => {
  if(activeMarker.value) {    // 이미 마커가 있으면
    try {                     // 해당 마커를 원본 크기로 돌리기
      // const prev = activeMarker.value;
      // if(prev._origImage) {
        // prev.setImage(prev._origImage);
      // } else if (prev._imageUrl) {
        // prev.setImage(getMarkerImage(prev._origImage, { width: 60, height: 60 }));
      // }
      prev.setZIndex(100);

       // 애니메이션 취소
      if(activeMarkerAnimation.value) {
        const startPos = clickedMarker.getPosition();
        let startTime = null;

        const animate = (timestamp) => {
        if (!startTime) startTime = timestamp;
          const progress = timestamp - startTime;
          const delta = Math.sin(progress * 0.004) * 20; // 높이 20, 속도 조절
          clickedMarker.setPosition(new kakao.maps.LatLng(startPos.getLat() + delta * 0.00001, startPos.getLng()));

          // selectedPlace가 바뀌면 자동 종료
          if(activeMarker.value === clickedMarker) {
            activeMarkerAnimation.value = requestAnimationFrame(animate);
          }
        };
        activeMarkerAnimation.value = requestAnimationFrame(animate);
      }
    } catch (e) {
      console.warn("prev marker restore failed", e);
    }
    activeMarker.value = null;  // 원상 복구 했으므로 켜져 있는 마커는 없다.
  }

    // 클릭한 마커 찾기 (selected markers 배열 우선)
  const clickedMarker = (placeMarkers.value || []).find(m => m.getTitle() === newPlace.title)
                      || (searchResultMarkers.value || []).find(m => m.getTitle() === newPlace.title);


  if (clickedMarker) {
    // 확대할 이미지 생성: 같은 이미지 URL 사용하되 큰 사이즈로
    const placeType = clickedMarker._placeType || (
      newPlace.isHotel ? 'hotel' :
      (newPlace.categoryCode === 'FD6' ? 'restaurants' : (newPlace.categoryCode === 'CE7' ? 'cafes' : 'attractions'))
    );
    // const imageUrl = clickedMarker._imageUrl || getSelectedMarkerImageUrl(placeType);
    // const bigImage = getMarkerImage(imageUrl, { width: 80, height: 80 });

    // clickedMarker.setImage(bigImage);
    clickedMarker.setZIndex(999); // 선택 마커가 위로 오도록
    activeMarker.value = clickedMarker;

    // 애니메이션 실행
    animateMarkerBounce(clickedMarker);
  }

  // if(isPolyLine) displaySearchResultMarkers();
  await nextTick();
});

// 선택된 장소 마커 표시
const updateMapMarkers = () => {
  deletePoliLine();
  displaySearchResultMarkers();
  clearAllMarkers();
  
  const currentDayPlaces = placesByDay.value[selectedDay.value] || [];
  
  const newMarkers = currentDayPlaces.map(place => {
    let placeType;
    if (place.isHotel) {
      placeType = 'hotel';
    } else if (place.categoryCode === 'FD6') {
      placeType = 'restaurants';
    } else if (place.categoryCode === 'CE7') {
      placeType = 'cafes';
    } else {
      placeType = 'attractions';
    }
    selectedPlace.value = null;
    return createSelectedMarker(place, placeType);
  }).filter(Boolean);
  
  placeMarkers.value = newMarkers;
  console.log(`${selectedDay.value}일차 선택된 마커 ${placeMarkers.value.length}개 표시`);
};

// 지도 초기화
const initMap = (location) => {
  console.log("지도 초기화 시작:", location);
  
  if (!window.kakao || !window.kakao.maps) {
    console.error("Kakao Maps API가 로드되지 않았습니다!");
    return;
  }
  
  window.kakao.maps.load(() => {
    const center = new kakao.maps.LatLng(location.lat, location.lng);
    map = new kakao.maps.Map(mapContainer.value, { 
      center, 
      level: 5 
    });
    
    mapInitialized = true;
    console.log(`지도 초기화 완료: ${location.name} (${location.lat}, ${location.lng})`);
    
    updateMapMarkers();
    
    kakao.maps.event.addListener(map, "idle", () => {
      if (mapIdleTimeout) {
        clearTimeout(mapIdleTimeout);
      }
      
      mapIdleTimeout = setTimeout(async () => {
        const center = map.getCenter();
        const lat = center.getLat();
        const lng = center.getLng();
        
        if (hasSignificantChange(lat, lng, currentType.value) && !isSearching.value) {
          console.log("지도 이동 - 새 검색:", lat, lng);
          await loadPlaces(currentType.value, lat, lng);
        }
      }, 800);
    });
  });
};

// 좌표 변경 확인
const hasSignificantChange = (newLat, newLng, newType) => {
  if (!lastSearchCoords.value.lat || lastSearchCoords.value.type !== newType) {
    return true;
  }
  
  const latDiff = Math.abs(newLat - lastSearchCoords.value.lat);
  const lngDiff = Math.abs(newLng - lastSearchCoords.value.lng);
  
  return latDiff > 0.008 || lngDiff > 0.008;
};

// Plan 정보 가져오기
const loadPlanInfo = async () => {
  try {
    const res = await apiClient.get(`/api/plans/select/${planId}`);
    const plan = res.data;
    
    const regionId = plan.regionId || plan.region_id;
    
    if (regionId) {
      const regionRes = await apiClient.get(`/api/regions/${regionId}`);
      const region = regionRes.data;
      
      if (region.startLat && region.startLng) {
        startLocation.value = {
          lat: parseFloat(region.startLat),
          lng: parseFloat(region.startLng),
          name: region.regionName,
          type: "출발지"
        };
        console.log(`시작 지점: ${startLocation.value.name} (${startLocation.value.lat}, ${startLocation.value.lng})`);
      }
    }
  } catch (err) {
    console.error("Plan/Region 정보 로드 실패:", err);
  }
};


// 장소 불러오기
const loadPlaces = async (type, lat = null, lng = null) => {
  deletePoliLine();
  if (isSearching.value) {
    console.log("⏸ 이미 검색 중...");
    return;
  }
  
  currentType.value = type;
  
  let searchLat = lat;
  let searchLng = lng;
  
  if (!searchLat || !searchLng) {
    const currentDayPlaces = placesByDay.value[selectedDay.value] || [];
    if (currentDayPlaces.length > 0) {
      const lastPlace = currentDayPlaces[currentDayPlaces.length - 1];
      searchLat = lastPlace.latitude;
      searchLng = lastPlace.longitude;
    } else {
      searchLat = startLocation.value.lat;  
      searchLng = startLocation.value.lng;
    }
  }
  
  if (!hasSignificantChange(searchLat, searchLng, type)) {
    console.log("좌표/타입 변경 없음 - 검색 스킵");
    return;
  }
  
  console.log(`${type} 검색: (${searchLat}, ${searchLng})`);
  
  isSearching.value = true;
  
  try {
    const res = await apiClient.get(`/api/kakao/${type}`, { 
      params: { lat: searchLat, lng: searchLng },
      timeout: 10000
    });
    
    const kakaoPlaces = res.data.documents || [];
    places.value = kakaoPlaces.map((place, index) => ({
      travelOrder: index + 1,
      estimatedTravelTime: 0,
      title: place.place_name,
      latitude: parseFloat(place.y),
      longitude: parseFloat(place.x),
      categoryCode: place.category_group_code,
      categoryGroupName: place.category_group_name,
      addressName: place.road_address_name || place.address_name,
      placeUrl: place.place_url,
      description: place.category_name,
      imageUrl: place.image_url || null,
      planId,
      startTime: '',
      endTime: '',
      showTimeInput: false
    }));
    
    console.log(`${type} ${places.value.length}개 로드 완료`);
    
    lastSearchCoords.value = { lat: searchLat, lng: searchLng, type };
    
    await nextTick();
    displaySearchResultMarkers();
    
  } catch (err) {
    console.error("장소 로드 실패:", err);
    places.value = [];
  } finally {
    isSearching.value = false;
  }
};

// 지도 선택
const selectPlace = (p) => {
  selectedPlace.value = p;
  if(isPolyLine()) {
    deletePoliLine();
    displaySearchResultMarkers();
  }
};

// 장소 추가 (일정수정에서 넘어온거 테스트중)
const addPlace = (p) => {
  const day = selectedDay.value;
  
  // 중복 체크
  if (!placesByDay.value[day]) {
    placesByDay.value[day] = [];
  }
  
  if (placesByDay.value[day].find((x) => x.title === p.title)) {
    console.log(`${p.title}은(는) 이미 추가되어 있습니다.`);
    return;
  }
  
  // 장소 추가
  placesByDay.value[day].push({ 
    ...p, 
    dayNumber: day,
    startTime: p.startTime || '',
    endTime: p.endTime || '',
    showTimeInput: false,
    fixed: false
  });
  
  console.log(`${p.title} 추가 완료 (${day}일차)`);
  updateMapMarkers();
};

// 장소 제거
const removePlace = (p) => {
  const day = selectedDay.value;
  if (placesByDay.value[day]) {
    placesByDay.value[day] = placesByDay.value[day].filter((x) => x.title !== p.title);
    console.log(`${p.title} 제거`);
    updateMapMarkers();
    deletePoliLine();
    displaySearchResultMarkers();
    setTimeout(() => {
      lastSearchCoords.value = { lat: null, lng: null, type: null };
      loadPlaces(currentType.value);
    }, 300);
  }
};

// 고정 버튼 토글
const toggleFix = (place) => {
  place.fixed = !place.fixed;
};

// 드래그 이동 제한
const onDragMove = (evt) => {
  const draggedItem = evt.draggedContext.element;
  const relatedItem = evt.relatedContext.element;
  const list = placesByDay.value[selectedDay.value] || [];
  
  if (draggedItem.fixed) return false;
  if (relatedItem?.fixed) return false;
  
  const fixedIndexes = list
    .map((p, i) => (p.fixed ? i : -1))
    .filter((i) => i !== -1);
  
  if (fixedIndexes.length === 0) return true;
  
  const draggedIndex = evt.draggedContext.index;
  const targetIndex = evt.relatedContext.index;
  
  const inSameBlock = fixedIndexes.every((fi) => {
    return (
      (draggedIndex < fi && targetIndex < fi) ||
      (draggedIndex > fi && targetIndex > fi)
    );
  });
  
  return inSameBlock;
};

// 숙소 모달 관련
const showHotelModal = ref(false);
const hotels = ref([]);
const hotelMapContainer = ref(null);
let hotelMap = null;

const openHotelModal = async () => {
  showHotelModal.value = true;
  
  try {
    const res = await apiClient.get(`/api/kakao/hotels`, { 
      params: { 
        lat: startLocation.value.lat, 
        lng: startLocation.value.lng 
      } 
    });
    hotels.value = res.data.documents.map((p) => ({
      title: p.place_name,
      latitude: parseFloat(p.y),
      longitude: parseFloat(p.x),
      categoryGroupName: p.category_group_name,
      addressName: p.road_address_name || p.address_name,
      placeUrl: p.place_url,
    }));
  } catch (e) {
    console.error("숙소 로드 실패:", e);
  }
};

const closeHotelModal = () => {
  showHotelModal.value = false;
};

const addHotel = (hotel) => {
  const day = selectedDay.value;
  if (!placesByDay.value[day]) placesByDay.value[day] = [];
  
  if (!placesByDay.value[day].find((x) => x.title === hotel.title)) {
    placesByDay.value[day].push({ 
      ...hotel,
      title: hotel.title,
      placeName: hotel.title,
      isHotel: true,
      startTime: '',
      endTime: ''
    });
  }
  
  alert(`${hotel.title}이(가) ${day}일차 일정에 추가되었습니다!`);
  updateMapMarkers();
  closeHotelModal();
};

const focusHotelOnMap = (hotel) => {
  if (!hotelMap) return;
  const pos = new kakao.maps.LatLng(hotel.latitude, hotel.longitude);
  hotelMap.panTo(pos);
};

// Duration 불러오기
const loadDurations = async () => {
  try {
    durations.value = [];
    const res = await apiClient.get(`/api/plans/${planId}/durations`);
    const uniqueDays = new Set();
    let fetched = [];
    
    if (res.data && res.data.length > 0) {
      fetched = res.data
        .filter((d) => {
          if (uniqueDays.has(d.day)) return false;
          uniqueDays.add(d.day);
          return true;
        })
        .map((d) => ({
          durationId: d.durationId,
          planId: d.planId,
          day: d.day,
        }));
    } else {
      fetched = Array.from({ length: totalDays }, (_, i) => ({
        durationId: i + 1,
        planId,
        day: i + 1,
      }));
    }
    
    durations.value = fetched.sort((a, b) => a.day - b.day);
    console.log("Duration 로드 완료:", durations.value);
  } catch (err) {
    console.error("Duration 로드 실패:", err);
  }
};

// 일차 이동
const goPrevDay = () => {
  if (selectedDay.value > 1) {
    selectedDay.value--;
    deletePoliLine();
    displaySearchResultMarkers();
  }
};

const goNextDay = () => {
  if (selectedDay.value < durations.value.length) {
    selectedDay.value++;
    deletePoliLine();
    displaySearchResultMarkers();
  }
};

const selectDay = (day) => {
  selectedDay.value = day;
  deletePoliLine();
  displaySearchResultMarkers()
};

// 일차 변경 시 마커 업데이트
watch(selectedDay, () => {
  updateMapMarkers();
  lastSearchCoords.value = { lat: null, lng: null, type: null };
});

// 일정 종료
const endDaySchedule = () => {
  const day = selectedDay.value;
  if (completedDays.value.has(day)) {
    alert("이미 종료된 일정입니다.");
    return;
  }
  
  if (confirm(`${day}일차 일정을 종료하시겠습니까?\n종료 후에는 수정할 수 없습니다.`)) {
    completedDays.value.add(day);
    alert(`${day}일차 일정이 종료되었습니다.`);
  }
};

// 현재 일차가 종료되었는지 확인
const isDayCompleted = computed(() => completedDays.value.has(selectedDay.value));

// 이미지 에러 처리
const handleImageError = (event, place) => {
  event.target.style.display = 'none';
  place.imageUrl = null;
};

// 카테고리별 아이콘
const getCategoryIcon = (categoryCode) => {
  const icons = {
    'FD6': '🍽️',
    'CE7': '☕',
    'AT4': '🏛️',
  };
  return icons[categoryCode] || '📍';
};

// 저장 함수
// 저장 함수 수정
const saveAllDaysPlaces = async () => {
  try {
    let hasNewPlaces = false;
    
    for (const duration of durations.value) {
      const dayPlaces = placesByDay.value[duration.day] || [];
      const newPlaces = dayPlaces.filter(p => !p.travelId);
      
      if (newPlaces.length === 0) {
        console.log(`${duration.day}일차: 새로 추가된 장소 없음`);
        continue;
      }
      
      hasNewPlaces = true;
      
      // 시간 검증
      for (const place of newPlaces) {
        if (place.startTime && place.endTime) {
          if (place.endTime <= place.startTime) {
            alert(`${place.title}의 종료 시간이 시작 시간보다 이릅니다.`);
            return;
          }
        }
      }
      
      const existingCount = dayPlaces.filter(p => p.travelId).length;
      
      const mappedPlaces = newPlaces.map((p, i) => ({
        durationId: duration.durationId,
        planId,
        travelOrder: existingCount + i + 1,
        estimatedTravelTime: p.estimatedTravelTime || 0,
        placeName: p.title,
        startTime: p.startTime || null,
        endTime: p.endTime || null,
        latitude: p.latitude,
        longitude: p.longitude,
        categoryCode: p.categoryCode,
        categoryGroupName: p.categoryGroupName,
        addressName: p.addressName,
        placeUrl: p.placeUrl,
        description: p.description || '',
        imagePath: p.imagePath || null,
        runTime: p.runTime || null,
      }));
      
      console.log(`${duration.day}일차 새로 추가된 ${newPlaces.length}개 장소:`, mappedPlaces);
      await apiClient.post("/api/places/batch", mappedPlaces);
    }
    

    
    alert("새로운 장소가 저장되었습니다!");
    
    // sessionStorage 클리어
    sessionStorage.removeItem("editPlanData");
    sessionStorage.removeItem("editTargetDay");
    
    // 일정수정 모드였다면 상세 페이지로
    if (previousData) {
      console.log("일정 상세 페이지로 이동");
      router.push(`/mypage/travel/${planId}`);
    } else {
      // 일반 모드였다면 마이페이지로
      console.log("마이페이지로 이동");
      let count = Number(sessionStorage.getItem("newPlan")) || 0;
      count++;
      sessionStorage.setItem("newPlan", count);
      
      router.push("/mypage").then(() => {
        window.location.reload();
      });
    }
    
  } catch (err) {
    console.error("저장 실패:", err);
    console.error("에러 상세:", err.response?.data);
    alert("저장에 실패했습니다. 다시 시도해주세요.");
  }
};
onMounted(async () => {
  console.log("🚀 컴포넌트 초기화 시작");
  
  await loadPlanInfo();
  await loadDurations();
  
  // 테마 추천 로드
  if (selectedTheme.value) {
    await loadThemeRecommendations();
  }
  
  if (previousData && targetDay) {
    console.log("일정수정 모드!");
    console.log("previousData.dayList:", previousData.dayList);
    
    if (previousData.dayList && previousData.dayList.length > 0) {
      previousData.dayList.forEach((dayData) => {
        if (dayData.activities && dayData.activities.length > 0) {
          const dayNo = dayData.dayNo;
          
          placesByDay.value[dayNo] = dayData.activities.map((act, index) => {
            console.log(`${dayNo}일차 - ${act.placeName}`);
            
            return {
              travelId: act.travelId,
              travelOrder: index + 1,
              estimatedTravelTime: 0,
              title: act.placeName || "",
              placeName: act.placeName || "",
              latitude: act.latitude || 0,
              longitude: act.longitude || 0,
              categoryCode: act.categoryCode || "",
              categoryGroupName: act.categoryGroupName || "",
              addressName: act.addressName || "",
              placeUrl: act.placeUrl || "",
              description: act.categoryGroupName || "",
              imageUrl: null,
              planId: previousData.planId,
              dayNumber: dayNo,
              startTime: act.startTime || '',
              endTime: act.endTime || '',
              showTimeInput: false,
              fixed: false,
              isHotel: act.tag === '숙소'
            };
          });
          
          console.log(`${dayNo}일차 장소 ${placesByDay.value[dayNo].length}개 로드됨`);
        }
      });
      
      selectedDay.value = targetDay;
      console.log(`{targetDay}일차로 이동`);
      
      sessionStorage.removeItem('editPlanData');
      sessionStorage.removeItem('editTargetDay');
    }
  } else {
    console.log("일반 모드 (일정수정 아님)");
  }
  
  initMap(startLocation.value);
  await nextTick();
  updateMapMarkers();
  await loadPlaces("restaurants");
  
  console.log("초기화 완료");
  console.log("최종 placesByDay:", placesByDay.value);
  console.log("selectedDay:", selectedDay.value);
});

// 경로 그리기
const drawRoute = async () => {
  await direction(map, placesByDay.value[selectedDay.value]);
  selectedPlace.value = null;
  if(isPolyLine()) clearSearchResultMarkers();
};

// 자동 정렬

const isLoading = ref(false);
const previewSorted = ref([]);    // 자동 정렬된 결과 임시 저장

const drawSort = async () => {
  selectedPlace.value = null;
  const currentPlaces = placesByDay.value[selectedDay.value];
  
  isLoading.value = true;
  const newLocations = await sortDirection(map, currentPlaces);
  isLoading.value = false;
  
  if (!newLocations || newLocations.length === 0) {
    console.warn("정렬된 경로가 없습니다.");
    return;
  }
  
  const reorderedPlaces = newLocations.map((nLoc, index) => {
    const matched = currentPlaces.find(p =>
      p.title === nLoc.name ||
      (Math.abs(p.latitude - nLoc.y) < 1e-6 &&
        Math.abs(p.longitude - nLoc.x) < 1e-6)
    );
    
    if (!matched) return null;
    
    return {
      ...matched,
      travelOrder: index + 1
    };
  }).filter(Boolean);
  
  previewSorted.value = reorderedPlaces;    // 결과 임시 저장
  console.log("정렬 완료:", reorderedPlaces);

  showSortModal.value = true; // 모달창 띄우기
};

const applySortedPlaces = () => {
  placesByDay.value[selectedDay.value] = [...previewSorted.value];
  console.log("정렬 완료");
  showSortModal.value = false;
  if(isPolyLine) clearSearchResultMarkers();
};

const cancelSortPreview = () => {
  console.log("정렬 취소");
  showSortModal.value = false;
  
};
</script>

<style scoped>
.final-draw-page {
  zoom: 0.8; /* 80% 크기 */
}
.step-container {
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.step-content {
  width: 100%;
}

.full-layout {
  width: 95vw;
  max-width: 1800px;
  margin: 0 auto;
  border-radius: 14px;
  overflow: hidden;
}

.dot.purple { background: #d877e1; }
.dot.brown { background: #d0a473; }

/* 상단 바 */
.top-bar {
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
  height: calc(100vh - 60px);
  min-height: 800px;
}

/* 왼쪽 패널 */
.left-panel {
  width: 22%;
  min-width: 300px;
  max-width: 380px;
  border-right: 1px solid rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.left-actions { 
  padding: 16px; 
  border-bottom: 1px solid rgba(0,0,0,0.1); 
  display: flex;
  flex-direction: column;
  height: 115px; /* 전체 컨테이너 높이 */
  gap: 16px;     /* 상하 버튼 간격 */

}
.action-row { display: flex; gap: 8px; margin-bottom: 12px; }

.left-btn {
  flex: 1;
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 8px;
  height: 32px;
  cursor: pointer;
  background: white;
  color: #4A5565;
  transition: 0.2s;
}

.left-actions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  gap: 8px;
  padding: 16px;
}

.left-actions-grid .left-btn {
  width: 100%;
  height: 40px;
  width: 48%;
}

.left-btn:hover:not(:disabled) {
  background: #F3F4F6;
}

.left-btn.active {
  background: #155DFC;
  color: white;
  border-color: #155DFC;
  font-weight: 600;
}

.left-btn.active:hover:not(:disabled) {
  background: #1348d4;
}

.left-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.middle-btns {
  display: flex;
  justify-content: space-between; /* 좌우 버튼 분리 */
  gap: 16px;
}


.top-btn {
  width: 100%;
  height: 32px;
  border-radius: 8px;
  background: #F54900;
  color: white;
  border: none;
  cursor: pointer;
}

.hotel-btn {
  border-radius: 4px;
  border: 1px solid #D1D5DC;
  background: white;
  height: 40px;
  width: 110px;
  /* flex: 0; flex:1 제거! → 버튼이 늘어나지 않게 */
}

.info-box {
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
}

.empty-guide {
  padding: 32px;
  color: #6A7282;
  text-align: center;
}

.selected-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selected-card {
  display: flex;
  align-items: stretch;
  background: white;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 16px;
  transition: 0.2s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
  gap: 12px;
  cursor: pointer;
}

.selected-card:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  border-color: #155DFC;
}

.selected-card.fixed {
  background: #F3F4F6;
  opacity: 0.85;
}

.selected-card.completed {
  background: #F9FAFB;
  border-color: #D1D5DB;
  opacity: 0.7;
  pointer-events: none;
}

.selected-card.hotel {
  border-left: 3px solid #10B981;
}

/* 드래그 섹션 (왼쪽) */
.drag-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 48px;
}

.day-badge-top {
  background: #F3F4F6;
  color: #6B7280;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 6px;
  border-radius: 4px;
  white-space: nowrap;
}

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #9CA3AF;
  cursor: grab;
  user-select: none;
  flex: 1;
}

.drag-handle.disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.selected-card.fixed .drag-handle {
  cursor: not-allowed;
  opacity: 0.4;
}

/* 카드 컨텐츠 (오른쪽) */
.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 0;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.hotel-badge {
  background: #D1FAE5;
  color: #065F46;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
  flex-shrink: 0;
}

.card-category {
  font-size: 12px;
  color: #6B7280;
  flex-shrink: 0;
}

/* 시간 토글 섹션 */
.time-toggle-section {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 6px 0;
}

.time-toggle-btn {
  padding: 6px 12px;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  cursor: pointer;
  transition: all 0.2s;
}

.time-toggle-btn:hover:not(:disabled) {
  background: #E5E7EB;
  border-color: #9CA3AF;
}

.time-toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.time-display {
  font-size: 12px;
  color: #155DFC;
  font-weight: 500;
  background: #EEF4FF;
  padding: 4px 8px;
  border-radius: 4px;
}

/* 시간 입력 스타일 */
.time-input-container {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin: 6px 0;
}

.time-input-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  background: #F9FAFB;
  border-radius: 6px;
}

.time-label {
  font-size: 12px;
  font-weight: 500;
  color: #6B7280;
  white-space: nowrap;
  min-width: 32px;
}

.time-input {
  flex: 1;
  height: 28px;
  padding: 4px 6px;
  border: 1px solid #D1D5DB;
  border-radius: 4px;
  font-size: 12px;
  background: white;
  transition: border-color 0.2s;
}

.time-input:focus {
  outline: none;
  border-color: #155DFC;
}

.time-input:disabled {
  background: #F3F4F6;
  cursor: not-allowed;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.action-btn {
  border: 1px solid #D1D5DB;
  background: white;
  border-radius: 8px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: 0.2s ease;
}

.action-btn:hover {
  background: #F9FAFB;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.fix-btn.active {
  background: #155DFC;
  color: white;
  border-color: #155DFC;
}

.remove-btn {
  color: #F54900;
  border-color: #F54900;
}

.remove-btn:hover {
  background: rgba(245, 73, 0, 0.05);
}

/* 일차 컨트롤 */
.day-control {
  border-top: 1px solid rgba(0,0,0,0.1);
  padding: 16px;
  background: #fff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.day-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.day-btn {
  width: 60px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid rgba(0,0,0,0.1);
  background: #f9fafb;
  color: #4a5565;
  font-size: 14px;
  cursor: pointer;
  transition: 0.2s;
}

.day-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.day-label {
  font-weight: 600;
  font-size: 15px;
}

.day-numbers {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.day-number {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: none;
  background: #f3f4f6;
  color: #4a5565;
  cursor: pointer;
  transition: 0.2s;
}

.day-number.active {
  background: #155dfc;
  color: white;
  font-weight: 600;
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
  top: 16px; 
  left: 16px;
  background: white;
  border-radius: 10px;
  padding: 8px 16px;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  width: calc(100% - 32px);
  z-index: 10;
}

.map-legend { 
  display: flex; 
  gap: 12px; 
  font-size: 14px; 
}

.dot {
  display: inline-block; 
  width: 12px; 
  height: 12px; 
  border-radius: 50%;
}

.dot.orange { background: #FF6900; }
.dot.yellow { background: #FE9A00; }
.dot.blue { background: #2B7FFF; }
.dot.green { background: #10B981; }

.map-canvas {
  width: 100%; 
  height: 100%; 
  position: relative;
}

/* 오른쪽 패널 */
.right-panel {
  width: 26%;
  min-width: 350px;
  max-width: 420px;
  border-left: 1px solid rgba(0,0,0,0.1);
  display: flex;
  flex-direction: column;
}

.search-header {
  padding: 16px;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  font-size: 16px;

  display: flex;                /* 가로 정렬 */
  justify-content: space-between; /* 좌측은 '검색', 우측은 버튼 */
  align-items: center;          /* 수직 중앙정렬 */
}

.theme-section {
  background: linear-gradient(135deg, #155DFC 0%, #0f47c9 100%);
  border-bottom: 1px solid rgba(0,0,0,0.1);
  transition: all 0.3s ease;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  padding: 16px;
  cursor: pointer;
  user-select: none;
}

.section-header:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.section-header h3 {
  font-size: 15px;
  font-weight: bold;
  margin: 0;
}

.badge {
  background: rgba(255, 255, 255, 0.25);
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
}

.toggle-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  width: 32px;
  height: 32px;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.loading-theme {
  color: white;
  text-align: center;
  padding: 20px;
}

.theme-place-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 320px;
  overflow-y: auto;
  padding: 0 16px 16px;
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    max-height: 0;
  }
  to {
    opacity: 1;
    max-height: 320px;
  }
}

.theme-place-card {
  background: white;
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  gap: 10px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.theme-place-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.theme-place-card.active {
  border: 2px solid #155dfc;
  background: #eef4ff;
}

.rank-badge {
  background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
  color: #fff;
  font-weight: bold;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  flex-shrink: 0;
  box-shadow: 0 2px 4px rgba(255, 215, 0, 0.3);
}

.place-icon {
  font-size: 28px;
  flex-shrink: 0;
}

.theme-place-info {
  flex: 1;
  min-width: 0;
}

.theme-place-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #1F2937;
}

.theme-category {
  font-size: 11px;
  color: #6B7280;
  margin: 2px 0;
}

.theme-address {
  font-size: 11px;
  color: #9CA3AF;
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
  gap: 12px;
  align-items: center;
  cursor: pointer;
}

.place-card.active {
  border: 2px solid #155dfc;
  background: #eef4ff;
}

.place-image-wrapper {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f3f4f6;
}

.place-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.place-image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.placeholder-icon {
  font-size: 32px;
}

.place-info {
  flex: 1;
  min-width: 0;
}

.place-name { font-weight: 500; }
.place-address { 
  font-size: 12px; 
  color: #6A7282; 
  margin-bottom: 4px; 
}
.place-meta { 
  font-size: 12px; 
  color: #4A5565; 
  display: flex; 
  gap: 12px; 
}

.add-btn {
  background: #155DFC;
  color: white;
  border-radius: 8px;
  border: none;
  padding: 6px 12px;
  font-size: 12px;
  cursor: pointer;
}

.add-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

/* 숙소 모달 */
.hotel-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.hotel-modal {
  width: 640px;
  max-height: 80vh;
  overflow-y: auto;
  background: white;
  border-radius: 12px;
  padding: 24px;
}

.hotel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 20px;
  cursor: pointer;
}

.hotel-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hotel-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 16px;
}

.hotel-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
}

.hotel-card:hover {
  border-color: #155dfc;
  background: #eef4ff;
}

.hotel-name {
  font-weight: 500;
}

.hotel-address {
  font-size: 12px;
  color: #6a7282;
}

/* 로딩 오버레이 */
.loading-overlay {
  position: fixed;
  inset: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #155DFC;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 흐림 효과 */
.main-layout.blurred {
  filter: blur(3px);
  pointer-events: none;
}




/* 모달 전체 배경 */
.sort-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1100;
}

/* 모달 카드 본체 */
.sort-modal {
  background: #fff;
  border-radius: 12px;
  width: 720px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.25s ease;
}

/* 상단 헤더 */
.sort-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-bottom: 1px solid #e5e7eb;
  background-color: #f9fafb;
}

.sort-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: #111827;
}
/* 모달 본문 */
.sort-body {
  display: flex;
  gap: 20px;
  justify-content: space-between;
  padding: 16px;
  /* 높이 제한 */
  max-height: 60vh; /* 모달 최대 높이의 60% */
  overflow-y: auto; /* 세로 스크롤 */
}

/* 리스트 구역 (현재 vs 정렬 후) */
.curr-list,
.sort-list {
  flex: 1;
}

/* 리스트 제목 */
.list-title {
  text-align: center; /* 제목 중앙 정렬 */
  font-weight: 600;
  margin-top: 8px;
  margin-bottom: 8px;
}

/* .sort-body > .curr-list >.list-title {
  
} */

.sort-body > .sort-list >.list-title {
  color: #155dfc;
}


/* 카드 스타일 (호텔 카드 느낌으로 통일) */
.sort-card {
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  padding: 12px 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  transition: 0.2s ease;
}

.sort-card.hovered {
  border-color: #155dfc;
  background-color: #eef4ff;
  transform: translateY(-2px);
}

.fix-card {
  background-color: #4A5565;
}



/* .sort-card:hover {
  border-color: #155dfc;
  background: #eef4ff;
} */

.sort_info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sort-name {
  font-weight: 500;
  color: #111827;
}

.sort-index {
  font-size: 12px;
  color: #6b7280;
}

.sort-category {
  font-size: 13px;
  color: #4b5563;
}

/* 버튼들 */
.sort-btn,
.sort-cancel-btn {
  padding: 10px 20px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: 0.2s ease;
}

.sort-btn {
  background-color: #155dfc;
  color: white;
}

.sort-btn:hover {
  background-color: #0f47c9;
}

.sort-cancel-btn {
  background-color: #f3f4f6;
  color: #374151;
}

.sort-cancel-btn:hover {
  background-color: #e5e7eb;
}

/* footer 버튼 영역 (중앙 정렬 + 여백 추가) */
.sort-footer {
  display: flex;
  justify-content: center; /* 버튼 중앙 정렬 */
  align-items: center;
  gap: 12px; /* 버튼 간격 */
  padding: 20px 0 28px; /* 위아래 여백 (특히 리스트와 간격 확보) */
  margin-top: 8px; /* 리스트와 살짝 띄우기 */
  border-top: 1px solid #e5e7eb;
  background-color: #f9fafb;
}


/* 모달 등장 애니메이션 */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
}

.custom-overlay {
  position: relative;
  background: white;
  border: 2px solid #3B82F6;
  border-radius: 10px;
  padding: 8px 12px;
  font-size: 13px;
  color: #333;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);
  text-align: left;
  width: 200px;
  transition: all 0.2s ease;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}

.overlay-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.overlay-header strong {
  color: #1E40AF;
  font-weight: 600;
  font-size: 14px;
}

.overlay-close {
  background: transparent;
  border: none;
  color: #666;
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  transition: color 0.2s;
}

.overlay-close:hover {
  color: #000;
}

.overlay-body {
  color: #555;
  font-size: 12px;
  line-height: 1.4;
}
</style>