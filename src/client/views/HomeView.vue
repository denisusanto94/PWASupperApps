<template>
  <div class="home-view">
    <div class="home-hero">
      <h1 class="home-title">PWA<span>Supper</span>Apps</h1>
      <p class="home-tagline">
        {{ authState.user ? 'Premium toolsuite for your productivity.' : 'All-in-one suite for your business and productivity.' }}
      </p>
    </div>


    <div class="app-grid">
      <!-- WA Blaster -->
      <div 
        class="menu-card icon-wa-card locked maintenance" 
      >
        <div class="icon-box whatsapp" style="filter: saturate(0.2) opacity(0.5);">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">WA Blaster</h3>
          <p class="card-desc text-amber-500 font-bold">Under Maintenance</p>
        </div>
      </div>

      <!-- GetLynk -->
      <div 
        @click="handleModuleClick('getlynkid')" 
        class="menu-card icon-link-card" 
        :class="{ locked: authState.isGuest && !authState.user }"
      >
        <div class="icon-box getlynk">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">getlynk.id</h3>
          <p class="card-desc">Digital bio & landing pages.</p>
        </div>
      </div>

      <!-- Instant Chat -->
      <div 
        @click="handleModuleClick('instant-chat')" 
        class="menu-card icon-chat-card" 
        :class="{ locked: authState.isGuest && !authState.user }"
      >
        <div class="icon-box chat">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">Instant Chat</h3>
          <p class="card-desc">Collaborate in real-time.</p>
        </div>
      </div>

      <!-- Wedding -->
      <div 
        @click="handleModuleClick('wedding-invitation')" 
        class="menu-card icon-wedding-card" 
        :class="{ locked: authState.isGuest && !authState.user }"
      >
        <div class="icon-box wedding">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.2 0 .4.08.54.22l.84.84.84-.84c.3-.3.78-.3 1.08 0 .15.14.24.34.24.54v1.5h1.5c.41 0 .75.34.75.75s-.34.75-.75.75h-1.5v.5c2.5.4 4.5 2.5 4.9 5h.6c.41 0 .75.34.75.75s-.34.75-.75.75h-.6c-.4 3.87-3.63 7-7.5 7s-7.1-3.13-7.5-7H2.75c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h.6c.4-2.5 2.4-4.6 4.9-5v-.5H6.75c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.5v-1.5c0-.2.09-.4.24-.54.3-.3.78-.3 1.08 0l.84.84.84-.84c.14-.14.34-.22.54-.22zM12 18c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/></svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">Wedding Invitation</h3>
          <p class="card-desc">Design digital invitations.</p>
        </div>
      </div>

      <!-- Meeting Online -->
      <div 
        @click="handleModuleClick('vconference')" 
        class="menu-card icon-meeting-card" 
        :class="{ locked: authState.isGuest && !authState.user }"
      >
        <div class="icon-box meeting">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">Meeting Online</h3>
          <p class="card-desc">Video call, room, undangan &amp; link.</p>
        </div>
      </div>

      <!-- Maps ShareIt -->
      <div 
        @click="handleModuleClick('maps-shareit')" 
        class="menu-card icon-maps-card active-card" 
      >
        <div class="icon-box maps">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">Maps ShareIt</h3>
          <p class="card-desc">Berbagi lokasi populer &amp; hidden gem.</p>
        </div>
      </div>

      <!-- Camera -->
      <div 
        @click="handleModuleClick('timestamp-camera')" 
        class="menu-card icon-camera-card active-card" 
      >
        <div class="icon-box camera">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">Timestamp Camera</h3>
          <p class="card-desc">GPS-tracked photography.</p>
        </div>
      </div>

      <!-- Mini Games -->
      <div 
        @click="handleModuleClick('mini-games')" 
        class="menu-card icon-games-card active-card" 
      >
        <div class="icon-box games">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 6H3c-1.1 0-2 .9-2 2v8c0 1.1.9 2 2 2h18c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-10 7H8v3H6v-3H3v-2h3V8h2v3h3v2zm4.5 2c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm4-3c-.83 0-1.5-.67-1.5-1.5S18.67 9 19.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/></svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">Mini Games</h3>
          <p class="card-desc">Permainan santai & hiburan.</p>
        </div>
      </div>

      <!-- Admin (Conditions) -->
      <div 
        v-if="authState.user?.role === 'admin'"
        @click="handleModuleClick('admin')" 
        class="menu-card admin-card"
      >
        <div class="icon-box admin-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </div>
        <div class="card-body">
          <h3 class="card-title">Admin</h3>
          <p class="card-desc">System & User controls.</p>
        </div>
      </div>
    </div>

    <NewsGoogle />
    <ForecastBmkg />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authState } from '../db.js';
import NewsGoogle from './Components/NewsGoogle.vue';
import ForecastBmkg from './Components/ForecastBmkg.vue';

const router = useRouter();
const handleModuleClick = (path) => {
  if (path === 'timestamp-camera') {
    return router.push('/timestamp-camera');
  }
  if (path === 'maps-shareit') {
    return router.push('/maps-shareit');
  }
  if (path === 'mini-games') {
    return router.push('/mini-games');
  }

  if (!authState.user) {
    return router.push('/login');
  }

  if (path === 'vconference') {
    return router.push('/vconference');
  }

  router.push('/' + path);
};
</script>

<style scoped>
.home-view {
  max-width: 1000px;
  margin: 0 auto;
  padding: 3rem 1.5rem;
}

