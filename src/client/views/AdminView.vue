<template>
  <div class="admin-panel">
    <div class="admin-header">
      <div class="header-main">
        <h1 class="page-title">Admin Management</h1>
        <p class="page-subtitle">Manage system users, roles, and permissions.</p>
      </div>
      <button @click="showAddModal = true" class="add-btn">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add New User
      </button>
    </div>

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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { apiFetch } from '../db.js';
import { showToast } from '../toast.js';

const users = ref([]);
const searchQuery = ref('');
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
  if (!confirm(`Hapus user ${user.full_name}?`)) return;
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
  if (!confirm(`Tutup semua sesi aktif untuk user ${user.full_name}?`)) return;
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

onMounted(loadUsers);
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
  align-items: center;
  margin-bottom: 2.5rem;
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
