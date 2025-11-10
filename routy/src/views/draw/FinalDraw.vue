<template>
  <div class="step-container">
    <div class="step-content full-layout">
      <!-- 상단 헤더 -->
      <header class="top-bar">
        <div class="back-btn" @click="goPrev">← 이전</div>
        <div class="arrive-time">{{ startLocation.name }} 출발</div>
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
                :disabled="isDayCompleted"
              >자동 정렬</button>
            </div>
            <button class="end-btn" @click="endDaySchedule">일정 종료</button>
          </div>

          <div class="info-box blue">
            <span>시작 시간:</span>
            <strong>09:00</strong>
          </div>

          <div class="info-box gray">
            뭐든 맘껏 돌아보고 맘껏 드셔봐요~
          </div>

          <div class="empty-guide" v-if="selectedPlaces.length === 0">
            오른쪽에서 장소를 추가해주세요
          </div>

          <!-- 선택된 리스트 영역 (이미지 스타일 적용) -->
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
                    <div class="card-category">{{ element.categoryGroupName || element.description || '기타' }}</div>
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

          <div class="place-list">
            <div
              v-for="(p, i) in places"
              :key="i"
              class="place-card"
              @click="selectPlace(p)"
              :class="{ active: selectedPlace && selectedPlace.title === p.title }"
            >
              <div class="place-info">
                <div class="place-name">{{ p.title }}</div>
                <div class="place-address">{{ p.addressName }}</div>
                <div class="place-meta">
                  <span>{{ p.categoryGroupName }}</span>
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

  <!-- 숙소 모달 (전체 화면 덮기) -->
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
import { useRoute } from "vue-router";
import axios from "axios";
import draggable from "vuedraggable";

// 마커 이미지 import
import restaurantMarker from '@/assets/images/icons/restaurant-marker.svg';
import cafeMarker from '@/assets/images/icons/cafe-marker.svg';
import attractionMarker from '@/assets/images/icons/attraction-marker.svg';

// 폴리라인 그리기
import { deletePoliLine, direction, sortDirection } from '@/utils/draw/direction'

const route = useRoute();
const planId = Number(route.query.planId);
const totalDays = Number(route.query.totalDays) || 1;
console.log("planId:", planId, "/ totalDays:", totalDays);

// 지도 관련
const mapContainer = ref(null);
let map = null;
let marker = null;
const placeMarkers = ref([]); // 추가된 장소 마커들을 저장

// 시작 지점 (Plan의 regionId에 따라 설정)
const startLocation = ref({
  lat: 37.5665,
  lng: 126.9780,
  name: "서울역"
});

// rgionId별 시작 지점 매핑 (관광 중심지 기준)
const regionStartPoints = {
  1: { lat: 37.5547, lng: 126.9707, name: "서울역", type: "교통허브 🚄" },
  2: { lat: 35.1149, lng: 129.0422, name: "부산역", type: "교통허브 🚄" },
  3: { lat: 33.5067, lng: 126.4927, name: "제주국제공항", type: "공항 ✈️" },
  4: { lat: 37.7636, lng: 128.8989, name: "강릉역", type: "교통허브 🚄" },
  5: { lat: 35.8389, lng: 129.2181, name: "경주역", type: "교통허브 🚄" },
  6: { lat: 34.7423, lng: 127.7440, name: "여수엑스포역", type: "교통허브 🚄" },
  7: { lat: 35.8125, lng: 127.1351, name: "전주역", type: "교통허브 🚄" },
  8: { lat: 38.2078, lng: 128.5914, name: "속초시외버스터미널", type: "터미널 🚌" },
  9: { lat: 37.4602, lng: 126.4407, name: "인천국제공항", type: "공항 ✈️" },
  10: { lat: 36.3315, lng: 127.4346, name: "대전역", type: "교통허브 🚄" },
  11: { lat: 35.8794, lng: 128.6283, name: "동대구역", type: "교통허브 🚄" },
  12: { lat: 35.1278, lng: 126.7977, name: "광주송정역", type: "교통허브 🚄" },
};

// 장소 관련
const currentType = ref("restaurants");
const places = ref([]);
const selectedPlace = ref(null);

// 일차 관련
const durations = ref([]);
const selectedDay = ref(1);

