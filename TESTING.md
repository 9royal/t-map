# T map v1.05.1 測試紀錄

## 1. Node 單元測試

執行：

```bash
npm test
```

結果：**32 / 32 通過**。

涵蓋：

- 地圖登錄表 ID 唯一性與 ready/planned 狀態。
- 臺灣 22／368 層級設定。
- 中國模組專案規劃 33 塊。
- 世界第一層 7 大洲＋4 海洋，共 11 個項目。
- 世界第二層依洲分組與小國 `playable` 政策。
- 共用 map engine 的進度、區域標準化、可玩區域過濾、分組、多語名稱。
- v1.04.x 原有 mobile-map、puzzle-hints、speech profiles 測試。

## 2. 建置／驗證 smoke test

因目前執行環境無法在時限內從 npm Registry 取得正式依賴，本次另外建立**暫時性的本機測試替身**與 22／368 筆合成 TopoJSON，執行：

```bash
node scripts/build.mjs
node scripts/verify.mjs
```

結果通過：

- 部署檔案完整。
- `map-registry.js`、`map-engine.js` 已進入 `dist/js/`。
- 22 縣市／368 鄉鎮市區計數檢查。
- v1.05.1 版本與平台 metadata 一致。
- 無外部 CDN JS/JSON 執行期依賴。

這項 smoke test **不是正式 D3／TopoJSON／taiwan-atlas 實際繪圖驗收**。正式發布前仍須由 Cloudflare Preview 使用真實 npm 套件建置。

## 3. Cloudflare Preview 必做驗收

1. 首頁先出現三張地圖卡，只有臺灣可進入；中國與世界顯示「資料建置中」。
2. 手機、平板、PC 的地圖選擇首頁都沒有水平溢出。
3. 點「臺灣行政區 → 進入地圖」後才載入臺灣資料，並正常進入臺灣模組首頁。
4. 既有 22 縣市與鄉鎮市區功能正常。
5. v1.04.6 的手機／平板拖曳、放大鏡準星接觸／吸附、正確提示分流、縮放與拼圖抽屜不可退化。
6. 既有 localStorage 臺灣進度仍可讀取。
7. 回到「地圖選擇」再進臺灣，不應清除進度。
8. 深淺色主題在平台首頁與臺灣模組都正常。
9. 臺灣國語／台語設定仍可使用；English profile 此版僅供未來世界模組使用，不應出現在臺灣設定中。

## v1.05.1 新增回歸測試

- 正確行政區內部命中且 `nearCorrect=false` 時，正確提示仍必須亮起。
- 提示 OFF 時，內部命中仍可放置但不可洩漏答案。
- 放大鏡準星中心進入正確區域後，接觸判定必須保持 true。
- 準星圓圈邊緣 3.4px 接觸與超出範圍的 miss 必須可區分。
