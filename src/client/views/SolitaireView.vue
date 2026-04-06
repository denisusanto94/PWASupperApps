<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 text-white p-2 sm:p-4 pt-16 flex flex-col items-center overflow-x-hidden">
    <!-- Header (Teleported to Global App Header) -->
    <Teleport to="#app-header-portal">
      <div class="flex items-center justify-between w-full h-full solitaire-portal-header">
        <div class="hidden sm:flex items-center gap-3">
          <div>
            <h1 class="text-sm font-black text-white/90">Solitaire</h1>
          </div>
        </div>
        
        <div class="flex items-center gap-3 sm:gap-6 ml-auto">
          <div class="flex gap-2 bg-black/20 p-1 rounded-xl border border-white/5">
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
          <button @click="initGame" class="bg-yellow-400 text-emerald-900 px-4 py-1.5 rounded-lg font-black text-[10px] sm:text-xs hover:bg-white transition-all shadow-lg active:scale-95 uppercase solitaire-new-game-btn">
            New Game
          </button>
        </div>
      </div>
    </Teleport>

    <!-- Game Board Scroller (for mobile) -->
    <div class="w-full max-w-6xl overflow-x-auto pb-8 hide-scrollbar p-4">
      <div class="min-w-[500px] sm:min-w-0 grid grid-cols-7 gap-1.5 sm:gap-4 px-2">
        
        <!-- Top Row: Stock, Waste, and Foundations -->
        <div class="col-span-1">
          <div @click="drawCard" class="card-slot cursor-pointer group" :class="{ 'is-empty': stock.length === 0 }">
            <div v-if="stock.length > 0" class="card-inner is-back">
              <img src="/poker/1B.svg" alt="Card Back" class="w-full h-full object-cover">
              <div class="absolute inset-0 bg-black/10 transition-opacity group-hover:opacity-0"></div>
            </div>
            <div v-else class="empty-placeholder">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-20"><path d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
            </div>
            <div class="counter-badge" v-if="stock.length > 0">{{ stock.length }}</div>
          </div>
        </div>

        <div class="col-span-1">
          <div class="card-slot no-bg">
            <div v-if="waste.length > 0" 
                 class="card-inner animate-in fade-in zoom-in duration-300 shadow-xl cursor-grab active:cursor-grabbing"
                 draggable="true"
                 @dragstart="onDragStart($event, { col: 0, idx: waste.length - 1, from: 'waste' })"
                 @click="handleCardClick(waste[waste.length-1], 'waste', 0, waste.length - 1)">
              <img :src="'/poker/' + waste[waste.length-1].code + '.svg'" :alt="waste[waste.length-1].code" class="w-full h-full object-contain pointer-events-none">
            </div>
          </div>
        </div>

        <div class="col-span-1"></div> <!-- Spacer -->

        <!-- Foundations -->
        <div v-for="(foundation, i) in foundations" :key="'f-'+i" class="col-span-1">
          <div @drop="onDropFoundation($event, i)" @dragover.prevent @dragenter.prevent class="card-slot foundation-slot">
            <div v-if="foundation.length > 0" 
                 class="card-inner shadow-xl cursor-grab active:cursor-grabbing"
                 draggable="true"
                 @dragstart="onDragStart($event, { col: i, idx: foundation.length - 1, from: 'foundation' })">
              <img :src="'/poker/' + foundation[foundation.length-1].code + '.svg'" :alt="foundation[foundation.length-1].code" class="w-full h-full object-contain pointer-events-none">
            </div>
            <div v-else class="foundation-icon pl-0">
              <img :src="'/poker/A' + ['S','H','D','C'][i] + '.svg'" class="opacity-10 grayscale invert brightness-200">
            </div>
          </div>
        </div>

        <!-- Tableau Columns -->
        <div v-for="(col, i) in tableau" :key="'t-'+i" class="col-span-1 pt-4 sm:pt-6">
          <div @drop="onDropTableau($event, i)" @dragover.prevent @dragenter.prevent class="flex flex-col items-center min-h-[400px]">
            <div v-for="(card, cardIdx) in col" :key="card.id" 
                 class="tableau-card"
                 :style="{ marginTop: cardIdx === 0 ? '0' : 'calc(var(--card-height) * -0.7)', zIndex: cardIdx }"
                 :draggable="card.visible"
                 @dragstart="onDragStart($event, { col: i, idx: cardIdx, from: 'tableau' })"
                 @click="handleCardClick(card, 'tableau', i, cardIdx)">
              
              <div class="card-inner shadow-lg transition-transform hover:-translate-y-1 active:scale-95" :class="{ 'is-back': !card.visible }">
                <img v-if="card.visible" :src="'/poker/' + card.code + '.svg'" :alt="card.code" class="w-full h-full object-contain pointer-events-none">
                <img v-else src="/poker/1B.svg" alt="Card Back" class="w-full h-full object-cover pointer-events-none">
                <div v-if="!card.visible" class="absolute inset-0 bg-black/5"></div>
              </div>
            </div>
            <!-- Ghost Slot for empty columns -->
            <div v-if="col.length === 0" class="card-slot tableau-empty"></div>
          </div>
        </div>

      </div>
    </div>

    <!-- Auto-Finish Hint -->
    <Transition name="fade">
      <div v-if="canAutoFinish && !isVictory" class="fixed bottom-24 left-1/2 -translate-x-1/2 z-30">
        <button @click="autoFinish" class="bg-yellow-400 text-emerald-900 px-8 py-4 rounded-2xl font-black shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center gap-3 border-4 border-emerald-800/10 mb-4 animate-bounce">
          <span class="text-2xl">✨</span>
          <span>SELESAIKAN OTOMATIS</span>
        </button>
      </div>
    </Transition>

    <!-- Orientation Overlay (Portrait Only) -->
    <div class="orientation-protector md:hidden">
      <div class="fixed inset-0 z-[100] bg-emerald-950 flex flex-col items-center justify-center p-8 text-center">
        <div class="w-24 h-24 mb-8 text-6xl animate-bounce">📱 🔄</div>
        <h2 class="text-3xl font-black text-white mb-2 italic">GANTI ORIENTASI</h2>
        <p class="text-white/60 font-medium">Putar perangkat Anda ke posisi landscape (miring) untuk pengalaman bermain terbaik.</p>
        <button @click="attemptLockOrientation" class="mt-8 px-8 py-4 bg-yellow-400 text-emerald-900 rounded-2xl font-black text-lg active:scale-95 transition-all">
          KUNCI LANDSCAPE
        </button>
      </div>
    </div>

    <!-- Victory Screen Overlay -->
    <Transition name="scale">
      <div v-if="isVictory" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
        <div class="max-w-md w-full text-center p-8 sm:p-12 bg-emerald-900/90 rounded-[3rem] border border-yellow-400/30 shadow-[0_0_80px_rgba(250,204,21,0.2)]">
          <div class="text-7xl sm:text-8xl mb-6 drop-shadow-2xl">🏆</div>
          <h2 class="text-4xl sm:text-6xl font-black text-yellow-400 mb-2 tracking-tighter">VICTORY!</h2>
          <p class="text-lg sm:text-xl text-white/70 mb-8 font-medium">Bermain dengan sempurna dalam {{ moves }} langkah.</p>
          <button @click="initGame" class="w-full bg-yellow-400 text-emerald-900 py-5 rounded-2xl font-black text-xl hover:bg-white hover:scale-105 active:scale-95 transition-all shadow-2xl">
            MAIN LAGI
          </button>
        </div>
      </div>
    </Transition>

    <!-- Instructions Modal -->
    <Transition name="fade">
      <div v-if="showHelp" class="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 sm:p-6" @click="showHelp = false">
        <div class="max-w-lg w-full bg-slate-900 border border-white/10 text-white rounded-[2.5rem] p-8 sm:p-10 shadow-2xl relative overflow-hidden" @click.stop>
          <!-- Background Decor -->
          <div class="absolute -top-24 -right-24 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl"></div>
          
          <button @click="showHelp = false" class="absolute top-6 right-6 p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-all z-10">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </button>
          
          <div class="relative z-10 text-center mb-8">
            <div class="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/20 rounded-2xl mb-4 border border-emerald-500/30">
              <span class="text-3xl">🃏</span>
            </div>
            <h3 class="text-2xl sm:text-3xl font-black tracking-tight">Cara Bermain</h3>
            <p class="text-emerald-400/60 font-bold text-xs uppercase tracking-widest mt-1">Panduan Singkat</p>
          </div>

          <div class="space-y-4 relative z-10">
            <div v-for="(step, idx) in [
              'Susun kartu di Tableau menurun (K → A) dengan warna selang-seling.',
              'Pindahkan kartu ke Foundation mulai dari Ace sampai King sesuai jenisnya.',
              'Seret tumpukan kartu untuk pemindahan yang lebih cepat.',
              'Gunakan Stock jika tidak ada langkah yang tersedia di papan.'
            ]" :key="idx" class="flex gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 transition-colors hover:bg-white/10">
              <span class="flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center font-black text-emerald-400 text-sm border border-emerald-500/20">
                {{ idx + 1 }}
              </span>
              <p class="text-sm font-medium leading-relaxed text-white/80 pt-1">{{ step }}</p>
            </div>
          </div>

          <button @click="showHelp = false" class="w-full mt-10 bg-emerald-500 text-white rounded-2xl py-4 font-black text-lg hover:bg-emerald-400 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_10px_20px_rgba(16,185,129,0.2)]">
            SIAP BERMAIN!
          </button>
        </div>
      </div>
    </Transition>

    <!-- FAB for Help -->
    <button @click="showHelp = true" class="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 w-14 h-14 sm:w-16 sm:h-16 bg-white text-emerald-900 rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-6 active:scale-95 transition-all z-40 border border-white/50">
      <span class="text-2xl font-black">?</span>
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue';

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

