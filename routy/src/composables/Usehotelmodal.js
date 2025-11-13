import { ref } from 'vue';
import apiClient from '@/utils/axios';

export function useHotelModal() {
  const showHotelModal = ref(false);
  const hotels = ref([]);
  const hotelMapContainer = ref(null);
  let hotelMap = null;

  // 숙소 모달 열기
  const openHotelModal = async (startLocation) => {
    showHotelModal.value = true;
    
    try {
      const res = await apiClient.get(`/api/kakao/hotels`, { 
        params: { 
          lat: startLocation.lat, 
          lng: startLocation.lng 
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

  // 숙소 모달 닫기
  const closeHotelModal = () => {
    showHotelModal.value = false;
  };

  // 숙소 지도에서 포커스
  const focusHotelOnMap = (hotel) => {
    if (!hotelMap) return;
    const pos = new kakao.maps.LatLng(hotel.latitude, hotel.longitude);
    hotelMap.panTo(pos);
  };

  return {
    showHotelModal,
    hotels,
    hotelMapContainer,
    openHotelModal,
    closeHotelModal,
    focusHotelOnMap
  };
}