<template>
  <div class="news-google mt-10 mb-6">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      <!-- Premium News Header -->
      <div class="flex items-center justify-between mb-8 animate-fade-in">
        <div class="flex items-center gap-3">
          <div class="news-header-orb">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8"/><path d="M15 18h-5"/><path d="M10 6h8v4h-8V6Z"/></svg>
          </div>
          <div>
            <h2 class="text-xl font-extrabold text-white tracking-tight leading-none italic uppercase">Berita Terkini</h2>
            <div class="flex items-center gap-2 mt-1.5 line-height-tight">
               <span class="px-1.5 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded text-[8px] font-bold text-blue-400 uppercase tracking-widest">Headline</span>
               <span class="text-[9px] text-slate-500 font-bold uppercase tracking-widest opacity-60">Update Real-time</span>
            </div>
          </div>
        </div>
        <button @click="fetchNews" class="refresh-news-pill group" :class="{ 'is-loading': loading }">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-180 transition-transform duration-500"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20 gap-4">
        <div class="news-fancy-spinner"></div>
        <p class="text-slate-500 text-[9px] font-bold uppercase tracking-[0.4em] animate-pulse">Memuat Informasi Berita</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="glass-err-news p-8 rounded-3xl text-center border border-red-500/10 mb-8 mx-auto max-w-lg">
        <p class="text-xs font-bold text-slate-400 mb-4">{{ error }}</p>
        <button @click="fetchNews" class="px-5 py-2 bg-red-500/10 hover:bg-red-500/20 rounded-full text-[9px] font-black text-red-500 transition-colors uppercase tracking-widest">Reload Berita</button>
      </div>

      <!-- News Content List -->
      <div v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in px-1">
          <div v-for="(news, index) in newsList" :key="index" class="news-premium-card group">
              <div class="flex gap-4 items-start">
                  <div v-if="news.image" class="news-media-box shrink-0 overflow-hidden">
                      <img :src="news.image" :alt="news.title" class="news-image-fill scale-100 group-hover:scale-110 transition-transform duration-700" @error="news.image = null" />
                  </div>
                  <div class="flex-grow min-w-0">
                      <div class="flex items-center gap-3 mb-2">
                          <span class="text-[9px] font-black text-blue-400 uppercase tracking-widest truncate max-w-[80px]">{{ news.source }}</span>
                          <span class="text-[8px] text-slate-500 font-bold uppercase tracking-widest">{{ news.time }}</span>
                      </div>
                      <a :href="news.link" target="_blank" class="news-title-text line-clamp-2">
                          {{ news.title }}
                      </a>
                      <div class="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                           <span class="text-[8px] font-black text-blue-400/60 uppercase tracking-widest border-b border-blue-400/20 pb-0.5">Baca Selengkapnya</span>
                      </div>
                  </div>
              </div>
              <div class="news-card-glow"></div>
          </div>
        </div>

        <!-- Load More Button -->
        <div v-if="allNews.length > newsList.length" class="mt-14 mb-4 flex flex-col items-center animate-fade-in">
            <button @click="loadMore" class="news-load-more-circle group">
                <div class="circle-inner">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" class="chevron-icon group-hover:translate-y-1 transition-transform duration-300"><path d="m6 9 6 6 6-6"/></svg>
                </div>
            </button>
            <span class="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-3 opacity-50 group-hover:opacity-100 transition-opacity">Lihat Lebih Banyak</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const newsList = ref([]);
const allNews = ref([]);
const displayLimit = ref(4);
const loading = ref(true);
const error = ref(null);

const loadMore = () => {
  displayLimit.value += 4;
  newsList.value = allNews.value.slice(0, displayLimit.value);
};

