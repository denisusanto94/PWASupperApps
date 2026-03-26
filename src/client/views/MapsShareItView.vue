<template>
  <div ref="pageRoot" class="ms-page" :class="{ 'ms-page--sharing': shareOpen, 'ms-page--dir': dirOpen }">
    <header class="ms-hero">
      <h1 class="ms-title">Maps ShareIt</h1>
      <p class="ms-sub">
        Berbagi lokasi populer dan hidden gem — jelajahi peta OSM, cari alamat, lihat kontribusi komunitas.
      </p>
    </header>

    <div class="ms-search-bar">
      <input
        v-model="searchQuery"
        type="search"
        class="ms-input"
        placeholder="Cari alamat atau tempat…"
        autocomplete="off"
        @keydown.enter.prevent="runSearch"
      />
      <button type="button" class="ms-btn ms-btn-primary" :disabled="searching" @click="runSearch">
        {{ searching ? 'Mencari…' : 'Cari' }}
      </button>
    </div>
    <div v-if="searchHits.length" class="ms-search-hits">
      <button
        v-for="(h, i) in searchHits"
        :key="i"
        type="button"
        class="ms-hit"
        @click="pickSearchHit(h)"
      >
        {{ h.display_name }}
      </button>
    </div>

    <div class="ms-layout">
      <div class="ms-map-wrap" :class="{ 'ms-map-wrap--sharing': shareOpen }">
        <div ref="mapEl" class="ms-map" role="application" aria-label="Peta OpenStreetMap" />
        <div v-if="shareOpen" class="ms-share-hint" aria-live="polite">
          <span class="ms-share-hint-desktop">Klik peta atau seret pin biru — form pengisian ada di panel kanan.</span>
          <span class="ms-share-hint-mobile">Klik peta atau seret pin — ringkasan lokasi di bilah bawah (geser ke atas jika perlu).</span>
        </div>
      </div>

      <aside class="ms-sidebar">
        <h2 class="ms-side-title">Kontributor terbaru</h2>
        <p v-if="loadError" class="ms-error">{{ loadError }}</p>
        <p v-else-if="!places.length && !loadingPlaces" class="ms-muted">Belum ada lokasi dibagikan. Jadilah yang pertama.</p>
        <ul v-else class="ms-list">
          <li v-for="p in displayedPlaces" :key="p.id" class="ms-list-item">
            <button type="button" class="ms-list-btn" :title="listItemTitle(p)" @click="focusPlace(p)">
              <div class="ms-list-row">
                <span v-if="p.kategori" class="ms-list-cat" :class="categoryClass(p.kategori)">{{
                  shortCategory(p.kategori)
                }}</span>
                <span class="ms-list-name-compact">
                  <span v-if="p.verified" class="ms-verified-badge" title="Lokasi terverifikasi" aria-hidden="true">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="14" height="14">
                      <path
                        fill="#1d9bf0"
                        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.5L6.5 12.41l1.41-1.41 2.68 2.68 6.18-6.18 1.41 1.41-7.59 7.59z"
                      />
                    </svg>
                  </span>
                  <span class="ms-list-name-text">{{ shortContributorName(p.contributor_name) }}</span>
                </span>
                <span class="ms-list-meta">{{ formatDateShort(p.updated_at) }}</span>
              </div>
              <p class="ms-list-comment-compact">{{ shortKomentar(p.komentar) }}</p>
            </button>
          </li>
        </ul>
        <button
          v-if="places.length > 5 && !listExpanded"
          type="button"
          class="ms-readmore"
          @click="listExpanded = true"
        >
          Baca selengkapnya ({{ places.length - 5 }} lainnya)
        </button>
        <div v-if="loadingPlaces" class="ms-muted ms-loading">Memuat data…</div>
      </aside>
    </div>

    <button
      type="button"
      class="ms-fab"
      :class="{ 'ms-fab--sheet': shareOpen }"
      title="Bagikan lokasi"
      aria-label="Bagikan lokasi"
      @click="openShareFlow"
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
    </button>

    <Transition name="ms-sheet">
      <div v-if="shareOpen" class="ms-share-layer">
        <div class="ms-share-sheet" role="dialog" aria-labelledby="ms-modal-title">
          <div class="ms-share-handle" aria-hidden="true" />
          <h2 id="ms-modal-title" class="ms-modal-title">Bagikan lokasi</h2>
          <p class="ms-modal-hint">
            Klik peta atau seret pin. Kotak hijau menampilkan lokasi pin — isi kategori dan komentar lalu simpan.
          </p>

          <div
            v-if="formLat != null && formLng != null"
            class="ms-pin-summary"
            :class="{ 'ms-pin-summary--flash': pinSummaryFlash }"
          >
            <div class="ms-pin-summary-head">
              <span class="ms-pin-summary-badge">Pin aktif</span>
              <span class="ms-pin-summary-coords">{{ formLat.toFixed(5) }}, {{ formLng.toFixed(5) }}</span>
            </div>
            <p v-if="reverseLoading" class="ms-pin-summary-loading">Mencari alamat…</p>
            <p v-else-if="formAddressLabel" class="ms-pin-summary-addr">{{ formAddressLabel }}</p>
            <p v-else class="ms-pin-summary-muted">Alamat akan diisi otomatis dari koordinat pin.</p>
          </div>

          <div class="ms-modal-search">
            <input
              v-model="modalSearch"
              type="search"
              class="ms-input"
              placeholder="Cari alamat untuk pin…"
              @keydown.enter.prevent="runModalSearch"
            />
            <button type="button" class="ms-btn ms-btn-secondary" :disabled="modalSearching" @click="runModalSearch">
              {{ modalSearching ? '…' : 'Geocode' }}
            </button>
          </div>
          <div v-if="modalHits.length" class="ms-modal-hits">
            <button
              v-for="(h, i) in modalHits"
              :key="i"
              type="button"
              class="ms-hit"
              @click="pickModalHit(h)"
            >
              {{ h.display_name }}
            </button>
          </div>

          <label class="ms-label">Kategori <span class="req">*</span></label>
          <select v-model="formKategori" class="ms-select">
            <option v-for="k in KATEGORI_OPTIONS" :key="k" :value="k">{{ k }}</option>
          </select>

          <label class="ms-label">Komentar <span class="req">*</span></label>
          <textarea v-model="formComment" class="ms-textarea" rows="3" placeholder="Ceritakan kenapa tempat ini menarik…" />

          <div class="ms-modal-actions">
            <button type="button" class="ms-btn ms-btn-ghost" @click="closeShareModal">Batal</button>
            <button type="button" class="ms-btn ms-btn-primary" :disabled="submitting" @click="submitShare">
              {{ submitting ? 'Menyimpan…' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Petunjuk arah in-app (gaya Google Maps, data OSRM/OSM) -->
    <Transition name="ms-dir-fade">
      <div v-if="dirOpen" class="ms-dir-overlay" @click.self="closeDirections">
        <div class="ms-dir-sheet" role="dialog" aria-labelledby="ms-dir-heading">
          <div class="ms-dir-drag" aria-hidden="true" />
          <header class="ms-dir-header">
            <button type="button" class="ms-dir-close" aria-label="Tutup petunjuk arah" @click="closeDirections">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <h2 id="ms-dir-heading" class="ms-dir-heading">Petunjuk arah</h2>
            <span class="ms-dir-badge">OSM</span>
          </header>

          <div class="ms-dir-card">
            <div class="ms-dir-field ms-dir-field--from">
              <span class="ms-dir-pin ms-dir-pin--a" aria-hidden="true" />
              <div class="ms-dir-field-body">
                <span class="ms-dir-field-label">Asal</span>
                <p class="ms-dir-field-value">{{ dirOriginLabel || 'Menentukan…' }}</p>
              </div>
            </div>
            <div class="ms-dir-field-line" aria-hidden="true" />
            <div class="ms-dir-field ms-dir-field--to">
              <span class="ms-dir-pin ms-dir-pin--b" aria-hidden="true" />
              <div class="ms-dir-field-body">
                <span class="ms-dir-field-label">Tujuan</span>
                <p class="ms-dir-field-value">{{ dirDestLabel }}</p>
              </div>
            </div>
          </div>

          <div class="ms-dir-actions-row">
            <button type="button" class="ms-dir-chip-btn" @click="setOriginFromGeolocation">Lokasi saya</button>
            <button type="button" class="ms-dir-chip-btn" @click="setOriginFromMapCenter">Pusat peta</button>
            <button type="button" class="ms-dir-chip-btn ms-dir-chip-btn--primary" :disabled="dirLoading" @click="fetchDirections">
              {{ dirLoading ? 'Menghitung…' : 'Hitung ulang' }}
            </button>
          </div>

          <div class="ms-dir-modes" role="tablist" aria-label="Mode perjalanan">
            <button
              v-for="m in DIR_PROFILES"
              :key="m.id"
              type="button"
              role="tab"
              :aria-selected="dirProfile === m.id"
              class="ms-dir-mode"
              :class="{ 'ms-dir-mode--active': dirProfile === m.id }"
              @click="setDirProfile(m.id)"
            >
              {{ m.label }}
            </button>
          </div>

          <p v-if="dirError" class="ms-dir-error">{{ dirError }}</p>

          <div v-if="dirSummary" class="ms-dir-summary-bar">
            <span class="ms-dir-summary-time">{{ dirSummary.time }}</span>
            <span class="ms-dir-summary-dot" aria-hidden="true" />
            <span class="ms-dir-summary-dist">{{ dirSummary.dist }}</span>
          </div>

          <div class="ms-dir-steps-wrap">
            <ol v-if="dirSteps.length" class="ms-dir-steps">
              <li v-for="(st, idx) in dirSteps" :key="idx" class="ms-dir-step">
                <div class="ms-dir-step-icon" :class="'ms-dir-step-icon--' + st.icon" aria-hidden="true">
                  {{ st.symbol }}
                </div>
                <div class="ms-dir-step-main">
                  <p class="ms-dir-step-text">{{ st.text }}</p>
                  <p class="ms-dir-step-meta">{{ st.meta }}</p>
                </div>
              </li>
            </ol>
            <p v-else-if="!dirLoading && !dirError && dirOpen" class="ms-dir-steps-empty">Rute akan muncul di sini setelah dihitung.</p>
          </div>

          <p class="ms-dir-footnote">Rute dari OSRM (proyek terbuka). Bukan layanan resmi Google Maps.</p>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { authState, saveModuleData } from '../db.js';
import { showToast } from '../toast.js';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const router = useRouter();
const pageRoot = ref(null);
const mapEl = ref(null);
let map = null;
let routeGeoLayer = null;

const DIR_PROFILES = [
  { id: 'driving', label: 'Mobil' },
  { id: 'walking', label: 'Jalan kaki' },
  { id: 'cycling', label: 'Sepeda' }
];

const dirOpen = ref(false);
const dirProfile = ref('driving');
const dirLoading = ref(false);
const dirError = ref('');
const dirDestLat = ref(null);
const dirDestLng = ref(null);
const dirDestLabel = ref('');
const dirOriginLat = ref(null);
const dirOriginLng = ref(null);
const dirOriginLabel = ref('');
const dirSummary = ref(null);
const dirSteps = ref([]);
let tiles = null;
let contributionsLayer = null;
let searchMarker = null;
let formMarker = null;
let mapClickHandler = null;
let reverseTimer = null;

const searchQuery = ref('');
const searchHits = ref([]);
const searching = ref(false);

const places = ref([]);
const loadingPlaces = ref(false);
const loadError = ref('');
const listExpanded = ref(false);

const displayedPlaces = computed(() => {
  if (listExpanded.value) return places.value;
  return places.value.slice(0, 5);
});

const shareOpen = ref(false);
const modalSearch = ref('');
const modalHits = ref([]);
const modalSearching = ref(false);
const KATEGORI_OPTIONS = ['Tempat Makan', 'Cafe', 'Hiburan'];

const formKategori = ref(KATEGORI_OPTIONS[0]);
const formComment = ref('');
const formLat = ref(null);
const formLng = ref(null);
const formAddressLabel = ref('');
const submitting = ref(false);
const reverseLoading = ref(false);
const pinSummaryFlash = ref(false);

function flashPinSummary() {
  pinSummaryFlash.value = true;
  setTimeout(() => {
    pinSummaryFlash.value = false;
  }, 650);
}

function scheduleReverseGeocode(lat, lng) {
  if (reverseTimer) clearTimeout(reverseTimer);
  reverseTimer = setTimeout(() => {
    reverseTimer = null;
    fetchReverseAddress(lat, lng);
  }, 450);
}

async function fetchReverseAddress(lat, lng) {
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  reverseLoading.value = true;
  try {
    const res = await fetch(
      `/api/maps-shareit/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}`
    );
    const data = await res.json();
    if (res.ok && data.display_name) {
      formAddressLabel.value = data.display_name;
    }
  } catch {
    /* abaikan */
  } finally {
    reverseLoading.value = false;
  }
}

function categoryClass(k) {
  if (k === 'Tempat Makan') return 'ms-cat-makan';
  if (k === 'Cafe') return 'ms-cat-cafe';
  if (k === 'Hiburan') return 'ms-cat-hiburan';
  return '';
}

function shortCategory(k) {
  if (k === 'Tempat Makan') return 'Makan';
  if (k === 'Cafe') return 'Cafe';
  if (k === 'Hiburan') return 'Hiburan';
  const s = String(k || '').trim();
  return s.length > 10 ? `${s.slice(0, 8)}…` : s || '—';
}

function shortContributorName(name) {
  const s = String(name || 'Kontributor').trim();
  if (s.length <= 22) return s;
  return `${s.slice(0, 20)}…`;
}

function shortKomentar(text) {
  const s = String(text || '').trim();
  if (!s) return '—';
  if (s.length <= 80) return s;
  return `${s.slice(0, 78)}…`;
}

function formatDateShort(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  } catch {
    return '';
  }
}

function listItemTitle(p) {
  const name = String(p.contributor_name || '').trim();
  const kom = String(p.komentar || '').trim();
  const kat = p.kategori ? `${p.kategori} · ` : '';
  return `${kat}${name}${kom ? ` — ${kom}` : ''}`;
}

async function fetchPlaces() {
  loadingPlaces.value = true;
  loadError.value = '';
  try {
    const res = await fetch('/api/maps-shareit/places?limit=200&offset=0');
    const body = await res.json();
    if (!res.ok) throw new Error(body.error || 'Gagal memuat lokasi');
    places.value = body.items || [];
    refreshContributionMarkers();
  } catch (e) {
    loadError.value = e.message || 'Gagal memuat data';
  } finally {
    loadingPlaces.value = false;
  }
}

/** Gaya pin per kategori: makan (ikon hidangan), cafe (kopi), hiburan (bintang) */
const CATEGORY_PIN = {
  'Tempat Makan': {
    light: 'hsl(28 92% 54%)',
    dark: 'hsl(20 88% 36%)',
    pulse: 'rgba(251, 146, 60, 0.5)',
    symbol:
      '<path fill="white" fill-opacity="0.96" d="M7.8 9.4c0-1.15.95-2.1 2.1-2.1h4.2c1.15 0 2.1.95 2.1 2.1v.55H7.8V9.4zm1.05 2.35h9.3c-.35 1.25-1.45 2.1-2.75 2.1h-3.8c-1.3 0-2.4-.85-2.75-2.1zm2.1-5.5a.45.45 0 01.9 0v1.05h-.9V6.25zm2.1 0a.45.45 0 01.9 0v1.05h-.9V6.25zm2.1 0a.45.45 0 01.9 0v1.05h-.9V6.25z"/>'
  },
  Cafe: {
    light: 'hsl(32 48% 48%)',
    dark: 'hsl(25 58% 30%)',
    pulse: 'rgba(180, 83, 9, 0.45)',
    symbol:
      '<path fill="white" fill-opacity="0.96" d="M8.35 8.85h5.15v4.35a1.85 1.85 0 01-1.85 1.85h-1.45a1.85 1.85 0 01-1.85-1.85V8.85zm5.65.45h1.15c.95 0 1.7.75 1.7 1.7s-.75 1.7-1.7 1.7H14v-3.4zM9.2 6.9h.9c.25 0 .45.2.45.45v.85H8.75v-.85c0-.25.2-.45.45-.45z"/>'
  },
  Hiburan: {
    light: 'hsl(265 78% 58%)',
    dark: 'hsl(280 72% 40%)',
    pulse: 'rgba(167, 139, 250, 0.55)',
    symbol:
      '<path fill="white" fill-opacity="0.96" d="M12 6.35l1.52 3.08 3.4.5-2.46 2.4.58 3.38L12 14.65l-3.04 1.6.58-3.38-2.46-2.4 3.4-.5L12 6.35z"/>'
  }
};

function contributionMarkerIcon(index, kategori) {
  const pin = CATEGORY_PIN[kategori] || CATEGORY_PIN['Tempat Makan'];
  const gid = `mspg-${index}-${Math.random().toString(36).slice(2, 9)}`;
  const delay = ((index % 9) * 0.14).toFixed(2);
  return L.divIcon({
    className: 'ms-leaflet-pin-outer',
    html: `
      <div class="ms-leaflet-pin" style="--ms-delay:${delay}s;--ms-pulse:${pin.pulse}">
        <span class="ms-leaflet-pin-pulse" aria-hidden="true"></span>
        <span class="ms-leaflet-pin-body">
          <svg class="ms-leaflet-pin-svg" viewBox="0 0 24 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <defs>
              <linearGradient id="${gid}" x1="12" y1="2" x2="12" y2="28" gradientUnits="userSpaceOnUse">
                <stop stop-color="${pin.light}"/>
                <stop offset="1" stop-color="${pin.dark}"/>
              </linearGradient>
            </defs>
            <path fill="url(#${gid})" d="M12 2C7.03 2 3 5.94 3 10.8c0 5.2 6.75 12.85 8.28 14.62.47.53 1.17.53 1.64 0C14.45 23.65 21 16 21 10.8 21 5.94 16.97 2 12 2z"/>
            <g transform="translate(0,0)">${pin.symbol}</g>
          </svg>
        </span>
      </div>
    `,
    iconSize: [44, 52],
    iconAnchor: [22, 48],
    popupAnchor: [0, -44]
  });
}

function refreshContributionMarkers() {
  if (!contributionsLayer) return;
  contributionsLayer.clearLayers();
  places.value.forEach((p, idx) => {
    if (!Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) return;
    const m = L.marker([p.latitude, p.longitude], {
      icon: contributionMarkerIcon(idx, p.kategori || 'Tempat Makan')
    });
    const verifiedHtml = p.verified
      ? `<span class="ms-popup-verified" title="Lokasi terverifikasi" aria-label="Terverifikasi"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="#1d9bf0" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 14.5L6.5 12.41l1.41-1.41 2.68 2.68 6.18-6.18 1.41 1.41-7.59 7.59z"/></svg></span>`
      : '';
    const lines = [
      `<span class="ms-popup-title-line">${verifiedHtml}<strong>${escapeHtml(p.contributor_name)}</strong></span>`,
      p.kategori ? `<em>${escapeHtml(p.kategori)}</em>` : '',
      escapeHtml(p.komentar || ''),
      p.addressLabel ? `<small>${escapeHtml(p.addressLabel)}</small>` : ''
    ].filter(Boolean);
    const destLbl =
      [p.addressLabel, p.komentar].find((x) => String(x || '').trim()) || `${p.latitude.toFixed(4)}, ${p.longitude.toFixed(4)}`;
    const navHtml = buildPopupDirectionsHtml(p.latitude, p.longitude, destLbl);
    m.bindPopup(`<div class="ms-popup">${lines.join('<br/>')}${navHtml}</div>`, {
      maxWidth: 300,
      className: 'ms-leaflet-popup'
    });
    contributionsLayer.addLayer(m);
  });
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function escapeAttr(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 200);
}

function formatRouteDuration(sec) {
  const s = Math.round(Number(sec) || 0);
  if (s < 60) return `${s} dtk`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} menit`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h} j ${rm} m` : `${h} j`;
}

