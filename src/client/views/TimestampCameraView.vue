<template>
  <div class="absensi-view">
    <Teleport to="#app-header-portal">
      <div class="header-inner">
        <h1 class="header-title">Timestamp Camera</h1>
        <div class="header-actions">
        </div>
      </div>
    </Teleport>

    <div class="container-fluid">
      <div class="main-layout" :class="{ 'photo-captured': capturedImage }">
        <!-- Info Section (Date & Location) - Top on Mobile, Left on Desktop -->
        <div class="info-section platinum-blur custom-scroll">
          <div class="form-container">
            <div class="section-badge">Configuration</div>
            <div class="section-card">
              <div class="form-group slide-up">
                <label class="field-label">📅 Tanggal & Waktu</label>
                <div class="date-time-picker">
                  <input type="date" v-model="selectedDate" class="form-input platinum-input" />
                  <input type="time" v-model="selectedTime" class="form-input platinum-input" />
                </div>
              </div>

              <div class="form-group slide-up" style="animation-delay: 0.05s">
                <label class="field-label">🖋️ Font Size ({{ overlayFontSize }}px)</label>
                <div class="font-size-control">
                  <input type="range" v-model.number="overlayFontSize" min="16" max="72" step="2" class="range-input" />
                  <div class="range-labels">
                    <span>Kecil</span>
                    <span>Besar</span>
                  </div>
                </div>
              </div>

              <div class="form-group slide-up" style="animation-delay: 0.1s">
                <label class="field-label">🔍 Cari Lokasi</label>
                <div class="search-box">
                  <input type="text" v-model="searchQuery" placeholder="Cari alamat atau tempat..." class="form-input search-input" @keyup.enter="searchLocation" />
                  <button @click="searchLocation" class="btn-search-icon" :disabled="searching">
                    <svg v-if="!searching" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <span v-else class="loader-small"></span>
                  </button>
                  <div v-if="searchResults.length > 0" class="search-results custom-scroll">
                    <div v-for="result in searchResults" :key="result.place_id" class="search-item" @click="selectLocation(result)">
                      {{ result.display_name }}
                    </div>
                  </div>
                </div>
              </div>

              <div class="form-group mb-0 slide-up" style="animation-delay: 0.2s">
                <div class="label-with-action">
                  <label class="field-label">📍 Lokasi Presisi</label>
                  <button @click="getLocation" class="btn-refresh-mini" :class="{ rotating: loadingLocation }">
                     <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                  </button>
                </div>
                <div class="location-card-premium">
                  <div class="address-chip">
                    <span v-if="loadingLocation" class="pulse-text">Mendeteksi...</span>
                    <span v-else class="address-text">{{ addressObj?.display_name || 'Lokasi tidak ditemukan' }}</span>
                  </div>
                  <div id="map" class="map-modern"></div>
                </div>
              </div>
            </div>

            <!-- History Section (hanya pengguna login) -->
            <div v-if="isLoggedIn" class="history-section slide-up" style="animation-delay: 0.3s">
               <div class="section-badge">Recent Captures</div>
               <div class="table-responsive">
                  <table class="modern-table">
                     <thead>
                        <tr>
                           <th>Time</th>
                           <th>Location</th>
                           <th>Action</th>
                        </tr>
                     </thead>
                     <tbody>
                        <tr v-for="cap in history" :key="cap._id">
                           <td>{{ cap.timestamp.split('T')[1]?.slice(0,5) || '-' }}</td>
                           <td><div class="truncate-addr">{{ cap.address || '-' }}</div></td>
                           <td>
                              <button @click="viewHistoryImage(cap.image)" class="btn-eye">👁️</button>
                           </td>
                        </tr>
                        <tr v-if="history.length === 0">
                           <td colspan="3" class="text-center">No history yet</td>
                        </tr>
                     </tbody>
                  </table>
               </div>
            </div>
          </div>
        </div>

        <!-- Selfie & Upload Layer -->
        <div class="selfie-section">
          <div class="acquisition-container" v-if="!capturedImage" :class="{ 'upload-mode': activeMethod === 'upload', 'camera-inactive': !cameraStarted && activeMethod === 'camera' }">
            <div class="glass-nav">
              <button class="nav-tab" :class="{ active: activeMethod === 'camera' }" @click="setMethod('camera')">Kamera</button>
              <button class="nav-tab" :class="{ active: activeMethod === 'upload' }" @click="setMethod('upload')">Upload</button>
            </div>

            <!-- Camera Tab Content -->
            <div v-if="activeMethod === 'camera'" class="method-view viewport-view">
              <template v-if="cameraStarted">
                <video ref="video" autoplay playsinline class="camera-engine"></video>
                <div class="viewfinder">
                  <div class="corner tl"></div><div class="corner tr"></div>
                  <div class="corner bl"></div><div class="corner br"></div>
                </div>
                <button @click="capturePhoto" class="shutter-btn" :disabled="!isCameraReady">
                  <div class="shutter-inner"></div>
                </button>
              </template>
              <div v-else class="camera-idle-state">
                  <div class="idle-icon">📸</div>
                  <h3 class="idle-title">Siap untuk Selfie?</h3>
                  <p class="idle-desc">Aktifkan kamera untuk mengambil foto dengan lokasi presisi.</p>
                  <button @click="startCameraSession" class="btn-activate-camera">
                    Ambil Foto Selfie
                  </button>
              </div>
            </div>

            <!-- Upload Tab Content -->
            <div v-else class="method-view upload-canvas" @click="triggerFileInput">
              <div class="upload-vibe fade-in">
                <div class="upload-art">
                  <div class="art-circle"></div>
                  <div class="art-icon">🖼️</div>
                </div>
                <h3 class="vibe-title">Pilih Foto Galeri</h3>
                <p class="vibe-desc">Ketuk kotak ini untuk mengunggah gambar dari perangkat Anda</p>
                <div class="vibe-specs">
                  <span>PNG, JPG</span>
                  <span>Max 10MB</span>
                </div>
              </div>
              <input type="file" ref="fileInput" accept="image/*" class="hidden-input" @change="handleFileUpload" />
            </div>
          </div>

          <div class="preview-stage" v-else>
            <div class="preview-header">
                <span class="preview-badge">Live Preview</span>
            </div>
            <canvas ref="canvas" class="final-render"></canvas>
            <div class="stage-footer">
              <button @click="resetView" class="btn-cancel" :disabled="saving">Hapus & Ulang</button>
              <button @click="saveAndDownload" class="btn-save-gold" :disabled="saving">
                <span v-if="saving" class="spinner mr-2"></span>
                {{ saving ? 'Menyimpan...' : 'Simpan Foto' }}
              </button>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- History Image Modal -->
    <Transition name="modal-fade">
      <div v-if="previewImage" class="reset-modal-overlay" @click.self="previewImage = null">
        <div class="preview-modal-card">
           <div class="modal-header-premium">
              <span class="modal-title-small">Capture Details</span>
              <button @click="previewImage = null" class="btn-close-modal">✕</button>
           </div>
           <div class="modal-body-preview">
              <img :src="previewImage" class="preview-full-img" />
           </div>
           <div class="modal-footer-premium">
              <button @click="previewImage = null" class="btn-modal-close-only">Tutup</button>
           </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick, watch } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { showToast } from '../toast.js';
