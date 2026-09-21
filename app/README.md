# 萬春宮前端

## Mission Experience DEMO

`/mission/demo` 會把 LINE Touch、宮廟蓋章、拍照與既有 2x2 Puzzle 串成同一個連續動畫流程。此模式預設啟用，也可明確設定：

```env
VITE_MISSION_DEMO_MODE=true
```

DEMO 流程只使用記憶體內的照片與本地視覺狀態，不呼叫 `completeTask`，因此不會新增正式印章、照片、點數、造訪或宮廟完成紀錄。

第一階段首頁已可在 `/map` 使用：22 縣市互動地圖、縣市放大、右側導覽與底部導覽。選擇縣市後，按需顯示道路與鄉鎮市區分界、道教／佛教宮廟群聚點位；選中宮廟會置中並在點位上方顯示簡介，可進入完整資料頁。其他第一階段頁面目前為占位頁；LINE 與任務流程仍屬後續階段。

完整設計與分工見 [專案指南](../docs/project-guide.md)，安裝及帳號設定見 [requirement.txt](../requirement.txt)。

在此目錄執行：

```powershell
npm ci
if (-not (Test-Path .env.local)) { Copy-Item .env.example .env.local }
npm run dev
```

檢查與建置：`npm run lint`、`npm test`、`npm run build`。
更新本地宮廟資料快照：`npm run data:temples`。匯入來源為 kiang/religion 的 `data/poi/*.json`，各縣市結果及版本見 [匯入清單](public/data/temples/manifest.json)。執行需連線至 GitHub 與 kiang.github.io；日常執行網站只讀取本地快照。僅匯入來源明列「類型＝寺廟」且「教別＝道教／佛教」的有效點位，詳情頁不虛構歷史或影像。
第一階段首頁不需要 LIFF ID。LINE 實機入口待後續階段設定與驗證。
縣市圖資來源與授權見 [public/geo/README.md](public/geo/README.md)。
待補素材見 [素材清單](public/demo/README.md)。