function formatRouteDistance(meters) {
  const m = Number(meters) || 0;
  if (m < 1000) return `${Math.round(m)} m`;
  return `${(m / 1000).toFixed(1)} km`;
}

function formatStepDistance(meters) {
  return formatRouteDistance(meters);
}

function maneuverIcon(maneuver) {
  const t = (maneuver?.type || '').toLowerCase();
  const mod = (maneuver?.modifier || '').toLowerCase();
  if (t === 'depart') return 'start';
  if (t === 'arrive') return 'end';
  if (t === 'roundabout' || t === 'rotary' || t === 'exit roundabout' || t === 'roundabout turn') return 'roundabout';
  if (mod.includes('uturn')) return 'uturn';
  if (mod === 'sharp left' || mod === 'left') return 'left';
  if (mod === 'slight left') return 'slight-left';
  if (mod === 'sharp right' || mod === 'right') return 'right';
  if (mod === 'slight right') return 'slight-right';
  return 'straight';
}

const STEP_SYMBOLS = {
  start: 'A',
  end: 'B',
  left: '←',
  'slight-left': '↖',
  right: '→',
  'slight-right': '↗',
  straight: '↑',
  uturn: '⇄',
  roundabout: '↻'
};

function stepSymbolForIcon(icon) {
  return STEP_SYMBOLS[icon] || '·';
}

