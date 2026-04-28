<template>
  <div
    class="fixed inset-0 w-full h-[100dvh] min-h-[100svh] bg-[#0c1a1a] text-white flex flex-col items-center justify-center overflow-hidden font-sans select-none"
    :class="playerCount ? 'pt-0' : 'pt-14 lg:pt-20'"
  >
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

    <!-- 2. SETUP LOBBY -->
    <Transition name="fade-blur">
      <div v-if="!playerCount" class="absolute inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        <div class="realm-hub-content max-w-md sm:max-w-lg lg:max-w-2xl w-full text-center animate-in fade-in zoom-in duration-1000 relative">
          <div class="absolute -top-14 sm:-top-16 left-1/2 -translate-x-1/2 flex gap-2 sm:gap-4 pointer-events-none">
             <img v-for="n in 4" :key="'setup-p-'+n" :src="`/snake-and-ladders/p${n}.webp`" 
                  class="realm-hub-card-player w-8 sm:w-10 h-auto max-h-[min(14vh,4.5rem)] sm:max-h-[min(16vh,5.5rem)] object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,1)] animate-totem-float" 
                  :style="{ animationDelay: (n-1)*0.8 + 's' }" />
          </div>
          
          <div class="realm-hub-hero-wrap mb-6 sm:mb-8 lg:mb-10 relative">
             <h2 class="realm-hub-title text-3xl sm:text-4xl lg:text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/20 uppercase drop-shadow-[0_20px_40px_rgba(0,0,0,1)] leading-[0.85] mb-3 sm:mb-4 animate-pulse-slow">
               TROPICAL<br/>QUEST
             </h2>
             <div class="realm-hub-subline flex items-center justify-center gap-3">
               <div class="h-[1px] w-12 bg-gradient-to-r from-transparent to-amber-500"></div>
               <p class="text-amber-500 text-[10px] sm:text-xs lg:text-base font-black uppercase tracking-[0.4em] italic drop-shadow-lg">ADVENTURE</p>
               <div class="h-[1px] w-12 bg-gradient-to-l from-transparent to-amber-500"></div>
             </div>
          </div>

          <div class="realm-hub-grid grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-2.5 lg:gap-3 max-w-md sm:max-w-lg lg:max-w-2xl mx-auto px-1 sm:px-2">
            <button v-for="n in 4" :key="'select-'+n" @click="selectPlayers(n)" 
                    class="realm-hub-card group relative w-full min-h-[11rem] sm:min-h-0 aspect-[3/4] p-0.5 sm:p-1 bg-gradient-to-br from-white/20 to-transparent rounded-2xl sm:rounded-[1.75rem] lg:rounded-[2.5rem] transition-all transform hover:-translate-y-2 sm:hover:-translate-y-3 hover:scale-[1.02] active:scale-95 shadow-2xl overflow-visible ring-2 sm:ring-4 ring-black/20">
              <div class="h-full min-h-0 w-full bg-black/60 backdrop-blur-2xl rounded-xl sm:rounded-2xl lg:rounded-3xl flex flex-col items-center justify-between gap-1 p-3 sm:p-3.5 lg:p-4 border border-white/5 group-hover:bg-amber-500/20 transition-all duration-700">
                <div class="realm-hub-card-figure flex -space-x-2 sm:-space-x-3 lg:-space-x-4 mb-1 sm:mb-2 relative drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] shrink-0">
                  <img v-for="i in Math.min(n, 3)" :key="'icon-'+i" :src="`/snake-and-ladders/p${i}.webp`" 
                       class="realm-hub-card-player w-7 h-10 sm:w-8 sm:h-11 lg:w-9 lg:h-12 object-contain group-hover:rotate-6 transition-all duration-500" />
                  <div v-if="n === 4" class="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 bg-amber-500 border-2 border-[#0c1a1a] rounded-full flex items-center justify-center font-black text-black text-[7px] sm:text-[8px] absolute -right-4 sm:-right-5 lg:-right-5 bottom-0 shadow-xl">+1</div>
                </div>
                <div class="text-center min-w-0">
                  <h3 class="text-lg sm:text-xl lg:text-2xl font-black text-white uppercase italic tracking-tighter leading-none mb-0.5">{{ n }}</h3>
                  <p class="text-[7px] sm:text-[8px] lg:text-[9px] text-amber-500 font-black uppercase tracking-[0.25em] opacity-60">{{ n === 1 ? 'SOLO RUN' : 'TEAM' }}</p>
                </div>
                <div class="realm-hub-card-cta w-full bg-amber-500/10 border border-amber-500/40 text-amber-500 py-1.5 sm:py-2 lg:py-2 rounded-xl sm:rounded-2xl text-[8px] sm:text-[9px] font-black italic uppercase tracking-widest group-hover:bg-amber-500 group-hover:text-black transition-all shadow-lg shrink-0">START</div>
              </div>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 3. MAIN GAMEPLAY (Ultra-Responsive Landscape Layout) -->
    <div
      v-if="playerCount"
      class="iq-play-root absolute inset-0 z-10 flex flex-row items-stretch justify-between gap-1 overflow-hidden min-h-0 p-1 sm:p-2 lg:p-4"
    >
      
      <!-- SCOREBOARD (Responsive Width) -->
      <div class="iq-score-col hidden sm:flex flex-col gap-1.5 lg:gap-2.5 self-center w-[132px] lg:w-[188px] transition-all duration-1000 shrink-0">
         <div v-for="(p, i) in players" :key="'p-stat-'+i" 
              :class="['flex items-center gap-1.5 lg:gap-2.5 px-2 lg:px-3 py-1.5 lg:py-2 rounded-xl lg:rounded-2xl border transition-all duration-700 relative overflow-hidden group', 
                       currentPlayerIndex === i ? 'bg-amber-500 border-white shadow-2xl translate-x-2' : 'bg-black/60 border-white/5 opacity-40 scale-90 -translate-x-2']">
           <div v-if="currentPlayerIndex === i" class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-sweep -skew-x-12"></div>
           <div class="iq-stat-avatar relative h-7 lg:h-10 w-5 lg:w-8 shrink-0">
             <img :src="`/snake-and-ladders/p${i + 1}.webp`" class="w-full h-full object-contain relative transition-transform duration-500" />
           </div>
           <div class="flex-grow text-left relative min-w-0">
             <div class="flex items-center justify-between mb-0.5">
               <p :class="['iq-stat-label text-[5px] lg:text-[7px] font-black uppercase tracking-widest italic', currentPlayerIndex === i ? 'text-black/60' : 'text-amber-500/60']">P{{ i+1 }}</p>
               <button @click.stop="openInventory(i)" class="relative group/bag active:scale-75">
                  <span class="iq-stat-bag text-xs lg:text-sm">🎒</span>
                  <div v-if="p.inventory.length > 0" class="absolute -top-1 -right-1 w-2 lg:w-3 h-2 lg:h-3 bg-red-600 rounded-full text-[5px] lg:text-[6px] flex items-center justify-center font-black border border-white">
                    {{ p.inventory.length }}
                  </div>
               </button>
             </div>
             <span :class="['iq-stat-pos text-base lg:text-2xl font-black italic tracking-tighter leading-none', currentPlayerIndex === i ? 'text-black' : 'text-white']">#{{ p.position }}</span>
           </div>
         </div>
      </div>

      <!-- BOARD STAGE (Responsive Scaling) -->
      <div class="iq-board-stage flex-grow h-full min-h-0 flex flex-col items-center justify-center relative p-0.5 sm:p-1 lg:p-2 overflow-hidden">
        <Transition name="splash">
           <div v-if="message" class="absolute top-2 lg:top-8 z-[60] pointer-events-none w-full flex justify-center px-4">
              <div class="bg-amber-500 text-black px-3 sm:px-6 lg:px-8 py-1.5 sm:py-2 lg:py-3 rounded-lg lg:rounded-2xl font-black text-[10px] sm:text-xs lg:text-xl uppercase italic shadow-2xl border-2 lg:border-4 border-white animate-splash-pop transform -rotate-2">
                {{ message }}
              </div>
           </div>
        </Transition>

        <div class="relative w-full h-full min-h-0 flex items-center justify-center group/board perspective-2000 overflow-hidden">
          <div
            class="iq-board-surface relative h-full max-h-full w-auto max-w-full aspect-[1730/1677] bg-[#1a0f0a] rounded-lg lg:rounded-xl shadow-[0_24px_48px_rgba(0,0,0,0.75)] overflow-hidden border-2 lg:border-[5px] border-[#2b1d0e] shadow-inner will-change-transform transition-transform duration-500 ease-out"
            :style="boardFocusStyle"
          >
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
                        isHopping && currentPlayerIndex === pIdx ? 'duration-[480ms] player-transition-hop' : 'duration-500 player-transition-smooth'
                      ]"
                      :style="getPlayerGlobalStyle(pIdx)">
                   <div class="relative flex items-end justify-center w-full h-full pb-[3%] translate-z-0">
                      <img :src="`/snake-and-ladders/p${pIdx + 1}.webp`" 
                           class="h-[50%] lg:h-[58%] max-h-[82%] w-auto origin-bottom drop-shadow-[8px_8px_16px_rgba(0,0,0,0.75)] object-contain object-bottom transition-transform duration-500 translate-z-0"
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
      <div class="iq-control-col w-[140px] lg:w-[200px] flex flex-col items-center gap-1.5 self-center p-1 lg:p-0 transition-all duration-1000 shrink-0">
         <div class="iq-control-panel w-full bg-black/85 backdrop-blur-[30px] border-2 lg:border-[3px] border-white/10 p-2 lg:p-4 rounded-xl lg:rounded-3xl shadow-2xl relative overflow-hidden group/controls transition-all duration-700">
            <div class="hidden lg:flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
               <div class="relative h-8 w-6 bg-white/5 rounded-lg p-0.5 border border-white/10">
                  <img :src="`/snake-and-ladders/p${currentPlayerIndex + 1}.webp`" class="w-full h-full object-contain relative z-10 animate-bob shadow-2xl" />
               </div>
               <p class="text-amber-500 text-[8px] font-black uppercase italic tracking-[0.2em] mb-0 opacity-60">Turn</p>
            </div>
 
            <div class="flex flex-col items-center justify-between gap-1 lg:gap-3 relative z-10 w-full">
               <div class="iq-dice-wrap relative w-10 h-10 lg:w-24 lg:h-24 perspective-2000 active:scale-95 transition-transform duration-500">
                  <div v-if="!isRolling && !isMoving" class="absolute inset-[-8px] lg:inset-[-20px] bg-amber-500/10 blur-[12px] lg:blur-[28px] rounded-full animate-pulse-slow"></div>
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
                          <span class="text-lg lg:text-4xl font-black text-white drop-shadow-[0_0_15px_rgba(0,0,0,1)] italic">{{ diceResult }}</span>
                        </div>
                     </Transition>
                  </div>
               </div>
 
                <button 
                   type="button"
                   @click="handleRollClick"
                   :disabled="isRolling || isMoving || !!winner"
                   class="iq-roll-btn group relative w-full h-9 lg:h-16 bg-transparent disabled:opacity-20 transition-all transform active:scale-95 shadow-xl select-none touch-none">
                   <div class="absolute inset-0 bg-gradient-to-b from-amber-500 to-amber-700 rounded-lg lg:rounded-2xl shadow-[0_3px_0_#92400e] lg:shadow-[0_5px_0_#92400e] group-hover:from-amber-400 group-hover:to-amber-600 transition-all duration-300"></div>
                   <div class="relative h-full flex flex-col items-center justify-center text-white">
                     <span class="text-[7px] lg:text-sm font-black uppercase italic tracking-tighter drop-shadow-2xl leading-none">
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

    <!-- 6. INDIVIDUAL INVENTORY OVERLAY (MODAL) -->
    <Transition name="fade-blur">
       <div v-if="showInventory" class="fixed inset-0 z-[500] flex items-center justify-center bg-black/60 backdrop-blur-xl p-3 sm:p-4">
          <div class="w-full max-w-[300px] sm:max-w-[320px] bg-black/90 rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-white/10 shadow-2xl relative">
             <div class="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
                <div class="flex items-center gap-2 min-w-0">
                   <div class="w-8 h-8 sm:w-9 sm:h-9 bg-amber-500/20 rounded-lg flex items-center justify-center shrink-0">
                      <img :src="`/snake-and-ladders/p${inventoryPlayerIndex + 1}.webp`" class="h-6 sm:h-7 object-contain" />
                   </div>
                   <p class="text-amber-500 font-black italic tracking-widest uppercase text-[10px] sm:text-xs truncate">P{{ inventoryPlayerIndex + 1 }} Pack</p>
                </div>
                <button @click="showInventory = false" class="w-7 h-7 flex items-center justify-center bg-white/5 rounded-full text-white/40 hover:text-white transition-colors text-sm shrink-0">✕</button>
             </div>
             
             <div v-if="players[inventoryPlayerIndex]?.inventory.length === 0" class="py-8 text-center bg-white/5 rounded-xl sm:rounded-2xl border border-dashed border-white/10">
                <p class="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">No items found</p>
             </div>
             
             <div class="grid grid-cols-3 gap-2 sm:gap-3 max-h-[260px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                <div v-for="(card, cIdx) in players[inventoryPlayerIndex]?.inventory || []" :key="'inv-'+cIdx" 
                     @click="onInventoryCardClick(cIdx)"
                     class="group relative aspect-[3/4] bg-white/5 rounded-xl overflow-hidden border border-white/10 hover:border-amber-500 translate-z-0 transition-all cursor-pointer">
                   <img :src="`/snake-and-ladders/card-jugle/${card.img}`" class="w-full h-full object-contain opacity-80 group-hover:opacity-100 transition-opacity" />
                   <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
             </div>
             
             <p class="mt-4 text-[8px] text-white/40 italic text-center uppercase tracking-widest">Select an item to use during your turn</p>
          </div>
       </div>
    </Transition>

    <!-- 7. CARD MODAL (REDUCED SIZE) -->
    <Transition name="victory-pop">
       <div v-if="showCardModal" class="iq-modal-draw-card fixed inset-0 z-[400] flex items-center justify-center bg-black/80 backdrop-blur-xl p-3 sm:p-4">
          <div class="iq-modal-draw-card-panel max-w-[260px] sm:max-w-[300px] lg:max-w-[320px] w-full bg-[#1a110d] rounded-2xl sm:rounded-3xl border-2 lg:border-[3px] border-amber-900 shadow-[0_0_60px_rgba(0,0,0,1)] p-4 sm:p-5 lg:p-6 text-center animate-card-appear relative overflow-hidden">
             <div class="absolute inset-0 opacity-10 bg-[radial-gradient(circle,white_1px,transparent_1px)] bg-[size:16px_16px]"></div>
             
             <div class="relative z-10">
                <p class="iq-modal-draw-card-label text-amber-500 font-black italic tracking-[0.35em] uppercase text-[7px] sm:text-[8px] mb-2">You Discovered</p>
                <div class="iq-modal-draw-card-visual aspect-[3/4] max-w-[120px] sm:max-w-[140px] lg:max-w-[160px] mx-auto rounded-lg sm:rounded-xl overflow-hidden border-2 sm:border-[3px] border-white shadow-xl mb-3 sm:mb-4 transform -rotate-2 animate-victory-float">
                   <img :src="`/snake-and-ladders/card-jugle/${drawnCard.img}`" class="w-full h-full object-contain" alt="" />
                </div>
                <h2 class="iq-modal-draw-card-title text-base sm:text-lg lg:text-xl font-black text-white italic uppercase tracking-tighter mb-1">{{ drawnCard.name }}</h2>
                <p class="iq-modal-draw-card-desc text-white/60 text-[8px] sm:text-[9px] mb-4 sm:mb-5 font-medium leading-relaxed">{{ drawnCard.desc }}</p>
                
                <button v-if="drawnCard.type === 'Persistent'" @click="closeCardModal" class="iq-modal-draw-card-btn w-full bg-amber-500 text-black py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-black text-sm sm:text-base italic uppercase tracking-tighter shadow-[0_4px_0_#b45309] active:translate-y-1 active:shadow-none transition-all">
                   EQUIP PACK
                </button>
                <div v-else class="iq-modal-draw-card-auto text-amber-500 text-[9px] font-black italic uppercase tracking-widest animate-pulse">Activating automatically...</div>
             </div>
          </div>
       </div>
    </Transition>

    <!-- 7b. JEBAKAN + IMUN (pilihan) -->
    <Transition name="fade-blur">
      <div v-if="pendingImunOffer" class="fixed inset-0 z-[440] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
        <div class="max-w-sm w-full bg-[#1a110d] rounded-2xl border-2 border-amber-800 p-5 text-center shadow-2xl">
          <p class="text-amber-500 font-black text-[10px] uppercase tracking-widest mb-2">Jebakan!</p>
          <p class="text-white/90 text-sm font-bold mb-1">Kamu punya <span class="text-amber-400">Imun</span> di tas.</p>
          <p class="text-white/50 text-[10px] mb-5 leading-relaxed">Buka tas dan pakai Imun untuk menolak efek jebakan, atau terima jebakan.</p>
          <div class="flex flex-col gap-2">
            <button type="button" @click="openInventory(pendingImunOffer.playerIndex)" class="w-full py-3 rounded-xl bg-amber-500 text-black font-black text-xs uppercase tracking-tighter shadow-[0_4px_0_#b45309] active:translate-y-0.5">Buka tas (pakai Imun)</button>
            <button type="button" @click="confirmTrapAcceptJebakan" class="w-full py-2.5 rounded-xl bg-white/10 text-white/80 font-black text-[10px] uppercase tracking-widest border border-white/10 hover:bg-white/15">Terima jebakan</button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 7c. SERANGAN — pilih lawan -->
    <Transition name="fade-blur">
      <div v-if="showSeranganModal" class="fixed inset-0 z-[480] flex items-center justify-center bg-black/75 backdrop-blur-xl p-4">
        <div class="max-w-sm w-full bg-[#1a110d] rounded-2xl border-2 border-red-900/60 p-5 shadow-2xl">
          <div class="flex items-center justify-between mb-4">
            <p class="text-red-400 font-black text-xs uppercase tracking-widest">Serangan</p>
            <button type="button" class="text-white/40 hover:text-white text-lg leading-none px-2" @click="closeSeranganModal" aria-label="Tutup">✕</button>
          </div>
          <p class="text-white/60 text-[10px] mb-4 text-center">Pilih pemain yang ingin diserang (mundur 3 petak).</p>
          <div class="flex flex-col gap-2">
            <button
              v-for="idx in seranganTargetIndices"
              :key="'atk-'+idx"
              type="button"
              @click="executeSerangan(idx)"
              class="flex items-center gap-3 w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:border-amber-500/50 hover:bg-amber-500/10 transition-all text-left"
            >
              <img :src="`/snake-and-ladders/p${idx + 1}.webp`" class="h-10 w-8 object-contain shrink-0" alt="" />
              <span class="font-black text-white text-sm">P{{ idx + 1 }}</span>
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- 8. VICTORY OVERLAY -->
    <Transition name="victory-pop">
      <div v-if="winner !== null" class="iq-modal-victory fixed inset-0 z-[300] flex items-center justify-center bg-[#0c1a1a]/90 backdrop-blur-[60px] p-3 sm:p-4 lg:p-6">
        <div class="iq-modal-victory-panel max-w-[320px] sm:max-w-[360px] w-full text-center p-4 sm:p-6 lg:p-7 bg-[#1a110d] rounded-2xl sm:rounded-3xl border-2 sm:border-[3px] lg:border-4 border-amber-900 shadow-[0_0_48px_rgba(0,0,0,1)] relative overflow-hidden">
          <div class="relative z-10">
            <div class="iq-modal-victory-figure relative inline-block mb-3 sm:mb-5">
              <img :src="`/snake-and-ladders/p${winner + 1}.webp`" class="iq-modal-victory-img w-24 h-32 sm:w-28 sm:h-40 lg:w-36 lg:h-48 object-contain drop-shadow-[0_24px_40px_rgba(0,0,0,1)] animate-victory-float" alt="" />
            </div>
            <h2 class="iq-modal-victory-title text-xl sm:text-2xl lg:text-3xl font-black text-white mb-1.5 tracking-tighter uppercase italic leading-[0.85] drop-shadow-2xl">GRAND<br/>EXPLORER</h2>
            <h3 class="iq-modal-victory-sub text-sm sm:text-base lg:text-lg font-black text-amber-500 mb-5 sm:mb-6 lg:mb-8 uppercase tracking-[0.35em] italic drop-shadow-lg">PLAYER {{ winner + 1 }}</h3>
            <div class="iq-modal-victory-actions flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button @click="resetGame" class="iq-modal-victory-btn-primary flex-1 bg-amber-600 text-white py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-black text-sm sm:text-base shadow-[0_4px_0_#92400e] uppercase tracking-tighter italic active:-translate-y-1 transition-transform">PLAY AGAIN</button>
              <button @click="resetToSetup" class="iq-modal-victory-btn-exit flex-1 bg-white/5 text-white/40 py-2.5 sm:py-3 lg:py-4 rounded-lg sm:rounded-xl font-black text-[8px] sm:text-[9px] uppercase tracking-[0.35em] border border-white/5 active:bg-white/10 transition-all">EXIT</button>
            </div>
          </div>
        </div>
      </div>
    </Transition>

    <button
      v-if="playerCount && winner === null"
      type="button"
      class="fixed left-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-[350] flex h-11 w-11 items-center justify-center rounded-full border border-white/25 bg-black/55 text-lg shadow-lg backdrop-blur-md transition-transform active:scale-95 touch-manipulation"
      aria-label="Kembali ke pemilihan pemain"
      title="Menu"
      @click="resetToSetup"
    >
      🏠
    </button>

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
import { ref, computed, watch, onMounted, onUnmounted, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { hideAppHeaderForFullscreenGame } from '../appChrome.js';

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
  { id: 'imun', name: 'Imun Rintangan', type: 'Persistent', img: 'imun-terhadap-semua-rintangan.png', desc: 'Pakai dari tas saat jebakan mengancam (petak jebakan).' },
  { id: 'pertahanan', name: 'Pertahanan', type: 'Persistent', img: 'kartu-pertahanan-terhadap-semua-serangan.png', desc: 'Otomatis saat kamu diserang (tidak perlu diklik).' },
  { id: 'serangan', name: 'Serangan Kurangi', type: 'Persistent', img: 'kartu-serangan-pilih-lawan-untuk-mundur-3-langkah.png', desc: 'Giliranmu: pilih lawan untuk mundur 3 petak.' },
  { id: 'save_jaring', name: 'Penyelamatan Jaring', type: 'Persistent', img: 'penyelamatan-keluar-dari-jaring-laba-laba.png', desc: 'Hanya saat terjebak jaring laba-laba.' },
  { id: 'save_pasir', name: 'Penyelamatan Pasir', type: 'Persistent', img: 'penyelamatan-keluar-dari-pasir-hisap.png', desc: 'Hanya saat terjebak pasir hisap.' },
  { id: 'maju_1', name: 'Maju 1 Langkah', type: 'Instant', img: 'jalan-maju-1-langkah.png', desc: 'Maju 1 petak; giliran berganti.' },
  { id: 'maju_2', name: 'Maju 2 Langkah', type: 'Instant', img: 'jalan-maju-2-langkah.png', desc: 'Maju 2 petak; giliran berganti.' },
  { id: 'mundur_1', name: 'Mundur 1 Langkah', type: 'Instant', img: 'jalan-mundur-1-langkah.png', desc: 'Mundur 1 petak; giliran berganti.' },
  { id: 'lewati', name: 'Lewati Giliran', type: 'Instant', img: 'lewati-jalan-giliran-dadu-berikan-giliran-ke-lawan.png', desc: 'Giliranmu diberikan ke pemain berikutnya.' },
  { id: 'extra', name: 'Putar Lagi', type: 'Instant', img: 'putar-dadu-2-kali.png', desc: 'Lempar dadu sekali lagi di giliran ini.' }
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

/** Zoom papan ke baris (tile row) yang berisi cellId — sama dengan sumbu Y getCellCoords */
const boardFocus = reactive({
  scale: 1,
  originX: 50,
  originY: 50,
});

/** Sama breakpoint dengan /mini-games/snake-and-ladders (realm hub) */
const COMPACT_LANDSCAPE_MQ = '(orientation: landscape) and (max-height: 760px) and (max-width: 1279px)';
const isCompactLandscape = ref(false);
const syncCompactLandscape = () => {
  if (typeof window === 'undefined') return;
  isCompactLandscape.value = window.matchMedia(COMPACT_LANDSCAPE_MQ).matches;
};

const boardFocusStyle = computed(() => ({
  transform: `scale(${boardFocus.scale})`,
  transformOrigin: `${boardFocus.originX}% ${boardFocus.originY}%`,
}));

const rowCenterYPercent = (cellId) => {
  const id = Math.max(1, Math.min(100, cellId));
  const r = Math.floor((id - 1) / 10);
  return (9 - r) * 10 + 5;
};

const applyBoardFocus = (cellId) => {
  boardFocus.originY = rowCenterYPercent(cellId);
  boardFocus.originX = 50;
  /* Mobile/tablet landscape: zoom lebih kuat saat jalan agar baris tile lebih terbaca */
  boardFocus.scale = isCompactLandscape.value ? 1.72 : 1.32;
};

const clearBoardFocus = () => {
  boardFocus.scale = 1;
  boardFocus.originX = 50;
  boardFocus.originY = 50;
};

// --- CARD & TRAP STATE ---
const showCardModal = ref(false);
const drawnCard = ref(null);
const showInventory = ref(false);
const inventoryPlayerIndex = ref(0);
const extraRoll = ref(false);
const pendingImunOffer = ref(null); // { playerIndex, position, trap }
let trapImunResolve = null;
const showSeranganModal = ref(false);
const seranganInventoryCardIndex = ref(-1);

const isBotPlayer = (pIdx) => playerCount.value === 1 && pIdx === 1;

const seranganTargetIndices = computed(() => {
  if (!showSeranganModal.value) return [];
  const n = players.value.length;
  const cur = currentPlayerIndex.value;
  return [...Array(n).keys()].filter((i) => i !== cur);
});

const openInventory = (pIdx) => {
  inventoryPlayerIndex.value = pIdx;
  showInventory.value = true;
};

const handleRollClick = () => {
  if (
    isRolling.value ||
    isMoving.value ||
    winner.value !== null ||
    showCardModal.value ||
    isBotTurn.value ||
    pendingImunOffer.value ||
    showSeranganModal.value
  ) {
    return;
  }
  rollDice();
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
  if (
    isRolling.value ||
    isMoving.value ||
    winner.value !== null ||
    showCardModal.value ||
    pendingImunOffer.value ||
    showSeranganModal.value
  ) {
    return;
  }
  
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

onMounted(() => {
  attemptLockOrientation();
  syncCompactLandscape();
  if (typeof window === 'undefined') return;
  const mq = window.matchMedia(COMPACT_LANDSCAPE_MQ);
  const onMq = () => syncCompactLandscape();
  mq.addEventListener('change', onMq);
  window.addEventListener('resize', onMq);
  onUnmounted(() => {
    mq.removeEventListener('change', onMq);
    window.removeEventListener('resize', onMq);
  });
});

const drawCard = () => {
  const p = players.value[currentPlayerIndex.value];
  const card = cardDeck[Math.floor(Math.random() * cardDeck.length)];
  drawnCard.value = card;
  showCardModal.value = true;

  if (card.type === 'Instant') {
    if (card.id === 'extra') {
      extraRoll.value = true;
    }
    setTimeout(() => {
      void closeCardModal();
    }, 2200);
  } else {
    p.inventory.push(card);
  }
};

function applyForwardWithBounce(p, steps) {
  let goingReverse = false;
  for (let i = 0; i < steps; i++) {
    if (!goingReverse) {
      if (p.position < 100) {
        p.position++;
      } else {
        goingReverse = true;
        p.position--;
      }
    } else {
      p.position--;
    }
  }
}

function advanceToNextPlayer() {
  currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length;
  message.value = '';
}

function resolveTrapImun(outcome) {
  pendingImunOffer.value = null;
  const fn = trapImunResolve;
  trapImunResolve = null;
  fn?.(outcome);
}

async function applyTrapEffectFull(p, trap) {
  if (trap.type === 'pasir_hisap' || trap.type === 'jaring_laba_laba') {
    p.trappedTurns = 3;
    p.trapType = trap.type === 'pasir_hisap' ? 'pasir' : 'laba';
    message.value = trap.msg;
    await new Promise((r) => setTimeout(r, 1500));
    return 'trapped';
  }
  message.value = trap.msg;
  await new Promise((r) => setTimeout(r, 1000));
  isSpecialMoving.value = true;
  p.position = trap.end;
  applyBoardFocus(p.position);
  await new Promise((r) => setTimeout(r, 1000));
  isSpecialMoving.value = false;
  return 'monkey_moved';
}

const confirmTrapAcceptJebakan = async () => {
  const pend = pendingImunOffer.value;
  if (!pend) return;
  const p = players.value[pend.playerIndex];
  const trap = pend.trap;
  pendingImunOffer.value = null;
  const sub = await applyTrapEffectFull(p, trap);
  resolveTrapImun(sub === 'monkey_moved' ? 'applied_monkey' : 'applied_sticky');
};

async function resolveBoardAfterLanding(p) {
  let continueChecking = true;
  while (continueChecking) {
    continueChecking = false;

    if (p.position === 100) {
      winner.value = currentPlayerIndex.value;
      message.value = 'MISSION COMPLETE!';
      applyBoardFocus(100);
      setTimeout(() => clearBoardFocus(), 600);
      return 'done';
    }

    const snake = snakes.find((s) => s.start === p.position);
    const ladder = ladders.find((l) => l.start === p.position);

    if (snake) {
      message.value = snake.msg;
      await new Promise((r) => setTimeout(r, 900));
      isSpecialMoving.value = true;
      p.position = snake.end;
      applyBoardFocus(p.position);
      await new Promise((r) => setTimeout(r, 900));
      isSpecialMoving.value = false;
      continueChecking = true;
      continue;
    }

    if (ladder) {
      message.value = ladder.msg;
      await new Promise((r) => setTimeout(r, 900));
      isSpecialMoving.value = true;
      p.position = ladder.end;
      applyBoardFocus(p.position);
      await new Promise((r) => setTimeout(r, 900));
      isSpecialMoving.value = false;
      continueChecking = true;
      continue;
    }

    const trap = traps[p.position];
    if (trap) {
      const imunIdx = p.inventory.findIndex((c) => c.id === 'imun');
      const botHere = isBotPlayer(currentPlayerIndex.value);

      if (imunIdx !== -1 && !botHere) {
        pendingImunOffer.value = {
          playerIndex: currentPlayerIndex.value,
          position: p.position,
          trap
        };
        const outcome = await new Promise((resolve) => {
          trapImunResolve = resolve;
        });
        if (outcome === 'skipped') {
          break;
        }
        if (outcome === 'applied_monkey') {
          continueChecking = true;
          continue;
        }
        return 'done';
      }

      const sub = await applyTrapEffectFull(p, trap);
      if (sub === 'monkey_moved') {
        continueChecking = true;
        continue;
      }
      return 'done';
    }

    if (chanceTiles.includes(p.position)) {
      message.value = 'KARTU KESEMPATAN! 🃏';
      await new Promise((r) => setTimeout(r, 1000));
      drawCard();
      return 'card_drawn';
    }
  }
  return 'done';
}

const closeCardModal = async () => {
  const card = drawnCard.value;
  if (!card) return;
  const p = players.value[currentPlayerIndex.value];

  showCardModal.value = false;
  drawnCard.value = null;

  if (card.type === 'Persistent') {
    if (winner.value !== null) return;
    advanceToNextPlayer();
    return;
  }

  if (card.id === 'extra') {
    extraRoll.value = true;
    message.value = 'BONUS TURN! ROLL AGAIN!';
    return;
  }

  if (card.id === 'lewati') {
    advanceToNextPlayer();
    message.value = 'GILIRAN DILEWATKAN!';
    setTimeout(() => {
      message.value = '';
    }, 2000);
    return;
  }

  if (card.id === 'maju_1') {
    applyForwardWithBounce(p, 1);
  } else if (card.id === 'maju_2') {
    applyForwardWithBounce(p, 2);
  } else if (card.id === 'mundur_1') {
    p.position = Math.max(1, p.position - 1);
  } else {
    advanceToNextPlayer();
    return;
  }

  if (p.position === 100) {
    winner.value = currentPlayerIndex.value;
    message.value = 'MISSION COMPLETE!';
    applyBoardFocus(100);
    setTimeout(() => clearBoardFocus(), 600);
    return;
  }

  const sub = await resolveBoardAfterLanding(p);
  if (sub === 'card_drawn') return;
  if (winner.value !== null) return;

  advanceToNextPlayer();
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

    applyBoardFocus(p.position);
    
    await new Promise(r => setTimeout(r, 480));
    isHopping.value = false;
    await new Promise(r => setTimeout(r, 28)); 
  }
  
  if (p.position === 100) {
    winner.value = currentPlayerIndex.value;
    isMoving.value = false;
    applyBoardFocus(100);
    message.value = 'MISSION COMPLETE!';
    setTimeout(() => clearBoardFocus(), 600);
    return;
  }

  const sub = await resolveBoardAfterLanding(p);
  isMoving.value = false;
  clearBoardFocus();
  if (sub === 'card_drawn') return;

  if (extraRoll.value) {
    extraRoll.value = false;
    message.value = 'BONUS TURN! ROLL AGAIN!';
  } else {
    advanceToNextPlayer();
  }
};

const onInventoryCardClick = (cIdx) => {
  const pIdx = inventoryPlayerIndex.value;
  const card = players.value[pIdx]?.inventory[cIdx];
  if (!card) return;
  if (card.id === 'serangan') {
    openSeranganTarget(cIdx);
    return;
  }
  useInventoryCard(cIdx);
};

const openSeranganTarget = (cIdx) => {
  const pIdx = inventoryPlayerIndex.value;
  if (currentPlayerIndex.value !== pIdx) {
    message.value = 'HANYA DAPAT DIGUNAKAN SAAT GILIRAN ANDA!';
    setTimeout(() => {
      message.value = '';
    }, 2000);
    return;
  }
  const card = players.value[pIdx]?.inventory[cIdx];
  if (!card || card.id !== 'serangan') return;
  const others = players.value.filter((_, i) => i !== currentPlayerIndex.value);
  if (others.length === 0) {
    message.value = 'TIDAK ADA LAWAN!';
    setTimeout(() => {
      message.value = '';
    }, 2000);
    return;
  }
  seranganInventoryCardIndex.value = cIdx;
  showSeranganModal.value = true;
};

const closeSeranganModal = () => {
  showSeranganModal.value = false;
  seranganInventoryCardIndex.value = -1;
};

const executeSerangan = (targetIdx) => {
  const atkIdx = currentPlayerIndex.value;
  const p = players.value[atkIdx];
  const cIdx = seranganInventoryCardIndex.value;
  if (cIdx < 0 || !p?.inventory[cIdx] || p.inventory[cIdx].id !== 'serangan') {
    closeSeranganModal();
    return;
  }
  if (targetIdx === atkIdx) {
    closeSeranganModal();
    return;
  }
  const target = players.value[targetIdx];
  const defIdx = target.inventory.findIndex((c) => c.id === 'pertahanan');
  if (defIdx !== -1) {
    message.value = `P${targetIdx + 1} MENGGUNAKAN PERTAHANAN!`;
    target.inventory.splice(defIdx, 1);
  } else {
    message.value = `SERANGAN KE P${targetIdx + 1}! MUNDUR 3 LANGKAH!`;
    target.position = Math.max(1, target.position - 3);
  }
  p.inventory.splice(cIdx, 1);
  closeSeranganModal();
  showInventory.value = false;
  setTimeout(() => {
    message.value = '';
  }, 2200);
};

const useInventoryCard = (cIdx) => {
  const pIdx = inventoryPlayerIndex.value;
  const p = players.value[pIdx];
  const card = p.inventory[cIdx];

  if (isMoving.value || isRolling.value) return;
  if (currentPlayerIndex.value !== pIdx) {
    message.value = 'HANYA DAPAT DIGUNAKAN SAAT GILIRAN ANDA!';
    setTimeout(() => {
      message.value = '';
    }, 2000);
    return;
  }

  if (card.id === 'pertahanan') {
    message.value = 'PERTAHANAN AKTIF OTOMATIS SAAT DISERANG.';
    setTimeout(() => {
      message.value = '';
    }, 2200);
    return;
  }

  if (card.id === 'imun') {
    const pend = pendingImunOffer.value;
    if (pend && pend.playerIndex === pIdx && pend.position === p.position) {
      p.inventory.splice(cIdx, 1);
      message.value = 'IMUN DIPAKAI! JEBAKAN DINEGASI!';
      showInventory.value = false;
      resolveTrapImun('skipped');
    } else {
      message.value = 'IMUN HANYA SAAT MENGHADAPI JEBAKAN (IKUTI TAMPILAN PENGUMUMAN).';
    }
    setTimeout(() => {
      message.value = '';
    }, 2200);
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
  } else if (card.id === 'save_jaring' || card.id === 'save_pasir') {
    message.value = 'KARTU INI HANYA SAAT TERJEBAK DI JARING / PASIR.';
  } else if (card.id === 'serangan') {
    openSeranganTarget(cIdx);
    return;
  } else {
    message.value = 'KARTU INI TIDAK BISA DIGUNAKAN SEKARANG!';
  }

  setTimeout(() => {
    message.value = '';
  }, 2000);
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
  pendingImunOffer.value = null;
  trapImunResolve = null;
  showSeranganModal.value = false;
  seranganInventoryCardIndex.value = -1;
  clearBoardFocus();
};
const resetToSetup = () => {
  if (playerCount.value === null) {
    router.push('/mini-games/snake-and-ladders');
  } else {
    playerCount.value = null;
    winner.value = null;
  }
};

watch(
  playerCount,
  (n) => {
    hideAppHeaderForFullscreenGame.value = n != null;
  },
  { immediate: true }
);

onUnmounted(() => {
  hideAppHeaderForFullscreenGame.value = false;
});

watch(isBotTurn, (val) => {
  if (
    val &&
    !winner.value &&
    !isRolling.value &&
    !isMoving.value &&
    !showCardModal.value &&
    !pendingImunOffer.value &&
    !showSeranganModal.value
  ) {
    setTimeout(rollDice, 1200);
  }
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

/* Hop per langkah: arc halus (translate3d), rendah, landing di dasar tile */
@keyframes monopolyHop {
  0% { transform: translate3d(0, 0, 0) scale(1, 1); }
  15% { transform: translate3d(0, -4%, 0) scale(1.015, 0.995); }
  38% { transform: translate3d(0, -10%, 0) scale(1.02, 0.992); }
  55% { transform: translate3d(0, -7%, 0) scale(1.012, 0.998); }
  78% { transform: translate3d(0, -2%, 0) scale(1.005, 1); }
  100% { transform: translate3d(0, 0, 0) scale(1, 1); }
}
.animate-monopoly-hop { 
  animation: monopolyHop 0.48s cubic-bezier(0.37, 0, 0.21, 1);
  transform-origin: bottom center;
  will-change: transform;
}

/* Lompatan ular/tangga: halus, tetap rendah relatif token */
@keyframes questJump {
  0% { transform: translate3d(0, 0, 0) scale(1, 1); }
  22% { transform: translate3d(0, -6%, 0) scale(1.02, 0.99); }
  50% { transform: translate3d(0, -16%, 0) scale(1.03, 0.99); }
  78% { transform: translate3d(0, -5%, 0) scale(1.01, 1); }
  100% { transform: translate3d(0, 0, 0) scale(1, 1); }
}
.animate-quest-jump {
  animation: questJump 0.88s cubic-bezier(0.33, 0, 0.2, 1);
  transform-origin: bottom center;
  will-change: transform;
}

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
  backface-visibility: hidden;
}
/* Perpindahan antar tile: ease simetris agar landing presisi di kotak */
.player-transition-hop {
  transition-property: left, top;
  transition-timing-function: cubic-bezier(0.45, 0, 0.55, 1);
}
.player-transition-smooth { transition-timing-function: cubic-bezier(0.34, 1.56, 0.64, 1); }

/* —— Sama dengan /mini-games/snake-and-ladders: mobile & tablet landscape —— */
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
  .realm-hub-card p.text-amber-500 {
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
  .animate-totem-float {
    animation: totemLandscapeShort 3.5s ease-in-out infinite;
  }

  .iq-play-root {
    padding: 0.25rem 0.35rem !important;
  }
  .iq-score-col {
    width: 6.5rem !important;
    gap: 0.25rem !important;
  }
  .iq-score-col > div {
    padding: 0.3rem 0.4rem !important;
    border-radius: 0.5rem !important;
  }
  .iq-stat-avatar {
    height: 1.35rem !important;
    width: 1.1rem !important;
  }
  .iq-stat-label {
    font-size: 0.45rem !important;
  }
  .iq-stat-bag {
    font-size: 0.65rem !important;
  }
  .iq-stat-pos {
    font-size: 0.85rem !important;
  }
  .iq-control-col {
    width: 6.75rem !important;
  }
  .iq-control-panel {
    padding: 0.35rem !important;
    border-radius: 0.65rem !important;
  }
  .iq-dice-wrap {
    width: 2.15rem !important;
    height: 2.15rem !important;
  }
  .iq-roll-btn {
    height: 2rem !important;
  }
  .iq-roll-btn span {
    font-size: 0.5rem !important;
  }
  .iq-board-stage {
    padding: 0.15rem !important;
  }
  .iq-board-surface {
    max-height: min(70svh, 100%) !important;
  }

  /* Modal kartu undian — lebih kompak */
  .iq-modal-draw-card {
    padding: 0.35rem !important;
  }
  .iq-modal-draw-card-panel {
    max-width: 11.5rem !important;
    padding: 0.45rem 0.55rem !important;
    border-radius: 0.6rem !important;
    border-width: 1px !important;
  }
  .iq-modal-draw-card-label {
    font-size: 0.4rem !important;
    letter-spacing: 0.12em !important;
    margin-bottom: 0.25rem !important;
  }
  .iq-modal-draw-card-visual {
    max-width: 4.5rem !important;
    margin-bottom: 0.35rem !important;
    border-width: 1px !important;
  }
  .iq-modal-draw-card-title {
    font-size: 0.7rem !important;
    margin-bottom: 0.15rem !important;
    line-height: 1.1 !important;
  }
  .iq-modal-draw-card-desc {
    font-size: 0.5rem !important;
    margin-bottom: 0.45rem !important;
    line-height: 1.35 !important;
  }
  .iq-modal-draw-card-btn {
    padding: 0.35rem 0.4rem !important;
    font-size: 0.55rem !important;
    border-radius: 0.4rem !important;
  }
  .iq-modal-draw-card-auto {
    font-size: 0.5rem !important;
  }

  /* Modal kemenangan — lebih kompak */
  .iq-modal-victory {
    padding: 0.4rem !important;
  }
  .iq-modal-victory-panel {
    max-width: 13rem !important;
    padding: 0.55rem 0.65rem !important;
    border-radius: 0.65rem !important;
    border-width: 1px !important;
  }
  .iq-modal-victory-figure {
    margin-bottom: 0.35rem !important;
  }
  .iq-modal-victory-img {
    width: 4.25rem !important;
    height: 5.5rem !important;
    max-height: 40svh !important;
  }
  .iq-modal-victory-title {
    font-size: 0.85rem !important;
    margin-bottom: 0.2rem !important;
    line-height: 1 !important;
  }
  .iq-modal-victory-sub {
    font-size: 0.55rem !important;
    margin-bottom: 0.45rem !important;
    letter-spacing: 0.15em !important;
  }
  .iq-modal-victory-actions {
    gap: 0.35rem !important;
  }
  .iq-modal-victory-btn-primary {
    padding: 0.4rem 0.35rem !important;
    font-size: 0.55rem !important;
    border-radius: 0.45rem !important;
  }
  .iq-modal-victory-btn-exit {
    padding: 0.4rem 0.35rem !important;
    font-size: 0.45rem !important;
    border-radius: 0.45rem !important;
  }
}

@keyframes totemLandscapeShort {
  0%, 100% { transform: translateY(0) rotate(-0.5deg); }
  50% { transform: translateY(-4px) rotate(0.5deg); }
}

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
