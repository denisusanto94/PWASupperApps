<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-950 text-white p-4 pt-16 flex flex-col items-center overflow-x-hidden">
    <!-- Header (Teleported to Global App Header) -->
    <Teleport to="#app-header-portal">
      <div class="flex items-center justify-between w-full h-full memory-portal-header">
        <div class="hidden sm:flex items-center gap-3">
          <h1 class="text-sm font-black text-white/90">Memory Match</h1>
        </div>
        
        <div class="flex items-center gap-3 sm:gap-6 ml-auto">
          <div v-if="difficulty" class="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5 animate-fade-in">
            <div class="flex items-center gap-1.5 px-2 py-1">
              <span class="text-[8px] uppercase text-white/40 font-bold">Moves</span>
              <span class="text-sm font-black text-yellow-400">{{ moves }}</span>
            </div>
            <div class="w-[1px] h-4 bg-white/10 my-auto"></div>
            <div class="flex items-center gap-1.5 px-2 py-1 min-w-[60px]">
              <span class="text-[8px] uppercase text-white/40 font-bold">Time</span>
              <span class="text-sm font-black text-yellow-400">{{ formatTime(timer) }}</span>
            </div>
          </div>
          <button @click="resetToDifficultySelection" class="bg-indigo-500 text-white px-4 py-1.5 rounded-lg font-black text-[10px] sm:text-xs hover:bg-white hover:text-indigo-900 transition-all shadow-lg active:scale-95 uppercase">
            {{ difficulty ? 'Menu' : 'Main' }}
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Orientation Protector (Portrait Only) -->
    <div class="orientation-protector md:hidden">
      <div class="fixed inset-0 z-[100] bg-indigo-950 flex flex-col items-center justify-center p-8 text-center">
        <div class="w-24 h-24 mb-8 text-6xl animate-bounce">📱 🔄</div>
        <h2 class="text-3xl font-black text-white mb-2 italic">GANTI ORIENTASI</h2>
        <p class="text-white/60 font-medium">Putar perangkat Anda ke posisi landscape untuk pengalaman bermain terbaik.</p>
        <button @click="attemptLockOrientation" class="mt-8 px-8 py-4 bg-indigo-500 text-white rounded-2xl font-black text-lg active:scale-95 transition-all">
          KUNCI LANDSCAPE
        </button>
      </div>
    </div>

    <!-- Difficulty selection overlay -->
    <Transition name="fade">
      <div v-if="!difficulty" class="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-3xl flex items-center justify-center p-4 pt-16">
        <div class="max-w-4xl w-full">
          <div class="text-center mb-12 animate-slide-down">
             <div class="text-6xl mb-4">🧠</div>
             <h2 class="text-4xl sm:text-6xl font-black italic tracking-tighter mb-4 text-white">PILIH TINGKAT KESULITAN</h2>
             <p class="text-indigo-200/60 text-lg sm:text-xl font-medium">Semakin sulit, semakin banyak pasangan yang harus ditemukan.</p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <!-- Mudah -->
            <button @click="selectDifficulty('easy')" class="group relative p-8 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all duration-500 transform hover:-translate-y-2">
              <div class="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">🌱</div>
              <h3 class="text-2xl font-black mb-1 group-hover:text-emerald-400 transition-colors">MUDAH</h3>
              <p class="text-white/40 font-bold text-xs mb-4 uppercase tracking-widest">4 x 3 Grid</p>
              <div class="text-slate-500 text-sm italic">6 Pasangan Kartu</div>
            </button>

            <!-- Menengah -->
            <button @click="selectDifficulty('medium')" class="group relative p-8 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-yellow-500/10 hover:border-yellow-500/30 transition-all duration-500 transform hover:-translate-y-2">
              <div class="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">🔥</div>
              <h3 class="text-2xl font-black mb-1 group-hover:text-yellow-400 transition-colors">MENENGAH</h3>
              <p class="text-white/40 font-bold text-xs mb-4 uppercase tracking-widest">5 x 4 Grid</p>
              <div class="text-slate-500 text-sm italic">10 Pasangan Kartu</div>
            </button>

            <!-- Sulit -->
            <button @click="selectDifficulty('hard')" class="group relative p-8 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden hover:bg-rose-500/10 hover:border-rose-500/30 transition-all duration-500 transform hover:-translate-y-2">
              <div class="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">⚡</div>
              <h3 class="text-2xl font-black mb-1 group-hover:text-rose-400 transition-colors">SULIT</h3>
              <p class="text-white/40 font-bold text-xs mb-4 uppercase tracking-widest">6 x 6 Grid</p>
              <div class="text-slate-500 text-sm italic">18 Pasangan Kartu</div>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Game Board Area -->
    <div v-if="difficulty" class="w-full max-w-5xl flex-grow flex flex-col items-center justify-center py-4 animate-fade-in">
      <div :class="gridClasses" class="grid gap-2 sm:gap-4 w-full">
        <div v-for="(card, index) in cards" :key="index" 
             @click="flipCard(index)"
             class="aspect-square perspective-1000 cursor-pointer group touch-none"
             :class="{ 'pointer-events-none': card.flipped || card.matched || lockBoard }">
          
          <div class="relative w-full h-full transition-all duration-500 preserve-3d"
               :class="{ 'rotate-y-180': card.flipped || card.matched }">
            
            <!-- Card Back -->
            <div class="absolute inset-0 backface-hidden bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-xl group-hover:bg-white/10 transition-colors overflow-hidden">
               <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent"></div>
               <div class="text-xl sm:text-2xl opacity-20 group-hover:scale-110 transition-transform">🧠</div>
            </div>

            <!-- Card Front -->
            <div class="absolute inset-0 backface-hidden rotate-y-180 bg-white rounded-2xl flex items-center justify-center p-1.5 sm:p-4 shadow-2xl overflow-hidden">
               <img :src="getIconPath(card.icon)" :alt="card.icon" class="w-full h-full object-contain">
            </div>
          </div>
        </div>
      </div>

      <!-- License and Attribution -->
      <div class="mt-12 text-center pb-8 opacity-40 hover:opacity-100 transition-opacity">
        <p class="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-1">Attribution & License</p>
        <p class="text-[10px] text-white/20">Icons made by <span class="text-white/40">Delapouite</span> from <a href="https://game-icons.net" target="_blank" class="hover:text-indigo-400 underline transition-colors">game-icons.net</a></p>
        <p class="text-[10px] text-white/20 mt-1">Licensed under <span class="text-white/40 font-mono">CC BY 3.0</span></p>
      </div>
    </div>

    <!-- Victory Screen Overlay -->
    <Transition name="scale">
      <div v-if="isVictory" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
        <div class="max-w-md w-full text-center p-8 sm:p-12 bg-indigo-900/90 rounded-[3rem] border border-indigo-400/30 shadow-[0_0_80px_rgba(99,102,241,0.3)]">
          <div class="text-7xl sm:text-8xl mb-6 drop-shadow-2xl animate-pulse">🧠✨</div>
          <h2 class="text-4xl sm:text-6xl font-black text-white mb-2 tracking-tighter uppercase italic">{{ getVictoryTitle }}</h2>
          <p class="text-lg sm:text-xl text-indigo-200/70 mb-8 font-medium">Anda menemukan {{ pairsNeeded }} pasangan dalam {{ moves }} gerakan dan {{ formatTime(timer) }}.</p>
          <div class="flex flex-col gap-4">
            <button @click="initGame(true)" class="w-full bg-indigo-500 text-white py-5 rounded-2xl font-black text-xl hover:bg-white hover:text-indigo-900 hover:scale-105 active:scale-95 transition-all shadow-2xl">
              RESTART
            </button>
            <button @click="resetToDifficultySelection" class="w-full bg-white/10 text-white py-4 rounded-2xl font-black text-sm hover:bg-white/20 transition-all uppercase tracking-widest">
              GANTI KESULITAN
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

