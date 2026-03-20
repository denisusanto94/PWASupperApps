<template>
  <div class="app">
    <Transition name="toast">
      <div v-if="toast.show" class="toast" :class="toast.type" role="alert">
        <span class="toast-message">{{ toast.message }}</span>
        <button type="button" class="toast-close" aria-label="Tutup" @click="dismissToast">×</button>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="confirmImport.show" class="modal-overlay" @click.self="cancelImportConfirm">
        <div class="modal-box">
          <p class="modal-text">{{ confirmImport.text }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="cancelImportConfirm">Batal</button>
            <button type="button" class="btn btn-primary" @click="applyImportConfirm">Impor</button>
          </div>
        </div>
      </div>
    </Transition>

    <Teleport to="#app-header-portal">
      <div class="getlynkid-header-inner">
        <h1 class="header-title">WhatsApp Blaster</h1>
        <div class="header-actions">
          <span class="header-tagline">WhatsApp Blaster PWA</span>
        </div>
      </div>
    </Teleport>

    <section class="card connection-card">
      <h2>Status WhatsApp</h2>
      <div v-if="connectionStatus === 'connecting'" class="status connecting">
        Menghubungkan…
      </div>
      <div v-else-if="connectionStatus === 'qr'" class="status qr">
        <p>Scan QR dengan WhatsApp</p>
        <div class="qr-wrap" v-if="connectionQr">
          <img :src="connectionQr" alt="QR Code" class="qr-img" />
        </div>
      </div>
      <div v-else-if="connectionStatus === 'connected'" class="status connected">
        Terhubung
      </div>
      <div v-else class="status disconnected">
        <p v-if="isQrAttemptsEnded">
          Kode QR kedaluwarsa (WhatsApp hanya mengizinkan beberapa percobaan per sesi).
        </p>
        <p v-else-if="connectionReason">{{ connectionReason }}</p>
        <p v-else>Terputus</p>
        <button
          v-if="isQrAttemptsEnded"
          type="button"
          class="btn btn-primary btn-restart"
          :disabled="restartingConnection"
          @click="requestNewQr"
        >
          {{ restartingConnection ? 'Meminta QR…' : 'Dapatkan QR baru' }}
        </button>
      </div>
    </section>

    <section class="card form-card">
      <h2>Kirim Pesan (Bulk)</h2>

      <div class="contacts-toolbar">
        <label class="check-all">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate.prop="isIndeterminate"
            @change="toggleSelectAll"
          />
          <span>Pilih semua</span>
        </label>
        <div class="toolbar-actions">
          <input
            ref="vcfInputRef"
            type="file"
            accept=".vcf,text/vcard,text/x-vcard"
            class="input-file-hidden"
            @change="onVcfFileSelected"
          />
          <button type="button" class="btn btn-add btn-import" @click="triggerVcfInput">
            Import Kontak (VCF)
          </button>
          <button type="button" class="btn btn-add" @click="openAddContact">
            + Tambah kontak
          </button>
          <button
            v-if="selectedIds.length > 0"
            type="button"
            class="btn btn-delete-bulk"
            @click="confirmBulkDeleteContacts"
          >
            Hapus terpilih ({{ selectedIds.length }})
          </button>
        </div>
      </div>

      <div v-if="contactFormOpen" class="contact-form card-inner">
        <div class="form-row">
          <input
            v-model="contactForm.name"
            type="text"
            placeholder="Nama"
            class="form-input"
          />
          <input
            v-model="contactForm.phone"
            type="tel"
            placeholder="Nomor (contoh: 6281234567890)"
            class="form-input"
          />
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-secondary" @click="cancelContactForm">
            Batal
          </button>
          <button type="button" class="btn btn-primary" @click="saveContactForm">
            {{ contactForm.id ? 'Simpan' : 'Tambah' }}
          </button>
        </div>
      </div>

      <div class="contact-search-wrap">
        <input
          v-model="contactSearch"
          type="search"
          placeholder="Cari nama atau nomor..."
          class="contact-search-input"
          autocomplete="off"
        />
      </div>

      <ul class="contact-list">
        <li
          v-for="c in filteredContacts"
          :key="c.id"
          class="contact-item"
          :class="{ editing: editingId === c.id }"
        >
          <label class="contact-check">
            <input type="checkbox" :value="c.id" v-model="selectedIds" />
          </label>
          <div class="contact-info">
            <span class="contact-name">{{ c.name || 'Tanpa nama' }}</span>
            <span class="contact-phone">{{ c.phone }}</span>
          </div>
          <div class="contact-actions">
            <button
              type="button"
              class="btn-icon"
              title="Edit"
              @click="openEditContact(c)"
            >
              ✏️
            </button>
            <button
              type="button"
              class="btn-icon btn-icon-danger"
              title="Hapus"
              @click="confirmDeleteContact(c.id)"
            >
              🗑️
            </button>
          </div>
        </li>
      </ul>
      <p v-if="filteredContacts.length === 0" class="empty">
        {{ contactSearch.trim() ? 'Tidak ada kontak yang cocok dengan pencarian.' : 'Belum ada kontak. Klik "Tambah kontak" untuk menambah.' }}
      </p>

      <div class="form-group">
        <div class="template-header">
          <label for="message">Template pesan</label>
          <button type="button" class="btn btn-add" @click="openTemplateModal">Pilih Template</button>
        </div>
        <textarea
          id="message"
          v-model="messageTemplate"
          placeholder="Halo, ini pesan dari WhatsApp Blaster..."
          rows="3"
        />
      </div>
      <button
        class="btn btn-primary"
        :disabled="!canSend"
        @click="sendBulk"
      >
        Kirim ke {{ selectedIds.length }} kontak terpilih
      </button>
    </section>

    <section class="card history-card">
      <h2>Riwayat pengiriman</h2>
      <div class="history-toolbar">
        <div class="contact-search-wrap">
          <input
            v-model="historySearch"
            type="search"
            placeholder="Cari nomor, nama, atau pesan..."
            class="contact-search-input"
            autocomplete="off"
          />
        </div>
        <div v-if="historySelectedIds.length > 0" class="history-actions">
          <button type="button" class="btn btn-delete-bulk" @click="confirmBulkDeleteHistory">
            Hapus terpilih ({{ historySelectedIds.length }})
          </button>
        </div>
      </div>
      <div class="table-wrap">
        <table class="history-table">
          <thead>
            <tr>
              <th class="th-check">
                <label class="check-all">
                  <input
                    type="checkbox"
                    :checked="isAllHistorySelected"
                    :indeterminate.prop="isHistoryIndeterminate"
                    @change="toggleSelectAllHistory"
                  />
                </label>
              </th>
              <th>Nomor</th>
              <th>Pesan</th>
              <th>Status</th>
              <th>Waktu</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in paginatedOutbox" :key="row._id">
              <td class="td-check">
                <label class="contact-check">
                  <input type="checkbox" :value="row._id" v-model="historySelectedIds" />
                </label>
              </td>
              <td>{{ getPhoneDisplay(row.phone) }}</td>
              <td class="msg-cell">{{ truncate(row.message) }}</td>
              <td>
                <span :class="['badge', row.status]">{{ row.status }}</span>
              </td>
              <td>{{ formatTime(row.createdAt, row.sentAt) }}</td>
              <td class="td-actions">
                <button type="button" class="btn btn-sm btn-resend" @click="openResendModal(row)">
                  Kirim ulang
                </button>
                <button type="button" class="btn btn-sm btn-delete-one" @click="confirmDeleteOneHistory(row)">
                  Hapus
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalHistoryPages > 1" class="pagination">
        <button
          type="button"
          class="btn btn-pagination"
          :disabled="historyPage <= 1"
          @click="historyPage = Math.max(1, historyPage - 1)"
        >
          ‹ Sebelumnya
        </button>
        <span class="pagination-info">Halaman {{ historyPage }} dari {{ totalHistoryPages }}</span>
        <button
          type="button"
          class="btn btn-pagination"
          :disabled="historyPage >= totalHistoryPages"
          @click="historyPage = Math.min(totalHistoryPages, historyPage + 1)"
        >
          Selanjutnya ›
        </button>
      </div>
      <p v-if="filteredOutboxList.length === 0" class="empty">
        {{ historySearch.trim() ? 'Tidak ada riwayat yang cocok dengan pencarian.' : 'Belum ada riwayat.' }}
      </p>
    </section>

    <Transition name="modal">
      <div v-if="resendModal.show" class="modal-overlay" @click.self="closeResendModal">
        <div class="modal-box">
          <h3 class="modal-title">Kirim ulang</h3>
          <p class="modal-text">Kirim pesan ini lagi ke {{ resendModal.row ? getPhoneDisplay(resendModal.row.phone) : '' }}. Berapa kali dikirim? (1–100)</p>
          <div class="form-group">
            <input
              v-model.number="resendModal.times"
              type="number"
              min="1"
              max="100"
              class="form-input resend-times-input"
              @keydown.enter="submitResend"
            />
          </div>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeResendModal">Batal</button>
            <button type="button" class="btn btn-primary" :disabled="resendModal.times < 1 || resendModal.times > 100" @click="submitResend">
              Kirim
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="templateModal.show" class="modal-overlay modal-overlay-template">
        <div class="modal-box modal-box-wide modal-box-template" @click.stop>
          <div class="template-modal-header">
            <h3 class="modal-title">Pilih Template Pesan</h3>
            <button type="button" class="template-modal-close" aria-label="Tutup" @click="closeTemplateModal">×</button>
          </div>
          <div class="template-modal-body">
            <div class="form-group template-sender-group">
              <label>Nama pengirim</label>
              <input v-model="templateModal.senderName" type="text" class="form-input" placeholder="Nama Anda / Keluarga" />
            </div>
            <div class="accordion">
            <div class="accordion-item">
              <button type="button" class="accordion-head" @click="templateAccordionOpen = templateAccordionOpen === 'idul-fitri' ? null : 'idul-fitri'">
                <span>Ucapan Hari Raya Idul Fitri {{ hijriYear }} H</span>
                <span class="accordion-icon">{{ templateAccordionOpen === 'idul-fitri' ? '▼' : '▶' }}</span>
              </button>
              <div v-show="templateAccordionOpen === 'idul-fitri'" class="accordion-body">
                <div
                  v-for="(opt, idx) in idulFitriTemplates"
                  :key="'fitri-' + idx"
                  class="template-option"
                >
                  <p class="template-preview">{{ previewTemplate(opt) }}</p>
                  <button type="button" class="btn btn-sm btn-primary" @click="applyTemplate(opt)">
                    Gunakan template ini
                  </button>
                </div>
              </div>
            </div>
            <div class="accordion-item">
              <button type="button" class="accordion-head" @click="templateAccordionOpen = templateAccordionOpen === 'idul-adha' ? null : 'idul-adha'">
                <span>Ucapan Hari Raya Idul Adha {{ hijriYear }} H</span>
                <span class="accordion-icon">{{ templateAccordionOpen === 'idul-adha' ? '▼' : '▶' }}</span>
              </button>
              <div v-show="templateAccordionOpen === 'idul-adha'" class="accordion-body">
                <div
                  v-for="(opt, idx) in idulAdhaTemplates"
                  :key="'adha-' + idx"
                  class="template-option"
                >
                  <p class="template-preview">{{ previewTemplate(opt) }}</p>
                  <button type="button" class="btn btn-sm btn-primary" @click="applyTemplate(opt)">
                    Gunakan template ini
                  </button>
                </div>
              </div>
            </div>
          </div>
          </div>
          <div class="template-modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeTemplateModal">Tutup</button>
          </div>
        </div>
      </div>
    </Transition>

    <Transition name="modal">
      <div v-if="confirmModal.show" class="modal-overlay" @click.self="closeConfirmModal">
        <div class="modal-box">
          <h3 class="modal-title">{{ confirmModal.title }}</h3>
          <p class="modal-text">{{ confirmModal.message }}</p>
          <div class="modal-actions">
            <button type="button" class="btn btn-secondary" @click="closeConfirmModal">Batal</button>
            <button type="button" class="btn btn-danger" @click="runConfirmModal">
              Ya, hapus
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <footer class="footer">
      <p>Data tersimpan di browser &amp; sinkron ke server. Pasang dari menu browser: Tambah ke Layar Utama / Install.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import {
  startSync,
  addOutbox,
  getOutboxDocs,
  removeOutbox,
  getContacts,
  saveContacts,
  onDbChange,
  getConnectionDoc,
  onConnectionChange,
} from '../db.js';

const messageTemplate = ref('');
const connection = ref(null);
const outboxList = ref([]);
const contacts = ref([]);
const selectedIds = ref([]);
const contactFormOpen = ref(false);
const editingId = ref(null);
const contactForm = ref({ name: '', phone: '' });
const vcfInputRef = ref(null);
const contactSearch = ref('');

const toast = ref({ show: false, message: '', type: 'info' });
let toastTimer = null;

const confirmImport = ref({
  show: false,
  toAdd: [],
  skipped: 0,
  text: '',
});

const HISTORY_PER_PAGE = 5;
const historyPage = ref(1);
const historySearch = ref('');
const historySelectedIds = ref([]);
const resendModal = ref({
  show: false,
  row: null,
  times: 1,
});

const confirmModal = ref({
  show: false,
  title: '',
  message: '',
  onConfirm: null,
});

const templateModal = ref({
  show: false,
  senderName: '',
});
const templateAccordionOpen = ref(null);

const hijriYear = computed(() => {
  const y = new Date().getFullYear();
  return Math.floor((y - 622) * (33 / 32));
});
const gregorianYear = computed(() => new Date().getFullYear());

const idulFitriTemplates = [
  'Taqabbalallahu minna wa minkum. Selamat Hari Raya Idul Fitri __H__ H. Semoga di hari fitri ini, hati kembali bersih dan rumah kita dipenuhi keberkahan. Mohon maaf lahir dan batin atas segala kekhilafan.\n__NAMA__ & Keluarga',
  'Selamat Lebaran __G__! 🌙 Semoga kedamaian dan kebahagiaan selalu menyertai langkah kita. Mohon maaf lahir dan batin ya! ✨\n__NAMA__ & Keluarga',
  'Selamat Hari Raya Idul Fitri __H__ H. Mohon maaf atas segala kesalahan dan tutur kata yang kurang berkenan selama bekerja sama. Semoga semangat baru menyertai kita di hari kemenangan ini. 🤝\n__NAMA__ & Keluarga',
];

const idulAdhaTemplates = [
  'Selamat Hari Raya Idul Adha __H__ H. Semoga semangat berkurban mendekatkan kita pada Allah dan mempererat silaturahmi. Taqabbalallahu minna wa minkum. — __NAMA__',
  'Di hari yang suci ini, semoga Allah menerima amal ibadah dan kurban kita. Mohon maaf lahir dan batin. Selamat Idul Adha __G__. — __NAMA__',
  'Selamat Idul Adha! Semoga keberkahan, kebahagiaan, dan kedamaian selalu menyertai kita dan keluarga. Selamat berkumpul! — __NAMA__',
  'Gema takbir berkumandang, selamat merayakan Idul Adha __H__ H. Mari berbagi kebahagiaan dan rezeki kepada sesama. — __NAMA__',
  'Kurban bukan hanya soal menyembelih, tapi tentang ketulusan dan keikhlasan. Selamat Idul Adha, mohon maaf lahir dan batin. — __NAMA__',
];

function fillTemplatePlaceholders(raw, namaPlaceholder = '...') {
  return raw
    .replace(/__H__/g, String(hijriYear.value))
    .replace(/__G__/g, String(gregorianYear.value))
    .replace(/__NAMA__/g, namaPlaceholder);
}

function getTemplateText(raw) {
  const name = templateModal.value.senderName.trim() || 'Keluarga';
  return fillTemplatePlaceholders(raw, name);
}

function previewTemplate(raw) {
  const name = templateModal.value.senderName.trim() || '...';
  return fillTemplatePlaceholders(raw, name);
}

function openTemplateModal() {
  templateAccordionOpen.value = null;
  templateModal.value = { show: true, senderName: templateModal.value.senderName || '' };
}

function closeTemplateModal() {
  templateModal.value = { show: false, senderName: templateModal.value.senderName };
}

function applyTemplate(raw) {
  messageTemplate.value = getTemplateText(raw);
  closeTemplateModal();
  showToast('Template telah dimasukkan.', 'success');
}

let connectionUnsub = null;
let outboxUnsub = null;
let updateAvailableHandler = null;

const connectionStatus = computed(() => connection.value?.status || 'connecting');
const connectionQr = computed(() => {
  const qr = connection.value?.qr;
  if (!qr) return null;
  return qr.startsWith('data:') ? qr : `data:image/png;base64,${qr}`;
});
const connectionReason = computed(() => connection.value?.reason || '');
const isQrAttemptsEnded = computed(() => {
  const c = connection.value;
  if (!c || c.status !== 'disconnected') return false;
  if (c.qrAttemptsEnded) return true;
  const r = (c.reason || '').toLowerCase();
  return r.includes('qr ref') && r.includes('attempts ended');
});

const restartingConnection = ref(false);

const selectedContacts = computed(() =>
  contacts.value.filter((c) => selectedIds.value.includes(c.id))
);
const isAllSelected = computed(() => {
  const n = contacts.value.length;
  if (n === 0) return false;
  return selectedIds.value.length === n;
});
const isIndeterminate = computed(() => {
  const k = selectedIds.value.length;
  const n = contacts.value.length;
  return k > 0 && k < n;
});
const canSend = computed(() =>
  selectedIds.value.length > 0 && messageTemplate.value.trim().length > 0
);

const filteredContacts = computed(() => {
  const q = contactSearch.value.trim().toLowerCase();
  if (!q) return contacts.value;
  return contacts.value.filter((c) => {
    const name = (c.name || '').toLowerCase();
    const phone = (c.phone || '').toLowerCase();
    return name.includes(q) || phone.includes(q);
  });
});

const filteredOutboxList = computed(() => {
  const list = outboxList.value;
  const q = historySearch.value.trim().toLowerCase();
  void contacts.value;
  if (!q) return list;
  return list.filter((row) => {
    const phone = (row.phone || '').toLowerCase();
    const message = (row.message || '').toLowerCase();
    const name = getPhoneDisplay(row.phone).toLowerCase();
    return phone.includes(q) || message.includes(q) || name.includes(q);
  });
});

const totalHistoryPages = computed(() =>
  Math.max(1, Math.ceil(filteredOutboxList.value.length / HISTORY_PER_PAGE))
);
const paginatedOutbox = computed(() => {
  const list = filteredOutboxList.value;
  const start = (historyPage.value - 1) * HISTORY_PER_PAGE;
  return list.slice(start, start + HISTORY_PER_PAGE);
});

const isAllHistorySelected = computed(() => {
  const list = filteredOutboxList.value;
  if (list.length === 0) return false;
  return historySelectedIds.value.length === list.length;
});
const isHistoryIndeterminate = computed(() => {
  const k = historySelectedIds.value.length;
  const n = filteredOutboxList.value.length;
  return k > 0 && k < n;
});

function toggleSelectAllHistory() {
  const list = filteredOutboxList.value;
  const ids = list.map((r) => r._id);
  if (isAllHistorySelected.value) {
    historySelectedIds.value = historySelectedIds.value.filter((id) => !ids.includes(id));
  } else {
    const set = new Set([...historySelectedIds.value, ...ids]);
    historySelectedIds.value = [...set];
  }
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = contacts.value.map((c) => c.id);
  }
}

