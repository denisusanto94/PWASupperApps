<template>
  <div class="wedding-view">
    <Teleport to="#app-header-portal">
      <div class="getlynkid-header-inner">
        <h1 class="header-title">Wedding Invitation</h1>
      </div>
    </Teleport>

    <div v-if="!currentUser" class="auth-screen">
      <div class="auth-card">
        <div class="auth-icon-wrapper">💌</div>
        <h2>Undangan Digital</h2>
        <p>{{ isRegisterMode ? 'Daftar akun baru' : 'Masuk untuk mengelola undangan' }}</p>
        
        <div class="auth-form">
          <input v-model="authForm.username" type="text" placeholder="Username..." class="auth-input" />
          <input v-model="authForm.password" type="password" placeholder="Password..." class="auth-input" />
          
          <button @click="handleAuth" class="btn-auth" :disabled="authLoading">
            {{ isRegisterMode ? 'Daftar & Buat Undangan' : 'Masuk' }}
          </button>
          
          <button @click="isRegisterMode = !isRegisterMode" class="btn-toggle-auth">
            {{ isRegisterMode ? 'Sudah punya akun? Masuk' : 'Belum punya akun? Daftar' }}
          </button>
        </div>
      </div>
    </div>

    <div v-else class="wedding-content">

      <div class="wedding-hero">
      <div class="hero-ornament top" aria-hidden="true">✦ ✦ ✦</div>
      <p class="wedding-subtitle">Buat undangan pernikahan digital — pilih template & isi data</p>
      <div class="hero-ornament bottom" aria-hidden="true">♥</div>
    </div>

    <section class="wedding-section template-section">
      <h2 class="section-title">
        <span class="section-icon">◇</span>
        Pilih template website undangan
      </h2>
      <p class="section-desc">Tampilan halaman website undangan Anda</p>
      
      <div class="template-carousel-container">
        <button type="button" class="carousel-nav prev" @click="scrollCarousel(-1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
        </button>
        
        <div class="template-carousel-wrapper" ref="carouselRef">
          <button
            v-for="t in templates"
            :key="t.id"
            type="button"
            class="template-card"
            :class="{ selected: selectedTemplateId === t.id, 'is-developing': t.isDeveloping }"
            :data-id="t.id"
            @click="selectedTemplateId = t.id"
          >
            <div class="template-preview" :style="{ background: t.previewBg }">
              <span class="template-preview-label">{{ t.name }}</span>
              <span v-if="t.isDeveloping" class="developing-text">Sedang Dikembangkan...</span>
            </div>
          </button>
        </div>

        <button type="button" class="carousel-nav next" @click="scrollCarousel(1)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
        </button>
      </div>
    </section>

    <section class="wedding-section form-section">
      <h2 class="section-title">
        <span class="section-icon">◇</span>
        Data undangan
        <span class="form-badge">Template {{ selectedTemplateName }}</span>
      </h2>
      <div class="form-card">
        <!-- Form dinamis: Template Classic -->

        <div class="form-divider"><span>Mempelai Pria</span></div>
        <div class="form-group">
          <label>Nama Pengantin Pria</label>
          <input v-model="form.namaMempelaiPria" type="text" class="form-input" placeholder="Contoh: Ahmad" />
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Nama Ayah Pria</label>
            <input v-model="form.orangTuaAyahPria" type="text" class="form-input" placeholder="Nama Ayah" />
          </div>
          <div class="form-group">
            <label>Nama Ibu Pria</label>
            <input v-model="form.orangTuaIbuPria" type="text" class="form-input" placeholder="Nama Ibu" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Nama Wali Pria (Opsional)</label>
            <input v-model="form.waliPria" type="text" class="form-input" placeholder="Wali Pria" />
          </div>
          <div class="form-group">
            <label>Instagram Pria (Opsional)</label>
            <input v-model="form.sosialMediaPria" type="text" class="form-input" placeholder="@username" />
          </div>
        </div>
        <div class="form-group">
          <label>Foto Mempelai Pria (Opsional)</label>
          <label class="upload-zone upload-zone-sm" :class="{ filled: form.fotoPriaFile }">
            <input type="file" accept="image/*" class="upload-input" @change="onFotoPriaChange" />
            <span v-if="!form.fotoPriaFile" class="upload-placeholder">Upload Foto</span>
            <span v-else class="upload-filename">{{ form.fotoPriaFile.name }}</span>
          </label>
        </div>

        <div class="form-divider"><span>Mempelai Wanita</span></div>
        <div class="form-group">
          <label>Nama Pengantin Wanita</label>
          <input v-model="form.namaMempelaiWanita" type="text" class="form-input" placeholder="Contoh: Siti" />
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Nama Ayah Wanita</label>
            <input v-model="form.orangTuaAyahWanita" type="text" class="form-input" placeholder="Nama Ayah" />
          </div>
          <div class="form-group">
            <label>Nama Ibu Wanita</label>
            <input v-model="form.orangTuaIbuWanita" type="text" class="form-input" placeholder="Nama Ibu" />
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Nama Wali Wanita (Opsional)</label>
            <input v-model="form.waliWanita" type="text" class="form-input" placeholder="Wali Wanita" />
          </div>
          <div class="form-group">
            <label>Instagram Wanita (Opsional)</label>
            <input v-model="form.sosialMediaWanita" type="text" class="form-input" placeholder="@username" />
          </div>
        </div>
        <div class="form-group">
          <label>Foto Mempelai Wanita (Opsional)</label>
          <label class="upload-zone upload-zone-sm" :class="{ filled: form.fotoWanitaFile }">
            <input type="file" accept="image/*" class="upload-input" @change="onFotoWanitaChange" />
            <span v-if="!form.fotoWanitaFile" class="upload-placeholder">Upload Foto</span>
            <span v-else class="upload-filename">{{ form.fotoWanitaFile.name }}</span>
          </label>
        </div>

        <div class="form-divider"><span>Acara Akad Nikah</span></div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Tanggal Akad</label>
            <input v-model="form.tanggalAkad" type="date" class="form-input form-date" />
          </div>
          <div class="form-group">
            <label>Jam Akad</label>
            <input v-model="form.jamAkad" type="text" class="form-input" placeholder="Contoh: 08.00 WIB - Selesai" />
          </div>
        </div>
        <div class="form-group">
          <label>Nama Lokasi/Gedung Akad</label>
          <input v-model="form.lokasiAkad" type="text" class="form-input" placeholder="Contoh: Masjid Jami" />
        </div>
        <div class="form-group">
          <label>Alamat Lengkap Akad</label>
          <textarea v-model="form.alamatAkad" class="form-input form-textarea" rows="2" placeholder="Alamat lengkap lokasi akad..." />
        </div>
        <div class="form-group">
          <label>Link Google Maps Akad (Opsional)</label>
          <input v-model="form.mapUrlAkad" type="url" class="form-input" placeholder="https://goo.gl/maps/..." />
        </div>

        <div class="form-divider"><span>Acara Resepsi</span></div>
        <div class="form-row-2">
          <div class="form-group">
            <label>Tanggal Resepsi</label>
            <input v-model="form.tanggalResepsi" type="date" class="form-input form-date" />
          </div>
          <div class="form-group">
            <label>Jam Resepsi</label>
            <input v-model="form.jamResepsi" type="text" class="form-input" placeholder="Contoh: 11.00 WIB - 13.00 WIB" />
          </div>
        </div>
        <div class="form-group">
          <label>Nama Lokasi/Gedung Resepsi</label>
          <input v-model="form.lokasiResepsi" type="text" class="form-input" placeholder="Contoh: Gedung Serbaguna" />
        </div>
        <div class="form-group">
          <label>Alamat Lengkap Resepsi</label>
          <textarea v-model="form.alamatResepsi" class="form-input form-textarea" rows="2" placeholder="Alamat lengkap lokasi resepsi..." />
        </div>
        <div class="form-group">
          <label>Link Google Maps Resepsi (Opsional)</label>
          <input v-model="form.mapUrlResepsi" type="url" class="form-input" placeholder="https://goo.gl/maps/..." />
        </div>

        <div class="form-divider"><span>Pembuka & Cerita Kami</span></div>
        <div class="form-group">
          <label>Kata Sambutan / Kalimat Pembuka</label>
          <textarea v-model="form.kataSambutan" class="form-input form-textarea" rows="3" placeholder="Assalamu'alaikum... kami mengundang..." />
        </div>
        <div class="form-group">
          <label>Cerita 1 (Title & Text)</label>
          <input v-model="form.storyTitle1" type="text" class="form-input mb-2" placeholder="Title Story 1" />
          <textarea v-model="form.storyText1" class="form-input form-textarea" rows="2" placeholder="Isi cerita 1..." />
        </div>
        <div class="form-group">
          <label>Cerita 2 (Title & Text)</label>
          <input v-model="form.storyTitle2" type="text" class="form-input mb-2" placeholder="Title Story 2" />
          <textarea v-model="form.storyText2" class="form-input form-textarea" rows="2" placeholder="Isi cerita 2..." />
        </div>
        <div class="form-group">
          <label>Cerita 3 (Title & Text)</label>
          <input v-model="form.storyTitle3" type="text" class="form-input mb-2" placeholder="Title Story 3" />
          <textarea v-model="form.storyText3" class="form-input form-textarea" rows="2" placeholder="Isi cerita 3..." />
        </div>

        <div class="form-divider"><span>Media & Link Lainnya</span></div>
        <div class="form-group">
          <label>Link YouTube Live (Opsional)</label>
          <input v-model="form.youtubeLiveUrl" type="url" class="form-input" placeholder="https://youtube.com/live/..." />
        </div>
        <div class="form-group">
          <label>Galeri Foto (Multiple)</label>
          <label class="upload-zone upload-zone-gallery" :class="{ filled: form.galleryFiles.length }">
            <input type="file" accept="image/*" multiple class="upload-input" @change="onGalleryChange" />
            <span v-if="!form.galleryFiles.length" class="upload-placeholder"><span class="upload-icon">🖼</span> Klik untuk upload beberapa foto</span>
            <span v-else class="upload-filename">{{ form.galleryFiles.length }} foto dipilih</span>
          </label>
        </div>
        <div class="form-group">
          <label>E-Angpao QRIS (Opsional)</label>
          <label class="upload-zone upload-zone-sm" :class="{ filled: form.eAngpaoQrisFile }">
            <input type="file" accept="image/*" class="upload-input" @change="onQrisChange" />
            <span v-if="!form.eAngpaoQrisFile" class="upload-placeholder">Upload QRIS</span>
            <span v-else class="upload-filename">{{ form.eAngpaoQrisFile.name }}</span>
          </label>
        </div>
        <div class="form-group">
          <label>Latar Lagu MP3 (Opsional)</label>
          <label class="upload-zone upload-zone-sm" :class="{ filled: form.latarLaguFile }">
            <input type="file" accept="audio/*,.mp3" class="upload-input" @change="onLatarLaguChange" />
            <span v-if="!form.latarLaguFile" class="upload-placeholder">Upload MP3</span>
            <span v-else class="upload-filename">{{ form.latarLaguFile.name }}</span>
          </label>
        </div>
      </div>
      <div class="form-actions">
        <button type="button" class="btn-preview" :disabled="isSelectedDeveloping" @click="goPreview">Preview Undangan</button>
      </div>
    </section>

    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { 
  authState,
  getModuleData, 
  saveModuleData,
  WEDDING_DB_NAME
} from '../db.js';
import { showToast } from '../toast.js';

