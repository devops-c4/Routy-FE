<template>
  <div class="login-container">
    <Header />

    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <div class="welcome-section">
        <h1>로그인</h1>
        <p>TravelPlan에 다시 오신 것을 환영합니다</p>
      </div>

      <div class="form-container">
        <!-- 이메일 -->
        <div class="form-group">
          <label>이메일</label>
          <input type="email" placeholder="example@email.com" />
        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <label>비밀번호</label>
          <input type="password" placeholder="비밀번호를 입력하세요" />
        </div>

        <!-- 로그인 유지 / 비밀번호 찾기 -->
        <div class="options-row">
          <label class="remember">
            <input type="checkbox" /> 로그인 유지
          </label>

          <div class="find-links">
            <a href="/find-email" class="forgot-email">이메일 찾기</a>
            <span class="divider">|</span>
            <a href="/find-password" class="forgot-password">비밀번호 찾기</a>
          </div>
        </div>

        <!-- 로그인 버튼 -->
        <button class="login-btn">로그인</button>

        <div class="separator">또는</div>

        <!-- 소셜 로그인 -->
        <div class="social-login">
          <button class="google-btn" @click="login('google')">
            <img src="../../assets/images/icons/google.svg" alt="Google" class="social-icon" />
            구글로 로그인
          </button>
          <button class="naver-btn" @click="login('naver')">
            <img src="../../assets/images/icons/naver.svg" alt="Naver" class="social-icon" />
            네이버로 로그인
          </button>
          <button class="kakao-btn" @click="login('kakao')">
            <img src="../../assets/images/icons/kakao.svg" alt="Kakao" class="social-icon" />
            카카오로 로그인
          </button>
        </div>

        <!-- 회원가입 링크 -->
        <div class="signup-link">
          <span>아직 계정이 없으신가요?</span>
          <a href="/signup">회원가입</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import Header from "@/components/Header.vue";
import { useRouter, useRoute } from "vue-router";

const router = useRouter()

function login(provider) {
  // 백엔드 Spring Boot가 제공하는 OAuth2 엔드포인트로 이동
  window.location.href = `http://localhost:8080/oauth2/authorization/${provider}`;
}

</script>

<style scoped>
.login-container {
  width: 1512px;
  height: 982px;
  background: linear-gradient(148deg, #eff6ff 0%, white 50%, #f0fdf4 100%);
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

/* 메인 콘텐츠 중앙 정렬 */
.main-content {
  width: 480px;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%); /* 완전 중앙 정렬 */
  display: flex;
  flex-direction: column;
  gap: 32px;
  align-items: center; /* 가로 중앙 */
}

/* 텍스트 가운데 정렬 */
.welcome-section {
  text-align: center;
}
.welcome-section h1 {
  font-size: 32px;
  color: #101828;
  font-weight: 400;
}
.welcome-section p {
  font-size: 16px;
  color: #4a5565;
}

/* 폼 */
.form-container {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 32px;
  background: white;
  border-radius: 24px;
}
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.form-group label {
  font-size: 14px;
  color: #101828;
}
.form-group input {
  height: 48px;
  padding: 8px 12px;
  font-size: 14px;
  border-radius: 12px;
  border: 0.73px solid #d1d5dc;
  background: #f3f3f5;
  outline: none;
  color: #717182;
}

/* 옵션 */
.options-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  width: 100%;
}
.remember {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #4a5565;
}
.forgot-password {
  color: #155dfc;
  text-decoration: none;
}

/* 버튼 */
.login-btn {
  padding: 13px 186px;
  background: #155dfc;
  color: white;
  border-radius: 26px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
}

/* 구분선 */
.separator {
  text-align: center;
  color: #4a5565;
  font-size: 14px;
}

/* 소셜 로그인 */
.social-login {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.social-login button {
  position: relative;
  height: 48px;
  border-radius: 12px;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
}

.social-icon {
  width: 20px;  /* 원하는 크기로 조절 */
  height: 20px;
  margin-right: 10px;
}

.google-btn {
  background: white;
  color: #101828;
  border: 0.73px solid #d1d5dc;
}
.naver-btn {
  background: #03c75a;
  color: white;
}
.kakao-btn {
  background: #fee500;
  color: black;
}

/* 회원가입 링크 */
.signup-link {
  display: flex;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  color: #4a5565;
}
.signup-link a {
  color: #155dfc;
  text-decoration: none;
}

.find-links {
  display: flex;
  align-items: center;
  gap: 8px; /* 이메일/비밀번호 사이 여백 */
  color: #155dfc;
  font-size: 14px;
}

.find-links a {
  color: #155dfc;
  text-decoration: none;
}

.divider {
  color: #d1d5dc; /* 구분선 색상 (회색) */
}
</style>