import { createStore } from "vuex";
import { fetchDoctors } from "../services/api";

export default createStore({
  state: {
    doctors: [],
    bookings: JSON.parse(localStorage.getItem("bookings") || "[]"),
    user: JSON.parse(localStorage.getItem("user") || "{}"), // Store user info
  },
  mutations: {
    setDoctors(state, doctors) {
      state.doctors = doctors;
    },
    addBooking(state, booking) {
      state.bookings.push(booking);
      localStorage.setItem("bookings", JSON.stringify(state.bookings));
    },
    setUser(state, user) {
      state.user = user;
      localStorage.setItem("user", JSON.stringify(user));
    },
  },
  actions: {
    async loadDoctors({ commit }) {
      const doctors = await fetchDoctors();
      commit("setDoctors", doctors);
    },
    bookSlot({ commit }, { doctorId, day, time, notify }) {
      const booking = {
        doctorId,
        day,
        time,
        notify,
        bookedAt: new Date().toISOString(),
      };
      commit("addBooking", booking);
    },
    saveUser({ commit }, user) {
      commit("setUser", user);
    },
  },
  getters: {
    getDoctorById: (state) => (id) => state.doctors.find((d) => d.id === id),
    bookedSlots: (state) => state.bookings,
    user: (state) => state.user,
  },
});
