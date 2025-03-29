import { describe, test, expect, vi, beforeEach } from "vitest";
import { fetchDoctors, generateTimeSlots, transformDoctors } from "./api";

// Constants
const MONDAY = "Monday";
const TUESDAY = "Tuesday";
const THURSDAY = "Thursday";

// Mock Factories
const createRawDoctor = ({
  name = "Dr. Smith",
  timezone = "GMT",
  day_of_week = MONDAY,
  available_at = "9:00AM",
  available_until = "11:00AM",
} = {}) => ({ name, timezone, day_of_week, available_at, available_until });

const createTransformedDoctor = ({
  id = 1,
  name = "Dr. Smith",
  speciality = "General Practitioner",
  timezone = "GMT",
  availability = [
    { day: MONDAY, hours: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"] },
  ],
} = {}) => ({ id, name, speciality, timezone, availability });

// Mock Setup
global.fetch = vi.fn();

const mockFetchResponse = (options = {}) => {
  const { ok = true, status = 200, jsonData = [], error } = options;
  if (error) {
    return fetch.mockRejectedValueOnce(error);
  }
  return fetch.mockResolvedValueOnce({
    ok,
    status,
    json: async () => jsonData,
  });
};

// Test Suite
describe("api.js", () => {
  beforeEach(() => {
    fetch.mockClear(); // Reset fetch mock before each test
  });

  describe("fetchDoctors", () => {
    describe("Success Cases", () => {
      test("returns transformed doctors on successful fetch", async () => {
        const rawData = [
          createRawDoctor(),
          createRawDoctor({
            name: "Dr. Jones",
            day_of_week: TUESDAY,
            available_at: "10:00AM",
            available_until: "12:00PM",
          }),
        ];
        const expectedDoctors = [
          createTransformedDoctor(),
          createTransformedDoctor({
            id: 2,
            name: "Dr. Jones",
            speciality: "Cardiologist",
            availability: [
              {
                day: TUESDAY,
                hours: ["10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM"],
              },
            ],
          }),
        ];
        mockFetchResponse({ jsonData: rawData });

        const doctors = await fetchDoctors();
        expect(doctors).toHaveLength(2);
        expect(doctors).toEqual(expectedDoctors);
      });
    });

    describe("Error Cases", () => {
      test("returns empty array on network error", async () => {
        mockFetchResponse({ error: new Error("Network failure") });

        const doctors = await fetchDoctors();
        expect(doctors).toEqual([]);
      });

      test("returns empty array on non-OK response", async () => {
        mockFetchResponse({ ok: false, status: 500 });

        const doctors = await fetchDoctors();
        expect(doctors).toEqual([]);
      });

      test("returns empty array on malformed JSON", async () => {
        fetch.mockResolvedValueOnce({
          ok: true,
          json: () => Promise.reject(new Error("Invalid JSON")),
        });

        const doctors = await fetchDoctors();
        expect(doctors).toEqual([]);
      });
    });
  });

  describe("generateTimeSlots", () => {
    describe("Typical Cases", () => {
      test("generates 30-minute slots between 9:00 AM and 11:00 AM", () => {
        const slots = generateTimeSlots("9:00AM", "11:00AM");
        expect(slots).toEqual(["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"]);
      });
    });

    describe("Edge Cases", () => {
      test("returns empty array when start equals end time", () => {
        const slots = generateTimeSlots("10:00AM", "10:00AM");
        expect(slots).toEqual([]);
      });

      test("returns empty array when start is after end time", () => {
        const slots = generateTimeSlots("11:00AM", "9:00AM");
        expect(slots).toEqual([]);
      });

      test("correctly parses 12:00 PM slot", () => {
        const slots = generateTimeSlots("12:00PM", "1:00PM");
        expect(slots).toEqual(["12:00 PM", "12:30 PM"]);
      });
    });
  });

  describe("transformDoctors", () => {
    describe("Typical Cases", () => {
      test("transforms raw data into doctor format with multiple days", () => {
        const rawData = [
          createRawDoctor({ available_until: "12:00PM" }),
          createRawDoctor({
            day_of_week: TUESDAY,
            available_at: "1:00PM",
            available_until: "3:00PM",
          }),
        ];
        const expectedOutput = [
          createTransformedDoctor({
            availability: [
              {
                day: MONDAY,
                hours: [
                  "9:00 AM",
                  "9:30 AM",
                  "10:00 AM",
                  "10:30 AM",
                  "11:00 AM",
                  "11:30 AM",
                ],
              },
              {
                day: TUESDAY,
                hours: ["1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"],
              },
            ],
          }),
        ];
        const result = transformDoctors(rawData);
        expect(result).toEqual(expectedOutput);
      });

      test("removes duplicate time slots for the same day", () => {
        const rawData = [
          createRawDoctor({
            available_at: "8:00AM",
            available_until: "9:00AM",
            day_of_week: THURSDAY,
          }),
          createRawDoctor({
            available_at: "8:30AM",
            available_until: "9:00AM",
            day_of_week: THURSDAY,
          }),
        ];
        const expectedOutput = [
          createTransformedDoctor({
            name: "Dr. Smith",
            availability: [{ day: THURSDAY, hours: ["8:00 AM", "8:30 AM"] }],
          }),
        ];
        const result = transformDoctors(rawData);
        expect(result).toEqual(expectedOutput);
      });
    });

    describe("Edge Cases", () => {
      test("handles empty raw data", () => {
        const result = transformDoctors([]);
        expect(result).toEqual([]);
      });

      test("handles missing fields in raw data", () => {
        const rawData = [
          { name: "Dr. Smith", day_of_week: MONDAY, timezone: "GMT" },
        ]; // Missing times
        const expectedOutput = [
          createTransformedDoctor({
            availability: [{ day: MONDAY, hours: [] }], // No slots due to missing times
          }),
        ];
        const result = transformDoctors(rawData);
        expect(result).toEqual(expectedOutput);
      });

      test("assigns specialties cyclically when there are more than 6 doctors", () => {
        const rawData = Array.from({ length: 8 }, (_, i) => ({
          name: `Dr. ${i + 1}`,
          timezone: "GMT",
          day_of_week: "Monday",
          available_at: "9:00AM",
          available_until: "10:00AM",
        }));

        const expectedSpecialties = [
          "General Practitioner",
          "Cardiologist",
          "Dermatologist",
          "Pediatrician",
          "Neurologist",
          "Orthopedic Surgeon",
          "General Practitioner", // Loops back
          "Cardiologist", // Loops back
        ];

        const transformedDoctors = transformDoctors(rawData);
        const assignedSpecialties = transformedDoctors.map(
          (doc) => doc.speciality
        );

        expect(assignedSpecialties).toEqual(expectedSpecialties);
      });
    });
  });
});