import { authState, saveTimestampCapture, getTimestampCaptures } from '../db.js';

const isLoggedIn = computed(() => !!authState.user);

const video = ref(null);
const canvas = ref(null);
const fileInput = ref(null);
const isCameraReady = ref(false);
const cameraStarted = ref(false);
const capturedImage = ref(null);
const saving = ref(false);
const activeMethod = ref('camera'); // 'camera' or 'upload'
const history = ref([]);
const previewImage = ref(null);

// New: Font Size Overlay State
const overlayFontSize = ref(32);


// Date & Time Logic
const now = new Date();
const selectedDate = ref(now.toISOString().split('T')[0]);
const selectedTime = ref(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);

const currentDateTimeStr = computed(() => {
  return `${selectedDate.value}T${selectedTime.value}`;
});

const addressObj = ref(null);
const coords = ref({ lat: null, lng: null });
const loadingLocation = ref(false);
const locationError = ref('');

// Search State
const searchQuery = ref('');
const searchResults = ref([]);
const searching = ref(false);

let map = null;
let marker = null;
let stream = null;

const setMethod = (method) => {
  activeMethod.value = method;
  stopCamera();
  cameraStarted.value = false;
  isCameraReady.value = false;
};

const startCameraSession = () => {
   cameraStarted.value = true;
   nextTick(() => {
     initCamera();
   });
};

