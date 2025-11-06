<script setup>
import { ref, computed } from 'vue'

import { useRouter } from 'vue-router'

const router = useRouter()
function goToTravelDetail(scheduleId) {
  router.push(`/mypage/travel/${scheduleId}`)
}

/* ===================== 프로필 ===================== */
const profile = ref({
  avatarText: '여',
  nickname: '여행러버',
  bio: '여행을 사랑하는 사람',
  reviewCount: 24,
  likesCount: 156,
  bookmarkCount: 8,
})

/* 여행 기록(썸네일 3개) – 개수로 "여행 횟수" 계산 */
const travelRecords = ref([
  { id: 1, title: '설렘 호수길', desc: '가을 감성 드라이브' },
  { id: 2, title: '하늘 계단',  desc: '일몰이 미쳤다' },
  { id: 3, title: '파도 춤추는 곳', desc: '조용한 서핑 포인트' },
])
const tripCount = computed(() => travelRecords.value.length)

/* ===================== 내 일정 ===================== */
const mySchedules = ref([
  {
    id: 1, title: '부산 미식 투어',  color: 'red',   theme: '미식',
    region: '부산', 
    startDate: '2024-11-20', endDate: '2024-11-22', duration: '2박 3일',
  },
  {
    id: 2, title: '제주도 힐링 여행', color: 'blue',  theme: '힐링',
    region: '제주도',
    startDate: '2024-12-15', endDate: '2024-12-18', duration: '3박 4일',
  },
  {
    id: 3, title: '강릉 겨울 바다',  color: 'green', theme: '힐링',
    region: '강릉', 
    startDate: '2024-12-25', endDate: '2024-12-26', duration: '1박 2일',
  },
])

/* ===================== 북마크 더미 데이터 ===================== */
const bookmarks = ref([
  { id:1, title:'속초 맛집 리스트', type:'맛집',   count:12 },
  { id:2, title:'제주 숨은 명소',   type:'여행지', count:8  },
  { id:3, title:'서울 카페 투어',   type:'카페',   count:15 },
  { id:4, title:'경주 역사 탐방',   type:'여행지', count:6  },
])

/* ===================== 유틸/계산 ===================== */
function dday(dateStr) {
  const today = new Date(); today.setHours(0,0,0,0)
  const target = new Date(dateStr); target.setHours(0,0,0,0)
  const diff = Math.ceil((target - today) / (1000*60*60*24))
  if (diff > 7)  return { text: '준비', cls: 'plan' }
  if (diff > 0)  return { text: `D-${diff}`, cls: 'warn' }
  if (diff === 0) return { text: '오늘', cls: 'ok' }
  return { text: '완료', cls: 'done' }  // 완료는 중립 톤
}

const viewSchedules = computed(() =>
  mySchedules.value.map(s => {
    const { text, cls } = dday(s.startDate)
    return { ...s, stateText: text, stateClass: cls }
  })
)

const upcomingCount = computed(() => {
  const today = new Date(); today.setHours(0,0,0,0)
  return mySchedules.value.filter(s => {
    const start = new Date(s.startDate); start.setHours(0,0,0,0)
    return start >= today
  }).length
})

/* ===================== 달력 ===================== */
const year  = ref(2024)
const month = ref(11) // 12월(0-index)

const pad2   = n => String(n).padStart(2, '0')
const ymd    = (y,m,d) => `${y}-${pad2(m+1)}-${pad2(d)}`
const daysIn = (y,m) => new Date(y, m+1, 0).getDate()
const startDow = (y,m) => new Date(y, m, 1).getDay()

const blanks = computed(() => Array.from({ length: startDow(year.value, month.value) }, (_, i) => i))
const days   = computed(() => Array.from({ length: daysIn(year.value, month.value) }, (_, i) => i+1))
const monthLabel = computed(() => `${year.value}년 ${month.value+1}월`)

function prevMonth(){ month.value === 0  ? (year.value--, month.value = 11) : month.value-- }
function nextMonth(){ month.value === 11 ? (year.value++, month.value = 0 ) : month.value++ }

/* 날짜별 색상 맵 */
const dateColorMap = computed(() => {
  const map = {}
  for (const s of mySchedules.value) {
    const start = new Date(s.startDate)
    const end   = new Date(s.endDate)
    start.setHours(0,0,0,0); end.setHours(0,0,0,0)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const key = `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`
      map[key] = s.color
    }
  }
  return map
})

function formatDateRange(start, end) {
  const s = new Date(start), e = new Date(end)
  return `${s.getFullYear()}.${pad2(s.getMonth()+1)}.${pad2(s.getDate())} - ${pad2(e.getMonth()+1)}.${pad2(e.getDate())}`
}
</script>

