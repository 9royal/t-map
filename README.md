# T map v1.02 — 部署穩定版

臺灣行政區互動拼圖。v1.02 的重點是「學生端零 CDN 依賴」：第三方函式庫與行政區圖資在部署建置時固定版本並複製到網站自己的 `dist/`，學生開啟網站時只連到 T map 所在網域。

## v1.02 的穩定化設計

- D3.js 固定 7.9.0。
- topojson-client 固定 3.1.0。
- taiwan-atlas 固定 2021.9.20。
- 建置後使用 `lib/d3.min.js`、`lib/topojson-client.min.js`。
- 建置後使用 `data/counties-10t.json`、`data/towns-10t.json`。
- 建置時驗證 22 縣市與 368 鄉鎮市區。
- `npm run verify` 會檢查部署檔是否仍殘留外部 CDN JS/JSON URL。
- Cloudflare Pages 可直接以 `dist` 作為 Build output directory。

## 專案與部署輸出

```text
T-map-v1.02/
├─ index.html
├─ css/
├─ js/
├─ scripts/
│  ├─ build.mjs
│  ├─ verify.mjs
│  └─ serve.mjs
├─ package.json
├─ _headers
├─ .github/workflows/verify.yml
└─ dist/                 ← 執行 npm run build 後產生
   ├─ index.html
   ├─ css/
   ├─ js/
   ├─ lib/
   │  ├─ d3.min.js
   │  └─ topojson-client.min.js
   └─ data/
      ├─ counties-10t.json
      └─ towns-10t.json
```

## 本機建置

需要 Node.js 20 以上（建議 Node.js 22）。

```bash
npm install
npm run build
npm run verify
npm run preview
```

接著瀏覽：`http://127.0.0.1:4173`

> 不建議直接雙擊 `index.html`。瀏覽器對 `file://` 載入 JSON 有安全限制；正式使用請經 GitHub/Cloudflare 或本機 HTTP server。

## Cloudflare Pages 設定

- Production branch：`main`
- Build command：`npm run build && npm run verify`
- Build output directory：`dist`
- Root directory：留空（repository 根目錄）

Cloudflare 會先依 `package.json` 安裝固定版本依賴，再執行建置。部署後學生端只讀取同網域的靜態檔案。

## API / 網路依賴

### 不使用

- 不使用 OpenAI API
- 不使用 Gemini API
- 不使用 Google Maps API
- 不使用 Firebase API
- 不需要 API Key
- 不需要後端資料庫

### 使用的瀏覽器能力

- Web Speech API：中文名稱朗讀。
- Web Audio API：完成慶祝音效。
- localStorage：在使用者瀏覽器保存設定與進度。
- Pointer Events：滑鼠／觸控／觸控筆操作。
- Fetch API：只讀取 T map **自己網域內**的 `data/*.json`。

> Web Speech API 的實際語音由瀏覽器／作業系統提供；部分裝置的語音服務實作可能由作業系統自行使用網路，T map 本身不傳送 API Key 或呼叫第三方語音端點。

## 資料來源

行政區圖資採 taiwan-atlas 2021.9.20；該專案說明其 TopoJSON 由內政部直轄市／縣市界線與鄉鎮市區界線公開資料轉製。

版本：T map v1.02
