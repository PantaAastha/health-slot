import { createRouter, createWebHistory } from "vue-router";
import Welcome from "../views/Welcome.vue";
import Home from "../views/Home.vue";
import DoctorSchedule from "../views/DoctorSchedule.vue";

const routes = [
  { path: "/", component: Welcome },
  { path: "/doctors", component: Home },
  { path: "/doctor/:id", component: DoctorSchedule },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