.home-hero { text-align: center; margin-bottom: 3rem; }
.home-title { font-size: 2.5rem; font-weight: 800; color: #fff; margin: 0; }
.home-title span { color: #00a884; }
.home-tagline { color: #64748b; font-size: 1rem; margin-top: 0.5rem; }

.guest-banner {
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 2rem;
  font-size: 0.9rem;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.25rem;
  margin-bottom: 4rem;
}

.menu-card {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.menu-card:hover:not(.locked) {
  background: rgba(30, 41, 59, 0.6);
  border-color: rgba(255, 255, 255, 0.1);
  transform: translateY(-4px);
  box-shadow: 0 15px 30px -5px rgba(0, 0, 0, 0.3);
}

.menu-card.locked {
  cursor: not-allowed;
  opacity: 0.6;
}

.icon-box {
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.icon-box svg { width: 24px; height: 24px; color: white; }

.whatsapp { background: linear-gradient(135deg, #00a884, #128c7e); }
.getlynk { background: linear-gradient(135deg, #6366f1, #4f46e5); }
.chat { background: linear-gradient(135deg, #0ea5e9, #0284c7); }
.wedding { background: linear-gradient(135deg, #e879f9, #c026d3); }
.meeting { background: linear-gradient(135deg, #6366f1, #7c3aed); }
.maps { background: linear-gradient(135deg, #10b981, #059669); }
.camera { background: linear-gradient(135deg, #f59e0b, #d97706); }
.games { background: linear-gradient(135deg, #f43f5e, #881337); }
.admin-icon { background: linear-gradient(135deg, #64748b, #334155); }

.card-title { margin: 0; font-size: 1.1rem; font-weight: 700; color: #f8fafc; }
.card-desc { margin: 0.25rem 0 0; font-size: 0.85rem; color: #94a3b8; }

.card-lock {
  position: absolute;
  top: 1rem;
  right: 1rem;
  color: #475569;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.85);
  backdrop-filter: blur(8px);
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  background: #1e293b;
  width: 100%;
  max-width: 400px;
  border-radius: 24px;
  padding: 2.5rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 40px 100px -20px rgba(0,0,0,0.5);
}

.modal-icon { font-size: 3rem; margin-bottom: 1rem; }
.modal-btns { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-sec { flex: 1; padding: 0.875rem; background: #334155; border: none; color: white; border-radius: 12px; font-weight: 700; cursor: pointer; }
.btn-pri { flex: 2; padding: 0.875rem; background: #00a884; border: none; color: white; border-radius: 12px; font-weight: 700; cursor: pointer; }

@media (max-width: 640px) {
  .app-grid { grid-template-columns: 1fr; }
}
</style>


<style scoped>
.home-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
}

.home-hero { text-align: center; margin-bottom: 2.5rem; }
.home-title { margin: 0; font-size: 2.2rem; font-weight: 800; color: #fff; letter-spacing: -0.04em; }
.home-tagline { margin: 0.5rem 0 0; font-size: 1rem; color: var(--muted); }

.app-buttons { display: flex; flex-wrap: wrap; gap: 0.75rem; justify-content: center; max-width: 800px; margin: 0 auto; }

.app-btn {
  display: flex; align-items: center; gap: 0.75rem; padding: 0.6rem 1.25rem;
  background: var(--card); border-radius: 99px; border: 1px solid rgba(255,255,255,0.05);
  text-decoration: none; color: var(--text); transition: 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.app-btn:hover { border-color: var(--green); background: rgba(37, 211, 102, 0.05); transform: translateY(-2px); box-shadow: 0 4px 15px rgba(0,0,0,0.3); }

.app-btn-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.app-btn-icon svg { width: 16px; height: 16px; color: #fff; }

.icon-wa { background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); }
.icon-link { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }
.icon-chat { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); }
.icon-wedding { background: linear-gradient(135deg, #e879f9 0%, #c026d3 100%); }
.icon-absensi { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); }
.icon-reset { background: linear-gradient(135deg, #f43f5e 0%, #e11d48 100%); }

.app-btn-title { font-size: 0.9rem; font-weight: 600; }

.reset-btn:hover { border-color: #f43f5e; background: rgba(244, 63, 94, 0.05); }

/* Custom Modal */
.reset-modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(10px); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.reset-modal-card { background: #1e293b; width: 100%; max-width: 400px; padding: 2.5rem 2rem; border-radius: 32px; text-align: center; box-shadow: 0 30px 60px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); }
.warn-icon { font-size: 3rem; margin-bottom: 1rem; }
.modal-title { font-size: 1.5rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
.modal-body { color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin-bottom: 2rem; }
.modal-actions { display: flex; gap: 0.75rem; }
.btn-cancel { flex: 1; height: 50px; background: #334155; border: none; color: #fff; border-radius: 16px; font-weight: 700; cursor: pointer; }
.btn-confirm-nuclear { flex: 1; height: 50px; background: #f43f5e; color: #fff; border: none; border-radius: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(244, 63, 94, 0.2); }
.btn-confirm-wa { flex: 1; height: 50px; background: #25D366; color: #fff; border: none; border-radius: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(37, 211, 102, 0.2); }
.icon-wa-modal { background: rgba(37, 211, 102, 0.1); border-radius: 20px; padding: 0.5rem; }


.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.9); }

@media (max-width: 640px) { .app-buttons { gap: 0.5rem; } .app-btn { width: 100%; justify-content: flex-start; } }
</style>
