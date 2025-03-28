import { describe, it, expect, vi } from "vitest";
import { generateTimeSlots } from "./api";
import { fetchDoctors, transformDoctors } from "./api";

// Mock the fetch function
global.fetch = vi.fn();

describe("fetchDoctors", () => {
  it("should return a list of doctors on a successful fetch", async () => {
    // Mocking the fetch response
    const mockResponse = [
      {
        name: "Dr. Smith",
        timezone: "GMT",
        day_of_week: "Monday",
        available_at: "9:00AM",
        available_until: "11:00AM",
      },
      {
        name: "Dr. Jones",
        timezone: "GMT",
        day_of_week: "Tuesday",
        available_at: "10:00AM",
        available_until: "2:00PM",
      },
    ];
    const transformedDoctors = [
      {
        id: 1,
        name: "Dr. Smith",
        speciality: "General Practitioner",
        timezone: "GMT",
        availability: [
          {
            day: "Monday",
            hours: ["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"],
          },
        ],
      },

      {
        id: 2,
        name: "Dr. Jones",
        speciality: "Cardiologist",
        timezone: "GMT",
        availability: [
          {
            day: "Tuesday",
            hours: [
              "10:00 AM",
              "10:30 AM",
              "11:00 AM",
              "11:30 AM",
              "12:00 PM",
              "12:30 PM",
              "1:00 PM",
              "1:30 PM",
            ],
          },
        ],
      },
    ];

    // Set up mock fetch
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const doctors = await fetchDoctors();
    expect(doctors).toEqual(transformedDoctors);
  });

  it("should return an empty array when the fetch fails", async () => {
    // Mocking the fetch to throw an error
    fetch.mockRejectedValueOnce(new Error("Failed to fetch doctors"));

    const doctors = await fetchDoctors();

    expect(doctors).toEqual([]); // Expecting an empty array due to the error
  });

  it("should handle a failed response (non-200 status)", async () => {
    // Mocking the fetch response with a failed status
    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
    });

    const doctors = await fetchDoctors();

    expect(doctors).toEqual([]); // Expecting an empty array because of the failed status
  });
});

// Helper fuctions
describe("generateTimeSlots", () => {
  it("should generate correct 30-minute slots between 9:00 AM and 11:00 AM", () => {
    const slots = generateTimeSlots("9:00AM", "11:00AM");

    expect(slots).toEqual(["9:00 AM", "9:30 AM", "10:00 AM", "10:30 AM"]);
  });

  it("should return an empty array if start time is the same as end time", () => {
    const slots = generateTimeSlots("10:00AM", "10:00AM");
    expect(slots).toEqual([]);
  });

  it("should return an empty array if start time is after end time", () => {
    const slots = generateTimeSlots("11:00AM", "9:00AM");
    expect(slots).toEqual([]);
  });
});

describe("transformDoctors", () => {
  it("should transform raw data into the correct doctor format", () => {
    const rawData = [
      {
        name: "Dr. Smith",
        timezone: "GMT",
        day_of_week: "Monday",
        available_at: "9:00AM",
        available_until: "12:00PM",
      },
      {
        name: "Dr. Smith",
        timezone: "GMT",
        day_of_week: "Tuesday",
        available_at: "1:00PM",
        available_until: "3:00PM",
      },
    ];

    const expectedOutput = [
      {
        id: 1,
        name: "Dr. Smith",
        speciality: "General Practitioner",
        timezone: "GMT",
        availability: [
          {
            day: "Monday",
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
            day: "Tuesday",
            hours: ["1:00 PM", "1:30 PM", "2:00 PM", "2:30 PM"],
          },
        ],
      },
    ];

    const result = transformDoctors(rawData);

    expect(result).toEqual(expectedOutput);
  });

  it("should remove duplicate time slots for a doctor", () => {
    const rawData = [
      {
        name: "Dr. Davis",
        timezone: "GMT",
        day_of_week: "Thursday",
        available_at: "8:00AM",
        available_until: "9:00AM",
      },
      {
        name: "Dr. Davis",
        timezone: "GMT",
        day_of_week: "Thursday",
        available_at: "8:30AM",
        available_until: "9:00AM",
      },
    ];

    const expectedOutput = [
      {
        id: 1,
        name: "Dr. Davis",
        speciality: "General Practitioner",
        timezone: "GMT",
        availability: [{ day: "Thursday", hours: ["8:00 AM", "8:30 AM"] }],
      },
    ];

    const result = transformDoctors(rawData);

    expect(result).toEqual(expectedOutput);
  });

  it("should handle empty input", () => {
    const rawData = [];

    const expectedOutput = [];

    const result = transformDoctors(rawData);

    expect(result).toEqual(expectedOutput);
  });
});
