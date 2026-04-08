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
                       class="w-10 lg:w-16 h-14 lg:h-20 object-contain group-hover:rotate-6 transition-all duration-500" />
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

    <!-- 4. MAIN GAMEPLAY (Ultra-Responsive Landscape Layout) -->
    <div v-if="playerCount" class="absolute inset-0 z-10 flex flex-row items-center justify-between p-2 lg:p-6 overflow-hidden pt-14 lg:pt-20">
      
      <!-- SCOREBOARD (Responsive Width) -->
      <div class="hidden sm:flex flex-col gap-2 lg:gap-4 self-center w-[160px] lg:w-[220px] transition-all duration-1000 shrink-0">
         <div v-for="(p, i) in players" :key="'p-stat-'+i" 
              :class="['flex items-center gap-2 lg:gap-4 px-3 lg:px-4 py-2 lg:py-3 rounded-2xl lg:rounded-[2rem] border transition-all duration-700 relative overflow-hidden group', 
                       currentPlayerIndex === i ? 'bg-amber-500 border-white shadow-2xl translate-x-2' : 'bg-black/60 border-white/5 opacity-40 scale-90 -translate-x-2']">
           <div v-if="currentPlayerIndex === i" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-sweep -skew-x-12"></div>
           <div class="relative h-8 lg:h-12 w-6 lg:w-10 shrink-0">
             <img :src="`/snake-and-ladders/p${i + 1}.webp`" class="w-full h-full object-contain relative transition-transform duration-500" />
           </div>
           <div class="flex-grow text-left relative">
             <div class="flex items-center justify-between mb-0.5">
               <p :class="['text-[6px] lg:text-[8px] font-black uppercase tracking-widest italic', currentPlayerIndex === i ? 'text-black/60' : 'text-amber-500/60']">P{{ i+1 }}</p>
               <button @click.stop="openInventory(i)" class="relative group/bag active:scale-75">
                  <span class="text-xs lg:text-sm">🎒</span>
                  <div v-if="p.inventory.length > 0" class="absolute -top-1 -right-1 w-2 lg:w-3 h-2 lg:h-3 bg-red-600 rounded-full text-[5px] lg:text-[6px] flex items-center justify-center font-black border border-white">
                    {{ p.inventory.length }}
                  </div>
               </button>
             </div>
             <span :class="['text-xl lg:text-3xl font-black italic tracking-tighter leading-none', currentPlayerIndex === i ? 'text-black' : 'text-white']">#{{ p.position }}</span>
           </div>
         </div>
      </div>

      <!-- BOARD STAGE (Responsive Scaling) -->
      <div class="flex-grow h-full flex flex-col items-center justify-center relative p-1 lg:p-4 overflow-hidden">
        <Transition name="splash">
           <div v-if="message" class="absolute top-2 lg:top-8 z-[60] pointer-events-none w-full flex justify-center px-4">
              <div class="bg-amber-500 text-black px-4 lg:px-12 py-2 lg:py-4 rounded-lg lg:rounded-2xl font-black text-xs lg:text-3xl uppercase italic shadow-2xl border-2 lg:border-8 border-white animate-splash-pop transform -rotate-2">
                {{ message }}
              </div>
           </div>
        </Transition>

        <div class="relative w-full h-full flex items-center justify-center group/board perspective-2000">
          <div class="relative h-full max-h-[85vh] lg:max-h-[90vh] w-auto aspect-[1730/1677] bg-[#1a0f0a] rounded-xl lg:rounded-[2rem] shadow-[0_40px_80px_rgba(0,0,0,0.8)] overflow-hidden border-[2px] lg:border-[8px] border-[#2b1d0e] transition-all duration-1000 shadow-inner">
            <img src="/snake-and-ladders/board_new.webp" class="w-full h-full object-cover select-none pointer-events-none" alt="Island Board" />
            
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
                      class="absolute w-[10%] h-[10%] transition-all transform player-token-container z-50 animate-in fade-in zoom-in"
                      :class="[
                        isHopping && currentPlayerIndex === pIdx ? 'duration-[450ms] player-transition-standard' : 'duration-500 player-transition-smooth'
                      ]"
                      :style="getPlayerGlobalStyle(pIdx)">
                   <div class="relative flex items-center justify-center w-full h-full">
                      <img :src="`/snake-and-ladders/p${pIdx + 1}.webp`" 
                           class="h-[55%] lg:h-[65%] drop-shadow-[10px_10px_20px_rgba(0,0,0,0.8)] object-contain transition-all duration-500"
                           :class="{ 
                             'animate-monopoly-hop': isHopping && currentPlayerIndex === pIdx, 
                             'animate-quest-jump': isSpecialMoving && currentPlayerIndex === pIdx,
                             'scale-125': currentPlayerIndex === pIdx && !isMoving 
                           }" />
                      <div v-if="currentPlayerIndex === pIdx && !isMoving" 
                           class="absolute -top-[10%] w-2 h-2 lg:w-3 lg:h-3 bg-amber-500 shadow-[0_0_15px_rgba(255,255,255,1)] rounded-full animate-bounce-slow"></div>
                   </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- CONTROL POD (Responsive Width) -->
      <div class="w-[160px] lg:w-[260px] flex flex-col items-center gap-2 self-center p-1 lg:p-0 transition-all duration-1000 shrink-0">
         <div class="w-full bg-black/85 backdrop-blur-[30px] border-[2px] lg:border-[4px] border-white/10 p-2 lg:p-8 rounded-[2rem] lg:rounded-[5rem] shadow-2xl relative overflow-hidden group/controls transition-all duration-700">
            <div class="hidden lg:flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
               <div class="relative h-10 w-8 bg-white/5 rounded-xl p-1 border border-white/10">
                  <img :src="`/snake-and-ladders/p${currentPlayerIndex + 1}.webp`" class="w-full h-full object-contain relative z-10 animate-bob shadow-2xl" />
               </div>
               <p class="text-amber-500 text-[10px] font-black uppercase italic tracking-[0.2em] mb-1 opacity-60">Turn</p>
            </div>
 
            <div class="flex flex-col items-center justify-between gap-1 lg:gap-6 relative z-10 w-full">
               <!-- ROLL METER UI -->
               <div v-if="!winner && !isMoving" class="w-full h-4 lg:h-12 bg-black/40 rounded-full border border-white/10 relative overflow-hidden group/meter shadow-inner">
                  <div class="absolute inset-y-0 left-0 w-1/2 bg-red-500/20 border-r border-white/5 flex items-center justify-center transition-all"
                       :class="meterValue <= 50 && isHolding ? 'bg-red-500/40' : ''">
                    <span class="text-[5px] lg:text-[8px] font-black text-red-500/60 uppercase tracking-tighter">Low</span>
                  </div>
                  <div class="absolute inset-y-0 right-0 w-1/2 bg-emerald-500/20 flex items-center justify-center transition-all"
                       :class="meterValue > 50 && isHolding ? 'bg-emerald-500/40' : ''">
                    <span class="text-[5px] lg:text-[8px] font-black text-emerald-500/60 uppercase tracking-tighter">High</span>
                  </div>
                  
                  <!-- Indicator -->
                  <div class="absolute top-0 bottom-0 w-0.5 lg:w-2 bg-white shadow-[0_0_15px_rgba(255,255,255,1)] z-20 transition-all duration-30"
                       :style="{ left: meterValue + '%' }"></div>
                  
                  <!-- Countdown Overlay -->
                  <div v-if="holdTimeRemaining !== null" class="absolute inset-0 z-30 flex items-center justify-center bg-amber-500/10 backdrop-blur-[1px]">
                     <span class="text-[8px] lg:text-xl font-black text-white italic animate-ping">{{ (holdTimeRemaining / 1000).toFixed(1) }}s</span>
                  </div>
               </div>
 
               <div class="relative w-12 h-12 lg:w-32 lg:h-32 perspective-2000 active:scale-95 transition-transform duration-500">
                  <div v-if="!isRolling && !isMoving" class="absolute inset-[-10px] lg:inset-[-30px] bg-amber-500/10 blur-[15px] lg:blur-[40px] rounded-full animate-pulse-slow"></div>
                  <div v-if="isRolling" class="w-full h-full animate-in fade-in zoom-in duration-300 rounded-lg lg:rounded-[2rem] overflow-hidden bg-white shadow-2xl">
                     <img src="/snake-and-ladders/roll-dice.gif" class="w-full h-full object-cover" />
                  </div>
                  <div v-else class="relative w-full h-full">
                     <div :class="['dice-box transform preserve-3d relative w-full h-full duration-[1s] cubic-bezier']"
                          :style="diceRotationStyle">
                        <div v-for="n in 6" :key="'face-'+n" :class="['dice-face face-'+n, 'bg-white border border-slate-200 rounded-lg lg:rounded-[2rem] shadow-inner']">
                           <template v-if="n === 1"><div class="dot center !bg-red-600 !w-[35%] !h-[35%]"></div></template>
                           <template v-else-if="n === 2"><div class="dot top-right"></div><div class="dot bottom-left"></div></template>
                           <template v-else-if="n === 3"><div class="dot top-right"></div><div class="dot center"></div><div class="dot bottom-left"></div></template>
                           <template v-else-if="n === 4"><div class="dot top-left"></div><div class="dot top-right"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div></template>
                           <template v-else-if="n === 5"><div class="dot top-left"></div><div class="dot top-right"></div><div class="dot center"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div></template>
                           <template v-else-if="n === 6"><div class="dot top-left"></div><div class="dot top-right"></div><div class="dot middle-left"></div><div class="dot middle-right"></div><div class="dot bottom-left"></div><div class="dot bottom-right"></div></template>
                        </div>
                     </div>
                     <Transition name="fade">
                        <div v-if="diceResult && !isMoving" class="absolute inset-0 flex items-center justify-center bg-amber-500/20 backdrop-blur-[2px] rounded-lg lg:rounded-[2rem] pointer-events-none border lg:border-2 border-white/50">
                          <span class="text-xl lg:text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(0,0,0,1)] italic">{{ diceResult }}</span>
                        </div>
                     </Transition>
                  </div>
               </div>
 
                <button 
                   @mousedown="handlePress" 
                   @touchstart.prevent="handlePress"
                   @mouseup="handleRelease" 
                   @touchend.prevent="handleRelease"
                   @mouseleave="handleRelease"
                   :disabled="isRolling || isMoving || !!winner"
                   class="group relative w-full h-10 lg:h-24 bg-transparent disabled:opacity-20 transition-all transform active:scale-95 shadow-xl select-none touch-none">
                   <div class="absolute inset-0 bg-gradient-to-b from-amber-500 to-amber-700 rounded-lg lg:rounded-[3rem] shadow-[0_4px_0_#92400e] lg:shadow-[0_8px_0_#92400e] group-hover:from-amber-400 group-hover:to-amber-600 transition-all duration-300"></div>
                   <div class="relative h-full flex flex-col items-center justify-center text-white">
                     <span class="text-[8px] lg:text-2xl font-black uppercase italic tracking-tighter drop-shadow-2xl leading-none">
                       {{ isBotTurn ? 'BOT' : (isMoving ? '...' : (isHolding ? 'CHARGING!' : 'ROLL')) }}
                     </span>
                     <span v-if="!isHolding && !isMoving && !winner" class="hidden lg:block text-[8px] font-black uppercase tracking-widest opacity-40 mt-1">Tap for Low</span>
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

    <!-- 6. INDIVIDUAL INVENTORY OVERLAY (MODAL) -->
    <Transition name="fade-blur">
       <div v-if="showInventory" class="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-xl p-4">
          <div class="w-full max-w-[350px] bg-black/90 rounded-[3rem] p-6 border border-white/10 shadow-2xl relative">
             <div class="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
                <div class="flex items-center gap-3">
                   <div class="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                      <img :src="`/snake-and-ladders/p${inventoryPlayerIndex + 1}.webp`" class="h-8 object-contain" />
                   </div>
                   <p class="text-amber-500 font-black italic tracking-widest uppercase text-xs">P{{ inventoryPlayerIndex + 1 }} Pack</p>
                </div>
                <button @click="showInventory = false" class="w-8 h-8 flex items-center justify-center bg-white/5 rounded-full text-white/40 hover:text-white transition-colors">✕</button>
             </div>
             
             <div v-if="players[inventoryPlayerIndex]?.inventory.length === 0" class="py-12 text-center bg-white/5 rounded-3xl border border-dashed border-white/10">
                <p class="text-white/20 text-[10px] font-black uppercase tracking-[0.3em]">No items found</p>
             </div>
             
             <div class="grid grid-cols-3 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <div v-for="(card, cIdx) in players[inventoryPlayerIndex]?.inventory || []" :key="'inv-'+cIdx" 
                     @click="useInventoryCard(cIdx)"
                     class="group relative aspect-[3/4] bg-white/5 rounded-[1.5rem] overflow-hidden border border-white/10 hover:border-amber-500 translate-z-0 transition-all cursor-pointer">
                   <img :src="`/snake-and-ladders/card-jugle/${card.img}`" class="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                   <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
             </div>
             
             <p class="mt-6 text-[9px] text-white/40 italic text-center uppercase tracking-widest">Select an item to use during your turn</p>
          </div>
       </div>
    </Transition>

    <!-- 7. CARD MODAL (REDUCED SIZE) -->
    <Transition name="victory-pop">
       <div v-if="showCardModal" class="fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-xl p-4">
          <div class="max-w-[280px] lg:max-w-[380px] w-full bg-[#1a110d] rounded-[2.5rem] lg:rounded-[4rem] border-[4px] lg:border-[8px] border-amber-900 shadow-[0_0_100px_rgba(0,0,0,1)] p-4 lg:p-8 text-center animate-card-appear relative overflow-hidden">
             <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:20px_20px]"></div>
             
             <div class="relative z-10">
                <p class="text-amber-500 font-black italic tracking-[0.4em] uppercase text-[8px] lg:text-[10px] mb-3">You Discovered</p>
                <div class="aspect-[3/4] max-w-[150px] lg:max-w-[220px] mx-auto rounded-xl lg:rounded-2xl overflow-hidden border-4 lg:border-6 border-white shadow-2xl mb-4 lg:mb-6 transform -rotate-2 animate-victory-float">
                   <img :src="`/snake-and-ladders/card-jugle/${drawnCard.img}`" class="w-full h-full object-cover" />
                </div>
                <h2 class="text-lg lg:text-3xl font-black text-white italic uppercase tracking-tighter mb-1">{{ drawnCard.name }}</h2>
                <p class="text-white/60 text-[9px] lg:text-xs mb-6 lg:mb-8 font-medium leading-relaxed">{{ drawnCard.desc }}</p>
                
                <button v-if="drawnCard.type === 'Persistent'" @click="closeCardModal" class="w-full bg-amber-500 text-black py-3 lg:py-5 rounded-xl lg:rounded-[2rem] font-black text-base lg:text-xl italic uppercase tracking-tighter shadow-[0_6px_0_#b45309] active:translate-y-1 active:shadow-none transition-all">
                   EQUIP PACK
                </button>
                <div v-else class="text-amber-500 text-[10px] font-black italic uppercase tracking-widest animate-pulse">Activating automatically...</div>
             </div>
          </div>
       </div>
    </Transition>

    <!-- 8. VICTORY OVERLAY -->
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

    <!-- 9. ORIENTATION PROTECTOR (Portrait Only) -->
    <div class="orientation-protector lg:hidden">
      <div class="fixed inset-0 z-[600] bg-[#0c1a1a] flex flex-col items-center justify-center p-8 text-center bg-cover bg-center"
           :style="{ backgroundImage: `url('/snake-and-ladders/background.webp')` }">
        <div class="absolute inset-0 bg-black/80 backdrop-blur-xl"></div>
        <div class="relative z-10 flex flex-col items-center">
           <div class="w-24 h-24 mb-8 text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(255,255,255,0.4)]">📱 🔄</div>
           <h2 class="text-3xl font-black text-white mb-2 italic uppercase tracking-tighter drop-shadow-2xl leading-none">OPTIMALKAN<br/>PANDANGAN</h2>
           <p class="text-amber-500/80 font-black text-[10px] uppercase tracking-[0.3em] mb-6">Landscape Mode Required</p>
           <p class="text-white/60 font-medium text-sm max-w-xs mb-10">Putar perangkat Anda ke posisi miring (Landscape) untuk menjelajahi seluruh pulau dengan sempurna.</p>
           <button @click="attemptLockOrientation" class="px-8 py-4 bg-amber-500 text-black rounded-2xl font-black text-lg active:scale-95 transition-all shadow-[0_8px_0_#b45309]">
             KUNCI LANDSCAPE
           </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
