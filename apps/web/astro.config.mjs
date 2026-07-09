// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://spesialis.id',
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
    plugins: [tailwindcss()],
    envDir: '../..',
    server: {
      proxy: {
        '/api': { target: 'http://localhost:3000', changeOrigin: true },
      },
    },
  },
});
