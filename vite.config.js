import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

const entry = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  plugins: [vue()],
  base: './',
  build: {
    rolldownOptions: {
      input: {
        index: entry('./index.html'),
        starter: entry('./01-vue/vue.html'),
        weather: entry('./09-監視屬性-watch/Vue-天氣範例.html'),
        watch: entry('./09-監視屬性-watch/Vue-watch.html'),
        deepWatch: entry('./09-監視屬性-watch/Vue-watch-深度監視.html'),
        lists: entry('./11-列表渲染/基本列表.html'),
      },
    },
  },
});
