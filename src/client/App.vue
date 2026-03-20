<template>
  <div class="app-shell">
    <header v-if="showBackHeader" class="app-header">
      <div class="app-header-container">
        <router-link to="/" class="back-link" aria-label="Kembali ke home">
          <span class="back-icon">←</span>
        </router-link>
        <div id="app-header-portal" class="header-portal"></div>
      </div>
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
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 1000;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.app-header-container {
  display: flex;
  align-items: center;
  padding: 0.6rem 1.25rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  gap: 1.25rem;
}

.header-portal {
  flex-grow: 1;
  display: flex;
  align-items: center;
}

.back-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  color: var(--text);
  text-decoration: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.back-link:hover {
  background: rgba(37, 211, 102, 0.2);
  color: var(--green);
  transform: scale(1.1);
  box-shadow: 0 0 10px rgba(37, 211, 102, 0.3);
}

.back-icon {
  font-size: 1.1rem;
  font-weight: bold;
}

/* Common Header Styles for Teleported Content */
.getlynkid-header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: #25D366;
}

.header-tagline {
  font-size: 0.75rem;
  color: var(--muted);
}

.app-main {
  flex: 1;
}
</style>
