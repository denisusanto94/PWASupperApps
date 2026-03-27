<template>
  <div class="vc-root">
    <!-- Room meeting -->
    <template v-if="roomCode">
      <header class="vc-header">
        <button type="button" class="vc-back" @click="goHub">← Meeting Online</button>
        <h1 class="vc-title">{{ detail?.title || 'Meeting' }}</h1>
        <p class="vc-sub">Kode: <strong>{{ roomCode }}</strong> · {{ formatRange(detail) }}</p>
      </header>

      <p v-if="roomError" class="vc-error">{{ roomError }}</p>
      <div v-else-if="roomLoading" class="vc-muted">Memuat room…</div>

      <template v-else-if="detail">
        <div class="vc-toolbar">
          <button type="button" class="vc-btn vc-btn--primary" @click="copyShareLink">Salin link gabung</button>
          <button
            v-if="jitsiUrl && !pipActive"
            type="button"
            class="vc-btn vc-btn--ghost"
            title="Jendela mengambang (browser mendukung Document PiP)"
            @click="enterDocumentPip"
          >
            Mode mini (PiP)
          </button>
          <button
            v-if="jitsiUrl && pipActive"
            type="button"
            class="vc-btn vc-btn--ghost"
            @click="restoreFromPip"
          >
            Kembalikan video ke halaman
          </button>
          <a
            class="vc-btn vc-btn--ghost"
            :href="jitsiUrl"
            target="_blank"
            rel="noopener noreferrer"
          >
            Buka video di tab baru
          </a>
        </div>

        <label v-if="jitsiUrl && !pipActive" class="vc-checkbox-row">
          <input v-model="autoPipOnTabHide" type="checkbox" />
          <span>Otomatis mini (PiP) saat pindah tab / aplikasi lain</span>
        </label>

        <p class="vc-hint">
          Video memakai <strong>Jitsi Meet</strong> (gratis). Izinkan kamera &amp; mikrofon di browser. Nama room:
          <code>{{ detail.jitsi_room_name }}</code>
          · Nama di layar prejoin otomatis: <strong>{{ jitsiUserDisplayName }}</strong>
        </p>

        <div class="vc-jitsi-wrap" :class="{ 'vc-jitsi-wrap--pip': pipActive }">
          <iframe
            v-if="jitsiUrl"
            :key="jitsiUrl"
            :src="mainMeetingIframeSrc"
            class="vc-jitsi"
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            title="Video meeting"
          />
          <div v-if="pipActive" class="vc-pip-placeholder">
            <p>Meeting berjalan di <strong>jendela mini</strong></p>
            <button type="button" class="vc-btn vc-btn--primary" @click="restoreFromPip">Tampilkan lagi di sini</button>
          </div>
        </div>

        <section class="vc-panel">
          <h2 class="vc-h2">Peserta &amp; undangan</h2>
          <p class="vc-muted vc-small">
            Pembuat: {{ detail.creator_name }} ({{ detail.creator_email }})
          </p>
          <ul class="vc-part-list">
            <li v-for="p in detail.participants" :key="p.user_id" class="vc-part-item">
              <span class="vc-part-name">{{ p.full_name || p.email }}</span>
              <span class="vc-part-meta">
                <span v-if="p.joined_at" class="vc-badge vc-badge--in">Sudah masuk</span>
                <span v-else class="vc-badge vc-badge--wait">Belum masuk</span>
              </span>
            </li>
          </ul>
        </section>

        <section v-if="isCreator" class="vc-panel">
          <h2 class="vc-h2">Link Google Drive (hasil / rekaman)</h2>
          <div class="vc-gdrive-row">
            <input v-model="gdriveEdit" type="url" class="vc-input" placeholder="https://drive.google.com/..." />
            <button type="button" class="vc-btn vc-btn--primary" :disabled="gdriveSaving" @click="saveGdrive">
              {{ gdriveSaving ? 'Menyimpan…' : 'Simpan' }}
            </button>
          </div>
        </section>
        <section v-else-if="detail.link_gdrive" class="vc-panel">
          <h2 class="vc-h2">Hasil meeting</h2>
          <a :href="detail.link_gdrive" target="_blank" rel="noopener" class="vc-link">{{ detail.link_gdrive }}</a>
        </section>
      </template>
    </template>

    <!-- Hub -->
    <template v-else>
      <header class="vc-header">
        <h1 class="vc-title">Meeting Online</h1>
        <p class="vc-sub">Buat room, jadwalkan, undang pengguna, atau bagikan link — video lewat Jitsi Meet.</p>
      </header>

      <p v-if="listError" class="vc-error">{{ listError }}</p>

      <div class="vc-actions">
        <button type="button" class="vc-btn vc-btn--primary" @click="showCreate = !showCreate">
          {{ showCreate ? 'Tutup form' : '+ Buat meeting baru' }}
        </button>
      </div>

      <form v-if="showCreate" class="vc-form vc-form--create" @submit.prevent="createMeeting">
        <div class="vc-form-create-head">
          <span class="vc-form-create-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </span>
          <div>
            <h3 class="vc-form-create-title">Meeting baru</h3>
            <p class="vc-form-create-desc">Atur jadwal, undangan opsional, lalu buka room video.</p>
          </div>
        </div>

        <label class="vc-label">Judul (opsional)</label>
        <input v-model="form.title" type="text" class="vc-input" placeholder="Contoh: Sprint planning" />

        <div class="vc-form-schedule">
          <div class="vc-form-field">
            <label class="vc-label">Mulai</label>
            <input
              v-model="form.scheduled_start"
              type="datetime-local"
              class="vc-input vc-input-datetime"
              required
            />
          </div>
          <div class="vc-form-field">
            <label class="vc-label">Selesai</label>
            <input
              v-model="form.scheduled_end"
              type="datetime-local"
              class="vc-input vc-input-datetime"
              required
            />
          </div>
        </div>

        <label class="vc-label">Link Google Drive (opsional)</label>
        <input v-model="form.link_gdrive" type="url" class="vc-input" placeholder="Folder / file untuk hasil meeting" />

        <label class="vc-label">Undang pengguna</label>
        <div class="vc-user-grid">
          <label v-for="u in candidates" :key="u.id" class="vc-check">
            <input v-model="form.invite_user_ids" type="checkbox" :value="u.id" />
            <span>{{ u.full_name || u.email }}</span>
          </label>
        </div>
        <p v-if="!candidates.length" class="vc-muted vc-small">Tidak ada pengguna lain untuk diundang.</p>

        <button type="submit" class="vc-btn vc-btn--primary vc-form-submit" :disabled="creating">
          {{ creating ? 'Membuat…' : 'Buat meeting' }}
        </button>
      </form>

      <h2 class="vc-h2 vc-mt">Meeting Anda</h2>
      <p v-if="listLoading" class="vc-muted">Memuat…</p>
      <ul v-else class="vc-meet-list">
        <li v-for="m in meetings" :key="m.id" class="vc-meet-card">
          <div class="vc-meet-main">
            <h3 class="vc-meet-title">{{ m.title || 'Tanpa judul' }}</h3>
            <p class="vc-meet-meta">
              {{ formatRange(m) }} · Kode <strong>{{ m.room_code }}</strong> · {{ m.participant_count || 0 }} undangan
            </p>
            <p v-if="m.link_gdrive" class="vc-small">
              <a :href="m.link_gdrive" target="_blank" rel="noopener" class="vc-link">Drive</a>
            </p>
          </div>
          <div class="vc-meet-actions">
            <button type="button" class="vc-btn vc-btn--primary" @click="openRoom(m.room_code)">Buka room</button>
            <button
              v-if="m.is_creator"
              type="button"
              class="vc-btn vc-btn--danger"
              @click="removeMeeting(m)"
            >
              Hapus
            </button>
          </div>
        </li>
      </ul>
      <p v-if="!listLoading && !meetings.length" class="vc-muted">Belum ada meeting. Buat yang pertama di atas.</p>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { apiFetch, authState } from '../db.js';