const saving = ref(false);

// Use Global Auth
const currentUser = computed(() => authState.user?.full_name || authState.user?.email || null);
const isGuest = computed(() => authState.isGuest);
const authLoading = ref(false);

const resetForm = () => {
  Object.assign(form, {
    namaMempelaiPria: '',
    namaMempelaiWanita: '',
    orangTuaAyahPria: '',
    orangTuaIbuPria: '',
    waliPria: '',
    orangTuaAyahWanita: '',
    orangTuaIbuWanita: '',
    waliWanita: '',
    sosialMediaPria: '',
    sosialMediaWanita: '',
    kataSambutan: '',
    tanggalAkad: '',
    jamAkad: '',
    lokasiAkad: '',
    alamatAkad: '',
    mapUrlAkad: '',
    tanggalResepsi: '',
    jamResepsi: '',
    lokasiResepsi: '',
    alamatResepsi: '',
    mapUrlResepsi: '',
    youtubeLiveUrl: '',
    eAngpaoQris: null,
    latarLagu: null,
    gallery: [],
  });
};

const selectedTemplateId = ref('classic');
const templates = [
  { id: 'classic', name: 'Classic', previewBg: 'linear-gradient(145deg, #7d6b52 0%, #d4c4b0 100%)' },
  { id: 'montain', name: 'Montain', previewBg: 'linear-gradient(145deg, #134e4a 0%, #0d9488 100%)' },
  { id: 'dev1', name: 'Floral', previewBg: '#f3f4f6', isDeveloping: true },
  { id: 'dev2', name: 'Minimal', previewBg: '#f3f4f6', isDeveloping: true },
  { id: 'dev3', name: 'Elegant', previewBg: '#f3f4f6', isDeveloping: true },
];

