<template>
  <div class="forecast-bmkg mt-10 mb-14 overflow-hidden">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Premium Header -->
      <div class="flex items-center justify-between mb-8 animate-fade-in">
        <div class="flex items-center gap-3">
          <div class="header-orb">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="url(#sky-grad)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v2"/><path d="m16.24 7.76 1.41-1.41"/><path d="M19 12h2"/><path d="m17.66 17.66 1.41 1.41"/><path d="M12 20v2"/><path d="m6.34 17.66-1.41 1.41"/><path d="M5 12H3"/><path d="m7.76 7.76-1.41-1.41"/><circle cx="12" cy="12" r="4"/>
              <defs>
                <linearGradient id="sky-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" /><stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" /></linearGradient>
                <linearGradient id="sun-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#fbbf24;stop-opacity:1" /><stop offset="100%" style="stop-color:#f59e0b;stop-opacity:1" /></linearGradient>
                <linearGradient id="rain-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#60a5fa;stop-opacity:1" /><stop offset="100%" style="stop-color:#3b82f6;stop-opacity:1" /></linearGradient>
                <linearGradient id="cloud-grad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" style="stop-color:#94a3b8;stop-opacity:1" /><stop offset="100%" style="stop-color:#475569;stop-opacity:1" /></linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h2 class="text-lg sm:text-xl font-extrabold text-white tracking-tight leading-none">Prakiraan Cuaca Resmi</h2>
            <div class="flex items-center gap-2 mt-1">
               <span class="px-1.5 py-0.5 bg-amber-500/10 border border-amber-500/20 rounded text-[8px] font-bold text-amber-500 uppercase tracking-widest">API BMKG</span>
               <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Jakarta Terkini</span>
            </div>
          </div>
        </div>
        <button @click="fetchWeather" class="refresh-pill group" :class="{ 'is-loading': loading }">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-180 transition-transform duration-500"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          <span class="hidden sm:inline text-[10px] font-bold text-slate-400">Update</span>
        </button>
      </div>

      <!-- Main Content -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="fancy-spinner"></div>
        <p class="mt-4 text-slate-500 text-[9px] font-bold uppercase tracking-[0.4em] animate-pulse">Menghubungkan API...</p>
      </div>

      <div v-else-if="error" class="glass-err p-6 rounded-2xl text-center border border-red-500/10">
        <p class="text-xs font-bold text-slate-300">{{ error }}</p>
        <button @click="fetchWeather" class="mt-3 px-4 py-1.5 bg-red-500/10 hover:bg-red-500/20 rounded-full text-[9px] font-black text-red-500 transition-colors uppercase tracking-widest">Retry</button>
      </div>

      <div v-else class="relative overflow-visible">
        <div class="weather-grid" :class="{ 'is-expanded': showAll }">
          <div v-for="(item, index) in displayedData" :key="index" 
               class="weather-card group" 
               :class="{ 'is-active': activeCard === index }"
               @click="toggleDetail(index)">
            
            <div class="card-inner">
                <!-- Location Info -->
                <div class="mb-5">
                    <h3 class="text-base font-bold text-white group-hover:text-amber-400 transition-colors tracking-tight overflow-hidden text-ellipsis whitespace-nowrap">{{ item.wilayah }}</h3>
                    <p class="text-[9px] font-bold text-slate-500 uppercase mt-0.5 tracking-wider">{{ currentTime }} WIB</p>
                </div>

                <!-- Visualization -->
                <div class="flex items-center justify-between gap-2 mb-6">
                    <div class="weather-icon-box">
                        <component :is="getWeatherIcon(item.current.status, 42)" />
                    </div>
                    <div class="temp-wrapper text-right">
                        <span class="text-2xl font-extrabold text-white tracking-tighter">{{ item.current.temp }}</span>
                        <span class="text-xs font-bold text-amber-500 ml-0.5">°C</span>
                    </div>
                </div>

                <!-- Footer Stats -->
                <div class="flex items-center justify-between pt-4 border-t border-white/5">
                    <div class="flex items-center gap-3 overflow-hidden">
                        <div class="status-icon-mini" :title="item.current.status">
                           <component :is="getWeatherIcon(item.current.status, 16)" />
                        </div>
                        <div class="hum-tag shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                            <span>{{ item.current.humidity }}%</span>
                        </div>
                    </div>
                    <div class="action-btn-mini group-hover:bg-amber-500 group-hover:text-black transition-all shrink-0 ml-1">
                        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" :class="{ 'rotate-90': activeCard === index }"><path d="m9 18 6-6-6-6"/></svg>
                    </div>
                </div>

                <!-- Expanded Details (Timeline items) -->
                <transition name="expand">
                  <div v-if="activeCard === index" class="details-panel mt-4">
                    <div v-for="(slot, i) in item.timeline.slice(0, 4)" :key="i" class="detail-row">
                        <span class="dr-time">{{ formatTime(slot.local_datetime) }}</span>
                        <div class="flex-grow flex justify-center">
                           <component :is="getWeatherIcon(slot.weather_desc, 14)" :title="slot.weather_desc" />
                        </div>
                        <span class="dr-hum text-[9px] text-white">{{ slot.t }}°</span>
                        <span class="dr-hum ml-2">{{ slot.hu }}%</span>
                    </div>
                  </div>
                </transition>
            </div>
          </div>
        </div>

        <!-- Carousel / Control Icon -->
        <div v-if="weatherData.length > 4" class="mt-10 flex flex-col items-center">
            <button @click="showAll = !showAll" class="carousel-control group" :class="{ 'is-active': showAll }">
                <div class="cc-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="cc-icon"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </button>
            <p class="text-[8px] font-bold text-slate-500 uppercase tracking-[0.3em] mt-2 opacity-50">{{ showAll ? 'Minimize' : 'Explore Districts' }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, h } from 'vue';

