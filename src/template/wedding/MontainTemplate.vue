<template>
  <div class="montain-template-root theme-montain" id="montain-root">
    <!-- Amplop: flap tampil dulu, buka dari bawah ke atas -->
    <section id="amplop" class="relative overflow-hidden" v-show="!contentFadeIn" aria-hidden="false">
      <div class="amplop-flap" id="amplopFlap" :class="{ 'buka': opening }">
        <img :src="assetPath('images/branch-1.webp')" alt="" class="amplop-ornament ornament-top-left" aria-hidden="true">
        <img :src="assetPath('images/branch-1.webp')" alt="" class="amplop-ornament ornament-top-right" aria-hidden="true" style="transform: scaleX(-1)">
        <img :src="assetPath('images/pinetree.webp')" alt="" class="amplop-ornament ornament-center-left" aria-hidden="true">
        <img :src="assetPath('images/pinetree.webp')" alt="" class="amplop-ornament ornament-center-right" aria-hidden="true" style="transform: scaleX(-1)">
        <img :src="assetPath('images/flower-1.webp')" alt="" class="amplop-ornament ornament-bottom-center" aria-hidden="true">
        <img :src="assetPath('images/flower-2.webp')" alt="" class="amplop-ornament ornament-bottom-right" aria-hidden="true">
        <img :src="assetPath('images/flower-3.webp')" alt="" class="amplop-ornament ornament-root-right" aria-hidden="true">
        <img :src="assetPath('images/flower-4.webp')" alt="" class="amplop-ornament ornament-root-right ornament-2" aria-hidden="true">
        <img :src="assetPath('images/flower-2.webp')" alt="" class="amplop-ornament ornament-bottom-left" aria-hidden="true" style="transform: scaleX(-1)">
        <img :src="assetPath('images/flower-3.webp')" alt="" class="amplop-ornament ornament-root-left" aria-hidden="true" style="transform: scaleX(-1)">
        <img :src="assetPath('images/flower-4.webp')" alt="" class="amplop-ornament ornament-root-left ornament-2" aria-hidden="true" style="transform: scaleX(-1)">

        <div class="relative z-10 w-full max-w-3xl text-center px-4 py-10 md:px-8 md:py-16 md:max-w-4xl">
          <div class="amplop-content inline-block text-center">
            <p class="cover-subtitle text-xs uppercase tracking-widest md:text-sm">Undangan Pernikahan</p>
            <div class="amplop-divider" aria-hidden="true"></div>
            <h2 class="cover-title font-serif text-2xl text-primary-dark md:text-3xl lg:text-4xl">ٱلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ ٱللَّٰهِ وَبَرَكَاتُهُ</h2>
            <p class="cover-subtitle mt-3 text-[0.95rem] md:mt-4 mb-6">Kepada Bapak/Ibu/Saudara/i, {{ data.namaTamu || 'tamu kami' }}, kami mengundang Anda untuk membuka undangan digital ini.</p>
            <button type="button" @click="openInvitation" id="btnBukaUndangan" class="px-8 py-3 text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2">
              Buka Undangan
            </button>
          </div>
        </div>
      </div>
    </section>

    <!-- Konten undangan (muncul setelah klik Buka Undangan) -->
    <div id="undangan-content" class="undangan-content" :class="{ 'open': contentOpened }">
      <!-- Desktop: kolom kiri 60% fixed -->
      <aside class="desktop-left hidden lg:block" aria-label="Cover undangan">
        <section id="section-desktop-cover-left" class="section-desktop-cover-left fixed inset-0 w-[60%] h-screen overflow-hidden flex flex-col items-center justify-center px-4 py-10 md:px-8 md:py-16">
          <img :src="assetPath('images/branch-1.webp')" alt="" class="ornament ornament-top-left" aria-hidden="true">
          <img :src="assetPath('images/branch-1.webp')" alt="" class="ornament ornament-top-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/pinetree.webp')" alt="" class="ornament ornament-center-left" aria-hidden="true">
          <img :src="assetPath('images/pinetree.webp')" alt="" class="ornament ornament-center-right" aria-hidden="true">
          <img :src="assetPath('images/flower-1.webp')" alt="" class="ornament ornament-bottom-center" aria-hidden="true">
          <img :src="assetPath('images/flower-2.webp')" alt="" class="ornament ornament-bottom-right" aria-hidden="true">
          <img :src="assetPath('images/flower-3.webp')" alt="" class="ornament ornament-root-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-4.webp')" alt="" class="ornament ornament-root-right ornament-2 ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-2.webp')" alt="" class="ornament ornament-bottom-left" aria-hidden="true">
          <img :src="assetPath('images/flower-3.webp')" alt="" class="ornament ornament-root-left" aria-hidden="true">
          <img :src="assetPath('images/flower-4.webp')" alt="" class="ornament ornament-root-left ornament-2" aria-hidden="true">
          <div class="relative z-10 w-full text-center px-4 desktop-left-panel-wrap">
            <div class="desktop-left-content inline-block text-center mt-[-2rem]">
              <div class="mb-8">
                <h2 class="cover-title font-serif text-xl text-primary-dark md:text-2xl lg:text-3xl tracking-[0.12em] drop-shadow-sm leading-tight">
                  {{ data.namaMempelaiPria || 'Nama Pria' }}
                </h2>
                <p class="cover-subtitle text-xs my-3 opacity-60 italic font-serif">&amp;</p>
                <h3 class="cover-title font-serif text-xl text-primary-dark md:text-2xl lg:text-3xl tracking-[0.12em] drop-shadow-sm leading-tight">
                  {{ data.namaMempelaiWanita || 'Nama Wanita' }}
                </h3>
              </div>
            </div>
          </div>
        </section>
      </aside>

      <!-- Kanan: daftar section -->
      <div class="desktop-right" @scroll="onRightScroll" id="right-col">
        <section id="cover" class="parallax-section relative h-screen h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-8 md:py-16 lg:py-20">
          <img :src="assetPath('images/branch-1.webp')" alt="" class="ornament ornament-top-left" aria-hidden="true">
          <img :src="assetPath('images/branch-1.webp')" alt="" class="ornament ornament-top-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/pinetree.webp')" alt="" class="ornament ornament-center-left" aria-hidden="true">
          <img :src="assetPath('images/pinetree.webp')" alt="" class="ornament ornament-center-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-1.webp')" alt="" class="ornament ornament-bottom-center" aria-hidden="true">
          <img :src="assetPath('images/flower-2.webp')" alt="" class="ornament ornament-bottom-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-3.webp')" alt="" class="ornament ornament-root-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-4.webp')" alt="" class="ornament ornament-root-right ornament-2 ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-2.webp')" alt="" class="ornament ornament-bottom-left" aria-hidden="true">
          <img :src="assetPath('images/flower-3.webp')" alt="" class="ornament ornament-root-left" aria-hidden="true">
          <img :src="assetPath('images/flower-4.webp')" alt="" class="ornament ornament-root-left ornament-2" aria-hidden="true">
          <div class="relative z-10 w-full max-w-3xl px-4 text-center md:max-w-4xl">
            <div class="cover-content inline-block text-center">
              <p class="cover-subtitle text-xs uppercase tracking-widest md:text-sm">Undangan Pernikahan</p>
              <div class="cover-divider" aria-hidden="true"></div>
              <h2 class="cover-title font-serif text-2xl text-primary-dark md:text-3xl lg:text-4xl">
                {{ data.namaMempelaiPriaShort || data.namaMempelaiPria || 'Pria' }} & {{ data.namaMempelaiWanitaShort || data.namaMempelaiWanita || 'Wanita' }}
              </h2>
              <p class="cover-subtitle mt-3 text-[0.95rem] md:mt-4">Selamat datang di undangan kami.</p>
            </div>
          </div>
          <!-- Scroll Cue -->
          <div class="scroll-cue" role="button" @click="scrollToNext">
            <span class="scroll-cue-label">Scroll</span>
            <span class="scroll-cue-icon"></span>
          </div>
        </section>

        <section id="waktu-mundur" class="parallax-section relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-8 md:py-16 lg:py-20">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="wm-ornament wm-ornament-left" aria-hidden="true">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="wm-ornament wm-ornament-right" aria-hidden="true">
          <div class="relative z-10 w-full max-w-3xl text-center md:max-w-4xl px-2">
            <div class="wm-content inline-block text-center min-w-0">
              <h2 class="wm-title font-serif text-2xl font-semibold text-primary-dark md:text-3xl lg:text-4xl">Waktu Mundur</h2>
              <div class="wm-divider" aria-hidden="true"></div>
              <p class="wm-subtitle text-[0.95rem] mb-6">Countdown menuju hari bahagia.</p>
              <div class="countdown-grid" aria-label="Countdown acara">
                <div class="countdown-box">
                  <div class="countdown-value">{{ countdownMain.days }}</div>
                  <div class="countdown-label">Hari</div>
                </div>
                <div class="countdown-box">
                  <div class="countdown-value">{{ countdownMain.hours }}</div>
                  <div class="countdown-label">Jam</div>
                </div>
                <div class="countdown-box">
                  <div class="countdown-value">{{ countdownMain.minutes }}</div>
                  <div class="countdown-label">Menit</div>
                </div>
                <div class="countdown-box">
                  <div class="countdown-value">{{ countdownMain.seconds }}</div>
                  <div class="countdown-label">Detik</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pembuka" class="parallax-section relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-8 md:py-16 lg:py-20">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="pb-ornament pb-ornament-left" aria-hidden="true">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="pb-ornament pb-ornament-right" aria-hidden="true">
          <div class="relative z-10 w-full max-w-3xl text-center md:max-w-4xl px-2">
            <div class="pb-content inline-block text-center min-w-0">
              <h2 class="pb-title font-serif text-2xl font-semibold text-primary-dark md:text-3xl lg:text-4xl">Pembuka</h2>
              <div class="pb-divider" aria-hidden="true"></div>
              <p class="pb-text text-[0.96rem]">
                Assalamu'alaikum Warahmatullahi Wabarakatuh.<br>
                Dengan memohon rahmat dan ridha Allah SWT, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami.
              </p>
              <p class="pb-arabic font-serif">رَبَّنَا هَبْ لَنَا مِنْ أَزْوَاجِنَا وَذُرِّيَّاتِنَا قُرَّةَ أَعْيُنٍ وَاجْعَلْنَا لِلْمُتَّقِينَ إِمَامًا</p>
              <p class="pb-text text-[0.92rem]">
                Ya Tuhan kami, anugerahkanlah kepada kami pasangan dan keturunan sebagai penyejuk hati kami, dan jadikanlah kami pemimpin bagi orang-orang yang bertakwa.
              </p>
              <div class="pb-surah">
                <p class="pb-surah-label">Surah Perintah Menikah</p>
                <p class="pb-text text-[0.95rem] font-medium">QS. An-Nur: 32</p>
                <p class="pb-text text-[0.92rem] mt-1">
                  "Dan nikahkanlah orang-orang yang masih membujang di antara kamu, dan juga orang-orang yang layak (menikah) dari hamba-hamba sahayamu yang laki-laki dan perempuan."
                </p>
              </div>
            </div>
          </div>
        </section>

        <section id="kedua-mempelai" class="parallax-section relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-8 md:py-16 lg:py-20">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="km-ornament km-ornament-left" aria-hidden="true">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="km-ornament km-ornament-right" aria-hidden="true">
          <div class="relative z-10 w-full max-w-3xl text-center md:max-w-4xl px-2">
            <div class="km-content inline-block text-center min-w-0">
              <h2 class="km-title font-serif text-2xl font-semibold text-primary-dark md:text-3xl lg:text-4xl">Kedua Mempelai</h2>
              <div class="km-divider" aria-hidden="true"></div>
              <p class="km-subtitle text-[0.95rem]">Perkenankan kami memperkenalkan kedua mempelai.</p>
              <div class="km-and" aria-hidden="true">&amp;</div>
              <div class="km-grid">
                <article class="km-card">
                  <p class="km-role">Mempelai Pria</p>
                  <img :src="data.fotoPria || assetPath('images/mempelai_pria.webp')" alt="Foto mempelai pria" class="km-photo mx-auto">
                  <h3 class="km-name">{{ data.namaMempelaiPria || 'Nama Pria' }}</h3>
                  <span class="km-label">Bapak &amp; Ibu</span>
                  <p class="km-meta">Putra dari Bapak {{ data.orangTuaAyahPria || '[Nama Ayah]' }} &amp; Ibu {{ data.orangTuaIbuPria || '[Nama Ibu]' }}</p>
                  <template v-if="data.sosialMediaPria">
                    <a :href="'https://instagram.com/' + data.sosialMediaPria.replace('@','')" target="_blank" rel="noopener noreferrer" class="km-ig">@{{ data.sosialMediaPria.replace('@','') }}</a>
                  </template>
                </article>
                <article class="km-card">
                  <p class="km-role">Mempelai Wanita</p>
                  <img :src="data.fotoWanita || assetPath('images/mempelai_wanita.webp')" alt="Foto mempelai wanita" class="km-photo mx-auto">
                  <h3 class="km-name">{{ data.namaMempelaiWanita || 'Nama Wanita' }}</h3>
                  <span class="km-label">Bapak &amp; Ibu</span>
                  <p class="km-meta">Putri dari Bapak {{ data.orangTuaAyahWanita || '[Nama Ayah]' }} &amp; Ibu {{ data.orangTuaIbuWanita || '[Nama Ibu]' }}</p>
                  <template v-if="data.sosialMediaWanita">
                    <a :href="'https://instagram.com/' + data.sosialMediaWanita.replace('@','')" target="_blank" rel="noopener noreferrer" class="km-ig">@{{ data.sosialMediaWanita.replace('@','') }}</a>
                  </template>
                </article>
              </div>
            </div>
          </div>
        </section>

        <!-- Prewedding -->
        <section id="prewedd" class="parallax-section relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-4 md:py-16 lg:py-20">
          <div class="relative z-10 w-full max-w-none text-center px-0">
            <div class="pr-content block text-center min-w-0">
              <h2 class="pr-title font-serif text-2xl font-semibold text-primary-dark md:text-3xl lg:text-4xl">Prewedding</h2>
              <div class="pr-divider" aria-hidden="true"></div>
              <p class="pr-subtitle text-[0.95rem]">Galeri momen terbaik kami dalam bingkai yang aesthetic.</p>
              <div class="pr-carousel">
                <div class="pr-track" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
                  <div class="pr-slide" v-for="(group, idx) in galleryGroups" :key="idx">
                    <div class="pr-slide-grid">
                      <figure class="pr-item" v-for="(img, iidx) in group" :key="iidx">
                        <img :src="img" alt="">
                      </figure>
                    </div>
                  </div>
                </div>
              </div>
              <div class="pr-dots">
                <span v-for="n in galleryGroups.length" :key="n" class="pr-dot" :class="{ active: currentSlide === n-1 }" @click="currentSlide = n-1"></span>
              </div>
            </div>
          </div>
        </section>

        <!-- Acara -->
        <section id="acara-akad" class="parallax-section relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-8 md:py-16 lg:py-20">
          <div class="relative z-10 w-full max-w-3xl text-center md:max-w-4xl px-2">
            <div class="lk-content block text-center min-w-0">
              <span class="lk-badge">Akad Nikah</span>
              <h2 class="lk-title font-serif text-2xl font-semibold text-primary-dark md:text-3xl lg:text-4xl">Lokasi Acara Akad</h2>
              <div class="lk-divider" aria-hidden="true"></div>
              <p class="lk-event">{{ formatDate(data.tanggalAkad) }} · {{ formatTime(data.tanggalAkad) }} - selesai</p>
              <p class="lk-subtitle text-[0.95rem]">Detail lokasi akad dan Google Maps untuk memudahkan perjalanan Anda.</p>
              <div class="lk-grid">
                <article class="lk-card lk-card--detail">
                  <span class="lk-label">Detail Lokasi Akad</span>
                  <p class="lk-text">{{ data.lokasiAkad || '[Nama Gedung / Rumah Akad] Jl. [Nama Jalan], [Kelurahan], [Kecamatan], [Kota/Kabupaten], [Provinsi] [Kode Pos]' }}</p>
                  <div class="lk-actions">
                    <a class="lk-btn" :href="data.googleMapsAkad" target="_blank" rel="noopener noreferrer">Buka Google Maps</a>
                  </div>
                </article>
                <article class="lk-card lk-card--map">
                  <span class="lk-label">Google Maps</span>
                  <iframe class="lk-map" :src="googleMapEmbedUrl(data.googleMapsAkad)" title="Google Maps Lokasi Acara Akad" loading="lazy"></iframe>
                </article>
              </div>
            </div>
          </div>
        </section>

        <section id="acara-resepsi" class="parallax-section relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-8 md:py-16 lg:py-20">
          <div class="relative z-10 w-full max-w-3xl text-center md:max-w-4xl px-2">
            <div class="lk-content block text-center min-w-0">
              <span class="lk-badge">Resepsi</span>
              <h2 class="lk-title font-serif text-2xl font-semibold text-primary-dark md:text-3xl lg:text-4xl">Lokasi Acara Resepsi</h2>
              <div class="lk-divider" aria-hidden="true"></div>
              <p class="lk-event">{{ formatDate(data.tanggalResepsi) }} · {{ formatTime(data.tanggalResepsi) }} - selesai</p>
              <p class="lk-subtitle text-[0.95rem]">Detail lokasi resepsi dan Google Maps untuk memudahkan perjalanan Anda.</p>
              <div class="lk-grid">
                <article class="lk-card lk-card--detail">
                  <span class="lk-label">Detail Lokasi Resepsi</span>
                  <p class="lk-text">{{ data.lokasiResepsi || '[Nama Gedung / Rumah Resepsi] Jl. [Nama Jalan], [Kelurahan], [Kecamatan], [Kota/Kabupaten], [Provinsi] [Kode Pos]' }}</p>
                  <div class="lk-actions">
                    <a class="lk-btn" :href="data.googleMapsResepsi" target="_blank" rel="noopener noreferrer">Buka Google Maps</a>
                  </div>
                </article>
                <article class="lk-card lk-card--map">
                  <span class="lk-label">Google Maps</span>
                  <iframe class="lk-map" :src="googleMapEmbedUrl(data.googleMapsResepsi)" title="Google Maps Lokasi Acara Resepsi" loading="lazy"></iframe>
                </article>
              </div>
            </div>
          </div>
        </section>

        <!-- RSVP -->
        <section id="rsvp" class="parallax-section relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-8 md:py-16 lg:py-20">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="rs-ornament rs-ornament-left" aria-hidden="true">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="rs-ornament rs-ornament-right" aria-hidden="true">
          <div class="relative z-10 w-full max-w-3xl text-center md:max-w-4xl px-2">
            <div class="rs-content block text-center min-w-0">
              <h2 class="rs-title font-serif text-2xl font-semibold text-primary-dark md:text-3xl lg:text-4xl">RSVP</h2>
              <div class="rs-divider" aria-hidden="true"></div>
              <p class="rs-subtitle text-[0.95rem]">Konfirmasi kehadiran Anda pada acara pernikahan kami.</p>
              <form class="rs-form">
                <div class="rs-field">
                  <label class="rs-label">Nama</label>
                  <input type="text" class="rs-input" :value="data.namaTamu" readonly>
                </div>
                <div class="rs-field rs-field--full">
                  <span class="rs-label">Konfirmasi Kehadiran</span>
                  <div class="rs-radio-group">
                    <label class="rs-radio"><input type="radio" name="presence" value="yes"> Hadir</label>
                    <label class="rs-radio"><input type="radio" name="presence" value="no"> Tidak Hadir</label>
                  </div>
                </div>
                <div class="rs-field rs-field--full">
                  <button type="button" class="rs-submit">Kirim Konfirmasi</button>
                </div>
              </form>
            </div>
          </div>
        </section>

        <!-- Payment / Angpao -->
        <section id="e-angpao" class="parallax-section relative min-h-screen min-h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-8 md:py-16 lg:py-20">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="ea-ornament ea-ornament-left" aria-hidden="true">
          <img :src="assetPath('images/tree-1.webp')" alt="" class="ea-ornament ea-ornament-right" aria-hidden="true">
          <div class="relative z-10 w-full max-w-3xl text-center md:max-w-4xl px-2">
            <div class="ea-content block text-center min-w-0">
              <h2 class="ea-title font-serif text-2xl font-semibold text-primary-dark md:text-3xl lg:text-4xl">E-Angpao</h2>
              <div class="ea-divider" aria-hidden="true"></div>
              <p class="ea-subtitle text-[0.95rem]">Silakan scan QRIS untuk mengirim hadiah digital.</p>
              <div class="ea-qris-wrap">
                <img :src="data.qrisUrl || assetPath('images/qris.webp')" alt="QRIS" class="ea-qris-image">
              </div>
            </div>
          </div>
        </section>

        <section id="penutup" class="parallax-section relative h-screen h-[100dvh] flex flex-col items-center justify-center px-4 py-10 overflow-hidden md:px-8 md:py-16 lg:py-20">
          <img :src="assetPath('images/branch-1.webp')" alt="" class="ornament ornament-top-left" aria-hidden="true">
          <img :src="assetPath('images/branch-1.webp')" alt="" class="ornament ornament-top-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/pinetree.webp')" alt="" class="ornament ornament-center-left" aria-hidden="true">
          <img :src="assetPath('images/pinetree.webp')" alt="" class="ornament ornament-center-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-1.webp')" alt="" class="ornament ornament-bottom-center" aria-hidden="true">
          <img :src="assetPath('images/flower-2.webp')" alt="" class="ornament ornament-bottom-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-3.webp')" alt="" class="ornament ornament-root-right ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-4.webp')" alt="" class="ornament ornament-root-right ornament-2 ornament-flip" aria-hidden="true">
          <img :src="assetPath('images/flower-2.webp')" alt="" class="ornament ornament-bottom-left" aria-hidden="true">
          <img :src="assetPath('images/flower-3.webp')" alt="" class="ornament ornament-root-left" aria-hidden="true">
          <img :src="assetPath('images/flower-4.webp')" alt="" class="ornament ornament-root-left ornament-2" aria-hidden="true">
          <div class="relative z-10 w-full max-w-3xl px-4 text-center md:max-w-4xl">
            <div class="cover-content inline-block text-center">
              <p class="cover-subtitle text-xs uppercase tracking-widest md:text-sm">Terima Kasih</p>
              <div class="cover-divider" aria-hidden="true"></div>
              <h2 class="cover-title font-serif text-2xl text-primary-dark md:text-3xl lg:text-4xl">Sampai Jumpa di Hari Bahagia Kami</h2>
              <p class="cover-subtitle mt-3 text-[0.95rem] md:mt-4">
                Terima kasih atas doa, perhatian, dan kehadiran Bapak/Ibu/Saudara/i. Semoga Allah SWT membalas semua kebaikan dengan keberkahan.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <!-- Floating Buttons -->
    <div class="mobile-scroll-nav mobile-scroll-nav--top" :class="{ 'is-hidden': !showTopNav }" @click="jumpSection(-1)">
      <button type="button" class="mobile-scroll-btn">&#8593;</button>
    </div>
    <div class="mobile-scroll-nav mobile-scroll-nav--bottom" :class="{ 'is-hidden': !showBottomNav }" @click="jumpSection(1)">
      <button type="button" class="mobile-scroll-btn">&#8595;</button>
    </div>

    <audio ref="audioRef" loop preload="auto" playsinline style="display:none;">
      <source :src="assetPath('bgm.mp3')" type="audio/mpeg">
    </audio>
    <div id="bgmWrap" class="bgm-wrap" :class="{ 'show': contentOpened }">
      <button type="button" @click="toggleMute" class="bgm-btn">
        <span v-if="!isMuted">🎵</span>
        <span v-else>🔇</span>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import './montain-template.css';

