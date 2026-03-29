<template>
  <div class="app-shell">
    <Transition name="toast-slide">
      <div v-if="toastState.show" class="global-toast" :class="toastState.type">
        {{ toastState.message }}
      </div>
    </Transition>

    <header v-if="appHeaderVisible" class="app-header">
      <div class="app-header-container">
        <div class="header-left-slot">
          <router-link v-if="route.path !== '/'" to="/" class="back-link" aria-label="Kembali ke home">
            <span class="back-icon">←</span>
          </router-link>
          <div v-else class="header-brand-placeholder">
            <h2 class="mini-brand">PWA<span>Supper</span></h2>
          </div>
        </div>

        <div class="header-center-col" :class="{ 'hide-mobile-specific': shouldHideCenterMobile }">
          <Transition name="rtc-strip-fade">
            <div
              v-if="authState.user && rtcState.incomingCall"
              class="rtc-incoming-strip"
              :class="{ 'is-minimized': incomingCallBarMinimized }"
            >
              <template v-if="!incomingCallBarMinimized">
                <div class="rtc-incoming-pulse" aria-hidden="true" />
                <div
                  class="rtc-incoming-avatar"
                  :style="{ background: rtcAvatarColor(rtcState.incomingCall.from) }"
                >
                  {{ (rtcState.incomingCall.from || '?')[0].toUpperCase() }}
                </div>
                <div class="rtc-incoming-text">
                  <span class="rtc-incoming-label">Panggilan masuk</span>
                  <span class="rtc-incoming-sub">
                    {{ rtcState.incomingCall.callType === 'video' ? 'Video' : 'Suara' }} · {{ rtcState.incomingCall.from }}
                  </span>
                </div>
                <button
                  type="button"
                  class="rtc-incoming-icon-btn"
                  title="Sembunyikan (kecilkan)"
                  aria-label="Sembunyikan notifikasi panggilan"
                  @click="minimizeIncomingStrip"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <button type="button" class="rtc-btn-reject" @click="declineIncomingCall">Tolak</button>
                <button type="button" class="rtc-btn-accept" @click="acceptIncomingCall">Angkat</button>
              </template>
              <template v-else>
                <button
                  type="button"
                  class="rtc-incoming-chip"
                  @click="expandIncomingStrip"
                >
                  <span class="rtc-incoming-pulse rtc-incoming-pulse--sm" aria-hidden="true" />
                  <span class="rtc-chip-type">{{ rtcState.incomingCall.callType === 'video' ? 'Video' : 'Suara' }}</span>
                  <span class="rtc-chip-from">{{ rtcState.incomingCall.from }}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 15l-6-6-6 6"/></svg>
                </button>
                <button type="button" class="rtc-btn-reject rtc-btn-reject--sm" @click.stop="declineIncomingCall">Tolak</button>
                <button type="button" class="rtc-btn-accept rtc-btn-accept--sm" @click.stop="acceptIncomingCall">Angkat</button>
              </template>
            </div>
          </Transition>
          <div id="app-header-portal" class="header-portal"></div>
        </div>

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

            <div ref="notifWrapRef" class="nav-notif-wrap">
              <button
                type="button"
                class="nav-icon-link nav-notif-btn"
                title="Notifikasi"
                aria-label="Notifikasi"
                aria-haspopup="true"
                :aria-expanded="notifPanelOpen"
                @click.stop="toggleNotifPanel"
              >
                <span class="nav-notif-inner">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                  <span v-if="notifUnreadCount > 0" class="nav-notif-badge">{{ notifUnreadBadge }}</span>
                </span>
              </button>
              <Transition name="notif-panel-fade">
                <div v-if="notifPanelOpen" ref="notifPanelRef" class="nav-notif-panel" role="menu" @click.stop>
                  <div class="nav-notif-head">
                    <span class="nav-notif-title">Notifikasi</span>
                    <button
                      v-if="notifUnreadCount > 0"
                      type="button"
                      class="nav-notif-readall"
                      @click="markAllNotificationsRead"
                    >
                      Tandai dibaca
                    </button>
                  </div>
                  <div class="nav-notif-list">
                    <p v-if="notifLoading" class="nav-notif-empty">Memuat…</p>
                    <p v-else-if="!notifItems.length" class="nav-notif-empty">Tidak ada notifikasi.</p>
                    <button
                      v-for="it in notifItems"
                      :key="it.id"
                      type="button"
                      class="nav-notif-item"
                      :class="{ 'is-unread': !it.read_at }"
                      @click="openNotificationItem(it)"
                    >
                      <span class="nav-notif-item-title">{{ it.title }}</span>
                      <span class="nav-notif-item-body">{{ it.body }}</span>
                      <span class="nav-notif-item-time">{{ formatNotifTime(it.created_at) }}</span>
                    </button>
                  </div>
                </div>
              </Transition>
            </div>

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

    <!-- Panggilan aktif (semua halaman, di atas konten) -->
    <Transition name="fade">
      <div v-if="rtcState.activeCall" class="global-call-overlay-premium">
        <div class="global-call-canvas">
          <video ref="rtcRemoteVideoRef" autoplay playsinline class="global-remote-v"></video>
          <div class="global-local-v-wrap" v-show="rtcState.activeCall.callType === 'video'">
            <video ref="rtcLocalVideoRef" autoplay playsinline muted class="global-local-v"></video>
          </div>
          <div class="global-call-info">
            <div
              class="global-c-avatar"
              :style="{ background: rtcAvatarColor(rtcState.activeCall.other) }"
            >
              {{ (rtcState.activeCall.other || '?')[0].toUpperCase() }}
            </div>
            <h3>{{ rtcState.activeCall.other }}</h3>
            <p class="global-status-pulse">{{ rtcState.callStatus }}</p>
          </div>
          <div class="global-call-actions">
            <button type="button" @click="endActiveCall(true)" class="global-btn-hangup" title="Akhiri panggilan">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="2" x2="1" y2="22"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, watch, ref, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { toastState, showToast } from './toast.js';
