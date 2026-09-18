# 萬春宮前端

目前為 React + Vite + JavaScript 程式骨架。

完整設計與分工見 [專案指南](../docs/project-guide.md)，安裝及帳號設定見 [requirement.txt](../requirement.txt)。

在此目錄執行：

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

檢查與建置：npm run lint、npm run build。
LINE LIFF ID 需另填入 .env.local；LINE 功能仍待實作。
待補素材見 [素材清單](public/demo/README.md)。