function stepInstruction(step) {
  const m = step.maneuver || {};
  const type = (m.type || '').toLowerCase();
  const mod = (m.modifier || '').toLowerCase();
  const name = step.name && String(step.name).trim() ? step.name : 'jalan terus';

  if (type === 'depart') return `Mulai dari ${name}`;
  if (type === 'arrive') return `Tiba di tujuan`;
  if (type === 'roundabout' || type === 'rotary' || type === 'roundabout turn') {
    const exit = m.exit != null ? `, keluar ke-${m.exit}` : '';
    return `Masuk bundaran${exit} menuju ${name}`;
  }
  const turnMsg = {
    left: 'Belok kiri',
    right: 'Belok kanan',
    'slight left': 'Belok sedikit ke kiri',
    'slight right': 'Belok sedikit ke kanan',
    'sharp left': 'Belok tajam ke kiri',
    'sharp right': 'Belok tajam ke kanan',
    uturn: 'Putar balik'
  };
  if (turnMsg[mod]) return `${turnMsg[mod]} menuju ${name}`;
  if (type === 'turn') return `Belok menuju ${name}`;
  if (type === 'merge') return `Gabung ke ${name}`;
  if (type === 'fork') return `Ambil cabang ke ${name}`;
  if (type === 'end of road') return `Di ujung jalan, belok menuju ${name}`;
  if (type === 'continue' || type === 'new name') return `Lanjut ke ${name}`;
  return `Menuju ${name}`;
}

