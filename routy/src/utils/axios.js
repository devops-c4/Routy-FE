// src/utils/axios.js 또는 src/api/index.js
import axios from 'axios';

// Axios 기본 설정
const apiClient = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true,  // ⭐ 모든 요청에 쿠키 자동 포함
  headers: {
    'Content-Type': 'application/json'
  }
});

// 요청 인터셉터 (선택사항)
apiClient.interceptors.request.use(
  (config) => {
    console.log('API 요청:', config.url);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 (선택사항)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 401 에러 처리 (토큰 만료 등)
    if (error.response && error.response.status === 401) {
      // 로그인 페이지로 리다이렉트
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;