function openAddContact() {
  editingId.value = null;
  contactForm.value = { name: '', phone: '' };
  contactFormOpen.value = true;
}

function cancelContactForm() {
  contactFormOpen.value = false;
  editingId.value = null;
}

function openEditContact(c) {
  editingId.value = c.id;
  contactForm.value = { id: c.id, name: c.name || '', phone: c.phone || '' };
  contactFormOpen.value = true;
}

async function saveContactForm() {
  const name = String(contactForm.value.name || '').trim();
  const phone = String(contactForm.value.phone || '').replace(/\D/g, '');
  if (!phone) return;
  const list = [...contacts.value];
  if (contactForm.value.id) {
    const i = list.findIndex((x) => x.id === contactForm.value.id);
    if (i >= 0) list[i] = { ...list[i], name, phone };
  } else {
    list.push({
      id: crypto.randomUUID?.() || `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name,
      phone,
    });
  }
  await saveContacts(list);
  contacts.value = list;
  contactFormOpen.value = false;
  editingId.value = null;
}

function openConfirmModal(title, message, onConfirm) {
  confirmModal.value = { show: true, title, message, onConfirm };
}

function closeConfirmModal() {
  confirmModal.value = { show: false, title: '', message: '', onConfirm: null };
}

async function runConfirmModal() {
  const fn = confirmModal.value.onConfirm;
  closeConfirmModal();
  if (typeof fn === 'function') await fn();
}

function confirmDeleteContact(id) {
  const c = contacts.value.find((x) => x.id === id);
  const name = c ? (c.name || c.phone) : 'Kontak ini';
  openConfirmModal('Hapus kontak?', `${name} akan dihapus. Lanjutkan?`, () => deleteContact(id));
}

function confirmBulkDeleteContacts() {
  if (selectedIds.value.length === 0) return;
  const n = selectedIds.value.length;
  openConfirmModal(
    'Hapus kontak terpilih?',
    n === 1 ? '1 kontak akan dihapus. Lanjutkan?' : `${n} kontak akan dihapus. Lanjutkan?`,
    () => bulkDeleteSelected()
  );
}

async function deleteContact(id) {
  const list = contacts.value.filter((c) => c.id !== id);
  await saveContacts(list);
  contacts.value = list;
  selectedIds.value = selectedIds.value.filter((x) => x !== id);
  showToast('Kontak dihapus.', 'success');
}

async function bulkDeleteSelected() {
  if (selectedIds.value.length === 0) return;
  const n = selectedIds.value.length;
  const idsToRemove = new Set(selectedIds.value);
  const list = contacts.value.filter((c) => !idsToRemove.has(c.id));
  await saveContacts(list);
  contacts.value = list;
  selectedIds.value = [];
  showToast(n === 1 ? '1 kontak dihapus.' : `${n} kontak dihapus.`, 'success');
}

/**
 * Parse isi file VCF (vCard) menjadi array { name, phone }.
 * Satu vCard dengan banyak TEL = banyak kontak (satu per nomor).
 */
function parseVcf(text) {
  const items = [];
  let raw = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  raw = raw.replace(/\n[ \t]/g, '');
  const blockRegex = /BEGIN:VCARD[\s\S]*?END:VCARD/gi;
  let match;
  while ((match = blockRegex.exec(raw)) !== null) {
    const block = match[0];
    let name = '';
    const lines = block.split(/\n/).map((l) => l.replace(/^\s+/, ''));
    for (const line of lines) {
      const upper = line.toUpperCase();
      if (upper.startsWith('FN:')) {
        name = line.slice(3).trim().replace(/=\n/g, '');
        break;
      }
      if (upper.startsWith('N:')) {
        const n = line.slice(2).trim().split(';').map((s) => s.trim());
        name = [n[1], n[0], n[2], n[3], n[4]].filter(Boolean).join(' ').trim() || name;
      }
    }
    for (const line of lines) {
      if (!line.toUpperCase().startsWith('TEL')) continue;
      const colon = line.indexOf(':');
      if (colon === -1) continue;
      let phone = line.slice(colon + 1).trim().replace(/\s/g, '');
      phone = phone.replace(/\D/g, '');
      if (phone.length >= 6) items.push({ name: name || 'Impor VCF', phone });
    }
  }
  return items;
}

function showToast(message, type = 'info') {
  if (toastTimer) clearTimeout(toastTimer);
  toast.value = { show: true, message, type };
  toastTimer = setTimeout(dismissToast, 4000);
}

function dismissToast() {
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = null;
  toast.value.show = false;
}

function cancelImportConfirm() {
  confirmImport.value = { show: false, toAdd: [], skipped: 0, text: '' };
  if (vcfInputRef.value) vcfInputRef.value.value = '';
}

async function applyImportConfirm() {
  const { toAdd } = confirmImport.value;
  if (toAdd.length === 0) {
    cancelImportConfirm();
    return;
  }
  const list = [...contacts.value, ...toAdd];
  await saveContacts(list);
  contacts.value = list;
  const msg = toAdd.length === 1
    ? '1 kontak berhasil diimpor.'
    : `${toAdd.length} kontak berhasil diimpor.`;
  showToast(msg, 'success');
  cancelImportConfirm();
}

function triggerVcfInput() {
  if (vcfInputRef.value) {
    vcfInputRef.value.value = '';
    vcfInputRef.value.click();
  }
}

async function onVcfFileSelected(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  try {
    const text = await file.text();
    const parsed = parseVcf(text);
    if (parsed.length === 0) {
      showToast('Tidak ada kontak yang valid di file VCF.', 'error');
    } else {
      const existingPhones = new Set(contacts.value.map((c) => c.phone));
      const toAdd = [];
      for (const p of parsed) {
        if (existingPhones.has(p.phone)) continue;
        existingPhones.add(p.phone);
        toAdd.push({
          id: crypto.randomUUID?.() || `c_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          name: p.name,
          phone: p.phone,
        });
      }
      const skipped = parsed.length - toAdd.length;
      if (toAdd.length === 0) {
        showToast(`${parsed.length} kontak ditemukan, semuanya sudah ada (duplikat).`, 'info');
      } else {
        const dupText = skipped > 0 ? ` ${skipped} duplikat dilewati.` : '';
        confirmImport.value = {
          show: true,
          toAdd,
          skipped,
          text: `Ditemukan ${parsed.length} kontak. Akan menambah ${toAdd.length} kontak.${dupText} Impor?`,
        };
      }
    }
  } catch (e) {
    showToast('Gagal membaca file VCF: ' + (e.message || 'format tidak valid'), 'error');
  }
  if (vcfInputRef.value) vcfInputRef.value.value = '';
}