// 일차별 장소 데이터 (일차별로 저장)
const placesByDay = ref({});
const selectedPlaces = computed(() => placesByDay.value[selectedDay.value] || []);

// 일차별 종료 상태 (종료된 일차는 수정 불가)
const completedDays = ref(new Set());

// 타입별 마커 이미지 URL 정의
const getMarkerImageUrl = (type) => {
  const markerImages = {
    'restaurants': restaurantMarker,  // 맛집 - 커스텀 이미지
    'cafes': cafeMarker,              // 카페 - 커스텀 이미지
    'attractions': attractionMarker,   // 관광지 - 커스텀 이미지
    'hotel': 'https://t1.daumcdn.net/localimg/localimages/07/mapapidoc/markerStar.png' // 숙소 - 별
  };
  return markerImages[type] || markerImages['attractions'];
};

// 마커 생성 함수
const createMarker = (place, placeType) => {
  if (!map) return null;
  
  const position = new kakao.maps.LatLng(place.latitude, place.longitude);
  const markerImageUrl = getMarkerImageUrl(placeType);
  
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
  
  // 마커 클릭 이벤트 추가
  kakao.maps.event.addListener(newMarker, 'click', function() {
    highlightPlace(place);
  });
  
  return newMarker;
};

// 장소 선택/강조 함수
const highlightPlace = (place) => {
  selectedPlace.value = place;
  
  // 지도 중심 이동
  if (map) {
    const pos = new kakao.maps.LatLng(place.latitude, place.longitude);
    map.panTo(pos);
  }
  
  // 오른쪽 리스트에서 스크롤 (선택적)
  const placeElement = document.querySelector(`[data-place-title="${place.title}"]`);
  if (placeElement) {
    placeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
};

// 모든 마커 제거
const clearAllMarkers = () => {
  placeMarkers.value.forEach(marker => marker.setMap(null));
  placeMarkers.value = [];
};

// 현재 일차의 장소들을 지도에 표시
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
    
    const marker = createMarker(place, placeType);
    if (marker) {
      placeMarkers.value.push(marker);
    }
  });
  
  console.log(`${selectedDay.value}일차 마커 ${placeMarkers.value.length}개 표시`);
};

// 지도 초기화
const initMap = () => {
  const waitForKakao = () => {
    if (window.kakao && window.kakao.maps) {
      window.kakao.maps.load(() => {
        const center = new kakao.maps.LatLng(startLocation.value.lat, startLocation.value.lng);
        map = new kakao.maps.Map(mapContainer.value, { center, level: 5 });
        console.log("Kakao 지도 초기화 완료:", startLocation.value.name);
        
        // 초기 마커 표시
        updateMapMarkers();
      });
    } else {
      setTimeout(waitForKakao, 500);
    }
  };
  waitForKakao();
};

// Plan 정보 가져오기 (regionId 확인)
const loadPlanInfo = async () => {
  try {
    const res = await axios.get(`/api/plans/${planId}`);
    const plan = res.data;
    console.log("Plan 정보:", plan);
    
    if (plan.regionId && regionStartPoints[plan.regionId]) {
      startLocation.value = regionStartPoints[plan.regionId];
      console.log(`시작 지점 설정: ${startLocation.value.name} (${startLocation.value.type})`);
    }
  } catch (err) {
    console.error("Plan 정보 불러오기 실패:", err);
  }
};

// Kakao API 장소 불러오기 (마지막 추가된 장소 기준)
const loadPlaces = async (type) => {
  currentType.value = type;
  
  // 검색 기준 좌표 결정
  let searchLat, searchLng;
  const currentDayPlaces = placesByDay.value[selectedDay.value] || [];
  
  if (currentDayPlaces.length > 0) {
    const lastPlace = currentDayPlaces[currentDayPlaces.length - 1];
    searchLat = lastPlace.latitude;
    searchLng = lastPlace.longitude;
    console.log(`마지막 장소(${lastPlace.title}) 기준으로 검색`);
  } else {
    searchLat = startLocation.value.lat;
    searchLng = startLocation.value.lng;
    console.log(`${startLocation.value.name} 기준으로 검색`);
  }
  
  try {
    const res = await axios.get(`/api/kakao/${type}`, { 
      params: { 
        lat: searchLat, 
        lng: searchLng 
      } 
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
      planId,
    }));
    console.log(`${type} ${places.value.length}개 검색 완료`);
  } catch (err) {
    console.error("장소 불러오기 실패:", err);
  }
};

