# T map v1.05.9 部署

本包更新拼圖文字避讓、亞洲排除名單與跨洲國名。先在 `v1.05-testing` 檢查 Preview，再將驗收完成的變更合併至 `main`。

## 更新檔案

1. 在 repository 外解壓 `T-map-v1.05.9-update.zip`。
2. 將 ZIP 內檔案與資料夾內容覆蓋到 `t-map` 根目錄。
3. 確認檔案路徑直接為 `css/style.css`、`js/app.js`、`scripts/world-map.mjs` 等，沒有多一層 ZIP 名稱資料夾。
4. 完整覆蓋更新包，包含 `scripts/`、`tests/`、`js/`、`css/`、`index.html`、`_headers`、版本及套件檔案。
5. Commit 並 Push 到 `v1.05-testing`，等待 Cloudflare Preview 完成。
6. 按 `TESTING.md` 驗收；通過後合併到正式分支 `main` 並 Push，觸發 Production 部署。

完整包 `T-map-v1.05.9.zip` 包含一層 `T-map-v1.05.9/` 專案目錄；使用完整包時，將該目錄內的內容放到 repository 根目錄。

建議 Commit：

```text
Update T map v1.05.9 puzzle labels and Asia exclusions
```

## Cloudflare Pages 設定

- Build command：`npm run build && npm run verify`
- Output directory：`dist`
- Production branch：`main`
- Node.js：22

沒有新增應用程式依賴套件，沿用 package-lock.json 鎖定版本。本次本機在 Node.js v24.19.0 完成驗證，Cloudflare Node.js 22 部署須由 Preview 確認。

## 驗收

1. 頁面版本為 v1.05.9，建置及 verify 成功。
2. 選取／拖曳拼圖時地圖名稱隱藏，放置成功或取消後恢復；名稱 OFF 時仍保持關閉。
3. 手機放大鏡沒有地圖文字，鏡外顯示目前拼圖片名稱。
4. 亞洲不出現英屬印度洋領地、澳門、香港、巴勒斯坦拼圖片，排除說明有完整列名。
5. 俄羅斯等跨洲國家在亞洲／歐洲關卡顯示相應部分後綴，舊版有效進度仍保留。
6. 東帝汶仍只在亞洲，大洋洲維持 7 塊。

本次提供已測試的檔案包，尚未推送 GitHub 或發布 Cloudflare 網站。