function getPhoneDisplay(phone) {
  if (!phone) return '–';
  const p = String(phone).replace(/\D/g, '');
  const c = contacts.value.find((x) => String(x.phone || '').replace(/\D/g, '') === p);
  return c ? (c.name || c.phone || phone) : phone;
}

function truncate(str, len = 40) {
  if (!str) return '';
  return str.length <= len ? str : str.slice(0, len) + '…';
}

function formatTime(created, sent) {
  const t = sent || created;
  if (!t) return '–';
  const d = new Date(t);
  return d.toLocaleString('id-ID');
}

async function loadConnection() {
  const doc = await getConnectionDoc();
  if (doc) connection.value = doc;
}

async function loadOutbox() {
  outboxList.value = await getOutboxDocs();
}

function openResendModal(row) {
  resendModal.value = { show: true, row, times: 1 };
}

function closeResendModal() {
  resendModal.value = { show: false, row: null, times: 1 };
}

async function submitResend() {
  const { row, times } = resendModal.value;
  if (!row || times < 1 || times > 100) return;
  const n = Math.min(100, Math.max(1, Number(times) || 1));
  for (let i = 0; i < n; i++) {
    await addOutbox(row.phone, row.message);
  }
  closeResendModal();
  await loadOutbox();
  showToast(n === 1 ? '1 pesan ditambahkan ke antrian.' : `${n} pesan ditambahkan ke antrian.`, 'success');
}

