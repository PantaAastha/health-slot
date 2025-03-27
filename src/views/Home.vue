<template>
  <div class="container">
    <h1>Welcome, {{ user.name || "Guest" }}!</h1>
    <p>Choose a doctor to see their available times.</p>
    <div class="doctor-list">
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
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
}
.doctor-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
</style>