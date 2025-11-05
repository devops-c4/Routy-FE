<template>
  <div
    style="width: 100%; min-height: 100vh; padding: 2rem 10%; background: linear-gradient(135deg, #EFF6FF 0%, white 50%, #F0FDF4 100%); display: flex; flex-direction: column; align-items: center;"
  >
    <!-- 상단 단계 표시 -->
    <div style="width: 100%; max-width: 900px; display: flex; flex-direction: column; gap: 0.5rem;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="color: #4A5565; font-size: 1rem;">단계 1 / 4</span>
        <button style="border: none; background: none; font-size: 0.9rem; cursor: pointer; color: #0A0A0A;">취소</button>
      </div>
      <div style="width: 100%; height: 8px; background: #E5E7EB; border-radius: 10px; overflow: hidden;">
        <div style="width: 25%; height: 8px; background: linear-gradient(90deg, #155DFC 0%, #00A63E 100%);"></div>
      </div>
    </div>

    <!-- 메인 카드 -->
    <div
      style="width: 100%; max-width: 900px; margin-top: 2rem; background: white; border-radius: 14px; border: 1px solid rgba(0, 0, 0, 0.1); padding: 2rem; display: flex; flex-direction: column; gap: 2rem;"
    >
      <div style="text-align: center;">
        <h3 style="color: #0A0A0A; font-size: 1.25rem; margin-bottom: 0.25rem;">어디로 여행 가시나요?</h3>
        <p style="color: #4A5565; font-size: 1rem;">여행할 지역을 선택해주세요</p>
      </div>

      <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
        <!-- 지역 선택 -->
        <div style="flex: 1; min-width: 300px;">
          <h4 style="font-size: 1rem; color: #0A0A0A; margin-bottom: 0.75rem;">지역 선택</h4>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.75rem;">
            <button
              v-for="(city, i) in cities"
              :key="i"
              style="padding: 1rem; border-radius: 12px; border: 1px solid rgba(0, 0, 0, 0.1); background: white; cursor: pointer;"
            >
              {{ city }}
            </button>
          </div>
        </div>

        <!-- 지도 -->
        <div style="flex: 1; min-width: 300px;">
          <h4 style="font-size: 1rem; color: #0A0A0A; margin-bottom: 0.75rem;">지도에서 확인</h4>
          <div
            style="width: 100%; aspect-ratio: 1 / 1; background: linear-gradient(135deg, #EFF6FF 0%, #F0FDF4 100%); border-radius: 14px; border: 1px solid rgba(0, 0, 0, 0.1); position: relative; overflow: hidden;"
          >
            <div
              v-for="(marker, i) in markers"
              :key="i"
              :style="{
                width: '12px',
                height: '12px',
                background: '#60A5FA',
                borderRadius: '50%',
                position: 'absolute',
                left: marker.x + '%',
                top: marker.y + '%'
              }"
            ></div>
            <div
              v-for="(marker, i) in markers"
              :key="'label-' + i"
              :style="{
                position: 'absolute',
                left: marker.x + '%',
                top: marker.y - 3 + '%',
                color: '#4A5565',
                fontSize: '0.8rem',
                transform: 'translateX(-50%)'
              }"
            >
              {{ marker.name }}
            </div>
          </div>
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div style="display: flex; justify-content: space-between; margin-top: 1.5rem;">
        <button style="padding: 0.5rem 1.5rem; border-radius: 8px; border: 1px solid rgba(0,0,0,0.1); background: white; opacity: 0.6;">이전</button>
        <button style="padding: 0.5rem 1.5rem; border-radius: 8px; background: #155DFC; color: white; opacity: 0.6;">다음</button>
      </div>
    </div>
  </div>
</template>

<script setup>
const cities = [
  "서울", "부산", "제주도",
  "강릉", "경주", "여수",
  "전주", "속초", "대구",
  "인천", "대전", "광주",
];

// 지도 점 좌표를 퍼센트로 (반응형)
const markers = [
  { name: "서울", x: 50, y: 20 },
  { name: "인천", x: 45, y: 25 },
  { name: "대전", x: 50, y: 40 },
  { name: "대구", x: 55, y: 55 },
  { name: "부산", x: 60, y: 65 },
  { name: "광주", x: 45, y: 60 },
  { name: "전주", x: 47, y: 50 },
  { name: "강릉", x: 60, y: 25 },
  { name: "속초", x: 62, y: 20 },
  { name: "경주", x: 58, y: 58 },
  { name: "여수", x: 50, y: 70 },
  { name: "제주도", x: 45, y: 80 },
];
</script>
