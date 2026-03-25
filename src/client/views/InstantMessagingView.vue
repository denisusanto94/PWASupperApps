<template>
  <div class="chat-container">
    <Teleport to="#app-header-portal">
      <div class="getlynkid-header-inner">
        <div class="flex items-center gap-2">
           <div class="security-badge-orb">
             <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
           </div>
           <h1 class="header-vault-title">Instant Chat</h1>
        </div>
      </div>
    </Teleport>

    <!-- Logout Confirmation Modal -->
    <Transition name="fade">
      <div v-if="showLogoutConfirm" class="confirm-overlay" @click.self="showLogoutConfirm = false">
        <div class="confirm-card-premium">
          <div class="exit-icon">🚪</div>
          <h3>Close Session?</h3>
          <p>Sesi enkripsi akan dihentikan seketika.</p>
          <div class="confirm-actions-row">
            <button @click="showLogoutConfirm = false" class="btn-ghost">Batal</button>
            <button @click="logout" class="btn-danger-shiny">LOGOUT</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Login Screen -->
    <div v-if="!isLoggedIn" class="login-screen">
      <div class="login-card-vault">
        <div class="vault-icon-box">
           <div class="icon-inner-glow">
             <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
           </div>
        </div>
        <h2 class="vault-title">Login Instant Chat</h2>
        <p class="vault-subtitle">{{ isRegisterMode ? 'Daftar akun baru' : 'Masuk ke akun Anda' }}</p>
        
        <div class="vault-form">
          <div class="vault-input-wrap">
            <input v-model="usernameInput" type="text" placeholder="Username (tanpa spasi)" class="v-input" @input="usernameInput = usernameInput.replace(/\s/g, '')" />
          </div>
          <div class="vault-input-wrap">
            <input v-model="passwordInput" @keyup.enter="handleAuth" type="password" placeholder="Unique Passphrase..." class="v-input" />
          </div>
          
          <button @click="handleAuth" class="btn-vault-action" :disabled="authLoading">
            <span v-if="!authLoading">{{ isRegisterMode ? 'REGISTER' : 'LOGIN' }}</span>
            <div v-else class="loader-dots"><span>.</span><span>.</span><span>.</span></div>
          </button>
          
          <button @click="isRegisterMode = !isRegisterMode" class="btn-switch-vault">
            {{ isRegisterMode ? 'Kembali ke Login' : 'Registrasi' }}
          </button>
        </div>
        <!-- <div class="v-footer">SECURED BY MILITARY CRYPTOGRAPHY</div> -->
      </div>
    </div>

    <!-- Main Chat UI -->
    <div v-else class="chat-main" :class="{ 'contact-selected': !!selectedContact }">
      <!-- Sidebar -->
      <aside class="chat-sidebar-premium">
        <div class="sidebar-top-box">
          <div class="flex items-center justify-between mb-6">
            <h3 class="session-title">Secured Sessions</h3>
            <button @click="openNewChatModal" class="btn-add-session" title="Tambah Chat">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
            </button>
          </div>
          <div class="search-vault-box">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" opacity="0.4"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            <input v-model="contactSearchTerm" type="text" placeholder="Search sessions..." />
          </div>
        </div>
        
        <div class="sessions-list custom-scrollbar">
          <div v-if="filteredChatList.length === 0" class="empty-sessions">
            <p>No active sessions found.</p>
          </div>
          
          <div v-for="chat in filteredChatList" :key="chat.username" 
               class="session-row" :class="{ is_active: selectedContact?.username === chat.username }"
               @click="selectContact(chat)">
            <div class="session-avatar" :style="{ background: getAvatarColor(chat.username) }">
              {{ chat.username[0].toUpperCase() }}
              <div v-if="chat.isOnline" class="pulse-online"></div>
            </div>
            <div class="session-info">
              <div class="session-meta">
                <span class="session-name">{{ chat.username }}</span>
                <span class="session-time">{{ formatTimeShort(chat.timestamp) }}</span>
              </div>
              <div class="session-status">{{ chat.isOnline ? 'Active Now' : 'Encrypted Tunnel Passive' }}</div>
            </div>
          </div>
        </div>
      </aside>

      <!-- Chat Window -->
      <main class="chat-viewport-premium">
        <template v-if="selectedContact">
          <div class="viewport-header-premium">
            <button @click="selectedContact = null" class="btn-nav-back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            </button>
            <div class="header-recipient">
              <div class="recipient-avatar" :style="{ background: getAvatarColor(selectedContact.username) }">
                {{ selectedContact.username[0].toUpperCase() }}
              </div>
              <div class="recipient-label">
                <div class="recipient-name">{{ selectedContact.username }}</div>
                <div class="recipient-lock-status">
                   <svg v-if="selectedContact.isOnline" width="8" height="8" viewBox="0 0 24 24" fill="#00a884" class="mr-1 animate-pulse"><circle cx="12" cy="12" r="10"/></svg>
                   <svg v-else width="8" height="8" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/></svg>
                   <span>{{ selectedContact.isOnline ? 'Online Now' : 'End-to-End Encrypted' }}</span>
                </div>
              </div>
            </div>
            <div class="header-tools" v-if="selectedContact">
               <button 
                  class="t-btn" 
                  :disabled="!onlineStatusMap[selectedContact.username]" 
                  @click="initiateCall('audio')"
                  :title="onlineStatusMap[selectedContact.username] ? 'Audio Call' : 'User Offline'"
               >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.82 12.82 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
               </button>
               <button 
                  class="t-btn" 
                  :disabled="!onlineStatusMap[selectedContact.username]" 
                  @click="initiateCall('video')"
                  :title="onlineStatusMap[selectedContact.username] ? 'Video Call' : 'User Offline'"
               >
                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>
               </button>
            </div>
          </div>

          <!-- Message Feed -->
          <div class="viewport-feed custom-scrollbar" ref="messageBox">
            <div class="mesh-background"></div>
            <div class="feed-inner">
              <div v-if="messages.length === 0" class="entry-notice">
                 Begin your secure conversation. No data leaves this session unencrypted.
              </div>
              
              <div v-for="(msg, idx) in messages" :key="msg._id" 
                   class="msg-group" :class="[msg.from === currentUser ? 'is-me' : 'is-them']">
                
                <div class="msg-bubble-premium" :class="{ 'is-call-log': msg.isCallLog }">
                  <!-- Media Box -->
                  <div v-if="msg.file" class="msg-media-box">
                     <img v-if="msg.fileType?.startsWith('image/')" :src="msg.file" @click="openImage(msg.file)" loading="lazy" />
                     <video v-else-if="msg.fileType?.startsWith('video/')" :src="msg.file" controls></video>
                     <audio v-else-if="msg.fileType?.startsWith('audio/')" :src="msg.file" controls></audio>
                     <a v-else :href="msg.file" :download="msg.fileName" class="msg-file-pill">
                        <div class="fp-icon">📄</div>
                        <div class="fp-text truncate">{{ msg.fileName }}</div>
                        <div class="fp-arrow">↓</div>
                     </a>
                  </div>

                  <div class="msg-text-content" v-if="msg.text">{{ msg.text }}</div>
                  <div class="msg-text-content italic font-light opacity-50" v-else-if="msg.encrypted && !msg.text">[Outdated Session Key / Pre-update]</div>
                  
                  <div class="msg-footer-meta">
                    <span class="m-time">{{ formatTime(msg.timestamp) }}</span>
                    <div v-if="msg.from === currentUser" class="m-check">
                       <svg v-if="msg.status === 'read'" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="4"><path d="M20 6L9 17l-5-5M9 17l11-11M20 12l-11 5-5-5"/></svg>
                       <svg v-else width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="4"><path d="M20 6L9 17l-5-5"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Input Controls -->
          <div class="viewport-controls">
            <div class="controls-inner">
               <input type="file" ref="fileInput" class="hidden" @change="handleFileSelect" />
               <button @click="$refs.fileInput.click()" class="btn-attach">
                 <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></svg>
               </button>
               <div class="composer-box">
                 <input v-model="newMessage" @keyup.enter="sendMessage" type="text" placeholder="Type your secure message..." class="composer-input" />
               </div>
               <button @click="sendMessage" class="btn-send-neon" :disabled="!newMessage.trim() && !pendingFile">
                 <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
               </button>
            </div>
          </div>
        </template>
        
        <!-- Empty State -->
        <template v-else>
          <div class="viewport-placeholder">
             <div class="placeholder-content">
                <div class="shield-orb-large">
                   <div class="shield-ripple"></div>
                   <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="url(#shield-grad)" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                   <defs>
                     <linearGradient id="shield-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                       <stop offset="0%" style="stop-color:#00a884;stop-opacity:1" />
                       <stop offset="100%" style="stop-color:#0ea5e9;stop-opacity:1" />
                     </linearGradient>
                   </defs>
                </div>
                <h2 class="placeholder-title">SECURED MESSAGING</h2>
                <p class="placeholder-desc">No message history is visible without a session key. Select a contact to initiate a secure tunnel.</p>
                <button @click="openNewChatModal" class="btn-action-primary">Search New Connection</button>
             </div>
          </div>
        </template>
      </main>
    </div>

    <!-- Modals -->
    <Transition name="modal-bounce">
      <div v-if="showNewChatModal" class="modal-backdrop" @click.self="showNewChatModal = false">
        <div class="modal-window-premium">
          <div class="modal-head">
            <h3>Daftar User</h3>
            <button @click="showNewChatModal = false" class="btn-close-modal">×</button>
          </div>
          <div class="modal-body-premium">
            <div class="mod-input-wrap mb-4">
               <input v-model="newChatUsername" @input="newChatUsername = newChatUsername.replace(/\s/g, '')" type="text" placeholder="Search target username..." class="mod-input" @keyup.enter="startNewChat" ref="newChatInput" />
            </div>
            
            <div class="user-suggestions-box custom-scrollbar">
               <div v-if="suggestedUsers.length === 0" class="text-center py-4 opacity-50 text-xs">No matching users found.</div>
               <div v-for="user in suggestedUsers" :key="user" class="suggest-row" @click="selectSuggestedUser(user)">
                  <div class="suggest-avatar" :style="{ background: getAvatarColor(user) }">{{ user[0].toUpperCase() }}</div>
                  <div class="flex-1">
                    <div class="suggest-name">{{ user }}</div>
                    <div class="suggest-meta">Enrolled in Security Vault</div>
                  </div>
                  <div class="suggest-arrow">→</div>
               </div>
            </div>
            
            <p class="mod-hint mt-4">Pair-based encryption key will be derived instantly upon selection.</p>
          </div>
          <div class="modal-foot">
            <button @click="startNewChat" class="btn-mod-action" :disabled="!newChatUsername.trim()">Initialize Tunnel</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Call Overlay -->
    <Transition name="fade">
      <div v-if="activeCall" class="call-overlay-premium">
        <div class="call-canvas">
          <video ref="remoteVideoRef" autoplay playsinline class="remote-v"></video>
          <div class="local-v-wrap" v-show="activeCall.callType === 'video'">
            <video ref="localVideoRef" autoplay playsinline muted class="local-v"></video>
          </div>
          <div class="call-info">
            <div class="c-avatar" :style="{ background: getAvatarColor(activeCall.other) }">{{ activeCall.other[0].toUpperCase() }}</div>
            <h3>{{ activeCall.other }}</h3>
            <p class="status-pulse">{{ callStatus }}</p>
          </div>
          <div class="call-actions">
            <!-- <button @click="toggleMute" class="c-btn" :class="{ 'is-muted': isMuted }">Mute</button> -->
            <button @click="endCall(true)" class="btn-hangup" title="End Call">
               <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91"/><line x1="23" y1="2" x2="1" y2="22"/></svg>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Incoming Call Modal -->
    <Transition name="modal-bounce">
      <div v-if="incomingCall" class="incoming-call-modal">
        <div class="i-call-card">
          <div class="i-avatar" :style="{ background: getAvatarColor(incomingCall.from) }">{{ incomingCall.from[0].toUpperCase() }}</div>
          <h3 class="mb-1">Incoming {{ incomingCall.callType === 'video' ? 'Video' : 'Audio' }} Call</h3>
          <p class="opacity-70 mb-6">{{ incomingCall.from }} is calling...</p>
          <div class="i-actions">
            <button @click="declineCall" class="btn-decline">Decline</button>
            <button @click="acceptCall" class="btn-accept">Accept</button>
          </div>
        </div>
      </div>
    </Transition>

    <div v-if="previewImage" class="preview-overlay-box" @click="previewImage = null">
      <img :src="previewImage" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, nextTick, watch, onBeforeUnmount } from 'vue';
