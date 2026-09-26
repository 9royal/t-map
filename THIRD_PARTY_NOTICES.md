# T map 第三方資源說明

本專案在建置階段固定使用下列資源，部署後會將執行期所需檔案複製／轉換到同一網站網域，不由學生瀏覽器向 CDN 載入：

- D3.js 7.9.0 — ISC License — https://d3js.org/
- topojson-client 3.1.0 — ISC License — https://github.com/topojson/topojson-client
- taiwan-atlas 2021.9.20 — MIT License — https://github.com/dkaoster/taiwan-atlas
- @svg-maps/china 2.0.0 — CC BY 4.0 — https://www.npmjs.com/package/@svg-maps/china
  - 該套件標示原始圖源為 MapSVG。
  - T map 僅在建置時讀取 SVG path，轉成同站 `data/china-provinces.json` 使用。

臺灣行政區 TopoJSON 由 taiwan-atlas 依公開行政區界線圖資轉製。正式公開部署時請保留本說明與各模組畫面上的資料來源標示。
