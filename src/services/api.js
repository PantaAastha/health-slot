export async function fetchDoctors() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/suyogshiftcare/jsontest/main/available.json"
    );
    if (!response.ok) throw new Error("Failed to fetch doctors");
    const rawData = await response.json();

    // Transform the raw data into the desired format
    return transformDoctors(rawData);
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
}

// Helper function to generate 30-minute time slots between start and end times
function generateTimeSlots(startTime, endTime) {
  const slots = [];
  let currentTime = parseTime(startTime);
  const end = parseTime(endTime);

  while (currentTime < end) {
    slots.push(formatTime(currentTime));
    currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000); // Add 30 minutes
  }

  return slots;
}

// Parse time string (e.g., " 9:00AM") into a Date object for comparison
function parseTime(timeStr) {
  const [hours, minutes] = timeStr
    .trim()
    .match(/(\d+):(\d+)(AM|PM)/)
    .slice(1);
  let hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);
  const isPM = timeStr.includes("PM");

  if (isPM && hour !== 12) hour += 12;
  if (!isPM && hour === 12) hour = 0;

  const date = new Date();
  date.setHours(hour, minute, 0, 0);
  return date;
}

// Format Date object back into a time string (e.g., "9:00 AM")
function formatTime(date) {
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // Convert 0 or 12 to 12 for 12-hour format
  return `${hours}:${minutes} ${period}`;
}

// Transform raw API data into the desired doctor format
function transformDoctors(rawData) {
  // Group by doctor name
  const groupedByDoctor = rawData.reduce((acc, entry) => {
    const { name, timezone, day_of_week, available_at, available_until } =
      entry;
    if (!acc[name]) {
      acc[name] = { name, timezone, availability: {} };
    }

    // Initialize the day if it doesn't exist
    if (!acc[name].availability[day_of_week]) {
      acc[name].availability[day_of_week] = [];
    }

    // Add the time slots for this day
    acc[name].availability[day_of_week].push(
      ...generateTimeSlots(available_at, available_until)
    );
    return acc;
  }, {});

  // Convert grouped data into an array of doctors with synthetic IDs and specialties
  const specialties = [
    "General Practitioner",
    "Cardiologist",
    "Dermatologist",
    "Pediatrician",
    "Neurologist",
    "Orthopedic Surgeon",
  ];

  return Object.values(groupedByDoctor).map((doctor, index) => ({
    id: index + 1, // Synthetic ID
    name: doctor.name,
    speciality: specialties[index % specialties.length], // Assign a specialty
    timezone: doctor.timezone,
    availability: Object.entries(doctor.availability).map(([day, hours]) => ({
      day,
      hours: [...new Set(hours)].sort(), // Remove duplicates and sort
    })),
  }));
}
