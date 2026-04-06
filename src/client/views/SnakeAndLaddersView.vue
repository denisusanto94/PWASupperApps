<template>
  <div class="fixed inset-0 w-full h-[100svh] bg-[#0c1a1a] text-white flex flex-col items-center justify-center pt-14 lg:pt-20 overflow-hidden font-sans select-none">
    <!-- 1. AMBIENT LAYERS -->
    <div class="absolute inset-0 z-0 bg-cover bg-center transition-all duration-1000 scale-[1.02]" 
         :style="{ backgroundImage: `url('/snake-and-ladders/background.webp')`, opacity: playerCount ? 1 : 0.4 }">
    </div>
    
    <div class="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
      <div v-for="n in 20" :key="'leaf-'+n" 
           class="absolute opacity-20 animate-drift text-2xl"
           :style="{ 
             top: Math.random() * 100 + '%', 
             left: Math.random() * 100 + '%', 
             animationDelay: Math.random() * 10 + 's', 
             animationDuration: (15 + Math.random() * 20) + 's',
             fontSize: (10 + Math.random() * 30) + 'px'
           }">🍃</div>
    </div>

    <div class="absolute inset-0 z-[2] bg-black/40 pointer-events-none"></div>
    <div class="absolute inset-0 z-[3] bg-gradient-to-tr from-[#0c1a1a]/80 via-transparent to-[#0c1a1a]/40 pointer-events-none"></div>
    <div class="absolute inset-0 z-[4] backdrop-blur-[2px] pointer-events-none"></div>

    <!-- 2. HEADER -->
    <Teleport to="#app-header-portal">
      <div class="flex items-center justify-between w-full h-full snake-portal-header px-4 lg:px-8">
        <div class="flex items-center gap-4 group cursor-help">
           <div class="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(245,158,11,0.5)] transform -rotate-6 group-hover:rotate-0 transition-transform duration-500">
             <span class="text-black font-black italic text-2xl">#1</span>
           </div>
           <div class="flex flex-col -gap-1">
             <h1 class="text-xl font-black text-white uppercase italic tracking-tighter drop-shadow-lg leading-none">Island Quest</h1>
             <span class="text-[8px] font-black tracking-[0.4em] text-amber-500/60 uppercase">Snake & Ladders v2</span>
           </div>
        </div>
        <button @click="resetToSetup" class="group flex items-center gap-3 bg-white/5 backdrop-blur-3xl text-white px-8 py-3 rounded-2xl font-black text-xs hover:bg-amber-500 hover:text-black transition-all shadow-2xl active:scale-95 uppercase tracking-widest border border-white/10">
          <span class="opacity-50 group-hover:opacity-100 transition-opacity">{{ playerCount ? 'Abandon Mission' : 'Menu' }}</span>
          <span class="text-xl group-hover:animate-bounce">🏠</span>
        </button>
      </div>
    </Teleport>

    <!-- 3. SETUP LOBBY -->
    <Transition name="fade-blur">
      <div v-if="!playerCount" class="absolute inset-0 z-50 flex items-center justify-center p-4">
        <div class="max-w-4xl w-full text-center animate-in fade-in zoom-in duration-1000 relative">
          <div class="absolute -top-20 sm:-top-28 left-1/2 -translate-x-1/2 flex gap-4 sm:gap-10 pointer-events-none">
             <img v-for="n in 4" :key="'setup-p-'+n" :src="`/snake-and-ladders/p${n}.webp`" 
                  class="w-12 sm:w-16 h-auto object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,1)] animate-totem-float" 
                  :style="{ animationDelay: (n-1)*0.8 + 's' }" />
          </div>
          
          <div class="mb-10 lg:mb-16 relative">
             <h2 class="text-4xl sm:text-6xl lg:text-[7rem] font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 uppercase drop-shadow-[0_20px_40px_rgba(0,0,0,1)] leading-[0.75] mb-4 animate-pulse-slow">
               TROPICAL<br/>QUEST
             </h2>
             <div class="flex items-center justify-center gap-3">
               <div class="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500"></div>
               <p class="text-amber-500 text-xs lg:text-lg font-black uppercase tracking-[0.4em] italic drop-shadow-lg">ADVENTURE</p>
               <div class="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500"></div>
             </div>
          </div>

          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-8 max-w-4xl mx-auto px-4">
            <button v-for="n in 4" :key="'select-'+n" @click="selectPlayers(n)" 
                    class="group relative aspect-[3/4] p-0.5 bg-gradient-to-br from-white/20 to-transparent rounded-[2rem] lg:rounded-[3rem] transition-all transform hover:-translate-y-4 hover:scale-105 active:scale-95 shadow-2xl overflow-hidden">
              <div class="h-full w-full bg-black/60 backdrop-blur-2xl rounded-[1.9rem] lg:rounded-[2.9rem] flex flex-col items-center justify-between p-4 lg:p-10 border border-white/5 group-hover:bg-amber-500/20 transition-all duration-700">
                <div class="flex -space-x-4 lg:-space-x-8 mb-4 relative drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]">
                  <img v-for="i in Math.min(n, 3)" :key="'icon-'+i" :src="`/snake-and-ladders/p${i}.webp`" 
                       class="w-12 lg:w-20 h-16 lg:h-24 object-contain group-hover:rotate-6 transition-all duration-500" />
                  <div v-if="n === 4" class="w-8 h-8 lg:w-10 lg:h-10 bg-amber-500 border-[3px] border-[#0c1a1a] rounded-full flex items-center justify-center font-black text-black text-[8px] absolute -right-6 lg:-right-8 bottom-0 shadow-xl">+1</div>
                </div>
                <div class="text-center">
                  <h3 class="text-4xl lg:text-6xl font-black text-white uppercase italic tracking-tighter leading-none mb-1">{{ n }}</h3>
                  <p class="text-[8px] lg:text-[10px] text-amber-500 font-black uppercase tracking-[0.3em] opacity-60">{{ n === 1 ? 'SOLO RUN' : 'TEAM' }}</p>
                </div>
                <div class="w-full bg-amber-500/10 border border-amber-500/40 text-amber-500 py-2 lg:py-5 rounded-xl lg:rounded-2xl text-[9px] font-black italic uppercase tracking-widest group-hover:bg-amber-500 group-hover:text-black transition-all shadow-lg">START</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 4. MAIN GAMEPLAY -->
    <div v-if="playerCount" class="absolute inset-0 z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between p-2 lg:p-6 overflow-hidden pt-16 lg:pt-24">
      
      <!-- SCOREBOARD -->
      <div class="hidden lg:flex flex-col gap-3 self-center w-[200px] animate-in slide-in-from-left duration-1000">
         <div v-for="(p, i) in players" :key="'p-stat-'+i" 
              :class="['flex items-center gap-4 px-5 py-2 rounded-[1.5rem] border transition-all duration-1000 relative overflow-hidden group', 
                       currentPlayerIndex === i ? 'bg-amber-500 border-white shadow-[0_20px_40px_rgba(245,158,11,0.4)] translate-x-2 scale-100' : 'bg-black/60 border-white/5 opacity-40 transform scale-90 -translate-x-2']">
           <div v-if="currentPlayerIndex === i" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-sweep -skew-x-12"></div>
           <div class="relative h-10 w-8">
             <img :src="`/snake-and-ladders/p${i + 1}.webp`" class="w-full h-full object-contain relative transition-transform duration-500" />
           </div>
           <div class="text-left relative">
             <p :class="['text-[8px] font-black uppercase tracking-widest italic leading-tight', currentPlayerIndex === i ? 'text-black/60' : 'text-amber-500/60']">P{{ i+1 }}</p>
             <span :class="['text-3xl font-black italic tracking-tighter leading-none', currentPlayerIndex === i ? 'text-black' : 'text-white']">#{{ p.position }}</span>
           </div>
         </div>
      </div>

      <!-- BOARD STAGE -->
      <div class="flex-grow w-full h-full flex flex-col items-center justify-center relative p-1 lg:p-2 overflow-hidden shadow-2xl">
        <Transition name="splash">
           <div v-if="message" class="absolute top-[5%] lg:top-8 z-[60] pointer-events-none w-full flex justify-center px-4">
              <div class="bg-amber-500 text-black px-6 lg:px-12 py-2 lg:py-4 rounded-xl lg:rounded-2xl font-black text-lg lg:text-3xl uppercase italic shadow-2xl border-4 lg:border-8 border-white animate-splash-pop transform -rotate-2 text-center pointer-events-auto">
                {{ message }}
              </div>
           </div>
        </Transition>

        <div class="relative w-full h-full flex items-center justify-center group/board perspective-2000">
          <div class="relative h-full max-h-[80svh] lg:max-h-[96vh] w-auto aspect-[1730/1677] bg-[#1a0f0a] rounded-[1rem] lg:rounded-[4rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden border-[2px] lg:border-[6px] border-[#2b1d0e] transition-all duration-1000 shadow-inner group-hover/board:border-amber-900/40">
            <img src="/snake-and-ladders/board_new.webp" class="w-full h-full object-cover select-none pointer-events-none drop-shadow-2xl" alt="Island Board" />
            
            <div class="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
              <div class="relative w-[94.5%] h-[94.5%] overflow-visible">
                <!-- Highlight target cell -->
                <div v-for="cell in boardCells" :key="'bg-cell-'+cell.id" 
                     class="absolute w-[10%] h-[10%] pointer-events-none"
                     :style="getCellStaticStyle(cell.id)">
                   <div v-if="players[currentPlayerIndex]?.position === cell.id && !isMoving" 
                        class="absolute inset-1 bg-amber-500/20 rounded-lg lg:rounded-2xl animate-pulse-expand pointer-events-none"></div>
                </div>

                <!-- Unified Hopping Tokens -->
                <div v-for="(p, pIdx) in players" :key="'persistent-p-'+pIdx"
                     class="absolute w-[10%] h-[10%] transition-all cubic-bezier transform player-token-container z-50 flex items-center justify-center"
                     :class="[isHopping && currentPlayerIndex === pIdx ? 'duration-150' : 'duration-500']"
                     :style="getPlayerGlobalStyle(pIdx)">
                  <div class="relative flex items-center justify-center">
                     <img :src="`/snake-and-ladders/p${pIdx + 1}.webp`" 
                          class="h-[80%] lg:h-[100%] drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)] object-contain transition-all duration-500"
                          :class="{ 
                            'animate-monopoly-hop': isHopping && currentPlayerIndex === pIdx, 
                            'animate-quest-jump': isSpecialMoving && currentPlayerIndex === pIdx,
                            'scale-125': currentPlayerIndex === pIdx && !isMoving 
                          }" />
                     <div v-if="currentPlayerIndex === pIdx && !isMoving" 
                          class="absolute -top-[30%] w-3 h-3 lg:w-4 lg:h-4 bg-gradient-to-t from-amber-600 to-amber-300 rounded-full border-[2px] border-white shadow-[0_0_15px_rgba(245,158,11,0.8)] animate-bounce-slow"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTROL POD -->
      <div class="lg:w-[200px] w-full max-w-[380px] lg:max-w-none flex flex-col items-center gap-2 lg:self-center p-2 lg:p-0 animate-in slide-in-from-right duration-1000">
         <div class="w-full bg-black/85 backdrop-blur-[30px] border-[2px] lg:border-[4px] border-white/10 p-2 lg:p-6 rounded-[2rem] lg:rounded-[4rem] shadow-2xl relative overflow-hidden group/controls transition-all duration-700">
            <div class="hidden lg:flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
               <div class="relative h-10 w-8 bg-white/5 rounded-xl p-1 border border-white/10">
                  <img :src="`/snake-and-ladders/p${currentPlayerIndex + 1}.webp`" class="w-full h-full object-contain relative z-10 animate-bob shadow-2xl" />
               </div>
               <p class="text-amber-500 text-[10px] font-black uppercase italic tracking-[0.2em] mb-1 opacity-60 uppercase">Turn</p>
            </div>

            <div class="flex flex-row lg:flex-col items-center justify-between gap-2 lg:gap-8 relative z-10 w-full px-2 lg:px-0">
               <div class="relative w-14 h-14 lg:w-32 lg:h-32 perspective-2000 active:scale-95 transition-transform duration-500 cursor-pointer">
                  <div v-if="!isRolling && !isMoving" class="absolute inset-[-15px] lg:inset-[-30px] bg-amber-500/10 blur-[20px] lg:blur-[40px] rounded-full animate-pulse-slow"></div>
                  <div v-if="isRolling" class="w-full h-full animate-in fade-in zoom-in duration-300 rounded-[0.8rem] lg:rounded-[2rem] overflow-hidden bg-white shadow-2xl">
                     <img src="/snake-and-ladders/roll-dice.gif" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="relative w-full h-full">
                     <div :class="['dice-box transform preserve-3d relative w-full h-full duration-[1s] cubic-bezier']"
                          :style="diceRotationStyle">
                       <div v-for="n in 6" :key="'face-'+n" :class="['dice-face face-'+n, 'bg-white border lg:border-[2px] border-slate-200 rounded-[0.8rem] lg:rounded-[2rem] shadow-inner']">
                          <template v-if="n === 1"><div class="dot center !bg-red-600 !w-[35%] !h-[35%]"></div></template>
                          <template v-else-if="n === 2"><div class="dot top-right"></div><div class="dot bottom-left"></div></template>
                          <template v-else-if="n === 3"><div class="dot top-right"></div><div class="dot center"></div><div class="dot bottom-left"></div></template>
                          <template v-else-if="n === 4"><div class="dot top-left"></div><div class="dot top-right"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div></template>
                          <template v-else-if="n === 5"><div class="dot top-left"></div><div class="dot top-right"></div><div class="dot center"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div></template>
                          <template v-else-if="n === 6"><div class="dot top-left"></div><div class="dot top-right"></div><div class="dot middle-left"></div><div class="dot middle-right"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div></template>
                       </div>
                     </div>
                     <Transition name="fade">
                       <div v-if="diceResult && !isMoving" class="absolute inset-0 flex items-center justify-center bg-amber-500/20 backdrop-blur-[2px] rounded-[0.8rem] lg:rounded-[2rem] pointer-events-none border-2 border-white/50">
                         <span class="text-3xl lg:text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(0,0,0,1)] italic">{{ diceResult }}</span>
                       </div>
                     </Transition>
                  </div>
               </div>

               <button @click="rollDice" :disabled="isRolling || isMoving || !!winner"
                       class="group relative flex-grow lg:w-full h-12 lg:h-20 bg-transparent disabled:opacity-20 transition-all transform active:scale-95 shadow-xl">
                  <div class="absolute inset-0 bg-gradient-to-b from-amber-500 to-amber-700 rounded-xl lg:rounded-[3rem] shadow-[0_4px_0_#92400e] lg:shadow-[0_8px_0_#92400e] group-hover:from-amber-400 group-hover:to-amber-600 transition-all duration-300"></div>
                  <div class="relative h-full flex flex-col items-center justify-center text-white">
                    <span class="text-xl lg:text-3xl font-black uppercase italic tracking-tighter drop-shadow-2xl">
                      {{ isBotTurn ? 'BOT' : (isMoving ? '...' : 'ROLL') }}
                    </span>
                  </div>
               </button>
            </div>
         </div>
      </div>
    </div>

    <!-- 5. CELEBRATION LAYER -->
    <div v-if="winner !== null" class="fixed inset-0 z-[200] pointer-events-none overflow-hidden">
      <div v-for="c in 52" :key="'confetti-'+c" 
           class="absolute w-4 h-4 rounded-sm animate-confetti-fall"
           :style="{ 
             left: (Math.random() * 100) + 'vw', 
             top: '-10vh',
             backgroundColor: ['#f59e0b', '#fff', '#10b981', '#ef4444'][Math.floor(Math.random() * 4)],
             animationDelay: (Math.random() * 5) + 's',
             animationDuration: (3 + Math.random() * 5) + 's'
           }"></div>
    </div>

    <!-- 6. VICTORY OVERLAY -->
    <Transition name="victory-pop">
      <div v-if="winner !== null" class="fixed inset-0 z-[300] flex items-center justify-center bg-[#0c1a1a]/90 backdrop-blur-[60px] p-4 lg:p-8">
        <div class="max-w-[400px] w-full text-center p-6 lg:p-10 bg-[#1a110d] rounded-[3rem] lg:rounded-[5rem] border-[6px] lg:border-[12px] border-amber-900 shadow-[0_0_80px_rgba(0,0,0,1)] relative overflow-hidden">
          <div class="relative z-10">
            <div class="relative inline-block mb-4 lg:mb-8">
              <img :src="`/snake-and-ladders/p${winner + 1}.webp`" class="w-28 h-40 lg:w-52 lg:h-64 object-contain drop-shadow-[0_40px_60px_rgba(0,0,0,1)] animate-victory-float" />
            </div>
            <h2 class="text-2xl lg:text-5xl font-black text-white mb-2 tracking-tighter uppercase italic leading-[0.8] drop-shadow-2xl">GRAND<br/>EXPLORER</h2>
            <h3 class="text-base lg:text-2xl font-black text-amber-500 mb-8 lg:mb-12 uppercase tracking-[0.4em] italic drop-shadow-lg">PLAYER {{ winner + 1 }}</h3>
            <div class="flex flex-col sm:flex-row gap-3 lg:gap-5">
              <button @click="resetGame" class="flex-1 bg-amber-600 text-white py-3 lg:py-6 rounded-xl lg:rounded-[2.5rem] font-black text-base lg:text-2xl shadow-[0_6px_0_#92400e] uppercase tracking-tighter italic active:-translate-y-1 transition-transform">PLAY AGAIN</button>
              <button @click="resetToSetup" class="flex-1 bg-white/5 text-white/40 py-3 lg:py-6 rounded-xl lg:rounded-[2.5rem] font-black text-[9px] lg:text-[10px] uppercase tracking-[0.4em] border border-white/5 active:bg-white/10 transition-all">EXIT</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const ladders = [
  { start: 14, end: 35, msg: 'Memanjat pohon besar dari lantai bawah! 🪜' },
  { start: 23, end: 44, msg: 'Tangga kayu pendek di dahan pohon! 🪜' },
  { start: 53, end: 73, msg: 'Tangga kayu di samping air terjun! 🪜' },
  { start: 56, end: 95, msg: 'Lompatan bambu merambat terjauh! 🪜' },
  { start: 63, end: 97, msg: 'Tangga kecil di baris atas! 🪜' },
  { start: 72, end: 91, msg: 'Tangga kayu menuju sarang burung! 🪜' }
];