// Game Assets (18 Icons for Hard 6x6 Mode)
const ALL_ICONS = [
  '3d-glasses', 'alarm-clock', 'ambulance', 'apple-core', 
  'astronaut-helmet', 'axe-in-log', 'backpack', 'bat-mask', 
  'beer-bottle', 'binoculars', 'brain-dump', 'butterfly-flower',
  'cactus', 'calendar', 'photo-camera', 'castle', 'feline', 'pizza-slice'
];

// Configuration
const CONFIG = {
  easy: { grid: 'grid-cols-4 sm:grid-cols-4', pairs: 6, title: 'Bagus!' },
  medium: { grid: 'grid-cols-4 sm:grid-cols-5', pairs: 10, title: 'Hebat!' },
  hard: { grid: 'grid-cols-6 sm:grid-cols-6', pairs: 18, title: 'Jenius!' }
};

// Game State
const difficulty = ref(null);
const cards = ref([]);
const moves = ref(0);
const timer = ref(0);
const timerInterval = ref(null);
const isVictory = ref(false);
const lockBoard = ref(false);
const firstCard = ref(null);

const gridClasses = computed(() => CONFIG[difficulty.value]?.grid || '');
const pairsNeeded = computed(() => CONFIG[difficulty.value]?.pairs || 0);
const getVictoryTitle = computed(() => CONFIG[difficulty.value]?.title || 'Luar Biasa!');

