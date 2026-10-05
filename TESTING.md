# T map v1.05.8 修正版測試紀錄（2026-10-05）

## 原錯誤重現

修正前使用 package.json 指定的真實套件執行：

```bash
npm install --ignore-scripts --no-audit --no-fund
npm run build && npm run verify
```

結果：build 成功；verify 在原第 110 行回報 `Error: 東帝汶應保留亞洲關卡。`，結束碼 1。這與使用者提供的 Cloudflare 畫面一致。

已直接讀取 `countries-list 3.4.1`，確認 `countries.TL.continent` 為 `OC`，英文名為 `East Timor`。原單元測試 fixture 卻使用 `AS`，因此沒有覆蓋真實部署條件。

## 修正版結果

執行：

```bash
npm test
npm run build
npm run verify
```

- 自動測試：**64 / 64 通過**，0 失敗、0 跳過。
- Build：完成，結束碼 0。
- Verify：全部通過，結束碼 0。
- 執行環境：Node.js v24.19.0；本次未在 Cloudflare Node.js 22 環境執行。
- 使用真實 `world-atlas 2.0.2`、`countries-list 3.4.1` 與 `topojson-client 3.1.0`，並非僅使用合成 fixture。

## 重點檢查

- 東帝汶（TL）在世界第一層僅歸於亞洲。
- 東帝汶在亞洲國家拼圖具有可用 geometry，且為可玩項目。
- 東帝汶不存在任何亞洲以外的國家關卡，包括大洋洲的排除資料。
- 對上游 metadata 為 OC、AS 或缺少 TL 資料的情況，均維持亞洲分類。
- 大洋洲可玩清單正好為 `AU, NZ, PG, SB, VU, NC, FJ`，共 7 區。
- 澳洲只有一筆；紐西蘭保留 2 個主島 polygon；斐濟限制主要島嶼元件。
- 真實資料的臺灣 22 縣市／368 鄉鎮市區、中國 33 區、世界 7 洲與 4 個海洋感應項目通過既有完整性檢查。
- 保留國名高對比、洲別 Equal Earth 放大、海洋 winding 正規化與原北極海主圖感應方式。
- 世界兩份 JSON 請求加入 `20261005-timor-asia` 修訂參數；圖資回應改為重新驗證快取。

## 推送後實機驗收

Cloudflare Preview 尚未由本次工作推送部署。請在 `v1.05-testing` 推送修正版後確認：

1. `npm run build && npm run verify` 完整成功。
2. 亞洲可找到東帝汶，大洋洲沒有東帝汶，且拼圖片為 7 個。
3. 世界第一層的東帝汶輪廓歸於亞洲。
4. 紐西蘭、斐濟輪廓，以及深淺主題、海洋放置效果，依既有驗收方式檢查。

證據來源：使用者提供之錯誤畫面、本專案原始碼、上述指定版本套件與本次本機執行結果。
