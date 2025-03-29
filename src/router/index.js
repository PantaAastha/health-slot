import { createRouter, createWebHashHistory } from "vue-router";
import Welcome from "../views/Welcome.vue";
import Home from "../views/Home.vue";
import DoctorSchedule from "../views/DoctorSchedule.vue";
import store from "../store"; // Import the store

const routes = [
  { path: "/", component: Welcome },
  {
    path: "/doctors",
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: "/doctor/:id",
    component: DoctorSchedule,
    meta: { requiresAuth: true },
  },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

// Add navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = !!store.state.user?.id;
  if (
    to.matched.some((record) => record.meta.requiresAuth) &&
    !isAuthenticated
  ) {
    next("/");
  } else {
    next();
  }
});

export default router;
