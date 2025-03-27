<template>
  <div class="schedule-container">
    <DoctorHeader
      :doctor="doctor"
      :current-view="currentView"
      :start-date="startDate"
      :end-date="endDate"
      @prev="handlePrev"
      @next="handleNext"
      @view-change="handleViewChange"
      @book="showModal = true"
    />

    <div class="content">
      <div v-if="loading" class="loading">
        <div class="spinner"></div>
        <p>Loading schedule...</p>
      </div>
      <div v-else-if="doctor">
        <DoctorCalendar
          ref="calendar"
          :doctor="doctor"
          :booked-slots="store.getters.bookedSlots"
          :initial-view="currentView"
          :options="calendarOptions"
          @slot-selected="handleSlotSelected"
        />
      </div>
      <p v-else class="error">Doctor not found</p>
    </div>

    <BookingModal
      v-if="doctor"
      :show="showModal"
      :doctor="doctor"
      :day="selectedDay"
      :time="selectedTime"
      @close="showModal = false"
      @confirm="handleBookingConfirm"
    />

    <div class="toast-container">
      <transition-group name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="['toast', toast.type]"
        >
          <i :class="['fas', toastIcon(toast.type)]"></i>
          <span>{{ toast.message }}</span>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import DoctorHeader from "@/components/DoctorHeader.vue";
import DoctorCalendar from "@/components/DoctorCalendar.vue";
import BookingModal from "@/components/BookingModal.vue";

const store = useStore();
const route = useRoute();
const router = useRouter();
const calendar = ref(null);

const doctor = ref(null);
const loading = ref(true);
const showModal = ref(false);
const selectedDay = ref("");
const selectedTime = ref("");
const selectedSlotDate = ref(null);
const currentView = ref("timeGridWeek");
const startDate = ref(new Date());
const endDate = ref(new Date());
const toasts = ref([]);

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

function handleSlotSelected({ day, time, slotDate }) {
  if (!doctor.value) return;

  selectedDay.value = day;
  selectedTime.value = time;
  selectedSlotDate.value = slotDate;
  showModal.value = true;
}

async function handleBookingConfirm({ notify }) {
  if (!doctor.value || !selectedSlotDate.value) return;

  const slotDateStr = selectedSlotDate.value.toISOString().split("T")[0];

  try {
    await store.dispatch("bookSlot", {
      doctorId: doctor.value.id,
      date: slotDateStr,
      day: selectedDay.value,
      time: selectedTime.value,
      notify,
    });

    showModal.value = false;
    showToast(
      "success",
      `Appointment booked successfully${
        notify ? ". We'll notify you 30 minutes before." : "."
      }`
    );
  } catch (error) {
    showToast("error", "Failed to book appointment. Please try again.");
  }
}

function handleViewChange(view) {
  currentView.value = view;
  if (calendar.value) {
    const calendarApi = calendar.value.getApi();
    calendarApi.changeView(view);
    updateDateRange(calendarApi.view);
  }
}

function handlePrev() {
  if (calendar.value) {
    const calendarApi = calendar.value.getApi();
    calendarApi.prev();
    updateDateRange(calendarApi.view);
  }
}

function handleNext() {
  if (calendar.value) {
    const calendarApi = calendar.value.getApi();
    calendarApi.next();
    updateDateRange(calendarApi.view);
  }
}

function updateDateRange(view) {
  startDate.value = view.activeStart;
  endDate.value = view.activeEnd;
}

// Add calendar event handlers
function handleDatesSet(arg) {
  updateDateRange(arg.view);
}

const calendarOptions = computed(() => ({
  datesSet: handleDatesSet,
}));

function showToast(type, message) {
  const id = Date.now();
  toasts.value.push({ id, type, message });
  setTimeout(() => {
    toasts.value = toasts.value.filter((t) => t.id !== id);
  }, 5000);
}

function toastIcon(type) {
  return {
    success: "fa-check-circle",
    error: "fa-exclamation-circle",
    warning: "fa-exclamation-triangle",
    info: "fa-info-circle",
  }[type];
}
</script>

<style scoped>
.schedule-container {
  min-height: 100vh;
  background: #f9fafb;
  display: flex;
  flex-direction: column;
}

.content {
  flex: 1;
  padding: 1.5rem;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f4f6;
  border-top-color: #00a3e0;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.error {
  text-align: center;
  color: #ef4444;
  font-weight: 500;
}

.toast-container {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  width: 100%;
  max-width: 400px;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  font-weight: 500;
  pointer-events: auto;
}

.toast.success {
  background: #f0fdf4;
  border: 1px solid #dcfce7;
  color: #166534;
}

.toast.error {
  background: #fef2f2;
  border: 1px solid #fee2e2;
  color: #991b1b;
}

.toast.warning {
  background: #fffbeb;
  border: 1px solid #fef3c7;
  color: #92400e;
}

.toast.info {
  background: #f0f9ff;
  border: 1px solid #e0f2fe;
  color: #075985;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>