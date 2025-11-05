import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
// import Draw from "@/views/Draw.vue";     // 여행 루트 그리기 페이지
import Browse from "@/views/Browse.vue"; // 여행 루트 둘러보기 페이지
import Login from './modules/login';
import Draw from './modules/draw.js';
import MyPage from './modules/mypage';

const routes = [
    ...Login,
    ...Draw,
    ...MyPage,
    { path: '/', name: 'home', component: Home },
    { path: "/browse", name: "browse", component: Browse }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router