<template>
  <!-- 전역 헤더 -->
  <Header />

  <!-- 페이지 래퍼 -->
  <div class="page-wrap">
    <!-- 프로필 바(가로 전체) -->
    <section class="card profile-card">
      <div class="avatar">{{ profile.avatarText }}</div>

      <div class="pinfo">
        <div class="nickname">{{ profile.nickname }}</div>
        <div class="bio">{{ profile.bio }}</div>

        <div class="stats">
          <div class="stat">
            <span class="label">여행 횟수</span>
            <a class="value linkish">{{ tripCount }}회</a>
          </div>
          <div class="stat">
            <span class="label">작성 리뷰</span>
            <a class="value linkish">{{ profile.reviewCount }}개</a>
          </div>
          <div class="stat">
            <span class="label">좋아요 받은 수</span>
            <a class="value linkish">{{ profile.likesCount }}개</a>
          </div>
          <div class="stat">
            <span class="label">북마크 한 일정 수</span>
            <a class="value linkish">{{ profile.bookmarkCount }}개</a>
          </div>
        </div>
      </div>

      <button class="btn ghost edit" type="button">정보 수정</button>
    </section>

    <!-- 2열: 달력 + 내 일정 -->
    <section class="grid-2">
      <!-- 달력 카드 -->
      <article class="card calendar">
        <header class="card__title">여행 달력</header>

        <div class="calendar__head">
          <button class="btn mini" type="button" @click="prevMonth" aria-label="이전 달">◀</button>
          <strong>{{ monthLabel }}</strong>
          <button class="btn mini" type="button" @click="nextMonth" aria-label="다음 달">▶</button>
        </div>

        <div class="calendar__grid">
          <span class="dow">S</span><span class="dow">M</span><span class="dow">T</span>
          <span class="dow">W</span><span class="dow">T</span><span class="dow">F</span><span class="dow">S</span>

          <span v-for="i in blanks" :key="'b'+i"></span>

          <span
            v-for="d in days"
            :key="d"
            class="day"
            :class="dateColorMap[ymd(year, month, d)] ? ['event', dateColorMap[ymd(year, month, d)]] : ''"
          >
            {{ d }}
          </span>
        </div>

        <!-- 다가오는 여행 (건수는 실제 '다가오는'만) -->
        <div class="upcoming">
          <div class="upcoming__head">
            <span class="upcoming__ttl">다가오는 여행</span>
            <span class="badge pill-count">{{ upcomingCount }}건</span>
          </div>
          <ul class="legend">
            <li><i class="dot red"></i> 부산 미식 투어</li>
            <li><i class="dot blue"></i> 제주도 힐링 여행</li>
            <li><i class="dot green"></i> 강릉 겨울 바다</li>
          </ul>
        </div>
      </article>

      <!-- 내 일정 카드 -->
      <article class="card schedule">
        <header class="card__title">내 일정</header>

        <ul class="todo">
            <li
              v-for="s in viewSchedules"
              :key="s.id"
              class="todo__item"
              :data-color="s.color"
              @click="goToTravelDetail(s.id)"
            >
            <div class="left">
              <div class="pill" :class="s.color">
                <span v-if="s.theme==='힐링'">🌴</span>
                <span v-else-if="s.theme==='미식'">🍽️</span>
                <span v-else-if="s.theme==='액티비티'">⛰️</span>
                <span v-else>🏛️</span>
                {{ s.theme }}
              </div>

              <div class="tt">{{ s.title }}</div>

              <div class="meta-row">
                <div class="meta"><i>📍</i>{{ s.region }}</div>
                <div class="meta">
                  {{ s.transportation }}
                </div>
                <div class="meta"><i>🗓️</i>{{ formatDateRange(s.startDate, s.endDate) }}</div>
              </div>
            </div>

            <div class="right">
              <span class="state" :class="s.stateClass">{{ s.stateText }}</span>
            </div>
          </li>
        </ul>
      </article>
    </section>

    <!-- 여행 기록 (3열) -->
    <section class="card block">
      <header class="block__title">여행 기록</header>
      <div class="thumb-row">
        <div v-for="r in travelRecords" :key="r.id" class="thumb bluegrad">
          <span class="pin">📍</span>
          <b>{{ r.title }}</b>
          <small>{{ r.desc }}</small>
        </div>
      </div>
      <div class="block__footer">
        <button class="btn mini" type="button">더 보기</button>
      </div>
    </section>

    <!-- 북마크 -->
    <section class="card bookmarks section">
      <header class="block__title">북마크</header>

      <div class="bm-grid">
        <div class="bm-card" v-for="b in bookmarks" :key="b.id">
          <div class="bm-icon">🔖</div>
          <span class="bm-count">{{ b.count }}</span>
          <div class="bm-title">{{ b.title }}</div>
          <div class="bm-type">{{ b.type }}</div>
        </div>
      </div>

      <div class="block__footer">
        <button class="btn mini" type="button">더 보기 ({{ Math.max(0, bookmarks.length-4) }}개 남음)</button>
      </div>
    </section>
  </div>