const router = useRouter();

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

const ladders = [
  { start: 15, end: 34, msg: 'Tangga Bambu: Memanjat ke dahan! 🪜' },
  { start: 23, end: 44, msg: 'Tangga Kayu: Naik ke platform! 🪜' },
  { start: 35, end: 95, msg: 'Tangga Raksasa: Lompatan Luar Biasa! 🪜' },
  { start: 63, end: 97, msg: 'Tangga Gantung: Menuju Puncak! 🪜' },
  { start: 33, end: 50, msg: 'Jembatan Gantung: Menyeberangi Jurang! 🌉' },
  { start: 68, end: 90, msg: 'Jembatan Tali: Melewati Area Berbahaya! 🌉' },
  { start: 72, end: 90, msg: 'Naik Burung: Terbang Melintasi Hutan! 🦜' }
];

const snakes = [
  { start: 98, end: 8, msg: 'Ular Kobra: Jatuh ke Dasar Hutan! 🐍' },
  { start: 32, end: 29, msg: 'Ular Hijau: Tergelincir Turun! 🐍' },
  { start: 39, end: 40, msg: 'Lilitan Ular: Tergeser Mundur! 🐍' }, // Literal as per user, though 39->40 is forward. Usually 40 is end of row.
  { start: 59, end: 41, msg: 'Ular Ungu: Terseret ke Jaring Laba-laba! 🐍' },
  { start: 92, end: 73, msg: 'Ular Sanca: Melilit Turun! 🐍' },
  { start: 49, end: 8, msg: 'Air Terjun Raksasa: Hanyut ke Dasar! 🌊' }
];

