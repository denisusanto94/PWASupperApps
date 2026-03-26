<template>
  <div class="app-shell">
    <Transition name="toast-slide">
      <div v-if="toastState.show" class="global-toast" :class="toastState.type">
        {{ toastState.message }}
      </div>
    </Transition>

    <header v-if="appHeaderVisible" class="app-header">
      <div class="app-header-container">
        <router-link v-if="route.path !== '/'" to="/" class="back-link" aria-label="Kembali ke home">
          <span class="back-icon">←</span>
        </router-link>
        
        <div v-else class="header-brand-placeholder">
           <h2 class="mini-brand">PWA<span>Supper</span></h2>
        </div>
        
        <div id="app-header-portal" class="header-portal"></div>
        
        <!-- User Info & Navigation -->
        <div class="user-nav">
          <!-- Logged In State -->
          <template v-if="authState.user">
            <router-link v-if="authState.user?.role === 'admin'" to="/admin" class="nav-icon-link" title="Admin Panel">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
            </router-link>

            <router-link to="/instant-chat" class="nav-icon-link nav-message-link" title="Pesan">
              <span class="nav-message-wrap">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <span v-if="chatUnreadCount > 0" class="nav-message-badge">{{ chatUnreadBadge }}</span>
              </span>
            </router-link>

            <div class="user-profile-menu">
              <div class="user-info">
                <span class="user-name-label">{{ authState.user?.full_name || 'User' }}</span>
                <div class="avatar-mini" :style="{ background: '#00a884' }">
                  {{ (authState.user?.full_name || 'U').charAt(0) }}
                </div>
              </div>
              
              <button @click="handleLogout" class="logout-btn" title="Logout">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              </button>
            </div>
          </template>

          <!-- Anonymous State -->
          <template v-else>
            <router-link to="/login" class="login-pill-btn">
              <span>Login</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M13.8 12H3"/></svg>
            </router-link>
          </template>
        </div>
      </div>
    </header>

    <main class="app-main">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, watch, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toastState, showToast } from './toast.js';
import { authState, setAuth, apiFetch, getModuleData, countInstantChatUnread } from './db.js';

const route = useRoute();
const router = useRouter();

const chatUnreadCount = ref(0);
const chatUnreadBadge = computed(() =>
  chatUnreadCount.value > 99 ? '99+' : String(chatUnreadCount.value)
);
let chatUnreadPoll = null;

async function pollChatUnread() {
  if (!authState.user?.id || !authState.user?.email) {
    chatUnreadCount.value = 0;
    return;
  }
  try {
    const rows = await getModuleData('instant_chat');
    if (!Array.isArray(rows)) {
      chatUnreadCount.value = 0;
      return;
    }
    chatUnreadCount.value = countInstantChatUnread(rows, authState.user.email, authState.user.id);
  } catch {
    chatUnreadCount.value = 0;
  }
}

function startChatUnreadPoll() {
  stopChatUnreadPoll();
  if (!authState.user?.id || !authState.user?.email) return;
  pollChatUnread();
  chatUnreadPoll = setInterval(pollChatUnread, 4000);
}

function stopChatUnreadPoll() {
  if (chatUnreadPoll) {
    clearInterval(chatUnreadPoll);
    chatUnreadPoll = null;
  }
}

function onChatReadUpdated() {
  pollChatUnread();
}

const appHeaderVisible = computed(() => {
  if (route.path === '/login') return false;
  if (route.path.includes('/wedding-invitation/preview')) return false;
  // Always show on home and other pages
  return true;
});

// Cache Busting / Version Check
const checkVersion = async () => {
  try {
    const res = await fetch('/version.json?t=' + Date.now());
    const data = await res.json();
    const currentVersion = localStorage.getItem('app_version');
    
    if (currentVersion && currentVersion !== String(data.timestamp)) {
       console.log('🔄 New version detected, reloading...');
       localStorage.setItem('app_version', String(data.timestamp));
       window.location.reload(true);
    } else {
       localStorage.setItem('app_version', String(data.timestamp));
    }
  } catch (e) {
    console.warn('Version check failed', e);
  }
};

