import axios from "axios";

let polyline = []; // ✅ 배열로 초기화
let overlays = [];

// 색상 자동 생성 (섹션별 구분)
function getColor(index) {
    const hue = (index * 47) % 360;
    return `hsl(${hue}, 80%, 55%)`;
}

// 들어온 경로들을 바탕으로 폴리라인 그리기
// 섹션별로 다른 색으로 칠해 경로가 겹쳐도 구분 가능하게 만들어보자
function drawPoliLine(map, sections) {
    // 이전 폴리라인 제거
    deletePoliLine();

    console.log('📍 섹션 개수:', sections.length);

    sections.forEach((section, sIdx) => {
        const color = getColor(sIdx);
        
        // 섹션 내부 road 순회
        section.roads.forEach((road) => {
            const path = [];
            
            // vertexes 배열을 (x, y) 쌍으로 변환
            for (let i = 0; i < road.vertexes.length; i += 2) {
                const x = road.vertexes[i];
                const y = road.vertexes[i + 1];
                path.push(new kakao.maps.LatLng(y, x));
            }

            // ✅ road마다 개별 Polyline 생성
            const line = new kakao.maps.Polyline({
                path: path,
                strokeWeight: 5,
                strokeColor: color,
                strokeOpacity: 0.6,
                strokeStyle: 'solid',
                zIndex: sIdx, // 🔽 섹션 순서대로 zIndex 설정
            });

            line.setMap(map);
            polyline.push(line); // ✅ 배열에 추가
        });

        // 섹션 중심 좌표에 오버레이
        const midRoad = section.roads[Math.floor(section.roads.length / 2)];
        const midIdx = Math.floor(midRoad.vertexes.length / 4) * 2;
        const midLatLng = new kakao.maps.LatLng(
            midRoad.vertexes[midIdx + 1],
            midRoad.vertexes[midIdx]
        );

        // 거리, 시간 표시용 오버레이
        const content = `
            <div style="padding:4px 6px; background:rgba(255,255,255,0.8); border-radius:4px; font-size:12px;">
                순서: ${sIdx}<br>
                거리: ${section.distance}m<br>
                시간: ${Math.ceil(section.duration/60)}분
            </div>
        `;
        const overlay = new kakao.maps.CustomOverlay({
            position: midLatLng,
            content,
            yAnchor: 1
        });

        overlay.setMap(map);
        overlays.push(overlay);
    });
}

// 경로를 다시 그리는 경우 또는 새로운 일정을 추가하는 경우
// 그려져 있는 경로를 삭제하고 새로운 배열 생성
export function deletePoliLine() {
    if (!polyline || polyline.length === 0) {
        console.log("🟡 현재 지도에 표시된 경로가 없습니다.");
        return;
    }

    polyline.forEach(p => p.setMap(null));
    overlays.forEach(o => o.setMap(null));

    polyline = []; // 초기화
    overlays = [];
}

// 백엔드에 경로를 그리기 위한 좌표 요청 및 그리기
export async function direction(map, coords) {
    // 배열 인지 확인해서 배열이 아니면 종료
    // 배열이어도 길이가 0이면 종료
    if (!Array.isArray(coords) || coords.length === 0) {
        alert("경로를 그리려면 최소 2개 이상의 장소가 필요합니다.");
        return; // 안전하게 함수 종료
    }

    if(coords.length < 2) {
        alert("경로를 그리려면 최소 2개 이상의 장소가 필요합니다.");
        return;
    }
    
    // 입력 받은 일정을 Input JSON 에 맞게 변경
    const locations = coords.map(c => ({
        x: c.longitude,
        y: c.latitude,
        name: c.title
    }));
    // Input JSON에 맞게 locations 분배
    const origin = locations[0];
    const destination = locations[locations.length - 1];
    const waypoints = locations.slice(1, locations.length - 1);
    // 처리한 데이터를 JSON으로 보낼 수 있게 하나의 객체로 변경
    const payload = {
            origin,
            destination,
            waypoints,
            priority: "RECOMMEND"
    };

    try {
        // 백엔드에 요청
        const response = await axios.post(
            "/api/direction/points",
            payload
        );

        console.log("경로 응답:", response.data);
        
        // 첫번째 경로를 선택
        const route = response.data.routes[0];  
        // 첫번째 경로와 해당 경로에 sections가 있는지 확인
        if(route && route.sections) {
            drawPoliLine(map, route.sections);
        } else {
            console.warn("섹션 정보가 없습니다.");
            alert("죄송합니다. 경로를 생성하지 못했습니다.")
        }

    } catch (err) {
        console.error("direction API 호출 실패:", err);
    }

}

// 현재 들어온 값들을 최적의 순서로 재배치
export async function sortDirection(map, coords) {
        // 배열 인지 확인해서 배열이 아니면 종료
    // 배열이어도 길이가 0이면 종료
    if (!Array.isArray(coords) || coords.length === 0) {
        alert("경로를 그리려면 최소 2개 이상의 장소가 필요합니다.");
        return; // 안전하게 함수 종료
    }

    if(coords.length < 2) {
        alert("경로를 그리려면 최소 2개 이상의 장소가 필요합니다.");
        return;
    }

    // 입력 받은 일정을 Input JSON 에 맞게 변경
    const locations = coords.map(c => ({
        x: c.longitude,
        y: c.latitude,
        name: c.title
    }));

    // 🔹 고정된 인덱스만 추출
    const fixPoints = coords
        .map((c, i) => (c.fixed ? i : -1))
        .filter(i => i !== -1);
    
    const payload = {
        waypoints: locations,
        fixPoints,
        priority: "RECOMMEND"
    };

    console.log("payload: ", payload);

    try {
        // 백엔드에 요청
        const response = await axios.post(
            "/api/direction/optimization",
            payload
        );

        console.log("경로응답:", response.data);

        // 최적화된 경로
        const newLocations = response.data.locations;
        
        // 첫번째 경로를 선택
        const route = response.data.route.routes[0];  
        // 첫번째 경로와 해당 경로에 sections가 있는지 확인
        if(route && route.sections) {
            drawPoliLine(map, route.sections);
        } else {
            console.warn("섹션 정보가 없습니다.");
            alert("죄송합니다. 경로를 생성하지 못했습니다.")
        }

        return newLocations;
    } catch (err) {
        console.error("자동 정렬 API 호출 실패:", err);
    }
}
