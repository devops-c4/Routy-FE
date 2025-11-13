import { ref, nextTick } from 'vue';
import apiClient from '@/utils/axios';

export function usePlaces(planId) {
  const currentType = ref("restaurants");
  const places = ref([]);
  const selectedPlace = ref(null);
  const isSearching = ref(false);
  const lastSearchCoords = ref({ lat: null, lng: null, type: null });

  // 좌표 변경 확인
  const hasSignificantChange = (newLat, newLng, newType) => {
    if (!lastSearchCoords.value.lat || lastSearchCoords.value.type !== newType) {
      return true;
    }
    
    const latDiff = Math.abs(newLat - lastSearchCoords.value.lat);
    const lngDiff = Math.abs(newLng - lastSearchCoords.value.lng);
    
    return latDiff > 0.008 || lngDiff > 0.008;
  };

  // 장소 불러오기
  const loadPlaces = async (type, lat = null, lng = null, placesByDay = {}, selectedDay = 1, startLocation = {}) => {
    if (isSearching.value) {
      console.log("⏸ 이미 검색 중...");
      return;
    }
    
    currentType.value = type;
    
    let searchLat = lat;
    let searchLng = lng;
    
    if (!searchLat || !searchLng) {
      const currentDayPlaces = placesByDay[selectedDay] || [];
      if (currentDayPlaces.length > 0) {
        const lastPlace = currentDayPlaces[currentDayPlaces.length - 1];
        searchLat = lastPlace.latitude;
        searchLng = lastPlace.longitude;
      } else {
        searchLat = startLocation.lat;  
        searchLng = startLocation.lng;
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
        endTime: ''
      }));
      
      console.log(`${type} ${places.value.length}개 로드 완료`);
      
      lastSearchCoords.value = { lat: searchLat, lng: searchLng, type };
      
      await nextTick();
      
      return places.value;
      
    } catch (err) {
      console.error("장소 로드 실패:", err);
      places.value = [];
      return [];
    } finally {
      isSearching.value = false;
    }
  };

  // 카테고리 마지막 부분 추출 함수
  const getLastCategory = (categoryString) => {
    if (!categoryString) return '기타';
    const parts = categoryString.split(' > ');
    return parts[parts.length - 1].trim();
  };

  // 카테고리 코드로 타입 판별
  const getCategoryType = (categoryCode) => {
    if (categoryCode === 'FD6') {
      return 'restaurants';
    } else if (categoryCode === 'CE7') {
      return 'cafes';
    } else if (categoryCode === 'AT4') {
      return 'attractions';
    }
    return 'attractions';
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

  // 검색 좌표 리셋
  const resetSearchCoords = () => {
    lastSearchCoords.value = { lat: null, lng: null, type: null };
  };

  return {
    currentType,
    places,
    selectedPlace,
    isSearching,
    loadPlaces,
    getLastCategory,
    getCategoryType,
    getCategoryIcon,
    resetSearchCoords,
    hasSignificantChange
  };
}