import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

let buildTimestamp;

const versionPlugin = {
  name: 'version-timestamp',
  config(config) {
    buildTimestamp = Date.now();
    return {
      define: {
        ...config.define,
        __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp),
      },
    };
  },
  closeBundle() {
    const outDir = path.resolve(__dirname, 'dist');
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, 'version.json'),
      JSON.stringify({ timestamp: buildTimestamp })
    );
  },
};

export default defineConfig({
  root: __dirname,
  define: {
    global: 'window',
  },
  plugins: [
    versionPlugin,
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icon.png'],
      manifest: {
        name: 'PWASupperApps',
        short_name: 'PWASupperApps',
        description: 'PWASupperApps - Kirim pesan bulk via PWA',
        theme_color: '#25D366',
        background_color: '#111827',
        display: 'standalone',
        orientation: 'any',
        scope: '/',
        start_url: '/',
        id: '/',
        icons: [
          { src: 'icon.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icon.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icon.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        categories: ['productivity', 'utilities'],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        navigateFallbackDenylist: [/^\/version\.json$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/localhost(:\d+)?\/db\/.*/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'pouchdb-sync',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: { enabled: true },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src/client'),
      '@template': path.resolve(__dirname, 'src/template'),
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, 'index.html'),
    },
  },
});