function buildDirStepsFromLeg(steps) {
  return (steps || []).map((step) => {
    const maneuver = step.maneuver || {};
    const icon = maneuverIcon(maneuver);
    return {
      icon,
      symbol: stepSymbolForIcon(icon),
      text: stepInstruction(step),
      meta: formatStepDistance(step.distance)
    };
  });
}

function clearRouteOverlay() {
  if (routeGeoLayer && map) {
    map.removeLayer(routeGeoLayer);
    routeGeoLayer = null;
  }
}

function drawRouteGeometry(geometry) {
  clearRouteOverlay();
  if (!map || !geometry?.coordinates?.length) return;
  routeGeoLayer = L.geoJSON(geometry, {
    style: {
      color: '#1a73e8',
      weight: 5,
      opacity: 0.92,
      lineCap: 'round',
      lineJoin: 'round'
    }
  }).addTo(map);
  try {
    map.fitBounds(routeGeoLayer.getBounds(), { padding: [48, 48], maxZoom: 16, animate: true });
  } catch {
    /* ignore */
  }
}

async function refreshOriginLabel() {
  if (!Number.isFinite(dirOriginLat.value) || !Number.isFinite(dirOriginLng.value)) return;
  try {
    const r = await fetch(
      `/api/maps-shareit/reverse?lat=${encodeURIComponent(dirOriginLat.value)}&lon=${encodeURIComponent(dirOriginLng.value)}`
    );
    const j = await r.json();
    dirOriginLabel.value =
      j.display_name || `${dirOriginLat.value.toFixed(5)}, ${dirOriginLng.value.toFixed(5)}`;
  } catch {
    dirOriginLabel.value = `${dirOriginLat.value.toFixed(5)}, ${dirOriginLng.value.toFixed(5)}`;
  }
}

async function fetchDirections() {
  if (!map || !Number.isFinite(dirDestLat.value) || !Number.isFinite(dirDestLng.value)) return;
  let oLat = dirOriginLat.value;
  let oLng = dirOriginLng.value;
  if (!Number.isFinite(oLat) || !Number.isFinite(oLng)) {
    const c = map.getCenter();
    oLat = c.lat;
    oLng = c.lng;
    dirOriginLat.value = oLat;
    dirOriginLng.value = oLng;
    await refreshOriginLabel();
  }

  dirLoading.value = true;
  dirError.value = '';
  dirSummary.value = null;
  dirSteps.value = [];
  clearRouteOverlay();

  const from = `${oLat},${oLng}`;
  const to = `${dirDestLat.value},${dirDestLng.value}`;
  try {
    const res = await fetch(
      `/api/maps-shareit/route?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&profile=${encodeURIComponent(dirProfile.value)}`
    );
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Rute gagal');
    if (data.code !== 'Ok' || !data.routes?.[0]) {
      const hint =
        data.code === 'NoRoute'
          ? 'Tidak ada rute jalan antara asal dan tujuan (coba mode Jalan kaki atau geser titik asal).'
          : 'Tidak ada rute untuk titik ini.';
      throw new Error(data.message || hint);
    }
    const r = data.routes[0];
    if (r.geometry) drawRouteGeometry(r.geometry);
    dirSummary.value = {
      time: formatRouteDuration(r.duration),
      dist: formatRouteDistance(r.distance)
    };
    const leg = r.legs?.[0];
    dirSteps.value = buildDirStepsFromLeg(leg?.steps);
  } catch (e) {
    dirError.value = e.message || 'Gagal memuat rute';
  } finally {
    dirLoading.value = false;
  }
}

function setDirProfile(id) {
  if (!DIR_PROFILES.some((p) => p.id === id)) return;
  dirProfile.value = id;
  if (dirOpen.value && Number.isFinite(dirOriginLat.value) && Number.isFinite(dirDestLat.value)) {
    fetchDirections();
  }
}

function setOriginFromMapCenter() {
  if (!map) return;
  const c = map.getCenter();
  dirOriginLat.value = c.lat;
  dirOriginLng.value = c.lng;
  refreshOriginLabel();
  if (dirOpen.value) fetchDirections();
}

function setOriginFromGeolocation() {
  if (!navigator.geolocation) {
    showToast('Peramban tidak mendukung lokasi', 'error');
    return;
  }
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      dirOriginLat.value = pos.coords.latitude;
      dirOriginLng.value = pos.coords.longitude;
      await refreshOriginLabel();
      if (dirOpen.value) fetchDirections();
    },
    () => showToast('Lokasi tidak tersedia atau ditolak', 'error'),
    { enableHighAccuracy: true, timeout: 12000 }
  );
}

function openDirectionsPanel(lat, lng, label) {
  dirDestLat.value = lat;
  dirDestLng.value = lng;
  dirDestLabel.value = label || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  dirOpen.value = true;
  dirError.value = '';
  dirSteps.value = [];
  dirSummary.value = null;
  clearRouteOverlay();
  map?.closePopup();

  const runFetch = async () => {
    await refreshOriginLabel();
    await fetchDirections();
  };

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        dirOriginLat.value = pos.coords.latitude;
        dirOriginLng.value = pos.coords.longitude;
        runFetch();
      },
      () => {
        setOriginFromMapCenter();
      },
      { enableHighAccuracy: true, timeout: 9000 }
    );
  } else {
    setOriginFromMapCenter();
  }
}

function closeDirections() {
  dirOpen.value = false;
  clearRouteOverlay();
}

function onMapShareDirectionsClick(ev) {
  const el = ev.target.closest('[data-ms-directions]');
  if (!el) return;
  ev.preventDefault();
  ev.stopPropagation();
  const lat = parseFloat(el.getAttribute('data-lat') || '');
  const lng = parseFloat(el.getAttribute('data-lng') || '');
  const label = el.getAttribute('data-label') || '';
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
  openDirectionsPanel(lat, lng, label);
  map?.closePopup();
}

/** Popup marker: petunjuk arah in-app (OSRM) + tautan lain */
function buildPopupDirectionsHtml(lat, lng, destLabel) {
  const la = Number(lat);
  const ln = Number(lng);
  if (!Number.isFinite(la) || !Number.isFinite(ln)) return '';
  const labelEsc = escapeAttr(destLabel || `${la.toFixed(4)}, ${ln.toFixed(4)}`);
  const osmRoute = encodeURIComponent(`;${la},${ln}`);
  const osmUrl = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${osmRoute}`;
  const googleDirUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${la},${ln}`)}`;
  const appleUrl = `https://maps.apple.com/?daddr=${encodeURIComponent(`${la},${ln}`)}`;
  const geoUrl = `geo:${la},${ln}?q=${encodeURIComponent(`${la},${ln}`)}`;
  return `
    <div class="ms-popup-actions">
      <button type="button" class="ms-popup-dir-btn ms-popup-dir-btn--osm" data-ms-directions data-lat="${la}" data-lng="${ln}" data-label="${labelEsc}">
        Petunjuk arah (peta OSM)
      </button>
      <p class="ms-popup-dir-osm-note">Tampilan petunjuk langkah demi langkah di aplikasi — data jalan dari OpenStreetMap / OSRM.</p>
      <a class="ms-popup-dir-external-osm" href="${osmUrl}" target="_blank" rel="noopener noreferrer">Buka di situs OpenStreetMap</a>
      <a class="ms-popup-dir-btn ms-popup-dir-btn--geo" href="${geoUrl}" rel="noopener noreferrer">Ikuti peta — aplikasi bawaan</a>
      <p class="ms-popup-dir-hint">Pihak ketiga (Google / Apple):</p>
      <div class="ms-popup-dir-alt">
        <a href="${googleDirUrl}" target="_blank" rel="noopener noreferrer">Google Maps</a>
        <span class="ms-popup-dir-sep" aria-hidden="true">·</span>
        <a href="${appleUrl}" target="_blank" rel="noopener noreferrer">Apple Maps</a>
      </div>
    </div>
  `;
}

