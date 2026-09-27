# T map v1.05.5 部署

GitHub / Cloudflare Pages 維持既有設定：

```text
Production branch: main
Build command: npm run build && npm run verify
Build output directory: dist
Root directory: 留空
Node: 22
```

建議開發流程：

1. 在 `v1.05-testing` 套用更新並 Push。
2. 等 Cloudflare 建立 Preview deployment。
3. 先驗收中國最後一塊的完成提示／聲音，再驗收世界第一層 11 塊。
4. 確認手機／平板／PC 與臺灣／中國回歸均正常後，才 PR 合併 `main`。

v1.05.5 新增建置依賴 `@svg-maps/world@2.0.0` 與 `countries-list@3.4.1`，Cloudflare 應透過 `npm install` 取得並在 build 時轉為 `dist/data/world-regions.json`。學生端執行時不直接連 npm。