const weatherData = ref([]);
const loading = ref(true);
const error = ref(null);
const showAll = ref(false);
const activeCard = ref(null);

const districts = [
  { name: 'Jakarta Pusat', code: '31.71.01.1001' },
  { name: 'Jakarta Timur', code: '31.75.01.1001' },
  { name: 'Jakarta Barat', code: '31.73.01.1001' },
  { name: 'Jakarta Selatan', code: '31.74.01.1001' },
  { name: 'Jakarta Utara', code: '31.72.01.1001' },
  { name: 'Kepulauan Seribu', code: '31.01.01.1001' }
];

const currentTime = computed(() => {
  const now = new Date();
  return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
});

const displayedData = computed(() => {
  if (showAll.value) return weatherData.value;
  return weatherData.value.slice(0, 4);
});

const toggleDetail = (idx) => {
    activeCard.value = activeCard.value === idx ? null : idx;
};

const formatTime = (isoStr) => {
    if (!isoStr) return '--:--';
    // Format "2026-03-24 14:00:00" or similar
    const timeMatch = isoStr.match(/(\d{2}):(\d{2}):/);
    return timeMatch ? `${timeMatch[1]}:${timeMatch[2]}` : isoStr.substring(11, 16);
};

const getWeatherIcon = (status, size = 24) => {
    const s = (status || '').toLowerCase();
    
    const sunIcon = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'url(#sun-grad)', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'drop-shadow-amber' }, [
        h('circle', { cx: '12', cy: '12', r: '4' }),
        h('path', { d: 'M12 2v2M12 20v2m-7.07-15.07 1.41 1.41m12.72 12.72 1.41 1.41M2 12h2m16 0h2m-15.36 5.36-1.41 1.41m12.72-12.72-1.41 1.41' })
    ]);

    const rainIcon = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'url(#rain-grad)', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'drop-shadow-blue' }, [
        h('path', { d: 'M16 13v8M8 13v8M12 15v8' }),
        h('path', { d: 'M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25c0 2.5 2 4.5 4.5 4.5H17.5' })
    ]);

    const cloudIcon = h('svg', { xmlns: 'http://www.w3.org/2000/svg', width: size, height: size, viewBox: '0 0 24 24', fill: 'none', stroke: 'url(#cloud-grad)', 'stroke-width': '2', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', class: 'drop-shadow-slate' }, [
        h('path', { d: 'M17.5 19c2.5 0 4.5-2 4.5-4.5s-2-4.5-4.5-4.5h-1.26A8 8 0 1 0 4 15.25c0 2.5 2 4.5 4.5 4.5H17.5' })
    ]);

    if (s.includes('hujan')) return rainIcon;
    if (s.includes('cerah') && !s.includes('berawan')) return sunIcon;
    return cloudIcon;
};