const selectedTemplateName = computed(() => {
  const t = templates.find(item => item.id === selectedTemplateId.value);
  return t ? t.name : '';
});

const isSelectedDeveloping = computed(() => {
  const t = templates.find(item => item.id === selectedTemplateId.value);
  return t ? !!t.isDeveloping : false;
});

const form = reactive({
  namaMempelaiPria: '',
  namaMempelaiWanita: '',
  orangTuaAyahPria: '',
  orangTuaIbuPria: '',
  waliPria: '',
  orangTuaAyahWanita: '',
  orangTuaIbuWanita: '',
  waliWanita: '',
  sosialMediaPria: '',
  sosialMediaWanita: '',
  kataSambutan: '',
  tanggalAkad: '',
  jamAkad: '',
  lokasiAkad: '',
  alamatAkad: '',
  mapUrlAkad: '',
  tanggalResepsi: '',
  jamResepsi: '',
  lokasiResepsi: '',
  alamatResepsi: '',
  mapUrlResepsi: '',
  // Story timeline
  storyTitle1: 'Pertemuan yang Tak Disangka',
  storyText1: 'Kami dipertemukan dalam suasana yang sederhana. Dari obrolan singkat, tumbuh rasa nyaman dan saling menghargai satu sama lain.',
  storyTitle2: 'Belajar Saling Memahami',
  storyText2: 'Seiring waktu, kami belajar menerima kekurangan dan menguatkan kelebihan. Doa dan komunikasi menjadi pondasi dalam perjalanan ini.',
  storyTitle3: 'Yakin dan Mantap Menikah',
  storyText3: 'Dengan restu keluarga dan petunjuk Allah SWT, kami memutuskan untuk melangkah ke jenjang pernikahan sebagai ibadah seumur hidup.',
  // Links
  youtubeLiveUrl: '',
  eAngpaoQris: null, // Base64
  latarLagu: null, // Base64
  gallery: [], // Array of Base64
  fotoPria: null, // Base64
  fotoWanita: null, // Base64
  // File refs (for UI name display only)
  eAngpaoQrisFile: null,
  latarLaguFile: null,
  galleryFiles: [],
  fotoPriaFile: null,
  fotoWanitaFile: null,
});

