<template>
  <button
    :disabled="disabled"
    @click="$emit('book', time)"
    :class="{ available: !disabled, booked: disabled }"
  >
    {{ time }}
  </button>
</template>

<script setup>
import { defineProps, defineEmits } from "vue";

defineProps({
  time: {
    type: String,
    required: true,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

defineEmits(["book"]);
</script>

<style scoped>
button {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  margin: 0.25rem;
}
.available {
  background: #34d399; /* Green for available */
  color: white;
}
.booked {
  background: #d1d5db; /* Gray for booked */
  color: #333;
  cursor: not-allowed;
}
button:hover:not(:disabled) {
  background: #2cb082; /* Darker green on hover */
}
</style>