const snakes = [
  { start: 42, end: 21, msg: 'Ular jaring laba-laba ke pasir hisap! 🕸️' },
  { start: 49, end: 29, msg: 'Jembatan gantung putus ke arah kobra! 🌉' },
  { start: 61, end: 39, msg: 'Ular hutan rimbun turun ke bawah! 🐍' },
  { start: 73, end: 54, msg: 'Jalur kayu turun ke air terjun! 🏔️' },
  { start: 11, end: 2, msg: 'Jebakan Monyet Usil! 🐒' }
];

const boardCells = computed(() => {
  const flat = [];
  for (let r = 9; r >= 0; r--) {
    for (let c = 0; c < 10; c++) {
      let id = (r % 2 === 0) ? (r * 10) + (c + 1) : (r * 10) + (10 - c);
      flat.push({ id });
    }
  }
  return flat;
});

const playerCount = ref(null);
const players = ref([]);
const currentPlayerIndex = ref(0);
const isRolling = ref(false);
const diceResult = ref(null);
const isMoving = ref(false);
const isHopping = ref(false);
const isSpecialMoving = ref(false);
const winner = ref(null);
const message = ref('');

const isBotTurn = computed(() => playerCount.value === 1 && currentPlayerIndex.value === 1 && winner.value === null);

