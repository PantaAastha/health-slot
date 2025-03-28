<template>
  <div id="app">
    <header>
      <div class="header-content">
        <div class="header-left"></div>
        <div class="header-center">
          <img src="@/assets/logo.png" alt="Health Slot Logo" class="logo" />
        </div>
        <div class="header-right">
          <button v-if="user.name" @click="handleLogout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i>
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useStore } from "vuex";
import { useRouter } from "vue-router";

const store = useStore();
const router = useRouter();

const user = computed(() => store.getters.user);

const handleLogout = () => {
  store.dispatch("logout");
  router.push("/");
};
</script>

<style scoped>
#app {
  font-family: "Roboto", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  background: #f9fafb;
  min-height: 100vh;
}

header {
  background: white;
  padding: 0.5rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 1rem;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
}

.header-left {
  justify-content: flex-start;
}

.header-right {
  justify-content: flex-end;
}

.header-center {
  display: flex;
  justify-content: center;
  align-items: center;
}

.logo {
  height: 60px;
  width: auto;
  object-fit: contain;
}

.logout-btn {
  background: #f3f4f6;
  color: #4b5563;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #e5e7eb;
  color: #111827;
}

.logout-btn i {
  font-size: 0.875rem;
}

main {
  padding: 1rem;
}

/* Mobile styles */
@media (max-width: 768px) {
  header {
    padding: 0.5rem 1rem;
  }

  .logo {
    height: 40px;
  }

  .logout-btn {
    padding: 0.375rem 0.75rem;
    font-size: 0.875rem;
  }

  .logout-btn span {
    display: none;
  }
}
</style>