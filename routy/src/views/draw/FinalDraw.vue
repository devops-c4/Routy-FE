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
            <div class="left-actions-grid">
              <div></div> <!-- 2사분면 빈 공간 -->
              
              <button 
                class="left-btn" 
                @click="drawRoute"
                :disabled="isDayCompleted"
              >경로 그리기</button>

              <button 
                class="left-btn"
                :class="{ active: showHotelModal }"
                @click="openHotelModal" 
                :disabled="isDayCompleted"
              >숙소 선택</button>

              <button 
                class="left-btn" 
                @click="drawSort"
                :disabled="isDayCompleted || isLoading">            
                <span v-if="isLoading">⏳ 정렬 중...</span>
                <span v-else>자동 정렬</span>
              </button>
            </div>
            <!-- 로딩 스피너 -->
            <div v-if="isLoading" class="loading-overlay">
              <div class="spinner"></div>
              <p>자동 정렬 중입니다. 잠시만 기다려주세요...</p>
            </div>

            <button class="end-btn" @click="endDaySchedule">일정 종료</button>
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
                        <span v-if="!element.showTimeInput">⏰ 시간 입력</span>
                        <span v-else>🔼 접기</span>
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
          <div class="search-header">검색</div>
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
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
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
import { deletePoliLine, direction, sortDirection } from '@/utils/draw/direction'

const route = useRoute();
const router = useRouter();
// const planId = Number(route.query.planId);
// const totalDays = Number(route.query.totalDays) || 1;

//진짜 state는 여기 (일정수정에서 넘어온거 테스트중)
const historyState = window.history.state || {};

// 수정페이지에서 넘겨준 데이터 (일정수정에서 넘어온거 테스트중)
const previousData =
  historyState.previousData ??
  route.state?.previousData ??
  null;

const targetDayFromState =
  historyState.targetDay ??
  route.state?.targetDay ??
  null;

// query로 들어온 데이터 (기존 흐름용 fallback) (일정수정에서 넘어온거 테스트중)
const planIdFromQuery = route.query.planId
  ? Number(route.query.planId)
  : null;
const targetDayFromQuery = route.query.targetDay
  ? Number(route.query.targetDay)
  : null;

// 최종 확정 (state → query 순으로 우선순위) (일정수정에서 넘어온거 테스트중)
const planId = previousData?.planId
  ? Number(previousData.planId)
  : planIdFromQuery;

const targetDay = targetDayFromState || targetDayFromQuery;

// (일정수정에서 넘어온거 테스트중)
console.log("👀 historyState:", historyState);
console.log("👀 previousData 최종:", previousData);
console.log("👀 targetDay 최종:", targetDay);

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
  
  kakao.maps.event.addListener(newMarker, 'click', function() {
    highlightPlace(place, true);
  });
  
  return newMarker;
};