const getCellCoords = (id) => {
  const r = Math.floor((id - 1) / 10);
  const c = r % 2 === 0 ? (id - 1) % 10 : 9 - ((id - 1) % 10);
  return { left: c * 10, top: (9 - r) * 10 };
};

const getCellStaticStyle = (id) => {
  const coords = getCellCoords(id);
  return { left: coords.left + '%', top: coords.top + '%' };
};

const getPlayersInCell = (id) => players.value.map((p, idx) => p.position === id ? idx : null).filter(res => res !== null);

const getPlayerGlobalStyle = (pIdx) => {
  const p = players.value[pIdx];
  if (!p) return { display: 'none' };
  const coords = getCellCoords(p.position);
  const playersInCell = getPlayersInCell(p.position);
  let transform = '';
  if (playersInCell.length > 1) {
    const idxInCell = playersInCell.indexOf(pIdx);
    const radius = 20;
    const angle = (idxInCell / playersInCell.length) * 2 * Math.PI;
    transform = `translate(${Math.cos(angle) * radius}px, ${Math.sin(angle) * radius}px)`;
  }
  return { left: coords.left + '%', top: coords.top + '%', transform };
};

const diceRotationStyle = ref({ transform: 'rotateX(0deg) rotateY(0deg)' });

const rollDice = () => {
  if (isRolling.value || isMoving.value || winner.value !== null) return;
  isRolling.value = true;
  diceResult.value = null;
  message.value = 'SUMMONING FATE...';
  const result = Math.floor(Math.random() * 6) + 1;
  const targets = {
    1: { x: 0, y: 0 }, 2: { x: 0, y: -90 },
    3: { x: -90, y: 0 }, 4: { x: 90, y: 0 },
    5: { x: 0, y: 90 }, 6: { x: 180, y: 0 }
  };
  setTimeout(() => {
    isRolling.value = false;
    diceResult.value = result;
    diceRotationStyle.value = { transform: `rotateX(${targets[result].x}deg) rotateY(${targets[result].y}deg)` };
    setTimeout(() => {
       message.value = `${result} STEPS!`;
       setTimeout(() => movePlayer(result), 350);
    }, 600);
  }, 1600);
};

