<template>
  <div v-show="show && doctor" class="modal-overlay">
    <div class="modal">
      <h2>Confirm Your Appointment</h2>
      <p>Doctor: {{ doctor?.name }}</p>
      <p>Day: {{ day }}</p>
      <p>Time: {{ time }}</p>
      <label>
        <input type="checkbox" v-model="notify" />
        Notify me 30 minutes before the appointment
      </label>
      <div class="modal-actions">
        <button @click="handleConfirm" class="confirm-btn">Confirm</button>
        <button @click="$emit('close')" class="cancel-btn">Cancel</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineProps, defineEmits } from "vue";

defineProps({
  show: {
    type: Boolean,
    required: true,
  },
  doctor: {
    type: Object,
    required: true,
  },
  day: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["close", "confirm"]);

const notify = ref(false);

const handleConfirm = () => {
  emit("confirm", { notify: notify.value });
};
</script>

<style scoped>
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
</style> 