const traps = {
  11: { end: 2, msg: 'Jebakan Monyet Usil: Mundur ke awal! 🐒' },
  21: { type: 'pasir_hisap', msg: 'Terjebak Pasir Hisap! (3 Turn atau angka 6) 🏜️' },
  22: { type: 'pasir_hisap', msg: 'Terjebak Pasir Hisap! (3 Turn atau angka 6) 🏜️' },
  41: { type: 'jaring_laba_laba', msg: 'Terjerat Jaring Laba-laba! (3 Turn atau angka 6) 🕸️' }
};

const chanceTiles = [10, 20, 25, 42, 70, 80, 91, 96];

const cardDeck = [
  { id: 'imun', name: 'Imun Rintangan', type: 'Persistent', img: 'imun-terhadap-semua-rintangan.png', desc: 'Lindungi diri dari jebakan pasir/jaring.' },
  { id: 'pertahanan', name: 'Pertahanan', type: 'Persistent', img: 'kartu-pertahanan-terhadap-semua-serangan.png', desc: 'Tahan serangan mundur dari lawan.' },
  { id: 'serangan', name: 'Serangan Kurangi', type: 'Persistent', img: 'kartu-serangan-pilih-lawan-untuk-mundur-3-langkah.png', desc: 'Pilih lawan untuk mundur 3 langkah.' },
  { id: 'save_jaring', name: 'Penyelamatan Jaring', type: 'Persistent', img: 'penyelamatan-keluar-dari-jaring-laba-laba.png', desc: 'Langsung keluar dari jaring laba-laba.' },
  { id: 'save_pasir', name: 'Penyelamatan Pasir', type: 'Persistent', img: 'penyelamatan-keluar-dari-pasir-hisap.png', desc: 'Langsung keluar dari pasir hisap.' },
  { id: 'maju_1', name: 'Maju 1 Langkah', type: 'Instant', img: 'jalan-maju-1-langkah.png', action: (p) => p.position++ },
  { id: 'maju_2', name: 'Maju 2 Langkah', type: 'Instant', img: 'jalan-maju-2-langkah.png', action: (p) => p.position += 2 },
  { id: 'mundur_1', name: 'Mundur 1 Langkah', type: 'Instant', img: 'jalan-mundur-1-langkah.png', action: (p) => p.position-- },
  { id: 'lewati', name: 'Lewati Giliran', type: 'Instant', img: 'lewati-jalan-giliran-dadu-berikan-giliran-ke-lawan.png', action: () => {} }, // Logic handled in drawing
  { id: 'extra', name: 'Putar Lagi', type: 'Instant', img: 'putar-dadu-2-kali.png', action: () => {} } // Logic handled in drawing
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

// --- CARD & TRAP STATE ---
const showCardModal = ref(false);
const drawnCard = ref(null);
const showInventory = ref(false);
const inventoryPlayerIndex = ref(0);
const extraRoll = ref(false);

const openInventory = (pIdx) => {
  inventoryPlayerIndex.value = pIdx;
  showInventory.value = true;
};

// --- ROLL METER STATE ---
const meterValue = ref(0);
const meterDirection = ref(1); // 1 = right, -1 = left
const isHolding = ref(false);
const holdTimeRemaining = ref(null);
let meterInterval = null;
let holdTimerId = null;

const startMeterSwing = () => {
  if (meterInterval) return;
  meterValue.value = 0;
  meterDirection.value = 1;
  meterInterval = setInterval(() => {
    if (!isHolding.value) return;
    meterValue.value += meterDirection.value * 2.5; 
    if (meterValue.value >= 100) { meterValue.value = 100; meterDirection.value = -1; }
    if (meterValue.value <= 0) { meterValue.value = 0; meterDirection.value = 1; }
  }, 16);
};

const stopMeterSwing = () => {
  clearInterval(meterInterval);
  meterInterval = null;
  // Note: We don't reset meterValue here so handleRelease can read it
};

const handlePress = () => {
  if (isRolling.value || isMoving.value || !!winner.value || isBotTurn.value) return;
  isHolding.value = true;
  holdTimeRemaining.value = 5000;
  startMeterSwing();
  
  holdTimerId = setInterval(() => {
    holdTimeRemaining.value -= 100;
    if (holdTimeRemaining.value <= 0) {
      handleRelease(); // Auto release
    }
  }, 100);
};

const handleRelease = () => {
  if (!isHolding.value) return;
  isHolding.value = false;
  clearInterval(holdTimerId);
  holdTimerId = null;
  holdTimeRemaining.value = null;
  stopMeterSwing();
  
  // Calculate based on meter position with probabilities
  let result;
  if (meterValue.value <= 50) {
    // LOW RANGE: Likely 1, 2, 3
    const pool = [1, 1, 1, 2, 2, 2, 3, 3, 4, 5, 6];
    result = pool[Math.floor(Math.random() * pool.length)];
  } else {
    // HIGH RANGE: Likely 4, 5, 6
    const pool = [1, 2, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6];
    result = pool[Math.floor(Math.random() * pool.length)];
  }
  
  rollDice(result);
  
  // Reset meter after small delay
  setTimeout(() => { meterValue.value = 0; }, 1000);
};

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
    // Tighter alignment: slight offset but keep inside tile
    const offset = 10; 
    const angle = (idxInCell / playersInCell.length) * 2 * Math.PI;
    transform = `translate(${Math.cos(angle) * offset}px, ${Math.sin(angle) * offset}px) scale(0.9)`;
  }
  return { left: coords.left + '%', top: coords.top + '%', transform };
};

