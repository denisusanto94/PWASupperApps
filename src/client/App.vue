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
        
        <!-- Sync Status -->
        <div class="sync-indicator-box" :title="`Terakhir Sinkron: ${syncStatus.lastSync ? new Date(syncStatus.lastSync).toLocaleString() : 'Belum pernah'}`">
           <svg :class="{ spinning: syncStatus.activeCount > 0 }" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" :color="syncStatus.activeCount > 0 ? '#00a884' : '#94a3b8'"><path d="M21.5 2v6h-6M2.5 22v-6h6M2 12c0-4.4 3.6-8 8-8 3.3 0 6.2 2 7.4 4.9M22 12c0 4.4-3.6 8-8 8-3.3 0-6.2-2-7.4-4.9"/></svg>
        </div>
      </div>
    </header>
    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount } from 'vue';
import { useRoute } from 'vue-router';
import { toastState } from './toast.js';
import PouchDB from 'pouchdb-browser';
import { 
  ONLINE_GENERAL_DB_NAME, VERSION_DB_NAME, syncModule, syncStatus,
  CHAT_DB_NAME, CHAT_USERS_DB_NAME, ONLINE_CHAT_DB_NAME,
  GETLYNK_DB_NAME, GETLYNK_USERS_DB_NAME, WEDDING_DB_NAME,
  WEDDING_USERS_DB_NAME, TIMESTAMP_DB_NAME 
} from './db.js';

const route = useRoute();
const showBackHeader = computed(() => {
  return route.path !== '/' && !route.path.includes('/wedding-invitation/preview');
});

// App Metrics & Online Tracking
const clientId = localStorage.getItem('pwa_client_id') || `client_${Math.random().toString(36).slice(2, 11)}`;
localStorage.setItem('pwa_client_id', clientId);
const APP_VERSION = '1.0.5-vault-secure';

let globalHeartbeat = null;

onMounted(async () => {
  const onlineDb = new PouchDB(ONLINE_GENERAL_DB_NAME);
  const versionDb = new PouchDB(VERSION_DB_NAME);
  
  syncModule(onlineDb, ONLINE_GENERAL_DB_NAME);
  syncModule(versionDb, VERSION_DB_NAME);

  // Set Version
  try {
    let vDoc;
    try { vDoc = await versionDb.get('current_version'); } catch (e) { vDoc = { _id: 'current_version' }; }
    vDoc.version = APP_VERSION;
    vDoc.updatedAt = new Date().toISOString();
    await versionDb.put(vDoc);
  } catch (e) {}

  // Heartbeat function
  const ping = async () => {
    try {
      let doc;
      try { doc = await onlineDb.get(clientId); } catch (e) { doc = { _id: clientId }; }
      doc.lastSeen = Date.now();
      doc.type = 'general_presence';
      await onlineDb.put(doc);
    } catch (e) {}
  };

  ping();
  globalHeartbeat = setInterval(ping, 30000);
});

onBeforeUnmount(() => {
  if (globalHeartbeat) clearInterval(globalHeartbeat);
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

.global-toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 10001 !important;
  padding: 1.1rem 1.75rem;
  text-align: center;
  font-weight: 800;
  color: #fff;
  font-size: 1.05rem;
  box-shadow: 0 15px 35px rgba(0,0,0,0.6);
  letter-spacing: 0.03em;
  text-transform: uppercase;
  pointer-events: none; /* Let clicks pass through if covered */
}

/* Vibrancy override */
.global-toast.success { background: #00a884 !important; }
.global-toast.error { background: #f43f5e !important; }
.global-toast.info { background: #3b82f6 !important; }
.global-toast.warning { background: #f59e0b !important; }

.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.45s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from, .toast-slide-leave-to {
  transform: translateY(-100%);
  opacity: 0;
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
  height: 56px;
  background: rgba(30, 41, 59, 0.85);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: sticky;
  top: 0;
  z-index: 9999;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
}

.app-header-container {
  display: flex;
  align-items: center;
  padding: 0 1.25rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  gap: 1rem;
}

.header-portal {
  flex-grow: 1;
  display: flex;
  align-items: center;
  min-width: 0;
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

.header-toolbelt { display: flex; align-items: center; gap: 0.75rem; }
.tool-btn { background: rgba(255, 255, 255, 0.05); border: none; color: #94a3b8; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s; }
.tool-btn:hover { background: rgba(244, 63, 94, 0.1); color: #f43f5e; }
.tool-btn.danger:hover { background: #f43f5e; color: #fff; transform: rotate(90deg); }

.sync-indicator-box { display: flex; align-items: center; justify-content: center; width: 32px; height: 32px; border-radius: 50%; background: rgba(255, 255, 255, 0.05); cursor: help; transition: 0.2s; }
.sync-indicator-box:hover { background: rgba(255, 255, 255, 0.1); }
.spinning { animation: spin 1.5s linear infinite; }
@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.app-main {
  flex: 1;
}
</style>
