<template>
  <div id="app">
    <header>
      <div class="header-content">
        <img src="@/assets/logo.png" alt="Health Slot Logo" class="logo" />
      </div>
    </header>
    <main>
      <router-view />
    </main>
  </div>
</template>

<script setup>
// No script logic needed since this is a layout component
// Using <script setup> for consistency with other components
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
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
}

.logo {
  height: 60px;
  width: auto;
  object-fit: contain;
}

h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #00a3e0;
  font-weight: 500;
}

main {
  padding: 1rem;
}
</style>