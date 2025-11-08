<template>
  <div class="navbar">
    <div class="nav-content">
      <!-- 왼쪽 섹션 -->
      <div class="left-section">
        <!-- 로고 -->
        <div class="logo-section">
          <img class="logo-img" src="/images/icons/logo.png" alt="logo" @click="moveToHome"/>
        </div>

        <!-- 로고 옆 텍스트 메뉴 -->
        <div class="route-section">
          <span class="route-item" @click="moveToDraw">여행 루트 그리기</span>
          <span class="route-item" @click="moveToBrowse">여행 루트 둘러보기</span>
        </div>
      </div>

      <!-- 오른쪽 메뉴 - 로그인 상태에 따라 분기 -->
      <div class="menu-section">
        <!-- 로그인 전 -->
        <template v-if="!isLoggedIn">
          <span class="menu-item" @click="moveToRegister">회원가입</span>
          <span class="menu-item" @click="moveToLogin">로그인</span>
        </template>
        
        <!-- 로그인 후 -->
        <template v-else>
          <span class="menu-item" @click="moveToMyPage">마이페이지</span>
          <span class="menu-item" @click="handleLogout">로그아웃</span>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from "vue-router";
import { logout, getLocalAuthStatus } from '@/api/auth';

const router = useRouter();
const isLoggedIn = ref(false);
const LOGIN_STATUS_KEY = 'routy:isLoggedIn';

// 로그인 상태 확인 (localStorage 기반)
const checkAuthStatus = () => {
  isLoggedIn.value = getLocalAuthStatus();
};

// CustomEvent 리스너
const handleLoginStatusChange = (event) => {
  isLoggedIn.value = event.detail.loggedIn;
};

// 컴포넌트 마운트 시 로그인 상태 확인 및 이벤트 리스너 등록
onMounted(() => {
  checkAuthStatus();
  window.addEventListener('login-status-changed', handleLoginStatusChange);
});

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  window.removeEventListener('login-status-changed', handleLoginStatusChange);
});

// 네비게이션 함수들
const moveToHome = () => router.push("/");
const moveToDraw = () => router.push('/draw/first');
const moveToBrowse = () => router.push("/browse");
const moveToRegister = () => router.push('/signup');
const moveToLogin = () => router.push('/login');
const moveToMyPage = () => router.push('/mypage');

// 로그아웃 처리
const handleLogout = async () => {
  try {
    // API 호출하여 백엔드 쿠키 삭제
    await logout();
    
    // 홈으로 이동
    router.push('/');
  } catch (error) {
    console.error('로그아웃 처리 중 오류:', error);
    // 에러가 발생해도 홈으로 이동
    router.push('/');
  }
};
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

/* 왼쪽 섹션 (로고 + 메뉴) */
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
}

/* 로고 옆 메뉴 (텍스트) */
.route-section {
  display: flex;
  align-items: center;
  gap: 24px;
}

.route-item {
  color: #4a5565;
  font-size: 16px;
  font-family: "Inter", sans-serif;
  font-weight: 400;
  line-height: 1.5;
  cursor: pointer;
  white-space: nowrap;
  transition: color 0.2s;
}

.route-item:hover {
  color: #155dfc;
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
  font-family: "Inter", sans-serif;
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