const fetchWeather = async () => {
    loading.value = true;
    error.value = null;
    try {
        const results = await Promise.all(districts.map(async (dist) => {
            try {
                const response = await fetch(`/api/weather-official?adm4=${dist.code}`);
                const json = await response.json();
                
                // Extract timeline for current and next few hours
                // Typical structure: json.data[0].cuaca is an array of arrays (days)
                // Flattening it or just taking the first 2 days
                let timeline = [];
                if (json.data && json.data[0] && json.data[0].cuaca) {
                    timeline = json.data[0].cuaca.flat();
                }

                // Current is the one closest to now, or just the first if it's the current period
                const current = timeline[0] || { t: '--', status: '--', humidity: '--' };

                return {
                    wilayah: dist.name,
                    current: {
                        temp: current.t,
                        status: current.weather_desc,
                        humidity: current.hu
                    },
                    timeline: timeline
                };
            } catch (e) {
                console.error(`Failed to fetch ${dist.name}:`, e);
                return null;
            }
        }));

        weatherData.value = results.filter(r => r !== null);
        
        if (weatherData.value.length === 0) {
            error.value = 'Offline sync mode';
        }
    } catch (err) {
        error.value = 'Koneksi API Gagal';
    } finally {
        loading.value = false;
    }
};

onMounted(fetchWeather);
</script>

<style scoped>
/* Previous styles remain same */
.forecast-bmkg {
    width: 100%;
}
.header-orb {
    width: 48px;
    height: 48px;
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    backdrop-filter: blur(20px);
}
.refresh-pill {
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0.5rem 0.75rem;
    border-radius: 10px;
    color: #94a3b8;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
    transition: all 0.3s;
}
.weather-grid {
    display: grid;
    grid-template-columns: repeat(1, 1fr);
    gap: 0.75rem;
    width: 100%;
}
@media (min-width: 640px) {
    .weather-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
    .weather-grid { grid-template-columns: repeat(3, 1fr); }
}
@media (min-width: 1280px) {
    .weather-grid { grid-template-columns: repeat(4, 1fr); }
}
.weather-card {
    background: linear-gradient(165deg, rgba(30, 41, 59, 0.4) 0%, rgba(15, 23, 42, 0.6) 100%);
    backdrop-filter: blur(24px);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 20px;
    padding: 1rem;
    cursor: pointer;
    transition: all 0.3s ease;
    overflow: hidden;
}
.weather-card:hover {
    transform: translateY(-5px);
    border-color: rgba(255, 255, 255, 0.1);
}
.status-icon-mini { height: 16px; display: flex; align-items: center; }
.hum-tag {
    background: rgba(59, 130, 246, 0.1);
    padding: 0.15rem 0.4rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 0.15rem;
    color: #60a5fa;
    font-size: 7px;
    font-weight: 800;
}
.action-btn-mini {
    width: 24px;
    height: 24px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #94a3b8;
}
.carousel-control {
    width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;
    border-radius: 50%; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.1);
    cursor: pointer; transition: all 0.3s;
}
.carousel-control.is-active { transform: rotate(180deg); background: #2563eb; border-color: #2563eb; color: white; }
.details-panel { border-top: 1px dashed rgba(255, 255, 255, 0.05); padding-top: 1rem; }
.detail-row { display: flex; justify-content: space-between; align-items: center; padding: 0.3rem 0; }
.dr-time { font-size: 9px; font-weight: 800; color: #475569; width: 40px; }
.dr-hum { font-size: 9px; font-weight: 800; color: #e2e8f0; width: 40px; text-align: right; }
.fancy-spinner {
    width: 24px; height: 24px; border: 2px solid rgba(245, 158, 11, 0.1);
    border-top-color: #f59e0b; border-radius: 50%; animation: rotate 1s linear infinite;
}
@keyframes rotate { to { transform: rotate(360deg); } }
.expand-enter-active, .expand-leave-active { transition: all 0.2s ease; max-height: 200px; }
.expand-enter-from, .expand-leave-to { max-height: 0; opacity: 0; overflow: hidden; }
.drop-shadow-blue { filter: drop-shadow(0 0 5px rgba(59, 130, 246, 0.3)); }
.drop-shadow-amber { filter: drop-shadow(0 0 5px rgba(245, 158, 11, 0.3)); }
.drop-shadow-slate { filter: drop-shadow(0 0 5px rgba(148, 163, 184, 0.2)); }
.animate-fade-in { animation: fadeIn 0.6s ease forwards; }
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
</style>
