# T map v1.05.6 — Equal Earth 世界地圖＋各洲國家拼圖

v1.05.6 延續臺灣與中國省級行政區模組，將世界模組升級為兩層完整流程。

## 本版重點

- 世界第一層改用 **D3 Equal Earth 等積投影**，完整呈現七大洲，包含南極大陸。
- 七大洲＋太平洋、大西洋、印度洋、北極海共 11 塊。
- 四個海洋由原本狹窄矩形定位區改為多個分布在主要海盆的開放水域感應區，並以七大洲陸地幾何作遮罩，避免陸地被判成海洋；這些區域是教學定位用，不代表精確海洋或法律邊界。
- 完成世界第一層後，可進入第二層「依洲挑戰國家」。
- 國家拼圖分為亞洲、歐洲、非洲、北美洲、南美洲、大洋洲；南極洲沒有主權國家，因此顯示說明但不建立國家拼圖。
- 國家層同樣使用 Equal Earth，支援拖曳、點選放置、正確提示、手機放大鏡、縮放／平移、中文／English 朗讀與獨立進度。
- 第一版先略過手機洲別地圖上過小的國家；資料仍保留，後續可加入放大框。

## 世界圖資

建置使用 `world-atlas` 2.0.2 的 `countries-50m.json`。該套件是 Natural Earth 4.1.0 的 TopoJSON 再散布；資料在 build 時轉成本站本地 `data/world-regions.json` 與 `data/world-countries.json`，學生瀏覽器不直接連外部地圖 CDN。

洲別 metadata 使用 `countries-list` 3.4.1。繁體中文國名以 ISO 3166-1 代碼搭配 CLDR zh-Hant 名稱快照產生，並保留少量臺灣常用名稱調整。

Natural Earth / world-atlas 的國界呈現依其資料來源與版本；T map 以地理學習用途呈現，不自行宣告爭議領土的主權判定。

## 建置

```bash
npm install
npm test
npm run build
npm run verify
```

Cloudflare Pages：

- Build command: `npm run build && npm run verify`
- Output directory: `dist`
- Production branch: `main`
