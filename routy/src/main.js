import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index.js"; // ✅ 라우터 추가

const app = createApp(App);
app.use(router);
app.mount("#app");