async function onLatarLaguChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  form.latarLaguFile = file;
  form.latarLagu = await fileToBase64(file);
}

async function onGalleryChange(e) {
  const files = e.target.files;
  if (!files?.length) return;
  form.galleryFiles = Array.from(files);
  const arr = [];
  for(let f of form.galleryFiles) {
    arr.push(await fileToBase64(f));
  }
  form.gallery = arr;
}

async function onFotoPriaChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  form.fotoPriaFile = file;
  form.fotoPria = await fileToBase64(file);
}

async function onFotoWanitaChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  form.fotoWanitaFile = file;
  form.fotoWanita = await fileToBase64(file);
}

async function onQrisChange(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  form.eAngpaoQrisFile = file;
  form.eAngpaoQris = await fileToBase64(file);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

const currentDocId = ref(null);

const loadData = async () => {
  if (!currentUser.value) return;
  try {
    const results = await getModuleData(WEDDING_DB_NAME);
    if (results.length > 0) {
      const doc = results[0];
      currentDocId.value = doc.id;
      if (doc.data) Object.assign(form, doc.data);
      if (doc.data.templateId) selectedTemplateId.value = doc.data.templateId;
    }
  } catch (err) {
    console.warn('Wedding load error:', err);
  }
};

const saveData = async () => {
  if (!currentUser.value) return;
  saving.value = true;
  try {
    const { latarLaguFile, galleryFiles, fotoPriaFile, fotoWanitaFile, eAngpaoQrisFile, ...dataToSave } = form;
    // Add template ID to data
    dataToSave.templateId = selectedTemplateId.value;
    
    const result = await saveModuleData(WEDDING_DB_NAME, dataToSave, currentDocId.value);
    if (result.ok && result.id) currentDocId.value = result.id;
    
    showToast('Progress berhasil disinkron ke database!');
  } catch (err) {
    console.error('Save wedding error:', err);
    showToast('Gagal menyimpan.', 'error');
  } finally {
    saving.value = false;
  }
};

const router = useRouter();
const carouselRef = ref(null);

function scrollCarousel(dir) {
  if (carouselRef.value) {
    const scrollAmount = carouselRef.value.offsetWidth * 0.8 * dir;
    carouselRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
}

async function goPreview() {
  await saveData(); 
  const payload = {
    ...form,
    templateId: selectedTemplateId.value,
    theme: selectedTemplateId.value === 'montain' ? 'teal' : 'gold',
    namaMempelaiPriaShort: (form.namaMempelaiPria || '').split(' ')[0],
    namaMempelaiWanitaShort: (form.namaMempelaiWanita || '').split(' ')[0],
    qrisFileUrl: form.eAngpaoQris,
    latarLaguFileName: form.latarLaguFile?.name ?? 'Musik Latar',
    galleryCount: form.gallery.length,
  };

  sessionStorage.setItem('weddingInvitationPreview', JSON.stringify(payload));
  const previewPath = selectedTemplateId.value === 'montain' ? '/wedding-invitation/preview-montain' : '/wedding-invitation/preview-classic';
  router.push(previewPath);
}

onMounted(() => {
  if (currentUser.value) loadData();
});

</script>

<style scoped>
.wedding-view {
  max-width: 720px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
  min-height: 100vh;
}

/* Hero */
.wedding-hero {
  text-align: center;
  margin-bottom: 2.5rem;
  position: relative;
}

.hero-ornament {
  font-size: 0.9rem;
  letter-spacing: 0.4em;
  color: var(--wedding-accent);
  opacity: 0.8;
}

.hero-ornament.top {
  margin-bottom: 0.5rem;
}

.hero-ornament.bottom {
  margin-top: 0.75rem;
  font-size: 1.1rem;
}

.wedding-title {
  margin: 0;
  font-size: 1.85rem;
  font-weight: 700;
  color: var(--text);
  letter-spacing: -0.02em;
  background: linear-gradient(135deg, var(--text) 0%, #64748b 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.wedding-subtitle {
  margin: 0.5rem 0 0;
  font-size: 0.95rem;
  color: var(--muted);
  line-height: 1.5;
}

/* Sections */
.wedding-section {
  margin-bottom: 2.25rem;
}

.section-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0 0 1.25rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text);
}

.template-section .section-title {
  margin-bottom: 0.4rem;
}

.section-desc {
  margin: 0 0 1.25rem;
  font-size: 0.9rem;
  color: var(--muted);
  line-height: 1.4;
}

.section-icon {
  color: var(--wedding-accent);
  font-size: 0.65rem;
}

.form-badge {
  margin-left: auto;
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--wedding-accent);
}

