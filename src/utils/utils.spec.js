import { generateCalendarEvents } from "./utils";
import { describe, expect, test } from "vitest";

const mockDoctor = {
  id: 10,
  availability: [
    { day: "Monday", hours: ["10:00 AM", "11:00 AM"] },
    { day: "Wednesday", hours: ["2:00 PM", "3:00 PM"] },
  ],
};

const mockBookedSlots = [
  {
    date: "2025-03-31",
    day: "Monday",
    time: "10:00 AM",
    doctorId: 10,
    userId: 2,
  }, // Another user booked
];

const mockCurrentUserId = 3;
const mockCurrentDate = new Date("2025-03-31T09:45:00"); // March 31, 2025, 09:45 AM

const mockGetDoctorById = (id) => ({ id, name: "Dr. Smith" });

describe("generateCalendarEvents", () => {
  test("Generates events only for available slots", () => {
    const events = generateCalendarEvents(
      new Date("2025-03-31"),
      new Date("2025-04-02"),
      {
        doctor: mockDoctor,
        bookedSlots: [],
        currentUserId: mockCurrentUserId,
        currentDate: mockCurrentDate,
        getDoctorById: mockGetDoctorById,
      }
    );
    expect(events.length).toBe(4);
    expect(events.map((e) => e.title)).toContain("Available");
  });

  test("Excludes past slots", () => {
    const pastDate = new Date("2025-03-30");
    const events = generateCalendarEvents(pastDate, pastDate, {
      doctor: mockDoctor,
      bookedSlots: [],
      currentUserId: mockCurrentUserId,
      currentDate: mockCurrentDate,
      getDoctorById: mockGetDoctorById,
    });
    expect(events.length).toBe(0);
  });

  test("Marks booked slots correctly", () => {
    const events = generateCalendarEvents(
      new Date("2025-03-31"),
      new Date("2025-04-01"),
      {
        doctor: mockDoctor,
        bookedSlots: mockBookedSlots,
        currentUserId: mockCurrentUserId,
        currentDate: mockCurrentDate,
        getDoctorById: mockGetDoctorById,
      }
    );
    const bookedSlot = events.find((e) => e.extendedProps.time === "10:00 AM");
    expect(bookedSlot.extendedProps.status).toBe("booked");
  });

  test("Marks 'too-late-to-book' slots correctly", () => {
    const events = generateCalendarEvents(
      new Date("2025-03-31"),
      new Date("2025-04-01"),
      {
        doctor: mockDoctor,
        bookedSlots: [],
        currentUserId: mockCurrentUserId,
        currentDate: new Date("2025-03-31T09:50:00"),
        getDoctorById: mockGetDoctorById,
      }
    );
    const tooLateSlot = events.find((e) => e.extendedProps.time === "10:00 AM");
    expect(tooLateSlot.extendedProps.status).toBe("too-late-to-book");
  });

  test("Marks 'schedule-conflict' slots when user has booking with another doctor", () => {
    // Setup mock data
    const mockCurrentUserId = 3; // User A
    const mockCurrentDate = new Date("2025-03-31T09:00:00"); // March 31, 2025, 9:00 AM (before 10 AM)

    const mockDoctorY = {
      id: 2, // Doctor Y
      availability: [
        {
          day: "Monday",
          hours: ["10:00 AM"], // Only testing 10 AM slot
        },
      ],
    };

    const mockBookedSlots = [
      {
        userId: mockCurrentUserId, // User A
        doctorId: 1, // Doctor X
        date: "2025-03-31", // Same date
        day: "Monday",
        time: "10:00 AM", // Same time
        id: 123,
      },
    ];

    const mockGetDoctorById = (id) =>
      id === 1 ? { id: 1, name: "X" } : { id: 2, name: "Y" };

    // Generate events for Doctor Y
    const events = generateCalendarEvents(
      new Date("2025-03-31T00:00:00"), // Start of day
      new Date("2025-03-31T23:59:59"), // End of day
      {
        doctor: mockDoctorY,
        bookedSlots: mockBookedSlots,
        currentUserId: mockCurrentUserId,
        currentDate: mockCurrentDate,
        getDoctorById: mockGetDoctorById,
      }
    );

    // Find the 10 AM slot for Doctor Y
    const slot = events.find((e) => e.extendedProps.time === "10:00 AM");

    // Assertions
    expect(slot).toBeDefined(); // Ensure slot exists
    expect(slot.extendedProps.status).toBe("schedule-conflict");
    expect(slot.extendedProps.tooltip).toBe(
      "You have an appointment with Dr. X at this time. To book this slot, please cancel your appointment with Dr. X first."
    );
    expect(slot.title).toBe("Schedule Conflict");
  });
});
