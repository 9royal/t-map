# T map v1.05.2 部署更新

建議延續目前 GitHub Desktop + Cloudflare Pages 流程。

1. 保留正式 `main`，在測試分支（例如 `v1.05-testing`）更新。
2. 將 `T-map-v1.05.2-update.zip` 放在 repository 外解壓。
3. 把解壓後的內容複製到 repository 根目錄並取代同名檔案，不要把外層資料夾整包放進 repo。
4. GitHub Desktop 確認 Changes 直接顯示 `index.html`、`js/map-registry.js`、`js/map-engine.js` 等路徑。
5. Commit → Push origin。
6. 先測 Cloudflare Preview，再合併 `main`。

Cloudflare 設定維持：

```text
Build command: npm run build && npm run verify
Build output directory: dist
Root directory: 留空
```

v1.05.2 的中國與世界卡片是平台規劃入口，尚未包含正式圖資，因此 Preview 驗收重點是「新首頁＋臺灣模組零退化」。
