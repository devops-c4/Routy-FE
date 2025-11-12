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
    getCategoryTypeFn
  ) => {
    // 지도 중심을 해당 장소로 이동
    if (map && place.latitude && place.longitude) {
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
    
    setSelectedPlace(place);
    
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

  return {
    placeListContainer,
    placeCardRefs,
    highlightPlace
  };
}