import { authState, setAuth, apiFetch, getModuleData, countInstantChatUnread } from './db.js';
import {
  rtcState,
  incomingCallBarMinimized,
  processRtcSignalsFromResults,
  acceptIncomingCall,
  declineIncomingCall,
  endActiveCall,
  registerRtcVideoElements,
  resetRtcOnLogout,
} from './instantChatRtc.js';

const route = useRoute();
const router = useRouter();

const rtcLocalVideoRef = ref(null);
const rtcRemoteVideoRef = ref(null);

function rtcAvatarColor(name) {
  if (!name) return '#2a3942';
  const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981'];
  let h = 0;
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
}

function minimizeIncomingStrip() {
  incomingCallBarMinimized.value = true;
}

function expandIncomingStrip() {
  incomingCallBarMinimized.value = false;
}

const chatUnreadCount = ref(0);
const chatUnreadBadge = computed(() =>
  chatUnreadCount.value > 99 ? '99+' : String(chatUnreadCount.value)
);
let chatUnreadPoll = null;

const notifWrapRef = ref(null);
const notifPanelRef = ref(null);
const notifPanelOpen = ref(false);
const notifUnreadCount = ref(0);
const notifItems = ref([]);
const notifLoading = ref(false);
const notifUnreadBadge = computed(() =>
  notifUnreadCount.value > 99 ? '99+' : String(notifUnreadCount.value)
);
let notifPoll = null;

function formatNotifTime(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '';
  }
}

function onDocClickNotif(e) {
  if (!notifPanelOpen.value) return;
  const el = notifWrapRef.value;
  if (el && !el.contains(e.target)) notifPanelOpen.value = false;
}

async function pollNotifUnread() {
  if (!authState.user?.id) {
    notifUnreadCount.value = 0;
    return;
  }
  try {
    const res = await apiFetch('/api/notifications?summary=1');
    const j = await res.json();
    if (res.ok) notifUnreadCount.value = Number(j.unread_count || 0);
  } catch {
    notifUnreadCount.value = 0;
  }
}

