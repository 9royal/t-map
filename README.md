# T map v1.05.5 — 中國完成慶祝＋世界第一層

T map v1.05.5 延續多地圖平台：保留臺灣與中國省級行政區模組，修正中國 33 / 33 完成後沒有明確過關提示／慶祝音效的問題，並正式啟用世界地圖第一層「7 大洲＋3 大洋＋北極海」共 11 塊。

## 本版新增／修正

- 中國模組完成第 33 塊時：在最後一次使用者操作中立即觸發慶祝音效，稍後顯示完成對話框，提供「回地圖選擇／再玩一次」。
- 世界地圖第一層正式可遊玩：亞洲、歐洲、非洲、北美洲、南美洲、大洋洲、南極洲，以及太平洋、大西洋、印度洋、北極海。
- 世界地圖可使用中文／English 朗讀切換；完成進度獨立保存在既有 localStorage。
- 七大洲由世界國家 SVG path 依洲別組合；3 大洋＋北極海採教學定位區，不宣稱為精確海域邊界。
- 世界第二層「依洲進入國家拼圖」仍為下一階段；過小國家先保留 metadata，初版可依手機可玩性排除。
- 保留 v1.05.3 黃色正確提示 CSS 優先權修正，以及臺灣／中國既有手機放大鏡、拖曳與提示邏輯。

## 目前模組

- 臺灣行政區：可遊玩；22 縣市 → 368 鄉鎮市區。
- 中國大陸省級行政區＋香港、澳門：可遊玩；33 塊。
- 世界地圖第一層：可遊玩；7 大洲＋3 大洋＋北極海，共 11 塊。
- 世界地圖第二層：規劃中；依洲進入國家拼圖。

## 世界圖資

建置階段使用 `@svg-maps/world` 2.0.0 的世界國家 SVG path，並使用 `countries-list` 3.4.1 提供國家洲別 metadata。部署時轉換為同站 `data/world-regions.json`，學生瀏覽器不直接連 npm 或外部地圖 CDN。

- `@svg-maps/world` 2.0.0 — CC BY 4.0；套件標示原始圖源為 MapSVG。
- `countries-list` 3.4.1 — MIT。
- 跨洲國家在第一層僅用於組合洲輪廓，依 metadata 的單一洲別分類呈現。
- 海洋目標是教學定位區，不代表精確海洋疆界或法律邊界。

## 建置

```bash
npm install
npm test
npm run build
npm run verify
```

Cloudflare Pages：

```text
Build command: npm run build && npm run verify
Build output directory: dist
Root directory: 留空
```

## 執行期資料

建置完成後至少會產生：

```text
dist/data/counties-10t.json
dist/data/towns-10t.json
dist/data/china-provinces.json
dist/data/world-regions.json
```

所有 D3、TopoJSON 與地圖 JSON 均由同站提供，不依賴學生端外部 CDN。
