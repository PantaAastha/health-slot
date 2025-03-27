<template>
  <div class="container">
    <h1>{{ doctor?.name }}'s Schedule</h1>
    <p>{{ doctor?.speciality }} | Timezone: {{ doctor?.timezone }}</p>

    <div v-if="loading">Loading...</div>
    <div v-else-if="doctor">
      <div class="calendar-view">
        <FullCalendar :options="calendarOptions" ref="calendar" />
      </div>
    </div>
    <p v-else>Doctor not found</p>

    <!-- Confirmation Modal -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal">
        <h2>Confirm Your Appointment</h2>
        <p>Doctor: {{ doctor.name }}</p>
        <p>Day: {{ selectedDay }}</p>
        <p>Time: {{ selectedTime }}</p>
        <label>
          <input type="checkbox" v-model="notify" />
          Notify me 30 minutes before the appointment
        </label>
        <div class="modal-actions">
          <button @click="confirmBooking" class="confirm-btn">Confirm</button>
          <button @click="showModal = false" class="cancel-btn">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import FullCalendar from "@fullcalendar/vue3";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

const store = useStore();
const route = useRoute();
const router = useRouter();

const doctor = ref(null);
const loading = ref(true);
const showModal = ref(false);
const selectedDay = ref("");
const selectedTime = ref("");
const selectedSlotDate = ref(null);
const notify = ref(false);
const calendar = ref(null);

onMounted(async () => {
  if (!store.state.doctors.length) {
    await store.dispatch("loadDoctors");
  }

  const doctorId = Number(route.params.id);
  doctor.value = store.getters.getDoctorById(doctorId);

  if (!doctor.value) {
    router.push("/doctors");
  }

  loading.value = false;
});

const calendarOptions = computed(() => {
  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek",
    initialDate: "2025-03-24", // Start of the current week (March 24, 2025)
    headerToolbar: {
      left: "prev,next",
      center: "title",
      right: window.innerWidth < 768 ? "" : "timeGridWeek,timeGridDay",
    },
    events: (fetchInfo, successCallback) => {
      const events = generateCalendarEvents(fetchInfo.start, fetchInfo.end);
      successCallback(events);
    },
    eventClick: handleEventClick,
    slotMinTime: "07:00:00",
    slotMaxTime: "18:00:00",
    slotDuration: "00:30:00",
    allDaySlot: false,
    height: "auto",
    validRange: {
      start: "2025-03-27", // Today
      end: "2025-04-28", // Exclusive, so bookings stop at April 27
    },
  };
});

watch(
  () => store.getters.bookedSlots,
  (newBookedSlots) => {
    console.log("Booked slots updated:", newBookedSlots);
    if (calendar.value) {
      const calendarApi = calendar.value.getApi();
      calendarApi.refetchEvents();
    }
  },
  { deep: true }
);

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function generateCalendarEvents(start, end) {
  if (!doctor.value) return [];

  const events = [];
  const bookedSlots = store.getters.bookedSlots.filter(
    (b) => b.doctorId === doctor.value.id
  );
  const currentDate = new Date();

  const availableDays = doctor.value.availability.reduce((acc, day) => {
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

        // Check if the slot is today and the time has passed
        const isToday = formatDate(slotDate) === formatDate(currentDate);
        const isTimePassed = isToday && isPast;

        // Check if the slot is too close (within 15 minutes)
        let isTooClose = false;
        if (!isPast) {
          const timeDiff = (slotDate - currentDate) / (1000 * 60); // Difference in minutes
          isTooClose = timeDiff < 15;
        }

        // Check if the slot is booked
        const slotDateStr = formatDate(slotDate);
        const isBooked = bookedSlots.some(
          (b) => b.date === slotDateStr && b.day === dayName && b.time === time
        );

        // Determine the slot's status
        let status = "available";
        let label = "Available";
        if (isPast) {
          status = "past";
          label = "Past";
        } else if (isTooClose) {
          status = "too-close";
          label = "Too Close";
        } else if (isBooked) {
          status = "booked";
          label = "Booked";
        }

        // Skip slots for today if the time has passed
        if (isTimePassed) {
          return;
        }

        events.push({
          title: label,
          start: slotDate,
          end: new Date(slotDate.getTime() + 30 * 60 * 1000),
          extendedProps: { day: dayName, time: time, status, slotDate },
          classNames: [status + "-slot"],
        });
      });
    }
    current.setDate(current.getDate() + 1);
  }

  return events;
}

