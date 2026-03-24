<template>
  <div class="absensi-view">
    <Teleport to="#app-header-portal">
      <div class="header-inner">
        <h1 class="header-title">Timestamp Camera</h1>
        <div class="header-actions">
          <span class="header-tagline">Photo with Location & Time</span>
        </div>
      </div>
    </Teleport>

    <div class="container-fluid">
      <div class="main-layout" :class="{ 'photo-captured': capturedImage }">
        <!-- Info Section (Date & Location) - Top on Mobile, Right on Desktop -->
        <div class="info-section">
          <div class="form-container">
            <div class="section-card">
              <div class="form-group slide-up">
                <label class="field-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                  Tanggal & Waktu
                </label>
                <div class="date-time-picker">
                  <div class="input-wrapper">
                    <input type="date" v-model="selectedDate" class="form-input date-input platinum-input" />
                  </div>
                  <div class="input-wrapper">
                    <input type="time" v-model="selectedTime" class="form-input time-input platinum-input" />
                  </div>
                </div>
              </div>

              <!-- New Font Size Selection -->
              <div class="form-group slide-up" style="animation-delay: 0.05s">
                <label class="field-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><polyline points="4 7 4 4 20 4 20 7"/><line x1="9" y1="20" x2="15" y2="20"/><line x1="12" y1="4" x2="12" y2="20"/></svg>
                  Ukuran Font Overlay ({{ overlayFontSize }}px)
                </label>
                <div class="font-size-control">
                  <input 
                    type="range" 
                    v-model.number="overlayFontSize" 
                    min="16" 
                    max="72" 
                    step="2" 
                    class="range-input"
                  />
                  <div class="range-labels">
                    <span>Kecil</span>
                    <span>Besar</span>
                  </div>
                </div>
              </div>

              <div class="form-group slide-up" style="animation-delay: 0.1s">
                <label class="field-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  Cari Lokasi
                </label>
                <div class="search-box">
                  <input 
                    type="text" 
                    v-model="searchQuery" 
                    placeholder="Cari alamat atau tempat..." 
                    class="form-input search-input"
                    @keyup.enter="searchLocation"
                  />
                  <button @click="searchLocation" class="btn-search-icon" :disabled="searching">
                    <svg v-if="!searching" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                    <span v-else class="loader-small"></span>
                  </button>
                </div>

                <!-- Search Results Dropdown -->
                <div v-if="searchResults.length > 0" class="search-results custom-scroll">
                  <div 
                    v-for="result in searchResults" 
                    :key="result.place_id" 
                    class="search-item"
                    @click="selectLocation(result)"
                  >
                    <span class="search-item-name">{{ result.display_name }}</span>
                  </div>
                </div>
              </div>

              <div class="form-group mb-0 slide-up" style="animation-delay: 0.2s">
                <label class="field-label">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-1"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  Lokasi Presisi
                </label>
                <div class="location-card-premium">
                  <div class="location-status-bar" :class="{ loading: loadingLocation }">
                    <div class="address-content">
                      <span v-if="loadingLocation" class="pulse-text">Mendeteksi koordinat...</span>
                      <span v-else-if="locationError" class="text-error">{{ locationError }}</span>
                      <span v-else class="address-display">{{ addressObj?.display_name || 'Lokasi tidak ditemukan' }}</span>
                    </div>
                    <button @click="getLocation" class="btn-glow-refresh" :class="{ rotating: loadingLocation }" title="Refresh Lokasi">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"></path><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg>
                    </button>
                  </div>
                  <div id="map" class="map-modern"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Selfie & Upload Layer -->
        <div class="selfie-section">
          <div class="acquisition-container" v-if="!capturedImage">
            <div class="glass-nav">
              <button 
                class="nav-tab" 
                :class="{ active: activeMethod === 'camera' }"
                @click="setMethod('camera')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
                Kamera
              </button>
              <button 
                class="nav-tab" 
                :class="{ active: activeMethod === 'upload' }"
                @click="setMethod('upload')"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                Upload Foto
              </button>
            </div>

            <!-- Camera View -->
            <div v-if="activeMethod === 'camera'" class="method-view viewport-view">
              <video ref="video" autoplay playsinline class="camera-engine"></video>
              <div class="viewfinder">
                <div class="corner tl"></div>
                <div class="corner tr"></div>
                <div class="corner bl"></div>
                <div class="corner br"></div>
              </div>
              <button @click="capturePhoto" class="shutter-btn" :disabled="!isCameraReady">
                <div class="shutter-inner"></div>
              </button>
            </div>

            <!-- Upload View -->
            <div v-else class="method-view upload-canvas" @click="triggerFileInput">
              <div class="upload-vibe fade-in">
                <div class="vibe-icon-box">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                </div>
                <h3>Pilih Foto Galeri</h3>
                <p>Ketuk untuk mengunggah gambar</p>
                <span class="vibe-tag">HD PORTRAIT 9:16</span>
              </div>
              <input 
                type="file" 
                ref="fileInput" 
                accept="image/*" 
                class="hidden-input" 
                @change="handleFileUpload"
              />
            </div>
          </div>

          <div class="preview-stage" v-else>
            <canvas ref="canvas" class="final-render"></canvas>
            <div class="stage-footer">
              <button @click="resetView" class="btn-cancel" :disabled="saving">
                Batal
              </button>
              <button @click="saveAndDownload" class="btn-save-gold" :disabled="saving">
                <span v-if="saving" class="spinner mr-2"></span>
                {{ saving ? 'Menyimpan...' : 'Simpan Foto' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed, nextTick } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { showToast } from '../toast.js';
import { saveTimestampCapture } from '../db.js';

const video = ref(null);
const canvas = ref(null);
const fileInput = ref(null);
const isCameraReady = ref(false);
const capturedImage = ref(null);
const saving = ref(false);
const activeMethod = ref('camera'); // 'camera' or 'upload'

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
  if (method === 'camera') {
    initCamera();
  } else {
    stopCamera();
    isCameraReady.value = false;
  }
};

