<template>
  <div class="edit-container">
    <div class="edit-box">
      <!-- 제목 -->
      <div class="header-section">
        <div class="main-title">회원 정보 수정</div>
        <div class="sub-title">내 정보를 수정해보세요</div>
      </div>

      <!-- 입력 폼 -->
      <div class="form-section">
        <div class="input-group">
          <label>사용자 이름</label>
          <input type="text" placeholder="이름을 입력하세요" />
        </div>

        <div class="input-group">
          <label>비밀번호</label>
          <input type="password" placeholder="새 비밀번호를 입력하세요" />
        </div>

        <div class="input-group">
          <label>나이</label>
          <input type="number" placeholder="나이를 입력하세요" />
        </div>

        <div class="input-group">
          <label>전화번호</label>
          <input type="tel" placeholder="010-1234-5678" />
        </div>

        <div class="image-upload">
          <label>프로필 이미지</label>
          <div class="upload-box">
            <div class="upload-icon">
              <div class="camera-outline"></div>
              <div class="tray-outline"></div>
            </div>
            <div class="upload-text">
              <p>이미지를 드래그하거나 클릭해서 업로드하세요</p>
              <span>JPG, PNG 파일 (최대 5MB)</span>
            </div>
          </div>
        </div>

        <!-- 버튼 -->
        <div class="button-group">
          <button class="cancel-btn">취소하기</button>
          <button class="submit-btn">수정하기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.edit-container {
  width: 1522px;
  height: 1150px;
  position: relative;
  background: linear-gradient(149deg, #EFF6FF 13%, white 50%, #F0FDF4 87%);
}

.edit-box {
  width: 480px;
  height: 957px;
  position: absolute;
  left: 521px;
  top: 126px;
}

.header-section {
  position: absolute;
  top: 48px;
  width: 480px;
  text-align: center;
}

.main-title {
  font-size: 32px;
  font-family: Inter, sans-serif;
  color: #101828;
  line-height: 40px;
}

.sub-title {
  margin-top: 8px;
  font-size: 16px;
  color: #4A5565;
}

.form-section {
  position: absolute;
  top: 152px;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.input-group label {
  color: #101828;
  font-size: 14px;
  font-family: Inter, sans-serif;
}

.input-group input {
  width: 480px;
  height: 56px;
  background: #F3F3F5;
  border: 0.73px solid #D1D5DC;
  border-radius: 12px;
  padding: 0 16px;
  font-size: 16px;
  color: #717182;
}

.image-upload label {
  color: #101828;
  font-size: 14px;
  margin-bottom: 8px;
  display: inline-block;
}

.upload-box {
  width: 480px;
  height: 200px;
  background: #F3F3F5;
  border-radius: 12px;
  border: 0.73px solid #D1D5DC;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.upload-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  position: relative;
  margin-bottom: 12px;
}

.camera-outline {
  width: 10px;
  height: 5px;
  border: 2px solid #4A5565;
  position: absolute;
  top: 10px;
  left: 19px;
}

.tray-outline {
  width: 18px;
  height: 6px;
  border: 2px solid #4A5565;
  position: absolute;
  bottom: 10px;
  left: 15px;
}

.upload-text {
  text-align: center;
}

.upload-text p {
  color: #101828;
  font-size: 14px;
  margin: 0;
}

.upload-text span {
  font-size: 12px;
  color: #4A5565;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-top: 16px;
}

.cancel-btn,
.submit-btn {
  flex: 1;
  height: 52px;
  border-radius: 26px;
  font-size: 16px;
  font-family: Inter, sans-serif;
  font-weight: 500;
  cursor: pointer;
}

.cancel-btn {
  background: white;
  border: 0.73px solid #D1D5DC;
  color: #4A5565;
}

.submit-btn {
  background: #155DFC;
  color: white;
  border: none;
}
</style>