import { ref, computed } from 'vue';
import axios from 'axios';

export function useDayControl(planId, totalDays) {
  const durations = ref([]);
  const selectedDay = ref(1);
  const placesByDay = ref({});
  const completedDays = ref(new Set());

  const selectedPlaces = computed(() => placesByDay.value[selectedDay.value] || []);
  const isDayCompleted = computed(() => completedDays.value.has(selectedDay.value));

  // Duration 불러오기
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
      console.error("Duration 로드 실패:", err);
    }
  };

  // 일차 이동
  const goPrevDay = () => {
    if (selectedDay.value > 1) {
      selectedDay.value--;
      return true;
    }
    return false;
  };

  const goNextDay = () => {
    if (selectedDay.value < durations.value.length) {
      selectedDay.value++;
      return true;
    }
    return false;
  };

  const selectDay = (day) => {
    selectedDay.value = day;
  };

  // 장소 추가
  const addPlace = (place, day = null) => {
    const targetDay = day || selectedDay.value;
    if (!placesByDay.value[targetDay]) placesByDay.value[targetDay] = [];
    
    if (!placesByDay.value[targetDay].find((x) => x.title === place.title)) {
      placesByDay.value[targetDay].push({ 
        ...place, 
        dayNumber: targetDay,
        startTime: place.startTime || '',
        endTime: place.endTime || ''
      });
      console.log(`${place.title} 추가`);
      return true;
    }
    return false;
  };

  // 장소 제거
  const removePlace = (place, day = null) => {
    const targetDay = day || selectedDay.value;
    if (placesByDay.value[targetDay]) {
      placesByDay.value[targetDay] = placesByDay.value[targetDay].filter((x) => x.title !== place.title);
      console.log(`${place.title} 제거`);
      return true;
    }
    return false;
  };

  // 고정 토글
  const toggleFix = (place) => {
    place.fixed = !place.fixed;
  };

  // 일정 종료
  const endDaySchedule = () => {
    const day = selectedDay.value;
    if (completedDays.value.has(day)) {
      alert("이미 종료된 일정입니다.");
      return false;
    }
    
    if (confirm(`${day}일차 일정을 종료하시겠습니까?\n종료 후에는 수정할 수 없습니다.`)) {
      completedDays.value.add(day);
      alert(`${day}일차 일정이 종료되었습니다.`);
      return true;
    }
    return false;
  };

  // 시간 업데이트
  const updatePlaceTime = (place) => {
    console.log(`${place.title} 시간 업데이트:`, {
      startTime: place.startTime,
      endTime: place.endTime
    });
    
    if (place.startTime && place.endTime) {
      if (place.endTime <= place.startTime) {
        alert('종료 시간은 시작 시간보다 늦어야 합니다.');
        place.endTime = '';
        return false;
      }
    }
    return true;
  };

  // 전체 일정 저장
  const saveAllDaysPlaces = async () => {
    try {
      for (const duration of durations.value) {
        const dayPlaces = placesByDay.value[duration.day] || [];
        if (!dayPlaces.length) continue;
        
        // 시간 유효성 검증
        for (const place of dayPlaces) {
          if (place.startTime && place.endTime) {
            if (place.endTime <= place.startTime) {
              alert(`${place.title}의 종료 시간이 시작 시간보다 이릅니다. 시간을 확인해주세요.`);
              return false;
            }
          }
        }
        
        const mappedPlaces = dayPlaces.map((p, i) => ({
          durationId: duration.durationId,
          planId,
          travelOrder: i + 1,
          estimatedTravelTime: p.estimatedTravelTime || 0,
          placeName: p.title,
          startTime: p.startTime || null,
          endTime: p.endTime || null,
          latitude: p.latitude,
          longitude: p.longitude,
          categoryCode: p.categoryCode,
          categoryGroupName: p.categoryGroupName,
          addressName: p.addressName,
          placeUrl: p.placeUrl,
          description: p.description || '',
          imagePath: p.imagePath || null,
          runTime: p.runTime || null,
        }));
        
        console.log(`${duration.day}일차 전송 데이터:`, mappedPlaces);
        await axios.post("/api/places/batch", mappedPlaces);
      }
      alert("전체 일정 저장 완료!");
      return true;
    } catch (err) {
      console.error("저장 실패:", err);
      console.error("에러 상세:", err.response?.data);
      return false;
    }
  };

  return {
    durations,
    selectedDay,
    placesByDay,
    completedDays,
    selectedPlaces,
    isDayCompleted,
    loadDurations,
    goPrevDay,
    goNextDay,
    selectDay,
    addPlace,
    removePlace,
    toggleFix,
    endDaySchedule,
    updatePlaceTime,
    saveAllDaysPlaces
  };
}