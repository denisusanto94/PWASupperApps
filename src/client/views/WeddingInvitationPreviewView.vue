<template>
  <div class="preview-view" :class="{ 'preview-view--classic': isClassic || isMontain }">
    <!-- Template Classic / Montain (ala viding.co) -->
    <template v-if="data && (isClassic || isMontain)">
      <ClassicTemplate v-if="isClassic" :data="data" />
      <MontainTemplate v-if="isMontain" :data="data" />
      <router-link to="/wedding-invitation" class="preview-edit-link">← Edit undangan</router-link>
    </template>
    <!-- Fallback: simple card for other templates or no data -->
    <template v-else>
      <div v-if="data" class="preview-card">
        <p class="preview-badge">Template: {{ templateName }}</p>
        <h1 class="preview-title">{{ data.namaMempelaiPria }} & {{ data.namaMempelaiWanita }}</h1>
        <p class="preview-subtitle">Undangan Pernikahan</p>
        <div class="preview-divider" aria-hidden="true">✦</div>
        <dl class="preview-dl">
          <div v-if="data.orangTuaPria || data.orangTuaWanita" class="preview-row">
            <dt>Orang tua mempelai pria</dt>
            <dd>{{ data.orangTuaPria || '—' }}</dd>
          </div>
          <div v-if="data.orangTuaPria || data.orangTuaWanita" class="preview-row">
            <dt>Orang tua mempelai wanita</dt>
            <dd>{{ data.orangTuaWanita || '—' }}</dd>
          </div>
          <div v-if="data.tanggalAcara" class="preview-row">
            <dt>Tanggal acara</dt>
            <dd>{{ formatDate(data.tanggalAcara) }}</dd>
          </div>
          <div v-if="data.lokasiAcara" class="preview-row">
            <dt>Lokasi</dt>
            <dd class="preview-lokasi">{{ data.lokasiAcara }}</dd>
          </div>
          <div v-if="data.latarLaguFileName" class="preview-row">
            <dt>Latar lagu</dt>
            <dd>{{ data.latarLaguFileName }}</dd>
          </div>
          <div v-if="data.galleryCount" class="preview-row">
            <dt>Galeri</dt>
            <dd>{{ data.galleryCount }} foto</dd>
          </div>
        </dl>
      </div>
      <p v-else class="preview-empty">Belum ada data. Isi form di halaman undangan lalu klik Preview.</p>
      <div class="preview-actions">
        <router-link to="/wedding-invitation" class="btn-back">← Edit undangan</router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import ClassicTemplate from '@template/wedding/ClassicTemplate.vue';
import MontainTemplate from '@template/wedding/MontainTemplate.vue';

const DATA_KEY = 'weddingInvitationPreview';
const data = ref(null);

const templateNames = {
  classic: 'Classic',
  montain: 'Montain',
  floral: 'Floral',
  minimal: 'Minimal',
  elegant: 'Elegant',
};

const templateName = computed(() =>
  data.value?.templateId ? templateNames[data.value.templateId] ?? data.value.templateId : ''
);

const isClassic = computed(() => data.value?.templateId === 'classic');
const isMontain = computed(() => data.value?.templateId === 'montain');

onMounted(() => {
  try {
    const raw = sessionStorage.getItem(DATA_KEY);
    if (raw) data.value = JSON.parse(raw);
  } catch (_) {
    data.value = null;
  }
});

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
</script>

<style scoped>
.preview-view {
  max-width: 560px;
  margin: 0 auto;
  padding: 1.5rem 1rem 2rem;
  min-height: 100vh;
}

.preview-view--classic {
  max-width: none;
  padding: 0;
  margin: 0;
  background: white; /* Prevent background leak */
}

.preview-edit-link {
  position: fixed;
  top: 1rem;
  right: 1rem;
  z-index: 100;
  padding: 0.5rem 0.75rem;
  font-size: 0.85rem;
  color: var(--wedding-accent);
  background: var(--card);
  border: 1px solid rgba(148, 163, 184, 0.3);
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.preview-edit-link:hover {
  background: rgba(232, 121, 249, 0.15);
}

.preview-card {
  background: var(--card);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 2rem 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.preview-badge {
  margin: 0 0 1rem;
  font-size: 0.8rem;
  color: var(--wedding-accent);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.preview-title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--text);
  text-align: center;
  line-height: 1.3;
}

.preview-subtitle {
  margin: 0.5rem 0 1rem;
  font-size: 0.95rem;
  color: var(--muted);
  text-align: center;
}

.preview-divider {
  margin: 1rem 0 1.5rem;
  text-align: center;
  color: var(--wedding-accent);
  opacity: 0.8;
}

.preview-dl {
  margin: 0;
}

.preview-row {
  margin-bottom: 0.85rem;
}

.preview-row:last-child {
  margin-bottom: 0;
}

.preview-row dt {
  margin: 0 0 0.2rem;
  font-size: 0.8rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.preview-row dd {
  margin: 0;
  font-size: 0.95rem;
  color: var(--text);
  line-height: 1.4;
}

.preview-lokasi {
  white-space: pre-wrap;
}

.preview-empty {
  text-align: center;
  color: var(--muted);
  padding: 2rem 1rem;
  margin-bottom: 1.5rem;
}

.preview-actions {
  text-align: center;
}

.btn-back {
  display: inline-block;
  padding: 0.6rem 1.25rem;
  font-size: 0.9rem;
  color: var(--wedding-accent);
  background: transparent;
  border: 1px solid var(--wedding-accent);
  border-radius: 10px;
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}

.btn-back:hover {
  background: rgba(232, 121, 249, 0.15);
  color: var(--wedding-accent);
}
</style>