import { 
  authState,
  apiFetch,
  getModuleData, 
  saveModuleData,
  INSTANT_CHAT_DB_NAME
} from '../db.js';
import { showToast } from '../toast.js';

// State
const currentUser = computed(() => authState.user?.email || null);
const isLoggedIn = computed(() => !!authState.user);
const isSyncing = ref(false);

const selectedContact = ref(null);
const messages = ref([]);
const newMessage = ref('');
const chatList = ref([]);
const allRegisteredUsers = ref([]);
const contactSearchTerm = ref('');
const showNewChatModal = ref(false);
const loading = ref(false);
const newChatUsername = ref('');
const previewImage = ref(null);
const messageBox = ref(null);
const pendingFile = ref(null);
const fileInput = ref(null);
const newChatInput = ref(null);
const showLogoutConfirm = ref(false);
const onlineStatusMap = ref({});

// RTC State
const activeCall = ref(null);
const incomingCall = ref(null);
const callStatus = ref('');
const localVideoRef = ref(null);
const remoteVideoRef = ref(null);
const isCallConnected = ref(false);
let peerConnection = null;
let localStream = null;
const rtcConfig = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }, { urls: 'stun:stun2.l.google.com:19302' }] };

const SECRET_KEY = 'vault_core_v7.3_mysql';