const movePlayer = async (steps) => {
  isMoving.value = true;
  const p = players.value[currentPlayerIndex.value];
  
  // Standard Step-by-Step Hopping
  for (let i = 0; i < steps; i++) {
    if (p.position >= 100) break;
    isHopping.value = true;
    p.position++;
    // Wait for the hop to finish
    await new Promise(r => setTimeout(r, 450));
    isHopping.value = false;
    await new Promise(r => setTimeout(r, 50)); 
  }
  
  if (p.position === 100) {
    winner.value = currentPlayerIndex.value;
    isMoving.value = false;
    message.value = 'MISSION COMPLETE!';
    return;
  }

  // Handle Snakes/Ladders with a "Slide" effect
  let foundInteraction = true;
  while (foundInteraction) {
    foundInteraction = false;
    const interaction = ladders.find(l => l.start === p.position) || snakes.find(s => s.start === p.position);
    
    if (interaction) {
      message.value = interaction.msg;
      await new Promise(r => setTimeout(r, 900));
      isSpecialMoving.value = true; // Trigger glide animation
      p.position = interaction.end;
      await new Promise(r => setTimeout(r, 900));
      isSpecialMoving.value = false;
      foundInteraction = true;
      continue;
    }
  }

  isMoving.value = false;
  currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length;
  message.value = '';
};

