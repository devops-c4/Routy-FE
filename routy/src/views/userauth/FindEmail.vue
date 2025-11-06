<template>
  <div class="find-email-container">
    <!-- 헤더 -->
    <Header />

    <!-- 본문 -->
    <div class="content">
      <div class="form-section">
        <h1 class="title">이메일 찾기</h1>
        <p class="subtitle">가입 시 입력한 정보로 이메일을 찾을 수 있습니다</p>

        <div class="form">
          <div class="form-group">
            <label>사용자 이름</label>
            <input type="text" placeholder="이름을 입력하세요" v-model="username"/>
          </div>

          <div class="form-group">
            <label>전화번호</label>
            <input type="text" placeholder="전화번호를 입력하세요" v-model="phone"/>
          </div>

          <button class="confirm-btn" @click="findEmail">확인</button>

          <div class="divider"></div>

          <div class="links">
            <a href="/login" class="link">로그인</a>
            <div class="link-divider"></div>
            <a href="/find-password" class="link">비밀번호 찾기</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from '@/components/Header.vue';
import axios from 'axios';

const username = ref("")
const phone = ref("")

const findEmail = async () => {
  if(username.value == "" || phone.value == ""){
    alert("사용자 이름과 전화번호를 다시 한번 확인해주십시오");
    return;
  }
  const data = new FormData()
  data.append("username",username.value);
  data.append("phone",phone.value);

  await axios.post("http://localhost:8080/user/find-email",data).then(
    (res) => {
      if(res.data == "존재하지 않는 회원입니다."){
        alert("존재하지 않는 회원입니다.");
        return;
      }
      alert(`회원님의 이메일은 ${res.data} 입니다.`);
      return;
    }
  )
}
</script>

<style scoped>
.find-email-container {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(155deg, #eff6ff 7%, white 50%, #f0fdf4 93%);
  display: flex;
  flex-direction: column;
  align-items: center;
  font-family: Inter, sans-serif;
  position: relative;
  overflow: hidden;
}

/* ✅ 헤더 고정 */
.header-bar {
  width: 100%;
  height: 60px;
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.9);
  border-bottom: 1px solid #e5e7eb;
  z-index: 10;
}

/* 메인 콘텐츠 */
.content {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 120px; /* ✅ 헤더 높이만큼 띄움 */
}

.form-section {
  width: 480px;
  text-align: center;
}

.title {
  color: #101828;
  font-size: 32px;
  font-weight: 400;
  margin-bottom: 8px;
}

.subtitle {
  color: #4a5565;
  font-size: 16px;
  margin-bottom: 24px;
}

/* 폼 스타일 */
.form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  text-align: left;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  color: #101828;
  font-size: 14px;
}

input {
  height: 48px;
  border-radius: 12px;
  border: 0.73px solid #d1d5dc;
  background: #f3f3f5;
  padding-left: 12px;
  font-size: 14px;
  color: #717182;
  outline: none;
}

input::placeholder {
  color: #717182;
}

/* 버튼 */
.confirm-btn {
  background: #155dfc;
  border: none;
  border-radius: 26px;
  color: white;
  font-size: 16px;
  font-weight: 500;
  height: 52px;
  cursor: pointer;
  transition: background 0.3s;
}

.confirm-btn:hover {
  background: #0d46c6;
}

/* 구분선 */
.divider {
  height: 1px;
  background: #e5e7eb;
}

/* 링크 */
.links {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  color: #4a5565;
  font-size: 14px;
}

.link {
  color: #4a5565;
  font-size: 14px;
  text-decoration: none; /* ✅ 밑줄 제거 */
  cursor: pointer;
  transition: color 0.2s;
}

.link-divider {
  width: 1px;
  height: 16px;
  background: #e5e7eb;
}
</style>