// Polling intervals
let pollingInterval = null;
let onlineInterval = null;

// --- UTILS ---
function uint8ArrayToBase64(bytes) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}
function base64ToUint8Array(base64) {
  const binary = atob(base64 || '');
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const getAvatarColor = (name) => {
  if(!name) return '#2a3942';
  const colors = ['#f43f5e', '#ec4899', '#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9', '#06b6d4', '#10b981'];
  let h = 0; for(let i=0; i<name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h);
  return colors[Math.abs(h) % colors.length];
};

const formatTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
const formatTimeShort = (ts) => {
  const d = new Date(ts);
  return d.toDateString() === new Date().toDateString() ? formatTime(ts) : d.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
};

// --- ENCRYPTION ---
async function getKey(other) {
  const enc = new TextEncoder();
  const sorted = [currentUser.value, other].sort();
  const pair = sorted.join(':');
  const keyMat = await window.crypto.subtle.importKey('raw', enc.encode(SECRET_KEY + pair), 'PBKDF2', false, ['deriveKey']);
  return window.crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: enc.encode('shared-session-v7.3'), iterations: 100000, hash: 'SHA-256' }, 
    keyMat, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']
  );
}

async function encrypt(text, other) {
  if (!text) return null;
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const key = await getKey(other);
  const encrypted = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(text));
  return { d: uint8ArrayToBase64(new Uint8Array(encrypted)), i: uint8ArrayToBase64(iv) };
}

async function decrypt(obj, otherUser) {
  if (!obj || !obj.d || !obj.i || !currentUser.value) return '';
  const key = await getKey(otherUser);
  try {
    const iv = base64ToUint8Array(obj.i);
    const data = base64ToUint8Array(obj.d);
    const dec = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return new TextDecoder().decode(dec);
  } catch (e) { return '[Decryption Error]'; }
}

// --- CORE LOGIC ---
const pingOnline = async () => {
    if (!currentUser.value) return;
    try {
      await apiFetch('/api/chat/ping', { method: 'POST' });
    } catch (e) {}
};

const loadOnlineStatus = async () => {
    try {
        const res = await apiFetch('/api/chat/online');
        const users = await res.json();
        const map = {};
        users.forEach(u => {
            map[u.email] = true;
        });
        onlineStatusMap.value = map;
    } catch (e) {}
};

