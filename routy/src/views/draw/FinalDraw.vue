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
            <div class="action-row">
              <button 
                class="left-btn"
                :class="{ active: showHotelModal }"
                @click="openHotelModal" 
                :disabled="isDayCompleted"
              >숙소 선택</button>
              <button class="left-btn" :disabled="isDayCompleted">자동 정렬</button>
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
                <div class="selected-card" :class="{ fixed: element.fixed, hotel: element.isHotel, completed: isDayCompleted }">
                  <div class="drag-handle" :class="{ disabled: element.fixed || isDayCompleted }">⋮⋮</div>
                  <div class="card-content">
                    <div class="card-header">
                      <span class="day-badge">일정 {{ index + 1 }}</span>
                      <span v-if="element.isHotel" class="hotel-badge">숙소</span>
                    </div>
                    <div class="card-title">{{ element.title }}</div>
                    <div class="card-category">{{ getLastCategory(element.description || element.categoryGroupName) }}</div>
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
                <span><i class="dot blue"></i> 관광지</span>
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
        <div class="hotel-map" ref="hotelMapContainer"></div>

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
import { ref, computed, onMounted, watch } from "vue";
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

const route = useRoute();
const router = useRouter();
const planId = Number(route.query.planId);
const totalDays = Number(route.query.totalDays) || 1;
console.log("planId:", planId, "/ totalDays:", totalDays);

// 지도 관련
const mapContainer = ref(null);
let map = null;
let marker = null;
const placeMarkers = ref([]);
const searchResultMarkers = ref([]);

// 리스트 스크롤 관련
const placeListContainer = ref(null);
const placeCardRefs = ref({});

// 시작 지점 (해당 지역의 위경도값을 불러오지 못할 경우 기본값) 
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
const lastSearchCoords = ref({ lat: null, lng: null });

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

// 검색 결과용 마커 이미지 (작은 크기)
const getSearchMarkerImageUrl = (type) => {
  const markerImages = {
    'restaurants': restaurantMarker,
    'cafes': cafeMarker,
    'attractions': attractionMarker,
  };
  return markerImages[type] || markerImages['attractions'];
};

// 선택된 장소용 마커 이미지 (큰 크기)
const getSelectedMarkerImageUrl = (type) => {
  const markerImages = {
    'restaurants': restaurantSelect,
    'cafes': cafeSelect,
    'attractions': attractionSelect,
    'hotel': hotelSelect
  };
  return markerImages[type] || markerImages['attractions'];
};

// 검색 결과 마커 생성 (작은 크기 40x40)
const createSearchMarker = (place, placeType) => {
  if (!map) return null;
  
  const position = new kakao.maps.LatLng(place.latitude, place.longitude);
  const markerImageUrl = getSearchMarkerImageUrl(placeType);
  
  const markerImage = new kakao.maps.MarkerImage(
    markerImageUrl,
    new kakao.maps.Size(40, 40)
  );
  
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

// 선택된 장소 마커 생성 (큰 크기 60x60)
const createSelectedMarker = (place, placeType) => {
  if (!map) return null;
  
  const position = new kakao.maps.LatLng(place.latitude, place.longitude);
  const markerImageUrl = getSelectedMarkerImageUrl(placeType);
  
  const markerImage = new kakao.maps.MarkerImage(
    markerImageUrl,
    new kakao.maps.Size(60, 60)
  );
  
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
const highlightPlace = (place, fromMarkerClick = false) => {
  selectedPlace.value = place;
  
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

// 왼쪽 추가된 장소 마커 제거
const clearAllMarkers = () => {
  placeMarkers.value.forEach(marker => marker.setMap(null));
  placeMarkers.value = [];
};

// 오른쪽 검색 결과 마커 제거
const clearSearchResultMarkers = () => {
  searchResultMarkers.value.forEach(marker => marker.setMap(null));
  searchResultMarkers.value = [];
};

// 검색 결과 마커 표시 (작은 마커)
const displaySearchResultMarkers = () => {
  clearSearchResultMarkers();
  
  places.value.forEach(place => {
    let placeType;
    if (currentType.value === 'restaurants') {
      placeType = 'restaurants';
    } else if (currentType.value === 'cafes') {
      placeType = 'cafes';
    } else {
      placeType = 'attractions';
    }
    
    const marker = createSearchMarker(place, placeType);
    if (marker) {
      searchResultMarkers.value.push(marker);
    }
  });
  
  console.log(`검색 결과 마커 ${searchResultMarkers.value.length}개 표시`);
};

// 왼쪽 선택된 장소 마커 표시 (큰 마커)
const updateMapMarkers = () => {
  clearAllMarkers();
  
  const currentDayPlaces = placesByDay.value[selectedDay.value] || [];
  currentDayPlaces.forEach(place => {
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
    
    const marker = createSelectedMarker(place, placeType);
    if (marker) {
      placeMarkers.value.push(marker);
    }
  });
  
  console.log(`${selectedDay.value}일차 선택된 마커 ${placeMarkers.value.length}개 표시`);
};

// 지도 초기화
const initMap = (location) => {
  console.log("🗺️ initMap 호출됨 - 전달받은 location:", location);
  
  const waitForKakao = () => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        console.log("🗺️ Kakao Maps API 로드 완료");
        console.log("📍 지도 생성 시 사용할 좌표:", location);
        
        const center = new kakao.maps.LatLng(location.lat, location.lng);
        map = new kakao.maps.Map(mapContainer.value, { 
          center, 
          level: 5 
        });
        
        console.log(`✅ Kakao 지도 초기화 완료: ${location.name}`);
        console.log(`📌 지도 중심 좌표: lat=${location.lat}, lng=${location.lng}`);
        
        updateMapMarkers();
        
        // ✅ 지도 이동 시 장소 재검색 (중복 방지 로직 추가)
        kakao.maps.event.addListener(map, "idle", async () => {
          const center = map.getCenter();
          const lat = center.getLat();
          const lng = center.getLng();
          
          // 유의미한 변경이 있을 때만 검색
          if (hasSignificantChange(lat, lng) && !isSearching.value) {
            console.log("📍 지도 이동 감지 - 새로운 검색:", lat, lng);
            await loadPlaces(currentType.value, lat, lng);
          }
        });
      });
    } else {
      console.log("⏳ Kakao Maps API 대기 중...");
      setTimeout(waitForKakao, 500);
    }
  };
  waitForKakao();
};

