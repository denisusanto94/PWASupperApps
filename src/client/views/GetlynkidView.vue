<template>
  <div class="getlynkid-container">
    <Teleport to="#app-header-portal">
      <div class="getlynkid-header-inner">
        <h1 class="header-title">getlynk.id</h1>
      </div>
    </Teleport>

    <div v-if="!currentUser" class="auth-screen">
      <div class="auth-card">
        <div class="auth-icon-wrapper">🔗</div>
        <h2>getlynk.id</h2>
        <p>{{ isRegisterMode ? 'Daftar akun baru' : 'Masuk ke editor Anda' }}</p>
        
        <div class="auth-form">
          <input v-model="authForm.username" type="text" placeholder="Username..." class="auth-input" />
          <input v-model="authForm.password" type="password" placeholder="Password..." class="auth-input" />
          
          <button @click="handleAuth" class="btn-auth" :disabled="authLoading">
            {{ isRegisterMode ? 'Daftar' : 'Masuk' }}
          </button>
          
          <button @click="isRegisterMode = !isRegisterMode" class="btn-toggle-auth">
            {{ isRegisterMode ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="getlynkid-layout">
      <!-- Kiri: Konten (70% Desktop) -->
      <section class="editor-section">
        <div v-if="currentUser" class="editor-top-actions">
          <button @click="saveData" class="btn-save-premium" :disabled="saving">
            <svg v-if="!saving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v13a2 2 0 0 1-2 2z"></path>
              <polyline points="17 21 17 13 7 13 7 21"></polyline>
              <polyline points="7 3 7 8 15 8"></polyline>
            </svg>
            <span v-else class="btn-spinner"></span>
            <span>{{ saving ? 'Menyimpan...' : 'Simpan Perubahan' }}</span>
          </button>
        </div>
        <div class="editor-card">
          <div class="editor-header">
            <h2>Editor Konten</h2>
            <button @click="showAddModal = true" class="btn btn-add-block">
              + Tambah Blok Baru
            </button>
          </div>
          <!-- Rest of the code... -->

          <div v-if="blocks.length === 0" class="empty-state">
            <p>Belum ada blok. Klik tombol di atas untuk menambah konten.</p>
          </div>

          <div class="blocks-list">
            <div v-for="(block, index) in blocks" :key="block.id" class="block-item">
              <div class="block-drag-handle">
                <button @click="moveBlock(index, -1)" :disabled="index === 0" class="btn-move" title="Pindah Atas">▲</button>
                <button @click="moveBlock(index, 1)" :disabled="index === blocks.length - 1" class="btn-move" title="Pindah Bawah">▼</button>
              </div>
              <div class="block-content-info">
                <div class="block-type-badge" :class="'type-' + block.type">{{ block.type }}</div>
                <div class="block-main-info">
                  <input v-if="block.type === 'text'" v-model="block.value" placeholder="Masukkan teks..." class="input-inline" />
                  <input v-else-if="block.type === 'link'" v-model="block.label" placeholder="Label Link" class="input-inline" />
                  <div v-else-if="block.type === 'image' || block.type === 'video'" class="file-upload-zone">
                    <input
                      type="file"
                      :id="'file-' + block.id"
                      class="hidden-file-input"
                      :accept="block.type === 'image' ? 'image/*' : 'video/*'"
                      @change="handleFileUpload($event, block)"
                    />
                    <label :for="'file-' + block.id" class="btn-file-select">
                      {{ block.url ? 'Ganti File' : 'Pilih File ' + block.type }}
                    </label>
                    <span v-if="block.fileName" class="file-name-hint">{{ block.fileName }}</span>
                    <input v-model="block.url" placeholder="Atau masukkan URL..." class="input-inline-sub" />
                  </div>
                  <span v-else>{{ block.label || block.type }}</span>
                </div>
                <div v-if="block.type === 'link'" class="block-sub-info">
                  <input v-model="block.url" placeholder="URL Link (https://...)" class="input-inline-sub" />
                </div>
              </div>
              <div class="block-actions">
                <button @click="removeBlock(index)" class="btn-delete" title="Hapus">🗑️</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Kanan: Preview (30% Desktop) -->
      <aside class="preview-section">
        <div class="preview-sticky">
          <div class="mobile-frame-container">
            <div class="mobile-frame">
              <div class="mobile-screen">
                <div class="preview-content">
                  <div class="preview-header">
                    <div class="preview-avatar"></div>
                    <div class="preview-username">@username</div>
                  </div>
                  <div class="preview-blocks">
                    <div v-for="block in blocks" :key="'p-' + block.id" class="preview-block-item" :class="'preview-type-' + block.type">
                      <template v-if="block.type === 'text'">
                        <p>{{ block.value || 'Teks contoh...' }}</p>
                      </template>
                      <template v-else-if="block.type === 'link'">
                        <a :href="block.url" target="_blank" class="preview-link">{{ block.label || 'Klik di sini' }}</a>
                      </template>
                      <template v-else-if="block.type === 'image'">
                        <img v-if="block.url" :src="block.url" class="preview-image" alt="Preview" />
                        <div v-else class="preview-image-placeholder">Gambar</div>
                      </template>
                      <template v-else-if="block.type === 'video'">
                        <video v-if="block.url" :src="block.url" class="preview-video" controls></video>
                        <div v-else class="preview-video-placeholder">▶ Video</div>
                      </template>
                      <template v-else-if="block.type === 'social'">
                        <div class="preview-social-icons">📱 Social Links</div>
                      </template>
                      <template v-else>
                        <div class="preview-generic">{{ block.label || block.type }}</div>
                      </template>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <p class="preview-hint">Preview Tampilan Ponsel</p>
        </div>
      </aside>
    </div>

    <!-- Modal Add Block -->
    <Transition name="modal">
      <div v-if="showAddModal" class="modal-overlay" @click.self="showAddModal = false">
        <div class="modal-box modal-add-block">
          <div class="modal-header">
            <h3>Tambah Blok Baru</h3>
            <button @click="showAddModal = false" class="btn-close">×</button>
          </div>
          <div class="modal-body">
            <div class="category-section">
              <h4>Basic</h4>
              <div class="grid-options">
                <button @click="addBlock('image')" class="option-btn">
                  <span class="option-icon">🖼️</span>
                  <span class="option-label">Image</span>
                </button>
                <button @click="addBlock('text')" class="option-btn">
                  <span class="option-icon">📝</span>
                  <span class="option-label">Text</span>
                </button>
                <button @click="addBlock('link')" class="option-btn">
                  <span class="option-icon">🔗</span>
                  <span class="option-label">Link</span>
                </button>
                <button @click="addBlock('video')" class="option-btn">
                  <span class="option-icon">🎥</span>
                  <span class="option-label">Video</span>
                </button>
                <button @click="addBlock('social')" class="option-btn">
                  <span class="option-icon">👥</span>
                  <span class="option-label">Social Connect</span>
                </button>
              </div>
            </div>
            <div class="category-section">
              <h4>Monetization</h4>
              <div class="grid-options">
                <button @click="addBlock('event')" class="option-btn option-premium">
                  <span class="option-icon">📅</span>
                  <span class="option-label">Event</span>
                </button>
                <button @click="addBlock('product')" class="option-btn option-premium">
                  <span class="option-icon">🛍️</span>
                  <span class="option-label">Affiliate Product</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { 
  authState,
  getModuleData, 
  saveModuleData,
  GETLYNK_DB_NAME
} from '../db.js';
import { showToast } from '../toast.js';

const currentUser = computed(() => authState.user?.email || null);
const currentUserName = computed(() => authState.user?.full_name || currentUser.value);
const isLoggedIn = computed(() => !!authState.user);

const blocks = ref([]);
const showAddModal = ref(false);
const saving = ref(false);
const currentDocId = ref(null);

const addBlock = (type) => {
  const newBlock = {
    id: Date.now().toString(),
    type,
    label: '',
    value: '',
    url: '',
  };
  
  if (type === 'link') newBlock.label = 'New Link';
  if (type === 'text') newBlock.value = 'Teks baru';
  
  blocks.value.push(newBlock);
  showAddModal.value = false;
};

const removeBlock = (index) => {
  blocks.value.splice(index, 1);
};

const moveBlock = (index, direction) => {
  const newIndex = index + direction;
  if (newIndex < 0 || newIndex >= blocks.value.length) return;
  const temp = blocks.value[index];
  blocks.value[index] = blocks.value[newIndex];
  blocks.value[newIndex] = temp;
};

const handleFileUpload = (event, block) => {
  const file = event.target.files[0];
  if (!file) return;
  
  block.fileName = file.name;
  const reader = new FileReader();
  reader.onload = (e) => {
    block.url = e.target.result;
  };
  reader.readAsDataURL(file);
};

const loadData = async () => {
  if (!currentUser.value) return;
  try {
    const results = await getModuleData(GETLYNK_DB_NAME);
    if (results.length > 0) {
      const doc = results[0];
      currentDocId.value = doc.id;
      blocks.value = doc.data.blocks || [];
    } else {
      blocks.value = [
        { id: '1', type: 'text', value: 'Selamat datang di link saya!' },
        { id: '2', type: 'link', label: 'Follow Instagram', url: 'https://instagram.com' },
      ];
    }
  } catch (err) {
    console.warn('Load Getlynk data error:', err);
  }
};

const saveData = async () => {
  if (!currentUser.value) return;
  saving.value = true;
  try {
    const dataToSave = {
      blocks: JSON.parse(JSON.stringify(blocks.value))
    };
    const result = await saveModuleData(GETLYNK_DB_NAME, dataToSave, currentDocId.value);
    if (result.ok && result.id) currentDocId.value = result.id;
    showToast('Perubahan berhasil disimpan ke database!');
  } catch (err) {
    console.error('Save error:', err);
    showToast('Gagal menyimpan perubahan.', 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  if (currentUser.value) loadData();
});

</script>

<style scoped>
.getlynkid-container {
  min-height: 100vh;
  background: #0f172a;
  color: #e2e8f0;
}

.header-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-save {
  padding: 0.4rem 0.8rem !important;
  font-size: 0.85rem !important;
}

/* Auth Screen */
.auth-screen {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh;
  padding: 1rem;
}

.auth-card {
  background: #1e293b;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  border: 1px solid #334155;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}

.auth-icon-wrapper {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.auth-card h2 { margin: 0 0 0.5rem; font-size: 1.5rem; color: #fff; }
.auth-card p { color: #94a3b8; font-size: 0.9rem; margin-bottom: 2rem; }

.auth-input {
  width: 100%;
  background: #0f172a;
  border: 1px solid #334155;
  color: #fff;
  padding: 0.85rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  outline: none;
}

.auth-input:focus { border-color: #25D366; }

.btn-auth {
  width: 100%;
  background: #25D366;
  color: #fff;
  border: none;
  padding: 0.85rem;
  border-radius: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-top: 0.5rem;
  font-size: 1rem;
}

.btn-toggle-auth {
  background: transparent;
  border: none;
  color: #94a3b8;
  padding: 0.65rem;
  margin-top: 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
}

.user-meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #1e293b;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  margin-bottom: 1.5rem;
  border: 1px solid #334155;
  font-size: 0.9rem;
}

.btn-logout {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.2);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}

.getlynkid-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
  align-items: flex-start;
}

@media (min-width: 1024px) {
  .getlynkid-layout {
    grid-template-columns: 7fr 3fr;
  }
}

/* Editor Section */
.editor-section {
  min-width: 0;
}

.editor-top-actions {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.btn-save-premium {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  background: linear-gradient(135deg, #00a884, #059669);
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  font-weight: 700;
  font-size: 0.95rem;
  cursor: pointer;
  box-shadow: 0 6px 20px rgba(0, 168, 132, 0.35);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.btn-save-premium:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 168, 132, 0.45);
  filter: brightness(1.1);
}

.btn-save-premium:active:not(:disabled) {
  transform: translateY(0);
}

.btn-save-premium:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.5);
}

.btn-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spinner 0.8s linear infinite;
}

@keyframes spinner {
  to { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .editor-top-actions {
    position: fixed;
    bottom: 2rem;
    right: 1.5rem;
    z-index: 2000;
    margin-bottom: 0;
  }
  .btn-save-premium {
    padding: 0.85rem 1.75rem;
    font-size: 1rem;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(0, 168, 132, 0.5);
  }
}

.editor-card {
  background: #1e293b;
  border-radius: 16px;
  padding: 1.5rem;
  border: 1px solid #334155;
}

.editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.editor-header h2 {
  margin: 0;
  font-size: 1.1rem;
}

.btn-add-block {
  background: #25D366;
  color: #fff;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

/* Blocks List */
.block-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  background: #0f172a;
  padding: 1rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid #334155;
}

.block-drag-handle {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-move {
  background: #1e293b;
  border: 1px solid #334155;
  color: #94a3b8;
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.7rem;
}

.btn-move:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.block-content-info {
  flex: 1;
  min-width: 0;
}

.block-type-badge {
  display: inline-block;
  font-size: 0.65rem;
  text-transform: uppercase;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  background: #334155;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.type-link { background: rgba(99, 102, 241, 0.2); color: #818cf8; }
.type-image { background: rgba(232, 121, 249, 0.2); color: #f472b6; }
.type-text { background: rgba(37, 211, 102, 0.2); color: #4ade80; }

.input-inline {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #334155;
  color: #fff;
  padding: 0.25rem 0;
  font-size: 1rem;
  margin-bottom: 0.5rem;
}

.input-inline:focus {
  outline: none;
  border-color: #25D366;
}

.input-inline-sub {
  display: block;
  width: 100%;
  background: transparent;
  border: none;
  border-bottom: 1px solid #334155;
  color: #94a3b8;
  padding: 0.2rem 0;
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

/* File Upload */
.file-upload-zone {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.hidden-file-input {
  display: none;
}

.btn-file-select {
  display: inline-block;
  background: #334155;
  color: #e2e8f0;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.85rem;
  cursor: pointer;
  text-align: center;
  border: 1px dashed #475569;
}

.btn-file-select:hover {
  background: #475569;
  border-color: #25D366;
}

.file-name-hint {
  display: block;
  font-size: 0.75rem;
  color: #25D366;
  margin-bottom: 0.25rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-delete {
  background: transparent;
  border: none;
  cursor: pointer;
  font-size: 1rem;
  padding: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.btn-delete:hover {
  opacity: 1;
}

/* Preview Section */
.preview-section {
  position: relative;
}

@media (min-width: 1024px) {
  .preview-sticky {
    position: sticky;
    top: 5rem;
  }
}

.mobile-frame-container {
  display: flex;
  justify-content: center;
  margin-bottom: 1rem;
}

.mobile-frame {
  width: 280px;
  height: 560px;
  background: #000;
  border: 12px solid #334155;
  border-radius: 40px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.mobile-screen {
  width: 100%;
  height: 100%;
  background: #111827;
  overflow-y: auto;
}

.mobile-screen::-webkit-scrollbar {
  width: 4px;
}

.mobile-screen::-webkit-scrollbar-thumb {
  background: #334155;
  border-radius: 10px;
}

.preview-content {
  padding: 2rem 1rem;
  text-align: center;
}

.preview-header {
  margin-bottom: 1.5rem;
}

.preview-avatar {
  width: 64px;
  height: 64px;
  background: #334155;
  border-radius: 50%;
  margin: 0 auto 0.75rem;
}

.preview-username {
  font-weight: 600;
  font-size: 0.9rem;
}

.preview-blocks {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.preview-block-item {
  width: 100%;
}

.preview-type-text p {
  font-size: 0.8rem;
  color: #94a3b8;
  margin: 0;
}

.preview-link {
  display: block;
  background: #fff;
  color: #000;
  text-decoration: none;
  padding: 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
}

.preview-image, .preview-video {
  width: 100%;
  border-radius: 8px;
  display: block;
}

.preview-image-placeholder, .preview-video-placeholder {
  background: #1e293b;
  padding: 2rem 1rem;
  border-radius: 8px;
  font-size: 0.75rem;
  color: #64748b;
  border: 1px dashed #334155;
}

.preview-hint {
  text-align: center;
  font-size: 0.8rem;
  color: #64748b;
}

/* Modal */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-box {
  background: #1e293b;
  width: 100%;
  max-width: 500px;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5);
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #334155;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 { margin: 0; font-size: 1.1rem; }

.btn-close {
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 1.5rem;
  cursor: pointer;
}

.modal-body {
  padding: 1.5rem;
}

.category-section {
  margin-bottom: 2rem;
}

.category-section h4 {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 1rem;
  letter-spacing: 0.05em;
}

.grid-options {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

@media (min-width: 480px) {
  .grid-options {
    grid-template-columns: repeat(3, 1fr);
  }
}

.option-btn {
  background: #0f172a;
  border: 1px solid #334155;
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.option-btn:hover {
  border-color: #25D366;
  background: rgba(37, 211, 102, 0.05);
}

.option-icon { font-size: 1.5rem; }
.option-label { font-size: 0.75rem; font-weight: 500; color: #94a3b8; }

.option-premium {
  border-color: rgba(232, 121, 249, 0.3);
}

/* Transitions */
.modal-enter-active, .modal-leave-active { transition: opacity 0.3s; }
.modal-enter-from, .modal-leave-to { opacity: 0; }

.btn-primary {
  background: #25D366;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
