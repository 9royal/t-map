# T map v1.04.4｜更新現有 GitHub + Cloudflare Pages 網站

## 1. 先保留目前成功版本

進入 GitHub 的 `9royal/t-map`，確認目前可運作的 commit。建議建立 tag 或記下 commit ID；如果日後更新失敗，可以回到原版本。不要刪除已成功的 Cloudflare Pages 專案，也不要重新建立另一個學生網址。

## 2. 更新 Repository

建議使用 GitHub Desktop：Clone repository → 在檔案總管開啟專案資料夾 → 將 v1.04.4 update ZIP 內的所有檔案複製到該根目錄並合併／覆蓋同名檔案 → 檢查 Changes → Commit → Push origin。

若使用 GitHub 網頁，應先建立新分支（例如 `v1.04-testing`），依完整資料夾路徑上傳更動檔案，待建置與預覽通過後再合併到 main。根目錄必須直接有 index.html、package.json、css/、js/、scripts/、README.md 等；不可多包一層 T-map-v1.04.4-update。不要上傳 node_modules、dist 或個人金鑰。ZIP 內含完整 scripts 資料夾，避免再次遺漏 build.mjs。

## 3. Cloudflare Pages 保持原有設定

- Production branch: main
- Framework preset: None
- Build command: `npm run build && npm run verify`
- Build output directory: `dist`
- Root directory: 留空

提交到 main 後，原有 Git 整合會自動開始部署。首次不必更改任何 Cloudflare 設定。若失敗，請下載完整 Build log，從第一個 Error 開始排查；不要直接關閉 verify，也不要先刪除目前成功的部署。

## 4. 驗收與回復

繼續使用現有 `v1.04-testing` 預覽部署先測試。除原本 v1.04 的一般碰觸、ON/OFF、吸附、半透明文字、離島、深淺色、進度與音效外，手機至少再驗收：外島未完成前不顯示名稱、三段式底部拼圖抽屜、未放大地圖時可由地圖區直接上下捲頁、平板拼圖片區可垂直捲頁、放大鏡 ON/OFF、放大鏡中央準星判定、＋／－／重設、雙指縮放、放大後單指平移，以及觸控點選不出現藍色 focus 方框。通過後再合併 main。若有問題，可透過 Cloudflare 部署紀錄回復上一個成功部署，或在 GitHub 回復到上一個成功 commit 後重新部署。

## 5. 後續版本

後續功能版再採 v1.05、v1.06 順序升版，並同步更新 README、CHANGELOG、VERSION 與 package.json。不要只改網頁標題。
