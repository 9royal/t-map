# T map v1.05.4 部署更新

建議繼續使用 `v1.05-testing` 測試分支。

1. 在 repository 外解壓 `T-map-v1.05.4-update.zip`。
2. 將內容複製到 t-map repository 根目錄並取代同名檔案。
3. GitHub Desktop 應直接看到 `index.html`、`js/app.js`、`scripts/china-map.mjs` 等路徑，不應多出外層資料夾。
4. Commit → Push origin。
5. 等 Cloudflare `v1.05-testing` Preview 建置成功後再實測。

Cloudflare 維持：

```text
Build command: npm run build && npm run verify
Build output directory: dist
Root directory: 留空
```

v1.05.4 新增 npm 依賴 `@svg-maps/china@2.0.0`。Cloudflare 每次乾淨建置會透過 `npm install` / 平台依賴安裝流程取得套件，再由 `scripts/build.mjs` 產生本地 `data/china-provinces.json`。