// 지도 선택
const selectPlace = (p) => {
  selectedPlace.value = p;
  if (!map) return;
  const pos = new kakao.maps.LatLng(p.latitude, p.longitude);
  if (marker) marker.setMap(null);
  marker = new kakao.maps.Marker({ position: pos, map });
  map.panTo(pos);
};

// 지도 중심을 마지막 추가된 장소로 이동
const updateMapCenter = () => {
  if (!map) return;
  
  const currentDayPlaces = placesByDay.value[selectedDay.value] || [];
  if (currentDayPlaces.length > 0) {
    const lastPlace = currentDayPlaces[currentDayPlaces.length - 1];
    const pos = new kakao.maps.LatLng(lastPlace.latitude, lastPlace.longitude);
    map.panTo(pos);
    console.log(`지도 중심 이동: ${lastPlace.title}`);
  }
};

// 장소 추가/삭제
const addPlace = (p) => {
  const day = selectedDay.value;
  if (!placesByDay.value[day]) placesByDay.value[day] = [];
  if (!placesByDay.value[day].find((x) => x.title === p.title)) {
    placesByDay.value[day].push({ ...p, dayNumber: day });
    console.log(`${p.title} 추가됨`);
    
    // 마커 업데이트
    updateMapMarkers();
    
    // 지도 중심 이동
    updateMapCenter();
    
    // 추가 후 해당 장소 기준으로 재검색
    loadPlaces(currentType.value);
  }
};

const removePlace = (p) => {
  const day = selectedDay.value;
  if (placesByDay.value[day]) {
    placesByDay.value[day] = placesByDay.value[day].filter((x) => x.title !== p.title);
    console.log(`${p.title} 제거됨`);
    
    // 마커 업데이트
    updateMapMarkers();
    
    // 지도 중심 이동
    updateMapCenter();

    // 그려진 경로가 있다면 삭제
    deletePoliLine();
    
    // 제거 후 재검색
    loadPlaces(currentType.value);
  }
};

// 고정 버튼 토글
const toggleFix = (place) => {
  place.fixed = !place.fixed;
};

// 드래그 시 고정된 항목을 경계로 블록 단위로만 이동 가능
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
  
  // 마커 업데이트
  updateMapMarkers();
  
  closeHotelModal();
};

const focusHotelOnMap = (hotel) => {
  if (!hotelMap) return;
  const pos = new kakao.maps.LatLng(hotel.latitude, hotel.longitude);
  hotelMap.panTo(pos);
};

// Duration 불러오기 (중복 방지)
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

// 일정 종료 (해당 일차 수정 불가)
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

onMounted(async () => {
  await loadPlanInfo();
  initMap();
  await loadDurations();
  await loadPlaces("restaurants");
});


// 폴리 라인 그리기
const drawRoute = async () => {
  console.log("장소들:", placesByDay.value[selectedDay.value]);
  
  await direction(map, placesByDay.value[selectedDay.value]);
}

// 자동 정렬하기
const drawSort = async () => {
  const currentPlaces = placesByDay.value[selectedDay.value];
  console.log("현재 장소들:", currentPlaces);

  const newLocations = await sortDirection(map, currentPlaces);

  if (!newLocations || newLocations.length === 0) {
    console.warn("정렬된 경로가 없습니다.");
    return;
  }

  const reorderedPlaces = newLocations.map(nLoc => {
    return currentPlaces.find(p =>
      p.title === nLoc.name ||
      (Math.abs(p.latitude - nLoc.y) < 1e-6 &&
        Math.abs(p.longitude - nLoc.x) < 1e-6)
    );
  }).filter(Boolean); // 매칭 실패 시 제거

  placesByDay.value[selectedDay.value] = reorderedPlaces;
  console.log("정렬된 장소:", reorderedPlaces)
  console.log("정렬된 장소:", placesByDay.value[selectedDay.value]);
}

</script>

<style scoped>

.dot.purple { background: #A855F7; } /* 연보라 (카페 등) */
.dot.brown { background: #9A6648; }  /* 브라운톤 (맛집 등) */

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
  justify-content: space-between;
  align-items: flex-start;
  cursor: pointer;
}
.place-card.active {
  border: 2px solid #155dfc;
  background: #eef4ff;
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