function startNotifPoll() {
  stopNotifPoll();
  if (!authState.user?.id) return;
  pollNotifUnread();
  notifPoll = setInterval(pollNotifUnread, 5000);
}

function stopNotifPoll() {
  if (notifPoll) {
    clearInterval(notifPoll);
    notifPoll = null;
  }
}

async function toggleNotifPanel() {
  notifPanelOpen.value = !notifPanelOpen.value;
  if (notifPanelOpen.value) await loadNotificationsFull();
}

async function loadNotificationsFull() {
  notifLoading.value = true;
  try {
    const res = await apiFetch('/api/notifications');
    const j = await res.json();
    if (res.ok) {
      notifUnreadCount.value = Number(j.unread_count || 0);
      notifItems.value = Array.isArray(j.items) ? j.items : [];
    }
  } catch {
    notifItems.value = [];
  } finally {
    notifLoading.value = false;
  }
}

async function markAllNotificationsRead() {
  try {
    const res = await apiFetch('/api/notifications/read-all', { method: 'POST' });
    if (res.ok) {
      notifUnreadCount.value = 0;
      await loadNotificationsFull();
    }
  } catch {
    /* ignore */
  }
}

async function openNotificationItem(it) {
  try {
    if (!it.read_at) {
      await apiFetch(`/api/notifications/${it.id}/read`, { method: 'PATCH' });
    }
  } catch {
    /* ignore */
  }
  const d = it.data;
  if (d?.room_code && it.type === 'meeting_invite') {
    notifPanelOpen.value = false;
    router.push(`/vconference/room/${d.room_code}`);
    await nextTick();
    pollNotifUnread();
    return;
  }
  notifPanelOpen.value = false;
  pollNotifUnread();
}

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
    await processRtcSignalsFromResults(rows);
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

const hideCenterMobilePages = [
  '/instant-chat',
  '/getlynkid',
  '/wedding-invitation',
  '/timestamp-camera',
  '/wab-blaster'
];
const shouldHideCenterMobile = computed(() => hideCenterMobilePages.includes(route.path));

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
  resetRtcOnLogout();
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
  window.addEventListener('pwa-notifications-changed', pollNotifUnread);
  document.addEventListener('click', onDocClickNotif);
  if (authState.user?.id) {
    startChatUnreadPoll();
    startNotifPoll();
  }
});

onBeforeUnmount(() => {
  activityEvents.forEach(ev => window.removeEventListener(ev, resetIdleTimer));
  if (idleTimer) clearTimeout(idleTimer);
  stopChatUnreadPoll();
  stopNotifPoll();
  window.removeEventListener('pwa-instant-chat-read-updated', onChatReadUpdated);
  window.removeEventListener('pwa-notifications-changed', pollNotifUnread);
  document.removeEventListener('click', onDocClickNotif);
});

watch(() => authState.user, (newVal) => {
  if (newVal) {
    resetIdleTimer();
    startChatUnreadPoll();
    startNotifPoll();
  } else {
    if (idleTimer) clearTimeout(idleTimer);
    stopChatUnreadPoll();
    stopNotifPoll();
    chatUnreadCount.value = 0;
    notifUnreadCount.value = 0;
    notifItems.value = [];
    notifPanelOpen.value = false;
    resetRtcOnLogout();
  }
});

watch(
  [rtcLocalVideoRef, rtcRemoteVideoRef, () => rtcState.activeCall],
  () => {
    registerRtcVideoElements(rtcLocalVideoRef.value, rtcRemoteVideoRef.value);
  },
  { flush: 'post' }
);
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
  width: 100%;
  flex-grow: 0;
}

.app-header {
  min-height: 64px;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  position: sticky;
  top: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0.35rem 0;
}

.app-header-container {
  display: flex;
  align-items: center;
  padding: 0 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  gap: 1rem;
}

.header-left-slot {
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.header-center-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
}

