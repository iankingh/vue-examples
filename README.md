# vue-examples

Vue 2 基礎學習筆記與可直接在瀏覽器開啟的練習頁面。範例透過本地 `js/vue.js` 載入 **Vue.js 2.7.16**，不是 Vue CLI、Vite 或 Vue 3 專案。

> **正式環境警告：**`js/vue.js` 是供本學習範例使用的 Vue 開發版，不應部署或用於正式環境。
> 正式網站應使用適當設定的 production build。
> **生命週期限制：**Vue 2 已於 2023-12-31 結束支援；2.7.16 是 Vue 2 系列最後的 patch。
> 本教材刻意保留 Vue 2 Options API 語意，並未靜默遷移至 Vue 3。若用於正式環境，
> 應規劃遷移至受支援的 Vue 版本。

## 學習內容

| 路徑 | 內容 |
|---|---|
| `01-vue/vue.html` | 建立空白 `new Vue` instance 與掛載節點 |
| `01-vue/v.vue` | 未接入建置流程的 table 單檔元件草稿，示範 props、`v-for` 與自訂事件 |
| `09-監視屬性-watch/Vue-天氣範例.html` | computed property 與事件切換 |
| `09-監視屬性-watch/Vue-watch.html` | watch 選項範例 |
| `09-監視屬性-watch/Vue-watch-深度監視.html` | 物件的 deep watch |
| `11-列表渲染/基本列表.html` | 使用 `v-for` 渲染陣列與物件 |
| `js/vue.js` | 本地 Vue.js 2.7.14 development build |

## 環境需求與執行

只需現代瀏覽器，不需 Node.js 或 npm：

1. Clone 或下載此倉庫。
2. 直接以瀏覽器開啟任一 `.html` 範例。
3. watch 範例的輸出請在瀏覽器 DevTools Console 查看。

頁面本身不需安裝步驟或環境變數，也沒有 dev server、build、lint 或 production
deployment 設定。根目錄的 `package.json` 僅用於可選的瀏覽器驗收。

## 瀏覽器驗收

```bash
npm ci
npx playwright install chromium
npm test
```

也可用 `CHROME_BIN=/absolute/path/to/chrome npm test` 使用既有 Chrome／Chromium。
六個 browser tests 驗證 Vue 掛載、雙向天氣切換、watch old/new 值、
deep watch 變更與物件替換的 reference 語意，以及 ID／index key 在重排、插入、
刪除時的 DOM identity 和未儲存輸入狀態。測試也要求沒有 Vue warnings 或瀏覽器錯誤；
不把 `01-vue/v.vue` 草稿當作已編譯或已驗收的應用程式。

## Vendored dependency provenance

`js/vue.js` 是 Vue.js 2.7.16 的 development build（由 npm distribution `dist/vue.js` 取得，並將 CRLF 正規化為 LF）。檔頭記載 `Vue.js v2.7.16`、`(c) 2014-2023 Evan You` 與 MIT License，檔案內的 `Vue.version` 亦為 `2.7.16`。

- 上游專案：[vuejs/vue](https://github.com/vuejs/vue)
- 發行來源：[npm 套件 `vue@2.7.16`](https://www.npmjs.com/package/vue/v/2.7.16)，distribution path 為 `dist/vue.js`
- 對應原始碼版本：[Vue.js v2.7.16](https://github.com/vuejs/vue/tree/v2.7.16)
- 本地檔案：`js/vue.js`
- 本地 SHA-256：`57110669bfdc4edb41f092bbc51ca1568c1982c7e11fe4c17c156e376eafb63d`
- 授權：[MIT License（v2.7.16）](https://github.com/vuejs/vue/blob/v2.7.16/LICENSE)

## 專案狀態與限制

- 內容是獨立的 Vue 2 練習片段，不構成單一應用程式。
- `01-vue/v.vue` 需要另行建立支援 Vue SFC 的專案才能編譯；本倉庫未提供該工具鏈。

## 延伸資源

- [Vue 2 文件](https://v2.vuejs.org/)
- [Vue 官方文件](https://vuejs.org/)
- [重新認識 Vue.js](https://book.vue.tw/)