async function loadContacts() {
  contacts.value = await getContacts();
}

async function sendBulk() {
  const list = selectedContacts.value;
  const msg = messageTemplate.value.trim();
  if (!list.length || !msg) return;
  for (const c of list) {
    await addOutbox(c.phone, msg);
  }
  const n = list.length;
  selectedIds.value = [];
  await loadOutbox();
  showToast(n === 1 ? '1 pesan ditambahkan ke antrian.' : `${n} pesan ditambahkan ke antrian.`, 'success');
}

async function requestNewQr() {
  if (restartingConnection.value) return;
  restartingConnection.value = true;
  try {
    const res = await fetch('/api/whatsapp/restart', { method: 'POST' });
    if (!res.ok) throw new Error((await res.json()).error || res.statusText);
    await loadConnection();
    showToast('Meminta QR baru…', 'success');
  } catch (e) {
    showToast('Gagal meminta QR: ' + (e.message || 'Unknown error'), 'error');
  } finally {
    restartingConnection.value = false;
  }
}

watch(totalHistoryPages, (total) => {
  if (historyPage.value > total) historyPage.value = Math.max(1, total);
});

function confirmDeleteOneHistory(row) {
  const to = getPhoneDisplay(row.phone);
  openConfirmModal('Hapus pesan?', `Pesan ke ${to} akan dihapus dari riwayat. Lanjutkan?`, () => deleteOneHistory(row));
}

