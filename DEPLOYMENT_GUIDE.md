# T map v1.05.8 修正版部署

## GitHub / Cloudflare Pages

本包維持 v1.05.8 版本號，修正東帝汶分類造成的部署驗證失敗。繼續使用 `v1.05-testing` 先跑 Preview。

**請覆蓋整份更新包**，包含 `scripts/`、`tests/`、`js/`、`index.html`、`_headers`、`package.json` 與 `package-lock.json`，不要只替換 `verify.mjs`。

Cloudflare Pages：

- Build command: `npm run build && npm run verify`
- Output directory: `dist`
- Production branch: `main`
- Node.js: 22

## 套件

v1.05.8 沒有新增 npm 套件，沿用：

- `d3@7.9.0`
- `topojson-client@3.1.0`
- `taiwan-atlas@2021.9.20`
- `@svg-maps/china@2.0.0`
- `countries-list@3.4.1`
- `world-atlas@2.0.2`

## 更新方式

1. 將 `T-map-v1.05.8-update.zip` 放在 repository 外解壓。
2. 把 ZIP 內檔案／資料夾內容覆蓋到 `t-map` 根目錄。
3. GitHub Desktop 確認路徑直接是 `css/style.css`、`js/app.js`、`scripts/world-map.mjs` 等，不可多一層 `T-map-v1.05.8-update\...`。
4. Commit 到 `v1.05-testing`。
5. Push origin。
6. Cloudflare Preview 成功後依 `TESTING.md` 驗收。

建議 Commit：

```text
Fix T map v1.05.8 deployment and keep Timor-Leste only in Asia
```

## 北極海

本版依需求維持原世界主圖感應方式，**不新增北極海獨立放大定位區**。

## 修正版驗收

1. Cloudflare log 中 `npm run build && npm run verify` 完整成功，不再出現「東帝汶應保留亞洲關卡」。
2. 亞洲國家拼圖可找到「東帝汶」。
3. 大洋洲只出現澳洲、紐西蘭、巴布亞紐幾內亞、索羅門群島、萬那杜、新喀里多尼亞、斐濟，共 7 區；東帝汶不出現在大洋洲。
4. 世界第一層的東帝汶輪廓歸於亞洲。
5. 開啟新的 Preview 網址檢查；若沿用已開啟的網頁，重新整理以載入修正版程式。

本次已完成本機真實套件建置與驗證；Cloudflare 線上部署結果需在推送後確認。