import { showToast } from '../toast.js';

const route = useRoute();
const router = useRouter();

const roomCode = computed(() => (route.params.code ? String(route.params.code).trim().toUpperCase() : ''));

const meetings = ref([]);
const listLoading = ref(false);
const listError = ref('');
const candidates = ref([]);
const showCreate = ref(false);
const creating = ref(false);

const form = ref({
  title: '',
  scheduled_start: '',
  scheduled_end: '',
  link_gdrive: '',
  invite_user_ids: []
});

const detail = ref(null);
const roomLoading = ref(false);
const roomError = ref('');
const gdriveEdit = ref('');
const gdriveSaving = ref(false);

const pipActive = ref(null);
const autoPipOnTabHide = ref(false);

/** Nama untuk prejoin Jitsi (sama dengan user login aplikasi) */
const jitsiUserDisplayName = computed(() => {
  const u = authState.user;
  if (!u) return 'Peserta';
  const s = String(u.full_name || u.email || '').trim();
  return s || 'Peserta';
});

const jitsiUrl = computed(() => {
  if (!detail.value?.jitsi_room_name) return '';
  const room = encodeURIComponent(detail.value.jitsi_room_name);
  const displayName = encodeURIComponent(jitsiUserDisplayName.value);
  let hash = `config.prejoinPageEnabled=true&userInfo.displayName=${displayName}`;
  const em = authState.user?.email;
  if (em) {
    hash += `&userInfo.email=${encodeURIComponent(String(em))}`;
  }
  return `https://meet.jit.si/${room}#${hash}`;
});