const initCamera = async () => {
  try {
    stopCamera(); 
    const constraints = {
      video: { 
        facingMode: 'user',
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      },
      audio: false
    };

    stream = await navigator.mediaDevices.getUserMedia(constraints);
    if (video.value) {
      video.value.srcObject = stream;
      isCameraReady.value = true;
    }
  } catch (err) {
    console.error('Error accessing camera:', err);
    showToast('Gagal mengakses kamera.', 'error');
    locationError.value = 'Kamera tidak tersedia';
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

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new Image();
    img.onload = () => {
      capturedImage.value = true;
      nextTick(() => {
        processImageSource(img);
      });
    };
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
};

const processImageSource = (source) => {
  if (!canvas.value) return;
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
  if (activeMethod.value === 'camera') stopCamera();
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
  
  const edgePadding = 40;
  const lineHeight = fontSize + (fontSize * 0.5); // Proportional spacing
  
  let currentY = h - edgePadding - ((allLines.length - 1) * lineHeight);
  
  allLines.forEach(line => {
    if (line.trim()) {
      ctx.fillText(line.trim(), w - edgePadding, currentY);
      currentY += lineHeight;
    }
  });
  
  ctx.shadowBlur = 0;
};

const resetView = () => {
  capturedImage.value = null;
  if (activeMethod.value === 'camera') {
    initCamera();
  }
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
  initCamera();
  getLocation();
});

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

/* Info Section Styling */
.info-section {
  flex: 0 0 auto;
  background: #0a0f1e;
  padding: 1.25rem;
  z-index: 10;
  border-bottom: 1px solid rgba(245, 158, 11, 0.2);
}

@media (min-width: 768px) {
  .info-section {
    flex: 0 0 420px;
    height: 100%;
    border-bottom: none;
    border-left: 1px solid rgba(245, 158, 11, 0.2);
    overflow-y: auto;
  }
}

