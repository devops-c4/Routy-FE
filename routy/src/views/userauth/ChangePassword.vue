<template>
  <div class="password-change-page">

    <!-- 메인 콘텐츠 -->
    <main class="main-container">
      <div class="title-section">
        <h1>비밀번호 변경</h1>
        <p>새로운 비밀번호를 입력해주세요</p>
      </div>

      <!-- 계정 이메일 -->
      <div class="email-box">
        <label>계정 이메일</label>
        <div class="email-value">example@gmail.com</div>
      </div>

      <!-- 새 비밀번호 -->
      <div class="form-group">
        <label>새 비밀번호</label>
        <div class="input-row">
          <input type="password" placeholder="새 비밀번호를 입력하세요 (8자 이상)" />
          <i class="eye-icon"></i>
        </div>
        <p class="note">영문, 숫자, 특수문자를 조합하여 8자 이상 입력해주세요</p>
      </div>

      <!-- 비밀번호 확인 -->
      <div class="form-group">
        <label>비밀번호 확인</label>
        <div class="input-row">
          <input type="password" placeholder="비밀번호를 다시 입력하세요" />
          <i class="eye-icon"></i>
        </div>
      </div>

      <button class="change-btn">비밀번호 변경</button>

      <hr class="divider" />
      <router-link to="/login" class="back-to-login">로그인</router-link>
    </main>
  </div>
</template>

<script setup>

</script>

<style scoped>
.password-change-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(148deg, #EFF6FF 0%, white 50%, #F0FDF4 100%);
  font-family: 'Inter', sans-serif;
  display: flex;
  flex-direction: column;
}

/* 헤더 */
.header {
  background: rgba(255, 255, 255, 0.8);
  height: 79px;
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
}

.header-inner {
  width: 1167px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  width: 60px;
  height: 60px;
  object-fit: cover;
}

.nav-links span {
  margin-right: 24px;
  font-size: 16px;
  color: #4A5565;
  cursor: pointer;
}

.auth-links span {
  margin-left: 16px;
  font-size: 16px;
  color: #4A5565;
  cursor: pointer;
}

/* 메인 콘텐츠 */
.main-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
}

.title-section {
  text-align: center;
}

.title-section h1 {
  font-size: 32px;
  color: #101828;
  margin-bottom: 8px;
}

.title-section p {
  color: #4A5565;
  font-size: 16px;
}

/* 이메일 정보 */
.email-box {
  width: 416px;
  padding: 16px;
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  background: #F9FAFB;
}

.email-box label {
  font-size: 14px;
  color: #4A5565;
}

.email-value {
  font-size: 16px;
  color: #101828;
  font-weight: 500;
}

/* 입력 그룹 */
.form-group {
  width: 416px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-size: 14px;
  color: #101828;
}

.input-row {
  position: relative;
}

.input-row input {
  width: 100%;
  height: 48px;
  border-radius: 12px;
  border: 1px solid #D1D5DC;
  background: #F3F3F5;
  padding: 0 48px 0 12px;
  font-size: 14px;
  color: #717182;
  outline: none;
  box-sizing: border-box; /* ✅ 추가됨 */
}

.eye-icon {
  position: absolute;
  right: 14px;
  top: 14px;
  width: 20px;
  height: 20px;
  background-image: url('../../assets/images/icons/eye.svg'); /* 👈 이미지 경로 */
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
}

.note {
  font-size: 12px;
  color: #4A5565;
}

/* 버튼 */
.change-btn {
  width: 416px;
  height: 52px;
  background-color: #155DFC;
  border: none;
  border-radius: 26px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

/* 구분선 */
.divider {
  width: 416px;
  height: 1px;
  background-color: #E5E7EB;
  border: none;
}

/* 로그인으로 돌아가기 */
.back-to-login {
  font-size: 14px;
  color: #4A5565;
  cursor: pointer;
  text-decoration: none;
}
</style>