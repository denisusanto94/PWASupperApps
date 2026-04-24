<template>
  <div class="fixed inset-0 w-full h-[100svh] bg-[#0c1a1a] text-white flex flex-col items-center justify-center pt-14 lg:pt-20 overflow-hidden font-sans select-none">
    <!-- 1. AMBIENT LAYERS -->
    <div class="absolute inset-0 z-0 bg-cover bg-center opacity-70 scale-[1.1] " 
         style="background-image: url('/snake-and-ladders/realms_bg.png');">
    </div>
    
    <div class="absolute inset-0 z-[1] pointer-events-none bg-gradient-to-b from-[#0c1a1a]/80 via-transparent to-[#0c1a1a]"></div>
    
    <!-- 2. HEADER (Teleport for consistency) -->
    <Teleport to="#app-header-portal">
      <div class="flex items-center justify-between w-full h-full snake-portal-header px-4 lg:px-8">
        <div class="flex items-center gap-4 group cursor-help">
           <div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] transform -rotate-6">
             <span class="text-black font-black italic text-2xl">#1</span>
           </div>
           <div class="flex flex-col -gap-1 text-left">
             <h1 class="text-xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg leading-none">Choose Realm</h1>
             <span class="text-[8px] font-black tracking-[0.4em] text-amber-500/60 uppercase">Select Scenario</span>
           </div>
        </div>
        <router-link to="/mini-games" class="group flex items-center gap-3 bg-white/5 backdrop-blur-3xl text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-amber-500 hover:text-black transition-all shadow-2xl active:scale-95 uppercase tracking-widest border border-white/10">
          <span class="opacity-50 group-hover:opacity-100 transition-opacity">Back</span>
          <span class="text-xl group-hover:animate-bounce">🏠</span>
        </router-link>
      </div>
    </Teleport>

    <!-- 3. SELECTION CONTENT -->
    <div class="relative z-10 w-full max-w-6xl px-4 text-center realm-hub-content">
      <div class="mb-8 sm:mb-12 lg:mb-20 realm-hub-hero-wrap animate-in fade-in slide-in-from-bottom duration-1000">
        <h2 class="realm-hub-title text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 uppercase drop-shadow-[0_20px_40px_rgba(0,0,0,1)] leading-[0.85] mb-3 sm:mb-4">
          CHOOSE YOUR<br/>ADVENTURE
        </h2>
        <div class="realm-hub-subline flex items-center justify-center gap-3">
          <div class="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500"></div>
          <p class="text-amber-500 text-[10px] lg:text-lg font-black uppercase tracking-[0.4em] italic drop-shadow-lg">SELECT WORLD</p>
          <div class="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500"></div>
        </div>
      </div>

      <div class="realm-hub-grid grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 lg:gap-3 max-w-md sm:max-w-lg mx-auto items-stretch">
        <!-- REALM 1: ISLAND QUEST -->
        <button @click="$router.push('/mini-games/snake-and-ladders/island-quest')"
                class="realm-hub-card group relative w-full min-h-[16rem] aspect-[10/13] sm:min-h-0 sm:aspect-[14/9] lg:aspect-[16/10] p-0.5 sm:p-1 bg-gradient-to-br from-amber-500/40 to-transparent rounded-2xl sm:rounded-[1.75rem] lg:rounded-[2.5rem] transition-all transform hover:-translate-y-4 hover:scale-[1.02] active:scale-95 shadow-2xl overflow-visible ring-2 sm:ring-4 ring-black/20">
          <div class="h-full min-h-0 w-full bg-[#1a110d]/90 backdrop-blur-3xl rounded-xl sm:rounded-2xl lg:rounded-3xl relative overflow-visible flex flex-col items-center justify-center gap-1 sm:gap-1.5 p-3 sm:p-4 border border-white/10 group-hover:bg-amber-500/10 transition-all duration-700">
            <div class="realm-hub-board-bg absolute inset-0 rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity duration-1000 pointer-events-none">
              <img src="/snake-and-ladders/board_new.webp" class="w-full h-full max-h-full object-contain object-center p-1 sm:p-2 group-hover:rotate-6 transition-transform duration-1000" alt="" />
            </div>
            
            <div class="relative z-10 flex flex-col items-center justify-center min-h-0 min-w-0 w-full flex-1 py-0.5">
              <div class="realm-hub-card-figure mb-0.5 sm:mb-2 relative w-full max-w-[42%] sm:max-w-[38%] lg:max-w-[34%] shrink-0 min-h-0 flex items-center justify-center">
                 <img src="/snake-and-ladders/p1.webp" class="realm-hub-card-player block w-full h-auto max-h-[min(16vh,5.5rem)] sm:max-h-[min(18vh,6.5rem)] lg:max-h-[min(22vh,8rem)] object-contain mx-auto drop-shadow-[0_12px_24px_rgba(0,0,0,1)] animate-totem-float" alt="" />
              </div>
              <h3 class="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-0.5 sm:mb-1">ISLAND QUEST</h3>
              <p class="text-[7px] sm:text-[8px] lg:text-[9px] text-amber-500 font-black uppercase tracking-[0.25em] opacity-80 mb-2 sm:mb-3 lg:mb-4">TROPICAL EXPEDITION v2</p>
              
              <div class="realm-hub-card-cta px-4 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 bg-amber-500 text-black font-black italic uppercase tracking-widest text-[8px] sm:text-[9px] lg:text-[10px] rounded-xl sm:rounded-2xl shadow-[0_6px_20px_rgba(245,158,11,0.35)] group-hover:bg-white transition-all transform group-hover:scale-105 active:scale-95 shrink-0">ENTER REALM</div>
            </div>
            
            <div class="realm-hub-deco absolute top-3 right-4 sm:top-4 sm:right-5 opacity-20 group-hover:opacity-100 transition-opacity text-amber-500">
               <span class="text-2xl sm:text-3xl">🏝️</span>
            </div>
          </div>
        </button>

        <!-- REALM 2: SEA ODYSSEY (COMING SOON) -->
        <div class="realm-hub-card group relative w-full min-h-[16rem] aspect-[10/13] sm:min-h-0 sm:aspect-[14/9] lg:aspect-[16/10] p-0.5 sm:p-1 bg-gradient-to-br from-blue-500/20 to-transparent rounded-2xl sm:rounded-[1.75rem] lg:rounded-[2.5rem] transition-all transform hover:-translate-y-2 active:scale-98 shadow-xl overflow-visible grayscale opacity-40">
          <div class="h-full min-h-0 w-full bg-slate-900/60 backdrop-blur-3xl rounded-xl sm:rounded-2xl lg:rounded-3xl relative overflow-visible flex flex-col items-center justify-center p-3 sm:p-4 border border-white/5">
            <div class="relative z-10 flex flex-col items-center">
              <div class="realm-hub-deco mb-2 sm:mb-3 relative opacity-40">
                 <span class="text-4xl sm:text-5xl lg:text-6xl drop-shadow-2xl">⚓</span>
              </div>
              <h3 class="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-0.5 sm:mb-1">SEA ODYSSEY</h3>
              <p class="text-[7px] sm:text-[8px] lg:text-[9px] text-blue-400 font-black uppercase tracking-[0.25em] opacity-80 mb-2 sm:mb-3 lg:mb-4">AQUATIC VENTURE</p>
              
              <div class="realm-hub-card-cta px-4 sm:px-5 lg:px-6 py-1.5 sm:py-2 lg:py-2.5 bg-white/10 text-white/40 font-black italic uppercase tracking-widest text-[8px] sm:text-[9px] rounded-xl sm:rounded-2xl border border-white/5 shrink-0">COMING SOON</div>
            </div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div class="realm-hub-locked transform -rotate-12 px-4 py-1.5 sm:px-5 sm:py-2 bg-black/80 text-white font-black uppercase tracking-[0.4em] text-[9px] sm:text-[10px] lg:text-xs border border-white/20">Locked</div>
          </div>
        </div>
      </div>

    </div>

    <!-- 4. FOOTER INFO -->
    <div class="fixed bottom-10 left-1/2 -translate-x-1/2 z-20 flex items-center gap-6 animate-pulse-slow">
       <div class="flex items-center gap-3">
         <span class="text-amber-500 text-xl">✨</span>
         <p class="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Select a Realm to Start the Adventure</p>
         <span class="text-amber-500 text-xl">✨</span>
       </div>
    </div>

    <!-- 5. ORIENTATION PROTECTOR (Portrait Only) -->
    <div class="orientation-protector lg:hidden">
      <div class="fixed inset-0 z-[600] bg-[#0c1a1a] flex flex-col items-center justify-center p-8 text-center bg-cover bg-center"
           style="background-image: url('/snake-and-ladders/realms_bg.png');">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-xl"></div>
        <div class="relative z-10 flex flex-col items-center">
           <div class="w-24 h-24 mb-8 text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">📱 🔄</div>
           <h2 class="text-3xl font-black text-white mb-2 italic uppercase tracking-tighter drop-shadow-2xl leading-none">OPTIMALKAN<br/>PANDANGAN</h2>
           <p class="text-amber-500/80 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Landscape Mode Required</p>
           <p class="text-white/60 font-medium text-sm max-w-xs mb-10">Putar perangkat Anda ke posisi miring (Landscape) untuk menjelajahi Realm Dunia yang tersedia.</p>
           <button @click="attemptLockOrientation" class="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black text-lg active:scale-95 transition-all shadow-[0_8px_0_#b45309]">
             KUNCI LANDSCAPE
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';

