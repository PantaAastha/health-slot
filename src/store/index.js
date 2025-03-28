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
    removeBooking(state, bookingId) {
      state.bookings = state.bookings.filter((b) => b.id !== bookingId);
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
    bookSlot({ commit, state }, { doctorId, date, day, time, notify }) {
      // Check if user already has a booking at this time
      const existingBooking = state.bookings.find(
        (b) => b.userId === state.user.id && b.date === date && b.time === time
      );

      if (existingBooking) {
        throw new Error("You already have an appointment at this time");
      }

      const booking = {
        id: Date.now(), // Add unique ID for each booking
        userId: state.user.id, // Add user ID
        doctorId,
        date,
        day,
        time,
        notify,
        bookedAt: new Date().toISOString(),
      };
      commit("addBooking", booking);
    },
    cancelBooking({ commit, state }, bookingId) {
      const booking = state.bookings.find((b) => b.id === bookingId);
      if (!booking) {
        throw new Error("Booking not found");
      }
      if (booking.userId !== state.user.id) {
        throw new Error("You can only cancel your own bookings");
      }
      commit("removeBooking", bookingId);
    },
    saveUser({ commit }, user) {
      commit("setUser", user);
    },
    logout({ commit }) {
      // Only clear user data, keep the bookings
      commit("setUser", {});
      localStorage.removeItem("user");
    },
  },
  getters: {
    getDoctorById: (state) => (id) => state.doctors.find((d) => d.id === id),
    bookedSlots: (state) => state.bookings,
    user: (state) => state.user,
  },
});
