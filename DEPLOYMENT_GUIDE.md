# T map v1.05.8 部署

## GitHub / Cloudflare Pages

繼續使用 `v1.05-testing` 先跑 Preview。

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
T map v1.05.8 world display and Oceania fixes
```

## 北極海

本版依需求維持原世界主圖感應方式，**不新增北極海獨立放大定位區**。
