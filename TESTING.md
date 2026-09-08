# T map v1.03 測試紀錄

- JavaScript 語法檢查：通過。
- Node.js 互動邏輯測試：6 項通過，涵蓋 ON/OFF、錯誤碰觸、已完成區、邊界及幾何容許範圍。
- Chromium 實際滑鼠拖曳測試：通過，涵蓋一般碰觸變色、正確輪廓提示、半透明標籤、OFF 不洩漏答案、正確吸附、錯誤返回及拖曳清理。
- 建置流程：以固定數量的測試圖資及本地函式庫替身執行 build / verify，確認檔案複製、版本與數量檢查通過。測試替身不包含在發行包中。
- 本次執行環境無法解析 npm Registry，因此未完成真實套件的 npm install，也未完成使用完整真實圖資的端對端建置。不得將上述替身建置稱為真實圖資驗收。
- 正式發布前，請在 GitHub Actions／Cloudflare Pages 執行 `npm test`、`npm run build`、`npm run verify`，並於預覽網址測試實際地圖、離島、鄉鎮市區及觸控設備。