const handleLogout = async () => {
  if (authState.user) {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
  }
  setAuth(null, null, false);
  if (route.path !== '/') router.push('/');
};

// --- IDLE AUTO-LOGOUT (30 MINUTES) ---
let idleTimer = null;
const IDLE_TIMEOUT = 30 * 60 * 1000;
const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];

const resetIdleTimer = () => {
  if (idleTimer) clearTimeout(idleTimer);
  if (authState.user) {
    idleTimer = setTimeout(() => {
      showToast('Sesi ditutup karena idle selama 30 menit', 'info');
      handleLogout();
    }, IDLE_TIMEOUT);
  }
};

onMounted(() => {
  checkVersion();
  setInterval(checkVersion, 5 * 60 * 1000);

  activityEvents.forEach(ev => window.addEventListener(ev, resetIdleTimer));
  resetIdleTimer();

  window.addEventListener('pwa-instant-chat-read-updated', onChatReadUpdated);
  if (authState.user?.id) startChatUnreadPoll();
});

onBeforeUnmount(() => {
  activityEvents.forEach(ev => window.removeEventListener(ev, resetIdleTimer));
  if (idleTimer) clearTimeout(idleTimer);
  stopChatUnreadPoll();
  window.removeEventListener('pwa-instant-chat-read-updated', onChatReadUpdated);
});

watch(() => authState.user, (newVal) => {
  if (newVal) {
    resetIdleTimer();
    startChatUnreadPoll();
  } else {
    if (idleTimer) clearTimeout(idleTimer);
    stopChatUnreadPoll();
    chatUnreadCount.value = 0;
  }
});
</script>

<style>
:root {
  --bg: #020617;
  --card: #1e293b;
  --text: #f8fafc;
  --muted: #94a3b8;
  --green: #00a884;
  --primary: #3b82f6;
  --radius: 16px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
}

.app-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-portal {
  flex-grow: 1;
}

.app-header {
  height: 64px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
}

.app-header-container {
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  gap: 1.5rem;
}

.header-brand-placeholder {
  display: flex;
  align-items: center;
}

.mini-brand {
  font-size: 1.15rem;
  font-weight: 800;
  color: white;
  margin: 0;
}

.mini-brand span {
  color: #00a884;
}

.back-link {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #94a3b8;
  text-decoration: none;
  transition: all 0.2s;
}

.back-link:hover {
  background: rgba(255, 255, 255, 0.08);
  color: white;
  transform: translateX(-2px);
}

.user-nav {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.nav-icon-link {
  color: #94a3b8;
  transition: 0.2s;
  display: flex;
}

.nav-icon-link:hover {
  color: #3b82f6;
  transform: translateY(-1px);
}

.nav-message-link {
  position: relative;
}

.nav-message-wrap {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-message-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #f43f5e;
  color: #fff;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.95);
}

.user-profile-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(255, 255, 255, 0.03);
  padding: 0.35rem 0.35rem 0.35rem 1rem;
  border-radius: 100px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-name-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #e2e8f0;
}

.avatar-mini {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 800;
  color: white;
}

.logout-btn {
  background: rgba(244, 63, 94, 0.1);
  color: #f43f5e;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.logout-btn:hover {
  background: #f43f5e;
  color: white;
}

.login-pill-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1.25rem;
  background: var(--green);
  color: white;
  text-decoration: none;
  border-radius: 100px;
  font-size: 0.9rem;
  font-weight: 700;
  transition: all 0.2s;
  box-shadow: 0 4px 12px rgba(0, 168, 132, 0.25);
}

.login-pill-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 15px rgba(0, 168, 132, 0.35);
  filter: brightness(1.05);
}

/* Global Toast Styles */
.global-toast {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10001;
  padding: 0.75rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.global-toast.success { background: #00a884; color: white; }
.global-toast.error { background: #f43f5e; color: white; }
.global-toast.info { background: #3b82f6; color: white; }

.toast-slide-enter-active, .toast-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.toast-slide-enter-from, .toast-slide-leave-to {
  transform: translate(-50%, -2rem);
  opacity: 0;
}

.app-main {
  flex: 1;
}
</style>

