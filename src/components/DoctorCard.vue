<template>
  <router-link :to="`/doctor/${doctor.id}`" class="doctor-card">
    <h2>{{ doctor.name }}</h2>
    <p>{{ doctor.speciality }}</p>
    <button class="view-schedule">View Schedule</button>
  </router-link>
</template>

<script setup>
import { defineProps } from "vue";

defineProps({
  doctor: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.doctor-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 1rem 0;
  text-decoration: none;
  color: #333;
  display: block;
  transition: transform 0.2s ease;
}
.doctor-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}
h2 {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  color: #333;
}
p {
  margin: 0 0 1rem 0;
  color: #6b7280;
  font-size: 1rem;
}
.view-schedule {
  background: #00a3e0;
  color: white;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}
.view-schedule:hover {
  background: #008dc2;
}
</style>