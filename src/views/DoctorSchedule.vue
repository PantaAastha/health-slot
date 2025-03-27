<template>
  <div class="container">
    <h1>{{ doctor?.name }}'s Schedule</h1>
    <p>{{ doctor?.speciality }} | Timezone: {{ doctor?.timezone }}</p>

    <div v-if="loading">Loading...</div>
    <div v-else-if="doctor">
      <!-- Calendar View -->
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
import { ref, onMounted, computed, watch } from "vue";
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
  const events = generateCalendarEvents();
  return {
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: window.innerWidth < 768 ? "timeGridDay" : "timeGridWeek",
    headerToolbar: {
      left: "prev,next",
      center: "title",
      right: window.innerWidth < 768 ? "" : "timeGridWeek,timeGridDay",
    },
    events: events,
    eventClick: handleEventClick,
    slotMinTime: "06:00:00",
    slotMaxTime: "18:00:00",
    slotDuration: "00:30:00",
    allDaySlot: false,
    height: "auto",
  };
});

watch(
  () => store.getters.bookedSlots,
  () => {
    if (calendar.value) {
      const calendarApi = calendar.value.getApi();
      calendarApi.refetchEvents();
    }
  },
  { deep: true }
);

function generateCalendarEvents() {
  if (!doctor.value) return [];

  const events = [];
  const bookedSlots = store.getters.bookedSlots.filter(
    (b) => b.doctorId === doctor.value.id
  );

  doctor.value.availability.forEach((day) => {
    day.hours.forEach((time) => {
      const isBooked = bookedSlots.some(
        (b) => b.day === day.day && b.time === time
      );
      const eventDate = getEventDate(day.day, time);
      events.push({
        title: isBooked ? "Booked" : "Available",
        start: eventDate,
        end: new Date(eventDate.getTime() + 30 * 60 * 1000),
        extendedProps: { day: day.day, time: time, isBooked },
        backgroundColor: isBooked ? "#ef4444" : "#34d399",
        borderColor: isBooked ? "#ef4444" : "#34d399",
        textColor: "white",
        classNames: [isBooked ? "booked-slot" : "available-slot"],
      });
    });
  });

  return events;
}

function getEventDate(day, time) {
  const daysOfWeek = {
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
    Sunday: 0,
  };

  const [hours, minutes, period] = time.match(/(\d+):(\d+) (AM|PM)/).slice(1);
  let hour = parseInt(hours, 10);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;

  const today = new Date();
  const currentDay = today.getDay();
  const targetDay = daysOfWeek[day];
  const daysDiff = (targetDay - currentDay + 7) % 7 || 7;

  const eventDate = new Date(today);
  eventDate.setDate(today.getDate() + daysDiff);
  eventDate.setHours(hour, parseInt(minutes, 10), 0, 0);
  return eventDate;
}

function handleEventClick(info) {
  const { day, time, isBooked } = info.event.extendedProps;
  if (!isBooked) {
    openBookingModal(day, time);
  }
}

function openBookingModal(day, time) {
  selectedDay.value = day;
  selectedTime.value = time;
  showModal.value = true;
}

function confirmBooking() {
  store.dispatch("bookSlot", {
    doctorId: doctor.value.id,
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
:deep(.fc .fc-event) {
  cursor: pointer;
}
:deep(.booked-slot) {
  cursor: not-allowed;
}
</style>