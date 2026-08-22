/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: { port: 5177 },
  test: {
    environment: 'jsdom',
    globals: true,
    css: false,
  },
});