const selectPlayers = (n) => { playerCount.value = n; resetGame(); };
const resetGame = () => {
  players.value = Array.from({ length: playerCount.value === 1 ? 2 : playerCount.value }, () => ({ position: 1 }));
  currentPlayerIndex.value = 0;
  winner.value = null;
  message.value = 'READY? QUEST!';
  diceRotationStyle.value = { transform: 'rotateX(0deg) rotateY(0deg)' };
};
const resetToSetup = () => { playerCount.value = null; winner.value = null; };

watch(isBotTurn, (val) => {
  if (val && !winner.value && !isRolling.value && !isMoving.value) setTimeout(rollDice, 1200);
});
</script>

<style scoped>
.perspective-2000 { perspective: 2000px; }
.preserve-3d { transform-style: preserve-3d; }
.dice-box { width: 100%; height: 100%; transition-property: transform; }
.cubic-bezier { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
.dice-face { position: absolute; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; backface-visibility: hidden; }
.face-1 { transform: rotateY(0deg) translateZ(calc(49.8%)); }
.face-2 { transform: rotateY(90deg) translateZ(calc(49.8%)); }
.face-3 { transform: rotateX(90deg) translateZ(calc(49.8%)); }
.face-4 { transform: rotateX(-90deg) translateZ(calc(49.8%)); }
.face-5 { transform: rotateY(-90deg) translateZ(calc(49.8%)); }
.face-6 { transform: rotateY(180deg) translateZ(calc(49.8%)); }
.dot { width: 16%; height: 16%; background: #0f172a; border-radius: 50%; position: absolute; }
.dot.center { top: 50%; left: 50%; transform: translate(-50%, -50%); }
.dot.top-left { top: 18%; left: 18%; }
.dot.top-right { top: 18%; right: 18%; }
.dot.bottom-left { bottom: 18%; left: 18%; }
.dot.bottom-right { bottom: 18%; right: 18%; }
.dot.middle-left { top: 50%; left: 18%; transform: translateY(-50%); }
.dot.middle-right { top: 50%; right: 18%; transform: translateY(-50%); }
.animate-drift { animation: drifting linear infinite; }
@keyframes drifting { from { transform: translate(0, 0) rotate(0deg); } to { transform: translate(30vw, 30vh) rotate(360deg); } }
.animate-totem-float { animation: totem 4s ease-in-out infinite; }
@keyframes totem { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-50px) rotate(2deg); } }

