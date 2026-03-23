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
            <div class="form-group">
              <label>Tanggal & Waktu</label>
              <div class="date-time-picker">
                <input type="date" v-model="selectedDate" class="form-input date-input" />
                <input type="time" v-model="selectedTime" class="form-input time-input" />
              </div>
            </div>

            <div class="form-group mb-0">
              <label>Cari Lokasi</label>
              <div class="search-box">
                <input 
                  type="text" 
                  v-model="searchQuery" 
                  placeholder="Cari alamat atau tempat..." 
                  class="form-input search-input"
                  @keyup.enter="searchLocation"
                />
                <button @click="searchLocation" class="btn-search" :disabled="searching">
                  <svg v-if="!searching" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                  <span v-else class="loader-small"></span>
                </button>
              </div>

              <!-- Search Results Dropdown -->
              <div v-if="searchResults.length > 0" class="search-results">
                <div 
                  v-for="result in searchResults" 
                  :key="result.place_id" 
                  class="search-item"
                  @click="selectLocation(result)"
                >
                  <span class="search-item-name">{{ result.display_name }}</span>
                </div>
              </div>

              <label class="mt-4">Lokasi (Drag marker untuk menyesuaikan)</label>
              <div class="location-status" :class="{ loading: loadingLocation }">
                <span v-if="loadingLocation" class="text-muted">Memuat lokasi...</span>
                <span v-else-if="locationError" class="text-error">{{ locationError }}</span>
                <span v-else class="address-text">{{ address || 'Lokasi tidak ditemukan' }}</span>
                <button @click="getLocation" class="btn-refresh" title="Gunakan Lokasi Saya">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                </button>
              </div>
              <div id="map" class="mini-map"></div>
            </div>
          </div>
        </div>

        <!-- Selfie Layer - Bottom on Mobile, Left on Desktop -->
        <div class="selfie-section">
          <div class="video-container" v-if="!capturedImage">
            <video ref="video" autoplay playsinline class="camera-preview"></video>
            <div class="camera-overlay"></div>
            <button @click="capturePhoto" class="btn-capture" :disabled="!isCameraReady">
              <div class="capture-icon"></div>
            </button>
          </div>

          <div class="preview-container" v-else>
            <canvas ref="canvas" class="captured-canvas"></canvas>
            <div class="preview-actions">
              <button @click="resetCamera" class="btn btn-secondary" :disabled="saving">Ulang Foto</button>
              <button @click="saveAndDownload" class="btn btn-primary" :disabled="saving">
                <span v-if="saving" class="loader-small mr-2"></span>
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
import { ref, onMounted, onUnmounted, computed } from 'vue';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { showToast } from '../toast.js';
import { saveTimestampCapture } from '../db.js';

const video = ref(null);
const canvas = ref(null);
const isCameraReady = ref(false);
const capturedImage = ref(null);
const saving = ref(false);

