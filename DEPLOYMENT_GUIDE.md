# T map v1.05.7 部署

## GitHub / Cloudflare Pages

建議仍在 `v1.05-testing` 先跑 Preview。

Cloudflare Pages：

- Build command: `npm run build && npm run verify`
- Output directory: `dist`
- Production branch: `main`
- Node.js: 22

## 套件

v1.05.7 沒有新增 npm 套件；沿用：

- `d3@7.9.0`
- `topojson-client@3.1.0`
- `taiwan-atlas@2021.9.20`
- `@svg-maps/china@2.0.0`
- `countries-list@3.4.1`
- `world-atlas@2.0.2`

## 更新方式

1. 將更新 ZIP 放在 repository 外解壓。
2. 把 ZIP 內檔案／資料夾內容覆蓋到 `t-map` 根目錄。
3. GitHub Desktop 確認檔案不是包在 `T-map-v1.05.7-update\\...` 子資料夾。
4. Commit 到 `v1.05-testing`。
5. Push origin。
6. 等 Cloudflare Preview 成功後依 `TESTING.md` 驗收。

建議 Commit：

```text
T map v1.05.7 continent projection and country rules
```

## 北極海

本版刻意 **不** 新增北極海獨立放大定位區。若 Preview 出現新的 Arctic inset，代表部署檔案混入其他實驗版本，應停止合併。
