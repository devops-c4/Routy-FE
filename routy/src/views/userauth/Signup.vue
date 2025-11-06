<template>
  <div class="signup-container">
    <!-- 메인 콘텐츠 -->
    <div class="main-content">
      <div class="welcome-section">
        <h1>환영합니다</h1>
        <p>여행의 시작, TravelPlan과 함께하세요</p>
      </div>

      <!-- 폼 -->
      <div class="form-container">
        <!-- 이름 -->
        <div class="form-group">
          <label>사용자 이름 *</label>
          <input type="text" placeholder="이름을 입력하세요" v-model="username"/>
        </div>

        <!-- 이메일 -->
        <div class="form-group">
          <label>이메일 *</label>
          <div class="email-row">
            <input type="email" placeholder="example@email.com" v-model="email"/>
            <button class="verify-btn" @click="validationNum">인증번호</button>
          </div>
        </div>

        <!-- 인증번호 -->
        <div class="form-group">
          <label>인증번호</label>
          <div class="verify-row">
            <input type="text" placeholder="인증번호 6자리" v-model="varifyNum"/>
            <button class="resend-btn" @click="validationNum">재전송</button>
          </div>
          <small>이메일로 전송된 인증번호를 입력해주세요</small>
        </div>

        <!-- 성별 -->
        <div class="form-group">
            <label>성별</label>
            <select class="select-box" v-model="gender">
                <option value="" disabled selected>선택하세요</option>
                <option value="남">남성</option>
                <option value="여">여성</option>
            </select>
        </div>

        <!-- 나이 -->
        <div class="form-group">
          <label>나이</label>
          <input type="number" placeholder="나이" v-model="age"/>
        </div>

        <!-- 전화번호 -->
        <div class="form-group">
          <label>전화번호</label>
          <input type="text" placeholder="전화번호" v-model="phone"/>
        </div>

        <!-- 비밀번호 -->
        <div class="form-group">
          <label>비밀번호 *</label>
          <input type="password" placeholder="8자 이상 입력하세요" v-model="password"/>
        </div>

        <!-- 비밀번호 확인 -->
        <div class="form-group">
          <label>비밀번호 확인 *</label>
          <input type="password" placeholder="비밀번호를 다시 입력하세요" v-model="passwordCheck"/>
        </div>

        <!-- 약관 동의 -->
        <div class="agree-section">
          <input type="checkbox" id="agree" v-model="agreeCheck" />
          <label for="agree">이용약관 및 개인정보처리방침에 동의합니다</label>
        </div>

        <!-- 회원가입 버튼 -->
        <button class="signup-btn" @click="register">회원가입</button>

        <!-- 로그인 링크 -->
        <div class="login-link">
          <span>이미 계정이 있으신가요?</span>
          <a href="/login">로그인</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Header from '@/components/Header.vue';
import axios from 'axios';

const email = ref("");
const username = ref("")
const varifyNum = ref()
const varifyNumCheck = ref()
const gender = ref("")
const phone = ref("")
const age = ref()
const password = ref("")
const passwordCheck = ref("")
const agreeCheck = ref(false)

const validationNum = async () => {

  if (!email.value.trim()) {
    alert("이메일을 입력해주세요!");
    return;
  }

  const data = new FormData();
  data.append("mail",email.value)

  await axios.post('http://localhost:8080/validation/sendmail',data).then(
    (res) => {
      console.log(res.data)
      varifyNumCheck.value = res.data
      alert("인증번호가 발송되었습니다.")
    }
  )
}

const register = async () => {
  if(username.value == ""){
    alert("사용자 이름을 입력해주세요")
    return;
  }

  if(password.value != passwordCheck.value){
    alert("비밀번호를 확인해주세요");
    return;
  }

  if(varifyNum.value != varifyNumCheck.value){
    console.log("password = ", varifyNum.value)
    console.log("passwordCheck = ", varifyNumCheck.value)
    alert("인증번호를 제대로 입력해주세요");
    return;
  }
  
  if(!agreeCheck.value){
    alert("이용약관을 확인해주세요");
    return;
  }

  var data = {
    username: username.value,
    email: email.value,
    password: password.value,
    age: age.value,
    phone: phone.value,
    gender: gender.value,
    role: "ROLE_일반회원",
    isDeleted: 0
  }

  await axios.post('http://localhost:8080/user/register',data).then(
    (res) => {
      console.log(res)
    }
  )
}

</script>

<style scoped>
.signup-container {
  width: 1512px;
  height: 1164px;
  background: linear-gradient(146deg, #eff6ff 7%, white 50%, #f0fdf4 93%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 50px;
}

/* 상단바 */
.nav-bar {
  width: 100%;
  height: 49px;
  background: rgba(255, 255, 255, 0.8);
  position: relative;
}

.nav-content {
  width: 1167px;
  margin: 12px auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-section img {
  width: 36px;
  height: 36px;
}

.logo-text {
  font-size: 16px;
  font-weight: 600;
  color: #101828;
}

.login-text {
  color: #4a5565;
  font-size: 14px;
}

/* 메인 섹션 */
.main-content {
  width: 480px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 32px;
}

.welcome-section {
  text-align: center;
}

.welcome-section h1 {
  font-size: 32px;
  color: #101828;
  font-weight: 400;
  margin-bottom: 8px;
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
  gap: 20px;
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
  padding: 10px 12px;
  border: 1px solid #d1d5dc;
  border-radius: 12px;
  background: #f3f3f5;
  font-size: 14px;
  color: #717182;
  outline: none;
}

.email-row,
.verify-row {
  display: flex;
  gap: 8px;
}

.email-row input,
.verify-row input {
  flex: 1; 
}

.verify-btn {
  background: #155dfc;
  color: white;
  border: none;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}

.resend-btn {
  background: white;
  border: 1px solid #d1d5dc;
  border-radius: 12px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  color: #101828;
}

small {
  font-size: 12px;
  color: #4a5565;
}

.select-box {
  width: 100%;
  background: #f3f3f5;
  border: 1px solid #d1d5dc;
  border-radius: 12px;
  padding: 12px;
  color: #717182;
  font-size: 14px;
  appearance: none; /* 기본 화살표 제거 */
  -webkit-appearance: none;
  -moz-appearance: none;
  position: relative;
}

/* 화살표 추가 (선택 사항) */
.select-box::after {
  content: "▾";
  position: absolute;
  right: 16px;
  pointer-events: none;
}

/* 약관 동의 */
.agree-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.agree-section input {
  width: 16px;
  height: 16px;
}

/* 버튼 */
.signup-btn {
  width: 100%;
  background: #155dfc;
  color: white;
  border: none;
  border-radius: 26px;
  padding: 12px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
}

/* 로그인 링크 */
.login-link {
  text-align: center;
  font-size: 14px;
  color: #4a5565;
}

.login-link a {
  color: #155dfc;
  text-decoration: none;
  margin-left: 4px;
}

.logo-image {
  width: 200px;
  height: 80px;
}
</style>