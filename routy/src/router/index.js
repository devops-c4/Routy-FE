import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import Draw from "@/views/Draw.vue";     // 여행 루트 그리기 페이지
import Browse from "@/views/Browse.vue"; // 여행 루트 둘러보기 페이지
import Login from '@/components/login/Login.vue'
import Main from '@/components/Main.vue'
import Register from '@/components/Register.vue'
import LoginSuccess from '@/components/login/LoginSuccess.vue'
import FindPassword from '@/components/login/FindPassword.vue'
import ChangePassword from '@/components/login/ChangePassword.vue'


const routes = [
    { path: '/', name: 'home', component: Home },
    { path: "/browse", name: "browse", component: Browse },
    { path: "/draw", name: "draw", component: Draw },
    {
        path: '/login', 
        name: 'login',
        component: Login 
    },{
        path: '/login/success',
        name: 'loginSuccess',
        component: LoginSuccess
    },{
        path: '/register',
        name: 'register',
        component: Register
    },{
        path: '/main',
        name: 'main',
        component: Main
    },{
        path: '/findpassword',
        name: 'findpassword',
        component: FindPassword
    },{
        path: '/changepassword',
        name: 'changepassword',
        component: ChangePassword
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router