function handleEventClick(info) {
  const { day, time, status, slotDate } = info.event.extendedProps;
  if (status === "available") {
    openBookingModal(day, time, slotDate);
  }
}

function openBookingModal(day, time, slotDate) {
  selectedDay.value = day;
  selectedTime.value = time;
  selectedSlotDate.value = slotDate;
  showModal.value = true;
}

async function confirmBooking() {
  const slotDateStr = formatDate(selectedSlotDate.value);

  await store.dispatch("bookSlot", {
    doctorId: doctor.value.id,
    date: slotDateStr,
    day: selectedDay.value,
    time: selectedTime.value,
    notify: notify.value,
  });

  showModal.value = false;
  alert(
    `Appointment booked!${
      notify.value
        ? " We’ll notify you 30 minutes before your appointment."
        : ""
    }`
  );

  // Force refetch events after booking
  await nextTick();
  if (calendar.value) {
    const calendarApi = calendar.value.getApi();
    calendarApi.refetchEvents();
  }
}
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
  z-index: 1001;
}
.modal-actions {
  margin-top: 1rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}
.confirm-btn {
  background: #00a3e0;
  color: white;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  border: none;
}
.cancel-btn {
  background: #d1d5db;
  color: #333;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  border: none;
}

/* FullCalendar Custom Styles */
:deep(.fc) {
  font-family: "Roboto", sans-serif;
  z-index: 1;
}
:deep(.fc .fc-col-header-cell) {
  background: #00a3e0;
  color: white;
}
:deep(.fc .fc-daygrid-day-number) {
  color: #333;
}
:deep(.fc .fc-timegrid-slot-label) {
  color: #6b7280;
}
:deep(.fc-event) {
  border: none;
  border-radius: 0;
  padding: 2px 4px;
  margin: 1px 2px;
  display: flex;
  align-items: center;
  font-size: 0.85rem;
  line-height: 1.2;
  background: transparent !important;
  height: 20px;
}
:deep(.fc-event-main) {
  display: flex;
  align-items: center;
  gap: 6px;
}
:deep(.fc-event-time) {
  font-weight: bold;
  color: #333;
}
:deep(.fc-event-title) {
  flex-grow: 1;
  color: #333;
}
:deep(.fc-event-title::before) {
  content: "";
  display: inline-block;
  width: 4px;
  height: 12px;
  margin-right: 6px;
  border-radius: 2px;
}
:deep(.available-slot) {
  background: #e6f4ea !important;
  cursor: pointer;
}
:deep(.available-slot .fc-event-title::before) {
  background: #34d399;
}
:deep(.booked-slot) {
  background: #fee2e2 !important;
  cursor: not-allowed;
}
:deep(.booked-slot .fc-event-title::before) {
  background: #ef4444;
}
:deep(.past-slot) {
  background: #f3f4f6 !important;
  cursor: not-allowed;
}
:deep(.past-slot .fc-event-title::before) {
  background: #9ca3af;
}
:deep(.too-close-slot) {
  background: #fef9c3 !important;
  cursor: not-allowed;
}
:deep(.too-close-slot .fc-event-title::before) {
  background: #facc15;
}
:deep(.fc-timegrid-slot) {
  height: 24px !important;
}
:deep(.fc-timegrid-col) {
  background: #f9fafb;
}
</style>