/** iframe utama kosong saat meeting dipindah ke jendela PiP (hindari dua sesi sekaligus) */
const mainMeetingIframeSrc = computed(() => (pipActive.value ? 'about:blank' : jitsiUrl.value));

const isCreator = computed(() => {
  if (!detail.value?.user_id || !authState.user?.id) return false;
  return Number(authState.user.id) === Number(detail.value.user_id);
});

watch(
  () => detail.value?.link_gdrive,
  (v) => {
    gdriveEdit.value = v || '';
  }
);

function formatRange(row) {
  if (!row?.scheduled_start || !row?.scheduled_end) return '—';
  try {
    const a = new Date(row.scheduled_start);
    const b = new Date(row.scheduled_end);
    return `${a.toLocaleString('id-ID')} — ${b.toLocaleString('id-ID')}`;
  } catch {
    return '—';
  }
}

async function loadList() {
  listLoading.value = true;
  listError.value = '';
  try {
    const res = await apiFetch('/api/vconference');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat');
    meetings.value = Array.isArray(data) ? data : [];
  } catch (e) {
    listError.value = e.message || 'Gagal memuat daftar';
  } finally {
    listLoading.value = false;
  }
}

async function loadCandidates() {
  try {
    const res = await apiFetch('/api/vconference/invite-candidates');
    const data = await res.json();
    if (res.ok) candidates.value = Array.isArray(data) ? data : [];
  } catch {
    candidates.value = [];
  }
}

