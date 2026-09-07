# T map v1.02｜GitHub + Cloudflare Pages 部署指南

本指南採「GitHub 保存原始碼、Cloudflare Pages 自動建置與發布」的方式。

## A. 建立 GitHub Repository

1. 登入 GitHub，建立新的 repository。
2. Repository name 建議：`t-map`。
3. Description 可填：`T map｜臺灣行政區互動拼圖`。
4. 建議先設為 Public；若設 Private，Cloudflare Pages 亦可連接，但需授權存取。
5. 建立 repository 後，選 `Add file` → `Upload files`。
6. 解壓 `T-map-v1.02.zip`，把 **T-map-v1.02 資料夾內的內容** 拖入上傳區；不要再多包一層 `T-map-v1.02/` 目錄。
7. Commit message 填：`T map v1.02 initial deployment`。
8. Commit 到 `main`。

上傳後 repository 根目錄應直接看見：

```text
index.html
package.json
README.md
css/
js/
scripts/
.github/
```

## B. 接到 Cloudflare Pages

1. 登入 Cloudflare Dashboard。
2. 進入 `Workers & Pages`。
3. 選 `Create application`。
4. 選 Pages / Import an existing Git repository（介面文字可能略有更新）。
5. 連接 GitHub，授權 Cloudflare 存取剛建立的 `t-map` repository。
6. 選擇 `t-map`，開始設定。
7. Production branch：`main`。
8. Framework preset：None / 無框架（若有此選項）。
9. Build command：

```text
npm run build && npm run verify
```

10. Build output directory：

```text
dist
```

11. Root directory：留空。
12. 儲存並 Deploy。

Cloudflare 會先安裝 `package.json` 中固定版本的三個依賴，再執行建置。建置成功後 `dist/` 會包含本地化的：

```text
lib/d3.min.js
lib/topojson-client.min.js
data/counties-10t.json
data/towns-10t.json
```

學生瀏覽器不會再向 jsDelivr 取得這四項資源。

## C. 成功後應看到什麼

Cloudflare Pages 會提供一個類似：

```text
https://t-map.pages.dev
```

的公開網址。實際名稱依 Cloudflare 可用專案名稱而定。

開啟後請依序測試：

1. 首頁能正常顯示。
2. 深色／淺色可切換。
3. 22 縣市拼圖可載入。
4. 點縣市可朗讀名稱（裝置支援時）。
5. 完成任務有慶祝音效。
6. 進入任一縣市後鄉鎮市區數量正確。
7. 重新整理後進度仍存在。

## D. 後續版本更新

日後 T map v1.03、v1.04 只要把修改後檔案 commit / push 到 GitHub 的 `main`，Cloudflare Pages 會自動重新建置並更新正式網站。

建議版本流程：

```text
修改程式 → GitHub commit → Cloudflare 自動 build → verify → 正式網站更新
```

## E. 若 Cloudflare Build 失敗

先看 Build log。v1.02 已刻意讓常見錯誤明確失敗，例如：

- npm 套件沒有安裝成功。
- taiwan-atlas 圖資數量不是 22 / 368。
- 本地化部署檔缺少 D3 / TopoJSON / 圖資。
- `npm run verify` 發現執行期外部 CDN JS/JSON 網址。

不要關掉 verify 來強行部署，應先修正真正的錯誤。