// 장소 선택/강조 함수
const highlightPlace = async (place, fromMarkerClick = false) => {
  // 지도 중심을 해당 장소로 이동 (줌 레벨도 조정)
  if (map && place.latitude && place.longitude) {
    const position = new kakao.maps.LatLng(place.latitude, place.longitude);
    map.setCenter(position);
    // 줌 레벨을 5로 설정하여 적절한 거리에서 보기
    if (map.getLevel() > 5) {
      map.setLevel(5);
    }
  }
  
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
  
  selectedPlace.value = place;
  
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

// 선택된 장소 마커 표시
const updateMapMarkers = () => {
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
    const res = await axios.get(`/api/plans/select/${planId}`);
    const plan = res.data;
    
    const regionId = plan.regionId || plan.region_id;
    
    if (regionId) {
      const regionRes = await axios.get(`/api/regions/${regionId}`);
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
    const res = await axios.get(`/api/kakao/${type}`, { 
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
};

// 장소 추가 (일정수정에서 넘어온거 테스트중)
const addPlace = (p) => {
  // 1) 일정수정 페이지에서 넘어온 경우인지 먼저 확인
  if (previousData && targetDay) {
    // targetDay는 1부터 들어오니까 index로 바꾸기
    const dayIdx = targetDay - 1;

    // 안전장치: dayList가 없거나 해당 day가 없으면 막기 (일정수정에서 넘어온거 테스트중)
    if (!previousData.dayList || !previousData.dayList[dayIdx]) {
      alert("추가할 일차 정보를 찾을 수 없습니다.");
      return;
    }
    const targetDayObj = previousData.dayList[dayIdx];

    // final 페이지에서 선택한 kakao place p를 (일정수정에서 넘어온거 테스트중)
    // 수정페이지에서 쓰는 구조로 매핑
    const newActivity = {
      travelId: null, // 새로 추가니까 일단 null (일정수정에서 넘어온거 테스트중)
      travelOrder: previousData.dayList[dayIdx].activities.length + 1,
      title: p.title,
      tag: p.categoryGroupName || p.categoryCode || "기타",
      placeName: p.title,
      addressName: p.addressName,
      categoryGroupName: p.categoryGroupName,
      placeUrl: p.placeUrl,
    };

    // 그 day의 activities에 끼워넣기
  targetDayObj.activities.push(newActivity);

router.push({
  path: `/mypage/travel/${previousData.planId}/edit`,
  state: {
    updatedData: previousData,
  },
});

    return;
  }

  // 평소 final 페이지에서 쓰는 기존 로직 (원래 있던 거) 
  const day = selectedDay.value;
  if (!placesByDay.value[day]) placesByDay.value[day] = [];
  if (!placesByDay.value[day].find((x) => x.title === p.title)) {
    placesByDay.value[day].push({ 
      ...p, 
      dayNumber: day,
      startTime: p.startTime || '',
      endTime: p.endTime || ''
    });
    console.log(`${p.title} 추가`);
    updateMapMarkers();
  }
};

// 장소 제거
const removePlace = (p) => {
  const day = selectedDay.value;
  if (placesByDay.value[day]) {
    placesByDay.value[day] = placesByDay.value[day].filter((x) => x.title !== p.title);
    console.log(`${p.title} 제거`);
    updateMapMarkers();
    deletePoliLine();
    
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
    const res = await axios.get(`/api/kakao/hotels`, { 
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
    const res = await axios.get(`/api/plans/${planId}/durations`);
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
  }
};

const goNextDay = () => {
  if (selectedDay.value < durations.value.length) {
    selectedDay.value++;
    deletePoliLine();
  }
};

const selectDay = (day) => {
  selectedDay.value = day;
  deletePoliLine();
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
const saveAllDaysPlaces = async () => {
  try {
    for (const duration of durations.value) {
      const dayPlaces = placesByDay.value[duration.day] || [];
      if (!dayPlaces.length) continue;
      
      for (const place of dayPlaces) {
        if (place.startTime && place.endTime) {
          if (place.endTime <= place.startTime) {
            alert(`${place.title}의 종료 시간이 시작 시간보다 이릅니다. 시간을 확인해주세요.`);
            return;
          }
        }
      }
      
      const mappedPlaces = dayPlaces.map((p, i) => ({
        durationId: duration.durationId,
        planId,
        travelOrder: i + 1,
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
      
      console.log(`${duration.day}일차 전송 데이터:`, mappedPlaces);
      await axios.post("/api/places/batch", mappedPlaces);
    }
    alert("전체 일정 저장 완료!");
        // 1) 우선 라우터로 시도
    await router.push({ path: '/mypage' }).catch(() => {
      // 2) 혹시 라우터가 거부하면 그냥 강제로 이동
      window.location.href = '/mypage'
    })
  } catch (err) {
    console.error("저장 실패:", err);
    console.error("에러 상세:", err.response?.data);
  }
};

// 컴포넌트 마운트
onMounted(async () => {
  console.log("컴포넌트 초기화 시작");
  
  await loadPlanInfo();
  await loadDurations();
  initMap(startLocation.value);
  
  await nextTick();
  await loadPlaces("restaurants");
  
  console.log("초기화 완료");
});

// 경로 그리기
const drawRoute = async () => {
  await direction(map, placesByDay.value[selectedDay.value]);
};

// 자동 정렬
const isLoading = ref(false);

const drawSort = async () => {
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
  
  placesByDay.value[selectedDay.value] = reorderedPlaces;
  console.log("정렬 완료:", reorderedPlaces);
};
</script>

<style scoped>
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
}

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

.end-btn {
  width: 100%;
  height: 32px;
  border-radius: 8px;
  background: #F54900;
  color: white;
  border: none;
  cursor: pointer;
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
</style>