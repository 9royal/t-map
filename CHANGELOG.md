# CHANGELOG

## T map v1.02 — 部署穩定版

- 移除學生端對 jsDelivr 的執行期依賴。
- D3.js 7.9.0、topojson-client 3.1.0、taiwan-atlas 2021.9.20 改為 npm 固定版本依賴。
- 建置時自動將 D3、TopoJSON 與 22 縣市／368 鄉鎮市區圖資複製到 `dist/`。
- 新增資料完整性驗證：22 縣市、368 鄉鎮市區不符即停止部署。
- 新增 `npm run verify`，檢查部署檔案與執行期外部 CDN 依賴。
- 新增 Cloudflare Pages `_headers` 快取與安全標頭。
- 新增 GitHub Actions 驗證流程。
- 新增本機 `npm run preview` 靜態伺服器。
- 延續 v1.01：完成慶祝音效、高對比完成區塊、深色／淺色主題。

## T map v1.01

- 完成臺灣與單一縣市任務時播放 Web Audio 慶祝音效。
- 已完成拼圖提高色彩與邊界對比。
- 新增深色／淺色主題切換與偏好保存。
