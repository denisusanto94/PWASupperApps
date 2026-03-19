import { createApp } from 'vue';
import './tailwind.css';
import { registerSW } from 'virtual:pwa-register';
import App from './App.vue';
import router from './router';

const BUILD_TIMESTAMP = typeof __BUILD_TIMESTAMP__ !== 'undefined' ? __BUILD_TIMESTAMP__ : '0';
const clientTs = Number(BUILD_TIMESTAMP) || 0;

registerSW({ immediate: true });

async function checkForUpdates() {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    const serverTs = Number(data.timestamp) || 0;
    if (serverTs > clientTs) {
      window.dispatchEvent(new CustomEvent('pwasupperapps-update-available'));
    }
  } catch (_) {}
}

createApp(App).use(router).mount('#app');

if (clientTs > 0) {
  setTimeout(checkForUpdates, 8000);
  setInterval(checkForUpdates, 60 * 1000);
}
