import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";

const app = createApp(App);

// Pre-populate some bookings to simulate a multi-user environment
if (!localStorage.getItem("bookings")) {
  const dummyBookings = [
    {
      doctorId: 1,
      day: "Monday",
      time: "9:00 AM",
      notify: false,
      bookedAt: new Date().toISOString(),
    }, // Christy Schumm
    {
      doctorId: 2,
      day: "Tuesday",
      time: "8:00 AM",
      notify: true,
      bookedAt: new Date().toISOString(),
    }, // Natalia Stanton Jr.
  ];
  localStorage.setItem("bookings", JSON.stringify(dummyBookings));
}

app.use(router);
app.use(store);
app.mount("#app");
