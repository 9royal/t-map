# T map v1.05.7 測試紀錄

## 自動單元測試

執行：

```bash
node --test tests/*.test.cjs
```

結果：**56 / 56 通過**。

v1.05.7 新增／更新的重點測試：

- 世界第一層仍為 Equal Earth、7 大洲＋3 大洋＋北極海。
- 太平洋／大西洋／印度洋使用多邊形感應區。
- 北極海仍保留 v1.05.6 的主圖 circle 感應資料，沒有新增獨立 inset。
- 七大洲各自具有 Equal Earth `centerLon` 設定。
- 俄羅斯、土耳其、哈薩克、亞塞拜然、喬治亞同時出現在歐洲與亞洲；埃及同時出現在非洲與亞洲。
- 俄羅斯等明確跨洲國家的兩洲 geometry 不相同，代表洲內切分已生效。
- 歐洲法國範例會移除遠距離海外 component，避免壓縮洲別地圖。
- 暫不出題的國家會輸出完整 `excludedGroups.names`，不再只有數量。
- app.js 使用洲別 `createContinentEqualEarthProjection()`，並先旋轉中央經線再 fit。
- fitExtent 僅以可玩國家 geometry 為主，排除微型 context 對縮放比例的干擾。

## Build / Verify 煙霧測試

以符合正式套件介面的合成 node_modules 執行：

```bash
npm run build
npm run verify
```

結果通過：

- 22 縣市 / 368 鄉鎮市區。
- 中國 33 塊。
- 世界 7 大洲 / 4 海洋項目。
- 世界國家第二層可正常產生。
- 洲別中央經線 metadata、完整排除名單、跨洲國家雙洲資料與 `arcticInset:false` 驗證通過。

### 限制

此環境未使用 npm Registry 下載正式 `world-atlas` / `countries-list` / `@svg-maps/china` 套件，因此 **Cloudflare `v1.05-testing` Preview 的真實 npm build 仍為正式驗收必要步驟**。

## Preview 實機驗收建議

1. 歐洲：主體應明顯放大，不再被遠距離島嶼／海外部分縮到右上角。
2. 亞洲、大洋洲：跨 180° 經線的小部分應留在本洲主體附近，不再分離到另一端造成大片空白。
3. 北美洲：可玩國家主體盡量填滿地圖區。
4. 排除說明：每一洲暫不出題國家都要逐名顯示。
5. 跨洲國家：RU / TR / KZ / AZ / GE / EG 應在指定兩洲皆出現。
6. 歐洲／美洲：遠距離海外領地不得影響主圖 extent。
7. 太平洋、大西洋、印度洋：主要海盆多處可觸發，陸地不可誤判。
8. 北極海：保持原 v1.05.6 世界主圖操作，不應出現新的獨立放大框。
