import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

const app = createApp(App);

// Clear bookings when a new user logs in
if (localStorage.getItem("user")) {
  localStorage.removeItem("bookings");
}

app.use(router);
app.use(store);
app.mount("#app");
