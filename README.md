# vue-examples

Vue 3 學習範例集，以 **Composition API、`<script setup>` 與 Vite** 重寫既有教材。
首頁提供五個主題入口；各範例保持獨立 HTML 路徑，使用單檔元件（SFC）實作互動。

## 版本分支

| 分支 | 用途 |
| --- | --- |
| [`main`](https://github.com/iankingh/vue-examples/tree/main) | Vue 3 範例與後續維護 |
| [`vue2`](https://github.com/iankingh/vue-examples/tree/vue2) | 保留原本 Vue 2.7.16 範例、離線 runtime 與瀏覽器測試 |

`vue2` 從 Vue 3 改寫前的 commit `3ae4734` 建立，完整保留原版本。
切換前先提交或暫存自己的修改；切換後執行 `npm ci`，讓依賴符合該分支的 lockfile。
Vue 2 教材僅供歷史對照，其執行方式請見 `vue2` 分支的 README。

## 技術與環境

- Vue `3.5.44`
- Vite `8.3.4`、`@vitejs/plugin-vue` `6.0.10`
- JavaScript ES modules；目前不使用 TypeScript、Router 或 Pinia
- Node.js `^20.19.0 || >=22.12.0`、npm
- Playwright `1.63.0`：開發與正式建置的瀏覽器驗收

Vue 由 npm 與 lockfile 管理，頁面不依賴遠端 CDN。
SFC 需要 Vite 編譯，請透過開發伺服器或正式版預覽開啟，不能直接以 `file://` 執行原始 HTML。

## 安裝與執行

```bash
npm ci
npm run dev
```

開啟終端顯示的網址（預設 `http://127.0.0.1:5173/`），再選擇主題。

```bash
npm run build      # 建立正式版至 dist/
npm run preview    # 預覽 dist/，預設 http://127.0.0.1:4173/
```

建置使用相對資產路徑，可將完整 `dist/` 放在網站根目錄或子目錄。
此專案尚未設定自動網站發布；CI 只執行建置與瀏覽器驗收。

## 學習主題

| 頁面入口 | 元件來源 | 內容 |
| --- | --- | --- |
| [01-vue/vue.html](01-vue/vue.html) | [Starter.vue](src/examples/Starter.vue)、[v.vue](01-vue/v.vue) | `createApp`、`ref`、SFC、`defineProps`、`defineEmits`；表格的選擇／刪除事件 |
| [Vue-天氣範例.html](09-監視屬性-watch/Vue-天氣範例.html) | [WeatherComputed.vue](src/examples/WeatherComputed.vue) | `ref` 與 `computed`，雙向切換天氣 |
| [Vue-watch.html](09-監視屬性-watch/Vue-watch.html) | [WeatherWatch.vue](src/examples/WeatherWatch.vue) | `watch(ref)`、新舊值與畫面上的監視紀錄 |
| [Vue-watch-深度監視.html](09-監視屬性-watch/Vue-watch-深度監視.html) | [DeepWatch.vue](src/examples/DeepWatch.vue) | `deep: true`、內部屬性變更、物件替換與新舊引用 |
| [基本列表.html](11-列表渲染/基本列表.html) | [ListRendering.vue](src/examples/ListRendering.vue) | `reactive`、陣列／物件渲染、ID／index key、重排與增刪 |

深度監視不會自動保存變更前的深層副本。修改內部屬性時，新舊值指向同一物件；
替換 `numbers.value` 時，新舊引用才不同。範例另存顯示快照，方便觀察每次回呼。

列表的第二組刻意使用 index key，展示未綁定的輸入值可能留在原位置。
第一組使用穩定 ID，輸入值會跟著原來的同學移動。

原本的 `01-vue/v.vue` 已接入 Starter，示範 props 傳入聯絡人資料與 emits 通知父元件。
`Edit` 按鈕只選擇聯絡人，沒有編輯表單；`Delete` 會移除聯絡人。
範例資料只存在記憶體，重新載入頁面即重設。

## Vue 2 → Vue 3 對照

| 原寫法 | main 的寫法 |
| --- | --- |
| `new Vue({ el: '#root' })` | `createApp(Component).mount('#root')` |
| Options API 的 `data` | `ref`／`reactive` |
| `computed: { ... }` | `computed(() => ...)` |
| `watch: { ... }` | `watch(source, callback, options)` |
| `props`／`methods`＋`$emit` | `<script setup>` 的 `defineProps`／`defineEmits` 與 template 事件 |
| 本地 `js/vue.js` | npm 鎖定的 Vue 3 與 Vite 建置 |

## 驗收

```bash
npm ci
npx playwright install chromium
npm test
```

Linux CI 首次安裝可使用 `npx playwright install --with-deps chromium`。
也可設定 `CHROME_BIN=/absolute/path/to/chrome npm test` 使用現有 Chrome／Chromium。

測試先建立正式版，再自動啟動隔離的本機 Vite 開發／預覽伺服器，對兩種模式執行同一組互動驗收：
首頁與五個入口、Vue 3 掛載、表格 props／events、天氣切換、watch 新舊值、深度監視引用、
列表 DOM identity／未儲存輸入，以及清空列表後的按鈕與唯一 ID。
每個測試頁面都檢查 Vue warnings 與瀏覽器錯誤；結束後關閉伺服器與瀏覽器。

## 官方參考

- [Vue 快速開始](https://vuejs.org/guide/quick-start.html)
- [Composition API](https://vuejs.org/guide/extras/composition-api-faq.html)
- [Watchers](https://vuejs.org/guide/essentials/watchers.html)
- [Vue 3 遷移指南](https://v3-migration.vuejs.org/)
