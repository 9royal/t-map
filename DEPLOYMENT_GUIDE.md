# T map v1.05.6 部署

## Cloudflare Pages

- Production branch: `main`
- Build command: `npm run build && npm run verify`
- Build output directory: `dist`
- Node 22 可使用。

## v1.05-testing

先在 `v1.05-testing` Push 並等待 Cloudflare Preview 成功，再以手機、平板與桌機測試。

v1.05.6 新增建置依賴 `world-atlas@2.0.2`；Cloudflare 的 `npm install` 需能取得：

- `world-atlas/countries-50m.json`
- `countries-list@3.4.1`
- 既有 D3、TopoJSON、taiwan-atlas、@svg-maps/china

Build 會產生：

- `dist/data/world-regions.json`：Equal Earth 世界第一層 metadata、洲幾何與海洋感應區設定。
- `dist/data/world-countries.json`：依洲分組的國家幾何、繁中／英文名稱與可玩標記。

學生端所有 JSON 與 JS 都由同一個 Pages 站台提供，不使用執行期 CDN。

## Preview 驗收優先順序

1. 世界主圖形狀是否為 Equal Earth，底部是否完整看到南極大陸。
2. 四海洋在多個主要海盆位置都能觸發正確提示與放置。
3. 完成 11 / 11 後可進入洲別選擇。
4. 六個有國家的洲可進入國家拼圖；南極洲顯示無國家拼圖。
5. 國家層手機拖曳、點選、放大鏡、提示、中文／English 朗讀與進度是否正常。
