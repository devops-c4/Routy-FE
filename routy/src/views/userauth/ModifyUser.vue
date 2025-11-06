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

        <!-- ✅ 이미지 업로드 -->
        <div class="image-upload">
          <label>프로필 이미지</label>

          <div
            class="upload-wrapper"
          >
            <div
              class="upload-box"
              :style="previewImage ? { backgroundImage: `url(${previewImage})` } : {}"
              @dragover.prevent
              @drop.prevent="handleDrop"
              @click="triggerFileInput"
            >
              <input
                type="file"
                ref="fileInput"
                accept="image/*"
                @change="handleFileChange"
                style="display: none"
              />

              <!-- 이미지 없을 때만 아이콘+문구 표시 -->
              <div v-if="!previewImage" class="upload-content">
                <div class="upload-icon">
                  <div class="tray-outline"></div>
                </div>
                <div class="upload-text">
                  <p>이미지를 드래그하거나 클릭해서 업로드하세요</p>
                  <span>JPG, PNG 파일 (최대 5MB)</span>
                </div>
              </div>
            </div>

            <!-- ✅ 이미지 있을 때 X버튼 (박스 오른쪽 위 바깥쪽) -->
            <button
              v-if="previewImage"
              class="remove-btn"
              @click.stop="removeImage"
            >
              ✕
            </button>
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

<script setup>
import { ref } from "vue";

const fileInput = ref(null);
const previewImage = ref(null);

// 파일 선택창 열기
const triggerFileInput = () => {
  fileInput.value.click();
};

// 파일 선택 처리
const handleFileChange = (e) => {
  const file = e.target.files[0];
  if (file && file.size < 5 * 1024 * 1024) {
    const reader = new FileReader();
    reader.onload = () => {
      previewImage.value = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert("5MB 이하의 이미지만 업로드 가능합니다.");
  }
};

// 드래그앤드롭 처리
const handleDrop = (e) => {
  const file = e.dataTransfer.files[0];
  if (file && file.size < 5 * 1024 * 1024) {
    const reader = new FileReader();
    reader.onload = () => {
      previewImage.value = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    alert("5MB 이하의 이미지만 업로드 가능합니다.");
  }
};

// ✅ 이미지 제거
const removeImage = () => {
  previewImage.value = null;
  if (fileInput.value) {
    fileInput.value.value = ""; // input 초기화
  }
};
</script>

<style scoped>
.edit-container {
  width: 1522px;
  height: 1150px;
  position: relative;
  background: linear-gradient(149deg, #eff6ff 13%, white 50%, #f0fdf4 87%);
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
  color: #4a5565;
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
  background: #f3f3f5;
  border: 0.73px solid #d1d5dc;
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

/* ✅ X 버튼이 upload 박스 오른쪽 위에 떠 있게 감싸주는 래퍼 */
.upload-wrapper {
  position: relative;
  display: inline-block;
}

.upload-box {
  width: 510px;
  height: 200px;
  background: #f3f3f5;
  border-radius: 12px;
  border: 0.73px solid #d1d5dc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: 0.3s;
  position: relative;
}

.upload-box:hover {
  background-color: #eef3ff;
}

.upload-content {
  text-align: center;
}

.upload-icon {
  width: 48px;
  height: 48px;
  background: white;
  border-radius: 50%;
  position: relative;
  margin: 0 auto 12px;
}

.tray-outline {
  width: 24px;
  height: 24px;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: url("../../assets/images/icons/upload.svg") no-repeat center center;
  background-size: contain;
}

.upload-text p {
  color: #101828;
  font-size: 14px;
  margin: 0;
}

.upload-text span {
  font-size: 12px;
  color: #4a5565;
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
  border: 0.73px solid #d1d5dc;
  color: #4a5565;
}

.submit-btn {
  background: #155dfc;
  color: white;
  border: none;
}

/* ✅ 이미지 제거 버튼 (박스 우측 위 바깥쪽) */
.remove-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background: #ffffff;
  border: 1px solid #d1d5dc;
  border-radius: 50%;
  width: 26px;
  height: 26px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: all 0.2s ease;
  z-index: 10;
}

.remove-btn:hover {
  background: #f5f5f5;
  transform: scale(1.1);
}
</style>