function confirmBulkDeleteHistory() {
  if (historySelectedIds.value.length === 0) return;
  const ids = [...historySelectedIds.value];
  const list = outboxList.value.filter((r) => ids.includes(r._id));
  const n = list.length;
  openConfirmModal(
    'Hapus pesan terpilih?',
    n === 1 ? '1 pesan akan dihapus dari riwayat. Lanjutkan?' : `${n} pesan akan dihapus dari riwayat. Lanjutkan?`,
    () => bulkDeleteHistory()
  );
}

async function deleteOneHistory(row) {
  try {
    await removeOutbox(row);
    await loadOutbox();
    historySelectedIds.value = historySelectedIds.value.filter((id) => id !== row._id);
    showToast('Pesan dihapus dari riwayat.', 'success');
  } catch (e) {
    showToast('Gagal menghapus: ' + (e.message || ''), 'error');
  }
}

async function bulkDeleteHistory() {
  if (historySelectedIds.value.length === 0) return;
  const ids = [...historySelectedIds.value];
  const list = outboxList.value.filter((r) => ids.includes(r._id));
  try {
    for (const doc of list) {
      await removeOutbox(doc);
    }
    historySelectedIds.value = [];
    await loadOutbox();
    showToast(list.length === 1 ? '1 pesan dihapus.' : `${list.length} pesan dihapus.`, 'success');
  } catch (e) {
    showToast('Gagal menghapus: ' + (e.message || ''), 'error');
  }
}