const diceRotationStyle = ref({ transform: 'rotateX(0deg) rotateY(0deg)' });

const rollDice = (forcedResult = null) => {
  if (isRolling.value || isMoving.value || winner.value !== null || showCardModal.value) return;
  
  const p = players.value[currentPlayerIndex.value];
  
  // Trap Check
  if (p.trappedTurns > 0) {
    message.value = `${p.trapType === 'pasir' ? 'PASIR HISAP' : 'JARING LABA-LABA'}: BUTUH ANGKA 6 UNTUK KELUAR! (${p.trappedTurns} Turn Tersisa)`;
  } else {
    message.value = 'SUMMONING FATE...';
  }

  isRolling.value = true;
  diceResult.value = null;
  
  const result = forcedResult || (Math.floor(Math.random() * 6) + 1);
  const targets = {
    1: { x: 0, y: 0 }, 2: { x: 0, y: -90 },
    3: { x: -90, y: 0 }, 4: { x: 90, y: 0 },
    5: { x: 0, y: 90 }, 6: { x: 180, y: 0 }
  };

  setTimeout(() => {
    isRolling.value = false;
    diceResult.value = result;
    diceRotationStyle.value = { transform: `rotateX(${targets[result].x}deg) rotateY(${targets[result].y}deg)` };
    
    setTimeout(async () => {
       // Escape Logic
       if (p.trappedTurns > 0) {
         if (result === 6) {
           p.trappedTurns = 0;
           p.trapType = null;
           message.value = 'BERHASIL KELUAR! JALAN 6 LANGKAH!';
           setTimeout(() => movePlayer(result), 800);
         } else {
           p.trappedTurns--;
           message.value = `GAGAL KELUAR! (${p.trappedTurns} Turn Tersisa)`;
           setTimeout(() => {
             currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length;
             message.value = '';
           }, 1500);
         }
       } else {
         message.value = `${result} STEPS!`;
         setTimeout(() => movePlayer(result), 350);
       }
    }, 600);
  }, 1600);
};