.upload-zone-sm {
  min-height: 72px;
}

.theme-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.theme-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  padding: 0.35rem 0;
}

.theme-option input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.theme-option-swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  flex-shrink: 0;
  transition: border-color 0.2s, transform 0.2s;
}

.theme-option.checked .theme-option-swatch {
  border-color: var(--wedding-accent);
  box-shadow: 0 0 0 2px rgba(232, 121, 249, 0.3);
}

.theme-option:hover .theme-option-swatch {
  transform: scale(1.08);
}

.theme-option-name {
  font-size: 0.9rem;
  color: var(--text);
}

/* Template Carousel */
.template-section {
  padding: 1.5rem 0;
  position: relative;
}

.template-carousel-container {
  position: relative;
  margin: 0 -0.5rem;
}

.template-carousel-wrapper {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  padding: 0.5rem;
  scrollbar-width: none; /* Firefox */
}

.template-carousel-wrapper::-webkit-scrollbar {
  display: none; /* Chrome, Safari */
}

.template-card {
  flex: 0 0 calc((100% / 4.5) - 0.8rem); /* Desktop: 4.5 items */
  scroll-snap-align: start;
  padding: 0;
  border: 2px solid rgba(148, 163, 184, 0.35);
  border-radius: 14px;
  background: var(--card);
  cursor: pointer;
  overflow: hidden;
  transition: border-color 0.2s, box-shadow 0.2s, transform 0.2s;
}