const loadAllRoster = async () => {
  try {
    const res = await apiFetch('/api/users');
    const users = await res.json();
    allRegisteredUsers.value = users.map(u => u.email).filter(email => email !== currentUser.value && email !== 'admin' && email !== 'superadmin');
  } catch (e) {}
};

const suggestedUsers = computed(() => {
  const q = newChatUsername.value.toLowerCase().trim();
  const list = allRegisteredUsers.value;
  if (!q) return list.slice(0, 10);
  return list.filter(u => u.toLowerCase().includes(q));
});

const selectSuggestedUser = (user) => { newChatUsername.value = user; startNewChat(); };

const filteredChatList = computed(() => {
  const q = contactSearchTerm.value.toLowerCase().trim();
  const list = chatList.value.map(c => ({ ...c, isOnline: !!onlineStatusMap.value[c.username] }));
  if (!q) return list;
  return list.filter(c => c.username.toLowerCase().includes(q));
});

const startPolling = () => {
    if (pollingInterval) clearInterval(pollingInterval);
    if (onlineInterval) clearInterval(onlineInterval);
    
    // Core chat polling
    pollingInterval = setInterval(refreshUI, 4000);
    
    // Online status (ping + check others)
    onlineInterval = setInterval(() => {
        pingOnline();
        loadOnlineStatus();
    }, 15000);

    // Initial immediate actions
    pingOnline();
    loadOnlineStatus();
};

async function sendSignal(to, data) {
    await saveModuleData('instant_chat', { type: 'rtc_signal', from: currentUser.value, to, data, timestamp: Date.now() });
}

const handleRtcSignal = async (doc) => {
  if (doc.data.to !== currentUser.value) return;
  const { from, data } = doc.data;
  
  // Important: Delete signal after reading so it doesn't double-trigger
  try {
     await apiFetch(`/api/modules/instant_chat/${doc.id}`, { method: 'DELETE' });
  } catch(e) {}

  if (data.type === 'offer') {
    if (activeCall.value || incomingCall.value) return;
    incomingCall.value = { from, callType: data.callType, offer: data.offer };
  } else if (data.type === 'answer') {
    if (peerConnection) await peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
    callStatus.value = 'Connected'; isCallConnected.value = true;
  } else if (data.type === 'candidate') {
    if (peerConnection) await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
  } else if (data.type === 'hangup') {
    if (activeCall.value?.other === from) endCall(false);
    if (incomingCall.value?.from === from) incomingCall.value = null;
  }
};

const initiateCall = async (type) => {
  if (!selectedContact.value) return;
  const other = selectedContact.value.username;
  activeCall.value = { other, callType: type, isInitiator: true };
  callStatus.value = 'Ringing...';
  
  // Log historical entry
  await saveModuleData('instant_chat', {
     type: 'chat_msg', from: currentUser.value, to: other, 
     text: `Panggilan ${type === 'video' ? 'Video' : 'Suara'} Keluar`,
     isCallLog: true, timestamp: Date.now()
  });

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: type === 'video', audio: true });
    await nextTick();
    if (localVideoRef.value) localVideoRef.value.srcObject = localStream;
    peerConnection = new RTCPeerConnection(rtcConfig);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = (event) => { if (remoteVideoRef.value) remoteVideoRef.value.srcObject = event.streams[0]; };
    peerConnection.onicecandidate = (event) => { if (event.candidate) sendSignal(other, { type: 'candidate', candidate: event.candidate }); };
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    sendSignal(other, { type: 'offer', offer, callType: type });
  } catch (err) {
    showToast('Media access denied.', 'error'); endCall(true);
  }
};

const acceptCall = async () => {
  if (!incomingCall.value) return;
  const { from, offer, callType } = incomingCall.value;
  activeCall.value = { other: from, callType, isInitiator: false };
  callStatus.value = 'Connecting...';
  incomingCall.value = null;

  // Log accepted call
  await saveModuleData('instant_chat', {
     type: 'chat_msg', from: currentUser.value, to: from, 
     text: `Panggilan Masuk Diangkat`,
     isCallLog: true, timestamp: Date.now()
  });

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: callType === 'video', audio: true });
    await nextTick();
    if (localVideoRef.value) localVideoRef.value.srcObject = localStream;
    peerConnection = new RTCPeerConnection(rtcConfig);
    localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));
    peerConnection.ontrack = (event) => { if (remoteVideoRef.value) remoteVideoRef.value.srcObject = event.streams[0]; };
    peerConnection.onicecandidate = (event) => { if (event.candidate) sendSignal(from, { type: 'candidate', candidate: event.candidate }); };
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    sendSignal(from, { type: 'answer', answer });
    callStatus.value = 'Connected'; isCallConnected.value = true;
  } catch (err) {
    showToast('Failed to accept call.', 'error'); endCall(true);
  }
};

const declineCall = async () => {
  if (incomingCall.value) {
    const { from } = incomingCall.value;
    
    // Log missed/declined call
    await saveModuleData('instant_chat', {
       type: 'chat_msg', from: currentUser.value, to: from, 
       text: `Panggilan Tak Terjawab`,
       isCallLog: true, timestamp: Date.now()
    });

    await sendSignal(from, { type: 'hangup' });
    incomingCall.value = null;
  }
};

