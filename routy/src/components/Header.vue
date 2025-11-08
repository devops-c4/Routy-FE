<template>
  <div class="navbar">
    <div class="nav-content">
      <!-- 왼쪽 섹션 -->
      <div class="left-section">
        <!-- 로고 -->
        <div class="logo-section">
          <router-link to="/" class="logo-link">
          <img class="logo-img" src="/images/icons/logo.png" alt="logo" />
          </router-link>
        </div>

        <!-- 로고 옆 텍스트 메뉴 -->
        <div class="route-section">
          <span class="route-item" @click="moveToDraw">여행 루트 그리기</span>
          <span class="route-item" @click="moveToBrowse">여행 루트 둘러보기</span>
          <span class="route-item" @click="moveToChatBot">🤖</span>
        </div>
      </div>

      <!-- 오른쪽 메뉴 -->
      <div class="menu-section">
        <span class="menu-item" @click="moveToRegister">회원가입</span>
        <span class="menu-item" @click="moveToLogin">로그인</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from "vue-router";

const router = useRouter()

const moveToHome = () => router.push("/");
const moveToDraw = () => router.push('/draw/first');
const moveToBrowse = () => router.push("/browse");
const moveToRegister = () => router.push('/signup');
const moveToLogin = () => router.push('/login');
const moveToChatBot = () => router.push('/chatbot');
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
  width: 80px;
  height: 80px;
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