.section-card {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.field-label {
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  font-weight: 800;
  color: #f59e0b;
  margin-bottom: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
}

/* Font Size Control */
.font-size-control {
  background: rgba(255, 255, 255, 0.03);
  padding: 1rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.range-input {
  width: 100%;
  accent-color: #f59e0b;
  background: transparent;
  cursor: pointer;
}

.range-labels {
  display: flex;
  justify-content: space-between;
  margin-top: 0.5rem;
  font-size: 0.65rem;
  color: #64748b;
  font-weight: 700;
}

/* Date/Time Platinum Styling */
.date-time-picker {
  display: flex;
  gap: 1rem;
}

.input-wrapper {
  flex: 1;
  position: relative;
}

.platinum-input {
  color: white !important;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.platinum-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.form-input {
  width: 100%;
  padding: 0.9rem;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-input:focus {
  border-color: #f59e0b !important;
  background: rgba(245, 158, 11, 0.05) !important;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.15);
}

/* Map & Location Modern */
.location-card-premium {
  border-radius: 16px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.location-status-bar {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  gap: 1rem;
}

.address-content {
  flex: 1;
  font-size: 0.85rem;
  line-height: 1.5;
  color: #cbd5e1;
}

.btn-glow-refresh {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.2);
  border-radius: 10px;
  color: #f59e0b;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-glow-refresh:hover {
  background: #f59e0b;
  color: white;
  box-shadow: 0 0 15px rgba(245, 158, 11, 0.4);
}

.rotating svg {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.map-modern {
  width: 100%;
  height: 220px;
}

/* Selfie Section Styling */
.selfie-section {
  flex: 1;
  position: relative;
  background: #000;
  display: flex;
  flex-direction: column;
}

.glass-nav {
  display: flex;
  padding: 0.75rem;
  gap: 0.75rem;
  background: rgba(0, 0, 0, 0.8);
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.nav-tab {
  flex: 1;
  padding: 0.85rem;
  background: transparent;
  border: 1px solid transparent;
  color: #64748b;
  font-weight: 700;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.nav-tab.active {
  color: white;
  background: rgba(245, 158, 11, 0.15);
  border-color: rgba(245, 158, 11, 0.4);
}

.method-view {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
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
  width: 20px;
  height: 20px;
  border: 2px solid #f59e0b;
}

.tl { top: -2px; left: -2px; border-right: 0; border-bottom: 0; }
.tr { top: -2px; right: -2px; border-left: 0; border-bottom: 0; }
.bl { bottom: -2px; left: -2px; border-right: 0; border-top: 0; }
.br { bottom: -2px; right: -2px; border-left: 0; border-top: 0; }

.shutter-btn {
  position: absolute;
  bottom: 2.5rem;
  width: 76px;
  height: 76px;
  border-radius: 50%;
  padding: 5px;
  background: rgba(255, 255, 255, 0.2);
  border: 4px solid white;
  cursor: pointer;
  transition: transform 0.1s;
}

.shutter-btn:active {
  transform: scale(0.9);
}

.shutter-inner {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
}

/* Upload Vibe Styling */
.upload-canvas {
  background: linear-gradient(135deg, #0f172a 0%, #020617 100%);
}

.upload-vibe {
  text-align: center;
  color: white;
  padding: 3rem;
  cursor: pointer;
}

.vibe-icon-box {
  width: 100px;
  height: 100px;
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: #f59e0b;
  transition: all 0.3s;
}

.upload-canvas:hover .vibe-icon-box {
  transform: translateY(-10px);
  background: rgba(245, 158, 11, 0.2);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.5);
}

.vibe-tag {
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.5rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  font-size: 0.7rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  color: #94a3b8;
}

/* Preview Stage */
.preview-stage {
  flex: 1;
  position: relative;
  background: #000;
  display: flex;
  flex-direction: column;
}

.final-render {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
}

.stage-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  display: flex;
  gap: 1rem;
  background: linear-gradient(to top, #000 70%, transparent);
}

.btn {
  padding: 1rem;
  border-radius: 14px;
  font-weight: 700;
  cursor: pointer;
  border: none;
}

.btn-cancel {
  flex: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  color: white;
}

.btn-save-gold {
  flex: 2;
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: white;
  font-weight: 800;
  box-shadow: 0 10px 20px -5px rgba(245, 158, 11, 0.4);
}

/* Animations */
.slide-up {
  animation: slideUp 0.5s ease-out forwards;
  opacity: 0;
}

@keyframes slideUp {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Utils */
.custom-scroll::-webkit-scrollbar { width: 4px; }
.custom-scroll::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
.pulse-text { animation: pulse 1.5s infinite; opacity: 0.6; }

@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

:deep(.leaflet-control-attribution) { display: none !important; }

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 10px;
  margin-top: 4px;
  z-index: 200;
  max-height: 200px;
  overflow-y: auto;
}

.search-item {
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #334155;
}

.search-item:hover {
  background: rgba(245, 158, 11, 0.1);
}

.btn-search-icon {
  position: absolute;
  right: 6px;
  top: 6px;
  bottom: 6px;
  width: 36px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mr-1 { margin-right: 0.25rem; }
.mr-2 { margin-right: 0.5rem; }
.mb-0 { margin-bottom: 0 !important; }
</style>
