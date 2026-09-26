# T map v1.05.3 — 平面幾何命中與外島診斷修正版

T map v1.05.3 針對手機／平板實機上「只有碰到行政區邊線會亮黃、進入行政區內部反而消失」以及澎湖／金門／連江提示失效的問題，改寫命中核心。判定不再依賴 `d3.geoContains()`、`getScreenCTM()` 或 `isPointInFill()` 作為主要依據，而是直接使用畫面上實際繪製後的平面多邊形幾何。

## v1.05.3 命中核心修正

- 每一個縣市／鄉鎮 path 在繪製時，同步保存同一投影下的平面 Polygon / MultiPolygon。
- 指標座標依 SVG `viewBox` 與實際畫面尺寸換算，不再把 iOS / WebKit 的 SVG fill hit-test 當主要判定。
- 正確行政區內部：指標只要在面內就持續成立，不會因離邊界變遠而失去黃色提示。
- 放大鏡小圓圈：中心在面內，或圓圈邊緣真正接觸多邊形邊界時，都使用同一套平面幾何判定。
- 澎湖、金門、連江的 inset SVG 使用各自實際投影後的 MultiPolygon，因此與本島共用相同邏輯。
- 加入隱藏診斷模式：網址加上 `?hitdebug=1` 可顯示「中心是否在正確區域內、正確 SVG、邊界距離、提示結果」，正常網址不顯示任何診斷 UI。


## v1.05 已完成

- 新增「地圖選擇」首頁，三個模組卡：臺灣、中國大陸省級行政區＋香港澳門、世界地圖。
- 臺灣模組標記為 `ready`，完整保留 22 縣市 → 368 鄉鎮市區、手機／平板操作、放大鏡、提示、深淺色與進度。
- 中國模組目前標記為 `planned`：本專案規劃 33 塊，即中國大陸省級行政區加香港、澳門；臺灣維持獨立模組，不在這一關重複出題。
- 世界模組目前標記為 `planned`：第一層 7 大洲＋太平洋、大西洋、印度洋、北極海；第二層依洲進入國家拼圖，小到不利手機操作的國家先以 `playable:false` 排除，日後再用放大框補回。
- 新增 `js/map-registry.js`：集中管理地圖模組、狀態、層級、語音與未來資料範圍。
- 新增 `js/map-engine.js`：提供通用進度、區域 metadata、可玩區域過濾、分組及多語名稱介面。
- 語音 profile 已準備：臺灣使用國語／台語；中國模組預定國語；世界模組預定國語／English。
- 平台首頁先顯示，再由使用者進入臺灣模組；臺灣圖資改成進入模組時才載入，讓未來各地圖可以各自載入資料。

## v1.05 尚未加入的內容

中國與世界卡片目前是「資料建置中」，尚未包含正式拼圖幾何，也不能開始遊玩。這是刻意分階段處理，避免新圖資影響目前已穩定的臺灣版本。

下一階段建議順序：

1. 中國大陸省級行政區＋香港、澳門圖資與名稱資料。
2. 世界第一層：7 大洲＋4 海洋。
3. 世界第二層：各洲國家，先做手機可操作尺寸的國家。
4. 小國放大框與更完整的多語名稱。

## 共用資料介面

未來每個區域可使用類似結構：

```json
{
  "id": "JPN",
  "name": "日本",
  "playable": true,
  "continent": "Asia",
  "speech": {
    "mandarin": "日本",
    "english": "Japan"
  }
}
```

`playable:false` 代表資料保留，但暫時不列入拼圖，不等於刪除該區域。

## 專案結構

```text
T-map-v1.05/
├─ index.html
├─ css/style.css
├─ js/
│  ├─ app.js
│  ├─ map-registry.js
│  ├─ map-engine.js
│  ├─ mobile-map.js
│  ├─ puzzle-hints.js
│  └─ speech-profiles.js
├─ tests/
├─ scripts/
├─ package.json
├─ VERSION
└─ dist/                ← npm run build 後產生
```

## 建置與 Cloudflare Pages

```bash
npm install
npm test
npm run build
npm run verify
```

Cloudflare Pages 維持：

- Production branch：`main`
- Build command：`npm run build && npm run verify`
- Build output directory：`dist`
- Root directory：留空

建議先在 `v1.05-testing` 分支 Preview 驗收，再合併 `main`。

## 現有臺灣資料

臺灣行政區圖資仍由 `taiwan-atlas 2021.9.20` 建置，部署時驗證 22 縣市與 368 鄉鎮市區；v1.05 不改動這套既有圖資來源。

版本：T map v1.05.3

## v1.05.3 臺灣模組修正

- 正確提示不再只依賴行政區邊線距離；準星／指標真正位於正確行政區內部時會持續亮黃。
- 澎湖、金門、連江 inset 使用與本島相同的命中與提示規則。
- 放大鏡開啟時，黃色提示與最後吸附共用可見準星小圓圈接觸規則。

### v1.05.3 行政區命中修正

手機／平板拖曳不再只依賴瀏覽器 SVG hit-test。目標 SVG 會保存對應的 D3 投影；拖曳點會反算為經緯度，再以 GeoJSON 區域包含判定確認是否真正位於行政區內。這套規則同時套用臺灣本島、澎湖、金門、連江與放大鏡準星。