// Date & Time Logic
const now = new Date();
const selectedDate = ref(now.toISOString().split('T')[0]);
const selectedTime = ref(`${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);

const currentDateTimeStr = computed(() => {
  return `${selectedDate.value}T${selectedTime.value}`;
});

const address = ref('');
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

const initCamera = async () => {
  try {
    const constraints = {
      video: { 
        facingMode: 'user',
        width: { ideal: 1280 },
        height: { ideal: 720 }
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
    showToast('Gagal mengakses kamera. Berikan izin di browser.', 'error');
    locationError.value = 'Kamera tidak tersedia';
  }
};

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
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
  
  setTimeout(() => {
    if (!canvas.value) return;
    const ctx = canvas.value.getContext('2d');
    
    // Target Dimensions: 1080 x 1350 (4:5 Ratio)
    const targetWidth = 1080;
    const targetHeight = 1350;
    
    const vWidth = v.videoWidth;
    const vHeight = v.videoHeight;
    
    const targetRatio = targetWidth / targetHeight; // 0.8
    const currentRatio = vWidth / vHeight;

    let sw, sh, sx, sy;

    if (currentRatio > targetRatio) {
      // Input is wider (Landscape)
      sw = vHeight * targetRatio;
      sh = vHeight;
      sx = (vWidth - sw) / 2;
      sy = 0;
    } else {
      // Input is taller (Already portrait/thin)
      sw = vWidth;
      sh = vWidth / targetRatio;
      sx = 0;
      sy = (vHeight - sh) / 2;
    }

    canvas.value.width = targetWidth;
    canvas.value.height = targetHeight;
    
    // Smooth drawing (interpolation)
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    
    // Draw cropped and scaled
    ctx.drawImage(v, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
    
    drawOverlay();
    stopCamera();
  }, 50);
};

const drawOverlay = () => {
  if (!canvas.value) return;
  const ctx = canvas.value.getContext('2d');
  const w = canvas.value.width;
  const h = canvas.value.height;

  const dateObj = new Date(currentDateTimeStr.value);
  const dateStr = dateObj.toLocaleDateString('id-ID', { 
    day: '2-digit', month: 'long', year: 'numeric' 
  });
  const timeStr = selectedTime.value; 

  const timestamp = `${dateStr} ${timeStr}`;
  const locInfo = address.value || `${coords.value.lat}, ${coords.value.lng}`;

  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)'; 
  const edgePadding = Math.max(20, w * 0.05); // Fixed for 1080p
  
  const fontSize = 28; // Larger for 1080px resolution
  ctx.font = `bold ${fontSize}px Arial`;
  
  const text1 = timestamp;
  const text2 = locInfo;
  const text3 = coords.value.lat ? `Lat: ${coords.value.lat.toFixed(6)} Lng: ${coords.value.lng.toFixed(6)}` : '';

  const measureWrappedText = (text, maxWidth) => {
    if (!text) return [];
    const words = String(text).split(' ');
    let lines = [];
    let currentLine = '';
    
    for (const word of words) {
      const testLine = currentLine + word + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine.length > 0) {
        lines.push(currentLine.trim());
        currentLine = word + ' ';
      } else {
        currentLine = testLine;
      }
    }
    lines.push(currentLine.trim());
    return lines;
  };

  const maxOverlayWidth = w * 0.8; 
  const lines1 = measureWrappedText(text1, maxOverlayWidth - 50);
  const lines2 = measureWrappedText(text2, maxOverlayWidth - 50);
  const lines3 = text3 ? measureWrappedText(text3, maxOverlayWidth - 50) : [];
  
  const allLines = [...lines1, ...lines2, ...lines3];
  
  let maxLineWidth = 0;
  allLines.forEach(line => {
    const m = ctx.measureText(line);
    if (m.width > maxLineWidth) maxLineWidth = m.width;
  });

  const bgWidth = maxLineWidth + 60;
  const lineHeight = fontSize + 12;
  const bgHeight = (allLines.length * lineHeight) + 40;

  const x = w - bgWidth - edgePadding;
  const y = h - bgHeight - edgePadding;

  ctx.fillRect(x, y, bgWidth, bgHeight);
  
  ctx.fillStyle = 'white';
  ctx.textAlign = 'left';
  
  let currentY = y + fontSize + 20;
  allLines.forEach(line => {
    ctx.fillText(line, x + 30, currentY);
    currentY += lineHeight;
  });
};

const resetCamera = () => {
  capturedImage.value = null;
  initCamera();
};

const searchLocation = async () => {
  if (!searchQuery.value.trim()) return;
  
  searching.value = true;
  searchResults.value = [];
  
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=5`);
    const data = await response.json();
    searchResults.value = data;
    if (data.length === 0) {
      showToast('Lokasi tidak ditemukan.', 'warning');
    }
  } catch (err) {
    console.error('Search location error:', err);
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
  address.value = result.display_name;
  
  updateMap(lat, lng);
  searchResults.value = [];
};