onMounted(async () => {
  startSync();
  await loadConnection();
  await loadOutbox();
  await loadContacts();
  connectionUnsub = onConnectionChange((doc) => {
    connection.value = doc;
  });
  outboxUnsub = onDbChange(() => {
    loadOutbox();
  });
  updateAvailableHandler = () => showToast('Versi baru tersedia. Refresh halaman untuk memuat.', 'info');
  window.addEventListener('pwasupperapps-update-available', updateAvailableHandler);
});

onUnmounted(() => {
  if (connectionUnsub?.cancel) connectionUnsub.cancel();
  if (outboxUnsub?.cancel) outboxUnsub.cancel();
  if (updateAvailableHandler) window.removeEventListener('pwasupperapps-update-available', updateAvailableHandler);
});
</script>

<style>
:root {
  --bg: #0f172a;
  --card: #1e293b;
  --text: #e2e8f0;
  --muted: #94a3b8;
  --green: #25D366;
  --green-dim: #1da851;
  --radius: 12px;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'Segoe UI', system-ui, sans-serif;
  background: var(--bg);
  color: var(--text);
  min-height: 100vh;
  line-height: 1.5;
}

.app {
  max-width: 720px;
  margin: 0 auto;
  padding: 1rem;
  padding-bottom: 2rem;
}

.header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.header h1 {
  margin: 0;
  font-size: 1.75rem;
  color: var(--green);
}

.tagline {
  margin: 0.25rem 0 0;
  color: var(--muted);
  font-size: 0.9rem;
}

.card {
  background: var(--card);
  border-radius: var(--radius);
  padding: 1.25rem;
  margin-bottom: 1rem;
}

.card h2 {
  margin: 0 0 1rem;
  font-size: 1.1rem;
  color: var(--text);
}

.status {
  padding: 0.75rem;
  border-radius: 8px;
  text-align: center;
}

.status.connecting {
  background: rgba(255,193,7,0.15);
  color: #ffc107;
}

.status.qr {
  background: rgba(0,0,0,0.2);
}

