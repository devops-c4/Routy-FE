<template>
  <div class="step-container">
    <div class="step-content">
      <!-- 상단 단계 -->
      <div class="step-top">
        <div class="step-number">단계 1 / 4</div>
        <button class="cancel-btn">취소</button>
      </div>

      <!-- 진행바 -->
      <div class="progress-bar">
        <div class="progress-fill"></div>
      </div>

      <!-- 메인 카드 -->
      <div class="card">
        <div class="card-header">
          <h3 class="card-title">어디로 여행 가시나요?</h3>
          <p class="card-subtitle">여행할 지역을 선택해주세요</p>
        </div>

        <!-- 본문 -->
        <div class="card-body">
          <!-- 왼쪽: 지역 선택 -->
          <div class="left-column">
            <h4 class="section-title">지역 선택</h4>
            <div class="city-grid">
              <div
                v-for="region in regions"
                :key="region.regionId"
                class="city-card"
                :class="{ selected: selectedCity && selectedCity.regionId === region.regionId }"
                @click="selectCity(region)"
              >
                <div class="city-name">{{ region.regionName }}</div>
              </div>
            </div>
          </div>

          <!-- 오른쪽: 지도 -->
          <div class="right-column">
            <div id="map" class="map-box"></div>
          </div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="button-group">
        <button class="prev-btn" disabled>이전</button>
        <button class="next-btn" :disabled="!selectedCity" @click="goNext">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import "@/assets/css/draw.css";
import "@/assets/css/step-common.css";
import { ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import markerBigImage from "@/assets/images/icons/first-marker.png";

const router = useRouter();
const route = useRoute();

const regions = ref([]);
const selectedCity = ref(null);

let map = null;
let marker = null;

// 지도 초기화
const initMap = () => {
  const mapContainer = document.getElementById("map");
  const mapOption = {
    center: new kakao.maps.LatLng(36.5, 127.8), // 대한민국 중심
    level: 13, // 전국 단위 고정
  };

  map = new kakao.maps.Map(mapContainer, mapOption);
  
  // 확대/축소만 비활성화
  map.setZoomable(false);

  // 마커 이미지 설정 - 50x50 크기에 맞게
  const imageSrc = markerBigImage;
  const imageSize = new kakao.maps.Size(60, 60);
  const imageOption = { offset: new kakao.maps.Point(25, 50) }; // 중앙 하단 정확히
  
  console.log("마커 이미지 경로:", imageSrc);
  
  const markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);
  
  marker = new kakao.maps.Marker({
    image: markerImage
  });
  
  console.log("마커 생성 완료:", marker);
};

// DB에서 지역 불러오기
const loadRegions = async () => {
  try {
    const res = await axios.get("/api/regions");
    regions.value = res.data;
    console.log("지역 목록 불러오기 성공:", res.data);
  } catch (err) {
    console.error("지역 목록 불러오기 실패:", err);
  }
};

// 지역별 중심지 좌표 (시청/도청 기준)
const regionCoordinates = {
  '서울': { lat: 37.5665, lng: 126.9780 },      // 서울시청
  '부산': { lat: 35.1796, lng: 129.0756 },      // 부산시청
  '제주': { lat: 33.4890, lng: 126.4983 },      // 제주시청
  '제주도': { lat: 33.4890, lng: 126.4983 },    // 제주시청
  '강릉': { lat: 37.7519, lng: 128.8761 },      // 강릉시청
  '경주': { lat: 35.8562, lng: 129.2247 },      // 경주시청
  '여수': { lat: 34.7604, lng: 127.6622 },      // 여수시청
  '전주': { lat: 35.8242, lng: 127.1480 },      // 전주시청
  '속초': { lat: 38.2070, lng: 128.5918 },      // 속초시청
  '인천': { lat: 37.4563, lng: 126.7052 },      // 인천시청
  '대전': { lat: 36.3504, lng: 127.3845 },      // 대전시청
  '대구': { lat: 35.8714, lng: 128.6014 },      // 대구시청
  '광주': { lat: 35.1595, lng: 126.8526 },      // 광주시청
};

// 도시 선택 시 해당 위치로 이동 + 이미지 마커 표시 (레벨 13 유지)
const selectCity = (region) => {
  selectedCity.value = region;

  console.log("선택된 지역:", region.regionName);

  // DB에 좌표 없으면 하드코딩된 좌표 사용
  let lat = region.latitude;
  let lng = region.longitude;

  if (!lat || !lng) {
    const coords = regionCoordinates[region.regionName];
    if (coords) {
      lat = coords.lat;
      lng = coords.lng;
      console.log("하드코딩 좌표 사용:", lat, lng);
    }
  }

  if (map && kakao && lat && lng) {
    const pos = new kakao.maps.LatLng(lat, lng);
    console.log("마커 위치:", pos);

    // 지도를 해당 위치로 이동 (레벨 13 유지)
    map.panTo(pos);

    // 마커 위치 설정 및 지도에 표시
    if (marker) {
      marker.setPosition(pos);
      marker.setMap(map);
      console.log("마커 표시 완료!");
    } else {
      console.error("마커가 생성되지 않음!");
    }
  } else {
    console.error("좌표 정보 없음 - 지역명:", region.regionName);
  }
};

// 다음 단계 이동
const goNext = () => {
  router.push({
    path: "/draw/second",
    query: { 
      regionId: selectedCity.value.regionId, 
      regionName: selectedCity.value.regionName
    },
  });
};

onMounted(async () => {
  await loadRegions();
  kakao.maps.load(initMap); // SDK 비동기 로드 후 지도 초기화

  if (route.query.city) {
    const query = route.query.city;

    const split = query.split(' '); // 띄어스기로 분리해서 가장 앞에 걸로 확인
    const matched = regions.value.find((r) => query.includes(r.regionName) || r.regionName.includes(split[0]));  // '제주' 만 입력해도 제주도가 선택될 수 있게 변경
    if (matched) {
      selectCity(matched);  // 선택된 지역으로 지도가 이동되도록 만들기 위해서 함수 사용
    }
  }
});
</script>

<style scoped>
/* 공통 스타일 유지 */
.card-header {
  text-align: center;
  margin-bottom: 24px;
}
.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #0a0a0a;
}
.card-subtitle {
  color: #4a5565;
  font-size: 15px;
}
.card-body {
  margin-top: -50px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 48px;
}
.left-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.section-title {
  font-size: 15px;
  font-weight: 500;
  color: #4a5565;
}
.city-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(140px, 1fr));
  gap: 16px 24px;
  justify-content: center;
  max-width: 600px;
  margin: 0 auto;
}
.city-card {
  height: 80px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: 0.2s;
  font-size: 16px;
  font-weight: 500;
}
.city-card.selected {
  background: #eff6ff;
  border: 2px solid #155dfc;
  box-shadow: 0px 0px 0px 2px #155dfc;
}
.right-column {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}
.map-box {
  margin-top: 70px;
  width: 100%;
  height: 350px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  background: #e5f1ff;
}
@media (max-width: 900px) {
  .card-body {
    flex-direction: column;
    align-items: center;
  }
  .right-column {
    width: 100%;
  }
  .map-box {
    height: 250px;
  }
}
</style>