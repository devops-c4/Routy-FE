import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js"; 
import '@/assets/css/home.css';  // 모든  배경 기본 스타일에 적용

const app = createApp(App);
app.use(router);
app.mount("#app");