// 좌표가 유의미하게 변경되었는지 확인
const hasSignificantChange = (newLat, newLng) => {
  if (!lastSearchCoords.value.lat) return true;
  
  const latDiff = Math.abs(newLat - lastSearchCoords.value.lat);
  const lngDiff = Math.abs(newLng - lastSearchCoords.value.lng);
  
  // 0.01도 이상 변경되었을 때만 새로 검색 (약 1km)
  return latDiff > 0.01 || lngDiff > 0.01;
};

// Plan 정보 가져오기 및 시작 지점 설정
const loadPlanInfo = async () => {
  try {
    const res = await axios.get(`/api/plans/select/${planId}`);
    const plan = res.data;
    console.log("📋 Plan 정보:", plan);
    
    const regionId = plan.regionId || plan.region_id;
    console.log("📍 추출된 regionId:", regionId);
    
    if (regionId) {
      // Region 정보 가져오기
      const regionRes = await axios.get(`/api/regions/${regionId}`);
      const region = regionRes.data;
      console.log("🗺️ Region 정보:", region);
      
      if (region.startLat && region.startLng) {
        startLocation.value = {
          lat: parseFloat(region.startLat),
          lng: parseFloat(region.startLng),
          name: region.regionName,
          type: "출발지"
        };
        console.log(`✅ DB 기반 시작지점 설정: ${startLocation.value.name}`);
        console.log(`📌 좌표: lat=${startLocation.value.lat}, lng=${startLocation.value.lng}`);
      }
    }
  } catch (err) {
    console.error("❌ Plan/Region 정보 불러오기 실패:", err);
    console.error("에러 상세:", err.response?.data || err.message);
  }
};

// Kakao API 장소 불러오기 (중복 방지 추가)
const loadPlaces = async (type, lat = null, lng = null) => {
  if (isSearching.value) {
    console.log("⏸️ 이미 검색 중...");
    return;
  }
  
  currentType.value = type;
  
  let searchLat = lat;
  let searchLng = lng;
  
 // 검색 기준 좌표 결정
  if (!searchLat || !searchLng) {
    const currentDayPlaces = placesByDay.value[selectedDay.value] || [];
    if (currentDayPlaces.length > 0) {
      const lastPlace = currentDayPlaces[currentDayPlaces.length - 1];
      searchLat = lastPlace.latitude;
      searchLng = lastPlace.longitude;
    } else {
      // 초기 검색 시 startLocation 사용
      searchLat = startLocation.value.lat;  
      searchLng = startLocation.value.lng;
    }
  }
  
  // 이전 검색과 좌표가 같으면 스킵
  if (!hasSignificantChange(searchLat, searchLng)) {
    console.log("좌표 변경 없음 - 검색 스킵");
    return;
  }
  
  console.log(`${type} 검색 좌표: lat=${searchLat}, lng=${searchLng}`);
  
  isSearching.value = true;
  
  try {
    const res = await axios.get(`/api/kakao/${type}`, { 
      params: { lat: searchLat, lng: searchLng }
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
    }));
    console.log(`${type} ${places.value.length}개 검색 완료`);
    
    // 검색 좌표 업데이트
    lastSearchCoords.value = { lat: searchLat, lng: searchLng };
    
    displaySearchResultMarkers();
  } catch (err) {
    console.error("장소 불러오기 실패:", err);
  } finally {
    isSearching.value = false;
  }
};

// 지도 선택
const selectPlace = (p) => {
  selectedPlace.value = p;
};

// 장소 추가
const addPlace = (p) => {
  const day = selectedDay.value;
  if (!placesByDay.value[day]) placesByDay.value[day] = [];
  if (!placesByDay.value[day].find((x) => x.title === p.title)) {
    placesByDay.value[day].push({ ...p, dayNumber: day });
    console.log(`${p.title} 추가됨`);
    updateMapMarkers();
  }
};

