import { createRouter, createWebHistory } from "vue-router";
import loginRoutes from "./modules/login.js"; // login.js 모듈 import

const routes = [
  ...loginRoutes, // 로그인 관련 라우트 추가

];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;
