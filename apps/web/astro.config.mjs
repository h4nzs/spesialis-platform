// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import node from '@astrojs/node';

/** @type {any} */
let visualizerPlugin;
if (process.env['ANALYZE'] === 'true') {
  const { visualizer } = await import('rollup-plugin-visualizer');
  visualizerPlugin = visualizer({
    filename: 'dist/stats.html',
    gzipSize: true,
    brotliSize: true,
  });
}

export default defineConfig({
  site: 'https://spesialis.id',
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  compressHTML: true,
  scopedStyleStrategy: 'where',
  build: {
    assets: '_assets',
    inlineStylesheets: 'auto',
  },
  integrations: [
    react(),
    sitemap({
      filter: (page) =>
        !page.includes('/dashboard/') &&
        !page.includes('/login') &&
        !page.includes('/register') &&
        !page.includes('/forgot-password') &&
        !page.includes('/reset-password') &&
        !page.includes('/verify-email'),
    }),
  ],
  server: {},
  vite: {
    plugins: [tailwindcss(), visualizerPlugin].filter(Boolean),
    envDir: '../..',
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks(id) {
            // UI library — biggest contributor (>200KB with TipTap)
            if (id.includes('@specialist/ui')) return 'vendor-ui';
            // React is already auto-split by Astro at ~19KB — no need
            // TipTap editor (part of @specialist/ui but also standalone)
            if (id.includes('node_modules/@tiptap')) return 'vendor-editor';
            // Lucide icons — can be 100KB+
            if (id.includes('node_modules/lucide-react')) return 'vendor-icons';
            // Zod validation — shared across dashboard
            if (id.includes('node_modules/zod')) return 'vendor-validation';
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': { target: 'http://localhost:3000', changeOrigin: true },
      },
    },
  },
});
