// src/api/auth.js
import apiClient from '@/utils/axios';

const LOGIN_STATUS_KEY = 'routy:isLoggedIn';

/**
 * 로그인 API
 */
export const login = async (email, password) => {
  const response = await apiClient.post('/user/login', {
    email,
    password
  });
  
  // 로그인 성공 시 상태 업데이트
  if (response.status === 200) {
    window.localStorage?.setItem(LOGIN_STATUS_KEY, 'true');
    window.dispatchEvent(new CustomEvent('login-status-changed', { detail: { loggedIn: true } }));
  }
  
  return response;
};

/**
 * 로그아웃 API
 */
export const logout = async () => {
  console.log('🔵 [auth.js] logout 함수 시작');
  
  try {
    console.log('🔵 [auth.js] POST /auth/logout 요청 전송 중...');
    console.log('🔵 [auth.js] apiClient:', apiClient);
    
    // 백엔드에 로그아웃 요청 (쿠키 삭제)
    const response = await apiClient.post('/auth/logout');
    
    console.log('🟢 [auth.js] POST /auth/logout 요청 성공!', response);
    console.log('🟢 [auth.js] 응답 상태:', response.status);
    console.log('🟢 [auth.js] 응답 데이터:', response.data);
    
    // 로컬 상태 초기화
    window.localStorage?.removeItem(LOGIN_STATUS_KEY);
    console.log('🟢 [auth.js] localStorage 삭제 완료');
    
    window.dispatchEvent(new CustomEvent('login-status-changed', { detail: { loggedIn: false } }));
    console.log('🟢 [auth.js] CustomEvent 발생 완료');
    
    return true;
  } catch (error) {
    console.error('❌ [auth.js] 로그아웃 실패:', error);
    console.error('❌ [auth.js] 에러 상세:', error.response);
    
    // 실패해도 로컬 상태는 초기화
    window.localStorage?.removeItem(LOGIN_STATUS_KEY);
    window.dispatchEvent(new CustomEvent('login-status-changed', { detail: { loggedIn: false } }));
    
    throw error;
  }
};

/**
 * 비밀번호 변경 API
 */
export const changePassword = async (email, newPassword) => {
  console.log('🔵 [auth.js] changePassword 함수 시작');
  console.log('🔵 [auth.js] email:', email);
  
  try {
    const response = await apiClient.put('/auth/change-password', {  // PUT으로 변경
      email,
      newPassword
    });
    
    console.log('🟢 [auth.js] 비밀번호 변경 성공:', response);
    return response;
  } catch (error) {
    console.error('❌ [auth.js] 비밀번호 변경 실패:', error);
    throw error;
  }
};

/**
 * 로그인 상태 확인 API (백엔드에 요청)
 */
export const checkAuthStatus = async () => {
  try {
    const response = await apiClient.get('/auth/status');
    const isLoggedIn = response.data.authenticated || false;
    
    // 로컬 상태 동기화
    if (isLoggedIn) {
      window.localStorage?.setItem(LOGIN_STATUS_KEY, 'true');
    } else {
      window.localStorage?.removeItem(LOGIN_STATUS_KEY);
    }
    
    return isLoggedIn;
  } catch (error) {
    console.error('인증 상태 확인 실패:', error);
    window.localStorage?.removeItem(LOGIN_STATUS_KEY);
    return false;
  }
};

/**
 * 로컬 로그인 상태 확인 (localStorage 기반)
 */
export const getLocalAuthStatus = () => {
  return window.localStorage?.getItem(LOGIN_STATUS_KEY) === 'true';
};

/**
 * OAuth2 로그인 후 상태 동기화
 * 페이지 로드 시 백엔드에 인증 상태를 확인하고 로컬 상태 업데이트
 */
export const syncAuthStatus = async () => {
  console.log('🔵 [auth.js] 인증 상태 동기화 시작');
  
  try {
    const response = await apiClient.get('/auth/status');
    const isLoggedIn = response.data.authenticated || false;
    const username = response.data.username || null;
    
    console.log('🟢 [auth.js] 백엔드 인증 상태:', { isLoggedIn, username });
    
    // 로컬 상태 동기화
    if (isLoggedIn) {
      window.localStorage?.setItem(LOGIN_STATUS_KEY, 'true');
      window.dispatchEvent(new CustomEvent('login-status-changed', { 
        detail: { loggedIn: true, username } 
      }));
      console.log('🟢 [auth.js] 로그인 상태로 업데이트 완료');
    } else {
      window.localStorage?.removeItem(LOGIN_STATUS_KEY);
      window.dispatchEvent(new CustomEvent('login-status-changed', { 
        detail: { loggedIn: false } 
      }));
      console.log('🟢 [auth.js] 로그아웃 상태로 업데이트 완료');
    }
    
    return isLoggedIn;
  } catch (error) {
    console.error('❌ [auth.js] 인증 상태 동기화 실패:', error);
    window.localStorage?.removeItem(LOGIN_STATUS_KEY);
    return false;
  }
};