const endCall = (sendHangup = true) => {
  const other = activeCall.value?.other;
  if (sendHangup && other) sendSignal(other, { type: 'hangup' });
  if (localStream) { localStream.getTracks().forEach(t => t.stop()); localStream = null; }
  if (peerConnection) { peerConnection.close(); peerConnection = null; }
  activeCall.value = null; callStatus.value = ''; isCallConnected.value = false;
};

const refreshUI = async () => {
    if (!isLoggedIn.value) return;
    try {
        const results = await getModuleData('instant_chat');
        if (!Array.isArray(results)) {
            console.warn('Chat data is not an array:', results);
            return;
        }
        
        // Handle RTC Signals (Calling)
        const signals = results.filter(r => r && r.data && r.data.type === 'rtc_signal' && r.data.to === currentUser.value);
        for (const s of signals) await handleRtcSignal(s);

        // Group messages for Chat List
        const allMsgs = results.filter(r => r && r.data && r.data.type === 'chat_msg');
        const groups = {};
        allMsgs.forEach(m => {
          const mData = m.data;
          if (!mData) return;
          const other = mData.from === currentUser.value ? mData.to : mData.from;
          if (!other) return;
          if (!groups[other] || groups[other].timestamp < mData.timestamp) {
            groups[other] = { username: other, timestamp: mData.timestamp };
          }
        });
        
        // Ensure chat list order and online status
        chatList.value = Object.values(groups).sort((a,b) => b.timestamp - a.timestamp);

        // Update active chat messages
        if (selectedContact.value) {
            const other = selectedContact.value.username;
            const rawMsgs = allMsgs.filter(d => d.data && ((d.data.from === currentUser.value && d.data.to === other) || (d.data.from === other && d.data.to === currentUser.value)))
                                    .sort((a,b) => a.data.timestamp - b.data.timestamp);
            
            const processed = await Promise.all(rawMsgs.map(async (m) => {
              const doc = { ...m.data, _id: m.id };
              // Decrypt if needed
              if (doc.encrypted && (!doc.text || doc.text === '')) {
                doc.text = await decrypt(doc.encrypted, other);
              }
              if (doc.encryptedFile && !doc.file) {
                 doc.file = await decrypt(doc.encryptedFile, other);
              }
              return doc;
            }));

            if (processed.length > messages.value.length) {
                messages.value = processed;
                scrollToBottom();
            } else {
                messages.value = processed;
            }
        }
    } catch (e) {
      console.error('Refresh UI Error:', e);
    }
};

const selectContact = async (contact) => {
  selectedContact.value = { ...contact, isOnline: !!onlineStatusMap.value[contact.username] };
  await refreshUI();
  scrollToBottom('auto');
};

const sendMessage = async () => {
  if (!newMessage.value.trim() && !pendingFile.value) return;
  if (!selectedContact.value) {
    showToast('Pilih kontak terlebih dahulu', 'error');
    return;
  }
  
  const to = selectedContact.value.username;
  loading.value = true;
  
  try {
    const encrypted = await encrypt(newMessage.value, to);
    let encryptedFile = null;
    if (pendingFile.value) {
      encryptedFile = await encrypt(pendingFile.value.data, to);
    }

    const msgData = {
      type: 'chat_msg',
      from: currentUser.value,
      to,
      encrypted,
      encryptedFile,
      status: 'sent',
      timestamp: Date.now(),
      fileName: pendingFile.value?.fileName,
      fileType: pendingFile.value?.fileType
    };

    const res = await saveModuleData('instant_chat', msgData);
    if (!res.ok) throw new Error(res.error || 'Gagal mengirim pesan ke server');
    
    newMessage.value = '';
    pendingFile.value = null;
    await refreshUI();
  } catch (err) {
    console.error('Send Message Error:', err);
    showToast('Gagal mengirim pesan: ' + err.message, 'error');
  } finally {
    loading.value = false;
  }
};

const handleFileSelect = (e) => {
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader(); reader.onload = (ev) => {
    pendingFile.value = { data: ev.target.result, fileName: file.name, fileType: file.type };
    sendMessage();
  };
  reader.readAsDataURL(file);
};

const openNewChatModal = () => { showNewChatModal.value = true; nextTick(() => newChatInput.value?.focus()); };
const startNewChat = () => {
    if (!newChatUsername.value || newChatUsername.value === currentUser.value) return;
    const user = newChatUsername.value.trim();
    if (!chatList.value.find(c => c.username === user)) chatList.value.push({ username: user, timestamp: Date.now(), isOnline: false });
    selectContact({ username: user }); showNewChatModal.value = false; newChatUsername.value = '';
};

const scrollToBottom = (behavior = 'smooth') => { nextTick(() => { if (messageBox.value) messageBox.value.scrollTo({ top: messageBox.value.scrollHeight, behavior }); }); };
const openImage = (url) => { previewImage.value = url; };
const logout = () => { showLogoutConfirm.value = false; window.location.href = '/login'; };

