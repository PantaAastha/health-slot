<template>
  <router-link :to="`/doctor/${doctor.id}`" class="doctor-card">
    <div class="doctor-avatar">
      <i class="fas fa-user-md"></i>
    </div>
    <div class="doctor-info">
      <h2><i class="fas fa-stethoscope"></i> {{ doctor.name }}</h2>
      <p><i class="fas fa-user-tag"></i> {{ doctor.speciality }}</p>
      <button class="view-schedule">
        <i class="fas fa-calendar-alt"></i> View Schedule
      </button>
    </div>
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
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  text-decoration: none;
  color: #333;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.doctor-avatar {
  width: 80px;
  height: 80px;
  background: #e6f7ff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.doctor-avatar i {
  font-size: 2.5rem;
  color: #00a3e0;
}

.doctor-info {
  text-align: center;
  width: 100%;
}

h2 {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  color: #1a365d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

h2 i {
  color: #00a3e0;
  font-size: 1rem;
}

p {
  margin: 0 0 1.25rem 0;
  color: #4a5568;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

p i {
  color: #718096;
}

.view-schedule {
  background: #00a3e0;
  color: white;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.2s ease;
}

.view-schedule:hover {
  background: #008dc2;
}
</style>