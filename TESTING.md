# T map v1.05.4 測試紀錄

## 自動測試

執行：

```bash
npm test
```

結果：43 / 43 通過。

涵蓋：

- 臺灣原有 mobile-map、puzzle-hints、speech profiles、平面多邊形命中測試。
- 地圖 registry：臺灣與中國為 ready，世界為 planned。
- 中國模組固定 33 個唯一區域，包含香港、澳門，且不在本關重複臺灣。
- `@svg-maps/china` 資料正規化與繁體中文名稱對照。
- 中國 SVG Path2D 面內命中，以及沿用共用拖曳與放大鏡流程。

## Cloudflare Preview 必做實測

1. 首頁中國卡片顯示「可遊玩」，進度為 `省級行政區 0 / 33` 或既有進度。
2. PC：中國 33 塊能選取、拖曳、點選放置，正確提示與吸附正常。
3. 手機／平板：從拼圖圖形拖曳時不帶動整頁；從卡片空白處仍可捲動。
4. 手機放大鏡 ON：正確提示只出現在放大鏡內，準星接觸邏輯與最後吸附一致。
5. 香港、澳門：放大框內可正常亮提示並放置；未完成前不顯示答案名稱。
6. 名稱 OFF 時拼圖片與地圖標籤隱藏；朗讀仍可由國語開關控制。
7. 完成／重新整理後，中國進度保留，且不影響臺灣既有進度。
8. 臺灣模組做一輪回歸：22 縣市、外島、鄉鎮市區與 v1.05.3 黃色提示修正不可退化。

## 建置驗證

`npm run build && npm run verify` 必須檢查：

- 臺灣 22／368 數量正確。
- 中國資料 33 塊且 ID 唯一，香港、澳門存在，沒有把臺灣重複放入本模組。
- `dist/data/china-provinces.json` 已生成。
- `build-info.json` 的 ready maps 為 `taiwan`、`china-provincial`。
- 執行期無外部 CDN JS/JSON 依賴。

### 本次工作環境限制

目前工作環境無法在時限內直接從 npm Registry 完成正式 `npm install`，因此本地 build／verify 使用 22／368 筆合成 TopoJSON 與符合 `@svg-maps/china` 公開介面的 33 筆 SVG 測試替身。正式 `@svg-maps/china@2.0.0` 的 package metadata、33 個 location 名稱、`main: index.js` 與 CC-BY-4.0 授權已另外依套件公開頁面／原始碼確認。Cloudflare Preview 的乾淨 npm 建置仍是正式圖資接入的必要驗收。