async function createMeeting() {
  creating.value = true;
  try {
    const res = await apiFetch('/api/vconference', {
      method: 'POST',
      body: JSON.stringify({
        title: form.value.title,
        scheduled_start: form.value.scheduled_start,
        scheduled_end: form.value.scheduled_end,
        link_gdrive: form.value.link_gdrive || null,
        invite_user_ids: form.value.invite_user_ids
      })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal membuat meeting');
    showToast('Meeting dibuat', 'success');
    form.value = {
      title: '',
      scheduled_start: '',
      scheduled_end: '',
      link_gdrive: '',
      invite_user_ids: []
    };
    showCreate.value = false;
    await loadList();
    if (data.room_code) openRoom(data.room_code);
  } catch (e) {
    showToast(e.message || 'Gagal', 'error');
  } finally {
    creating.value = false;
  }
}

function openRoom(code) {
  router.push(`/vconference/room/${code}`);
}

function goHub() {
  router.push('/vconference');
}

async function loadRoom() {
  if (!roomCode.value) return;
  roomLoading.value = true;
  roomError.value = '';
  detail.value = null;
  try {
    const joinRes = await apiFetch('/api/vconference/join', {
      method: 'POST',
      body: JSON.stringify({ room_code: roomCode.value })
    });
    const joinData = await joinRes.json();
    if (!joinRes.ok) throw new Error(joinData.error || 'Gagal bergabung ke meeting');

    const res = await apiFetch(`/api/vconference/by-code/${roomCode.value}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat detail');
    detail.value = data;
    gdriveEdit.value = data.link_gdrive || '';
    try {
      await apiFetch('/api/notifications/mark-meeting-read', {
        method: 'POST',
        body: JSON.stringify({ room_code: roomCode.value })
      });
      window.dispatchEvent(new CustomEvent('pwa-notifications-changed'));
    } catch {
      /* ignore */
    }
  } catch (e) {
    roomError.value = e.message || 'Gagal memuat room';
  } finally {
    roomLoading.value = false;
  }
}

function onVisibilityForPip() {
  if (!autoPipOnTabHide.value || pipActive.value || !jitsiUrl.value) return;
  if (!document.hidden) return;
  enterDocumentPip();
}

async function enterDocumentPip() {
  const u = jitsiUrl.value;
  if (!u || pipActive.value) return;

  if (typeof documentPictureInPicture === 'undefined' || !documentPictureInPicture.requestWindow) {
    showToast('Browser tidak mendukung PiP dokumen. Membuka tab baru…', 'info');
    window.open(u, '_blank', 'noopener,noreferrer');
    return;
  }
  try {
    const pipWin = await documentPictureInPicture.requestWindow({ width: 400, height: 700 });
    pipWin.document.body.style.margin = '0';
    pipWin.document.body.style.height = '100vh';
    pipWin.document.body.style.background = '#0f172a';
    pipWin.document.documentElement.style.height = '100%';
    const ifr = pipWin.document.createElement('iframe');
    ifr.src = u;
    ifr.setAttribute('allow', 'camera; microphone; fullscreen; display-capture; autoplay');
    ifr.style.cssText = 'width:100%;height:100%;border:none';
    ifr.title = 'Video meeting (mini)';
    pipWin.document.body.appendChild(ifr);
    pipActive.value = pipWin;
    pipWin.addEventListener('pagehide', restoreFromPip);
  } catch (e) {
    showToast(e.message || 'Gagal membuka jendela mini', 'error');
  }
}

function restoreFromPip() {
  const w = pipActive.value;
  if (!w) return;
  pipActive.value = null;
  try {
    if (typeof w.close === 'function') w.close();
  } catch {
    /* ignore */
  }
}

async function copyShareLink() {
  const path = detail.value?.share_path || `/vconference/room/${roomCode.value}`;
  const url = `${window.location.origin}${path}`;
  try {
    await navigator.clipboard.writeText(url);
    showToast('Link disalin', 'success');
  } catch {
    showToast(url, 'success');
  }
}

async function saveGdrive() {
  if (!detail.value?.id) return;
  gdriveSaving.value = true;
  try {
    const res = await apiFetch(`/api/vconference/${detail.value.id}`, {
      method: 'PATCH',
      body: JSON.stringify({ link_gdrive: gdriveEdit.value || null })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal menyimpan');
    detail.value.link_gdrive = gdriveEdit.value || null;
    showToast('Link Drive disimpan', 'success');
  } catch (e) {
    showToast(e.message || 'Gagal', 'error');
  } finally {
    gdriveSaving.value = false;
  }
}

async function removeMeeting(m) {
  if (!confirm(`Hapus meeting "${m.title || m.room_code}"?`)) return;
  try {
    const res = await apiFetch(`/api/vconference/${m.id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Gagal');
    }
    showToast('Meeting dihapus', 'success');
    await loadList();
  } catch (e) {
    showToast(e.message || 'Gagal menghapus', 'error');
  }
}

watch(
  () => route.params.code,
  () => {
    if (pipActive.value) restoreFromPip();
    if (roomCode.value) loadRoom();
    else {
      detail.value = null;
      loadList();
    }
  }
);

onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityForPip);
  if (roomCode.value) loadRoom();
  else {
    loadList();
    loadCandidates();
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('visibilitychange', onVisibilityForPip);
  if (pipActive.value) restoreFromPip();
});
</script>

<style scoped>
.vc-root {
  max-width: 960px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  color: #e2e8f0;
}

.vc-header {
  margin-bottom: 1.5rem;
}

.vc-back {
  display: inline-block;
  margin-bottom: 0.75rem;
  padding: 0.35rem 0;
  background: none;
  border: none;
  color: #38bdf8;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
}

.vc-title {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 800;
  color: #f8fafc;
}

.vc-sub {
  margin: 0.5rem 0 0;
  color: #94a3b8;
  font-size: 0.92rem;
  line-height: 1.5;
}

.vc-error {
  color: #f87171;
  margin: 0 0 1rem;
}

.vc-muted {
  color: #64748b;
}

.vc-small {
  font-size: 0.82rem;
}

.vc-hint {
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
  margin: 0 0 1rem;
}

.vc-hint code {
  font-size: 0.78rem;
  color: #cbd5e1;
}

.vc-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  margin-bottom: 0.75rem;
}

