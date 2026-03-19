<template>
  <div class="app-shell">
    <header v-if="showBackHeader" class="app-header">
      <router-link to="/" class="back-link" aria-label="Kembali ke home">
        <span class="back-icon">←</span>
      </router-link>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const showBackHeader = computed(() => {
  return route.path !== '/' && !route.path.includes('/wedding-invitation/preview');
});
</script>

<style>
:root {
  --bg: #0f172a;
  --card: #1e293b;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --green: #25D366;
  --green-dim: #1da851;
  --wedding-accent: #e879f9;
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.5;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  background: var(--card);
  border-bottom: 1px solid #334155;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  color: var(--text);
  text-decoration: none;
  border-radius: 8px;
}

.back-link:hover {
  background: #334155;
  color: var(--green);
}

.back-icon {
  font-size: 1.5rem;
  line-height: 1;
}

.app-main {
  flex: 1;
}
</style>
