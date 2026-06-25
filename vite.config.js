import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // GitHub Pages 專案頁路徑，需與 repo 名稱一致
  base: '/demo-sport-card-collection/',
  plugins: [vue(), tailwindcss()],
  server: {
    open: true,
  },
});
