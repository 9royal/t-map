# T map v1.05.7 — 洲別 Equal Earth 放大與跨洲國家修正版

v1.05.7 延續臺灣、中國省級行政區與世界兩層拼圖，重點修正各洲國家拼圖的縮放、跨 180° 經線、海外領地、排除名單與跨洲國家呈現。

## 本版重點

- 世界第一層仍使用 **D3 Equal Earth 等積投影**，七大洲與南極大陸維持不變。
- 太平洋、大西洋、印度洋改為較貼近主要海盆的多邊形教學感應區，並沿用陸地遮罩避免陸地誤判。
- **北極海本版先不修改**：維持 v1.05.6 世界主圖上的原感應方式，不新增獨立放大定位框。
- 各洲國家拼圖仍使用 Equal Earth，但每一洲有自己的中央經線與 fit 範圍，盡量放大本洲主要國家區域。
- 亞洲與大洋洲會先旋轉投影中央經線再 fit，避免 180° 經線讓一小部分地圖跳到另一側、造成大片空白。
- 歐洲與美洲在洲別國家拼圖中，以本洲主要領土為主；遠離本洲、會壓縮主圖的海外／遠距離領土部分暫不顯示。
- 暫不列入拼圖的國家不再只顯示數量，而會依原因 **逐名列出**。
- 俄羅斯、土耳其、哈薩克、亞塞拜然、喬治亞、埃及會在相鄰兩洲的國家拼圖中都出現。
- 俄羅斯、土耳其、哈薩克、埃及依教學用洲界切分顯示洲內部分；喬治亞、亞塞拜然因高加索洲界存在不同慣例，在歐洲與亞洲皆保留完整國形。

## 洲別 Equal Earth 中央經線

| 洲 | 中央經線 |
|---|---:|
| 亞洲 | 100°E |
| 歐洲 | 15°E |
| 非洲 | 20°E |
| 北美洲 | 100°W |
| 南美洲 | 60°W |
| 大洋洲 | 155°E |
| 南極洲 | 0° |

中央經線只用於讓洲別地圖更集中；投影仍然是 Equal Earth 等積投影。

## 暫不出題與版面說明

`data/world-countries.json` 會為每一洲產生：

- `excludedGroups`：依「太小／特殊或爭議圖資／沒有可用輪廓」分類，完整列出國名。
- `displayTrimmedCountries`：本洲國家拼圖為了放大主體，暫不顯示遠距離海外／附屬部分的國家名稱。
- `transcontinentalCountries`：本洲會重複出現的跨洲國家完整名單。

若某個微型國家在 Natural Earth 解析度下完全沒有獨立輪廓，build 仍會根據 ISO／洲別 metadata 把它加入排除名單，不會無聲消失。

## 世界圖資

- 世界國家輪廓：`world-atlas` 2.0.2 / Natural Earth 4.1.0。
- 洲別 metadata：`countries-list` 3.4.1。
- 國名：ISO 3166-1 + T map 繁體中文名稱快照。

Natural Earth / world-atlas 的國界呈現依其資料來源與版本；T map 為地理學習用途，不自行宣告爭議領土主權。

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
