import { generateCalendarEvents } from "./utils";
import { describe, expect, test } from "vitest";

// Constants
const DEFAULT_DATE = "2025-03-31"; // Monday, March 31, 2025
const MONDAY = "Monday";
const WEDNESDAY = "Wednesday";
const TEN_AM = "10:00 AM";
const TWO_PM = "2:00 PM";
const STATUS_AVAILABLE = "available";
const STATUS_BOOKED = "booked";
const STATUS_BOOKED_BY_USER = "booked-by-user";
const STATUS_TOO_LATE = "too-late-to-book";
const STATUS_SCHEDULE_CONFLICT = "schedule-conflict";

// Mock Factories
const createDoctor = ({
  id = 10,
  availability = [
    { day: MONDAY, hours: ["10:00 AM", "11:00 AM"] },
    { day: WEDNESDAY, hours: ["2:00 PM", "3:00 PM"] },
  ],
} = {}) => ({ id, availability });

const createBookedSlot = ({
  userId = 2,
  doctorId = 10,
  date = DEFAULT_DATE,
  day = MONDAY,
  time = TEN_AM,
  id = 1,
} = {}) => ({ userId, doctorId, date, day, time, id });

const createDoctorForConflict = ({
  id = 2,
  availability = [{ day: MONDAY, hours: [TEN_AM] }],
} = {}) => ({ id, availability });

// Base Configuration
const getBaseConfig = (overrides = {}) => ({
  doctor: createDoctor(),
  bookedSlots: [],
  currentUserId: 3,
  currentDate: new Date(`${DEFAULT_DATE}T09:45:00`), // 9:45 AM
  getDoctorById: (id) => ({ id, name: `${id === 1 ? "X" : "Smith"}` }),
  ...overrides,
});

describe("generateCalendarEvents", () => {
  describe("Availability", () => {
    test("generates events only for available slots", () => {
      const start = new Date(DEFAULT_DATE);
      const end = new Date("2025-04-02"); // Includes Wednesday
      const events = generateCalendarEvents(
        start,
        end,
        getBaseConfig({ bookedSlots: [] })
      );
      expect(events).toHaveLength(4); // 2 Monday + 2 Wednesday slots
      expect(events.map((e) => e.title)).toContain("Available");
    });

    test("excludes slots before current date", () => {
      const pastDate = new Date("2025-03-30"); // Sunday, before Monday
      const events = generateCalendarEvents(
        pastDate,
        pastDate,
        getBaseConfig()
      );
      expect(events).toHaveLength(0);
    });
  });

  describe("Booking Status", () => {
    test("marks slots booked by other users", () => {
      const start = new Date(DEFAULT_DATE);
      const end = new Date("2025-04-01");
      const bookedSlots = [createBookedSlot()];
      const events = generateCalendarEvents(
        start,
        end,
        getBaseConfig({ bookedSlots })
      );
      const slot = events.find((e) => e.extendedProps.time === TEN_AM);
      expect(slot.extendedProps.status).toBe(STATUS_BOOKED);
    });

    test("marks slots booked by current user", () => {
      const start = new Date(DEFAULT_DATE);
      const end = new Date("2025-04-01");
      const bookedSlots = [createBookedSlot({ userId: 3, doctorId: 10 })]; // Current user, same doctor
      const events = generateCalendarEvents(
        start,
        end,
        getBaseConfig({ bookedSlots })
      );
      const slot = events.find((e) => e.extendedProps.time === TEN_AM);
      expect(slot).toBeDefined();
      expect(slot.extendedProps.status).toBe(STATUS_BOOKED_BY_USER);
      expect(slot.title).toBe("Your Booking");
      expect(slot.extendedProps.tooltip).toBe("Click to cancel");
    });

    test("marks slots within 15 minutes as too late to book", () => {
      const start = new Date(DEFAULT_DATE);
      const end = new Date("2025-04-01");
      const currentDate = new Date(`${DEFAULT_DATE}T09:50:00`); // 10 minutes before 10 AM
      const events = generateCalendarEvents(
        start,
        end,
        getBaseConfig({ currentDate })
      );
      const slot = events.find((e) => e.extendedProps.time === TEN_AM);
      expect(slot.extendedProps.status).toBe(STATUS_TOO_LATE);
    });

    test("allows booking when exactly 15 minutes before slot", () => {
      const start = new Date(DEFAULT_DATE);
      const end = new Date("2025-04-01");
      const currentDate = new Date(`${DEFAULT_DATE}T09:45:00`); // Exactly 15 minutes before 10 AM
      const events = generateCalendarEvents(
        start,
        end,
        getBaseConfig({ currentDate })
      );
      const slot = events.find((e) => e.extendedProps.time === TEN_AM);
      expect(slot.extendedProps.status).toBe(STATUS_AVAILABLE);
    });

    test("marks slots with schedule conflict when user has booking with another doctor", () => {
      const start = new Date(`${DEFAULT_DATE}T00:00:00`);
      const end = new Date(`${DEFAULT_DATE}T23:59:59`);
      const currentDate = new Date(`${DEFAULT_DATE}T09:00:00`); // Before 10 AM
      const doctor = createDoctorForConflict(); // Doctor Y, ID 2
      const bookedSlots = [
        createBookedSlot({
          userId: 3, // Same as currentUserId
          doctorId: 1, // Doctor X
          time: TEN_AM,
          id: 123,
        }),
      ];
      const events = generateCalendarEvents(
        start,
        end,
        getBaseConfig({
          doctor,
          bookedSlots,
          currentDate,
        })
      );
      const slot = events.find((e) => e.extendedProps.time === TEN_AM);
      expect(slot).toBeDefined();
      expect(slot.extendedProps.status).toBe(STATUS_SCHEDULE_CONFLICT);
      expect(slot.extendedProps.tooltip).toBe(
        "You have an appointment with Dr. X at this time. To book this slot, please cancel your appointment with Dr. X first."
      );
      expect(slot.title).toBe("Schedule Conflict");
    });
  });

  describe("Time Parsing", () => {
    test("correctly parses and generates PM slots", () => {
      const start = new Date("2025-04-02"); // Wednesday
      const end = new Date("2025-04-02");
      const currentDate = new Date("2025-04-02T13:00:00"); // 1:00 PM, before 2:00 PM
      const events = generateCalendarEvents(
        start,
        end,
        getBaseConfig({ currentDate })
      );
      const slot = events.find((e) => e.extendedProps.time === TWO_PM);
      expect(slot).toBeDefined();
      expect(slot.start.getHours()).toBe(14); // 2:00 PM in 24-hour format
      expect(slot.extendedProps.status).toBe(STATUS_AVAILABLE);
    });
  });
});