async function runSearch() {
  const q = searchQuery.value.trim();
  if (q.length < 2) {
    showToast('Ketik minimal 2 karakter', 'error');
    return;
  }
  searching.value = true;
  searchHits.value = [];
  try {
    const res = await fetch(`/api/maps-shareit/geocode?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Pencarian gagal');
    searchHits.value = Array.isArray(data) ? data : [];
    if (!searchHits.value.length) showToast('Tidak ada hasil', 'info');
  } catch (e) {
    showToast(e.message || 'Pencarian gagal', 'error');
  } finally {
    searching.value = false;
  }
}

function pickSearchHit(h) {
  if (!map || !Number.isFinite(h.lat) || !Number.isFinite(h.lon)) return;
  map.setView([h.lat, h.lon], 15);
  if (searchMarker) map.removeLayer(searchMarker);
  searchMarker = L.marker([h.lat, h.lon], { opacity: 0.85 }).addTo(map);
  searchMarker.bindPopup(escapeHtml(h.display_name)).openPopup();
  searchHits.value = [];
}

function focusPlace(p) {
  if (!map || !Number.isFinite(p.latitude) || !Number.isFinite(p.longitude)) return;
  map.setView([p.latitude, p.longitude], 15);
}

function openShareFlow() {
  if (!authState.sessionId || !authState.user) {
    router.push({ path: '/login', query: { redirect: '/maps-shareit' } });
    showToast('Login dulu untuk berbagi lokasi', 'info');
    return;
  }
  shareOpen.value = true;
}

function closeShareModal() {
  shareOpen.value = false;
  if (reverseTimer) {
    clearTimeout(reverseTimer);
    reverseTimer = null;
  }
  reverseLoading.value = false;
  modalHits.value = [];
  modalSearch.value = '';
  formKategori.value = KATEGORI_OPTIONS[0];
  formComment.value = '';
  formAddressLabel.value = '';
  if (map && mapClickHandler) {
    map.off('click', mapClickHandler);
    mapClickHandler = null;
  }
  if (map && formMarker) {
    map.removeLayer(formMarker);
    formMarker = null;
  }
  formLat.value = null;
  formLng.value = null;
  nextTick(() => map?.invalidateSize());
}

watch(shareOpen, async (open) => {
  if (!open || !map) return;
  await nextTick();
  setTimeout(() => map.invalidateSize(), 100);
  const c = map.getCenter();
  formLat.value = c.lat;
  formLng.value = c.lng;
  formAddressLabel.value = '';
  if (formMarker) map.removeLayer(formMarker);
  formMarker = L.marker(c, { draggable: true }).addTo(map);
  formMarker.on('dragend', () => {
    const ll = formMarker.getLatLng();
    formLat.value = ll.lat;
    formLng.value = ll.lng;
    flashPinSummary();
    scheduleReverseGeocode(ll.lat, ll.lng);
  });
  mapClickHandler = (e) => {
    formMarker.setLatLng(e.latlng);
    formLat.value = e.latlng.lat;
    formLng.value = e.latlng.lng;
    flashPinSummary();
    scheduleReverseGeocode(e.latlng.lat, e.latlng.lng);
  };
  map.on('click', mapClickHandler);
  flashPinSummary();
  scheduleReverseGeocode(c.lat, c.lng);
});

async function runModalSearch() {
  const q = modalSearch.value.trim();
  if (q.length < 2) return;
  modalSearching.value = true;
  modalHits.value = [];
  try {
    const res = await fetch(`/api/maps-shareit/geocode?q=${encodeURIComponent(q)}`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Gagal');
    modalHits.value = Array.isArray(data) ? data : [];
  } catch (e) {
    showToast(e.message || 'Gagal mencari', 'error');
  } finally {
    modalSearching.value = false;
  }
}

function pickModalHit(h) {
  if (!map || !formMarker || !Number.isFinite(h.lat) || !Number.isFinite(h.lon)) return;
  if (reverseTimer) {
    clearTimeout(reverseTimer);
    reverseTimer = null;
  }
  reverseLoading.value = false;
  const ll = L.latLng(h.lat, h.lon);
  formMarker.setLatLng(ll);
  map.setView(ll, 15);
  formLat.value = h.lat;
  formLng.value = h.lon;
  formAddressLabel.value = h.display_name || '';
  modalHits.value = [];
  flashPinSummary();
}

async function submitShare() {
  if (formLat.value == null || formLng.value == null) {
    showToast('Pilih posisi di peta', 'error');
    return;
  }
  if (!String(formComment.value).trim()) {
    showToast('Komentar wajib diisi', 'error');
    return;
  }
  if (!KATEGORI_OPTIONS.includes(formKategori.value)) {
    showToast('Pilih kategori', 'error');
    return;
  }
  submitting.value = true;
  try {
    const out = await saveModuleData('maps_shareit', {
      type: 'place_share',
      latitude: formLat.value,
      longitude: formLng.value,
      kategori: formKategori.value,
      komentar: formComment.value.trim(),
      addressLabel: formAddressLabel.value.trim() || undefined,
      createdAt: new Date().toISOString()
    });
    if (!out?.ok) {
      throw new Error(out?.error || 'Gagal menyimpan');
    }
    showToast('Lokasi berhasil dibagikan', 'success');
    closeShareModal();
    listExpanded.value = false;
    await fetchPlaces();
  } catch (e) {
    showToast(e.message || 'Gagal menyimpan', 'error');
  } finally {
    submitting.value = false;
  }
}

onMounted(() => {
  if (!mapEl.value) return;
  map = L.map(mapEl.value, { zoomControl: true }).setView([-6.2088, 106.8456], 12);
  tiles = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19
  }).addTo(map);
  contributionsLayer = L.layerGroup().addTo(map);
  setTimeout(() => map.invalidateSize(), 200);
  fetchPlaces();
  nextTick(() => {
    pageRoot.value?.addEventListener('click', onMapShareDirectionsClick);
  });
});

onUnmounted(() => {
  pageRoot.value?.removeEventListener('click', onMapShareDirectionsClick);
  clearRouteOverlay();
  if (reverseTimer) clearTimeout(reverseTimer);
  if (mapClickHandler && map) map.off('click', mapClickHandler);
  if (formMarker && map) map.removeLayer(formMarker);
  if (searchMarker && map) map.removeLayer(searchMarker);
  if (map) {
    map.remove();
    map = null;
  }
  tiles = null;
  contributionsLayer = null;
});
</script>

<style scoped>
.ms-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem 1rem 5rem;
  position: relative;
  min-height: calc(100vh - 64px);
}

.ms-hero {
  margin-bottom: 1.25rem;
}

.ms-title {
  margin: 0;
  font-size: 1.65rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.03em;
}

.ms-sub {
  margin: 0.5rem 0 0;
  font-size: 0.92rem;
  color: #94a3b8;
  line-height: 1.55;
  max-width: 42rem;
}

.ms-search-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-bottom: 0.5rem;
}

.ms-input {
  flex: 1;
  min-width: 200px;
  padding: 0.65rem 0.9rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.8);
  color: #f1f5f9;
  font-size: 0.95rem;
}

.ms-input::placeholder {
  color: #64748b;
}

.ms-btn {
  padding: 0.65rem 1.1rem;
  border-radius: 12px;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: transform 0.15s, filter 0.15s;
}

.ms-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ms-btn-primary {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.ms-btn-secondary {
  background: #334155;
  color: #e2e8f0;
}

.ms-btn-ghost {
  background: transparent;
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.ms-btn-primary:not(:disabled):hover,
.ms-btn-secondary:not(:disabled):hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.ms-search-hits,
.ms-modal-hits {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  margin-bottom: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.ms-hit {
  text-align: left;
  padding: 0.5rem 0.65rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(30, 41, 59, 0.6);
  color: #cbd5e1;
  font-size: 0.82rem;
  cursor: pointer;
  line-height: 1.35;
}

.ms-hit:hover {
  border-color: rgba(16, 185, 129, 0.4);
  color: #fff;
}

.ms-layout {
  display: grid;
  grid-template-columns: 1fr minmax(260px, 320px);
  gap: 1rem;
  align-items: stretch;
  margin-top: 1rem;
}

@media (max-width: 900px) {
  .ms-layout {
    grid-template-columns: 1fr;
  }
}

/* Layar lebar + mode bagikan: sembunyikan sidebar daftar agar peta memakai lebar penuh kontainer */
@media (min-width: 960px) {
  .ms-page--sharing .ms-layout {
    grid-template-columns: 1fr;
  }

  .ms-page--sharing .ms-sidebar {
    display: none;
  }
}

.ms-map-wrap {
  position: relative;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  min-height: 420px;
  background: #0f172a;
}

.ms-map-wrap--sharing {
  box-shadow: inset 0 0 0 2px rgba(16, 185, 129, 0.4);
}

.ms-share-hint {
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  max-width: min(100% - 16px, 520px);
  padding: 0.5rem 0.85rem;
  border-radius: 12px;
  background: rgba(15, 23, 42, 0.94);
  border: 1px solid rgba(16, 185, 129, 0.4);
  color: #e2e8f0;
  font-size: 0.76rem;
  line-height: 1.4;
  text-align: center;
  pointer-events: none;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.4);
}

.ms-share-hint-desktop {
  display: none;
}
.ms-share-hint-mobile {
  display: inline;
}

@media (min-width: 960px) {
  .ms-share-hint-desktop {
    display: inline;
  }
  .ms-share-hint-mobile {
    display: none;
  }
}

.ms-map {
  width: 100%;
  height: min(55vh, 520px);
  min-height: 360px;
}

/* Saat mode bagikan: peta dapat area lebih besar (mobile: sheet tipis di bawah) */
@media (max-width: 959px) {
  .ms-map-wrap--sharing .ms-map {
    min-height: 46vh;
    height: min(58vh, 560px);
  }
}

.ms-sidebar {
  background: rgba(30, 41, 59, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.06);
  border-radius: 16px;
  padding: 1rem 1rem 1.25rem;
}

.ms-side-title {
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: #e2e8f0;
}

.ms-muted {
  color: #64748b;
  font-size: 0.88rem;
}

.ms-error {
  color: #f87171;
  font-size: 0.88rem;
}

.ms-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.ms-list-btn {
  width: 100%;
  text-align: left;
  padding: 0.45rem 0.55rem;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  background: rgba(15, 23, 42, 0.5);
  cursor: pointer;
  transition: border-color 0.2s, background 0.2s;
}

.ms-list-btn:hover {
  border-color: rgba(16, 185, 129, 0.35);
  background: rgba(16, 185, 129, 0.08);
}

.ms-list-row {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: nowrap;
  min-width: 0;
}

.ms-list-name-compact {
  flex: 1;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 0.2rem;
  font-weight: 600;
  color: #f1f5f9;
  font-size: 0.8rem;
}

.ms-list-name-text {
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.ms-verified-badge {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  line-height: 0;
}

.ms-verified-badge svg {
  display: block;
}

.ms-list-meta {
  flex-shrink: 0;
  font-size: 0.62rem;
  font-weight: 500;
  color: #64748b;
  white-space: nowrap;
}

.ms-list-comment-compact {
  margin: 0.2rem 0 0;
  padding: 0;
  font-size: 0.72rem;
  color: #94a3b8;
  line-height: 1.35;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.ms-readmore {
  margin-top: 0.75rem;
  width: 100%;
  padding: 0.55rem;
  border-radius: 10px;
  border: 1px dashed rgba(16, 185, 129, 0.35);
  background: transparent;
  color: #34d399;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
}

.ms-readmore:hover {
  background: rgba(16, 185, 129, 0.08);
}

.ms-loading {
  margin-top: 0.5rem;
}

.ms-fab {
  position: fixed;
  right: 1.25rem;
  bottom: 1.5rem;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 12px 28px rgba(5, 150, 105, 0.35);
  z-index: 1060;
  transition: transform 0.2s, box-shadow 0.2s, bottom 0.3s ease;
}

/* FAB di atas sheet tipis (mobile) */
.ms-fab--sheet {
  bottom: calc(min(34vh, 288px) + 1rem);
}

@media (min-width: 960px) {
  .ms-fab--sheet {
    bottom: 1.5rem;
    right: calc(min(400px, 36vw) + 1.25rem);
  }
}

.ms-fab:hover {
  transform: scale(1.05);
  box-shadow: 0 16px 32px rgba(5, 150, 105, 0.45);
}

/*
 * Form bagikan:
 * - Mobile: bottom sheet tipis (~34vh) + scroll — peta tidak ketutup besar
 * - Desktop (≥960px): panel kanan penuh tinggi — peta lebar penuh di kiri
 */
.ms-share-layer {
  position: fixed;
  inset: 0;
  z-index: 1040;
  pointer-events: none;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.ms-share-sheet {
  pointer-events: auto;
  width: 100%;
  max-width: 1200px;
  max-height: min(34vh, 300px);
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-bottom: none;
  border-radius: 22px 22px 0 0;
  padding: 0 1.15rem 1.1rem;
  padding-bottom: calc(1.1rem + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -16px 48px rgba(0, 0, 0, 0.55);
}

@media (min-width: 960px) {
  .ms-share-layer {
    align-items: stretch;
    justify-content: flex-start;
    flex-direction: column;
    inset: auto;
    left: auto;
    right: 0;
    top: 64px;
    bottom: 0;
    width: min(400px, 36vw);
    max-width: 100%;
  }

  .ms-share-sheet {
    width: 100%;
    max-width: none;
    max-height: none;
    height: 100%;
    min-height: 0;
    flex: 1 1 auto;
    border-radius: 18px 0 0 0;
    border-right: none;
    border-bottom: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: -16px 0 48px rgba(0, 0, 0, 0.45);
    padding: 0.75rem 1.1rem 1.25rem;
    padding-bottom: calc(1.25rem + env(safe-area-inset-bottom, 0px));
  }

  .ms-share-handle {
    display: none;
  }

  .ms-modal-hint {
    margin-top: 0.25rem;
    margin-bottom: 0.65rem;
    font-size: 0.8rem;
  }

  .ms-modal-title {
    font-size: 1.05rem;
  }
}

.ms-share-handle {
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: rgba(148, 163, 184, 0.45);
  margin: 0.4rem auto 0.65rem;
}

.ms-pin-summary {
  margin: 0.65rem 0 0.9rem;
  padding: 0.8rem 0.95rem;
  border-radius: 14px;
  background: rgba(16, 185, 129, 0.12);
  border: 1px solid rgba(16, 185, 129, 0.38);
  transition:
    background 0.35s ease,
    border-color 0.35s ease,
    box-shadow 0.35s ease;
}

.ms-pin-summary--flash {
  background: rgba(16, 185, 129, 0.24);
  border-color: rgba(52, 211, 153, 0.65);
  box-shadow: 0 0 0 3px rgba(52, 211, 153, 0.22);
}

.ms-pin-summary-head {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.45rem;
}

.ms-pin-summary-badge {
  font-size: 0.62rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.07em;
  color: #6ee7b7;
  background: rgba(5, 150, 105, 0.4);
  padding: 0.12rem 0.42rem;
  border-radius: 6px;
}

.ms-pin-summary-coords {
  font-family: ui-monospace, 'Cascadia Code', monospace;
  font-size: 0.76rem;
  color: #a7f3d0;
}

.ms-pin-summary-addr {
  margin: 0.45rem 0 0;
  font-size: 0.82rem;
  color: #f1f5f9;
  line-height: 1.45;
}

.ms-pin-summary-muted {
  margin: 0.4rem 0 0;
  font-size: 0.76rem;
  color: #94a3b8;
}

.ms-pin-summary-loading {
  margin: 0.4rem 0 0;
  font-size: 0.78rem;
  color: #6ee7b7;
}

.ms-modal-title {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 800;
  color: #fff;
}

.ms-modal-hint {
  margin: 0.5rem 0 1rem;
  font-size: 0.85rem;
  color: #94a3b8;
  line-height: 1.5;
}

.ms-modal-search {
  display: flex;
  gap: 0.45rem;
  margin-bottom: 0.5rem;
}

.ms-modal-search .ms-input {
  min-width: 0;
}

.ms-label {
  display: block;
  margin-top: 0.75rem;
  margin-bottom: 0.35rem;
  font-size: 0.85rem;
  font-weight: 600;
  color: #cbd5e1;
}

.ms-label .req {
  color: #f87171;
}

.ms-select {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.95);
  color: #f1f5f9;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
  cursor: pointer;
}

.ms-textarea {
  width: 100%;
  padding: 0.65rem 0.85rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(15, 23, 42, 0.8);
  color: #f1f5f9;
  font-size: 0.9rem;
  resize: vertical;
  min-height: 88px;
}

.ms-list-cat {
  display: inline-block;
  flex-shrink: 0;
  margin: 0;
  padding: 0.1rem 0.38rem;
  border-radius: 5px;
  font-size: 0.6rem;
  font-weight: 800;
  text-transform: none;
  letter-spacing: 0.03em;
  line-height: 1.2;
}

.ms-cat-makan {
  background: rgba(251, 146, 60, 0.2);
  color: #fdba74;
  border: 1px solid rgba(251, 146, 60, 0.35);
}

.ms-cat-cafe {
  background: rgba(180, 83, 9, 0.25);
  color: #fcd34d;
  border: 1px solid rgba(245, 158, 11, 0.35);
}

.ms-cat-hiburan {
  background: rgba(139, 92, 246, 0.22);
  color: #c4b5fd;
  border: 1px solid rgba(139, 92, 246, 0.4);
}

.ms-modal-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1.25rem;
  justify-content: flex-end;
}

/* --- Petunjuk arah (gaya kartu Google Maps, data OSRM) --- */
.ms-dir-fade-enter-active,
.ms-dir-fade-leave-active {
  transition: opacity 0.22s ease;
}
.ms-dir-fade-enter-active .ms-dir-sheet,
.ms-dir-fade-leave-active .ms-dir-sheet {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.ms-dir-fade-enter-from,
.ms-dir-fade-leave-to {
  opacity: 0;
}
.ms-dir-fade-enter-from .ms-dir-sheet,
.ms-dir-fade-leave-to .ms-dir-sheet {
  transform: translateY(100%);
}

.ms-dir-overlay {
  position: fixed;
  inset: 0;
  z-index: 12000;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0;
  padding-bottom: env(safe-area-inset-bottom, 0);
}

.ms-dir-sheet {
  width: 100%;
  max-width: 520px;
  max-height: min(88vh, 720px);
  background: #fff;
  border-radius: 20px 20px 0 0;
  box-shadow: 0 -8px 40px rgba(0, 0, 0, 0.35);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.ms-dir-drag {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: #e2e8f0;
  margin: 0.5rem auto 0.25rem;
  flex-shrink: 0;
}

.ms-dir-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0.5rem 0.65rem 0.35rem;
  border-bottom: 1px solid #e8eaed;
  background: linear-gradient(180deg, #f8fafc 0%, #fff 100%);
  flex-shrink: 0;
}

.ms-dir-close {
  width: 44px;
  height: 44px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: #5f6368;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ms-dir-close:hover {
  background: #f1f3f4;
}

.ms-dir-heading {
  flex: 1;
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  color: #202124;
  letter-spacing: -0.02em;
}

.ms-dir-badge {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #1a73e8;
  background: #e8f0fe;
  padding: 0.2rem 0.45rem;
  border-radius: 6px;
  margin-right: 0.35rem;
}

.ms-dir-card {
  margin: 0.75rem 1rem 0;
  padding: 0.5rem 0.65rem;
  background: #fff;
  border: 1px solid #e8eaed;
  border-radius: 12px;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.08);
}

.ms-dir-field {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.35rem 0;
}

.ms-dir-field-line {
  width: 2px;
  height: 12px;
  margin-left: 11px;
  background: linear-gradient(180deg, #34a853, #ea4335);
  border-radius: 2px;
  opacity: 0.85;
}

.ms-dir-pin {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 0.35rem;
  flex-shrink: 0;
  box-shadow: 0 0 0 2px #fff, 0 0 0 3px currentColor;
}

.ms-dir-pin--a {
  color: #34a853;
  background: #34a853;
}

.ms-dir-pin--b {
  color: #ea4335;
  background: #ea4335;
}

.ms-dir-field-body {
  min-width: 0;
  flex: 1;
}

.ms-dir-field-label {
  display: block;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: #5f6368;
  margin-bottom: 0.1rem;
}

.ms-dir-field-value {
  margin: 0;
  font-size: 0.82rem;
  font-weight: 500;
  color: #202124;
  line-height: 1.35;
  word-break: break-word;
}

.ms-dir-actions-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding: 0.65rem 1rem 0.35rem;
}

.ms-dir-chip-btn {
  border: 1px solid #dadce0;
  background: #fff;
  color: #1a73e8;
  font-size: 0.72rem;
  font-weight: 600;
  padding: 0.35rem 0.65rem;
  border-radius: 999px;
  cursor: pointer;
}

.ms-dir-chip-btn:hover {
  background: #f8f9fa;
}

.ms-dir-chip-btn--primary {
  background: #1a73e8;
  color: #fff;
  border-color: #1a73e8;
}

.ms-dir-chip-btn--primary:hover:not(:disabled) {
  background: #1557b0;
  border-color: #1557b0;
}

.ms-dir-chip-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ms-dir-modes {
  display: flex;
  gap: 0.35rem;
  padding: 0.35rem 1rem 0.5rem;
  border-bottom: 1px solid #e8eaed;
}

.ms-dir-mode {
  flex: 1;
  border: 1px solid #dadce0;
  background: #fff;
  color: #5f6368;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.45rem 0.35rem;
  border-radius: 8px;
  cursor: pointer;
}

.ms-dir-mode--active {
  background: #e8f0fe;
  color: #1a73e8;
  border-color: #aecbfa;
}

.ms-dir-error {
  margin: 0.5rem 1rem 0;
  padding: 0.45rem 0.55rem;
  font-size: 0.78rem;
  color: #c5221f;
  background: #fce8e6;
  border-radius: 8px;
}

.ms-dir-summary-bar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.65rem 1rem;
  background: #e8f0fe;
  border-bottom: 1px solid #d2e3fc;
  flex-shrink: 0;
}

.ms-dir-summary-time {
  font-size: 1.35rem;
  font-weight: 600;
  color: #202124;
}

.ms-dir-summary-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #5f6368;
  opacity: 0.5;
}

.ms-dir-summary-dist {
  font-size: 0.95rem;
  font-weight: 500;
  color: #5f6368;
}

.ms-dir-steps-wrap {
  flex: 1;
  min-height: 120px;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.ms-dir-steps {
  list-style: none;
  margin: 0;
  padding: 0.5rem 0 1rem;
}

.ms-dir-step {
  display: flex;
  gap: 0.65rem;
  padding: 0.55rem 1rem;
  border-bottom: 1px solid #f1f3f4;
}

.ms-dir-step:last-child {
  border-bottom: none;
}

.ms-dir-step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e8f0fe;
  color: #1a73e8;
  font-size: 0.95rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ms-dir-step-icon--start {
  background: #e6f4ea;
  color: #137333;
}

.ms-dir-step-icon--end {
  background: #fce8e6;
  color: #c5221f;
}

.ms-dir-step-main {
  min-width: 0;
  flex: 1;
}

.ms-dir-step-text {
  margin: 0;
  font-size: 0.85rem;
  font-weight: 500;
  color: #202124;
  line-height: 1.4;
}

.ms-dir-step-meta {
  margin: 0.2rem 0 0;
  font-size: 0.7rem;
  color: #5f6368;
}

.ms-dir-steps-empty {
  margin: 1rem 1.25rem;
  font-size: 0.8rem;
  color: #5f6368;
  text-align: center;
}

.ms-dir-footnote {
  margin: 0;
  padding: 0.5rem 1rem 0.85rem;
  font-size: 0.65rem;
  color: #80868b;
  text-align: center;
  border-top: 1px solid #e8eaed;
  flex-shrink: 0;
}

@media (min-width: 960px) {
  .ms-dir-fade-enter-from .ms-dir-sheet,
  .ms-dir-fade-leave-to .ms-dir-sheet {
    transform: translateX(100%);
  }

  .ms-dir-overlay {
    align-items: stretch;
    justify-content: flex-end;
    background: rgba(15, 23, 42, 0.25);
  }

  .ms-dir-sheet {
    max-width: 400px;
    max-height: none;
    height: 100%;
    border-radius: 0;
    margin: 0;
  }

  .ms-dir-drag {
    display: none;
  }
}

.ms-sheet-enter-active,
.ms-sheet-leave-active {
  transition: opacity 0.2s ease;
}
.ms-sheet-enter-active .ms-share-sheet,
.ms-sheet-leave-active .ms-share-sheet {
  transition: transform 0.32s cubic-bezier(0.32, 0.72, 0, 1);
}
.ms-sheet-enter-from,
.ms-sheet-leave-to {
  opacity: 0;
}
.ms-sheet-enter-from .ms-share-sheet,
.ms-sheet-leave-to .ms-share-sheet {
  transform: translateY(100%);
}

@media (min-width: 960px) {
  .ms-sheet-enter-from .ms-share-sheet,
  .ms-sheet-leave-to .ms-share-sheet {
    transform: translateX(100%);
  }
}
</style>

<style>
/* Leaflet popup HTML from bindPopup */
.ms-popup {
  font-size: 0.85rem;
  line-height: 1.45;
  color: #1e293b;
}

.ms-popup-title-line {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.ms-popup-verified {
  display: inline-flex;
  align-items: center;
  line-height: 0;
  flex-shrink: 0;
}

.ms-popup em {
  display: block;
  font-style: normal;
  font-weight: 700;
  font-size: 0.78rem;
  color: #475569;
  margin: 0.15rem 0 0.25rem;
}

.ms-popup-actions {
  margin-top: 0.65rem;
  padding-top: 0.55rem;
  border-top: 1px solid rgba(148, 163, 184, 0.35);
}

.ms-popup-dir-btn {
  display: block;
  width: 100%;
  box-sizing: border-box;
  margin-bottom: 0.4rem;
  padding: 0.45rem 0.55rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-weight: 700;
  text-align: center;
  text-decoration: none;
  border: 1px solid transparent;
  cursor: pointer;
  line-height: 1.3;
}

/* Tombol petunjuk arah (biru, seperti CTA Google) — anchor & button */
.ms-popup .ms-popup-dir-btn--osm,
.ms-popup .ms-popup-dir-btn--osm:link,
.ms-popup .ms-popup-dir-btn--osm:visited,
.ms-popup .ms-popup-dir-btn--osm:hover,
.ms-popup .ms-popup-dir-btn--osm:active,
.leaflet-popup-content a.ms-popup-dir-btn--osm,
.leaflet-popup-content button.ms-popup-dir-btn--osm {
  background: #1a73e8;
  border-color: #1557b0;
  color: #ffffff !important;
  -webkit-text-fill-color: #fff;
  font-family: inherit;
  cursor: pointer;
  border-style: solid;
  border-width: 1px;
}

.ms-popup .ms-popup-dir-btn--osm:hover,
.leaflet-popup-content a.ms-popup-dir-btn--osm:hover,
.leaflet-popup-content button.ms-popup-dir-btn--osm:hover {
  filter: brightness(1.06);
  color: #ffffff !important;
  -webkit-text-fill-color: #fff;
}

.ms-popup-dir-osm-note {
  margin: 0.35rem 0 0.25rem;
  font-size: 0.62rem;
  color: #64748b;
  line-height: 1.35;
}

.ms-popup-dir-external-osm {
  display: block;
  margin-bottom: 0.45rem;
  font-size: 0.68rem;
  font-weight: 600;
  color: #1a73e8;
  text-decoration: none;
}

.ms-popup-dir-external-osm:hover {
  text-decoration: underline;
}

.ms-popup-dir-btn--geo {
  background: #f1f5f9;
  color: #0f172a;
  border-color: #cbd5e1;
}

.ms-popup-dir-btn--geo:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.ms-popup-dir-hint {
  margin: 0.35rem 0 0.2rem;
  font-size: 0.65rem;
  color: #64748b;
  line-height: 1.3;
}

.ms-popup-dir-alt {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0.25rem 0.45rem;
  font-size: 0.72rem;
  font-weight: 600;
}

.ms-popup-dir-alt a {
  color: #059669;
  text-decoration: none;
}

.ms-popup-dir-alt a:hover {
  text-decoration: underline;
}

.ms-popup-dir-sep {
  color: #94a3b8;
  user-select: none;
}

.leaflet-popup-content .ms-popup {
  min-width: 200px;
  max-width: 280px;
}

.ms-leaflet-popup .leaflet-popup-content {
  margin: 10px 12px;
}

/* Marker kontribusi: pin SVG + cincin pulse + bob ringan */
.ms-leaflet-pin-outer {
  background: transparent !important;
  border: none !important;
}

.ms-leaflet-pin {
  position: relative;
  width: 44px;
  height: 52px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  --ms-delay: 0s;
}

.ms-leaflet-pin-pulse {
  position: absolute;
  left: 50%;
  bottom: 5px;
  width: 20px;
  height: 20px;
  margin-left: -10px;
  border-radius: 50%;
  background: var(--ms-pulse, rgba(52, 211, 153, 0.45));
  box-shadow: 0 0 16px var(--ms-pulse, rgba(52, 211, 153, 0.55));
  animation: ms-pin-pulse 2.4s ease-out infinite;
  animation-delay: var(--ms-delay);
  z-index: 0;
}

@keyframes ms-pin-pulse {
  0% {
    transform: scale(0.55);
    opacity: 0.9;
  }
  65% {
    transform: scale(2.1);
    opacity: 0;
  }
  100% {
    transform: scale(2.1);
    opacity: 0;
  }
}

.ms-leaflet-pin-body {
  position: relative;
  z-index: 1;
  filter: drop-shadow(0 5px 10px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 10px rgba(45, 212, 191, 0.25));
  animation: ms-pin-bob 2.6s ease-in-out infinite;
  animation-delay: var(--ms-delay);
}

.ms-leaflet-pin-outer:hover .ms-leaflet-pin-body {
  filter: drop-shadow(0 7px 14px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 18px rgba(45, 212, 191, 0.5));
}

@keyframes ms-pin-bob {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-5px);
  }
}

.ms-leaflet-pin-svg {
  width: 40px;
  height: 54px;
  display: block;
}
</style>