// Landscape Lock Logic
const attemptLockOrientation = async () => {
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch (e) {
    console.log('Orientation lock failed or not supported:', e);
  }
};

onMounted(() => {
  attemptLockOrientation();
});
</script>

<style scoped>
.perspective-2000 { perspective: 2000px; }
.animate-totem-float { animation: totem 4s ease-in-out infinite; }
@keyframes totem { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-30px) rotate(2deg); } }
@keyframes pulseSlow { 0%, 100% { opacity: 0.3; transform: translate(-50%, 0); } 50% { opacity: 0.8; transform: translate(-50%, -10px); } }

/* Orientation Lock UI */
@media (orientation: landscape) {
  .orientation-protector {
    display: none !important;
  }
}

@media (min-width: 1024px) {
  .orientation-protector {
    display: none !important;
  }
}

/* Mobile & tablet landscape: grid & hero lebih kompak — font & gambar lebih kecil */
@media (orientation: landscape) and (max-height: 760px) and (max-width: 1279px) {
  .realm-hub-hero-wrap {
    margin-bottom: 0.35rem !important;
  }
  .realm-hub-title {
    font-size: clamp(1rem, 3vw, 1.25rem) !important;
    line-height: 1 !important;
    margin-bottom: 0.25rem !important;
  }
  .realm-hub-subline p {
    font-size: 0.5rem !important;
    letter-spacing: 0.16em !important;
  }
  .realm-hub-grid {
    gap: 0.25rem 0.375rem !important;
    max-width: min(90vw, 32rem) !important;
  }
  .realm-hub-card {
    aspect-ratio: auto !important;
    min-height: 0 !important;
    max-height: min(40svh, 12.5rem) !important;
  }
  .realm-hub-card > div {
    min-height: 0 !important;
    padding: 0.35rem 0.5rem !important;
    gap: 0.05rem !important;
  }
  .realm-hub-card .realm-hub-board-bg img {
    padding: 0.25rem !important;
    object-fit: contain !important;
    object-position: center !important;
  }
  .realm-hub-card-figure {
    max-width: 28% !important;
    margin-bottom: 0.05rem !important;
  }
  .realm-hub-card-player {
    max-height: min(18svh, 2.65rem) !important;
  }
  .realm-hub-card h3 {
    font-size: 0.8rem !important;
    margin-bottom: 0.05rem !important;
  }
  .realm-hub-card p.text-amber-500,
  .realm-hub-card p.text-blue-400 {
    font-size: 0.45rem !important;
    margin-bottom: 0.25rem !important;
    letter-spacing: 0.12em !important;
  }
  .realm-hub-card-cta {
    padding: 0.25rem 0.5rem !important;
    font-size: 0.45rem !important;
    letter-spacing: 0.08em !important;
    border-radius: 0.5rem !important;
  }
  .realm-hub-deco span {
    font-size: 1.1rem !important;
    line-height: 1 !important;
  }
  .realm-hub-deco {
    top: 0.35rem !important;
    right: 0.45rem !important;
  }
  .realm-hub-locked {
    padding: 0.2rem 0.45rem !important;
    font-size: 0.45rem !important;
    letter-spacing: 0.12em !important;
  }
  .animate-totem-float {
    animation: totemLandscapeShort 3.5s ease-in-out infinite;
  }
}

@keyframes totemLandscapeShort {
  0%, 100% { transform: translateY(0) rotate(-0.5deg); }
  50% { transform: translateY(-4px) rotate(0.5deg); }
}
</style>
