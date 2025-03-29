// Format a date to YYYY-MM-DD
export function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

// Generate calendar events for FullCalendar
export function generateCalendarEvents(
  start,
  end,
  { doctor, bookedSlots, currentUserId, currentDate, getDoctorById }
) {
  if (!doctor) return [];

  const events = [];

  const availableDays = doctor.availability.reduce((acc, day) => {
    acc[day.day] = day.hours;
    return acc;
  }, {});

  let current = new Date(start);
  while (current <= end) {
    const dayName = new Intl.DateTimeFormat("en-US", {
      weekday: "long",
    }).format(current);
    if (availableDays[dayName]) {
      const hours = availableDays[dayName];
      hours.forEach((time) => {
        const [hours, minutes, period] = time
          .match(/(\d+):(\d+) (AM|PM)/)
          .slice(1);
        let hour = parseInt(hours, 10);
        if (period === "PM" && hour !== 12) hour += 12;
        if (period === "AM" && hour === 12) hour = 0;

        const slotDate = new Date(current);
        slotDate.setHours(hour, parseInt(minutes, 10), 0, 0);

        // Check if the slot is in the past
        const isPast = slotDate < currentDate;

        // Check if the slot is too close (within 15 minutes)
        let isTooClose = false;
        if (!isPast) {
          const timeDiff = (slotDate - currentDate) / (1000 * 60); // Difference in minutes
          isTooClose = timeDiff < 15;
        }

        // Check if this slot is booked by anyone with the current doctor
        const slotDateStr = formatDate(slotDate);
        const anyBooking = bookedSlots.find(
          (b) =>
            b.date === slotDateStr &&
            b.day === dayName &&
            b.time === time &&
            b.doctorId === doctor.id &&
            b.userId !== currentUserId
        );

        // Check if the current user has a booking with this doctor at this time
        const userBookingWithThisDoctor = bookedSlots.find(
          (b) =>
            b.userId === currentUserId &&
            b.date === slotDateStr &&
            b.day === dayName &&
            b.time === time &&
            b.doctorId === doctor.id
        );

        // Check if the current user has a booking at this time with any other doctor
        const userBookingWithOtherDoctor = bookedSlots.find(
          (b) =>
            b.userId === currentUserId &&
            b.date === slotDateStr &&
            b.day === dayName &&
            b.time === time &&
            b.doctorId !== doctor.id
        );

        // Determine the slot's status
        let status = "available";
        let label = "Available";
        let tooltip = "";
        if (isPast) {
          status = "past";
          label = "Past";
        } else if (userBookingWithThisDoctor) {
          // This is the user's booking with this doctor
          status = "booked-by-user";
          label = "Your Booking";
          tooltip = "Click to cancel";
        } else if (anyBooking) {
          // This slot is booked by another user with this doctor
          status = "booked";
          label = "Booked";
          tooltip = "This slot is booked by another patient";
        } else if (userBookingWithOtherDoctor) {
          // This slot conflicts with the user's booking with another doctor
          status = "schedule-conflict";
          label = "Schedule Conflict";
          const otherDoctor = getDoctorById(
            userBookingWithOtherDoctor.doctorId
          );
          tooltip = `You have an appointment with Dr. ${otherDoctor.name} at this time. To book this slot, please cancel your appointment with Dr. ${otherDoctor.name} first.`;
        } else if (isTooClose) {
          // Only apply "Too Late to Book" if the slot is not booked or conflicting
          status = "too-late-to-book";
          label = "Too Late to Book";
          tooltip =
            "This slot is within 15 minutes of the current time and can no longer be booked.";
        }

        events.push({
          title: label,
          start: slotDate,
          end: new Date(slotDate.getTime() + 30 * 60 * 1000),
          extendedProps: {
            day: dayName,
            time: time,
            status,
            slotDate,
            bookingId: userBookingWithThisDoctor?.id || anyBooking?.id,
            tooltip,
          },
          classNames: [status + "-slot"],
        });
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return events;
}
