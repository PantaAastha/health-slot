<template>
  <div class="container">
    <h1>Welcome to Health Slot</h1>
    <p>We're here to help you book your appointment. Let's get started!</p>
    <form @submit.prevent="submitForm" class="welcome-form">
      <div class="form-group">
        <label for="name">Your Name</label>
        <input
          v-model="name"
          id="name"
          type="text"
          placeholder="Enter your name"
          required
        />
      </div>
      <div class="form-group">
        <label for="email">Your Email</label>
        <input
          v-model="email"
          id="email"
          type="email"
          placeholder="Enter your email"
          required
        />
      </div>
      <button type="submit" class="continue-btn" :disabled="isSubmitting">
        {{ isSubmitting ? "Please wait..." : "Continue" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

const router = useRouter();
const store = useStore();

const name = ref("");
const email = ref("");
const isSubmitting = ref(false);

async function submitForm() {
  if (isSubmitting.value) return;

  try {
    isSubmitting.value = true;
    // Save user info to store using the correct action name
    await store.dispatch("saveUser", {
      name: name.value,
      email: email.value,
    });

    // Redirect to home view
    router.push("/doctors");
  } catch (error) {
    console.error("Error submitting form:", error);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
.welcome-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 2rem;
}
.form-group {
  display: flex;
  flex-direction: column;
  text-align: left;
}
label {
  color: #6b7280;
  margin-bottom: 0.5rem;
}
input {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 1rem;
}
.continue-btn {
  background: #00a3e0;
  color: white;
  border-radius: 6px;
  padding: 0.75rem;
  border: none;
  font-size: 1rem;
  cursor: pointer;
}
</style>