const props = defineProps({
  data: { type: Object, default: () => ({}) }
});

const opening = ref(false);
const contentOpened = ref(false);
const contentFadeIn = ref(false);
const audioRef = ref(null);
const isMuted = ref(false);
const currentSlide = ref(0);
const showTopNav = ref(false);
const showBottomNav = ref(false);

const assetPath = (p) => `/template/wedding/assets/montain/${p}`;

const galleryGroups = computed(() => {
  const all = props.data.gallery || [
    assetPath('images/mempelai_pria.webp'),
    assetPath('images/mempelai_wanita.webp'),
    assetPath('images/bg.webp'),
    assetPath('images/bg_footer.webp'),
    assetPath('images/mountain.webp'),
    assetPath('images/pine.webp')
  ];
  const groups = [];
  for (let i = 0; i < all.length; i += 2) {
    groups.push(all.slice(i, i + 2));
  }
  return groups;
});

const countdownMain = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 });

const formatDate = (iso) => {
  if (!iso) return 'Sabtu, 15 Juni 2026';
  return new Date(iso).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
};

const formatTime = (iso) => {
  if (!iso) return '08.00';
  return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace('.',':') + ' WIB';
};

const googleMapEmbedUrl = (url) => {
  if (!url) return 'https://www.google.com/maps?q=-6.200000,106.816666&hl=id&z=15&output=embed';
  const match = url.match(/q=([-.\d]+,[-.\d]+)/);
  if (match) return `https://www.google.com/maps?q=${match[1]}&hl=id&z=15&output=embed`;
  return url;
};