const getLocationAddress = async (lat, lng) => {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
    const data = await response.json();
    address.value = data.display_name;
  } catch (err) {
    console.error('Reverse geocoding error:', err);
    address.value = `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
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
      console.error('Geolocation error:', err);
      showToast('Gagal ambil lokasi. Aktifkan GPS & izinkan akses.', 'error');
      loadingLocation.value = false;
      updateMap(-6.1754, 106.8272); 
    },
    { enableHighAccuracy: true }
  );
};

const updateMap = (lat, lng) => {
  if (!map) {
    map = L.map('map').setView([lat, lng], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
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
    // 1. Simpan ke Database NoSQL (Synced to MySQL if enabled)
    await saveTimestampCapture({
      image: imageData,
      address: address.value,
      latitude: coords.value.lat,
      longitude: coords.value.lng,
      timestamp: currentDateTimeStr.value
    });
    
    // 2. Download File
    const link = document.createElement('a');
    link.download = `timestamp-${new Date().getTime()}.jpg`;
    link.href = imageData;
    link.click();
    
    showToast('Foto berhasil disimpan ke database.', 'success');
  } catch (err) {
    console.error('Save to DB error:', err);
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
  background: var(--bg);
  display: flex;
  flex-direction: column;
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
  font-weight: 700;
  color: #f59e0b;
}

.container-fluid {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto; 
}

.main-layout {
  display: flex;
  flex-direction: column; 
  width: 100%;
}

.selfie-section {
  order: 2;
  height: 60vh;
  position: relative;
  background: #000;
  overflow: hidden;
}

.info-section {
  order: 1;
  background: var(--card);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 100;
  min-height: 40vh; 
}

@media (min-width: 768px) {
  .main-layout {
    flex-direction: row;
    height: 90vh;
    margin: auto; 
  }

  .selfie-section {
    order: 1;
    flex: 2;
    height: 100%;
  }

  .info-section {
    order: 2;
    flex: 1;
    max-width: 400px;
    height: 100%;
    min-height: 0;
    border-bottom: none;
    border-left: 1px solid rgba(255, 255, 255, 0.1);
    overflow-y: auto;
  }
}

.date-time-picker {
  display: flex;
  gap: 0.5rem;
}

.date-input {
  flex: 2;
}

.time-input {
  flex: 1;
}

.video-container, .preview-container {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.camera-preview, .captured-canvas {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 767px) {
  .camera-preview {
    aspect-ratio: 4/5;
  }
}

.camera-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
  border: 4px solid rgba(245, 158, 11, 0.15);
}

.btn-capture {
  position: absolute;
  bottom: 2rem;
  left: 50%;
  transform: translateX(-50%);
  width: 68px;
  height: 68px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  border: 4px solid white;
  padding: 4px;
  cursor: pointer;
  transition: all 0.2s;
  z-index: 20;
}

.btn-capture:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.4);
  transform: translateX(-50%) scale(1.05);
}

.capture-icon {
  width: 100%;
  height: 100%;
  background: white;
  border-radius: 50%;
}

.preview-actions {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  z-index: 20;
}

.form-container {
  padding: 1.25rem;
}

.form-group {
  margin-bottom: 1.25rem;
  position: relative;
}

.form-group label {
  display: block;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--muted);
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid #334155;
  border-radius: 6px;
  color: var(--text);
  font-size: 0.95rem;
  outline: none;
}

.form-input:focus {
  border-color: #f59e0b;
}

.date-input::-webkit-calendar-picker-indicator,
.time-input::-webkit-calendar-picker-indicator {
  filter: invert(1);
  cursor: pointer;
}

.search-box {
  position: relative;
  display: flex;
}

.search-input {
  padding-right: 3rem;
}

.btn-search {
  position: absolute;
  right: 4px;
  top: 4px;
  bottom: 4px;
  width: 40px;
  background: #f59e0b;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-search:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0 0 6px 6px;
  z-index: 110;
  max-height: 200px;
  overflow-y: auto;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5);
}

.search-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  border-bottom: 1px solid #334155;
  font-size: 0.85rem;
  color: var(--text);
}

.search-item:last-child {
  border-bottom: none;
}

.search-item:hover {
  background: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.location-status {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem;
  background: rgba(15, 23, 42, 0.4);
  border: 1px solid #334155;
  border-radius: 6px 6px 0 0;
  font-size: 0.8rem;
}

.address-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-refresh {
  background: none;
  border: none;
  color: #f59e0b;
  cursor: pointer;
  padding: 4px;
  display: flex;
}

.mini-map {
  width: 100%;
  height: 180px;
  border-radius: 0 0 6px 6px;
  border: 1px solid #334155;
  border-top: none;
}

.btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: #f59e0b;
  color: white;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: white;
  backdrop-filter: blur(8px);
}

.loader-small {
  width: 18px;
  height: 18px;
  border: 2px solid #fff;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

.mr-2 { margin-right: 0.5rem; }

@keyframes rotation {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.mt-4 { margin-top: 1rem; }
.mb-0 { margin-bottom: 0; }
.text-error { color: #ef4444; }
.text-muted { color: var(--muted); }

:deep(.leaflet-control-attribution) {
  font-size: 7px !important;
}
</style>
