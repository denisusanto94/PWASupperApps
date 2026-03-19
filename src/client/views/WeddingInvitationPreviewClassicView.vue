<template>
  <div class="preview-view" :class="{ 'preview-view--classic': true }">
    <template v-if="data">
      <ClassicTemplate :data="data" />
      <router-link to="/wedding-invitation" class="preview-edit-link">← Edit undangan</router-link>
    </template>
    <template v-else>
      <div class="preview-card">
        <p class="preview-empty">Belum ada data. Isi form di halaman undangan lalu klik Preview.</p>
      </div>
      <div class="preview-actions">
        <router-link to="/wedding-invitation" class="btn-back">← Edit undangan</router-link>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import ClassicTemplate from '@template/wedding/ClassicTemplate.vue';

const DATA_KEY = 'weddingInvitationPreview';
const data = ref(null);

onMounted(() => {
  try {
    const raw = sessionStorage.getItem(DATA_KEY);
    if (raw) data.value = JSON.parse(raw);
  } catch (_) {
    data.value = null;
  }
});
</script>

<style scoped>
.preview-view {
  min-height: 100vh;
}

.preview-view--classic {
  max-width: none;
  padding: 0;
  margin: 0;
  background: white;
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
  max-width: 560px;
  margin: 2rem auto;
  background: var(--card);
  border-radius: 16px;
  padding: 2rem 1.5rem;
  box-shadow: 0 4px 20px rgba(0,0,0,0.08);
}

.preview-empty {
  text-align: center;
  color: var(--muted);
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
}
</style>
