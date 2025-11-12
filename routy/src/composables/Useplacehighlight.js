// usePlaceHighlight.js 수정
import { ref, nextTick } from 'vue';

export function usePlaceHighlight() {
  const placeListContainer = ref(null);
  const placeCardRefs = ref({});

  // 장소 선택/강조 함수
  const highlightPlace = async (
    place, 
    map,
    currentType,
    loadPlacesFn,
    setSelectedPlace,
    getCategoryTypeFn,
    fromMarkerClick = false  // 마커 클릭 여부 파라미터 추가
  ) => {
    // 마커 클릭이 아닐 때만 지도 중심 이동
    if (!fromMarkerClick && map && place.latitude && place.longitude) {
      const position = new kakao.maps.LatLng(place.latitude, place.longitude);
      map.setCenter(position);
      if (map.getLevel() > 5) {
        map.setLevel(5);
      }
    }
    
    // 카테고리 판별 및 자동 전환
    const targetType = getCategoryTypeFn(place.categoryCode);
    
    // 현재 카테고리와 다르면 카테고리 전환
    if (currentType.value !== targetType) {
      currentType.value = targetType;
      await loadPlacesFn(targetType, place.latitude, place.longitude);
      await nextTick();
    }
    
    // 선택된 장소 설정 (이게 오른쪽 리스트의 파란색 표시를 담당)
    setSelectedPlace(place);
    
    // 오른쪽 리스트에서 해당 장소 스크롤
    scrollToPlace(place.title);
  };

  // 스크롤 로직을 별도 함수로 분리
  const scrollToPlace = (placeTitle) => {
    if (placeCardRefs.value[placeTitle] && placeListContainer.value) {
      const element = placeCardRefs.value[placeTitle];
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

  return {
    placeListContainer,
    placeCardRefs,
    highlightPlace,
    scrollToPlace
  };
}