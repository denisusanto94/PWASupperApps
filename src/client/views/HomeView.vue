<template>
  <div class="home-view">
    <div class="home-hero">
      <h1 class="home-title">PWASupperApps</h1>
      <p class="home-tagline">Pilih aplikasi untuk memulai</p>
    </div>
    <div class="app-buttons">
      <router-link to="/wab-blaster" class="app-btn">
        <div class="app-btn-icon icon-wa">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
        </div>
        <span class="app-btn-title">WhatsApp Blaster</span>
      </router-link>

      <router-link to="/getlynkid" class="app-btn">
        <div class="app-btn-icon icon-link">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>
        </div>
        <span class="app-btn-title">getlynk.id</span>
      </router-link>

      <router-link to="/instant-chat" class="app-btn">
        <div class="app-btn-icon icon-chat">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        </div>
        <span class="app-btn-title">Instant Messaging</span>
      </router-link>

      <router-link to="/wedding-invitation" class="app-btn">
        <div class="app-btn-icon icon-wedding">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2c.2 0 .4.08.54.22l.84.84.84-.84c.3-.3.78-.3 1.08 0 .15.14.24.34.24.54v1.5h1.5c.41 0 .75.34.75.75s-.34.75-.75.75h-1.5v.5c2.5.4 4.5 2.5 4.9 5h.6c.41 0 .75.34.75.75s-.34.75-.75.75h-.6c-.4 3.87-3.63 7-7.5 7s-7.1-3.13-7.5-7H2.75c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h.6c.4-2.5 2.4-4.6 4.9-5v-.5H6.75c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h1.5v-1.5c0-.2.09-.4.24-.54.3-.3.78-.3 1.08 0l.84.84.84-.84c.14-.14.34-.22.54-.22zM12 18c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5z"/></svg>
        </div>
        <span class="app-btn-title">Wedding Invitation</span>
      </router-link>
    </div>
  </div>
</template>

<script setup>
</script>

<style scoped>
.home-view {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem 1rem;
  min-height: 100vh;
}

.home-hero {
  text-align: center;
  margin-bottom: 2.5rem;
}

.home-title {
  margin: 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
}

.home-tagline {
  margin: 0.5rem 0 0;
  font-size: 1rem;
  color: var(--muted);
}

.app-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  justify-content: center;
  max-width: 800px;
  margin: 0 auto;
}

.app-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background: var(--card);
  border-radius: 99px;
  border: 1px solid #334155;
  text-decoration: none;
  color: var(--text);
  transition: all 0.2s ease;
}

.app-btn:hover {
  border-color: var(--green);
  background: rgba(37, 211, 102, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.app-btn-icon {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-btn-icon svg {
  width: 16px;
  height: 16px;
  color: #fff;
}

.icon-wa { background: linear-gradient(135deg, #25D366 0%, #128C7E 100%); }
.icon-link { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); }
.icon-chat { background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%); }
.icon-wedding { background: linear-gradient(135deg, #e879f9 0%, #c026d3 100%); }

.app-btn-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
}

@media (max-width: 640px) {
  .app-buttons {
    gap: 0.6rem;
  }
}
</style>
