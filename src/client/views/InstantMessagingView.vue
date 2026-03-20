<template>
  <div class="chat-container">
    <Teleport to="#app-header-portal">
      <div class="getlynkid-header-inner">
        <h1 class="header-title">Chat</h1>
        <div v-if="isLoggedIn" class="header-actions">
          <div class="user-info">
            <span class="online-dot" :class="{ syncing: isSyncing }"></span>
            <span class="user-badge">{{ currentUser }}</span>
          </div>
          <button @click="logout" class="btn-logout" title="Keluar">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg>
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Login Screen -->
    <div v-if="!isLoggedIn" class="login-screen">
      <div class="login-card">
        <div class="login-icon-wrapper">💬</div>
        <h2>Akses Chat</h2>
        <p>{{ isRegisterMode ? 'Daftar akun chat baru' : 'Masuk menggunakan akun Anda' }}</p>
        <div class="login-form">
          <input 
            v-model="usernameInput" 
            type="text" 
            placeholder="Username..." 
            class="login-input"
            autofocus
          />
          <input 
            v-model="passwordInput" 
            @keyup.enter="handleAuth" 
            type="password" 
            placeholder="Password..." 
            class="login-input"
          />
          <button @click="handleAuth" class="btn-login" :disabled="!usernameInput.trim() || !passwordInput.trim() || authLoading">
            {{ isRegisterMode ? 'Daftar & Masuk' : 'Masuk' }}
          </button>
          
          <button @click="isRegisterMode = !isRegisterMode" class="btn-toggle-auth">
            {{ isRegisterMode ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar' }}
          </button>
        </div>
        <div class="login-footer">AES-256 SECURED</div>
      </div>
    </div>

    <!-- Main Chat UI -->
    <div v-else class="chat-main" :class="{ 'contact-selected': !!selectedContact }">
      <!-- Sidebar -->
      <aside class="chat-sidebar">
        <div class="sidebar-header">
          <div class="header-top">
            <h3>Pesan</h3>
            <button @click="openNewChatModal" class="btn-new-chat" title="Tambah Chat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <div class="search-bar">
            <div class="search-inner">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
              <input v-model="contactSearchTerm" type="text" placeholder="Cari teman..." />
            </div>
          </div>
        </div>
        
        <div class="contact-list custom-scrollbar">
          <div v-if="filteredChatList.length === 0" class="empty-list">
            <p>{{ contactSearchTerm ? 'Tidak ditemukan' : 'Belum ada chat' }}</p>
          </div>
          <div 
            v-for="chat in filteredChatList" 
            :key="chat.username" 
            class="contact-item"
            :class="{ active: selectedContact?.username === chat.username }"
            @click="selectContact(chat)"
          >
            <div class="avatar-wrapper">
              <div class="contact-avatar" :style="{ background: getAvatarColor(chat.username) }">
                {{ chat.username[0].toUpperCase() }}
              </div>
            </div>
            <div class="contact-info">
              <div class="contact-name-row">
                <span class="contact-name">{{ chat.username }}</span>
                <span class="contact-time text-truncate">{{ formatTimeShort(chat.timestamp) }}</span>
              </div>
              <div class="contact-last-msg text-truncate">{{ chat.lastMessage }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Chat Window -->
      <main class="chat-window">
        <template v-if="selectedContact">
          <div class="chat-header">
            <button @click="selectedContact = null" class="btn-back-mobile" aria-label="Kembali">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div class="contact-header-wrap">
              <div class="contact-avatar-sm" :style="{ background: getAvatarColor(selectedContact.username) }">
                {{ selectedContact.username[0].toUpperCase() }}
              </div>
              <div class="chat-header-info">
                <div class="chat-header-name text-truncate">{{ selectedContact.username }}</div>
                <div class="chat-header-status">online</div>
              </div>
            </div>
            <div class="chat-header-actions">
              <button @click="startCall('audio')" class="btn-action-icon" title="Voice Call">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.82 12.82 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
              </button>
              <button @click="startCall('video')" class="btn-action-icon" title="Video Call">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
              </button>
            </div>
          </div>

          <div class="chat-messages-scroll custom-scrollbar" ref="messageBox">
            <div class="chat-bg-overlay"></div>
            
            <div class="chat-messages-inner">
              <div v-if="messages.length === 0" class="start-chat-notice">
                🔒 Enkripsi ujung-ke-ujung aktif
              </div>

              <div 
                v-for="(msg, idx) in messages" 
                :key="msg._id" 
                class="message-row"
                :class="[
                  msg.from === currentUser ? 'msg-me' : 'msg-them',
                  isSameUser(msg, messages[idx-1]) ? 'msg-continuous' : 'msg-new'
                ]"
              >
                <div class="message-bubble">
                  <div v-if="msg.file" class="message-media">
                    <img v-if="msg.fileType?.startsWith('image/')" :src="msg.file" class="media-img" @click="openImage(msg.file)" loading="lazy" />
                    <div v-else-if="msg.fileType?.startsWith('video/')" class="media-video-wrap">
                      <video :src="msg.file" controls class="media-video"></video>
                    </div>
                    <audio v-else-if="msg.fileType?.startsWith('audio/')" :src="msg.file" controls class="media-audio"></audio>
                    <a v-else :href="msg.file" :download="msg.fileName" class="media-file">
                      <span class="file-icon">📄</span>
                      <span class="file-info text-truncate">{{ msg.fileName }}</span>
                      <span class="file-dl">↓</span>
                    </a>
                  </div>
                  
                  <div class="message-text" v-if="msg.text">{{ msg.text }}</div>
                  
                  <div class="message-meta">
                    <span class="msg-time">{{ formatTime(msg.timestamp) }}</span>
                    <span v-if="msg.from === currentUser" class="msg-status read">
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6L9 17l-5-5"/></svg>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Chat Input Area -->
          <div class="chat-input-area">
            <div class="input-container-inner">
              <input type="file" ref="fileInput" class="hidden" @change="handleFileSelect" accept="image/*,video/*,audio/*,.pdf,.doc,.docx" />
              <button @click="$refs.fileInput.click()" class="btn-input-action" aria-label="Lampirkan file">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"></path></svg>
              </button>
              
              <div class="input-field-wrap">
                <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="Ketik pesan..." class="chat-input-field" />
              </div>

              <button @click="sendMessage" class="btn-send-circle" :disabled="!newMessage.trim() && !pendingFile">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </button>
            </div>
          </div>
        </template>
        
        <div v-else class="chat-empty-state">
          <div class="empty-icon-wrap">💬</div>
          <h3>Pilih Teman Chat</h3>
          <p>Mulailah percakapan aman di sini.</p>
          <button @click="openNewChatModal" class="btn-start-chat-empty">Mulai Chat Baru</button>
        </div>
      </main>
    </div>

    <!-- Modals -->
    <Transition name="modal-bounce">
      <div v-if="showNewChatModal" class="modal-overlay" @click.self="showNewChatModal = false">
        <div class="modal-card">
          <div class="modal-header">
            <h3>Cari Teman</h3>
            <button @click="showNewChatModal = false" class="btn-modal-close">×</button>
          </div>
          <div class="modal-body">
            <input v-model="newChatUsername" type="text" placeholder="Ketik username teman..." class="modal-input-field" @keyup.enter="startNewChat" ref="newChatInput" />
          </div>
          <div class="modal-footer">
            <button @click="startNewChat" class="btn-modal-primary" :disabled="!newChatUsername.trim()">Mulai</button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="previewImage" class="image-preview-full" @click="previewImage = null">
      <img :src="previewImage" />
    </div>

    <!-- Incoming Call Mock -->
    <Transition name="fade">
      <div v-if="activeCall" class="call-overlay-screen">
        <div class="call-content-box">
          <div class="call-avatar-circle" :style="{ background: getAvatarColor(activeCall.user) }">
            {{ activeCall.user[0].toUpperCase() }}
          </div>
          <h2 class="text-truncate">{{ activeCall.user }}</h2>
          <p>{{ callStatus }}</p>
          <button @click="endCall" class="btn-call-hangup">Akhiri Panggilan</button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch } from 'vue';
import PouchDB from 'pouchdb-browser';
import { CHAT_DB_NAME, CHAT_USERS_DB_NAME, syncModule } from '../db.js';
import { showToast } from '../toast.js';

// DB Config
const db = new PouchDB(CHAT_DB_NAME);
const userDb = new PouchDB(CHAT_USERS_DB_NAME);

// State
const currentUser = ref(localStorage.getItem('chat_username') || null);
const isLoggedIn = computed(() => !!currentUser.value);
const isSyncing = ref(false);
const usernameInput = ref('');
const passwordInput = ref('');
const isRegisterMode = ref(false);
const authLoading = ref(false);
const selectedContact = ref(null);
const messages = ref([]);
const newMessage = ref('');
const chatList = ref([]);
const contactSearchTerm = ref('');
const showNewChatModal = ref(false);
const newChatUsername = ref('');
const previewImage = ref(null);
const activeCall = ref(null);
const callStatus = ref('Calling...');
const messageBox = ref(null);
const pendingFile = ref(null);
const fileInput = ref(null);
const newChatInput = ref(null);

const SECRET_KEY = 'pwasupperapps_secret_v2';

// Encryption utils
async function deriveKey(username) {
  const enc = new TextEncoder();
  const keyMat = await window.crypto.subtle.importKey('raw', enc.encode(SECRET_KEY + username), 'PBKDF2', false, ['deriveKey']);
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('chat-salt-3'), iterations: 100000, hash: 'SHA-256' }, keyMat, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

async function encrypt(text, to) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(to);
  const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  return { data: btoa(String.fromCharCode(...new Uint8Array(encrypted))), iv: btoa(String.fromCharCode(...iv)) };
}

