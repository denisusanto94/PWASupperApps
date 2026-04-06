// vite.config.js
import { defineConfig } from "file:///D:/Pekerjaan/Freelance/pwa/PWASupperApps/node_modules/vite/dist/node/index.js";
import vue from "file:///D:/Pekerjaan/Freelance/pwa/PWASupperApps/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { VitePWA } from "file:///D:/Pekerjaan/Freelance/pwa/PWASupperApps/node_modules/vite-plugin-pwa/dist/index.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///D:/Pekerjaan/Freelance/pwa/PWASupperApps/vite.config.js";
var __dirname = path.dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var buildTimestamp;
var versionPlugin = {
  name: "version-timestamp",
  config(config) {
    buildTimestamp = Date.now();
    return {
      define: {
        ...config.define,
        __BUILD_TIMESTAMP__: JSON.stringify(buildTimestamp)
      }
    };
  },
  closeBundle() {
    const outDir = path.resolve(__dirname, "dist");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(
      path.join(outDir, "version.json"),
      JSON.stringify({ timestamp: buildTimestamp })
    );
  }
};
var vite_config_default = defineConfig({
  root: __dirname,
  define: {
    global: "window"
  },
  plugins: [
    versionPlugin,
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icon.png"],
      manifest: {
        name: "PWASupperApps",
        short_name: "PWASupperApps",
        description: "PWASupperApps - Kirim pesan bulk via PWA",
        theme_color: "#25D366",
        background_color: "#111827",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        id: "/",
        icons: [
          { src: "icon.png", sizes: "192x192", type: "image/png", purpose: "any" },
          { src: "icon.png", sizes: "512x512", type: "image/png", purpose: "any" },
          { src: "icon.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ],
        categories: ["productivity", "utilities"]
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        navigateFallbackDenylist: [/^\/version\.json$/],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/localhost(:\d+)?\/db\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "pouchdb-sync",
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
              cacheableResponse: { statuses: [0, 200] }
            }
          }
        ]
      },
      devOptions: { enabled: true }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src/client"),
      "@template": path.resolve(__dirname, "src/template")
    }
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(__dirname, "index.html")
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJEOlxcXFxQZWtlcmphYW5cXFxcRnJlZWxhbmNlXFxcXHB3YVxcXFxQV0FTdXBwZXJBcHBzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJEOlxcXFxQZWtlcmphYW5cXFxcRnJlZWxhbmNlXFxcXHB3YVxcXFxQV0FTdXBwZXJBcHBzXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9EOi9QZWtlcmphYW4vRnJlZWxhbmNlL3B3YS9QV0FTdXBwZXJBcHBzL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCB2dWUgZnJvbSAnQHZpdGVqcy9wbHVnaW4tdnVlJztcclxuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gJ3ZpdGUtcGx1Z2luLXB3YSc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoIH0gZnJvbSAndXJsJztcclxuXHJcbmNvbnN0IF9fZGlybmFtZSA9IHBhdGguZGlybmFtZShmaWxlVVJMVG9QYXRoKGltcG9ydC5tZXRhLnVybCkpO1xyXG5cclxubGV0IGJ1aWxkVGltZXN0YW1wO1xyXG5cclxuY29uc3QgdmVyc2lvblBsdWdpbiA9IHtcclxuICBuYW1lOiAndmVyc2lvbi10aW1lc3RhbXAnLFxyXG4gIGNvbmZpZyhjb25maWcpIHtcclxuICAgIGJ1aWxkVGltZXN0YW1wID0gRGF0ZS5ub3coKTtcclxuICAgIHJldHVybiB7XHJcbiAgICAgIGRlZmluZToge1xyXG4gICAgICAgIC4uLmNvbmZpZy5kZWZpbmUsXHJcbiAgICAgICAgX19CVUlMRF9USU1FU1RBTVBfXzogSlNPTi5zdHJpbmdpZnkoYnVpbGRUaW1lc3RhbXApLFxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICB9LFxyXG4gIGNsb3NlQnVuZGxlKCkge1xyXG4gICAgY29uc3Qgb3V0RGlyID0gcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ2Rpc3QnKTtcclxuICAgIGZzLm1rZGlyU3luYyhvdXREaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pO1xyXG4gICAgZnMud3JpdGVGaWxlU3luYyhcclxuICAgICAgcGF0aC5qb2luKG91dERpciwgJ3ZlcnNpb24uanNvbicpLFxyXG4gICAgICBKU09OLnN0cmluZ2lmeSh7IHRpbWVzdGFtcDogYnVpbGRUaW1lc3RhbXAgfSlcclxuICAgICk7XHJcbiAgfSxcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XHJcbiAgcm9vdDogX19kaXJuYW1lLFxyXG4gIGRlZmluZToge1xyXG4gICAgZ2xvYmFsOiAnd2luZG93JyxcclxuICB9LFxyXG4gIHBsdWdpbnM6IFtcclxuICAgIHZlcnNpb25QbHVnaW4sXHJcbiAgICB2dWUoKSxcclxuICAgIFZpdGVQV0Eoe1xyXG4gICAgICByZWdpc3RlclR5cGU6ICdhdXRvVXBkYXRlJyxcclxuICAgICAgaW5jbHVkZUFzc2V0czogWydmYXZpY29uLmljbycsICdyb2JvdHMudHh0JywgJ2ljb24ucG5nJ10sXHJcbiAgICAgIG1hbmlmZXN0OiB7XHJcbiAgICAgICAgbmFtZTogJ1BXQVN1cHBlckFwcHMnLFxyXG4gICAgICAgIHNob3J0X25hbWU6ICdQV0FTdXBwZXJBcHBzJyxcclxuICAgICAgICBkZXNjcmlwdGlvbjogJ1BXQVN1cHBlckFwcHMgLSBLaXJpbSBwZXNhbiBidWxrIHZpYSBQV0EnLFxyXG4gICAgICAgIHRoZW1lX2NvbG9yOiAnIzI1RDM2NicsXHJcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogJyMxMTE4MjcnLFxyXG4gICAgICAgIGRpc3BsYXk6ICdzdGFuZGFsb25lJyxcclxuICAgICAgICBvcmllbnRhdGlvbjogJ3BvcnRyYWl0JyxcclxuICAgICAgICBzY29wZTogJy8nLFxyXG4gICAgICAgIHN0YXJ0X3VybDogJy8nLFxyXG4gICAgICAgIGlkOiAnLycsXHJcbiAgICAgICAgaWNvbnM6IFtcclxuICAgICAgICAgIHsgc3JjOiAnaWNvbi5wbmcnLCBzaXplczogJzE5MngxOTInLCB0eXBlOiAnaW1hZ2UvcG5nJywgcHVycG9zZTogJ2FueScgfSxcclxuICAgICAgICAgIHsgc3JjOiAnaWNvbi5wbmcnLCBzaXplczogJzUxMng1MTInLCB0eXBlOiAnaW1hZ2UvcG5nJywgcHVycG9zZTogJ2FueScgfSxcclxuICAgICAgICAgIHsgc3JjOiAnaWNvbi5wbmcnLCBzaXplczogJzUxMng1MTInLCB0eXBlOiAnaW1hZ2UvcG5nJywgcHVycG9zZTogJ21hc2thYmxlJyB9LFxyXG4gICAgICAgIF0sXHJcbiAgICAgICAgY2F0ZWdvcmllczogWydwcm9kdWN0aXZpdHknLCAndXRpbGl0aWVzJ10sXHJcbiAgICAgIH0sXHJcbiAgICAgIHdvcmtib3g6IHtcclxuICAgICAgICBnbG9iUGF0dGVybnM6IFsnKiovKi57anMsY3NzLGh0bWwsaWNvLHBuZyxzdmcsd29mZjJ9J10sXHJcbiAgICAgICAgbmF2aWdhdGVGYWxsYmFja0RlbnlsaXN0OiBbL15cXC92ZXJzaW9uXFwuanNvbiQvXSxcclxuICAgICAgICBydW50aW1lQ2FjaGluZzogW1xyXG4gICAgICAgICAge1xyXG4gICAgICAgICAgICB1cmxQYXR0ZXJuOiAvXmh0dHBzOlxcL1xcL2xvY2FsaG9zdCg6XFxkKyk/XFwvZGJcXC8uKi8sXHJcbiAgICAgICAgICAgIGhhbmRsZXI6ICdOZXR3b3JrRmlyc3QnLFxyXG4gICAgICAgICAgICBvcHRpb25zOiB7XHJcbiAgICAgICAgICAgICAgY2FjaGVOYW1lOiAncG91Y2hkYi1zeW5jJyxcclxuICAgICAgICAgICAgICBuZXR3b3JrVGltZW91dFNlY29uZHM6IDEwLFxyXG4gICAgICAgICAgICAgIGV4cGlyYXRpb246IHsgbWF4RW50cmllczogMTAwLCBtYXhBZ2VTZWNvbmRzOiA2MCAqIDYwICogMjQgfSxcclxuICAgICAgICAgICAgICBjYWNoZWFibGVSZXNwb25zZTogeyBzdGF0dXNlczogWzAsIDIwMF0gfSxcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSxcclxuICAgICAgZGV2T3B0aW9uczogeyBlbmFibGVkOiB0cnVlIH0sXHJcbiAgICB9KSxcclxuICBdLFxyXG4gIHJlc29sdmU6IHtcclxuICAgIGFsaWFzOiB7XHJcbiAgICAgICdAJzogcGF0aC5yZXNvbHZlKF9fZGlybmFtZSwgJ3NyYy9jbGllbnQnKSxcclxuICAgICAgJ0B0ZW1wbGF0ZSc6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdzcmMvdGVtcGxhdGUnKSxcclxuICAgIH0sXHJcbiAgfSxcclxuICBidWlsZDoge1xyXG4gICAgb3V0RGlyOiAnZGlzdCcsXHJcbiAgICBlbXB0eU91dERpcjogdHJ1ZSxcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgaW5wdXQ6IHBhdGgucmVzb2x2ZShfX2Rpcm5hbWUsICdpbmRleC5odG1sJyksXHJcbiAgICB9LFxyXG4gIH0sXHJcbn0pO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQW9ULFNBQVMsb0JBQW9CO0FBQ2pWLE9BQU8sU0FBUztBQUNoQixTQUFTLGVBQWU7QUFDeEIsT0FBTyxVQUFVO0FBQ2pCLE9BQU8sUUFBUTtBQUNmLFNBQVMscUJBQXFCO0FBTG1LLElBQU0sMkNBQTJDO0FBT2xQLElBQU0sWUFBWSxLQUFLLFFBQVEsY0FBYyx3Q0FBZSxDQUFDO0FBRTdELElBQUk7QUFFSixJQUFNLGdCQUFnQjtBQUFBLEVBQ3BCLE1BQU07QUFBQSxFQUNOLE9BQU8sUUFBUTtBQUNiLHFCQUFpQixLQUFLLElBQUk7QUFDMUIsV0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sR0FBRyxPQUFPO0FBQUEsUUFDVixxQkFBcUIsS0FBSyxVQUFVLGNBQWM7QUFBQSxNQUNwRDtBQUFBLElBQ0Y7QUFBQSxFQUNGO0FBQUEsRUFDQSxjQUFjO0FBQ1osVUFBTSxTQUFTLEtBQUssUUFBUSxXQUFXLE1BQU07QUFDN0MsT0FBRyxVQUFVLFFBQVEsRUFBRSxXQUFXLEtBQUssQ0FBQztBQUN4QyxPQUFHO0FBQUEsTUFDRCxLQUFLLEtBQUssUUFBUSxjQUFjO0FBQUEsTUFDaEMsS0FBSyxVQUFVLEVBQUUsV0FBVyxlQUFlLENBQUM7QUFBQSxJQUM5QztBQUFBLEVBQ0Y7QUFDRjtBQUVBLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFFBQVE7QUFBQSxJQUNOLFFBQVE7QUFBQSxFQUNWO0FBQUEsRUFDQSxTQUFTO0FBQUEsSUFDUDtBQUFBLElBQ0EsSUFBSTtBQUFBLElBQ0osUUFBUTtBQUFBLE1BQ04sY0FBYztBQUFBLE1BQ2QsZUFBZSxDQUFDLGVBQWUsY0FBYyxVQUFVO0FBQUEsTUFDdkQsVUFBVTtBQUFBLFFBQ1IsTUFBTTtBQUFBLFFBQ04sWUFBWTtBQUFBLFFBQ1osYUFBYTtBQUFBLFFBQ2IsYUFBYTtBQUFBLFFBQ2Isa0JBQWtCO0FBQUEsUUFDbEIsU0FBUztBQUFBLFFBQ1QsYUFBYTtBQUFBLFFBQ2IsT0FBTztBQUFBLFFBQ1AsV0FBVztBQUFBLFFBQ1gsSUFBSTtBQUFBLFFBQ0osT0FBTztBQUFBLFVBQ0wsRUFBRSxLQUFLLFlBQVksT0FBTyxXQUFXLE1BQU0sYUFBYSxTQUFTLE1BQU07QUFBQSxVQUN2RSxFQUFFLEtBQUssWUFBWSxPQUFPLFdBQVcsTUFBTSxhQUFhLFNBQVMsTUFBTTtBQUFBLFVBQ3ZFLEVBQUUsS0FBSyxZQUFZLE9BQU8sV0FBVyxNQUFNLGFBQWEsU0FBUyxXQUFXO0FBQUEsUUFDOUU7QUFBQSxRQUNBLFlBQVksQ0FBQyxnQkFBZ0IsV0FBVztBQUFBLE1BQzFDO0FBQUEsTUFDQSxTQUFTO0FBQUEsUUFDUCxjQUFjLENBQUMsc0NBQXNDO0FBQUEsUUFDckQsMEJBQTBCLENBQUMsbUJBQW1CO0FBQUEsUUFDOUMsZ0JBQWdCO0FBQUEsVUFDZDtBQUFBLFlBQ0UsWUFBWTtBQUFBLFlBQ1osU0FBUztBQUFBLFlBQ1QsU0FBUztBQUFBLGNBQ1AsV0FBVztBQUFBLGNBQ1gsdUJBQXVCO0FBQUEsY0FDdkIsWUFBWSxFQUFFLFlBQVksS0FBSyxlQUFlLEtBQUssS0FBSyxHQUFHO0FBQUEsY0FDM0QsbUJBQW1CLEVBQUUsVUFBVSxDQUFDLEdBQUcsR0FBRyxFQUFFO0FBQUEsWUFDMUM7QUFBQSxVQUNGO0FBQUEsUUFDRjtBQUFBLE1BQ0Y7QUFBQSxNQUNBLFlBQVksRUFBRSxTQUFTLEtBQUs7QUFBQSxJQUM5QixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBLE1BQ0wsS0FBSyxLQUFLLFFBQVEsV0FBVyxZQUFZO0FBQUEsTUFDekMsYUFBYSxLQUFLLFFBQVEsV0FBVyxjQUFjO0FBQUEsSUFDckQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsSUFDUixhQUFhO0FBQUEsSUFDYixlQUFlO0FBQUEsTUFDYixPQUFPLEtBQUssUUFBUSxXQUFXLFlBQVk7QUFBQSxJQUM3QztBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