const openInvitation = () => {
  opening.value = true;
  if (audioRef.value) {
    audioRef.value.play().catch(() => { isMuted.value = true; });
  }
  setTimeout(() => {
    contentOpened.value = true;
    contentFadeIn.value = true;
    document.body.classList.remove('lock-scroll');
    window.scrollTo(0, 0);
    const rightCol = document.getElementById('right-col');
    if (rightCol) rightCol.scrollTop = 0;
  }, 980);
};

const toggleMute = () => {
  isMuted.value = !isMuted.value;
  if (audioRef.value) audioRef.value.muted = isMuted.value;
};

const sections = ['cover', 'waktu-mundur', 'pembuka', 'kedua-mempelai', 'prewedd', 'acara-akad', 'acara-resepsi', 'rsvp', 'e-angpao', 'penutup'];

const jumpSection = (dir) => {
  const container = (window.innerWidth >= 1024) ? document.getElementById('right-col') : window;
  const scrollY = (window.innerWidth >= 1024) ? document.getElementById('right-col').scrollTop : window.scrollY;
  
  let currentIdx = 0;
  for (let i = 0; i < sections.length; i++) {
    const el = document.getElementById(sections[i]);
    if (el && el.offsetTop <= scrollY + 100) currentIdx = i;
  }
  
  const nextIdx = Math.max(0, Math.min(sections.length - 1, currentIdx + dir));
  const target = document.getElementById(sections[nextIdx]);
  if (target) {
    if (window.innerWidth >= 1024) {
      document.getElementById('right-col').scrollTo({ top: target.offsetTop, behavior: 'smooth' });
    } else {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  }
};

const scrollToNext = () => jumpSection(1);

const onRightScroll = () => {
  const col = document.getElementById('right-col');
  if (!col) return;
  showTopNav.value = col.scrollTop > 300;
  showBottomNav.value = col.scrollTop < (col.scrollHeight - col.clientHeight - 300);
};

const updateCountdown = () => {
  const target = new Date(props.data.tanggalAkad || '2026-06-15T08:00:00').getTime();
  const now = new Date().getTime();
  const diff = Math.max(0, target - now);
  
  countdownMain.value = {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000)
  };
};

let timer;
onMounted(() => {
  document.body.classList.add('lock-scroll');
  updateCountdown();
  timer = setInterval(updateCountdown, 1000);
  
  window.addEventListener('scroll', () => {
    if (window.innerWidth < 1024) {
      showTopNav.value = window.scrollY > 300;
      showBottomNav.value = window.scrollY < (document.documentElement.scrollHeight - window.innerHeight - 300);
    }
  });
});

onUnmounted(() => {
  document.body.classList.remove('lock-scroll');
  clearInterval(timer);
});
</script>

<style scoped>
.montain-template-root {
  isolation: isolate;
  background-color: #f0fdfa;
}
</style>