.status.qr p {
  margin: 0 0 0.75rem;
  color: var(--muted);
}

.qr-wrap {
  display: inline-block;
  padding: 12px;
  background: #fff;
  border-radius: 8px;
}

.qr-img {
  display: block;
  width: 200px;
  height: 200px;
}

.status.connected {
  background: rgba(37,211,102,0.2);
  color: var(--green);
}

.status.disconnected {
  background: rgba(239,68,68,0.15);
  color: #f87171;
}

.status.disconnected p {
  margin: 0 0 0.5rem;
}

.status.disconnected p:last-of-type {
  margin-bottom: 0;
}

.btn-restart {
  margin-top: 0.5rem;
}

.contacts-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
}

.check-all {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  color: var(--muted);
  font-size: 0.9rem;
}

.check-all input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--green);
}

.btn-add {
  background: #334155;
  color: var(--text);
}

.btn-add:hover {
  background: #475569;
}

.toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.contact-search-wrap {
  margin-bottom: 0.75rem;
}

.contact-search-input {
  width: 100%;
  padding: 0.5rem 0.75rem 0.5rem 2.25rem;
  border: 1px solid #334155;
  border-radius: 8px;
  background: var(--bg) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='%2394a3b8' viewBox='0 0 16 16'%3E%3Cpath d='M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z'/%3E%3C/svg%3E") no-repeat 0.65rem center;
  color: var(--text);
  font: inherit;
  font-size: 0.95rem;
}

.contact-search-input::placeholder {
  color: var(--muted);
}

.contact-search-input:focus {
  outline: none;
  border-color: var(--green);
  box-shadow: 0 0 0 2px rgba(37, 211, 102, 0.2);
}

.input-file-hidden {
  position: absolute;
  width: 0;
  height: 0;
  opacity: 0;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.btn-import {
  background: #334155;
  color: var(--text);
}

.btn-import:hover {
  background: #475569;
}

.btn-delete-bulk {
  background: rgba(239, 68, 68, 0.25);
  color: #f87171;
}

.btn-delete-bulk:hover {
  background: rgba(239, 68, 68, 0.4);
}

/* Toast - full width top */
.toast {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.75rem 1rem;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
  font-size: 0.95rem;
}

.toast.success {
  background: var(--green);
  color: #fff;
}

.toast.error {
  background: #dc2626;
  color: #fff;
}

.toast.info {
  background: #334155;
  color: var(--text);
}

.toast-message {
  flex: 1;
  min-width: 0;
}

.toast-close {
  flex-shrink: 0;
  background: none;
  border: none;
  color: inherit;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.9;
  padding: 0 0.25rem;
}

.toast-close:hover {
  opacity: 1;
}

.toast-enter-active,
.toast-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.toast-enter-from,
.toast-leave-to {
  transform: translateY(-100%);
  opacity: 0;
}

/* Modal konfirmasi */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 9998;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.modal-overlay-template {
  align-items: flex-start;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

@media (min-width: 768px) {
  .modal-overlay-template {
    align-items: center;
    padding: 1.5rem;
  }
}

.modal-box {
  background: var(--card);
  border-radius: var(--radius);
  padding: 1.25rem;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.modal-text {
  margin: 0 0 1.25rem;
  color: var(--text);
  line-height: 1.5;
}

.modal-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-active .modal-box,
.modal-leave-active .modal-box {
  transition: transform 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-from .modal-box,
.modal-leave-to .modal-box {
  transform: scale(0.95);
}

.contact-form {
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
}

.form-row {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.form-row .form-input {
  flex: 1;
  min-width: 0;
}

.form-input {
  padding: 0.5rem 0.75rem;
  border: 1px solid #334155;
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font: inherit;
}

.form-actions {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-end;
}

.btn-secondary {
  background: #334155;
  color: var(--text);
}

.btn-secondary:hover {
  background: #475569;
}

.btn-danger {
  background: #dc2626;
  color: #fff;
}

.btn-danger:hover {
  background: #b91c1c;
}

.contact-list {
  list-style: none;
  margin: 0 0 1rem;
  padding: 0;
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  max-height: 280px;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  border-bottom: 1px solid #334155;
  background: var(--card);
}

.contact-item:last-child {
  border-bottom: none;
}

.contact-item.editing {
  background: rgba(37, 211, 102, 0.08);
}

.contact-check {
  flex-shrink: 0;
  cursor: pointer;
}

.contact-check input {
  width: 1.1rem;
  height: 1.1rem;
  accent-color: var(--green);
}

.contact-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.contact-name {
  font-weight: 500;
  color: var(--text);
}

.contact-phone {
  font-size: 0.85rem;
  color: var(--muted);
}

.contact-actions {
  display: flex;
  gap: 0.25rem;
  flex-shrink: 0;
}

.btn-icon {
  padding: 0.35rem 0.5rem;
  border: none;
  border-radius: 6px;
  background: #334155;
  cursor: pointer;
  font-size: 0.9rem;
}

.btn-icon:hover {
  background: #475569;
}

.btn-icon-danger:hover {
  background: rgba(239, 68, 68, 0.3);
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.35rem;
  font-size: 0.9rem;
  color: var(--muted);
}

.form-group textarea {
  width: 100%;
  padding: 0.6rem 0.75rem;
  border: 1px solid #334155;
  border-radius: 8px;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  resize: vertical;
}

.btn {
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.btn-primary {
  background: var(--green);
  color: #fff;
}

.btn-primary:hover:not(:disabled) {
  background: var(--green-dim);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.table-wrap {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.85rem;
}

.history-table th,
.history-table td {
  padding: 0.5rem 0.75rem;
  text-align: left;
  border-bottom: 1px solid #334155;
}

.history-table th {
  color: var(--muted);
  font-weight: 600;
}

.msg-cell {
  max-width: 180px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  border-top: 1px solid #334155;
}

.pagination-info {
  color: var(--muted);
  font-size: 0.9rem;
}

.btn-pagination {
  padding: 0.4rem 0.75rem;
  background: #334155;
  color: var(--text);
  border: none;
  border-radius: 8px;
  font: inherit;
  cursor: pointer;
}

.btn-pagination:hover:not(:disabled) {
  background: #475569;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-sm {
  padding: 0.35rem 0.6rem;
  font-size: 0.85rem;
}

.btn-resend {
  background: rgba(37, 211, 102, 0.2);
  color: var(--green);
}

.btn-resend:hover {
  background: rgba(37, 211, 102, 0.35);
}

.btn-delete-one {
  background: rgba(239, 68, 68, 0.2);
  color: #f87171;
  margin-left: 0.25rem;
}

.btn-delete-one:hover {
  background: rgba(239, 68, 68, 0.35);
}

.history-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
  flex-wrap: wrap;
}

.history-toolbar .contact-search-wrap {
  flex: 1;
  min-width: 200px;
  margin-bottom: 0;
}

.history-actions {
  flex-shrink: 0;
}

.th-check,
.td-check {
  width: 2.5rem;
  text-align: center;
  vertical-align: middle;
}

.td-actions {
  white-space: nowrap;
}

.modal-title {
  margin: 0 0 0.75rem;
  font-size: 1.1rem;
  color: var(--text);
}

.modal-box-wide {
  max-width: 520px;
}

.modal-box-template {
  max-height: calc(100vh - 1.5rem);
  max-height: calc(100dvh - 1.5rem);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0;
  border: 1px solid rgba(51, 65, 85, 0.8);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.template-modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.12) 0%, rgba(30, 41, 59, 0.98) 100%);
  border-bottom: 1px solid #334155;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  z-index: 2;
}

.template-modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
}

.template-modal-header .modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text);
}

.template-modal-close {
  flex-shrink: 0;
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.06);
  color: var(--muted);
  font-size: 1.4rem;
  line-height: 1;
  cursor: pointer;
}

