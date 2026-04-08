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
    <div class="relative z-10 w-full max-w-6xl px-4 text-center">
      <div class="mb-12 lg:mb-20 animate-in fade-in slide-in-from-bottom duration-1000">
        <h2 class="text-4xl sm:text-6xl lg:text-8xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 uppercase drop-shadow-[0_20px_40px_rgba(0,0,0,1)] leading-[0.75] mb-4">
          CHOOSE YOUR<br/>ADVENTURE
        </h2>
        <div class="flex items-center justify-center gap-3">
          <div class="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500"></div>
          <p class="text-amber-500 text-[10px] lg:text-lg font-black uppercase tracking-[0.4em] italic drop-shadow-lg">SELECT WORLD</p>
          <div class="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500"></div>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 lg:gap-12 max-w-5xl mx-auto">
        <!-- REALM 1: ISLAND QUEST -->
        <button @click="$router.push('/mini-games/snake-and-ladders/island-quest')"
                class="group relative aspect-[14/9] lg:aspect-[16/10] p-1 bg-gradient-to-br from-amber-500/40 to-transparent rounded-[2.5rem] lg:rounded-[4rem] transition-all transform hover:-translate-y-4 hover:scale-[1.02] active:scale-95 shadow-2xl overflow-hidden ring-4 ring-black/20">
          <div class="h-full w-full bg-[#1a110d]/90 backdrop-blur-3xl rounded-[2.2rem] lg:rounded-[3.7rem] relative overflow-hidden flex flex-col items-center justify-center p-6 border border-white/10 group-hover:bg-amber-500/10 transition-all duration-700">
            <div class="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-1000">
              <img src="/snake-and-ladders/board_new.webp" class="w-full h-full object-cover scale-[2] group-hover:rotate-6 transition-transform duration-1000" />
            </div>
            
            <div class="relative z-10 flex flex-col items-center">
              <div class="mb-4 relative">
                 <img src="/snake-and-ladders/p1.webp" class="w-20 lg:w-32 h-auto drop-shadow-[0_20px_40px_rgba(0,0,0,1)] animate-totem-float" />
              </div>
              <h3 class="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">ISLAND QUEST</h3>
              <p class="text-[9px] lg:text-[11px] text-amber-500 font-black uppercase tracking-[0.3em] opacity-80 mb-6 lg:mb-8">TROPICAL EXPEDITION v2</p>
              
              <div class="px-8 lg:px-12 py-3 lg:py-5 bg-amber-500 text-black font-black italic uppercase tracking-widest text-xs lg:text-sm rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.4)] group-hover:bg-white transition-all transform group-hover:scale-105 active:scale-95">ENTER REALM</div>
            </div>
            
            <div class="absolute top-6 right-8 opacity-20 group-hover:opacity-100 transition-opacity text-amber-500">
               <span class="text-4xl">🏝️</span>
            </div>
          </div>
        </button>

        <!-- REALM 2: SEA ODYSSEY (COMING SOON) -->
        <div class="group relative aspect-[14/9] lg:aspect-[16/10] p-1 bg-gradient-to-br from-blue-500/20 to-transparent rounded-[2.5rem] lg:rounded-[4rem] transition-all transform hover:-translate-y-2 active:scale-98 shadow-xl overflow-hidden grayscale opacity-40">
          <div class="h-full w-full bg-slate-900/60 backdrop-blur-3xl rounded-[2.2rem] lg:rounded-[3.7rem] relative overflow-hidden flex flex-col items-center justify-center p-6 border border-white/5">
            <div class="relative z-10 flex flex-col items-center">
              <div class="mb-4 relative opacity-40">
                 <span class="text-6xl lg:text-8xl drop-shadow-2xl">⚓</span>
              </div>
              <h3 class="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">SEA ODYSSEY</h3>
              <p class="text-[9px] lg:text-[11px] text-blue-400 font-black uppercase tracking-[0.3em] opacity-80 mb-6 lg:mb-8">AQUATIC VENTURE</p>
              
              <div class="px-8 lg:px-12 py-3 lg:py-5 bg-white/10 text-white/40 font-black italic uppercase tracking-widest text-[10px] rounded-2xl border border-white/5">COMING SOON</div>
            </div>
          </div>
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
             <div class="transform -rotate-12 px-6 py-2 bg-black/80 text-white font-black uppercase tracking-[0.5em] text-xs lg:text-sm border border-white/20">Locked</div>
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
</style>