const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getIconPath = (name) => {
  return `/memory-match/ffffff/000000/1x1/delapouite/${name}.svg`;
};

const attemptLockOrientation = async () => {
  try {
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
    }
  } catch (e) {
    console.log('Orientation lock failed:', e);
  }
};

const selectDifficulty = (level) => {
  difficulty.value = level;
  initGame(false); // Init board, timer starts on first move
};

const resetToDifficultySelection = () => {
  difficulty.value = null;
  if (timerInterval.value) clearInterval(timerInterval.value);
  timerInterval.value = null;
  timer.value = 0;
  moves.value = 0;
  isVictory.value = false;
};

const initGame = (shouldStartTimer = true) => {
  if (!difficulty.value) return;

  // Reset State
  moves.value = 0;
  timer.value = 0;
  isVictory.value = false;
  lockBoard.value = false;
  firstCard.value = null;
  
  if (timerInterval.value) clearInterval(timerInterval.value);
  if (shouldStartTimer) {
     timerInterval.value = setInterval(() => timer.value++, 1000);
  } else {
     timerInterval.value = null;
  }

  // Create Pairs based on difficulty
  const pairsCount = CONFIG[difficulty.value].pairs;
  const selectedIcons = ALL_ICONS.slice(0, pairsCount);
  const gameIcons = [...selectedIcons, ...selectedIcons];
  
  cards.value = gameIcons
    .sort(() => Math.random() - 0.5)
    .map(icon => ({
      icon,
      flipped: false,
      matched: false
    }));
};

const ensureTimerStarted = () => {
  if (!timerInterval.value && !isVictory.value) {
    timerInterval.value = setInterval(() => timer.value++, 1000);
  }
};

const flipCard = (index) => {
  const card = cards.value[index];
  if (card.flipped || card.matched || lockBoard.value) return;

  card.flipped = true;

  if (firstCard.value === null) {
    firstCard.value = index;
  } else {
    // Match logic
    moves.value++;
    ensureTimerStarted();
    
    if (cards.value[firstCard.value].icon === card.icon) {
      // Match found
      cards.value[firstCard.value].matched = true;
      card.matched = true;
      firstCard.value = null;
      checkVictory();
    } else {
      // No match
      lockBoard.value = true;
      setTimeout(() => {
        cards.value[firstCard.value].flipped = false;
        card.flipped = false;
        firstCard.value = null;
        lockBoard.value = false;
      }, 1000);
    }
  }
};

const checkVictory = () => {
  if (cards.value.every(c => c.matched)) {
    isVictory.value = true;
    clearInterval(timerInterval.value);
  }
};

onMounted(() => {
  attemptLockOrientation();
});

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
});
</script>

<style scoped>
.perspective-1000 {
  perspective: 1000px;
}
.preserve-3d {
  transform-style: preserve-3d;
}
.backface-hidden {
  backface-visibility: hidden;
}
.rotate-y-180 {
  transform: rotateY(180deg);
}

/* Animations */
.animate-slide-down {
  animation: slideDown 0.8s cubic-bezier(0.23, 1, 0.32, 1) both;
}

@keyframes slideDown {
  from { opacity: 0; transform: translateY(-30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
  animation: fadeIn 0.5s ease-out both;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Orientation Protector CSS */
@media (orientation: landscape) {
  .orientation-protector {
    display: none !important;
  }
}

@media (min-width: 768px) {
  .orientation-protector {
    display: none !important;
  }
}

/* Transitions */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.5s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

.scale-enter-active, .scale-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}
</style>
