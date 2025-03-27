import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import { createStore } from "vuex";
import { createRouter, createWebHistory } from "vue-router";
import DoctorSchedule from "../DoctorSchedule.vue";

// Mock the child components
vi.mock("@/components/DoctorHeader.vue", () => ({
  default: {
    name: "DoctorHeader",
    template: '<div class="doctor-header"></div>',
    props: ["doctor"],
  },
}));

vi.mock("@/components/DoctorCalendar.vue", () => ({
  default: {
    name: "DoctorCalendar",
    template: '<div class="doctor-calendar"></div>',
    props: ["doctor", "bookedSlots"],
    emits: ["slotSelected"],
  },
}));

vi.mock("@/components/BookingModal.vue", () => ({
  default: {
    name: "BookingModal",
    template: '<div class="booking-modal"></div>',
    props: ["show", "doctor", "day", "time"],
    emits: ["close", "confirm"],
  },
}));

describe("DoctorSchedule", () => {
  let store;
  let router;
  let wrapper;

  const mockDoctor = {
    id: 1,
    name: "Dr. John Doe",
    speciality: "Cardiology",
    timezone: "UTC",
    availability: [
      {
        day: "Monday",
        hours: ["10:00 AM", "11:00 AM"],
      },
    ],
  };

  beforeEach(() => {
    // Create a new store instance for each test
    store = createStore({
      state: {
        doctors: [mockDoctor],
        bookedSlots: [],
      },
      getters: {
        getDoctorById: (state) => (id) => {
          return state.doctors.find((doctor) => doctor.id === id);
        },
        bookedSlots: (state) => state.bookedSlots,
      },
      actions: {
        loadDoctors: vi.fn(),
        bookSlot: vi.fn(),
      },
    });

    // Create a new router instance for each test
    router = createRouter({
      history: createWebHistory(),
      routes: [
        {
          path: "/doctors",
          component: { template: "<div>Doctors List</div>" },
        },
      ],
    });

    // Mount the component with the store and router
    wrapper = mount(DoctorSchedule, {
      global: {
        plugins: [store, router],
      },
      props: {
        id: 1,
      },
    });
  });

  it("renders loading state initially", () => {
    expect(wrapper.find("div").text()).toBe("Loading...");
  });

  it("renders doctor information when loaded", async () => {
    await wrapper.vm.$nextTick();
    expect(wrapper.find(".doctor-header").exists()).toBe(true);
    expect(wrapper.find(".doctor-calendar").exists()).toBe(true);
  });

  it("redirects to doctors list when doctor is not found", async () => {
    // Mock a non-existent doctor ID
    const wrapper = mount(DoctorSchedule, {
      global: {
        plugins: [store, router],
      },
      props: {
        id: 999,
      },
    });

    await wrapper.vm.$nextTick();
    expect(router.currentRoute.value.path).toBe("/doctors");
  });

  it("handles slot selection correctly", async () => {
    await wrapper.vm.$nextTick();

    const slotData = {
      day: "Monday",
      time: "10:00 AM",
      slotDate: new Date("2025-03-24T10:00:00"),
    };

    await wrapper.find(".doctor-calendar").vm.$emit("slotSelected", slotData);

    expect(wrapper.vm.selectedDay).toBe("Monday");
    expect(wrapper.vm.selectedTime).toBe("10:00 AM");
    expect(wrapper.vm.showModal).toBe(true);
  });

  it("handles booking confirmation correctly", async () => {
    await wrapper.vm.$nextTick();

    // Set up slot selection
    const slotData = {
      day: "Monday",
      time: "10:00 AM",
      slotDate: new Date("2025-03-24T10:00:00"),
    };
    await wrapper.find(".doctor-calendar").vm.$emit("slotSelected", slotData);

    // Trigger booking confirmation
    await wrapper.find(".booking-modal").vm.$emit("confirm", { notify: true });

    expect(store.dispatch).toHaveBeenCalledWith("bookSlot", {
      doctorId: 1,
      date: "2025-03-24",
      day: "Monday",
      time: "10:00 AM",
      notify: true,
    });

    expect(wrapper.vm.showModal).toBe(false);
  });

  it("handles booking without notification", async () => {
    await wrapper.vm.$nextTick();

    const slotData = {
      day: "Monday",
      time: "10:00 AM",
      slotDate: new Date("2025-03-24T10:00:00"),
    };
    await wrapper.find(".doctor-calendar").vm.$emit("slotSelected", slotData);

    await wrapper.find(".booking-modal").vm.$emit("confirm", { notify: false });

    expect(store.dispatch).toHaveBeenCalledWith("bookSlot", {
      doctorId: 1,
      date: "2025-03-24",
      day: "Monday",
      time: "10:00 AM",
      notify: false,
    });
  });

  it("handles modal closing", async () => {
    await wrapper.vm.$nextTick();

    const slotData = {
      day: "Monday",
      time: "10:00 AM",
      slotDate: new Date("2025-03-24T10:00:00"),
    };
    await wrapper.find(".doctor-calendar").vm.$emit("slotSelected", slotData);

    await wrapper.find(".booking-modal").vm.$emit("close");

    expect(wrapper.vm.showModal).toBe(false);
  });

  it("loads doctors if store is empty", async () => {
    store.state.doctors = [];
    await wrapper.vm.$nextTick();

    expect(store.dispatch).toHaveBeenCalledWith("loadDoctors");
  });
});