@media (max-width: 900px) {
  .template-card {
    flex: 0 0 calc((100% / 3.8) - 0.8rem); /* Tablet: 3.8 items */
  }
}

@media (max-width: 600px) {
  .template-card {
    flex: 0 0 calc((100% / 2.1) - 0.8rem); /* Mobile: 2.1 items */
  }
}

.carousel-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  background: #fff;
  border: none;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  color: var(--wedding-accent);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  opacity: 0.8;
  transition: opacity 0.2s, transform 0.2s;
}

.carousel-nav:hover {
  opacity: 1;
  transform: translateY(-50%) scale(1.1);
}

.carousel-nav svg {
  width: 18px;
  height: 18px;
}

.carousel-nav.prev { left: -0.5rem; }
.carousel-nav.next { right: -0.5rem; }

@media (max-width: 600px) {
  .carousel-nav { display: none; } /* Hide buttons on mobile to use touch swipe */
}

.template-card:hover {
  border-color: rgba(148, 163, 184, 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.template-card.selected {
  border-color: var(--wedding-accent);
  box-shadow: 0 0 0 3px rgba(232, 121, 249, 0.25);
}

.template-preview {
  aspect-ratio: 3/4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.template-preview-label {
  font-size: 0.9rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
}

.template-card.is-developing {
  opacity: 0.7;
  cursor: not-allowed;
  filter: grayscale(0.7);
}

.template-preview {
  position: relative;
}

.developing-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) rotate(-10deg);
  width: 90%;
  text-align: center;
  font-size: 0.6rem;
  font-weight: 800;
  color: #fff;
  background: rgba(239, 68, 68, 0.9);
  padding: 0.25rem 0.1rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  pointer-events: none;
  z-index: 5;
}

.template-card.is-developing .template-preview-label {
  opacity: 0.3;
}

.template-card[data-id="minimal"] .template-preview-label,
.template-card[data-id="floral"] .template-preview-label {
  color: #334155;
  text-shadow: none;
}

/* Form card */
.form-card {
  background: var(--card);
  border-radius: 16px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.form-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 540px) {
  .form-row-2 {
    grid-template-columns: 1fr;
  }
}

.form-group {
  margin-bottom: 1.15rem;
}

.form-group:last-of-type {
  margin-bottom: 0;
}

.form-group > label:first-child {
  display: block;
  margin-bottom: 0.4rem;
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--muted);
}