async function decrypt(obj, from) {
  const key = await deriveKey(from);
  const iv = new Uint8Array(atob(obj.iv).split('').map(c => c.charCodeAt(0)));
  const data = new Uint8Array(atob(obj.data).split('').map(c => c.charCodeAt(0)));
  try {
    const dec = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new TextDecoder().decode(dec);
  } catch (e) { return '[Terenkripsi]'; }
}

// Logic
const getAvatarColor = (name) => {
  const colors = ['#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#009688', '#4caf50', '#ff9800'];
  let h = 0; for(let i=0; i<name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatTimeShort = (ts) => {
  const d = new Date(ts);
  return d.toDateString() === new Date().toDateString() ? formatTime(ts) : d.toLocaleDateString([], { day: '2-digit', month: '2' });
};

const isSameUser = (msg, prev) => prev && msg.from === prev.from && (msg.timestamp - prev.timestamp < 120000);

const handleAuth = async () => {
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  if (!username || !password) return;
  
  authLoading.value = true;
  try {
    if (isRegisterMode.value) {
      try {
        await userDb.get(username);
        showToast('Username sudah dipakai, silakan gunakan username lain atau login.', 'error');
      } catch (err) {
        if (err.status === 404) {
          await userDb.put({ _id: username, password, createdAt: new Date().toISOString() });
          showToast('Pendaftaran berhasil! Silakan masuk.');
          isRegisterMode.value = false;
        } else throw err;
      }
    } else {
      try {
        const user = await userDb.get(username);
        if (user.password === password) {
          currentUser.value = username;
          localStorage.setItem('chat_username', username);
          initApp();
        } else {
          showToast('Password salah.', 'error');
        }
      } catch (err) {
        if (err.status === 404) showToast('User tidak ditemukan.', 'error');
        else throw err;
      }
    }
  } catch (err) {
    console.error('Auth error:', err);
    showToast('Gagal autentikasi.', 'error');
  } finally {
    authLoading.value = false;
  }
};

const logout = () => { currentUser.value = null; localStorage.removeItem('chat_username'); selectedContact.value = null; };

const scrollToBottom = (behavior = 'smooth') => {
  nextTick(() => { if (messageBox.value) messageBox.value.scrollTo({ top: messageBox.value.scrollHeight, behavior }); });
};

const startSync = () => {
  syncModule(db, CHAT_DB_NAME);
  syncModule(userDb, CHAT_USERS_DB_NAME);
  
  db.changes({ live: true, since: 'now', include_docs: true }).on('change', () => { refreshUI(); });
};

const refreshUI = async () => {
  await loadChatList();
  if (selectedContact.value) await loadMessages(selectedContact.value.username);
};

const loadChatList = async () => {
  const res = await db.allDocs({ include_docs: true });
  const all = res.rows.map(r => r.doc).filter(d => d.type === 'chat_msg');
  const groups = {};
  all.forEach(m => {
    const other = m.from === currentUser.value ? m.to : m.from;
    if (!groups[other] || groups[other].timestamp < m.timestamp) {
      groups[other] = { username: other, lastMessage: m.textPreview || 'Media', timestamp: m.timestamp };
    }
  });
  chatList.value = Object.values(groups).sort((a,b) => b.timestamp - a.timestamp);
};

const filteredChatList = computed(() => {
  const q = contactSearchTerm.value.toLowerCase().trim();
  if (!q) return chatList.value;
  return chatList.value.filter(c => c.username.toLowerCase().includes(q));
});

const selectContact = async (contact) => {
  selectedContact.value = contact;
  await loadMessages(contact.username);
  scrollToBottom('auto');
};

const loadMessages = async (other) => {
  const res = await db.allDocs({ include_docs: true });
  const msgs = res.rows.map(r => r.doc)
    .filter(d => d.type === 'chat_msg' && ((d.from === currentUser.value && d.to === other) || (d.from === other && d.to === currentUser.value)))
    .sort((a,b) => a.timestamp - b.timestamp);
  
  for(let m of msgs) if(m.encrypted && !m.text) m.text = await decrypt(m.encrypted, other);
  messages.value = msgs;
};

const sendMessage = async () => {
  if (!newMessage.value.trim() && !pendingFile.value) return;
  const to = selectedContact.value.username;
  const text = newMessage.value;
  const encrypted = await encrypt(text, to);
  const msgDoc = {
    _id: `chat_${Date.now()}_${Math.random().toString(34).slice(2, 6)}`,
    type: 'chat_msg', from: currentUser.value, to, encrypted,
    textPreview: text.substring(0, 30) || 'Media', timestamp: Date.now()
  };
  if (pendingFile.value) { 
    msgDoc.file = pendingFile.value.data; 
    msgDoc.fileName = pendingFile.value.name; 
    msgDoc.fileType = pendingFile.value.type; 
  }
  await db.put(msgDoc);
  newMessage.value = ''; pendingFile.value = null;
  await refreshUI();
  scrollToBottom();
};

const handleFileSelect = (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => { pendingFile.value = { name: file.name, type: file.type, data: ev.target.result }; sendMessage(); };
  reader.readAsDataURL(file);
};

const openNewChatModal = () => { showNewChatModal.value = true; nextTick(() => newChatInput.value?.focus()); };

const startNewChat = () => {
  if (!newChatUsername.value.trim()) return;
  const user = newChatUsername.value.trim();
  selectContact({ username: user, lastMessage: '' });
  showNewChatModal.value = false; newChatUsername.value = '';
};

const startCall = (u) => { activeCall.value = { user: selectedContact.value.username }; callStatus.value = 'Connecting...'; setTimeout(() => callStatus.value = 'Calling...', 1200); };
const endCall = () => activeCall.value = null;
const openImage = (url) => previewImage.value = url;

function initApp() {
  loadChatList();
  startSync();
}

const clearAllData = async () => {
  const pwd = prompt('Masukkan Password untuk menghapus seluruh data chat:');
  if (pwd === '12345678') {
    if (confirm('Apakah Anda yakin ingin menghapus SELURUH data chat secara permanen?')) {
      try {
        await db.destroy();
        localStorage.removeItem('chat_username');
        location.reload();
      } catch (err) {
        showToast('Gagal menghapus data: ' + err.message, 'error');
      }
    }
  } else if (pwd !== null) {
    showToast('Password Salah!', 'error');
  }
};

onMounted(() => { if (isLoggedIn.value) initApp(); });
</script>

<style scoped>
.chat-container { height: calc(100vh - 56px); display: flex; flex-direction: column; background: #0b141a; overflow: hidden; }

/* Scroll */
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }

/* Login */
.login-screen { flex: 1; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at center, #111b21 0%, #0b141a 100%); padding: 1rem; }
.login-card { background: #202c33; padding: 2rem 1.5rem; border-radius: 16px; width: 100%; max-width: 300px; text-align: center; border: 1px solid rgba(255,255,255,0.03); box-shadow: 0 15px 40px rgba(0,0,0,0.4); }
.login-icon-wrapper { font-size: 2.25rem; margin-bottom: 0.5rem; }
.login-card h2 { margin: 0 0 0.25rem; font-size: 1.35rem; color: #fff; }
.login-card p { color: #8696a0; font-size: 0.8rem; margin-bottom: 2rem; }
.login-input { width: 100%; background: #111b21; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 0.75rem; border-radius: 10px; margin-bottom: 1rem; font-size: 0.9rem; outline: none; }
.btn-login { width: 100%; background: #00a884; color: #fff; border: none; padding: 0.75rem; border-radius: 10px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
.btn-clear-data { width: 100%; background: transparent; border: 1px solid rgba(234, 67, 53, 0.3); color: #ea4335; padding: 0.65rem; border-radius: 10px; font-weight: 600; font-size: 0.75rem; margin-top: 0.75rem; cursor: pointer; transition: all 0.2s; }
.btn-clear-data:hover { background: rgba(234, 67, 53, 0.1); border-color: #ea4335; }
.btn-toggle-auth { background: transparent; border: none; color: #8696a0; padding: 0.65rem; margin-top: 0.25rem; cursor: pointer; font-size: 0.75rem; text-decoration: underline; width: 100%; }
.login-footer { margin-top: 1.5rem; font-size: 0.6rem; color: #667781; letter-spacing: 0.1em; }

/* Main */
.chat-main { flex: 1; display: flex; overflow: hidden; position: relative; }

/* Sidebar */
.chat-sidebar { width: 300px; border-right: 1px solid rgba(255,255,255,0.03); display: flex; flex-direction: column; background: #111b21; transition: transform 0.3s; }
.sidebar-header { padding: 0.75rem 1rem; }
.header-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; }
.header-top h3 { margin: 0; font-size: 1.1rem; color: #fff; font-weight: 700; }
.btn-new-chat { background: #202c33; color: #00a884; border: none; width: 32px; height: 32px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform 0.1s; }
.btn-new-chat:active { transform: scale(0.9); }

.search-inner { background: #202c33; border-radius: 10px; display: flex; align-items: center; padding: 0 0.75rem; gap: 0.6rem; color: #8696a0; }
.search-inner input { flex: 1; height: 34px; background: transparent; border: none; color: #fff; font-size: 0.85rem; outline: none; }

.contact-list { flex: 1; overflow-y: auto; }
.empty-list { text-align: center; padding: 3rem 1rem; color: #8696a0; font-size: 0.85rem; }

.contact-item { display: flex; align-items: center; gap: 0.75rem; padding: 0.7rem 1rem; cursor: pointer; transition: background 0.1s; border-bottom: 1px solid rgba(255,255,255,0.01); }
.contact-item:hover { background: #202c33; }
.contact-item.active { background: #2a3942; }
.contact-avatar { width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; color: #fff; font-size: 1rem; border: 2px solid #111b21; }
.contact-info { flex: 1; min-width: 0; }
.contact-name-row { display: flex; justify-content: space-between; gap: 0.5rem; margin-bottom: 0.15rem; }
.contact-name { font-weight: 600; font-size: 0.92rem; color: #e9edef; }
.contact-time { font-size: 0.65rem; color: #8696a0; white-space: nowrap; }
.contact-last-msg { font-size: 0.8rem; color: #8696a0; }

/* Window */
.chat-window { flex: 1; display: flex; flex-direction: column; background: #0b141a; position: relative; min-width: 0; }
.chat-header { padding: 0.5rem 0.75rem; background: #202c33; display: flex; align-items: center; gap: 0.6rem; z-index: 10; height: 50px; }
.btn-back-mobile { background: transparent; border: none; color: #fff; cursor: pointer; padding: 0.4rem; display: none; }
.contact-header-wrap { flex: 1; display: flex; align-items: center; gap: 0.6rem; min-width: 0; }
.contact-avatar-sm { width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 600; color: #fff; font-size: 0.85rem; flex-shrink: 0; }
.chat-header-info { min-width: 0; }
.chat-header-name { font-weight: 600; font-size: 0.9rem; color: #fff; }
.chat-header-status { font-size: 0.65rem; color: #00a884; font-weight: 500; }

.chat-header-actions { display: flex; gap: 0.25rem; }
.btn-action-icon { background: transparent; border: none; color: #aebac1; cursor: pointer; padding: 0.5rem; border-radius: 50%; }
.btn-action-icon:hover { background: rgba(255,255,255,0.05); color: #fff; }

.chat-messages-scroll { flex: 1; overflow-y: auto; position: relative; scroll-behavior: smooth; }
.chat-messages-inner { padding: 1rem; display: flex; flex-direction: column; gap: 3px; position: relative; z-index: 1; }
.chat-bg-overlay { position: absolute; inset: 0; opacity: 0.03; background-image: radial-gradient(#fff 1px, transparent 1px); background-size: 15px 15px; }

.start-chat-notice { background: rgba(0,0,0,0.25); padding: 0.4rem 0.75rem; border-radius: 6px; font-size: 0.65rem; color: #8696a0; align-self: center; margin-bottom: 1.5rem; }

.message-row { display: flex; width: 100%; }
.msg-me { justify-content: flex-end; }
.msg-them { justify-content: flex-start; }
.msg-new { margin-top: 8px; }

.message-bubble { max-width: 75%; padding: 0.35rem 0.5rem; border-radius: 8px; position: relative; box-shadow: 0 1px 0.5px rgba(0,0,0,0.1); }
.msg-me .message-bubble { background: #005c4b; color: #e9edef; border-top-right-radius: 0; }
.msg-them .message-bubble { background: #202c33; color: #e9edef; border-top-left-radius: 0; }
.msg-continuous .message-bubble { border-radius: 8px !important; }

.message-text { font-size: 0.9rem; line-height: 1.45; word-break: break-word; }
.message-meta { display: flex; justify-content: flex-end; align-items: center; gap: 0.25rem; margin-top: 0.1rem; opacity: 0.7; }
.msg-time { font-size: 0.6rem; }
.msg-status.read { color: #53bdeb; }

/* Input */
.chat-input-area { padding: 0.5rem 0.75rem; background: #202c33; }
.input-container-inner { display: flex; align-items: center; gap: 0.4rem; max-width: 900px; margin: 0 auto; }
.btn-input-action { background: transparent; border: none; color: #8696a0; padding: 0.5rem; cursor: pointer; }
.input-field-wrap { flex: 1; background: #2a3942; border-radius: 12px; }
.chat-input-field { width: 100%; height: 38px; border: none; background: transparent; color: #fff; padding: 0 0.8rem; font-size: 0.9rem; outline: none; }
.btn-send-circle { width: 38px; height: 38px; background: #00a884; color: #fff; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; }
.btn-send-circle:disabled { background: #334155; opacity: 0.5; }

/* Media */
.media-img { border-radius: 4px; max-width: 100%; cursor: pointer; margin-bottom: 0.2rem; }
.media-video { border-radius: 4px; max-width: 100%; display: block; }
.media-audio { width: 100%; max-width: 220px; height: 32px; }
.media-file { display: flex; align-items: center; gap: 0.5rem; background: rgba(0,0,0,0.1); padding: 0.5rem; border-radius: 6px; text-decoration: none; color: #fff; margin-bottom: 0.2rem; }
.file-info { flex: 1; font-size: 0.8rem; font-weight: 500; }

/* Modals */
.modal-overlay { position: fixed; inset: 0; background: rgba(11,20,26,0.8); backdrop-filter: blur(2px); z-index: 2000; display: flex; align-items: center; justify-content: center; }
.modal-card { background: #222e35; width: 85%; max-width: 300px; border-radius: 12px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
.modal-header { padding: 0.8rem 1rem; border-bottom: 1px solid rgba(255,255,255,0.04); display: flex; justify-content: space-between; align-items: center; }
.modal-header h3 { margin:0; font-size: 0.95rem; }
.modal-body { padding: 1rem; }
.modal-input-field { width: 100%; background: #111b21; border: 1px solid rgba(255,255,255,0.08); color: #fff; padding: 0.65rem; border-radius: 8px; font-size: 0.85rem; outline: none; }
.modal-footer { padding: 0.5rem 1rem 1rem; display: flex; justify-content: flex-end; }
.btn-modal-primary { background: #00a884; color: #fff; border: none; padding: 0.5rem 1.25rem; border-radius: 6px; font-weight: 700; cursor: pointer; }

/* Call/Preview */
.call-overlay-screen { position: fixed; inset: 0; background: rgba(11,20,26,0.95); z-index: 3000; display: flex; align-items: center; justify-content: center; text-align: center; }
.call-avatar-circle { width: 80px; height: 80px; border-radius: 50%; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: #fff; }
.btn-call-hangup { background: #ea4335; color: #fff; border: none; padding: 0.7rem 1.75rem; border-radius: 30px; font-weight: 700; cursor: pointer; margin-top: 1.5rem; }
.image-preview-full { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 4000; display: flex; align-items: center; justify-content: center; }
.image-preview-full img { max-width: 95%; max-height: 95%; }

/* Mobile */
@media (max-width: 768px) {
  .chat-sidebar { width: 100%; }
  .chat-window { position: absolute; inset: 0; display: none; }
  .chat-main.contact-selected .chat-window { display: flex; }
  .btn-back-mobile { display: block; }
  .message-bubble { max-width: 85%; }
}

.getlynkid-header-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.header-title { font-size: 0.95rem; color: #00a884; font-weight: 700; margin: 0; }
.user-info { display: flex; align-items: center; gap: 0.4rem; }
.online-dot { width: 7px; height: 7px; background: #3b82f6; border-radius: 50%; }
.online-dot.syncing { background: #00a884; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.4; } 100% { opacity: 1; } }
.user-badge { font-weight: 600; font-size: 0.8rem; color: #fff; }
.btn-logout { background: transparent; border: none; color: #8696a0; cursor: pointer; padding: 0.2rem; display: flex; align-items: center; }

.text-truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.text-600 { font-weight: 600; }
.hidden { display: none; }

/* Transitions */
.modal-bounce-enter-active { animation: bounce-in 0.3s; }
@keyframes bounce-in { 0% { transform: scale(0.9); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
</style>