const fetchNews = async () => {
  loading.value = true;
  error.value = null;
  try {
    const response = await fetch('/api/news');
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    let results = [];
    
    // Scraper focusing on any article/link pattern
    const links = Array.from(doc.querySelectorAll('a')).filter(a => {
        const h = a.getAttribute('href') || '';
        return h.includes('/read/') || h.includes('/articles/');
    });

    links.forEach(link => {
        let title = link.getAttribute('aria-label') || link.innerText.trim();
        if (title.length < 15) {
            const h = link.querySelector('h3, h4');
            if (h) title = h.innerText.trim();
        }

        if (title.length > 15) {
            let href = link.getAttribute('href');
            if (href.startsWith('.')) href = 'https://news.google.com' + href.substring(1);
            if (!href.startsWith('http')) href = 'https://news.google.com' + href;

            let article = link.closest('article');
            let img = null;
            let source = 'Berita';
            let time = 'Update';

            if (article) {
                const imgEl = article.querySelector('img');
                if (imgEl) img = imgEl.src;
                const srcEl = article.querySelector('div.vr7PYb, span.v7F9Id');
                const timeEl = article.querySelector('time');
                if (srcEl) source = srcEl.innerText.trim().replace('Google News', 'Berita');
                if (timeEl) time = timeEl.innerText.trim();
            }

            results.push({ title, link: href, source, time, image: img });
        }
    });

    // Fallback regex attempt
    if (results.length < 4) {
      const p = /<a[^>]*href="(\.\/read\/[^"]+)"[^>]*aria-label="([^"]+)"/g;
      let m;
      while ((m = p.exec(html)) !== null && results.length < 15) {
          results.push({
              title: m[2],
              link: 'https://news.google.com' + m[1].substring(1),
              source: 'Berita',
              time: 'Terkini',
              image: null
          });
      }
    }

    // Filter duplicates
    allNews.value = results
        .filter((v, i, a) => a.findIndex(t => t.title === v.title) === i);
    
    // Initial display
    newsList.value = allNews.value.slice(0, displayLimit.value);
    
    if (newsList.value.length === 0) {
      error.value = 'Data berita belum tersedia. Silakan segarkan beberapa saat lagi.';
    }
  } catch (err) {
    console.error('News error:', err);
    error.value = 'Koneksi ke server berita gagal.';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchNews);
</script>

<style scoped>
.news-header-orb {
    width: 44px;
    height: 44px;
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 16px -4px rgba(37, 99, 235, 0.4);
}

.refresh-news-pill {
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    padding: 0.5rem;
    border-radius: 10px;
    color: #475569;
    cursor: pointer;
    transition: all 0.3s;
}

.refresh-news-pill:hover {
    color: white;
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.1);
}

.refresh-news-pill.is-loading svg {
    animation: rotate 1s linear infinite;
}

.news-premium-card {
    background: rgba(15, 23, 42, 0.4);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.03);
    border-radius: 20px;
    padding: 1.25rem;
    position: relative;
    overflow: hidden;
    cursor: pointer;
    transition: all 0.4s cubic-bezier(0.23, 1, 0.32, 1);
}

.news-premium-card:hover {
    background: rgba(15, 23, 42, 0.6);
    border-color: rgba(59, 130, 246, 0.2);
    transform: translateY(-4px);
    box-shadow: 0 20px 40px -20px rgba(0, 0, 0, 0.4);
}

.news-media-box {
    width: 90px;
    height: 90px;
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 16px;
}

.news-image-fill {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.news-title-text {
    font-size: 0.85rem;
    font-weight: 700;
    line-height: 1.4;
    color: #e2e8f0;
    text-decoration: none;
    transition: color 0.3s;
}

.news-premium-card:hover .news-title-text {
    color: #ffffff;
}

.news-card-glow {
    position: absolute;
    width: 100px;
    height: 100px;
    background: #2563eb;
    filter: blur(50px);
    opacity: 0;
    top: -50px;
    right: -50px;
    transition: opacity 0.5s;
    pointer-events: none;
}

.news-premium-card:hover .news-card-glow {
    opacity: 0.05;
}

.news-fancy-spinner {
    width: 32px;
    height: 32px;
    border: 3px solid rgba(59, 130, 246, 0.1);
    border-top-color: #2563eb;
    border-radius: 50%;
    animation: rotate 1s linear infinite;
}

@keyframes rotate {
    to { transform: rotate(360deg); }
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.animate-fade-in {
    animation: fadeIn 0.8s ease forwards;
}

.line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.news-load-more-circle {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 50%;
    background: rgba(15, 23, 42, 0.4);
    border: 1px solid rgba(255, 255, 255, 0.05);
    color: #475569;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    backdrop-filter: blur(10px);
}

.news-load-more-circle:hover {
    background: #2563eb;
    border-color: #2563eb;
    color: white;
    box-shadow: 0 10px 20px -5px rgba(37, 99, 235, 0.4);
}

.chevron-icon {
    display: flex;
}
</style>