const initCamera = async () => {
  try {
    stopCamera(); 
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    const constraints = {
      video: { 
        facingMode: isMobile ? { exact: 'user' } : 'user', // Better mobile selfie targeting
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints).catch(async () => {
       // Fallback for some browsers that don't support 'exact'
       return await navigator.mediaDevices.getUserMedia({ video: true });
    });

    if (video.value) {
      video.value.srcObject = stream;
      isCameraReady.value = true;
    }
  } catch (err) {
    console.error('Error accessing camera:', err);
    showToast('Gagal mengakses kamera. Pastikan izin kamera diberikan.', 'error');
    cameraStarted.value = false;
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    stream = null;
  }
};

const capturePhoto = () => {
  if (!video.value || !isCameraReady.value) return;

  const v = video.value;
  if (v.readyState !== 4 || v.videoWidth === 0) {
    showToast('Tunggu kamera siap...', 'warning');
    return;
  }

  // Stop camera immediately after capture to save resources
  stopCamera(); 
  capturedImage.value = true;
  
  nextTick(() => {
    processImageSource(v);
  });
};


const triggerFileInput = () => {
  if (fileInput.value) fileInput.value.click();
};

const handleFileUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Use URL.createObjectURL for better performance on mobile
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    capturedImage.value = true;
    nextTick(() => {
      processImageSource(img);
      URL.revokeObjectURL(url); // Clean up
    });
  };
  img.src = url;
};

const processImageSource = async (source) => {
  // Retry mechanism for canvas mounting on real devices
  let retry = 0;
  while (!canvas.value && retry < 10) {
    await new Promise(r => setTimeout(r, 50));
    retry++;
  }

  if (!canvas.value) {
    showToast('Gagal memproses gambar. Silakan coba lagi.', 'error');
    capturedImage.value = null;
    return;
  }

  const ctx = canvas.value.getContext('2d');
  
  const targetWidth = 1080;
  const targetHeight = 1920;
  
  const sWidth = source.videoWidth || source.width;
  const sHeight = source.videoHeight || source.height;
  
  const targetRatio = targetWidth / targetHeight; 
  const currentRatio = sWidth / sHeight;

  let sw, sh, sx, sy;

  if (currentRatio > targetRatio) {
    sw = sHeight * targetRatio;
    sh = sHeight;
    sx = (sWidth - sw) / 2;
    sy = 0;
  } else {
    sw = sWidth;
    sh = sWidth / targetRatio;
    sx = 0;
    sy = (sHeight - sh) / 2;
  }

  canvas.value.width = targetWidth;
  canvas.value.height = targetHeight;
  
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  
  ctx.drawImage(source, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
  
  drawOverlay();
};


const drawOverlay = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  const w = canvas.value.width;
  const h = canvas.value.height;

  const dateObj = new Date(currentDateTimeStr.value);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
  const dateFormatted = `${dateObj.getDate()} ${months[dateObj.getMonth()]} ${dateObj.getFullYear()}`;
  const timeFormatted = `${selectedTime.value}:${String(new Date().getSeconds()).padStart(2, '0')}`; 

  const line1 = `${dateFormatted} ${timeFormatted}`;
  
  const lat = coords.value.lat || 0;
  const lng = coords.value.lng || 0;
  const latSuffix = lat >= 0 ? 'N' : 'S';
  const lngSuffix = lng >= 0 ? 'E' : 'W';
  const line2 = `${Math.abs(lat).toFixed(8)}${latSuffix} ${Math.abs(lng).toFixed(8)}${lngSuffix}`;
  
  const addr = addressObj.value?.address || {};
  const houseNo = addr.house_number ? `No.${addr.house_number} ` : '';
  const streetName = addr.road || addr.pedestrian || '';
  
  const line3 = `${houseNo}${streetName}`;
  const line4 = `${addr.village || addr.suburb || addr.neighbourhood || addr.hamlet || ''}`;
  const line5 = `Kecamatan ${addr.city_district || addr.district || addr.municipality || ''}`;
  const line6 = `Kota ${addr.city || addr.town || addr.county || ''}`;
  const line7 = `${addr.state || ''}`;

  const allLines = [line1, line2, line3, line4, line5, line6, line7];

  ctx.fillStyle = 'white';
  ctx.textAlign = 'right';
  
  // Use user-selected font size
  const fontSize = overlayFontSize.value;
  ctx.font = `bold ${fontSize}px Arial`;
  
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  
  const edgePadding = 10;
  const lineHeight = fontSize * 1.2; 
  
  const linesToDraw = allLines.filter(line => line.trim());
  let currentY = h - edgePadding - ((linesToDraw.length - 1) * lineHeight);
  
  linesToDraw.forEach(line => {
    ctx.fillText(line, w - edgePadding, currentY);
    currentY += lineHeight;
  });
  
  ctx.shadowBlur = 0;
};