.form-input {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border: 1px solid rgba(148, 163, 184, 0.4);
  border-radius: 10px;
  background: var(--bg);
  color: var(--text);
  font: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--wedding-accent);
  box-shadow: 0 0 0 2px rgba(232, 121, 249, 0.2);
}

.form-input::placeholder {
  color: var(--muted);
}

.form-date {
  cursor: pointer;
}

.form-textarea {
  resize: vertical;
  min-height: 88px;
}

/* Upload zones */
.upload-zone {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
  padding: 1.25rem;
  border: 2px dashed rgba(148, 163, 184, 0.45);
  border-radius: 12px;
  background: rgba(248, 250, 252, 0.5);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.upload-zone:hover {
  border-color: var(--wedding-accent);
  background: rgba(232, 121, 249, 0.06);
}

.upload-zone.filled {
  border-style: solid;
  border-color: rgba(34, 197, 94, 0.5);
  background: rgba(34, 197, 94, 0.06);
}

.upload-input {
  position: absolute;
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  z-index: -1;
}

.upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.9rem;
  color: var(--muted);
  text-align: center;
}

.upload-icon {
  font-size: 1.5rem;
  opacity: 0.9;
}

.upload-filename {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--text);
}

.form-divider {
  margin: 1.5rem 0 1rem;
  padding: 0.6rem 0;
  border-top: 1px solid rgba(148, 163, 184, 0.25);
  border-bottom: 1px solid rgba(148, 163, 184, 0.25);
}

.form-divider span {
  font-size: 0.75rem;
  color: var(--muted);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.form-actions {
  margin-top: 1.5rem;
  text-align: center;
}

.btn-preview {
  display: inline-block;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, var(--wedding-accent) 0%, #c026d3 100%);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.2s;
  box-shadow: 0 4px 14px rgba(232, 121, 249, 0.4);
}

.btn-preview:hover {
  opacity: 0.95;
  transform: translateY(-1px);
}

.btn-preview:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
  filter: grayscale(1);
  box-shadow: none;
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
  background: #fff;
  padding: 2.5rem 2rem;
  border-radius: 20px;
  width: 100%;
  max-width: 380px;
  text-align: center;
  border: 1px solid #eee;
  box-shadow: 0 20px 40px rgba(0,0,0,0.1);
}

.auth-icon-wrapper {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.auth-card h2 { margin: 0 0 0.5rem; font-size: 1.5rem; color: #4a3f35; }
.auth-card p { color: #8c7e6d; font-size: 0.9rem; margin-bottom: 2rem; }

.auth-input {
  width: 100%;
  background: #fdfaf7;
  border: 1px solid #eee;
  color: #4a3f35;
  padding: 0.85rem;
  border-radius: 12px;
  margin-bottom: 1rem;
  font-size: 0.95rem;
  outline: none;
}

.auth-input:focus { border-color: #7d6b52; }

.btn-auth {
  width: 100%;
  background: #7d6b52;
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
  color: #8c7e6d;
  padding: 0.65rem;
  margin-top: 1rem;
  cursor: pointer;
  font-size: 0.85rem;
  text-decoration: underline;
}

.user-meta-bar-minimal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  padding: 0.25rem 0.5rem 0.25rem 0.85rem;
  border-radius: 50px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.user-greeting {
  font-size: 0.8rem;
  color: var(--muted);
}

.user-greeting strong {
  color: #fff;
}

.btn-logout-minimal {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border: none;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-logout-minimal:hover {
  background: #ef4444;
  color: #fff;
  transform: scale(1.1);
}

.user-meta-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #fff;
  padding: 0.75rem 1.25rem;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
}

.btn-logout {
  background: rgba(239, 68, 68, 0.05);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.1);
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.8rem;
  font-weight: 600;
}
</style>