</template>

<style>
/* ===== 전역 변수 & 섹션 간 여백(큰 박스 간 40px) ===== */
:root{
  --gap-section: 40px;  /* 섹션(큰 박스) 간격 */
  --main-gap: 32px;     /* 2열 내부 간격(달력 ↔ 내 일정) */
  --gap-card: 24px;     /* 카드들 사이 간격(내 일정/북마크/여행 기록) */
}
.page-wrap > section + section{
  margin-top: var(--gap-section);
}
</style>

<style scoped>
/* 래퍼: 중앙 정렬 & 패딩 */
.page-wrap{
  max-width:1120px;
  margin:24px auto 80px;
  padding:0 16px;
}

/* 카드 공통 */
.card{
  width:100%;
  background:#fff;
  border:1px solid #E5E7EB;
  border-radius:16px;
  box-shadow:0 10px 30px rgba(16,24,40,.08);
  overflow:hidden;
  box-sizing:border-box;
}
.card__title{ padding:16px 16px 0; font-weight:600; }

/* 프로필 바 */
.profile-card{
  display:flex; align-items:center; gap:16px; padding:16px;
  background:linear-gradient(90deg,#ffffff 30%,#f7fbff 100%);
}
.avatar{
  width:64px; height:64px; border-radius:50%;
  display:grid; place-items:center; color:#fff;
  font-weight:700; font-size:24px; background:#3B82F6;
}
.pinfo{ display:flex; flex-direction:column; gap:6px; }
.nickname{ font-size:18px; font-weight:700; }
.bio{ color:#667085; font-size:13px; }
.stats{ display:flex; gap:24px; margin-top:4px; }
.stat{ display:flex; gap:8px; align-items:center; font-size:14px; }
.stat .label{ color:#667085; }
.linkish{ color:#2563eb; cursor:pointer; text-decoration:none; }
.edit{ margin-left:auto; }

/* 2열 그리드 */
.grid-2{
  display:grid;
  grid-template-columns: 1.15fr 1fr;
  gap: var(--main-gap);        /* ← 2열 내부 간격 32px */
  align-items:stretch;
  grid-auto-rows: 1fr;
}

.calendar, .schedule{
  min-height: 420px;
  display:flex;
  flex-direction:column;
  width:100%;
  max-width:100%;
}

/* 달력 */
.calendar{ padding:12px 16px 16px; }
.calendar__head{ display:flex; align-items:center; gap:8px; justify-content:center; margin:10px 0; }
.calendar__grid{ display:grid; grid-template-columns:repeat(7,1fr); gap:6px; padding:8px 0; }
.dow{ color:#667085; font-size:12px; text-align:center; }
.day{
  height:34px; border-radius:10px; display:grid; place-items:center;
  background:#F8FAFC; border:1px solid transparent;
}
.day.event.blue  { background:rgba(59,130,246,.16);  border-color:rgba(59,130,246,.35); }
.day.event.red   { background:rgba(239,68,68,.16);    border-color:rgba(239,68,68,.35); }
.day.event.green { background:rgba(16,185,129,.16);   border-color:rgba(16,185,129,.35); }

/* 달력 하단 – 간단 목록 */
.upcoming{ margin-top:14px; padding-top:8px; border-top:1px solid #E5E7EB; }
.upcoming__head{ display:flex; justify-content:space-between; align-items:center; }
.upcoming__ttl{ color:#667085; font-size:14px; }
.legend{
  list-style:none; padding:8px 0 0; margin:0;
  display:flex; flex-direction:column; gap:6px; color:#475569; font-size:14px;
}
.legend .dot{ width:8px; height:8px; border-radius:50%; display:inline-block; margin-right:8px; position:relative; top:-1px; }
.legend .dot.red{ background:#EF4444; } .legend .dot.blue{ background:#3B82F6; } .legend .dot.green{ background:#10B981; }
.pill-count{
  border:1px solid #dbeafe; background:#eef6ff; color:#2563eb;
  padding:2px 8px; border-radius:999px; font-size:12px;
}

/* 내 일정 */
.schedule{ padding:12px 16px 18px; }
.todo{
  list-style:none; padding:8px 4px 8px; margin:0;
  display:flex; flex-direction:column;
  gap: var(--gap-card);          /* ← 카드 간격 24px (중복 gap 제거) */
}
.todo__item{
  display:flex; justify-content:space-between; align-items:flex-start; gap:12px;
  padding:14px; border:1px solid #E5E7EB; border-radius:14px;
  background:linear-gradient(90deg, #eef7ff 0%, #ffffff 100%);
}
.todo__item[data-color="red"]   { background:linear-gradient(90deg, rgba(255,240,240,.9) 0%, #ffffff 100%); }
.todo__item[data-color="green"] { background:linear-gradient(90deg, rgba(237,249,245,.9) 0%, #ffffff 100%); }
.todo__item { cursor: pointer; transition: transform 0.15s ease; }
.todo__item:hover { transform: translateY(-2px); }

.left{ display:flex; flex-direction:column; gap:8px; }
.tt{ font-weight:700; font-size:16px; }
.meta-row{ display:flex; flex-wrap:wrap; gap:14px; color:#475569; font-size:13px; }
.meta i{ margin-right:4px; }

/* 테마 배지 */
.pill{
  display:inline-flex; gap:6px; align-items:center;
  padding:6px 10px; border-radius:999px; font-size:12px; font-weight:700; color:#fff; width:max-content;
}
.pill.blue{ background:#3B82F6; } .pill.red{ background:#EF4444; } .pill.green{ background:#10B981; }

/* 상태 */
.right{ display:flex; align-items:center; }
.state{ padding:6px 10px; border-radius:999px; font-size:12px; font-weight:700; }
.state.ok{   background:#E0F2FE; color:#0369A1; } /* 오늘 */
.state.warn{ background:#FEF3C7; color:#B45309; } /* D-n */
.state.plan{ background:#E4E7EC; color:#344054; } /* 준비 */
.state.done{ background:#F1F5F9; color:#475569; } /* 완료 */

/* 여행 기록 */
.block{ padding:12px 12px 14px; }
.block__title{ padding:4px 4px 8px 6px; font-weight:700; }
.thumb-row{
  display:grid; grid-template-columns:repeat(3,1fr);
  gap: var(--gap-card);           /* ← 썸네일 간격 24px */
}
.thumb{
  height:140px; border-radius:14px; padding:14px; color:#fff;
  display:flex; flex-direction:column; justify-content:flex-end; gap:2px;
  box-shadow:inset 0 0 1px rgba(255,255,255,.25); position:relative;
}
.bluegrad{ background:linear-gradient(180deg, #60A5FA 0%, #3B82F6 100%); }
.pin{ font-size:18px; opacity:.9; position:absolute; left:12px; top:10px; }
.thumb b{ font-weight:700; } .thumb small{ opacity:.95; }

/* 버튼 */
.btn{ border:1px solid #E5E7EB; background:#fff; padding:8px 12px; border-radius:10px; cursor:pointer; }
.btn.mini{ padding:6px 10px; font-size:12px; }
.btn.ghost{ background:#F8FAFC; }

/* 북마크 */
.bookmarks{ padding:16px; }
.bm-grid{
  display:grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--gap-card);           /* ← 카드 간격 24px */
}
.bm-card{
  position:relative;
  border:1px solid #E6EEF9;
  border-radius:14px;
  padding:16px;
  background: linear-gradient(180deg,#F8FBFF 0%, #E7F1FF 100%);
  box-shadow: 0 6px 18px rgba(16,24,40,.06);
}
.bm-icon{ font-size:18px; line-height:1; margin-bottom:8px; }
.bm-count{
  position:absolute; top:10px; right:10px;
  font-size:12px; padding:2px 8px; border-radius:999px;
  background:#EAF2FF; color:#155DFC;
}
.bm-title{ font-weight:700; color:#0F172A; margin:4px 0 4px; }
.bm-type{ font-size:12px; color:#6B7280; }

/* 반응형 레이아웃 */
@media (max-width: 900px){
  .grid-2{ grid-template-columns:1fr; }
  .thumb-row{ grid-template-columns:repeat(2,1fr); }
  .bm-grid{   grid-template-columns:repeat(2,1fr); }
}
@media (max-width: 600px){
  .calendar, .schedule{ min-height: 360px; }
  .thumb-row, .bm-grid{ grid-template-columns:1fr; }
}
</style>

