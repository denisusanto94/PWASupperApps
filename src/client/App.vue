<template>
  <div class="app-shell">
    <Transition name="toast-slide">
      <div v-if="toastState.show" class="global-toast" :class="toastState.type">
        {{ toastState.message }}
      </div>
    </Transition>

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
import { toastState } from './toast.js';

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

.global-toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 9999;
  padding: 0.85rem 1.5rem;
  text-align: center;
  font-weight: 600;
  color: #fff;
  font-size: 0.95rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
}

.global-toast.success { background: #00a884; }
.global-toast.error { background: #ef4444; }
.global-toast.info { background: #3b82f6; }
.global-toast.warning { background: #f59e0b; }

.toast-slide-enter-active, .toast-slide-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
}
.toast-slide-enter-from, .toast-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
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

.app-main {
  flex: 1;
}
</style>
