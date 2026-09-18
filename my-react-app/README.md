# 萬春宮文化探索前端

目前為程式骨架，LINE、照片處理與任務提交尚待實作。

## 環境與依賴

使用 Node.js 與 npm；所有指令在此目錄執行。
現有 package.json 包含 React、React DOM、Vite 與 ESLint 工具。
已安裝：react-router 8（頁面路由）、@line/liff（LINE SDK）。
依賴已安裝，Node.js 24.x / npm 11.x；完整需求與其他組員安裝步驟見 ../requirement.txt。

## 開發指令

- npm run dev：本機開發
- npm run build：建置至 dist
- npm run lint：靜態檢查
- npm run preview：預覽建置結果

## 設定與素材

將 .env.example 複製為 .env.local，再填入 VITE_LIFF_ID。
VITE_* 是公開資訊，不可存放私密憑證。
public/demo/README.md 列出待補素材；map.svg 是占位圖。

詳細規格請參考 ../docs/demo-file-spec.md。
