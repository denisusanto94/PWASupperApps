<template>
  <div class="min-h-screen bg-[#0f172a] text-white p-4 sm:p-8 pt-20 relative overflow-hidden">
    <!-- Ambient Glow BG -->
    <div class="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>
    <div class="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none"></div>

    <div class="max-w-6xl mx-auto relative z-10">
      <header class="mb-12 text-center sm:text-left">
        <h1 class="text-4xl sm:text-6xl font-black tracking-tight mb-4 bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent italic">
          MINI GAMES
        </h1>
        <p class="text-slate-400 text-lg sm:text-xl font-medium max-w-2xl">
          Koleksi permainan santai untuk mengisi waktu luang Anda. Mainkan langsung di browser.
        </p>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
        <!-- Solitaire Card -->
        <router-link to="/mini-games/solitaire" class="group relative block rounded-3xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
          <!-- Card Glow -->
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="h-48 sm:h-56 bg-gradient-to-br from-emerald-600 to-emerald-900 flex items-center justify-center relative overflow-hidden border-b border-white/10">
            <!-- Decorative Cards -->
            <div class="absolute transform -rotate-12 translate-x-[-20px] translate-y-[10px] w-24 h-36 bg-white rounded-xl shadow-2xl flex items-center justify-center text-4xl group-hover:rotate-[-20deg] transition-all duration-500 group-hover:translate-x-[-40px]">
              🎴
            </div>
            <div class="absolute transform rotate-6 translate-x-[20px] translate-y-[20px] w-24 h-36 bg-slate-50 rounded-xl shadow-2xl flex items-center justify-center text-4xl group-hover:rotate-[15deg] transition-all duration-500 group-hover:translate-x-[40px]">
              🃏
            </div>
            <div class="z-20 text-white font-black text-6xl drop-shadow-2xl scale-125 group-hover:scale-150 transition-transform duration-700">
              ♠️
            </div>
          </div>
          
          <div class="p-6 bg-white/5 backdrop-blur-xl border-x border-b border-white/10 group-hover:bg-white/10 transition-colors">
            <div class="flex justify-between items-start mb-3">
              <h2 class="text-2xl font-black text-white">Solitaire</h2>
              <span class="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-emerald-500/20">Classic</span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed mb-4">
              Game kartu klasik yang tak lekang oleh waktu. Susun kartu sesuai urutan dan kumpulkan kemenanganmu!
            </p>
            <div class="flex items-center text-emerald-400 text-sm font-bold gap-2 group-hover:gap-4 transition-all">
              <span>MAINKAN SEKARANG</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </router-link>

        <!-- Memory Match Card -->
        <router-link to="/mini-games/memory-match" class="group relative block rounded-3xl overflow-hidden transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02]">
          <!-- Card Glow -->
          <div class="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="h-48 sm:h-56 bg-gradient-to-br from-indigo-600 to-indigo-900 flex items-center justify-center relative overflow-hidden border-b border-white/10">
            <!-- Decorative Elements -->
            <div class="absolute transform -rotate-6 translate-x-[-15px] translate-y-[10px] w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center text-4xl group-hover:rotate-[-12deg] transition-all duration-500 group-hover:translate-x-[-30px]">
              🧠
            </div>
            <div class="absolute transform rotate-12 translate-x-[15px] translate-y-[20px] w-24 h-24 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl flex items-center justify-center text-4xl group-hover:rotate-[15deg] transition-all duration-500 group-hover:translate-x-[30px]">
              💡
            </div>
          </div>
          
          <div class="p-6 bg-white/5 backdrop-blur-xl border-x border-b border-white/10 group-hover:bg-white/10 transition-colors">
            <div class="flex justify-between items-start mb-3">
              <h2 class="text-2xl font-black text-white">Memory Match</h2>
              <span class="px-3 py-1 bg-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest rounded-full border border-indigo-500/20">Skill</span>
            </div>
            <p class="text-slate-400 text-sm leading-relaxed mb-4">
              Latih ingatan Anda dengan mencocokkan pasangan gambar yang sama. Makin cepat, makin cerdas!
            </p>
            <div class="flex items-center text-indigo-400 text-sm font-bold gap-2 group-hover:gap-4 transition-all">
              <span>MAINKAN SEKARANG</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </div>
          </div>
        </router-link>

        <!-- Soon: Tic Tac Toe -->
        <div class="group relative rounded-3xl overflow-hidden bg-white/5 border border-white/5 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
          <div class="h-48 sm:h-56 bg-gradient-to-br from-rose-600/40 to-rose-900/40 flex items-center justify-center text-rose-400 text-6xl">
            ⭕️
          </div>
          <div class="p-6">
            <h2 class="text-2xl font-black text-white/50 mb-2">Tic Tac Toe</h2>
            <p class="text-slate-500 text-sm mb-4">Atur strategi untuk memenangkan permainan legendaris ini.</p>
            <span class="text-xs font-bold text-slate-600 uppercase tracking-widest border border-slate-700/50 px-3 py-1 rounded-full bg-slate-800/30">SEGERA HADIR</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Minimal logic for the Mini Games view
</script>

<style scoped>
.italic {
  font-style: italic;
}

/* Custom shadow for cards */
.shadow-2xl {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}
</style>

