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
            <div class="region-header">
              <h4 class="section-title">지역 선택</h4>
              <div class="search-container">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="도시명 검색"
                  class="search-input-inline"
                  @keyup.enter="handleEnter"
                  @focus="showDropdown = true"
                  @blur="hideDropdown"
                  @input="showDropdown = true"
                />


                <ul v-if="showDropdown && filteredRegions.length > 0" class="autocomplete-dropdown">
                  <li
                    v-for="region in filteredRegions"
                    :key="region.regionId"
                    @mousedown.prevent="selectCity(region); searchQuery = region.regionName; showDropdown = false;"
                  >
                    {{ region.regionName }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="city-grid">
              <div
                v-for="region in regions"
                :key="region.regionId"
                class="city-card"
                :data-region-id="region.regionId"
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
import { ref, onMounted, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import axios from "axios";
import markerBigImage from "@/assets/images/icons/first-marker.png";

const router = useRouter();
const route = useRoute();

const regions = ref([]);
const selectedCity = ref(null);
const city = ref("");

const searchQuery = ref("");
const showDropdown = ref(false);

const filteredRegions = computed(() => {
  if (!searchQuery.value.trim()) return regions.value; 
  return regions.value.filter(r =>
    r.regionName.includes(searchQuery.value.trim())
  );
});

const handleEnter = () => {
  const matched = filteredRegions.value[0];
  if (matched) {
    selectCity(matched);

    setTimeout(() => {
      const cardEl = document.querySelector(
        `.city-card[data-region-id="${matched.regionId}"]`
      );
      if (cardEl) {
        cardEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  } 
};

const hideDropdown = () => {
  // 블러 이벤트가 너무 빨라서 setTimeout으로 약간 지연시켜 닫기
  setTimeout(() => {
    showDropdown.value = false;
  }, 150);
};

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
  map.setZoomable(true);

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
  '서울': { lat: 37.5665, lng: 126.9780 },
  '부산': { lat: 35.1796, lng: 129.0756 },
  '대구': { lat: 35.8714, lng: 128.6014 },
  '인천': { lat: 37.4563, lng: 126.7052 },
  '광주': { lat: 35.1595, lng: 126.8526 },
  '대전': { lat: 36.3504, lng: 127.3845 },
  '울산': { lat: 35.5384, lng: 129.3114 },
  '세종': { lat: 36.4800, lng: 127.2890 },
  '수원': { lat: 37.2636, lng: 127.0286 },
  '춘천': { lat: 37.8813, lng: 127.7298 },
  '강릉': { lat: 37.7519, lng: 128.8760 },
  '속초': { lat: 38.2070, lng: 128.5912 },
  '청주': { lat: 36.6424, lng: 127.4890 },
  '천안': { lat: 36.8151, lng: 127.1139 },
  '전주': { lat: 35.8219, lng: 127.1480 },
  '여수': { lat: 34.7604, lng: 127.6622 },
  '순천': { lat: 34.9507, lng: 127.4872 },
  '포항': { lat: 36.0190, lng: 129.3435 },
  '경주': { lat: 35.8562, lng: 129.2247 },
  '창원': { lat: 35.2283, lng: 128.6813 },
  '통영': { lat: 34.8544, lng: 128.4331 },
  '거제': { lat: 34.8804, lng: 128.6219 },
  '고양': { lat: 37.6584, lng: 126.8320 },
  '용인': { lat: 37.2411, lng: 127.1770 },
  '남양주': { lat: 37.6350, lng: 127.2165 },
  '안양': { lat: 37.3943, lng: 126.9568 },
  '안산': { lat: 37.3219, lng: 126.8309 },
  '평택': { lat: 36.9921, lng: 127.1129 },
  '의정부': { lat: 37.7381, lng: 127.0337 },
  '파주': { lat: 37.7599, lng: 126.7800 },
  '김포': { lat: 37.6153, lng: 126.7150 },
  '광명': { lat: 37.4780, lng: 126.8644 },
  '이천': { lat: 37.2795, lng: 127.4423 },
  '양평': { lat: 37.4914, lng: 127.4874 },
  '원주': { lat: 37.3422, lng: 127.9202 },
  '동해': { lat: 37.5249, lng: 129.1140 },
  '삼척': { lat: 37.4475, lng: 129.1650 },
  '태백': { lat: 37.1641, lng: 128.9856 },
  '충주': { lat: 36.9700, lng: 127.9300 },
  '제천': { lat: 37.1324, lng: 128.1909 },
  '음성': { lat: 36.9373, lng: 127.6905 },
  '공주': { lat: 36.4460, lng: 127.1191 },
  '논산': { lat: 36.1871, lng: 127.0989 },
  '보령': { lat: 36.3333, lng: 126.6125 },
  '서산': { lat: 36.7845, lng: 126.4500 },
  '아산': { lat: 36.7890, lng: 127.0049 },
  '익산': { lat: 35.9483, lng: 126.9576 },
  '군산': { lat: 35.9677, lng: 126.7367 },
  '남원': { lat: 35.4164, lng: 127.3905 },
  '목포': { lat: 34.8118, lng: 126.3922 },
  '광양': { lat: 34.9407, lng: 127.6956 },
  '나주': { lat: 35.0158, lng: 126.7109 },
  '김천': { lat: 36.1398, lng: 128.1136 },
  '안동': { lat: 36.5684, lng: 128.7294 },
  '구미': { lat: 36.1195, lng: 128.3446 },
  '영주': { lat: 36.8057, lng: 128.6247 },
  '문경': { lat: 36.5864, lng: 128.1875 },
  '김해': { lat: 35.2280, lng: 128.8890 },
  '진주': { lat: 35.1802, lng: 128.1076 },
  '밀양': { lat: 35.5036, lng: 128.7464 },
  '사천': { lat: 35.0038, lng: 128.0647 },
  '제주': { lat: 33.4996, lng: 126.5312 },
  '서귀포': { lat: 33.2541, lng: 126.5600 },
  '홍천': { lat: 37.6881, lng: 127.8880 },
  '영월': { lat: 37.1830, lng: 128.4630 },
  '평창': { lat: 37.3704, lng: 128.3930 },
  '정선': { lat: 37.3801, lng: 128.6607 },
  '인제': { lat: 38.0697, lng: 128.1700 },
  '양양': { lat: 38.0756, lng: 128.6200 },
  '단양': { lat: 36.9846, lng: 128.3652 },
  '옥천': { lat: 36.3064, lng: 127.5712 },
  '보은': { lat: 36.4894, lng: 127.7290 },
  '계룡': { lat: 36.2744, lng: 127.2491 },
  '예산': { lat: 36.6800, lng: 126.8500 },
  '태안': { lat: 36.7524, lng: 126.2970 },
  '정읍': { lat: 35.5699, lng: 126.8566 },
  '김제': { lat: 35.8031, lng: 126.8802 },
  '무주': { lat: 35.8574, lng: 127.6626 },
  '담양': { lat: 35.3212, lng: 126.9875 },
  '곡성': { lat: 35.2822, lng: 127.2923 },
  '보성': { lat: 34.7717, lng: 127.0808 },
  '해남': { lat: 34.5716, lng: 126.5987 },
  '강진': { lat: 34.6424, lng: 126.7673 },
  '고흥': { lat: 34.6114, lng: 127.2892 },
  '영천': { lat: 35.9733, lng: 128.9389 },
  '상주': { lat: 36.4103, lng: 128.1607 },
  '영덕': { lat: 36.4153, lng: 129.3650 },
  '울진': { lat: 36.9932, lng: 129.4001 },
  '청송': { lat: 36.4350, lng: 129.0570 },
  '양산': { lat: 35.3350, lng: 129.0371 },
  '함안': { lat: 35.2727, lng: 128.4062 },
  '창녕': { lat: 35.5417, lng: 128.4955 },
  '하동': { lat: 35.0676, lng: 127.7515 },
  '남해': { lat: 34.8373, lng: 127.8924 },
  '거창': { lat: 35.6861, lng: 127.9097 },
  '합천': { lat: 35.5669, lng: 128.1656 },
  '포천': { lat: 37.8949, lng: 127.2003 },
  '하남': { lat: 37.5393, lng: 127.2147 },
  '오산': { lat: 37.1499, lng: 127.0773 },
  '구리': { lat: 37.5943, lng: 127.1296 },
  '의왕': { lat: 37.3447, lng: 126.9683 },
  '과천': { lat: 37.4269, lng: 126.9896 },
  '양주': { lat: 37.7853, lng: 127.0459 },
  '철원': { lat: 38.1461, lng: 127.3136 },
  '화천': { lat: 38.1067, lng: 127.7065 },
  '양구': { lat: 38.1066, lng: 127.9897 },
  '고성(강원)': { lat: 38.3802, lng: 128.4670 },
  '괴산': { lat: 36.8153, lng: 127.7861 },
  '진천': { lat: 36.8555, lng: 127.4373 },
  '영동': { lat: 36.1752, lng: 127.7834 },
  '금산': { lat: 36.1060, lng: 127.4886 },
  '당진': { lat: 36.8903, lng: 126.6452 },
  '홍성': { lat: 36.6015, lng: 126.6610 },
  '완주': { lat: 35.8450, lng: 127.1216 },
  '순창': { lat: 35.3747, lng: 127.1375 },
  '진안': { lat: 35.7912, lng: 127.4247 },
  '완도': { lat: 34.3110, lng: 126.7550 },
  '진도': { lat: 34.4868, lng: 126.2630 },
  '장흥': { lat: 34.6814, lng: 126.9103 },
  '함평': { lat: 35.0643, lng: 126.5168 },
  '영광': { lat: 35.2776, lng: 126.5111 },
  '장성': { lat: 35.3011, lng: 126.7848 },
  '고령': { lat: 35.7261, lng: 128.2624 },
  '성주': { lat: 35.9198, lng: 128.2836 },
  '예천': { lat: 36.6547, lng: 128.4540 },
  '봉화': { lat: 36.9430, lng: 128.7323 },
  '울릉': { lat: 37.4842, lng: 130.9050 },
  '의령': { lat: 35.3215, lng: 128.2627 },
  '산청': { lat: 35.4155, lng: 127.8733 },
  '고성(경남)': { lat: 35.0282, lng: 128.3238 },
  '함양': { lat: 35.5202, lng: 127.7258 },
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
      const markerImage = new kakao.maps.MarkerImage(
        markerBigImage,
        new kakao.maps.Size(60, 60),
        { offset: new kakao.maps.Point(25, 50) }
      );

      marker = new kakao.maps.Marker({
        position: pos,
        image: markerImage,
      });
      marker.setMap(map);
    }
  } else {
    console.error("좌표 정보 없음 - 지역명:", region.regionName);
  }
};

// 다음 단계 이동
// 다음 단계 이동
const goNext = () => {
  // 🔥 localStorage에 지역 정보 저장
  const regionInfo = {
    regionId: selectedCity.value.regionId,
    regionName: selectedCity.value.regionName,
    latitude: selectedCity.value.latitude,
    longitude: selectedCity.value.longitude
  }
  
  localStorage.setItem('selectedRegion', JSON.stringify(regionInfo))
  
  console.log('✅ 지역 정보 저장:', regionInfo)
  
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

    city.value = route.query.city;

    var geocoder = new kakao.maps.services.Geocoder();
    
    geocoder.addressSearch(city.value, function(result, status) {
        if (status === kakao.maps.services.Status.OK) {

            var coords = new kakao.maps.LatLng(result[0].y, result[0].x);

            var imageSrc = markerBigImage; 
            var imageSize = new kakao.maps.Size(60, 60); 
            var imageOption = { offset: new kakao.maps.Point(25, 50) }; 

            var markerImage = new kakao.maps.MarkerImage(imageSrc, imageSize, imageOption);

            marker = new kakao.maps.Marker({
              map: map,
              position: coords,
              image: markerImage
            });

            map.setCenter(coords);
        } 
    }); 
    
    
    const matched = regions.value.find((r) => route.query.city.includes(r.regionName));
    if (matched) {
      selectedCity.value = matched;

      setTimeout(() => {
      const cardEl = document.querySelector(
        `.city-card[data-region-id="${selectedCity.value.regionId}"]`
      );
      if (cardEl) {
        cardEl.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
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
  max-height: 400px;
  overflow-y: scroll;
  padding-right: 15px;
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
  box-shadow: inset 0 0 0 2px #155dfc;
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

.region-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  width: 300px;
}

.search-input-inline {
  flex: 1;
  max-width: 220px;
  padding: 8px 10px;
  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  font-size: 14px;
  outline: none;
  transition: 0.2s;
}

.search-input-inline:focus {
  border-color: #155dfc;
  box-shadow: 0 0 3px rgba(21, 93, 252, 0.3);
}

.search-container {
  position: relative;
  flex: 1;
}

.autocomplete-dropdown {
  position: absolute;
  top: 38px;
  left: 0;
  right: 0;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 50;
  max-height: 200px;
  overflow-y: auto;
  padding: 6px 0;
  width: 190px;
}

.autocomplete-dropdown li {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.autocomplete-dropdown li:hover {
  background: #eff6ff;
  color: #155dfc;
  font-weight: 500;
}
</style>