@media (max-width: 1023px) {
  .app-header-container {
    padding: 0 1rem;
    gap: 0.75rem;
    justify-content: space-between;
  }
  .header-center-col.hide-mobile-specific {
    display: none !important;
  }
  .user-nav {
    margin-left: auto;
    gap: 0.85rem;
  }
  .user-name-label {
    display: none;
  }
  .user-profile-menu {
    padding: 0.25rem;
    gap: 0.35rem;
  }
}

.rtc-strip-fade-enter-active,
.rtc-strip-fade-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.rtc-strip-fade-enter-from,
.rtc-strip-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}

.rtc-incoming-strip {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  max-width: min(100%, 520px);
  padding: 0.35rem 0.5rem 0.35rem 0.65rem;
  background: linear-gradient(135deg, rgba(30, 41, 59, 0.95), rgba(15, 23, 42, 0.98));
  border: 1px solid rgba(0, 168, 132, 0.35);
  border-radius: 999px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.04) inset;
  z-index: 2;
}

/* Mobile & tablet: bar panggilan di bawah app-header (bukan di tengah bar header) */
@media (max-width: 1023px) {
  .rtc-incoming-strip {
    position: fixed;
    left: max(0.75rem, env(safe-area-inset-left, 0px));
    right: max(0.75rem, env(safe-area-inset-right, 0px));
    top: calc(env(safe-area-inset-top, 0px) + 4.75rem);
    max-width: none;
    width: auto;
    z-index: 1002;
    flex-wrap: wrap;
    row-gap: 0.3rem;
    justify-content: center;
    padding: 0.45rem 0.65rem;
    border-radius: 1rem;
    box-shadow:
      0 4px 24px rgba(0, 0, 0, 0.45),
      0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  }

  .rtc-incoming-sub {
    max-width: min(240px, 55vw);
  }

  .rtc-incoming-chip {
    max-width: min(200px, 50vw);
  }
}

.rtc-incoming-strip.is-minimized {
  padding: 0.25rem 0.4rem;
  gap: 0.35rem;
}

.rtc-incoming-pulse {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #00a884;
  flex-shrink: 0;
  animation: rtc-pulse-dot 1.2s ease-in-out infinite;
  box-shadow: 0 0 12px rgba(0, 168, 132, 0.8);
}

.rtc-incoming-pulse--sm {
  width: 8px;
  height: 8px;
}

@keyframes rtc-pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(0.85); }
}

.rtc-incoming-avatar {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 800;
  color: #fff;
  flex-shrink: 0;
}

.rtc-incoming-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
  text-align: left;
}

.rtc-incoming-label {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #00a884;
  line-height: 1.2;
}

.rtc-incoming-sub {
  font-size: 0.72rem;
  color: #cbd5e1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
}

@media (min-width: 1024px) {
  .rtc-incoming-sub { max-width: 280px; }
}

.rtc-incoming-icon-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.06);
  color: #94a3b8;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, color 0.2s;
}

.rtc-incoming-icon-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
}

.rtc-btn-reject {
  flex-shrink: 0;
  padding: 0 0.85rem;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(244, 63, 94, 0.35);
  background: rgba(244, 63, 94, 0.12);
  color: #fda4af;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.rtc-btn-reject:hover {
  background: rgba(244, 63, 94, 0.22);
}

.rtc-btn-reject--sm {
  height: 30px;
  padding: 0 0.65rem;
  font-size: 0.7rem;
}

.rtc-btn-accept {
  flex-shrink: 0;
  padding: 0 0.95rem;
  height: 34px;
  border-radius: 999px;
  border: none;
  background: linear-gradient(135deg, #00a884, #059669);
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(0, 168, 132, 0.35);
  transition: filter 0.2s, transform 0.15s;
}

.rtc-btn-accept:hover {
  filter: brightness(1.08);
  transform: scale(1.02);
}

.rtc-btn-accept--sm {
  height: 30px;
  padding: 0 0.7rem;
  font-size: 0.7rem;
}

.rtc-incoming-chip {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  max-width: min(180px, 45vw);
  padding: 0.2rem 0.5rem 0.2rem 0.35rem;
  border: none;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.06);
  color: #e2e8f0;
  font-size: 0.7rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}

