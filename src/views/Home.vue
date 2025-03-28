<template>
  <div class="container">
    <div class="header">
      <h2>Welcome, {{ user.name || "Guest" }}!</h2>
      <p>
        <i class="fas fa-info-circle"></i> Choose a doctor to see their
        available times.
      </p>
    </div>
    <div class="doctor-grid">
      <DoctorCard v-for="doctor in doctors" :key="doctor.id" :doctor="doctor" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useStore } from "vuex";
import DoctorCard from "../components/DoctorCard.vue";

const store = useStore();
const doctors = ref([]);

const user = store.getters.user;

onMounted(async () => {
  await store.dispatch("loadDoctors");
  doctors.value = store.state.doctors;
});
</script>

<style scoped>
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0.25rem;
}

.header {
  text-align: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #1a365d;
  margin-bottom: 0.5rem;
}

.header i {
  color: #00a3e0;
  margin-right: 0.5rem;
}

.header p {
  color: #4a5568;
  font-size: 1.1rem;
}

.doctor-grid {
  display: grid;
  gap: 1.5rem;
  /* Mobile first - single column */
  grid-template-columns: 1fr;
}

/* Tablet view - 2 columns */
@media (min-width: 640px) {
  .doctor-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* Desktop view - 3 columns */
@media (min-width: 1024px) {
  .doctor-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Add some animation to the grid items */
:deep(.doctor-card) {
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

:deep(.doctor-card:hover) {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
</style>