// Game State
const stock = ref([]);
const waste = ref([]);
const foundations = ref([[], [], [], []]); // Spades, Hearts, Diamonds, Clubs
const tableau = ref([[], [], [], [], [], [], []]);
const moves = ref(0);
const timer = ref(0);
const timerInterval = ref(null);
const isVictory = ref(false);
const showHelp = ref(false);

const SUITS = ['S', 'H', 'D', 'C'];
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K'];

// Helper functions
const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getRankValue = (rank) => {
  if (rank === 'A') return 1;
  if (rank === 'T') return 10;
  if (rank === 'J') return 11;
  if (rank === 'Q') return 12;
  if (rank === 'K') return 13;
  return parseInt(rank);
};

const isRedSuit = (suit) => suit === 'H' || suit === 'D';

const ensureTimerStarted = () => {
  if (!timerInterval.value && !isVictory.value) {
    timerInterval.value = setInterval(() => {
      timer.value++;
    }, 1000);
  }
};

const initGame = (shouldStartTimer = true) => {
  // Reset
  stock.value = [];
  waste.value = [];
  foundations.value = [[], [], [], []];
  tableau.value = [[], [], [], [], [], [], []];
  moves.value = 0;
  timer.value = 0;
  isVictory.value = false;
  
  if (timerInterval.value) clearInterval(timerInterval.value);
  if (shouldStartTimer) {
    timerInterval.value = setInterval(() => timer.value++, 1000);
  }

  // Generate Deck
  const deck = [];
  SUITS.forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        id: `${rank}${suit}`,
        rank,
        suit,
        code: `${rank}${suit}`,
        visible: false,
        rankValue: getRankValue(rank)
      });
    });
  });

  // Shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  // Deal to Tableau
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j <= i; j++) {
      const card = deck.pop();
      if (j === i) card.visible = true;
      tableau.value[i].push(card);
    }
  }

  // Remaining to Stock
  stock.value = deck;
};