.template-modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text);
}

.template-modal-body .template-sender-group {
  padding: 1rem 1.5rem 0;
}

.modal-box-template .template-modal-body .accordion {
  padding: 0 1.5rem 1rem;
}

.template-modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem 1.5rem 1.25rem;
  border-top: 1px solid #334155;
  background: linear-gradient(135deg, rgba(37, 211, 102, 0.12) 0%, rgba(30, 41, 59, 0.98) 100%);
  flex-shrink: 0;
  position: sticky;
  bottom: 0;
  z-index: 2;
}

.modal-box-template .accordion-item {
  border-radius: 10px;
  margin-bottom: 0.75rem;
  border-color: #475569;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.modal-box-template .accordion-head {
  padding: 0.85rem 1rem;
  background: linear-gradient(180deg, #475569 0%, #334155 100%);
  font-size: 0.95rem;
}

.modal-box-template .accordion-head:hover {
  background: linear-gradient(180deg, #64748b 0%, #475569 100%);
}

.modal-box-template .accordion-body {
  padding: 0.85rem 1rem;
  border-top-color: #475569;
}

.modal-box-template .template-option {
  padding: 0.85rem 0;
  border-bottom-color: #334155;
}

.modal-box-template .template-preview {
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border-radius: 8px;
  margin-bottom: 0.6rem;
}

.modal-box-template .template-option .btn-primary {
  font-size: 0.85rem;
}

@media (min-width: 768px) {
  .modal-box-template {
    max-height: min(calc(100vh - 3rem), 85vh);
    max-height: min(calc(100dvh - 3rem), 85dvh);
  }
}

.template-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-bottom: 0.35rem;
}

.template-header label {
  margin-bottom: 0;
}

.accordion {
  margin: 1rem 0;
}

.accordion-item {
  border: 1px solid #334155;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.accordion-item:last-child {
  margin-bottom: 0;
}

.accordion-head {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: #334155;
  border: none;
  color: var(--text);
  font: inherit;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
}

.accordion-head:hover {
  background: #475569;
}

.accordion-icon {
  font-size: 0.75rem;
  color: var(--muted);
}

.accordion-body {
  padding: 0.75rem 1rem;
  background: var(--card);
  border-top: 1px solid #334155;
}

.template-option {
  padding: 0.75rem 0;
  border-bottom: 1px solid #334155;
}

.template-option:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.template-option:first-child {
  padding-top: 0;
}

.template-preview {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: var(--muted);
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.template-option .btn {
  margin-top: 0.25rem;
}

.resend-times-input {
  max-width: 6rem;
}

.badge {
  display: inline-block;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
}

.badge.pending {
  background: rgba(255,193,7,0.2);
  color: #ffc107;
}

.badge.sent {
  background: rgba(37,211,102,0.2);
  color: var(--green);
}

.badge.failed {
  background: rgba(239,68,68,0.2);
  color: #f87171;
}

.empty {
  color: var(--muted);
  font-size: 0.9rem;
  margin: 0.5rem 0 0;
}

.footer {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #334155;
  color: var(--muted);
  font-size: 0.8rem;
  text-align: center;
}
</style>