onMounted(attemptLockOrientation);
onUnmounted(stopMeterSwing);

const drawCard = () => {
  const p = players.value[currentPlayerIndex.value];
  const card = cardDeck[Math.floor(Math.random() * cardDeck.length)];
  drawnCard.value = card;
  showCardModal.value = true;
  
  if (card.type === 'Instant') {
    if (card.id === 'extra') {
      extraRoll.value = true;
    } 
    // Auto close instant cards
    setTimeout(closeCardModal, 2200);
  } else {
    // Persistent
    p.inventory.push(card);
  }
};

const closeCardModal = () => {
  const card = drawnCard.value;
  const p = players.value[currentPlayerIndex.value];
  
  if (card && card.type === 'Instant') {
    if (card.action) card.action(p);
    if (card.id === 'maju_1' || card.id === 'maju_2' || card.id === 'mundur_1') {
       // We might need to trigger movePlayer logic if they jump tiles.
       // However, for single-step jumps we can just set the position.
    }
  }

  showCardModal.value = false;
  drawnCard.value = null;
};

const debugTargetTile = ref(null);
const debugJumpToTile = () => {
  if (debugTargetTile.value >= 1 && debugTargetTile.value <= 100) {
    players.value[currentPlayerIndex.value].position = parseInt(debugTargetTile.value);
    debugTargetTile.value = null;
  }
};