// 장소 제거
const removePlace = (p) => {
  const day = selectedDay.value;
  if (placesByDay.value[day]) {
    placesByDay.value[day] = placesByDay.value[day].filter((x) => x.title !== p.title);
    console.log(`${p.title} 제거됨`);
    updateMapMarkers();
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
  console.log("숙소 모달 열림");
  
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
    
    // 숙소 모달 지도 초기화
    setTimeout(() => {
      if (hotelMapContainer.value && window.kakao) {
        const center = new kakao.maps.LatLng(startLocation.value.lat, startLocation.value.lng);
        hotelMap = new kakao.maps.Map(hotelMapContainer.value, { center, level: 6 });
      }
    }, 100);
  } catch (e) {
    console.error("숙소 불러오기 실패:", e);
  }
};

const closeHotelModal = () => {
  showHotelModal.value = false;
  console.log("숙소 모달 닫힘");
};

const addHotel = (hotel) => {
  const day = selectedDay.value;
  if (!placesByDay.value[day]) placesByDay.value[day] = [];
  if (!placesByDay.value[day].find((x) => x.title === hotel.title)) {
    placesByDay.value[day].push({ ...hotel, isHotel: true });
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
    console.error("Duration 불러오기 실패:", err);
  }
};

// 일차 이동
const goPrevDay = () => {
  if (selectedDay.value > 1) selectedDay.value--;
};
const goNextDay = () => {
  if (selectedDay.value < durations.value.length) selectedDay.value++;
};
const selectDay = (day) => {
  selectedDay.value = day;
};

// 일차 변경 시 마커 업데이트
watch(selectedDay, () => {
  updateMapMarkers();
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
  console.log(`이미지 로드 실패: ${place.title}`);
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

// 저장
const saveAllDaysPlaces = async () => {
  try {
    for (const duration of durations.value) {
      const dayPlaces = placesByDay.value[duration.day] || [];
      if (!dayPlaces.length) continue;
      await axios.post("/api/places/batch", dayPlaces.map((p, i) => ({ 
        ...p,
        durationId: duration.durationId,
        planId,
        travelOrder: i + 1,
      })));
    }
    alert("전체 일정 저장 완료!");
  } catch (err) {
    console.error("저장 실패:", err);
  }
};

// 컴포넌트 마운트 시 실행
onMounted(async () => {
  console.log("🚀 컴포넌트 마운트 시작");
  console.log("📍 planId:", planId);
  
  // 1. Plan 및 Region 정보 로드 (시작 좌표 포함)
  await loadPlanInfo();

  // 2. Duration 정보 로드
  await loadDurations();

  // 3. 지도 초기화 (startLocation 기준)
  initMap(startLocation.value);

  // 4. 초기 장소 검색
  await loadPlaces("restaurants");

  console.log("초기화 완료");
});

</script>

<style scoped>
.dot.purple { background: #d877e1; }
.dot.brown { background: #d0a473; }

.full-layout {
  max-width: 1520px;
  border-radius: 14px;
  overflow: hidden;
}

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
  height: 32px;
  cursor: pointer;
  background: white;
  color: #4A5565;
  transition: 0.2s;
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
}

.selected-card:hover {
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
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

.drag-handle {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #9CA3AF;
  cursor: grab;
  padding-right: 12px;
  user-select: none;
}

.drag-handle.disabled {
  cursor: not-allowed;
  opacity: 0.3;
}

.selected-card.fixed .drag-handle {
  cursor: not-allowed;
  opacity: 0.4;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.day-badge {
  background: #F3F4F6;
  color: #6B7280;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 6px;
}

.hotel-badge {
  background: #D1FAE5;
  color: #065F46;
  font-size: 12px;
  font-weight: 500;
  padding: 4px 8px;
  border-radius: 6px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: #1F2937;
  line-height: 1.4;
}

.card-category {
  font-size: 12px;
  color: #6B7280;
  margin-top: 2px;
  margin-bottom: 4px;
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
  top: 16px; left: 16px;
  background: white;
  border-radius: 10px;
  padding: 8px 16px;
  box-shadow: 0 4px 6px -4px rgba(0,0,0,0.1);
  display: flex; justify-content: space-between; align-items: center;
  width: calc(100% - 32px);
  z-index: 10;
}

.map-legend { display: flex; gap: 12px; font-size: 14px; }

.dot {
  display: inline-block; width: 12px; height: 12px; border-radius: 50%;
}

.dot.orange { background: #FF6900; }
.dot.yellow { background: #FE9A00; }
.dot.blue { background: #2B7FFF; }
.dot.green { background: #10B981; }

.map-canvas {
  width: 100%; height: 100%; position: relative;
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
.place-address { font-size: 12px; color: #6A7282; margin-bottom: 4px; }
.place-meta { font-size: 12px; color: #4A5565; display: flex; gap: 12px; }

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

.hotel-map {
  width: 100%;
  height: 300px;
  border-radius: 10px;
  background: #f3f4f6;
  margin-bottom: 16px;
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
</style>