/* MONOPOLY HOP: A snappy vertical bounce */
@keyframes monopolyHop {
  0%, 100% { transform: translateY(0) scale(1.1); }
  40% { transform: translateY(-35px) scale(0.9, 1.2); }
}
.animate-monopoly-hop { animation: monopolyHop 0.45s cubic-bezier(0.45, 0.05, 0.55, 0.95); }

/* SPECIAL QUEST JUMP: A weighted slide/glide */
@keyframes questJump {
  0%, 100% { transform: translateY(0) scale(1.2); }
  50% { transform: translateY(-60px) scale(0.7, 1.4); }
}
.animate-quest-jump { animation: questJump 0.9s cubic-bezier(0.34, 1.56, 0.64, 1); }

.animate-pulse-expand { animation: pulseExp 1.5s ease-out infinite; }
@keyframes pulseExp { 0% { transform: scale(0.8); opacity: 0.6; } 100% { transform: scale(1.5); opacity: 0; } }
.animate-bob { animation: bob 2s ease-in-out infinite; }
@keyframes bob { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
.animate-victory-float { animation: vicFloat 3s ease-in-out infinite; }
@keyframes vicFloat { 0%, 100% { transform: translateY(0) rotate(-2deg); } 50% { transform: translateY(-30px) rotate(2deg); } }
@keyframes sweep { from { transform: translateX(-200%); } to { transform: translateX(300%); } }
.animate-sweep { animation: sweep 3s ease-in-out infinite; }
.animate-bounce-slow { animation: bounceSlow 1.5s ease-in-out infinite; }
@keyframes bounceSlow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
@keyframes splash { 0% { transform: scale(0); opacity: 0; } 100% { transform: scale(1); opacity: 1; } }
.animate-splash-pop { animation: splash 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.animate-confetti-fall { animation: confetti linear infinite; }
@keyframes confetti { to { transform: translateY(110vh) rotate(720deg); } }
.fade-blur-enter-active, .fade-blur-leave-active { transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-blur-enter-from, .fade-blur-leave-to { opacity: 0; filter: blur(40px); }
.victory-pop-enter-active { animation: splash 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
.player-token-container { width: 10%; height: 10%; display: flex; align-items: center; justify-content: center; z-index: 50; pointer-events: none; }
</style>
