<template>
  <div class="navbar">
    <div class="nav-content">
      <!-- 왼쪽 섹션 -->
      <div class="left-section">
        <!-- 로고 -->
        <div class="logo-section">
          <img
            class="logo-img"
            src="@/assets/images/icons/logo.png"
            alt="logo"
            @click="moveToHome"
          />
        </div>

        <!-- 로고 옆 텍스트 메뉴 -->
        <div class="route-section">
          <span
            class="route-item"
            :class="{ active: isActive('/draw/first') }"
            @click="moveToDraw"
          >
            여행 루트 그리기
          </span>
          <span
            class="route-item"
            :class="{ active: isActive('/browse') }"
            @click="moveToBrowse"
          >
            여행 루트 둘러보기
          </span>
        </div>
      </div>

      <!-- 오른쪽 메뉴 -->
      <div class="menu-section">
        <template v-if="!isLoggedIn">
          <span class="menu-item" @click="moveToRegister">회원가입</span>
          <span class="menu-item" @click="moveToLogin">로그인</span>
        </template>

        <template v-else>
          <span class="menu-item" @click="moveToMyPage">마이페이지</span>
          <span class="menu-item" @click="showLogoutConfirm">로그아웃</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { logout, getLocalAuthStatus } from '@/api/auth'

const router = useRouter()
const route = useRoute()
const isLoggedIn = ref(false)

// 로그인 상태 체크
const checkAuthStatus = () => {
  isLoggedIn.value = getLocalAuthStatus()
}

// 현재 경로와 비교해 active 여부 반환
const isActive = (path) => {
  return route.path.startsWith(path)
}

// 이동 함수들
const moveToHome = () => router.push('/')
const moveToDraw = () => router.push('/draw/first')
const moveToBrowse = () => router.push('/browse')
const moveToRegister = () => router.push('/signup')
const moveToLogin = () => router.push('/login')
const moveToMyPage = () => router.push('/mypage')

// 로그아웃
const showLogoutConfirm = () => {
  if (confirm('로그아웃 하시겠습니까?')) {
    handleLogout()
  }
}

const handleLogout = async () => {
  try {
    await logout()
    router.push('/')
  } catch (error) {
    console.error('로그아웃 실패:', error)
    router.push('/')
  }
}
</script>

<style scoped>
.navbar {
  width: 100%;
  height: 50px;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.nav-content {
  width: 1167px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 왼쪽 섹션 */
.left-section {
  display: flex;
  align-items: center;
  gap: 32px;
}

/* 로고 */
.logo-img {
  width: 95px;
  height: 90px;
  cursor: pointer;
  transition: transform 0.25s ease, filter 0.25s ease;
}

.logo-img:hover {
  transform: scale(1.05);
  filter: brightness(1.1);
}

/* 메뉴 텍스트 */
.route-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.route-item {
  color: #4a5565;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  line-height: 1.5;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
}

.route-item:hover {
  color: #155dfc;
}

/* ✅ 현재 페이지일 때 색상 유지 */
.route-item.active {
  color: #155dfc;
  font-weight: 500;
}

/* 오른쪽 메뉴 */
.menu-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.menu-item {
  color: #4a5565;
  font-size: 16px;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  line-height: 1.5;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
}

.menu-item:hover {
  color: #155dfc;
}
</style>
