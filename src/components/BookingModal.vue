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
  padding: 1rem;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
  width: 100%;
  max-width: 400px;
  z-index: 1001;
}

h2 {
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  color: #111827;
}

p {
  margin: 0.75rem 0;
  color: #4b5563;
}

label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 1.5rem 0;
  color: #4b5563;
  justify-content: center;
}

.modal-actions {
  margin-top: 2rem;
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.confirm-btn,
.cancel-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-width: 120px;
}

.confirm-btn {
  background: #00a3e0;
  color: white;
  border: none;
}

.confirm-btn:hover {
  background: #0091c7;
}

.cancel-btn {
  background: #f3f4f6;
  color: #4b5563;
  border: 1px solid #e5e7eb;
}

.cancel-btn:hover {
  background: #e5e7eb;
}

/* Mobile styles */
@media (max-width: 768px) {
  .modal {
    padding: 1.5rem;
    margin: 1rem;
    max-height: calc(100vh - 2rem);
    overflow-y: auto;
  }

  h2 {
    font-size: 1.25rem;
    margin-bottom: 1rem;
  }

  .modal-actions {
    flex-direction: column;
    margin-top: 1.5rem;
  }

  .confirm-btn,
  .cancel-btn {
    width: 100%;
    min-width: auto;
  }
}
</style> 