onMounted(async () => {
    if (isLoggedIn.value) { await loadAllRoster(); await refreshUI(); startPolling(); }
});
onBeforeUnmount(() => { clearInterval(pollingInterval); clearInterval(onlineInterval); endCall(true); });
watch(isLoggedIn, async (val) => {
    if (val) { await loadAllRoster(); await refreshUI(); startPolling(); }
    else { clearInterval(pollingInterval); clearInterval(onlineInterval); }
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

.chat-container { height: calc(100vh - 56px); display: flex; flex-direction: column; background: #090e11; overflow: hidden; font-family: 'Outfit', sans-serif; }
.custom-scrollbar::-webkit-scrollbar { width: 3px; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 4px; }

/* Header Premium */
.getlynkid-header-inner { display: flex; align-items: center; justify-content: space-between; width: 100%; }
.security-badge-orb { background: #00a884; border-radius: 8px; width: 26px; height: 26px; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(0, 168, 132, 0.4); }
.header-vault-title { font-size: 1.1rem; font-weight: 800; color: #fff; letter-spacing: -0.02em; }
.header-profile-section { display: flex; align-items: center; gap: 0.75rem; }
.premium-avatar-btn { width: 36px; height: 36px; border-radius: 50%; border: 2px solid rgba(255,255,255,0.1); color: #fff; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: 0.2s; }
.premium-avatar-btn:hover { transform: scale(1.05); }
.sync-status { width: 7px; height: 7px; border-radius: 50%; background: #3b82f6; }
.sync-status.is_active { background: #00a884; box-shadow: 0 0 8px #00a884; }

/* Login */
.login-screen { flex: 1; display: flex; align-items: center; justify-content: center; background: radial-gradient(circle at 50% 50%, #111b21 0%, #090e11 100%); }
.login-card-vault { background: rgba(32, 44, 51, 0.6); backdrop-filter: blur(30px); padding: 3.5rem 2rem; border-radius: 40px; width: 90%; max-width: 400px; text-align: center; border: 1px solid rgba(255,255,255,0.04); }
.vault-icon-box { width: 90px; height: 90px; background: rgba(0, 168, 132, 0.1); border-radius: 30px; margin: 0 auto 2rem; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(0, 168, 132, 0.2); }
.icon-inner-glow { color: #00a884; filter: drop-shadow(0 0 10px rgba(0, 168, 132, 0.5)); }
.vault-title { font-size: 2rem; font-weight: 800; color: #fff; letter-spacing: -0.05em; margin-bottom: 0.5rem; }
.vault-subtitle { color: #8696a0; font-size: 0.95rem; margin-bottom: 2.5rem; }
.vault-input-wrap { background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.05); border-radius: 18px; margin-bottom: 1rem; padding: 0 1.25rem; }
.v-input { width: 100%; height: 56px; background: transparent; border: none; color: #fff; font-size: 1rem; outline: none; }
.btn-vault-action { width: 100%; height: 58px; background: linear-gradient(135deg, #00a884 0%, #005c4b 100%); color: #fff; border: none; border-radius: 18px; font-weight: 800; margin-top: 1rem; cursor: pointer; box-shadow: 0 10px 25px rgba(0,0,0,0.3); }
.btn-switch-vault { background: transparent; border: none; color: #8696a0; margin-top: 1.5rem; font-weight: 600; font-size: 0.85rem; cursor: pointer; text-decoration: underline; }
.v-footer { margin-top: 2rem; font-size: 0.7rem; color: #667781; letter-spacing: 0.3em; font-weight: 700; }

/* Main UI */
.chat-main { flex: 1; display: flex; height: 100%; position: relative; }
.chat-sidebar-premium { width: 350px; background: #111b21; border-right: 1px solid rgba(255,255,255,0.03); display: flex; flex-direction: column; }
.sidebar-top-box { padding: 2rem 1.5rem; }
.session-title { font-size: 1.6rem; font-weight: 800; color: #fff; letter-spacing: -0.04em; }
.btn-add-session { width: 44px; height: 44px; background: #00a884; color: #fff; border: none; border-radius: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 5px 15px rgba(0, 168, 132, 0.3); }
.search-vault-box { background: #202c33; border-radius: 16px; padding: 0 1.25rem; display: flex; align-items: center; gap: 0.75rem; }
.search-vault-box input { flex: 1; height: 48px; background: transparent; border: none; color: #fff; font-size: 0.95rem; outline: none; }

.sessions-list { flex: 1; overflow-y: auto; }
.session-row { display: flex; align-items: center; gap: 1.25rem; padding: 1.25rem 1.5rem; cursor: pointer; transition: 0.2s; border-bottom: 1px solid rgba(255,255,255,0.01); }
.session-row:hover { background: rgba(255,255,255,0.02); }
.session-row.is_active { background: #2a3942; }
.session-avatar { width: 54px; height: 54px; border-radius: 20px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 1.2rem; position: relative; }
.pulse-online { position: absolute; top: -3px; right: -3px; width: 14px; height: 14px; background: #00a884; border-radius: 50%; border: 3px solid #111b21; box-shadow: 0 0 10px #00a884; }
.session-info { flex: 1; min-width: 0; }
.session-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.35rem; }
.session-name { font-weight: 700; color: #e9edef; font-size: 1rem; }
.session-time { font-size: 0.7rem; color: #8696a0; font-weight: 600; }
.session-status { font-size: 0.85rem; color: #8696a0; }

/* Viewport Premium */
.chat-viewport-premium { flex: 1; display: flex; flex-direction: column; background: #090e11; position: relative; min-width: 0; }
.viewport-header-premium { height: 75px; background: rgba(32, 44, 51, 0.95); backdrop-filter: blur(20px); display: flex; align-items: center; padding: 0 1.5rem; z-index: 100; border-bottom: 1px solid rgba(255,255,255,0.02); }
.btn-nav-back { background: transparent; border: none; color: #fff; display: none; margin-right: 0.5rem; cursor: pointer; }
.header-recipient { flex: 1; display: flex; align-items: center; gap: 1rem; min-width: 0; }
.recipient-avatar { width: 44px; height: 44px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; flex-shrink: 0; }
.recipient-name { font-weight: 800; color: #fff; font-size: 1.1rem; }
.recipient-lock-status { display: flex; align-items: center; gap: 0.35rem; font-size: 0.65rem; color: #00a884; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-top: 0.1rem; }

.header-tools { display: flex; gap: 0.85rem; align-items: center; }
.t-btn { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); color: #00a884; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); border-radius: 14px; }
.t-btn:hover { background: #00a884; color: #fff; transform: translateY(-2px); box-shadow: 0 5px 15px rgba(0, 168, 132, 0.3); }
.t-btn:active { transform: translateY(0) scale(0.95); }

/* Message Feed */
.viewport-feed { flex: 1; overflow-y: auto; position: relative; display: flex; flex-direction: column; }
.mesh-background { position: absolute; inset: 0; opacity: 0.03; background-image: radial-gradient(#fff 0.8px, transparent 0.8px); background-size: 24px 24px; }
.feed-inner { padding: 2.5rem 1.5rem; display: flex; flex-direction: column; gap: 1rem; z-index: 2; margin-top: auto; }
.entry-notice { align-self: center; width: 100%; max-width: 400px; text-align: center; background: rgba(0, 168, 132, 0.05); border: 1px solid rgba(0, 168, 132, 0.1); padding: 1rem; border-radius: 16px; font-size: 0.75rem; color: #8696a0; font-weight: 600; line-height: 1.6; margin-bottom: 3rem; }

.msg-group { display: flex; width: 100%; }
.is-me { justify-content: flex-end; padding-left: 15%; }
.is-them { justify-content: flex-start; padding-right: 15%; }

.msg-bubble-premium { max-width: 100%; padding: 0.85rem 1rem; border-radius: 20px; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.1); overflow-wrap: anywhere; word-break: break-all; }
.is-me .msg-bubble-premium { background: linear-gradient(135deg, #005c4b 0%, #004d3e 100%); color: #fff; border-bottom-right-radius: 4px; border: 1px solid rgba(0, 168, 132, 0.2); }
.is-them .msg-bubble-premium { background: #202c33; color: #fff; border-bottom-left-radius: 4px; border: 1px solid rgba(255,255,255,0.03); }

.msg-bubble-premium.is-call-log { 
  background: rgba(255,255,255,0.05) !important; 
  color: #8696a0 !important; 
  font-size: 0.85rem; 
  font-style: italic; 
  border: 1px dashed rgba(255,255,255,0.1) !important; 
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.msg-text-content { font-size: 0.95rem; line-height: 1.5; white-space: pre-wrap; font-weight: 400; }
.msg-footer-meta { display: flex; justify-content: flex-end; align-items: center; gap: 0.4rem; margin-top: 0.5rem; opacity: 0.5; font-size: 0.65rem; font-weight: 700; }

/* Input Block */
.viewport-controls { padding: 1.5rem; background: #202c33; z-index: 10; padding-bottom: calc(1.5rem + env(safe-area-inset-bottom)); border-top: 1px solid rgba(255,255,255,0.03); }
.controls-inner { display: flex; align-items: center; gap: 1rem; max-width: 1000px; margin: 0 auto; }
.btn-attach { background: transparent; border: none; color: #00a884; cursor: pointer; transition: 0.2s; }
.composer-box { flex: 1; background: #2a3942; border-radius: 20px; padding: 0 1.25rem; border: 1px solid transparent; }
.composer-box:focus-within { border-color: #00a884; background: #32444f; }
.composer-input { width: 100%; height: 50px; background: transparent; border: none; color: #fff; outline: none; font-size: 1rem; }
.btn-send-neon { width: 50px; height: 50px; background: #00a884; color: #fff; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 8px 20px rgba(0, 168, 132, 0.4); transition: 0.3s; }
.btn-send-neon:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 10px 25px rgba(0, 168, 132, 0.5); }
.btn-send-neon:disabled { opacity: 0.2; transform: scale(0.95); }

/* Center Placeholder */
.viewport-placeholder { flex: 1; display: flex; align-items: center; justify-content: center; background: #090e11; padding: 2rem; min-height: 0; }
.placeholder-content { text-align: center; max-width: 450px; }
.shield-orb-large { position: relative; width: 120px; height: 120px; margin: 0 auto 2.5rem; display: flex; align-items: center; justify-content: center; }
.shield-ripple { position: absolute; inset: -15px; border: 2px solid rgba(0, 168, 132, 0.1); border-radius: 50%; }
.placeholder-title { font-size: 1.8rem; font-weight: 800; color: #fff; letter-spacing: 0.1em; margin-bottom: 1rem; }
.placeholder-desc { color: #8696a0; font-size: 1rem; line-height: 1.6; margin-bottom: 2.5rem; font-weight: 500; }
.btn-action-primary { height: 54px; background: #00a884; color: #fff; border: none; padding: 0 2rem; border-radius: 20px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }

/* Colors/Status */
.confirm-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); z-index: 5000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.confirm-card-premium { background: #222e35; padding: 3rem 2rem; border-radius: 32px; text-align: center; max-width: 320px; border: 1px solid rgba(255,255,255,0.05); }
.exit-icon { font-size: 3rem; margin-bottom: 1rem; }
.confirm-actions-row { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-ghost { flex: 1; height: 50px; background: #2a3942; border: none; color: #fff; border-radius: 16px; font-weight: 700; cursor: pointer; }
.btn-danger-shiny { flex: 1; height: 50px; background: #f43f5e; color: #fff; border: none; border-radius: 16px; font-weight: 800; cursor: pointer; box-shadow: 0 5px 15px rgba(244, 63, 94, 0.3); }

/* Modals */
.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 1rem; }
.modal-window-premium { background: #222e35; width: 100%; max-width: 400px; border-radius: 32px; overflow: hidden; box-shadow: 0 30px 60px rgba(0,0,0,0.6); display: flex; flex-direction: column; max-height: 90vh; }
.modal-head { padding: 1.5rem 2rem; border-bottom: 1px solid rgba(255,255,255,0.03); display: flex; justify-content: space-between; align-items: center; }
.modal-body-premium { padding: 1.5rem 2rem; overflow-y: auto; flex: 1; }
.user-suggestions-box { max-height: 300px; overflow-y: auto; background: rgba(0,0,0,0.15); border-radius: 18px; border: 1px solid rgba(255,255,255,0.03); }
.suggest-row { display: flex; align-items: center; gap: 1rem; padding: 1rem; cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.01); transition: 0.2s; }
.suggest-row:hover { background: rgba(255,255,255,0.03); }
.suggest-avatar { width: 40px; height: 40px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; color: #fff; font-size: 1rem; flex-shrink: 0; }
.suggest-name { font-weight: 700; color: #fff; font-size: 0.95rem; }
.suggest-meta { font-size: 0.7rem; color: #8696a0; font-weight: 600; margin-top: 0.1rem; }
.suggest-arrow { color: #00a884; font-weight: 900; opacity: 0.5; }

.mod-input-wrap { background: #111b21; border-radius: 16px; padding: 0 1.25rem; border: 1px solid rgba(255,255,255,0.05); }
.mod-input { width: 100%; height: 54px; background: transparent; border: none; color: #fff; font-size: 1rem; outline: none; }
.mod-hint { font-size: 0.8rem; color: #8696a0; text-align: center; }
.modal-foot { padding: 0 2rem 2rem; }
.btn-mod-action { width: 100%; height: 56px; background: #00a884; color: #fff; border: none; border-radius: 16px; font-weight: 800; cursor: pointer; }

@media (max-width: 768px) {
  .chat-sidebar-premium { width: 100%; }
  .chat-viewport-premium { position: absolute; inset: 0; display: none; }
  .chat-main.contact-selected .chat-viewport-premium { display: flex; }
  .btn-nav-back { display: block; }
}

.truncate { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.hidden { display: none; }

/* Call UI */
.call-overlay-premium { position: fixed; inset: 0; background: #090e11; z-index: 9000; display: flex; align-items: center; justify-content: center; }
.call-canvas { position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.remote-v { width: 100%; height: 100%; object-fit: cover; background: #111b21; }
.local-v-wrap { position: absolute; bottom: 100px; right: 20px; width: 120px; height: 180px; background: #000; border-radius: 16px; overflow: hidden; border: 2px solid rgba(255,255,255,0.1); box-shadow: 0 10px 30px rgba(0,0,0,0.5); z-index: 10; }
.local-v { width: 100%; height: 100%; object-fit: cover; }
.call-info { position: absolute; top: 10%; text-align: center; width: 100%; z-index: 5; }
.c-avatar { width: 100px; height: 100px; border-radius: 30px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; font-size: 2.5rem; font-weight: 800; color: #fff; box-shadow: 0 20px 40px rgba(0,0,0,0.4); }
.call-info h3 { color: #fff; font-size: 1.8rem; font-weight: 800; margin-bottom: 0.5rem; }
.status-pulse { color: #00a884; font-weight: 700; letter-spacing: 0.1em; animation: pulse 2s infinite; }
.call-actions { position: absolute; bottom: 40px; width: 100%; display: flex; justify-content: center; gap: 2rem; z-index: 20; }
.btn-hangup { width: 70px; height: 70px; background: #f43f5e; border: none; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 10px 25px rgba(244, 63, 94, 0.4); transition: 0.2s; }
.btn-hangup:hover { transform: scale(1.1); background: #e11d48; }

.incoming-call-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.9); z-index: 10000; display: flex; align-items: center; justify-content: center; padding: 1.5rem; }
.i-call-card { background: #222e35; width: 100%; max-width: 320px; padding: 3rem 2rem; border-radius: 40px; text-align: center; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 30px 60px rgba(0,0,0,0.6); }
.i-avatar { width: 80px; height: 80px; border-radius: 25px; margin: 0 auto 1.5rem; display: flex; align-items: center; justify-content: center; font-size: 2rem; font-weight: 800; color: #fff; }
.i-actions { display: flex; gap: 1rem; margin-top: 2rem; }
.btn-decline { flex: 1; height: 54px; background: rgba(244, 63, 94, 0.1); color: #f43f5e; border: 1px solid rgba(244, 63, 94, 0.2); border-radius: 18px; font-weight: 700; cursor: pointer; }
.btn-accept { flex: 1; height: 54px; background: #00a884; color: #fff; border: none; border-radius: 18px; font-weight: 800; cursor: pointer; box-shadow: 0 8px 20px rgba(0, 168, 132, 0.3); }

@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

.t-btn:disabled { opacity: 0.3; cursor: not-allowed; filter: grayscale(1); }
</style>
