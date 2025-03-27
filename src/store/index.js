import { createStore } from "vuex";
import { fetchDoctors } from "../services/api";

export default createStore({
  state: {
    doctors: [],
    bookings: JSON.parse(localStorage.getItem("bookings") || "[]"),
    user: JSON.parse(localStorage.getItem("user") || "{}"),
  },
  mutations: {
    setDoctors(state, doctors) {
      state.doctors = doctors;
    },
    addBooking(state, booking) {
      state.bookings.push(booking);
      localStorage.setItem("bookings", JSON.stringify(state.bookings));
    },
    setBookings(state, bookings) {
      state.bookings = bookings;
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
    bookSlot({ commit }, { doctorId, date, day, time, notify }) {
      const booking = {
        doctorId,
        date, // Store the specific date (e.g., "2025-03-31")
        day, // Store the day name (e.g., "Monday")
        time, // Store the time (e.g., "9:00 AM")
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
