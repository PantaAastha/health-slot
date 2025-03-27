import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import BookingModal from "../BookingModal.vue";

describe("BookingModal", () => {
  const mockDoctor = {
    id: 1,
    name: "Dr. John Doe",
    speciality: "Cardiology",
    timezone: "UTC",
  };

  const defaultProps = {
    show: true,
    doctor: mockDoctor,
    day: "Monday",
    time: "10:00 AM",
  };

  it("renders correctly when show is true and doctor exists", () => {
    const wrapper = mount(BookingModal, {
      props: defaultProps,
    });

    expect(wrapper.find(".modal-overlay").exists()).toBe(true);
    expect(wrapper.find("h2").text()).toBe("Confirm Your Appointment");
    expect(wrapper.find("p").text()).toBe("Doctor: Dr. John Doe");
  });

  it("does not render when show is false", () => {
    const wrapper = mount(BookingModal, {
      props: {
        ...defaultProps,
        show: false,
      },
    });

    expect(wrapper.find(".modal-overlay").exists()).toBe(false);
  });

  it("does not render when doctor is null", () => {
    const wrapper = mount(BookingModal, {
      props: {
        ...defaultProps,
        doctor: null,
      },
    });

    expect(wrapper.find(".modal-overlay").exists()).toBe(false);
  });

  it("emits close event when cancel button is clicked", async () => {
    const wrapper = mount(BookingModal, {
      props: defaultProps,
    });

    await wrapper.find(".cancel-btn").trigger("click");
    expect(wrapper.emitted("close")).toBeTruthy();
  });

  it("emits confirm event with notify value when confirm button is clicked", async () => {
    const wrapper = mount(BookingModal, {
      props: defaultProps,
    });

    // Set notify to true
    await wrapper.find('input[type="checkbox"]').setValue(true);

    await wrapper.find(".confirm-btn").trigger("click");

    expect(wrapper.emitted("confirm")).toBeTruthy();
    expect(wrapper.emitted("confirm")[0][0]).toEqual({ notify: true });
  });

  it("handles missing doctor data gracefully", () => {
    const wrapper = mount(BookingModal, {
      props: {
        ...defaultProps,
        doctor: undefined,
      },
    });

    expect(wrapper.find(".modal-overlay").exists()).toBe(false);
  });

  it("handles missing day or time gracefully", () => {
    const wrapper = mount(BookingModal, {
      props: {
        ...defaultProps,
        day: "",
        time: "",
      },
    });

    expect(wrapper.find(".modal-overlay").exists()).toBe(true);
    expect(wrapper.find("p:nth-child(3)").text()).toBe("Day: ");
    expect(wrapper.find("p:nth-child(4)").text()).toBe("Time: ");
  });

  it("toggles notify checkbox correctly", async () => {
    const wrapper = mount(BookingModal, {
      props: defaultProps,
    });

    const checkbox = wrapper.find('input[type="checkbox"]');
    expect(checkbox.element.checked).toBe(false);

    await checkbox.setValue(true);
    expect(checkbox.element.checked).toBe(true);

    await checkbox.setValue(false);
    expect(checkbox.element.checked).toBe(false);
  });
});
