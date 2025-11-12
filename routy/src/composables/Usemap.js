import { ref } from 'vue';

export function useMap() {
  const mapContainer = ref(null);
  let map = null;
  let mapInitialized = false;
  let mapIdleTimeout = null;

  // 지도 초기화
  const initMap = (location, onMapIdle) => {
    console.log("지도 초기화 시작:", location);
    
    if (!window.kakao || !window.kakao.maps) {
      console.error("Kakao Maps API가 로드되지 않았습니다!");
      return;
    }
    
    window.kakao.maps.load(() => {
      const center = new kakao.maps.LatLng(location.lat, location.lng);
      map = new kakao.maps.Map(mapContainer.value, { 
        center, 
        level: 5 // 높을수록 멀리서 보임
      });
      
      mapInitialized = true;
      console.log(`지도 초기화 완료: ${location.name} (${location.lat}, ${location.lng})`);
      
      // 지도 이동 이벤트 (디바운싱 적용)
      kakao.maps.event.addListener(map, "idle", () => {
        if (mapIdleTimeout) {
          clearTimeout(mapIdleTimeout);
        }
        
        mapIdleTimeout = setTimeout(async () => {
          const center = map.getCenter();
          const lat = center.getLat();
          const lng = center.getLng();
          
          if (onMapIdle) {
            await onMapIdle(lat, lng);
          }
        }, 800);
      });
    });
  };

  // 지도 중심 이동
  const setMapCenter = (latitude, longitude, zoomLevel = null) => {
    if (map && latitude && longitude) {
      const position = new kakao.maps.LatLng(latitude, longitude);
      map.setCenter(position);
      
      if (zoomLevel && map.getLevel() > zoomLevel) {
        map.setLevel(zoomLevel);
      }
    }
  };

  // 지도 객체 반환
  const getMap = () => map;

  // 지도 초기화 여부
  const isMapInitialized = () => mapInitialized;

  return {
    mapContainer,
    initMap,
    setMapCenter,
    getMap,
    isMapInitialized
  };
}