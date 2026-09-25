# T map v1.05.2 — 多地圖平台臺灣互動修正版

T map v1.05.2 延續 v1.05 多地圖平台，並把 v1.04.6 已驗證的放大鏡準星接觸邏輯重新整合。原本以臺灣為核心的單一地圖程式，改造成可持續擴充的多地圖平台。這一版的重點不是一次塞入所有新圖資，而是先建立共用首頁、地圖登錄表、共用拼圖資料介面與語音模式設定，並確認既有臺灣模組仍可完整使用。

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

版本：T map v1.05

## v1.05.2 臺灣模組修正

- 正確提示不再只依賴行政區邊線距離；準星／指標真正位於正確行政區內部時會持續亮黃。
- 澎湖、金門、連江 inset 使用與本島相同的命中與提示規則。
- 放大鏡開啟時，黃色提示與最後吸附共用可見準星小圓圈接觸規則。

### v1.05.2 行政區命中修正

手機／平板拖曳不再只依賴瀏覽器 SVG hit-test。目標 SVG 會保存對應的 D3 投影；拖曳點會反算為經緯度，再以 GeoJSON 區域包含判定確認是否真正位於行政區內。這套規則同時套用臺灣本島、澎湖、金門、連江與放大鏡準星。

