<template>
  <div class="admin-panel">
    <div class="admin-header">
      <div class="header-main">
        <h1 class="page-title">Admin Management</h1>
        <nav class="admin-tabs" role="tablist" aria-label="Bagian admin">
          <button
            type="button"
            role="tab"
            class="admin-tab"
            :class="{ 'admin-tab--active': activeTab === 'users' }"
            :aria-selected="activeTab === 'users'"
            @click="activeTab = 'users'"
          >
            Users Management
          </button>
          <button
            type="button"
            role="tab"
            class="admin-tab"
            :class="{ 'admin-tab--active': activeTab === 'maps' }"
            :aria-selected="activeTab === 'maps'"
            @click="activeTab = 'maps'"
          >
            Maps Shareit Management
          </button>
        </nav>
        <p class="page-subtitle">
          <template v-if="activeTab === 'users'">Kelola pengguna, peran, dan sesi.</template>
          <template v-else>Lihat dan hapus kontribusi lokasi Maps ShareIt.</template>
        </p>
      </div>
      <button v-if="activeTab === 'users'" type="button" @click="showAddModal = true" class="add-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add New User
      </button>
    </div>

    <div v-show="activeTab === 'users'" class="admin-tab-panel">
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg></div>
        <div class="stat-info">
          <span class="stat-label">Total Users</span>
          <span class="stat-value">{{ users.length }}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon secure"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div>
        <div class="stat-info">
          <span class="stat-label">Admins</span>
          <span class="stat-value">{{ adminsCount }}</span>
        </div>
      </div>
    </div>

    <!-- Users Table -->
    <div class="table-card">
      <div class="table-actions">
        <div class="search-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input v-model="searchQuery" placeholder="Search users by name or email..." />
        </div>
      </div>

      <div class="table-container">
        <table class="premium-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Created</th>
              <th class="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.id">
              <td>
                <div class="user-cell">
                  <div class="avatar-wrapper">
                    <div class="avatar" :style="{ background: getRandomGradient(user.email) }">
                      {{ user.full_name?.charAt(0) || 'U' }}
                    </div>
                    <div class="session-dot" :class="{ active: user.active_sessions > 0 }" :title="user.active_sessions > 0 ? 'Sesi Aktif' : 'Tidak Ada Sesi'"></div>
                  </div>
                  <div class="user-meta">
                    <div class="user-name">{{ user.full_name }}</div>
                    <div class="user-email">
                      {{ user.email }}
                    </div>
                  </div>
                </div>
              </td>
              <td>
                <span class="badge" :class="user.role">
                  {{ user.role === 'superadmin' ? '👑 Superadmin' : (user.role === 'admin' ? '🛡️ Admin' : '👤 User') }}
                </span>
              </td>
              <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
              <td class="text-right">
                <div class="flex items-center justify-end gap-3">
                  <div 
                    class="status-indicator-pill" 
                    :class="{ active: user.active_sessions > 0 }"
                    :title="user.active_sessions > 0 ? 'Sesi Aktif' : 'Tidak Ada Sesi'"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" class="mr-1 inline-block"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                    {{ user.active_sessions > 0 ? 'ONLINE' : 'OFFLINE' }}
                  </div>
                  <button 
                    class="action-btn session-reset" 
                    @click="resetSession(user)"
                    title="Reset Sesi / Logout Paksa"
                  >
                    Reset Sesi
                  </button>
                  <button 
                    v-if="user.email !== 'admin@gmail.com'" 
                    class="action-btn delete" 
                    @click="confirmDelete(user)"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </div>

    <!-- Maps ShareIt -->
    <div v-show="activeTab === 'maps'" class="admin-tab-panel">
      <div class="stats-grid stats-grid--maps">
        <div class="stat-card">
          <div class="stat-icon maps"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg></div>
          <div class="stat-info">
            <span class="stat-label">Total kontribusi lokasi</span>
            <span class="stat-value">{{ mapsTotal }}</span>
          </div>
        </div>
      </div>

      <div class="table-card">
        <div class="table-actions">
          <div class="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input v-model="mapsSearchQuery" placeholder="Cari nama, email, kategori, komentar…" />
          </div>
          <button type="button" class="refresh-maps-btn" :disabled="mapsLoading" @click="loadMapsShareit">
            {{ mapsLoading ? 'Memuat…' : 'Muat ulang' }}
          </button>
        </div>

        <div class="table-container">
          <table class="premium-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Kontributor</th>
                <th>Kategori</th>
                <th>Komentar</th>
                <th>Koordinat</th>
                <th>Diperbarui</th>
                <th class="text-right">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in filteredMapsRows" :key="row.id">
                <td class="mono-cell">{{ row.id }}</td>
                <td>
                  <div class="user-meta">
                    <div class="user-name">{{ row.contributor_name }}</div>
                    <div class="user-email">{{ row.contributor_email }}</div>
                  </div>
                </td>
                <td><span class="badge maps-cat">{{ row.kategori || '—' }}</span></td>
                <td class="clamp-cell">{{ truncate(row.komentar, 80) }}</td>
                <td class="mono-cell small-coords">
                  <template v-if="Number.isFinite(row.latitude) && Number.isFinite(row.longitude)">
                    {{ row.latitude.toFixed(5) }}, {{ row.longitude.toFixed(5) }}
                  </template>
                  <template v-else>—</template>
                </td>
                <td>{{ formatDateTime(row.updated_at) }}</td>
                <td class="text-right maps-actions-cell">
                  <button
                    type="button"
                    class="maps-verify-switch"
                    role="switch"
                    :aria-checked="row.verified"
                    :aria-label="row.verified ? 'Terverifikasi — matikan' : 'Belum terverifikasi — aktifkan'"
                    :disabled="mapsVerifyBusyId === row.id"
                    :class="{ 'maps-verify-switch--on': row.verified, 'maps-verify-switch--busy': mapsVerifyBusyId === row.id }"
                    @click="toggleMapVerified(row)"
                  >
                    <span class="maps-verify-track" aria-hidden="true">
                      <span class="maps-verify-thumb"></span>
                    </span>
                  </button>
                  <button type="button" class="action-btn delete" @click="confirmDeleteMap(row)">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-if="!mapsLoading && !filteredMapsRows.length" class="empty-maps">Tidak ada data atau tidak cocok dengan pencarian.</p>
        </div>
      </div>
    </div>

    <!-- Add User Modal -->
    <Transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h2>Add New Account</h2>
            <button class="close-btn" @click="showAddModal = false">×</button>
          </div>
          <form @submit.prevent="saveUser">
            <div class="form-group">
              <label>Full Name</label>
              <input v-model="newUser.full_name" required placeholder="John Doe" />
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" v-model="newUser.email" required placeholder="john@example.com" />
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" v-model="newUser.password" required placeholder="Minimum 8 characters" />
            </div>
            <div class="form-group">
              <label>System Role</label>
              <select v-model="newUser.role">
                <option value="user">Standard User</option>
                <option value="admin">Administrator</option>
                <option value="superadmin">Superadmin</option>
              </select>
            </div>
            <div class="modal-footer">
              <button type="button" class="cancel-btn" @click="showAddModal = false">Cancel</button>
              <button type="submit" class="save-btn" :disabled="saving">
                {{ saving ? 'Creating...' : 'Create User' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>

    <!-- Konfirmasi (mengganti window.confirm) -->
    <Transition name="modal">
      <div
        v-if="confirmDialog.open"
        class="modal-overlay confirm-overlay"
        @click.self="handleConfirmResult(false)"
      >
        <div class="modal-card confirm-modal-card" role="dialog" aria-modal="true" aria-labelledby="admin-confirm-title">
          <div class="modal-header">
            <h2 id="admin-confirm-title">{{ confirmDialog.title }}</h2>
            <button type="button" class="close-btn" aria-label="Tutup" @click="handleConfirmResult(false)">×</button>
          </div>
          <p class="confirm-modal-body">{{ confirmDialog.message }}</p>
          <div class="modal-footer">
            <button type="button" class="cancel-btn" @click="handleConfirmResult(false)">{{ confirmDialog.cancelText }}</button>
            <button
              type="button"
              class="save-btn"
              :class="{ 'confirm-modal-ok--danger': confirmDialog.variant === 'danger' }"
              @click="handleConfirmResult(true)"
            >
              {{ confirmDialog.confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { apiFetch } from '../db.js';
import { showToast } from '../toast.js';

const activeTab = ref('users');
const users = ref([]);
const searchQuery = ref('');
const mapsRows = ref([]);
const mapsTotal = ref(0);
const mapsLoading = ref(false);
const mapsSearchQuery = ref('');
const mapsVerifyBusyId = ref(null);
const confirmDialog = ref({
  open: false,
  title: 'Konfirmasi',
  message: '',
  variant: 'default',
  confirmText: 'Ya',
  cancelText: 'Batal'
});
let confirmResolve = null;

function askConfirm(opts) {
  return new Promise((resolve) => {
    confirmResolve = resolve;
    confirmDialog.value = {
      open: true,
      title: opts.title || 'Konfirmasi',
      message: opts.message || '',
      variant: opts.variant || 'default',
      confirmText: opts.confirmText || 'Ya',
      cancelText: opts.cancelText || 'Batal'
    };
  });
}

function handleConfirmResult(ok) {
  confirmDialog.value.open = false;
  if (confirmResolve) {
    confirmResolve(!!ok);
    confirmResolve = null;
  }
}

const showAddModal = ref(false);
const saving = ref(false);

const newUser = ref({
  full_name: '',
  email: '',
  password: '',
  role: 'user'
});

const loadUsers = async () => {
  try {
    const res = await apiFetch('/api/admin/users');
    users.value = await res.json();
  } catch (err) {
    showToast('Gagal memuat user', 'error');
  }
};

const adminsCount = computed(() => users.value.filter(u => u.role === 'admin').length);

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const q = searchQuery.value.toLowerCase();
  return users.value.filter(u => 
    u.full_name?.toLowerCase().includes(q) || 
    u.email.toLowerCase().includes(q)
  );
});

const filteredMapsRows = computed(() => {
  const q = mapsSearchQuery.value.trim().toLowerCase();
  if (!q) return mapsRows.value;
  return mapsRows.value.filter((r) => {
    const blob = [
      r.contributor_name,
      r.contributor_email,
      r.kategori,
      r.komentar,
      r.addressLabel,
      String(r.id)
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return blob.includes(q);
  });
});

const loadMapsShareit = async () => {
  mapsLoading.value = true;
  try {
    const res = await apiFetch('/api/admin/maps-shareit?limit=500&offset=0');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memuat data');
    mapsRows.value = Array.isArray(data.items) ? data.items : [];
    mapsTotal.value = typeof data.total === 'number' ? data.total : mapsRows.value.length;
  } catch (e) {
    showToast(e.message || 'Gagal memuat Maps ShareIt', 'error');
    mapsRows.value = [];
  } finally {
    mapsLoading.value = false;
  }
};

const toggleMapVerified = async (row) => {
  if (mapsVerifyBusyId.value === row.id) return;
  const checked = !row.verified;
  const prev = !!row.verified;
  row.verified = checked;
  mapsVerifyBusyId.value = row.id;
  try {
    const res = await apiFetch(`/api/admin/maps-shareit/${row.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ verified: checked })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal memperbarui verifikasi');
    if (typeof data.verified === 'boolean') row.verified = data.verified;
    showToast(checked ? 'Lokasi ditandai terverifikasi' : 'Verifikasi dicabut', 'success');
  } catch (e) {
    row.verified = prev;
    showToast(e.message || 'Gagal memperbarui', 'error');
  } finally {
    mapsVerifyBusyId.value = null;
  }
};

const confirmDeleteMap = async (row) => {
  const ok = await askConfirm({
    title: 'Hapus kontribusi?',
    message: `Hapus kontribusi lokasi #${row.id}? Tindakan ini tidak dapat dibatalkan.`,
    variant: 'danger',
    confirmText: 'Hapus',
    cancelText: 'Batal'
  });
  if (!ok) return;
  try {
    const res = await apiFetch(`/api/admin/maps-shareit/${row.id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Kontribusi dihapus', 'success');
      await loadMapsShareit();
    } else {
      const data = await res.json();
      throw new Error(data.error || 'Gagal menghapus');
    }
  } catch (e) {
    showToast(e.message || 'Gagal menghapus', 'error');
  }
};

function truncate(s, n) {
  const t = String(s || '');
  if (t.length <= n) return t;
  return `${t.slice(0, n)}…`;
}

function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return String(iso);
  }
}

watch(activeTab, (t) => {
  if (t === 'maps') loadMapsShareit();
});

const saveUser = async () => {
  saving.value = true;
  try {
    const res = await apiFetch('/api/admin/users', {
      method: 'POST',
      body: JSON.stringify(newUser.value)
    });
    if (res.ok) {
      showToast('User berhasil dibuat', 'success');
      showAddModal.value = false;
      newUser.value = { full_name: '', email: '', password: '', role: 'user' };
      loadUsers();
    } else {
      const data = await res.json();
      throw new Error(data.error);
    }
  } catch (err) {
    showToast(err.message, 'error');
  } finally {
    saving.value = false;
  }
};

const confirmDelete = async (user) => {
  const ok = await askConfirm({
    title: 'Hapus user?',
    message: `Hapus akun ${user.full_name} (${user.email})? Tindakan ini tidak dapat dibatalkan.`,
    variant: 'danger',
    confirmText: 'Hapus',
    cancelText: 'Batal'
  });
  if (!ok) return;
  try {
    const res = await apiFetch(`/api/admin/users/${user.id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('User dihapus', 'success');
      loadUsers();
    }
  } catch (err) {
    showToast('Gagal menghapus user', 'error');
  }
};

const resetSession = async (user) => {
  const ok = await askConfirm({
    title: 'Reset sesi?',
    message: `Tutup semua sesi aktif untuk ${user.full_name}? Pengguna harus masuk kembali.`,
    variant: 'default',
    confirmText: 'Reset sesi',
    cancelText: 'Batal'
  });
  if (!ok) return;
  try {
    const res = await apiFetch(`/api/admin/sessions/${user.id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('Sesi user berhasil direset', 'success');
    } else {
      throw new Error('Gagal mereset sesi');
    }
  } catch (err) {
    showToast(err.message, 'error');
  }
};

const getRandomGradient = (seed) => {
  const hash = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = [
    ['#3b82f6', '#1d4ed8'],
    ['#10b981', '#047857'],
    ['#f59e0b', '#b45309'],
    ['#ec4899', '#be185d'],
    ['#8b5cf6', '#6d28d9']
  ];
  const pair = colors[hash % colors.length];
  return `linear-gradient(135deg, ${pair[0]}, ${pair[1]})`;
};

onMounted(() => {
  loadUsers();
});
</script>

<style scoped>
.admin-panel {
  padding: 2.5rem;
  max-width: 1200px;
  margin: 0 auto;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 2.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin: 1rem 0 0.5rem;
}

.admin-tab {
  appearance: none;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.6);
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 700;
  padding: 0.55rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}

.admin-tab:hover {
  color: #e2e8f0;
  border-color: rgba(255, 255, 255, 0.2);
}

.admin-tab--active {
  background: rgba(0, 168, 132, 0.15);
  border-color: rgba(0, 168, 132, 0.45);
  color: #34d399;
}

.admin-tab-panel {
  animation: adminFadeIn 0.2s ease;
}

@keyframes adminFadeIn {
  from { opacity: 0.6; }
  to { opacity: 1; }
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: #f8fafc;
}

.page-subtitle {
  color: #94a3b8;
  margin: 0.25rem 0 0;
}

.add-btn {
  background: #00a884;
  color: white;
  border: none;
  padding: 0.875rem 1.5rem;
  border-radius: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 10px 20px rgba(0, 168, 132, 0.2);
}

.add-btn:hover {
  transform: translateY(-2px);
  background: #1da851;
  box-shadow: 0 15px 25px rgba(0, 168, 132, 0.3);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 2rem;
  margin-bottom: 2.5rem;
}

.stats-grid--maps {
  grid-template-columns: 1fr;
  max-width: 360px;
}

.stat-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 1.5rem;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.secure {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.stat-icon.maps {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.stat-info .stat-label {
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
}

.stat-info .stat-value {
  font-size: 1.75rem;
  font-weight: 800;
  color: #f8fafc;
}

.table-card {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.table-actions {
  padding: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 1rem;
}

.table-actions .search-box {
  flex: 1;
  min-width: 200px;
}

.refresh-maps-btn {
  padding: 0.65rem 1rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(15, 23, 42, 0.5);
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  white-space: nowrap;
}

.refresh-maps-btn:hover:not(:disabled) {
  color: #f8fafc;
  border-color: rgba(255, 255, 255, 0.2);
}

.refresh-maps-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.maps-actions-cell {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  flex-wrap: wrap;
}

/* Toggle verifikasi on/off (tanpa teks label) */
.maps-verify-switch {
  position: relative;
  flex-shrink: 0;
  width: 2.75rem;
  height: 1.5rem;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 999px;
}

.maps-verify-switch:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.maps-verify-track {
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 999px;
  background: rgba(100, 116, 139, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.12);
  transition: background 0.22s ease, box-shadow 0.22s ease;
  position: relative;
}

.maps-verify-switch--on .maps-verify-track {
  background: linear-gradient(135deg, #38bdf8 0%, #1d9bf0 100%);
  border-color: rgba(56, 189, 248, 0.45);
  box-shadow: 0 0 0 1px rgba(29, 155, 240, 0.25), 0 2px 8px rgba(29, 155, 240, 0.25);
}

.maps-verify-thumb {
  position: absolute;
  top: 50%;
  left: 0.15rem;
  width: 1.1rem;
  height: 1.1rem;
  margin-top: -0.55rem;
  border-radius: 50%;
  background: #f8fafc;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
  transition: transform 0.22s cubic-bezier(0.4, 0, 0.2, 1);
}

.maps-verify-switch--on .maps-verify-thumb {
  transform: translateX(1.2rem);
}

.maps-verify-switch--busy .maps-verify-track::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: rgba(15, 23, 42, 0.25);
}

.confirm-overlay {
  z-index: 1200;
}

.confirm-modal-card {
  max-width: 420px;
}

.confirm-modal-body {
  margin: 0;
  padding: 0 1.5rem 1.25rem;
  color: #94a3b8;
  font-size: 0.95rem;
  line-height: 1.55;
}

.confirm-modal-ok--danger {
  background: #dc2626 !important;
  box-shadow: 0 8px 20px rgba(220, 38, 38, 0.35) !important;
}

.confirm-modal-ok--danger:hover:not(:disabled) {
  filter: brightness(1.08);
}

.search-box {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  padding: 0 1rem;
  color: #64748b;
}

.search-box input {
  background: transparent;
  border: none;
  padding: 0.875rem;
  color: #f8fafc;
  outline: none;
  width: 100%;
}

.table-container {
  overflow-x: auto;
}

.premium-table {
  width: 100%;
  border-collapse: collapse;
}

.premium-table th {
  text-align: left;
  padding: 1rem 1.5rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  letter-spacing: 0.05em;
  background: rgba(15, 23, 42, 0.3);
}

.premium-table td {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.premium-table tr:last-child td {
  border-bottom: none;
}

.user-cell {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.session-dot {
  position: absolute;
  bottom: -2px;
  right: -2px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #64748b;
  border: 3px solid #111b21;
  transition: 0.3s;
}

.session-dot.active {
  background: #00a884;
  box-shadow: 0 0 10px rgba(0, 168, 132, 0.5);
}

.avatar {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: white;
  text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.user-name {
  font-weight: 700;
  color: #f8fafc;
}

.user-email {
  color: #64748b;
  font-size: 0.85rem;
}

.badge {
  padding: 0.4rem 0.8rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
}

.badge.admin {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.badge.superadmin {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.badge.user {
  background: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.status-indicator-pill {
  font-size: 0.65rem;
  font-weight: 800;
  padding: 0.25rem 0.5rem;
  border-radius: 6px;
  background: rgba(148, 163, 184, 0.1);
  color: #94a3b8;
  letter-spacing: 0.05em;
}

.status-indicator-pill.active {
  background: rgba(0, 168, 132, 0.1);
  color: #00a884;
}

.action-btn {
  padding: 0.5rem 1rem;
  border-radius: 8px;
  border: 1px solid transparent;
  cursor: pointer;
  font-weight: 600;
  font-size: 0.85rem;
  transition: 0.2s;
}

.action-btn.delete {
  background: rgba(244, 63, 94, 0.05);
  color: #f43f5e;
  border-color: rgba(244, 63, 94, 0.1);
}

.action-btn.delete:hover {
  background: #f43f5e;
  color: white;
}

.action-btn.session-reset {
  background: rgba(245, 158, 11, 0.05);
  color: #f59e0b;
  border-color: rgba(245, 158, 11, 0.1);
}

.action-btn.session-reset:hover {
  background: #f59e0b;
  color: white;
}

.text-right { text-align: right; }

.mono-cell {
  font-family: ui-monospace, monospace;
  font-size: 0.78rem;
  color: #94a3b8;
}

.small-coords {
  max-width: 11rem;
  word-break: break-all;
}

.clamp-cell {
  max-width: 14rem;
  font-size: 0.82rem;
  color: #cbd5e1;
  line-height: 1.4;
}

.badge.maps-cat {
  background: rgba(245, 158, 11, 0.12);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.25);
}

.empty-maps {
  padding: 2rem 1.5rem;
  text-align: center;
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.8);
  backdrop-filter: blur(8px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.modal-card {
  width: 100%;
  max-width: 480px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 2rem;
  box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h2 {
  font-size: 1.5rem;
  font-weight: 800;
  margin: 0;
  color: #f8fafc;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  color: #64748b;
  cursor: pointer;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.form-group input, .form-group select {
  width: 100%;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 0.875rem;
  color: #f8fafc;
  outline: none;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn {
  flex: 1;
  padding: 0.875rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #94a3b8;
  font-weight: 700;
  cursor: pointer;
}

.save-btn {
  flex: 2;
  padding: 0.875rem;
  background: #00a884;
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 700;
  cursor: pointer;
}

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-enter-from, .modal-leave-to { opacity: 0; transform: scale(0.95) translateY(10px); }
</style>