.vc-btn {
  appearance: none;
  border-radius: 10px;
  padding: 0.55rem 1rem;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(30, 41, 59, 0.8);
  color: #e2e8f0;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.vc-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.vc-btn--primary {
  background: linear-gradient(135deg, #6366f1, #4f46e5);
  border-color: rgba(99, 102, 241, 0.5);
  color: #fff;
}

.vc-btn--ghost:hover {
  border-color: rgba(148, 163, 184, 0.35);
}

.vc-btn--danger {
  background: rgba(220, 38, 38, 0.2);
  border-color: rgba(248, 113, 113, 0.35);
  color: #fca5a5;
}

.vc-jitsi-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  min-height: 360px;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: #0f172a;
  margin-bottom: 1.5rem;
}

.vc-jitsi-wrap--pip {
  min-height: 200px;
}

.vc-pip-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  text-align: center;
  background: rgba(15, 23, 42, 0.92);
  color: #94a3b8;
  font-size: 0.9rem;
}

.vc-pip-placeholder p {
  margin: 0;
}

.vc-checkbox-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.82rem;
  color: #94a3b8;
  margin: 0 0 0.75rem;
  cursor: pointer;
}

.vc-checkbox-row input {
  accent-color: #6366f1;
}

.vc-jitsi {
  width: 100%;
  height: 100%;
  border: none;
}

.vc-panel {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 1rem 1.15rem;
  margin-bottom: 1rem;
}

.vc-h2 {
  margin: 0 0 0.65rem;
  font-size: 1rem;
  font-weight: 700;
  color: #f1f5f9;
}

.vc-mt {
  margin-top: 2rem;
}

.vc-part-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.vc-part-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  padding: 0.45rem 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  font-size: 0.88rem;
}

.vc-part-item:last-child {
  border-bottom: none;
}

.vc-part-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}

.vc-badge {
  font-size: 0.72rem;
  font-weight: 700;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
}

.vc-badge--in {
  background: rgba(34, 197, 94, 0.2);
  color: #86efac;
}

.vc-badge--wait {
  background: rgba(100, 116, 139, 0.25);
  color: #94a3b8;
}

.vc-gdrive-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.vc-gdrive-row .vc-input {
  flex: 1;
  min-width: 200px;
}

.vc-link {
  color: #38bdf8;
  word-break: break-all;
}

.vc-actions {
  margin-bottom: 1.25rem;
}

.vc-form {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.vc-form--create {
  gap: 0.85rem;
  padding: 1.35rem 1.35rem 1.5rem;
  background: linear-gradient(165deg, rgba(30, 41, 59, 0.75) 0%, rgba(15, 23, 42, 0.55) 100%);
  border: 1px solid rgba(99, 102, 241, 0.22);
  box-shadow: 0 18px 40px -24px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border-radius: 18px;
}

.vc-form-create-head {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
  margin-bottom: 0.35rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.vc-form-create-icon {
  flex-shrink: 0;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.35), rgba(124, 58, 237, 0.25));
  color: #e0e7ff;
  border: 1px solid rgba(165, 180, 252, 0.2);
}

.vc-form-create-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

.vc-form-create-desc {
  margin: 0.25rem 0 0;
  font-size: 0.82rem;
  color: #94a3b8;
  line-height: 1.45;
}

.vc-form-schedule {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 560px) {
  .vc-form-schedule {
    grid-template-columns: 1fr;
  }
}

.vc-form-field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  min-width: 0;
}

.vc-form-submit {
  margin-top: 0.35rem;
  width: 100%;
  justify-content: center;
  padding: 0.7rem 1rem;
  border-radius: 12px;
}

/* Ikon datepicker native → putih (Chrome/Edge/Safari) */
.vc-input-datetime {
  color-scheme: dark;
}

.vc-input-datetime::-webkit-calendar-picker-indicator {
  filter: invert(1);
  opacity: 0.92;
  cursor: pointer;
}

.vc-input-datetime::-webkit-clear-button {
  filter: invert(1);
  opacity: 0.75;
}

.vc-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.vc-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.6);
  color: #f8fafc;
  font-size: 0.9rem;
}

.vc-user-grid {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  max-height: 200px;
  overflow-y: auto;
}

.vc-check {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.88rem;
  cursor: pointer;
  color: #cbd5e1;
}

.vc-meet-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.vc-meet-card {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.15rem;
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 14px;
}

.vc-meet-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 700;
  color: #f8fafc;
}

.vc-meet-meta {
  margin: 0.35rem 0 0;
  font-size: 0.82rem;
  color: #94a3b8;
  line-height: 1.45;
}

.vc-meet-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
</style>
