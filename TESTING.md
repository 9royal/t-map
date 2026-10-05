# T map v1.05.8 測試紀錄

## 自動單元測試

執行：

```bash
npm test
```

目前結果：**63 / 63 通過**。

v1.05.8 新增／更新重點：

- 世界國家 placed label 在深色／淺色主題均使用明確的文字色與 halo。
- 七大洲 metadata 含 `scaleBoost`，非洲／南美洲至少 1.10。
- 大洋洲可玩清單固定為 `AU, NZ, PG, SB, VU, TL, NC, FJ`。
- 大洋洲澳洲資料必須去重，不能出現兩張澳洲拼圖。
- 紐西蘭 geometry 只保留兩個最大 polygon。
- 斐濟限制主要島嶼 component，並使用大洋洲中央經線產生拼圖片預覽。
- 東帝汶同時存在亞洲與大洋洲，但不標記為六個指定的跨洲國家之一。
- 太平洋／大西洋／印度洋 polygon 在渲染前會用 `d3.geoArea()` 檢查 winding；若誤成球面 complement 會反轉 ring。
- 北極海仍維持既有 circles，沒有新增 inset。

## Build / Verify

正式驗證指令：

```bash
npm run build
npm run verify
```

`verify.mjs` 會額外檢查：

- 大洋洲正好 8 個可玩 ISO2。
- 澳洲只出現一次。
- 紐西蘭只保留 2 個 polygon。
- 東帝汶仍存在亞洲。
- 世界國名高對比 CSS 已進入 dist。
- 海洋 ring winding normalization 已接入 app。
- `arcticInset` 仍為 `false`。

### 本環境限制

本工作環境無法在時限內完成 npm Registry 套件下載，因此真正的 `world-atlas` / `countries-list` build 仍需由 Cloudflare `v1.05-testing` Preview 完成。單元測試不替代真實 Preview 圖形驗收。

## Preview 實機驗收

1. 深色與淺色：放上國家後，國名應清楚辨識。
2. 非洲與南美洲：主體比 v1.05.7 更大，但不能被裁掉重要邊界。
3. 大洋洲左側拼圖片應只有 8 個指定項目，澳洲只能出現一次。
4. 紐西蘭拼圖只呈現南北兩大島。
5. 斐濟拼圖不應因 180° 經線被拉成異常輪廓。
6. 放入太平洋後，不能把大西洋、印度洋、北極海一起染成已完成顏色。
7. 北極海維持原本世界主圖操作，不出現獨立放大框。