const drawCard = () => {
  if (stock.value.length === 0) {
    if (waste.value.length === 0) return;
    // Recycling waste to stock
    stock.value = [...waste.value].reverse().map(c => ({ ...c, visible: false }));
    waste.value = [];
    moves.value++;
    return;
  }
  
  const card = stock.value.pop();
  card.visible = true;
  waste.value.push(card);
  moves.value++;
  ensureTimerStarted();
};

// Drag & Drop
const onDragStart = (e, payload) => {
  e.dataTransfer.setData('payload', JSON.stringify(payload));
  e.dataTransfer.effectAllowed = 'move';
};

const onDropTableau = (e, colIndex) => {
  const data = e.dataTransfer.getData('payload');
  if (!data) return;
  const payload = JSON.parse(data);
  
  let cardsToMove = [];
  if (payload.from === 'tableau') {
    cardsToMove = tableau.value[payload.col].slice(payload.idx);
  } else if (payload.from === 'foundation') {
    cardsToMove = [foundations.value[payload.col].slice(-1)[0]];
  } else {
    cardsToMove = [waste.value.slice(-1)[0]];
  }

  if (!cardsToMove[0]) return;

  const targetCol = tableau.value[colIndex];
  const targetTopCard = targetCol.length > 0 ? targetCol[targetCol.length - 1] : null;

  // Validation
  let isValid = false;
  if (!targetTopCard) {
    // Only King can go to empty slot
    if (cardsToMove[0].rank === 'K') isValid = true;
  } else {
    // Alternating colors and decreasing rank
    const differentColor = isRedSuit(cardsToMove[0].suit) !== isRedSuit(targetTopCard.suit);
    const consecutiveRank = cardsToMove[0].rankValue === targetTopCard.rankValue - 1;
    if (differentColor && consecutiveRank) isValid = true;
  }

  if (isValid) {
    // Move cards
    if (payload.from === 'tableau') {
       tableau.value[payload.col].splice(payload.idx);
       if (tableau.value[payload.col].length > 0) {
         tableau.value[payload.col][tableau.value[payload.col].length-1].visible = true;
       }
    } else if (payload.from === 'foundation') {
       foundations.value[payload.col].pop();
    } else {
       waste.value.pop();
    }
    
    tableau.value[colIndex].push(...cardsToMove);
    moves.value++;
    ensureTimerStarted();
    checkVictory();
  }
};