const loadHistory = async () => {
  if (!authState.user) {
    history.value = [];
    return;
  }
  history.value = await getTimestampCaptures();
};

const viewHistoryImage = (img) => {
  previewImage.value = img;
};

const resetView = () => {
  capturedImage.value = null;
  cameraStarted.value = false;
  stopCamera();
};


const searchLocation = async () => {
  if (!searchQuery.value.trim()) return;
  searching.value = true;
  searchResults.value = [];
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5&addressdetails=1`);
    const data = await response.json();
    searchResults.value = data;
    if (data.length === 0) showToast('Lokasi tidak ditemukan.', 'warning');
  } catch (err) {
    showToast('Gagal mencari lokasi.', 'error');
  } finally {
    searching.value = false;
  }
};

const selectLocation = (result) => {
  const lat = parseFloat(result.lat);
  const lng = parseFloat(result.lon);
  coords.value.lat = lat;
  coords.value.lng = lng;
  addressObj.value = result;
  updateMap(lat, lng);
  searchResults.value = [];
};

const getLocationAddress = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    addressObj.value = data;
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    addressObj.value = { display_name: `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`, address: {} };
  }
};

const getLocation = () => {
  loadingLocation.value = true;
  locationError.value = '';
  if (!navigator.geolocation) {
    showToast('Browser Anda tidak mendukung lokasi.', 'error');
    loadingLocation.value = false;
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (position) => {
      coords.value.lat = position.coords.latitude;
      coords.value.lng = position.coords.longitude;
      updateMap(coords.value.lat, coords.value.lng);
      await getLocationAddress(coords.value.lat, coords.value.lng);
      loadingLocation.value = false;
    },
    (err) => {
      showToast('Gagal ambil lokasi.', 'error');
      loadingLocation.value = false;
      updateMap(-6.1754, 106.8272); 
    },
    { enableHighAccuracy: true }
  );
};

const updateMap = (lat, lng) => {
  if (!map) {
    map = L.map('map').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);
    marker = L.marker([lat, lng], { draggable: true }).addTo(map);
    marker.on('dragend', async (event) => {
      const newPos = event.target.getLatLng();
      coords.value.lat = newPos.lat;
      coords.value.lng = newPos.lng;
      loadingLocation.value = true;
      await getLocationAddress(newPos.lat, newPos.lng);
      loadingLocation.value = false;
    });
  } else {
    map.setView([lat, lng], 15);
    marker.setLatLng([lat, lng]);
  }
};

const saveAndDownload = async () => {
  if (!canvas.value) return;
  saving.value = true;
  const imageData = canvas.value.toDataURL('image/jpeg', 0.8);
  try {
    await saveTimestampCapture({
      image: imageData,
      address: addressObj.value?.display_name || '',
      latitude: coords.value.lat,
      longitude: coords.value.lng,
      timestamp: currentDateTimeStr.value
    });
    const link = document.createElement('a');
    link.download = `timestamp-${new Date().getTime()}.jpg`;
    link.href = imageData;
    link.click();
    showToast('Foto berhasil disimpan.', 'success');
    if (authState.user) await loadHistory();

  } catch (err) {
    showToast('Gagal menyimpan ke database.', 'error');
  } finally {
    saving.value = false;
  }
};

onMounted(() => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  });
  getLocation();
  if (authState.user) loadHistory();
});

watch(
  () => authState.user,
  (u) => {
    if (u) loadHistory();
    else history.value = [];
  }
);

onUnmounted(() => {
  stopCamera();
});

</script>

<style scoped>
.absensi-view {
  min-height: 100vh;
  background: #000;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.header-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
}

.header-title {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 800;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.container-fluid {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.main-layout {
  display: flex;
  flex-direction: column;
  height: 100%;
}

@media (min-width: 768px) {
  .main-layout {
    flex-direction: row;
  }
}

/* Modern Sidebar Layout */
.info-section {
  flex: 0 0 auto;
  background: #0a0f1e;
  padding: 1.5rem;
  z-index: 10;
  border-bottom: 1px solid rgba(245, 158, 11, 0.2);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .info-section {
    flex: 0 0 400px;
    height: 100vh;
    border-bottom: none;
    border-left: 1px solid rgba(245, 158, 11, 0.2);
    overflow-y: auto;
  }
}

.platinum-blur {
  background: rgba(10, 15, 30, 0.95);
  backdrop-filter: blur(20px);
}

.section-badge {
  font-size: 0.65rem;
  font-weight: 900;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  margin-bottom: 0.75rem;
  opacity: 0.8;
}

.section-card {
  background: rgba(255, 255, 255, 0.03);
  padding: 1.5rem;
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 480px) {
  .form-grid { grid-template-columns: 1fr; }
}

.field-label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  margin-bottom: 0.6rem;
}

.date-time-picker {
  display: flex;
  gap: 0.75rem;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.6rem;
  font-size: 0.7rem;
  color: #64748b;
  font-weight: 700;
}

.form-input {
  width: 100%;
  box-sizing: border-box;
  padding: 0.85rem 1rem;
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  color: white;
  font-size: 0.95rem;
  outline: none;
  transition: all 0.3s;
}

.form-input:focus {
  border-color: #f59e0b;
  background: rgba(245, 158, 11, 0.05);
}

.platinum-input { border-color: rgba(245, 158, 11, 0.2); }

.search-box {
  position: relative;
  width: 100%;
}

.search-input {
  padding-right: 52px !important;
}

.btn-search-icon {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  width: 38px;
  height: 38px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.search-results {
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  right: 0;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  z-index: 1000;
  max-height: 280px;
  overflow-y: auto;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.6);
  padding: 0.5rem;
  backdrop-filter: blur(10px);
}

.search-item {
  padding: 1rem 1.25rem;
  font-size: 0.85rem;
  color: #cbd5e1;
  cursor: pointer;
  border-radius: 10px;
  transition: all 0.2s;
  border-bottom: 1px solid rgba(255,255,255,0.03);
  line-height: 1.5;
}

.search-item:hover {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

/* Location Card Redesign */
.location-card-premium {
  border-radius: 20px;
  overflow: hidden;
  background: rgba(15, 23, 42, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
}

.address-chip {
  padding: 1.25rem;
  background: rgba(245, 158, 11, 0.08);
  border-bottom: 1px solid rgba(245, 158, 11, 0.15);
  min-height: 50px;
}

.address-text {
  display: block;
  font-size: 0.85rem;
  line-height: 1.6;
  color: #fbbf24;
  font-weight: 600;
  word-break: break-all;
}

.map-modern {
  width: 100%;
  height: 200px;
  display: block;
}

/* History Section */
.history-section {
  margin-top: 2rem;
}

.table-responsive {
  width: 100%;
  overflow-x: auto;
  border-radius: 16px;
  background: rgba(255,255,255,0.02);
  border: 1px solid rgba(255,255,255,0.05);
}

.modern-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.75rem;
}

.modern-table th {
  text-align: left;
  padding: 1rem;
  color: #64748b;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: rgba(255,255,255,0.02);
}

.modern-table td {
  padding: 1rem;
  color: #cbd5e1;
  border-top: 1px solid rgba(255,255,255,0.03);
}

.truncate-addr {
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-eye {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  color: #f59e0b;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

/* Selfie Section Styling */
.selfie-section {
  flex: 1;
  position: relative;
  background: #000;
  display: flex;
  flex-direction: column;
  min-height: 0; /* Important for flex child scrolling */
}

.acquisition-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
}

.glass-nav {
  display: flex;
  padding: 1rem;
  gap: 1rem;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-tab {
  flex: 1;
  padding: 1rem;
  background: transparent;
  border: 1px solid transparent;
  color: #94a3b8;
  font-weight: 800;
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.nav-tab.active {
  color: #fff;
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
  box-shadow: 0 4px 20px rgba(245, 158, 11, 0.1);
}

.method-view {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.camera-engine {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.viewfinder {
  position: absolute;
  width: 80%;
  aspect-ratio: 9/16;
  max-height: 70%;
  border: 1px solid rgba(255, 255, 255, 0.2);
  pointer-events: none;
}

.corner {
  position: absolute;
  width: 24px;
  height: 24px;
  border: 3px solid #f59e0b;
}

.tl { top: -3px; left: -3px; border-right: 0; border-bottom: 0; }
.tr { top: -3px; right: -3px; border-left: 0; border-bottom: 0; }
.bl { bottom: -3px; left: -3px; border-right: 0; border-top: 0; }
.br { bottom: -3px; right: -3px; border-left: 0; border-top: 0; }

.shutter-btn {
  position: absolute;
  bottom: 3rem;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  padding: 6px;
  background: rgba(255, 255, 255, 0.2);
  border: 5px solid white;
  cursor: pointer;
  transition: transform 0.1s;
}

.shutter-btn:active { transform: scale(0.9); }
.shutter-inner { width: 100%; height: 100%; background: white; border-radius: 50%; }

/* Idle State */
.camera-idle-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 4rem 2rem;
  text-align: center;
}

.idle-icon { font-size: 5rem; margin-bottom: 2rem; animation: float 3s ease-in-out infinite; }
@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-15px); } }

.idle-title { font-size: 1.75rem; font-weight: 800; color: #fff; margin-bottom: 1rem; }
.idle-desc { font-size: 1rem; color: #94a3b8; margin-bottom: 2.5rem; max-width: 280px; }

.btn-activate-camera {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  padding: 1.1rem 2.5rem;
  border-radius: 18px;
  font-weight: 800;
  border: none;
  cursor: pointer;
}

/* Upload Vibe Premium */
.upload-canvas {
  flex: 1;
  background: #020617;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.hidden-input {
  display: none !important;
}

.upload-vibe {
  width: 90%;
  max-width: 400px;
  padding: 4rem 2rem;
  border-radius: 40px;
  background: rgba(255, 255, 255, 0.02);
  border: 2px dashed rgba(255, 255, 255, 0.1);
  transition: all 0.4s;
  text-align: center;
}

.upload-canvas:hover .upload-vibe {
  background: rgba(245, 158, 11, 0.05);
  border-color: rgba(245, 158, 11, 0.4);
}

.art-circle {
  width: 140px;
  height: 140px;
  margin: 0 auto 2.5rem;
  border: 4px solid rgba(245, 158, 11, 0.1);
  border-top-color: #f59e0b;
  border-radius: 50%;
  animation: spin 3s linear infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.art-icon { font-size: 3.5rem; }
.vibe-title { font-size: 1.6rem; font-weight: 800; color: white; margin-bottom: 0.75rem; }
.vibe-desc { font-size: 0.95rem; color: #64748b; margin-bottom: 2rem; }

.vibe-specs { display: flex; gap: 0.75rem; justify-content: center; }
.vibe-specs span { font-size: 0.75rem; font-weight: 700; color: #f59e0b; background: rgba(245, 158, 11, 0.1); padding: 6px 14px; border-radius: 12px; }

/* Preview Stage */
.preview-stage { flex: 1; position: relative; background: #000; display: flex; flex-direction: column; }
.final-render { width: 100%; height: 100%; object-fit: contain; }
.stage-footer { position: absolute; bottom: 0; left:0; right:0; padding: 2rem; display: flex; gap: 1rem; background: linear-gradient(to top, #000 80%, transparent); }

.btn-cancel { flex: 1; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1); color: #fff; padding: 1.1rem; border-radius: 18px; font-weight: 700; cursor: pointer; }
.btn-save-gold { flex: 2; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #fff; padding: 1.1rem; border-radius: 18px; font-weight: 800; cursor: pointer; box-shadow: 0 10px 25px rgba(245, 158, 11, 0.4); border: none; }

/* Utils */
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.pulse-text { animation: pulse 1.5s infinite; opacity: 0.6; }
@keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }

:deep(.leaflet-control-attribution) { display: none !important; }

.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

/* Modal Preview Styles */
.reset-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.85);
  backdrop-filter: blur(10px);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.preview-modal-card {
  background: #1e293b;
  width: 95%;
  max-width: 600px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  flex-direction: column;
}

.modal-header-premium {
  padding: 1.25rem 1.5rem;
  background: rgba(15, 23, 42, 0.5);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-title-small {
  font-size: 0.85rem;
  font-weight: 800;
  color: #f59e0b;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}

.btn-close-modal {
  background: none;
  border: none;
  color: #94a3b8;
  font-size: 1.2rem;
  cursor: pointer;
  transition: color 0.2s;
}

.btn-close-modal:hover { color: white; }

.modal-body-preview {
  padding: 1rem;
  background: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  max-height: 65vh;
}

.preview-full-img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 12px;
}

.modal-footer-premium {
  padding: 1.25rem;
  background: rgba(15, 23, 42, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.05);
}

.btn-modal-close-only {
  width: 100%;
  padding: 0.85rem;
  background: #334155;
  color: white;
  border: none;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
}

.btn-modal-close-only:hover { background: #475569; }

.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s ease, transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; transform: scale(0.95); }
</style>
