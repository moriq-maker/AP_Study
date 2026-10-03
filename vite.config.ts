import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    // ホーム画面に追加してアプリとして起動でき、オフラインでも解けるようにする
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['brand/*.png', 'brand/*.webp'],
      manifest: {
        name: 'AP Study 応用情報 過去問演習',
        short_name: 'AP Study',
        description: '応用情報技術者試験の過去問倉庫と一問一答',
        lang: 'ja',
        display: 'standalone',
        start_url: './',
        scope: './',
        theme_color: '#f5f6fb',
        background_color: '#f5f6fb',
        icons: [
          { src: 'brand/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'brand/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'brand/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // アプリ本体と午前の図(小さい PNG)は最初に開いたときにまとめて保存する
        globPatterns: ['**/*.{js,css,html}', 'brand/*.{png,webp}', 'figures/**/*.png'],
        maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // 午後の問題冊子のページ画像は大きいので、開いたものから保存する
            urlPattern: ({ url }) => url.pathname.includes('/figures/') && url.pathname.endsWith('.webp'),
            handler: 'CacheFirst',
            options: { cacheName: 'pm-pages' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.googleapis.com',
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'google-fonts-css' },
          },
          {
            urlPattern: ({ url }) => url.origin === 'https://fonts.gstatic.com',
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts',
              cacheableResponse: { statuses: [0, 200] },
              expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  // GitHub Pages 等のサブパス配信でも動くよう相対パスで出力する
  base: './',
});
