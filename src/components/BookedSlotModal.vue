<template>
  <div v-show="show" class="modal-overlay">
    <div class="modal">
      <h2>Cancel Appointment</h2>
      <p>Doctor: {{ doctor?.name }}</p>
      <p>Day: {{ day }}</p>
      <p>Time: {{ time }}</p>
      <div class="modal-actions">
        <button @click="handleCancel" class="cancel-btn">
          Cancel Appointment
        </button>
        <button @click="$emit('close')" class="close-btn">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";
import { useStore } from "vuex";

const store = useStore();

const props = defineProps({
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
  bookingId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["close", "cancelled"]);

const handleCancel = () => {
  store.dispatch("cancelBooking", props.bookingId);
  emit("cancelled");
  emit("close");
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

.modal-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.cancel-btn,
.close-btn {
  padding: 0.75rem 1.5rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
}

.cancel-btn {
  background: #fee2e2;
  color: #dc2626;
  border: none;
}

.cancel-btn:hover {
  background: #fecaca;
}

.close-btn {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
}

.close-btn:hover {
  background: #e5e7eb;
}
</style> 