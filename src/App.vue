<template>
  <div id="app">
    <header>
      <h1>Health Slot</h1>
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
  background: #00a3e0;
  color: white;
  padding: 1rem;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
h1 {
  margin: 0;
  font-size: 1.5rem;
}
main {
  padding: 1rem;
}
</style>