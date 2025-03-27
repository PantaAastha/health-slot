<template>
  <div class="container">
    <h1>{{ doctor?.name }}'s Schedule</h1>
    <p>{{ doctor?.speciality }} | Timezone: {{ doctor?.timezone }}</p>
    <div v-if="loading">Loading...</div>
    <div v-else-if="doctor">
      <div
        v-for="day in doctor.availability"
        :key="day.day"
        class="day-section"
      >
        <h3>{{ day.day }}</h3>
        <div class="time-slots">
          <TimeSlot
            v-for="slot in availableTimes(day)"
            :key="slot.time"
            :time="slot.time"
            :disabled="!slot.isAvailable"
            @book="openBookingModal(day.day, slot.time)"
          />
        </div>
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
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import TimeSlot from "../components/TimeSlot.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();

const doctor = ref(null);
const loading = ref(true);
const showModal = ref(false);
const selectedDay = ref("");
const selectedTime = ref("");
const notify = ref(false);

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

const availableTimes = (day) => {
  const bookedSlots = store.getters.bookedSlots.filter(
    (b) => b.doctorId === doctor.value?.id && b.day === day.day
  );
  return day.hours.map((time) => ({
    time,
    isAvailable: !bookedSlots.some((b) => b.time === time),
  }));
};

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
  router.push("/doctors");
}
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.day-section {
  margin: 1rem 0;
}
.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
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
}
.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
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
</style>