# T map v1.05.4 — 中國省級行政區模組第一版

T map v1.05.4 是多地圖平台的第二階段：保留已完成的臺灣 22 縣市 → 368 鄉鎮市區，並正式啟用「中國大陸省級行政區＋香港、澳門」拼圖。

## 本版新增

- 中國模組共 33 塊，依本專案範圍收錄中國大陸省級行政區，加上香港、澳門；臺灣維持在獨立模組，不在這一關重複出題。
- 香港、澳門使用獨立放大框，方便手機與平板操作；放大框不代表與主圖的同比例或實際距離。
- 中國模組沿用臺灣版既有互動：拖曳、點選拼圖再點地圖、正確提示、手機放大鏡、縮放／平移、底部拼圖片抽屜、深淺色與完成音效。
- 中國模組朗讀固定使用國語；世界模組日後再提供中文／English。
- 中國模組有獨立 localStorage 進度，不會清除臺灣進度。
- 首頁的中國卡片由「資料建置中」改為「可遊玩」，並顯示完成進度。

## 中國圖資

建置階段使用 `@svg-maps/china` 2.0.0，部署時轉換為同站的 `data/china-provinces.json`，學生瀏覽器不會直接連到 npm 或外部 CDN。

- 套件：@svg-maps/china 2.0.0
- 授權：CC BY 4.0
- 原始圖源：MapSVG
- 專案本身將套件英文名稱轉為繁體中文教學名稱。

本專案的「33 塊」是課程／遊戲模組範圍設定，不用來宣稱任何政治或法定行政區總數；臺灣另有自己的完整模組。

## 目前模組

- 臺灣行政區：可遊玩；22 縣市 → 368 鄉鎮市區。
- 中國大陸省級行政區＋香港、澳門：可遊玩；33 塊。
- 世界地圖：規劃中；預定第一層 7 大洲＋4 海洋，第二層依洲進入國家拼圖。

## 建置

```bash
npm install
npm test
npm run build
npm run verify
```

Cloudflare Pages：

```text
Build command: npm run build && npm run verify
Build output directory: dist
Root directory: 留空
```

## 執行期資料

建置完成後至少會產生：

```text
dist/data/counties-10t.json
dist/data/towns-10t.json
dist/data/china-provinces.json
```

所有 D3、TopoJSON 與地圖 JSON 均由同站提供，不依賴學生端外部 CDN。