const movePlayer = async (steps) => {
  isMoving.value = true;
  const p = players.value[currentPlayerIndex.value];
  
  let goingReverse = false;
  
  // Standard Step-by-Step Hopping with Bounce Back logic
  for (let i = 0; i < steps; i++) {
    isHopping.value = true;
    
    if (!goingReverse) {
      if (p.position < 100) {
        p.position++;
      } else {
        goingReverse = true;
        p.position--; // Bounce back after hitting 100
      }
    } else {
      p.position--; 
    }
    
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

  // Handle Snakes/Ladders / Traps / Chance
  let continueChecking = true;
  while (continueChecking) {
    continueChecking = false;
    
    // 1. Ladder/Snake
    const snake = snakes.find(s => s.start === p.position);
    const ladder = ladders.find(l => l.start === p.position);

    if (snake) {
      // Check for Imun card first
      const imunIdx = p.inventory.findIndex(c => c.id === 'imun');
      if (imunIdx !== -1) {
        message.value = 'MENGGUNAKAN IMUN: ULAR DIABAIKAN! 🛡️';
        p.inventory.splice(imunIdx, 1);
        await new Promise(r => setTimeout(r, 1500));
        continueChecking = false;
        continue;
      }
      
      message.value = snake.msg;
      await new Promise(r => setTimeout(r, 900));
      isSpecialMoving.value = true;
      p.position = snake.end;
      await new Promise(r => setTimeout(r, 900));
      isSpecialMoving.value = false;
      continueChecking = true;
      continue;
    }

    if (ladder) {
      message.value = ladder.msg;
      await new Promise(r => setTimeout(r, 900));
      isSpecialMoving.value = true;
      p.position = ladder.end;
      await new Promise(r => setTimeout(r, 900));
      isSpecialMoving.value = false;
      continueChecking = true;
      continue;
    }

    // 2. Traps
    const trap = traps[p.position];
    if (trap) {
      // Check for Imun card first
      const imunIdx = p.inventory.findIndex(c => c.id === 'imun');
      if (imunIdx !== -1) {
        message.value = 'MENGGUNAKAN IMUN: JEBAKAN DIABAIKAN! 🛡️';
        p.inventory.splice(imunIdx, 1);
        await new Promise(r => setTimeout(r, 1500));
        continueChecking = false;
        continue;
      }

      if (trap.type === 'pasir_hisap' || trap.type === 'jaring_laba_laba') {
         p.trappedTurns = 3;
         p.trapType = trap.type === 'pasir_hisap' ? 'pasir' : 'laba';
         message.value = trap.msg;
         await new Promise(r => setTimeout(r, 1500));
      } else {
         // Monkey Trap (Immediate recoil)
         message.value = trap.msg;
         await new Promise(r => setTimeout(r, 1000));
         isSpecialMoving.value = true;
         p.position = trap.end;
         await new Promise(r => setTimeout(r, 1000));
         isSpecialMoving.value = false;
         continueChecking = true;
         continue;
      }
    }

    // 3. Chance Card
    if (chanceTiles.includes(p.position)) {
       message.value = 'KARTU KESEMPATAN! 🃏';
       await new Promise(r => setTimeout(r, 1000));
       drawCard();
       isMoving.value = false;
       return; // drawCard will handle ending turn or extra roll
    }
  }

  isMoving.value = false;
  if (extraRoll.value) {
    extraRoll.value = false;
    message.value = 'BONUS TURN! ROLL AGAIN!';
  } else {
    currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length;
    message.value = '';
  }
};

const useInventoryCard = (cIdx) => {
  const pIdx = inventoryPlayerIndex.value;
  const p = players.value[pIdx];
  const card = p.inventory[cIdx];
  
  if (isMoving.value || isRolling.value) return;
  if (currentPlayerIndex.value !== pIdx) {
    message.value = 'HANYA DAPAT DIGUNAKAN SAAT GILIRAN ANDA!';
    setTimeout(() => message.value = '', 2000);
    return;
  }

  if (card.id === 'save_jaring' && p.trapType === 'laba') {
    p.trappedTurns = 0;
    p.trapType = null;
    message.value = 'KARTU PENYELAMATAN DIGUNAKAN!';
    p.inventory.splice(cIdx, 1);
  } else if (card.id === 'save_pasir' && p.trapType === 'pasir') {
    p.trappedTurns = 0;
    p.trapType = null;
    message.value = 'KARTU PENYELAMATAN DIGUNAKAN!';
    p.inventory.splice(cIdx, 1);
  } else if (card.id === 'serangan') {
    // Basic target: find an opponent that is not the current player
    const targetIdx = players.value.findIndex((pl, idx) => idx !== currentPlayerIndex.value && pl.position > 1);
    if (targetIdx !== -1) {
       const target = players.value[targetIdx];
       // Check if target has 'pertahanan'
       const defIdx = target.inventory.findIndex(c => c.id === 'pertahanan');
       if (defIdx !== -1) {
         message.value = `P${targetIdx + 1} MENGGUNAKAN PERTAHANAN!`;
         target.inventory.splice(defIdx, 1);
       } else {
         message.value = `SERANGAN KE P${targetIdx + 1}! MUNDUR 3 LANGKAH!`;
         target.position = Math.max(1, target.position - 3);
       }
       p.inventory.splice(cIdx, 1);
    } else {
       message.value = 'TIDAK ADA TARGET UNTUK DISERANG!';
    }
  } else if (card.id === 'imun') {
    message.value = 'KARTU IMUN ADALAH PASIF!';
  } else {
    message.value = 'KARTU INI TIDAK BISA DIGUNAKAN SEKARANG!';
  }
  
  setTimeout(() => message.value = '', 2000);
};

const selectPlayers = (n) => { playerCount.value = n; resetGame(); };
const resetGame = () => {
  players.value = Array.from({ length: playerCount.value === 1 ? 2 : playerCount.value }, (v, i) => ({ 
    id: i,
    position: 1,
    inventory: [],
    trappedTurns: 0, // > 0 means stuck
    trapType: null // 'pasir' or 'laba'
  }));
  currentPlayerIndex.value = 0;
  winner.value = null;
  message.value = 'READY? QUEST!';
  diceRotationStyle.value = { transform: 'rotateX(0deg) rotateY(0deg)' };
  showInventory.value = false;
  extraRoll.value = false;
};
const resetToSetup = () => {
  if (playerCount.value === null) {
    router.push('/mini-games/snake-and-ladders');
  } else {
    playerCount.value = null;
    winner.value = null;
  }
};

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

/* REFINED ORGANIC MONOPOLY HOP: Smoother weighted arc with secondary motion */
@keyframes monopolyHop {
  0% { transform: translateY(0) scale(1.1, 0.9) rotate(0deg); }
  25% { transform: translateY(-30px) scale(0.9, 1.4) rotate(8deg); }
  50% { transform: translateY(-45px) scale(1.0, 1.2) rotate(0deg); }
  75% { transform: translateY(-30px) scale(0.9, 1.4) rotate(-8deg); }
  100% { transform: translateY(0) scale(1.1, 0.85) rotate(0deg); }
}
.animate-monopoly-hop { 
  animation: monopolyHop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
  transform-origin: bottom bottom;
}

/* SPECIAL QUEST JUMP: A weighted high-arc glide */
@keyframes questJump {
  0% { transform: translateY(0) scale(1.2, 0.8) rotate(0deg); }
  50% { transform: translateY(-70px) scale(0.7, 1.5) rotate(15deg); }
  100% { transform: translateY(0) scale(1.2, 0.8) rotate(0deg); }
}
.animate-quest-jump { animation: questJump 0.9s cubic-bezier(0.22, 1, 0.36, 1); }

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
@keyframes cardAppear {
  0% { transform: scale(0.5) translateY(100px) rotate(-20deg); opacity: 0; }
  100% { transform: scale(1) translateY(0) rotate(0deg); opacity: 1; }
}
.animate-card-appear { animation: cardAppear 0.8s cubic-bezier(0.34, 1.56, 0.64, 1); }
.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #f59e0b; border-radius: 10px; }
.fade-blur-enter-active, .fade-blur-leave-active { transition: all 1s cubic-bezier(0.4, 0, 0.2, 1); }
.fade-blur-enter-from, .fade-blur-leave-to { opacity: 0; filter: blur(40px); }
.victory-pop-enter-active { animation: splash 1s cubic-bezier(0.34, 1.56, 0.64, 1); }
.player-token-container { 
  width: 10%; 
  height: 10%; 
  display: flex; 
  align-items: center; 
  justify-content: center; 
  z-index: 50; 
  pointer-events: none; 
}
.player-transition-standard { transition-timing-function: linear !important; }
.player-transition-smooth { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }
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