.rtc-incoming-chip:hover {
  background: rgba(255, 255, 255, 0.1);
}

.rtc-chip-type {
  color: #00a884;
  font-weight: 800;
  flex-shrink: 0;
}

.rtc-chip-from {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}

.global-call-overlay-premium {
  position: fixed;
  inset: 0;
  background: #090e11;
  z-index: 9500;
  display: flex;
  align-items: center;
  justify-content: center;
}

.global-call-canvas {
  position: relative;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.global-remote-v {
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: #111b21;
}

.global-local-v-wrap {
  position: absolute;
  bottom: 100px;
  right: 20px;
  width: 120px;
  height: 180px;
  background: #000;
  border-radius: 16px;
  overflow: hidden;
  border: 2px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  z-index: 10;
}

.global-local-v {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.global-call-info {
  position: absolute;
  top: 10%;
  text-align: center;
  width: 100%;
  z-index: 5;
}

.global-c-avatar {
  width: 100px;
  height: 100px;
  border-radius: 30px;
  margin: 0 auto 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: #fff;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.global-call-info h3 {
  color: #fff;
  font-size: 1.8rem;
  font-weight: 800;
  margin: 0 0 0.5rem;
}

.global-status-pulse {
  color: #00a884;
  font-weight: 700;
  letter-spacing: 0.1em;
  margin: 0;
  animation: global-pulse-status 2s infinite;
}

@keyframes global-pulse-status {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

.global-call-actions {
  position: absolute;
  bottom: 40px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 2rem;
  z-index: 20;
}

.global-btn-hangup {
  width: 70px;
  height: 70px;
  background: #f43f5e;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 10px 25px rgba(244, 63, 94, 0.4);
  transition: 0.2s;
}

.global-btn-hangup:hover {
  transform: scale(1.1);
  background: #e11d48;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
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

.nav-notif-wrap {
  position: relative;
}

.nav-notif-btn {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
}

.nav-notif-inner {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.nav-notif-badge {
  position: absolute;
  top: -6px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #f59e0b;
  color: #0f172a;
  font-size: 0.65rem;
  font-weight: 800;
  line-height: 18px;
  text-align: center;
  box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.95);
}

.nav-notif-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  width: min(360px, calc(100vw - 2rem));
  max-height: min(420px, 70vh);
  background: rgba(15, 23, 42, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.45);
  z-index: 1100;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.nav-notif-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.65rem 0.85rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.nav-notif-title {
  font-weight: 800;
  font-size: 0.85rem;
  color: #f8fafc;
}

.nav-notif-readall {
  background: none;
  border: none;
  color: #38bdf8;
  font-size: 0.75rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0.2rem 0;
}

.nav-notif-readall:hover {
  text-decoration: underline;
}

.nav-notif-list {
  overflow-y: auto;
  max-height: 340px;
}

.nav-notif-empty {
  margin: 0;
  padding: 1.25rem;
  color: #64748b;
  font-size: 0.85rem;
  text-align: center;
}

.nav-notif-item {
  width: 100%;
  text-align: left;
  padding: 0.75rem 0.85rem;
  border: none;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  background: transparent;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  transition: background 0.15s;
}

.nav-notif-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.nav-notif-item.is-unread {
  background: rgba(245, 158, 11, 0.06);
}

.nav-notif-item-title {
  font-size: 0.82rem;
  font-weight: 800;
  color: #e2e8f0;
}

.nav-notif-item-body {
  font-size: 0.78rem;
  color: #94a3b8;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 3;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.nav-notif-item-time {
  font-size: 0.68rem;
  color: #64748b;
}

.notif-panel-fade-enter-active,
.notif-panel-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.notif-panel-fade-enter-from,
.notif-panel-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
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