const onDropFoundation = (e, fIndex) => {
  const data = e.dataTransfer.getData('payload');
  if (!data) return;
  const payload = JSON.parse(data);
  
  // Foundations can only receive 1 card at a time from top
  let cardToMove = null;
  if (payload.from === 'tableau') {
    if (payload.idx !== tableau.value[payload.col].length - 1) return;
    cardToMove = tableau.value[payload.col][payload.idx];
  } else if (payload.from === 'foundation') {
    return; // Moving between foundations usually not needed
  } else {
    cardToMove = waste.value[waste.value.length - 1];
  }

  if (!cardToMove) return;

  const targetFoundation = foundations.value[fIndex];
  const targetTopCard = targetFoundation.length > 0 ? targetFoundation[targetFoundation.length - 1] : null;

  let isValid = false;
  if (!targetTopCard) {
    // Only Ace of the right suit placeholder if we want to be strict, but actually foundations are by suit.
    if (cardToMove.rank === 'A' && cardToMove.suit === SUITS[fIndex]) isValid = true;
  } else {
    // Same suit and increasing rank
    if (cardToMove.suit === targetTopCard.suit && cardToMove.rankValue === targetTopCard.rankValue + 1) {
      isValid = true;
    }
  }

  if (isValid) {
    if (payload.from === 'tableau') {
       tableau.value[payload.col].splice(payload.idx);
       if (tableau.value[payload.col].length > 0) {
         tableau.value[payload.col][tableau.value[payload.col].length-1].visible = true;
       }
    } else {
       waste.value.pop();
    }
    
    foundations.value[fIndex].push(cardToMove);
    moves.value++;
    ensureTimerStarted();
    checkVictory();
  }
};

const checkVictory = () => {
  const allFoundationsFull = foundations.value.every(f => f.length === 13);
  if (allFoundationsFull) {
    isVictory.value = true;
    clearInterval(timerInterval.value);
  }
};

// --- NEW SMART FEATURES ---

// Auto-Move Logic (Double-click/tap simulation or helper)
const handleCardClick = (card, from, colIdx, cardIdx) => {
  if (!card || !card.visible) return;
  
  // Detection for tap vs drag is handled by browser, but we can do a "quick move" on click if it's the top card
  const isTopCard = (from === 'tableau' && cardIdx === tableau.value[colIdx].length - 1) || 
                    (from === 'waste' && cardIdx === waste.value.length - 1);
  
  if (isTopCard) {
    tryMoveToFoundation(card, from, colIdx);
  }
};

const tryMoveToFoundation = (card, from, colIdx) => {
  for (let i = 0; i < 4; i++) {
    const target = foundations.value[i];
    const top = target.length > 0 ? target[target.length - 1] : null;
    
    let isValid = false;
    if (!top) {
      if (card.rank === 'A' && card.suit === SUITS[i]) isValid = true;
    } else {
      if (card.suit === top.suit && card.rankValue === top.rankValue + 1) isValid = true;
    }

    if (isValid) {
      // Execute move
      if (from === 'tableau') {
        tableau.value[colIdx].pop();
        if (tableau.value[colIdx].length > 0) tableau.value[colIdx][tableau.value[colIdx].length-1].visible = true;
      } else if (from === 'waste') {
        waste.value.pop();
      }
      foundations.value[i].push(card);
      moves.value++;
      ensureTimerStarted();
      checkVictory();
      return true;
    }
  }
  return false;
};

const canAutoFinish = computed(() => {
  // Can auto finish if Stock and Waste are empty AND all tableau cards are visible
  if (stock.value.length > 0 || waste.value.length > 0) return false;
  return tableau.value.every(col => col.every(card => card.visible));
});

const autoFinish = async () => {
  let moved = true;
  while (moved) {
    moved = false;
    // Check waste first (though should be empty)
    if (waste.value.length > 0) {
      if (tryMoveToFoundation(waste.value[waste.value.length-1], 'waste', 0)) {
        moved = true;
        await new Promise(r => setTimeout(r, 100));
        continue;
      }
    }
    // Check each tableau top
    for (let i = 0; i < 7; i++) {
      const col = tableau.value[i];
      if (col.length > 0) {
        if (tryMoveToFoundation(col[col.length-1], 'tableau', i)) {
          moved = true;
          await new Promise(r => setTimeout(r, 100)); // Visual delay
          break;
        }
      }
    }
  }
};


onMounted(() => {
  initGame(false); // Initialize but don't start timer yet
  attemptLockOrientation();
  
  // Auto-show help if first time (optional)
  const playedBefore = localStorage.getItem('solitaire_played');
  if (!playedBefore) {
    showHelp.value = true;
    localStorage.setItem('solitaire_played', 'true');
  }
});

onUnmounted(() => {
  if (timerInterval.value) clearInterval(timerInterval.value);
});
</script>

<style scoped>
.min-h-screen {
  --card-width: min(85px, 12vw);
  --card-height: calc(var(--card-width) * 1.5);
}

@media (min-width: 640px) {
  .min-h-screen {
    --card-width: 100px;
  }
}

@media (min-width: 1024px) {
  .min-h-screen {
    --card-width: 120px;
  }
}

.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.card-slot {
  width: var(--card-width);
  height: var(--card-height);
  background-color: rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  border: 2px dashed rgba(255, 255, 255, 0.05);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.card-slot.no-bg {
  background: transparent;
  border: none;
}

.foundation-slot {
  border-color: rgba(255, 255, 255, 0.1);
  background: rgba(0, 0, 0, 0.15);
}

.card-inner {
  width: 100%;
  height: 100%;
  border-radius: 10px;
  background: white;
  overflow: hidden;
  position: relative;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  touch-action: none;
}

.card-inner.is-back {
  background: #2a3942;
  border: 3px solid rgba(255,255,255,0.1);
}

.tableau-card {
  width: var(--card-width);
  height: var(--card-height);
  display: flex;
  justify-content: center;
  user-select: none;
  cursor: grab;
}

.tableau-card:active {
  cursor: grabbing;
}

.tableau-empty {
  opacity: 0.1;
  background: rgba(255, 255, 255, 0.1);
}

.foundation-icon {
  width: 50%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.counter-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: #facc15;
  color: #064e3b;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 900;
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  z-index: 10;
}

/* Animations */
.scale-enter-active, .scale-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.8);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Orientation Lock UI */
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

/* Hide New Game button and timer area in portrait or when orientation provider is active */
@media (max-width: 768px) and (orientation: portrait) {
  .solitaire-new-game-btn {
    display: none !important;
  }
}
</style>

